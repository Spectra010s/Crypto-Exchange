// Firebase configuration - you'll replace these with your actual Firebase config
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBNRbqvvbEU351VBkrtH7768XJQ5MRSqzE",
  authDomain: "crypto-exchange-36819.firebaseapp.com",
  projectId: "crypto-exchange-36819",
  storageBucket: "crypto-exchange-36819.firebasestorage.app",
  messagingSenderId: "55431442629",
  appId: "1:55431442629:web:82c6d60eac3fa95d7a80ac",
  measurementId: "G-EX10N37Q2C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
