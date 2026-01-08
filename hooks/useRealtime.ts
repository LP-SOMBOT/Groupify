import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { db } from '../lib/firebase';
import { Group, AppNotification } from '../lib/types';
import { useAuth } from '../context/AuthContext';

const CACHE_KEY_GROUPS = 'connectsphere_groups_cache';
const CACHE_KEY_NOTIFS = 'connectsphere_notifs_cache';

export function useRealtimeGroups(category?: string, userId?: string) {
  const [groups, setGroups] = useState<Group[]>(() => {
    // Load from local storage initially for instant render
    const cached = localStorage.getItem(CACHE_KEY_GROUPS);
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(!groups.length);

  useEffect(() => {
    const groupsRef = ref(db, 'groups');
    // We fetch all and filter client side for flexibility with RTDB
    const q = query(groupsRef, orderByChild('createdAt'));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupList: Group[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse(); // Newest first

        // Update Cache
        localStorage.setItem(CACHE_KEY_GROUPS, JSON.stringify(groupList));
        
        // Filter
        let filtered = groupList;
        if (userId) {
          filtered = groupList.filter(g => g.createdBy === userId);
        } else if (category && category !== 'All') {
          filtered = groupList.filter(g => g.category === category);
        }

        setGroups(filtered);
      } else {
        setGroups([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("RTDB Error:", error);
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
    const groupsRef = ref(db, 'groups');
    
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.createdAt - a.createdAt);
        setGroups(groupList);
      } else {
        setGroups([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { groups, loading };
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY_NOTIFS);
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listener 1: Broadcasts
    const broadcastRef = ref(db, 'notifications/broadcasts');
    // Listener 2: User specific
    const userNotifRef = ref(db, `notifications/users/${user.uid}`);

    const handleData = (broadcastSnap: any, userSnap: any) => {
      let merged: AppNotification[] = [];

      if (broadcastSnap.exists()) {
        const bData = broadcastSnap.val();
        Object.keys(bData).forEach(key => merged.push({ id: key, ...bData[key] }));
      }

      if (userSnap.exists()) {
        const uData = userSnap.val();
        Object.keys(uData).forEach(key => merged.push({ id: key, ...uData[key] }));
      }

      // Sort by newest
      merged.sort((a, b) => b.timestamp - a.timestamp);
      
      localStorage.setItem(CACHE_KEY_NOTIFS, JSON.stringify(merged));
      setNotifications(merged);
      setLoading(false);
    };

    // We need to coordinate two listeners. 
    // For simplicity in this React effect, we'll nest them or use independent state updates.
    // Using independent state updates might cause flickering, so let's use a combined approach logic
    // actually, independent onValue is fine, React batches well enough or we filter in render.
    
    let broadcasts: any[] = [];
    let userNotifs: any[] = [];

    const unsubBroadcast = onValue(broadcastRef, (snap) => {
        broadcasts = [];
        if (snap.exists()) {
             const val = snap.val();
             Object.keys(val).forEach(k => broadcasts.push({id: k, ...val[k]}));
        }
        updateState();
    });

    const unsubUser = onValue(userNotifRef, (snap) => {
        userNotifs = [];
        if (snap.exists()) {
            const val = snap.val();
            Object.keys(val).forEach(k => userNotifs.push({id: k, ...val[k]}));
        }
        updateState();
    });

    const updateState = () => {
        const combined = [...broadcasts, ...userNotifs].sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(combined);
        setLoading(false);
    };

    return () => {
      unsubBroadcast();
      unsubUser();
    };
  }, [user]);

  return { notifications, loading };
}