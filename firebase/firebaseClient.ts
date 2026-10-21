"use client";
import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, getFirestore, getDocs } from "firebase/firestore";

import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
// unused import removed

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const clientApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(clientApp);
export const db = getFirestore(clientApp, "default");

let analyticsPromise:
  Promise<import("firebase/analytics").Analytics | null> | undefined;
export const getFirebaseAnalytics = () => {
  if (!analyticsPromise) {
    analyticsPromise = import("firebase/analytics")
      .then(async ({ getAnalytics, isSupported }) =>
        (await isSupported()) ? getAnalytics(clientApp) : null,
      )
      .catch(() => null);
  }
  return analyticsPromise;
};
export const signUser = async () => {
  let user = await signInAnonymously(auth);
  console.log("User Signed In: ", user.user.uid);
  return user.user;
};

// Singleton to handle concurrent sign-in requests
let signInPromise: Promise<any> | null = null;

export const getIdToken = async () => {
  // 1. If we already have a user, return their token
  if (auth.currentUser) {
    return auth.currentUser.getIdToken();
  }

  // 2. If a sign-in is already in progress, wait for it
  if (signInPromise) {
    await signInPromise;
    return (auth.currentUser as any)?.getIdToken();
  }

  // 3. Initiate a new anonymous sign-in
  try {
    signInPromise = signInAnonymously(auth);
    const result = await signInPromise;
    signInPromise = null;
    return result.user.getIdToken();
  } catch (error) {
    signInPromise = null;
    console.error("Firebase Anonymous Sign-in failed:", error);
    throw error;
  }
};
