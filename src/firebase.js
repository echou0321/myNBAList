// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlSR83RicM7eRaGY04L7xKjCl68DhpHNw",
  authDomain: "mynbalist.firebaseapp.com",
  projectId: "mynbalist",
  storageBucket: "mynbalist.firebasestorage.app",
  messagingSenderId: "217984887356",
  appId: "1:217984887356:web:4557ecc8f37f256e9eb139",
  databaseURL: "https://mynbalist-default-rtdb.firebaseio.com" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app); 
