import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.config';
import type { Camera } from '../types/schema';
import { demoCameras } from '../data/demoCameras';

export function useCameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'cameras'), orderBy('floor', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setCameras(demoCameras);
          setUsingFallback(true);
          setLoading(false);
          return;
        }

        const nextCameras = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Camera[];

        setCameras(nextCameras);
        setUsingFallback(false);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching cameras:', error);
        setCameras(demoCameras);
        setUsingFallback(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { cameras, loading, usingFallback };
}
