import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config';
import type { Incident } from '../types/schema';
import { demoCameras } from '../data/demoCameras';

export function useGlobalMetrics() {
  const [activeHighAlerts, setActiveHighAlerts] = useState(0);
  const [staffResponding, setStaffResponding] = useState(0);
  const [resolvedToday, setResolvedToday] = useState(0);
  const [camerasOnline, setCamerasOnline] = useState(48); // Fallback metric initialized
  const [totalCameras, setTotalCameras] = useState(50);

  useEffect(() => {
    // Global Incidents Subscription
    const incUnsub = onSnapshot(collection(db, 'incidents'), (snapshot) => {
      let highAlerts = 0;
      let responding = 0;
      let resolved = 0;

      // Midnight boundary for local timezone
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      snapshot.forEach(doc => {
        const data = doc.data() as Incident;
        
        if (data.type === 'dual_match' && data.status === 'active') {
          highAlerts++;
        }
        
        if (data.status === 'acknowledged') {
          responding++;
        }

        if (data.status === 'resolved' && data.timestamp) {
          // Firebase Timestamps have .toMillis()
          const ms = data.timestamp.toMillis ? data.timestamp.toMillis() : new Date(data.timestamp).getTime();
          if (ms >= startOfToday.getTime()) {
            resolved++;
          }
        }
      });

      setActiveHighAlerts(highAlerts);
      setStaffResponding(responding);
      setResolvedToday(resolved);
    });

    // Global Cameras Subscription
    const camUnsub = onSnapshot(collection(db, 'cameras'), (snapshot) => {
      if (snapshot.empty) {
        setTotalCameras(demoCameras.length);
        setCamerasOnline(demoCameras.filter((camera) => camera.status === 'online').length);
        return;
      }

      setTotalCameras(snapshot.size);
      const onlineCount = snapshot.docs.filter(d => d.data().status === 'online').length;
      setCamerasOnline(onlineCount);
    }, (error) => {
      console.error('Error fetching camera metrics:', error);
      setTotalCameras(demoCameras.length);
      setCamerasOnline(demoCameras.filter((camera) => camera.status === 'online').length);
    });

    return () => {
      incUnsub();
      camUnsub();
    };
  }, []);

  return {
    activeHighAlerts,
    staffResponding,
    resolvedToday,
    camerasOnline,
    totalCameras
  };
}
