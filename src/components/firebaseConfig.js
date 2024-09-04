// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore'; // Import Firestore methods
import { getStorage } from 'firebase/storage';  // Import Firebase Storage
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyBpUCSPGf6ACoUWuqs9mgdkcht5L_kBQGA",
    authDomain: "khushi-b6049.firebaseapp.com",
    projectId: "khushi-b6049",
    storageBucket: "khushi-b6049.appspot.com",
    messagingSenderId: "529051306762",
    appId: "1:529051306762:web:2449be2a8f9233bf64c8f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, collection, addDoc, getDocs }; // Export Firestore methods
export const storage = getStorage(app);  // Initialize Firebase Storage
export { auth, provider, signInWithPopup };
export const messaging = getMessaging(app);
