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
import { Group, CreateGroupData } from './types';

// --- Groups ---

export const createGroup = async (data: CreateGroupData, userId: string): Promise<string> => {
  const groupsRef = ref(db, 'groups');
  const newGroupRef = push(groupsRef);
  
  const groupData = {
    ...data,
    createdBy: userId,
    createdAt: Date.now(),
    isVerified: false,
    memberCount: Math.floor(Math.random() * 100) + 1,
    iconUrl: `https://ui-avatars.com/api/?name=${data.name}&background=random&color=fff&size=200`,
    views: 0,
    clicks: 0
  };

  await set(newGroupRef, groupData);
  return newGroupRef.key as string;
};

export const updateGroupVerification = async (groupId: string, status: boolean, groupName: string, ownerId: string) => {
  const groupRef = ref(db, `groups/${groupId}`);
  await update(groupRef, { isVerified: status });

  if (status) {
    // Send System Notification to Owner
    await createSystemNotification(
      ownerId,
      "Group Verified",
      `Your group "${groupName}" has been approved and is now verified!`,
      "update"
    );
  }
};

export const deleteGroup = async (groupId: string) => {
  const groupRef = ref(db, `groups/${groupId}`);
  await remove(groupRef);
};

export const trackGroupClick = async (groupId: string) => {
  const updates: any = {};
  updates[`groups/${groupId}/clicks`] = increment(1);
  await update(ref(db), updates);
};

export const trackGroupView = async (groupId: string) => {
  const updates: any = {};
  updates[`groups/${groupId}/views`] = increment(1);
  await update(ref(db), updates);
};

// --- Notifications ---

// For Admin Broadcasts
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

// For System Alerts (Specific User)
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
