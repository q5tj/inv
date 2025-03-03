// src/firebase.js
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA-DnTdqjQW9-gq6UBEcnhIk7gT1dHdSBI",
    authDomain: "invoice-bed82.firebaseapp.com",
    databaseURL: "https://invoice-bed82-default-rtdb.firebaseio.com",
    projectId: "invoice-bed82",
    storageBucket: "invoice-bed82.firebasestorage.app",
    messagingSenderId: "387761020229",
    appId: "1:387761020229:web:a22e0b4058ae9fb7b0f22c",
    measurementId: "G-SB2H7229YE"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export const db = getFirestore(app);

export { auth, signInWithEmailAndPassword };
