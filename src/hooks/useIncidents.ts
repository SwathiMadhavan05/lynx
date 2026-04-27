import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config';
import type { Incident } from '../types/schema';

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: Firestore requires a composite index if we use `where` with `in` AND `orderBy`.
    const q = query(
      collection(db, 'incidents'),
      where('status', 'in', ['active', 'acknowledged']),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveIncidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      
      setIncidents(liveIncidents);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching live incidents: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { incidents, loading };
}
