import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.config';
import type { Staff } from '../types/schema';
import { demoStaff } from '../data/demoStaff';

export function useStaffDirectory() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'staff'), orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setStaff(demoStaff);
          setUsingFallback(true);
          setLoading(false);
          return;
        }

        const nextStaff = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Staff[];

        setStaff(nextStaff);
        setUsingFallback(false);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching staff directory:', error);
        setStaff(demoStaff);
        setUsingFallback(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { staff, loading, usingFallback };
}
