import { 
  ref, 
  push, 
  set, 
  get, 
  update, 
  remove, 
  query, 
  orderByChild, 
  equalTo,
  increment,
  serverTimestamp
} from 'firebase/database';
import { db } from './firebase';
import { Group, CreateGroupData, WithdrawalRequest, PaymentMethod, UserProfile } from './types';

// --- Users ---

export const createUserProfile = async (uid: string, email: string, name: string) => {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) {
    await set(userRef, {
      uid,
      email,
      displayName: name,
      photoURL: `https://ui-avatars.com/api/?name=${name}&background=6C63FF&color=fff`,
      joinedAt: Date.now(),
      balance: 0,
      isBanned: false,
      isCreator: false,
      isBetaTester: false,
      monetizationFrozen: false
    });
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  await update(ref(db, `users/${uid}`), data);
};

export const adminUpdateUser = async (uid: string, updates: Partial<UserProfile>) => {
  await update(ref(db, `users/${uid}`), updates);
};

export const adminAdjustBalance = async (uid: string, amount: number) => {
  await update(ref(db, `users/${uid}`), { balance: increment(amount) });
};

// --- Groups ---

export const createGroup = async (data: CreateGroupData, userId: string): Promise<string> => {
  const groupsRef = ref(db, 'groups');
  const newGroupRef = push(groupsRef);
  
  const groupData = {
    ...data,
    createdBy: userId,
    createdAt: Date.now(),
    isVerified: false,
    isGuidelineViolation: false,
    status: 'pending', // Pending by default
    views: 0,
    clicks: 0
  };

  await set(newGroupRef, groupData);
  return newGroupRef.key as string;
};

export const updateGroupStatus = async (groupId: string, status: 'approved' | 'rejected' | 'pending', ownerId: string, groupName: string) => {
  const groupRef = ref(db, `groups/${groupId}`);
  await update(groupRef, { status });

  if (status !== 'pending') {
    await createSystemNotification(
      ownerId,
      `Group ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      `Your group "${groupName}" has been ${status}.`,
      status === 'approved' ? 'update' : 'alert'
    );
  }
};

export const updateGroup = async (groupId: string, data: Partial<Group>) => {
  await update(ref(db, `groups/${groupId}`), data);
};

export const deleteGroup = async (groupId: string) => {
  const groupRef = ref(db, `groups/${groupId}`);
  await remove(groupRef);
};

// --- Unique Tracking Logic ---

const getTrackingId = (currentUserId?: string) => {
  if (currentUserId) return currentUserId;
  let anonId = localStorage.getItem('anon_device_id');
  if (!anonId) {
    anonId = 'anon_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('anon_device_id', anonId);
  }
  return anonId;
};

export const trackGroupClick = async (groupId: string, ownerId: string, currentUserId?: string) => {
  // Don't count owner clicks
  if (currentUserId && currentUserId === ownerId) return;

  const trackerId = getTrackingId(currentUserId);
  const trackRef = ref(db, `tracking/clicks/${groupId}/${trackerId}`);
  
  const snapshot = await get(trackRef);
  if (!snapshot.exists()) {
    await set(trackRef, true); // Mark as clicked
    const updates: any = {};
    updates[`groups/${groupId}/clicks`] = increment(1);
    await update(ref(db), updates);
  }
};

export const trackGroupView = async (groupId: string, ownerId: string, currentUserId?: string) => {
  // Don't count owner views
  if (currentUserId && currentUserId === ownerId) return;

  const trackerId = getTrackingId(currentUserId);
  const trackRef = ref(db, `tracking/views/${groupId}/${trackerId}`);
  
  const snapshot = await get(trackRef);
  if (!snapshot.exists()) {
    await set(trackRef, true); // Mark as viewed
    const updates: any = {};
    updates[`groups/${groupId}/views`] = increment(1);
    await update(ref(db), updates);
  }
};

// --- Notifications ---

export const createBroadcastNotification = async (title: string, message: string, type: 'system' | 'update' | 'alert') => {
  const notifRef = push(ref(db, 'notifications/broadcasts'));
  await set(notifRef, {
    title,
    message,
    type,
    timestamp: Date.now(),
    isBroadcast: true
  });
};

export const createSystemNotification = async (userId: string, title: string, message: string, type: 'system' | 'update' | 'alert') => {
  const notifRef = push(ref(db, `notifications/users/${userId}`));
  await set(notifRef, {
    title,
    message,
    type,
    timestamp: Date.now(),
    isBroadcast: false,
    read: false
  });
};

export const markNotificationRead = async (userId: string, notifId: string) => {
  await update(ref(db, `notifications/users/${userId}/${notifId}`), { read: true });
};

export const markAllNotificationsRead = async (userId: string, notifications: any[]) => {
  const updates: any = {};
  notifications.forEach(n => {
    if (!n.isBroadcast && !n.read) {
       updates[`notifications/users/${userId}/${n.id}/read`] = true;
    }
  });
  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }
};

// --- Withdrawals ---

export const requestWithdrawal = async (userId: string, userName: string, amount: number, method: PaymentMethod, accountNumber: string) => {
  await update(ref(db, `users/${userId}`), { balance: increment(-amount) });
  
  const withdrawRef = push(ref(db, 'withdrawals'));
  await set(withdrawRef, {
    userId,
    userName,
    amount,
    method,
    accountNumber,
    status: 'pending',
    timestamp: Date.now()
  });
};

export const processWithdrawal = async (withdrawalId: string, status: 'paid' | 'rejected', userId: string, amount: number) => {
  await update(ref(db, `withdrawals/${withdrawalId}`), { status });
  
  if (status === 'rejected') {
    await update(ref(db, `users/${userId}`), { balance: increment(amount) });
    await createSystemNotification(userId, "Withdrawal Rejected", "Your withdrawal request was rejected and funds returned.", "alert");
  } else {
    await createSystemNotification(userId, "Payment Sent", "Your withdrawal has been processed successfully.", "update");
  }
};
