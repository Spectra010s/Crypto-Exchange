// Firebase configuration - you'll replace these with your actual Firebase config
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  // TODO: Replace with your actual Firebase config from Firebase Console
  // Go to Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
}

// Validate that Firebase config is properly set
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const missingFields = requiredFields.filter(field => 
  !firebaseConfig[field as keyof typeof firebaseConfig] || 
  firebaseConfig[field as keyof typeof firebaseConfig]?.toString().startsWith('your-')
);

if (missingFields.length > 0) {
  console.error('❌ Firebase configuration error: Missing or invalid fields:', missingFields);
  console.error('📝 Please update your Firebase config in .env.local file');
  console.error('📖 See README-FIREBASE-SETUP.md for detailed instructions');
} else {
  console.log('✅ Firebase configuration loaded successfully');
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase app:', error);
  throw error;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
