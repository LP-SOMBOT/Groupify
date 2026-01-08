import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Group, CreateGroupData, AppNotification } from './types';

const GROUPS_COLLECTION = 'groups';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const fetchGroups = async (category?: string): Promise<Group[]> => {
  try {
    let q;
    const groupsRef = collection(db, GROUPS_COLLECTION);

    if (category && category !== 'All') {
      q = query(
        groupsRef, 
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else {
      q = query(
        groupsRef, 
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now()
      } as Group;
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

export const fetchUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    const q = query(
      collection(db, GROUPS_COLLECTION),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now()
    } as Group));
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return [];
  }
};

export const createGroup = async (data: CreateGroupData, userId: string): Promise<string> => {
  const docRef = await addDoc(collection(db, GROUPS_COLLECTION), {
    ...data,
    createdBy: userId,
    createdAt: serverTimestamp(),
    isVerified: false,
    memberCount: Math.floor(Math.random() * 100) + 1, // Mock member count start
    iconUrl: `https://ui-avatars.com/api/?name=${data.name}&background=random&color=fff&size=200`
  });
  return docRef.id;
};

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION), 
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now()
    } as AppNotification));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const createNotification = async (title: string, message: string, type: 'system' | 'update' | 'alert') => {
  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    title,
    message,
    type,
    createdAt: serverTimestamp()
  });
};

// --- Admin Functions ---

export const getAllGroupsForAdmin = async (): Promise<Group[]> => {
  try {
    // Fetch all groups without limit, ordered by newest
    const q = query(collection(db, GROUPS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(), 
      createdAt: doc.data().createdAt?.toMillis() || Date.now() 
    } as Group));
  } catch (error) {
    console.error("Admin fetch error:", error);
    return [];
  }
};

export const updateGroupVerification = async (groupId: string, status: boolean) => {
  const groupRef = doc(db, GROUPS_COLLECTION, groupId);
  await updateDoc(groupRef, { isVerified: status });
};

export const deleteGroup = async (groupId: string) => {
  const groupRef = doc(db, GROUPS_COLLECTION, groupId);
  await deleteDoc(groupRef);
};