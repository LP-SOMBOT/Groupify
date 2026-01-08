import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBrUiZ7G7hc7FZcJtk_LEZ9OREMhLvHowY",
  authDomain: "whatsapp-groups-1df5e.firebaseapp.com",
  databaseURL: "https://whatsapp-groups-1df5e-default-rtdb.firebaseio.com",
  projectId: "whatsapp-groups-1df5e",
  storageBucket: "whatsapp-groups-1df5e.firebasestorage.app",
  messagingSenderId: "1084270638482",
  appId: "1:1084270638482:web:a1999cfa4229e5a3177d4b"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };