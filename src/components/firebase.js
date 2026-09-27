// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);        // <--- Volvemos a exportar db para Proyectos.jsx
export const rtdb = getDatabase(app);      // <--- Para AgendaPro.jsx
export const auth = getAuth(app);

console.log("🔗 Conectado correctamente a:", rtdb.app.options.databaseURL);