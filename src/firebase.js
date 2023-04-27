import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyB9YOZ8hPLZVfqB9JvE9wHYl62fPHVh8Aw",
    authDomain: "textz-be8a0.firebaseapp.com",
    projectId: "textz-be8a0",
    storageBucket: "textz-be8a0.appspot.com",
    messagingSenderId: "487168414889",
    appId: "1:487168414889:web:c40e35b8d98ca2f2dbc5b8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
export const messaging = getMessaging(app);