import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Reemplaza estos valores con las credenciales de la consola de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA6VUfBRVdzJz2_mksAhyVl4XHbptm08QU",
  authDomain: "remiprofesionales-f2982.firebaseapp.com",
  databaseURL: "https://remiprofesionales-f2982-default-rtdb.firebaseio.com",
  projectId: "remiprofesionales-f2982",
  storageBucket: "remiprofesionales-f2982.firebasestorage.app",
  messagingSenderId: "156001611454",
  appId: "1:156001611454:web:340ef770c6f6508644b8ef"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar la instancia de Realtime Database
export const db = getDatabase(app);
export const auth = getAuth(app)