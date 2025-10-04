import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration - Replace these with your actual Firebase config from Step 3
const firebaseConfig = {
  apiKey: "AIzaSyAPfrVDwwHGrXzaSKekC1q0hrQNzLcTYy4",
  authDomain: "hoyohq-f2dc9.firebaseapp.com",
  projectId: "hoyohq-f2dc9",
  storageBucket: "hoyohq-f2dc9.firebasestorage.app",
  messagingSenderId: "112702218929",
  appId: "1:112702218929:web:1fb62431f318aa16ac3890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
