// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBIJ14VkfBMYwDDlSWxAAGRj08AVEipFP4",
  authDomain: "yianna-arkana.firebaseapp.com",
  databaseURL: "https://yianna-arkana-default-rtdb.firebaseio.com",
  projectId: "yianna-arkana",
  storageBucket: "yianna-arkana.firebasestorage.app",
  messagingSenderId: "940551831496",
  appId: "1:940551831496:web:a46fa19dd7c6125054cafd"
};

// Evita que Firebase se inicialice dos veces si ya existe una instancia previa
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);