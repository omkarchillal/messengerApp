// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyC2u4j6PQ0jsMJzMocMo5JECbbz2305kuA",
    authDomain: "appnexus-4c007.firebaseapp.com",
    projectId: "appnexus-4c007",
    storageBucket: "appnexus-4c007.firebasestorage.app",
    messagingSenderId: "1023004623236",
    appId: "1:1023004623236:web:ed4ab6279b785dbd25ddd1",
    measurementId: "G-B7HHFFTPET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

export { auth, googleProvider, analytics };
export default app;
