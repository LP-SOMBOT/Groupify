import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Group, CreateGroupData } from './types';

const GROUPS_COLLECTION = 'groups';

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