// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD19yBJoVcqCqKducNUbj0mXGYxZiB3zOo",
  authDomain: "arsip-sistem.firebaseapp.com",
  projectId: "arsip-sistem",
  storageBucket: "arsip-sistem.firebasestorage.app",
  messagingSenderId: "791728725603",
  appId: "1:791728725603:web:1309be5412a6e47a31a256",
  measurementId: "G-D0X8Y17D7Y"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const auth = getAuth(app);
// Firestore connection removed as per user request to use MongoDB
// const db = initializeFirestore(app, {
//   experimentalForceLongPolling: true,
//   localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
// });
const storage = getStorage(app);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, storage, analytics };
