import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, db } from '../lib/firebase';
import { createUserProfile } from '../lib/db';
import { UserProfile } from '../lib/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to live profile changes (balance, ban status)
  useEffect(() => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      const unsub = onValue(userRef, (snap) => {
        if (snap.exists()) {
          const val = snap.val();
          setProfile(val);
          // Auto logout if banned - logic can be handled by UI listeners for better UX, 
          // but strictly enforcing here ensures security.
          if (val.isBanned) {
            firebaseSignOut(auth);
          }
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: name,
      photoURL: `https://ui-avatars.com/api/?name=${name}&background=6C63FF&color=fff`
    });
    // Create RTDB entry
    await createUserProfile(userCredential.user.uid, email, name);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error("Logout Error", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}