import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  User as FirebaseUser
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyByLexDZl4s9WO1B7CsZ7JlK8o0j8GQXbM",
  authDomain: "studentfood-app.firebaseapp.com",
  projectId: "studentfood-app",
  storageBucket: "studentfood-app.firebasestorage.app",
  messagingSenderId: "244877096677",
  appId: "1:244877096677:web:75f2fb47e8fb95e66dc60c",
  measurementId: "G-SR7ERHFFRP"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google Popup via Firebase
 */
export const signInWithGooglePopup = async (): Promise<{
  user: FirebaseUser;
  idToken: string;
}> => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
};

export const logoutFirebase = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Analytics (only supported in browser environments)
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("🔥 Firebase & Analytics initialized for studentfood-app");
    }
  });
}
