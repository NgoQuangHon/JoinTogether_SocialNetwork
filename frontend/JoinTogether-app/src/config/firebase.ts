import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKeyForPhoneAuthIntegration',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'jointogether-social.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'jointogether-social',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'jointogether-social.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'vi';

export { RecaptchaVerifier, signInWithPhoneNumber };
