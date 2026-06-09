import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyB3IQkaqe3FM1YFzP3ww8sjOJg6YrO0tDQ",
  authDomain: "personal-meeting-booking-page.firebaseapp.com",
  projectId: "personal-meeting-booking-page",
  storageBucket: "personal-meeting-booking-page.firebasestorage.app",
  messagingSenderId: "217235025817",
  appId: "1:217235025817:web:330c7ce33303ac0744ed08",
  measurementId: "G-GK6HVM9Z6G"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);