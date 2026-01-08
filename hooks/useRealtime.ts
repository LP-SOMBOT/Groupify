import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { db } from '../lib/firebase';
import { Group, AppNotification, UserProfile, WithdrawalRequest } from '../lib/types';
import { useAuth } from '../context/AuthContext';

export function useRealtimeGroups(category?: string, userId?: string, onlyApproved: boolean = true) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth(); // Needed to check if user is beta tester or admin? No, admin hook is separate.

  useEffect(() => {
    const groupsRef = ref(db, 'groups');
    const q = query(groupsRef, orderByChild('createdAt'));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let groupList: Group[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse();

        // 1. Violation Filter: Only owner can see violated groups
        groupList = groupList.filter(g => {
            if (!g.isGuidelineViolation) return true;
            return userId && g.createdBy === userId; // Only show if user owns it
        });

        // 2. Status Filter
        if (onlyApproved) {
            if (!userId) {
                // Public/Explore view: Only approved
                groupList = groupList.filter(g => g.status === 'approved');
            }
            // If userId is provided (My Groups), show all statuses (pending/rejected/approved)
        }

        // 3. Category/Creator Filter
        if (userId) {
          groupList = groupList.filter(g => g.createdBy === userId);
        } else if (category && category !== 'All') {
          groupList = groupList.filter(g => g.category === category);
        }

        setGroups(groupList);
      } else {
        setGroups([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("RTDB Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [category, userId, onlyApproved]);

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
        // Admin sees EVERYTHING
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const broadcastRef = ref(db, 'notifications/broadcasts');
    const userNotifRef = ref(db, `notifications/users/${user.uid}`);

    let broadcasts: AppNotification[] = [];
    let userNotifs: AppNotification[] = [];

    const updateState = () => {
      const combined = [...broadcasts, ...userNotifs].sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(combined);
      setUnreadCount(userNotifs.filter(n => !n.read).length); 
      setLoading(false);
    };

    const unsubBroadcast = onValue(broadcastRef, (snap) => {
        broadcasts = [];
        if (snap.exists()) {
             const val = snap.val();
             Object.keys(val).forEach(k => broadcasts.push({id: k, ...val[k], read: true})); 
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

    return () => {
      unsubBroadcast();
      unsubUser();
    };
  }, [user]);

  return { notifications, unreadCount, loading };
}

export function useRealtimeUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsub = onValue(usersRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setUsers(Object.values(val));
      } else {
        setUsers([]);
      }
    });
    return () => unsub();
  }, []);
  
  return { users };
}

export function useRealtimeWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  
  useEffect(() => {
    const refPath = ref(db, 'withdrawals');
    const unsub = onValue(refPath, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const list = Object.keys(val).map(k => ({id: k, ...val[k]}));
        setWithdrawals(list.sort((a,b) => b.timestamp - a.timestamp));
      } else {
        setWithdrawals([]);
      }
    });
    return () => unsub();
  }, []);

  return { withdrawals };
}