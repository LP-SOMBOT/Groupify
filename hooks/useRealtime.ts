import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Group, AppNotification } from '../lib/types';

export function useRealtimeGroups(category?: string, userId?: string) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const groupsRef = collection(db, 'groups');
    let constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

    if (userId) {
      constraints.push(where('createdBy', '==', userId));
    } else if (category && category !== 'All') {
      constraints.push(where('category', '==', category));
      constraints.push(limit(50));
    } else {
      constraints.push(limit(50));
    }

    const q = query(groupsRef, ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now()
      } as Group));
      setGroups(data);
      setLoading(false);
    }, (error) => {
      console.error("Realtime groups error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [category, userId]);

  return { groups, loading };
}

export function useAdminRealtimeGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now()
      } as Group));
      setGroups(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { groups, loading };
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc'), 
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now()
      } as AppNotification));
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { notifications, loading };
}