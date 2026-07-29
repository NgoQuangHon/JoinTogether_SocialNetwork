import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBt-5fEs0AZswqZsLliCOjQ2ZIW7HleqQQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'jointogether-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'jointogether-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'jointogether-app.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '599015660338',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:599015660338:web:b425650f7c0b709ff8552b',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'vi';

export { RecaptchaVerifier, signInWithPhoneNumber };
