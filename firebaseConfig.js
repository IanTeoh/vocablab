import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0n9VrIMKZhYkrWqTKzrMKAQ5tJ3bZf3w",
  authDomain: "vocablab-cf0eb.firebaseapp.com",
  projectId: "vocablab-cf0eb",
  storageBucket: "vocablab-cf0eb.firebasestorage.app",
  messagingSenderId: "935254488167",
  appId: "1:935254488167:web:2b5268f8f69df7b46650c2",
};

const app = initializeApp(firebaseConfig);

// getReactNativePersistence keeps someone logged in across app
// restarts, backed by AsyncStorage — without this, Firebase Auth
// defaults to browser localStorage, which doesn't exist in React
// Native and would log people out every time they reopen the app.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
