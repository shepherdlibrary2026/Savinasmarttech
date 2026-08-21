import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with configured database ID
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    return { success: false, error: error.message };
  }
};

// Sign out
export const logOutFirebase = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Sign Out Error:', error);
    return { success: false, error: error.message };
  }
};

// Firestore helper: Save or sync user profile
export const saveUserToFirestore = async (userData: {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string;
  phoneNumber?: string;
  avatarUrl?: string;
}) => {
  try {
    const userRef = doc(db, 'users', userData.id);
    await setDoc(
      userRef,
      {
        ...userData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Firestore user save notice:', err);
    return false;
  }
};

// Firestore helper: Save AI generation record
export const saveAIGenerationRecord = async (data: {
  type: string;
  userId: string;
  prompt: string;
  output?: string;
  mediaUrl?: string;
  metadata?: any;
}) => {
  try {
    const coll = collection(db, 'ai_generations');
    await addDoc(coll, {
      ...data,
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore AI log notice:', err);
    return false;
  }
};

export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
};
