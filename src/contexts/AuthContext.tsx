import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { auth, db, messagingPromise } from '../firebase.config';
import type { Staff } from '../types/schema';

// IMPORTANT: Add your VAPID key from Firebase Console > Project Settings > Cloud Messaging
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

interface AuthContextType {
  user: User | null;
  staffProfile: Staff | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Requests browser notification permission and saves the FCM token
 * to the staff's Firestore document under `fcmToken`.
 */
async function registerFCMToken(staffDocId: string) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission denied.');
      return;
    }

    const messaging = await messagingPromise;
    if (!messaging) {
      console.warn('[FCM] Messaging not supported in this browser.');
      return;
    }

    // Register service worker explicitly so FCM can find it
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      // Persist the FCM token to the staff document in Firestore
      await updateDoc(doc(db, 'staff', staffDocId), { fcmToken: token });
      console.log('[FCM] Token registered and saved:', token);
    }
  } catch (error) {
    console.error('[FCM] Token registration failed:', error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [staffProfile, setStaffProfile] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser && currentUser.email) {
        try {
          const q = query(
            collection(db, 'staff'),
            where('email', '==', currentUser.email)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const staffDoc = querySnapshot.docs[0];
            const data = staffDoc.data() as Staff;
            const profile = { ...data, id: staffDoc.id };
            setStaffProfile(profile);

            // Register FCM token on login — only if permission not already granted
            // to avoid prompting on every page refresh
            if (Notification.permission !== 'granted') {
              registerFCMToken(staffDoc.id);
            } else {
              // Re-register quietly to refresh token if it has rotated
              registerFCMToken(staffDoc.id);
            }
          } else {
            // Fallback for test credentials without a staff document
            const fallbackProfile = {
              id: currentUser.uid,
              name: currentUser.email.split('@')[0],
              role: 'Administrator',
              floor: 'All',
              isOnDuty: true
            };
            setStaffProfile(fallbackProfile);
          }
        } catch (error) {
          console.error('Error fetching staff profile:', error);
        }
      } else {
        setStaffProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { user, staffProfile, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
