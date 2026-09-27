import { db, auth } from '../src/components/firebase'; // Asegúrate de exportar 'auth' y 'db' desde tu config
import { ref, set, get, update } from "firebase/database";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";

/**
 * 1. INICIO DE SESIÓN SEGURO CON FIREBASE AUTHENTICATION Y REALTIME DATABASE
 */
export const loginProfesionalConDB = async (email, password) => {
  try {
    // Autenticación nativa cifrada en los servidores de Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
    const user = userCredential.user; 

    // Traemos sus datos complementarios (nombre, apellido, etc.) desde Realtime Database usando su UID único
    const profesionalRef = ref(db, `profesionales/${user.uid}`);
    const snapshot = await get(profesionalRef);

    if (snapshot.exists()) {
      return {
        success: true,
        uid: user.uid,
        userData: snapshot.val()
      };
    } else {
      // Caso de contingencia: Existe en Auth pero no tiene nodo en la DB todavía
      return { 
        success: true, 
        uid: user.uid, 
        userData: { 
          email: user.email, 
          nombre: "Consultor", 
          apellido: "",
          fotoPerfil: "",
          motto: "Tu estilo. Tu imagen. Tu mejor versión."
        } 
      };
    }

  } catch (error) {
    console.error("Error en Auth de Firebase:", error.code);
    
    // Mapeo de errores comunes para mostrárselos limpios al usuario en la terminal
    let mensajeError = "Error de conexión con el servidor.";
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      mensajeError = "Datos incorrectos o registrate";
    } else if (error.code === 'auth/invalid-email') {
      mensajeError = "El formato del correo electrónico no es válido.";
    }
    
    return { success: false, error: mensajeError };
  }
};

/**
 * 2. REGISTRO SEGURO CON FIREBASE AUTHENTICATION Y REALTIME DATABASE
 */
export const registrarProfesionalConDB = async (userData) => {
  try {
    // Creación del usuario en Firebase Authentication (Guarda email y cifra la clave de inmediato)
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email.trim().toLowerCase(), 
      userData.password.trim()
    );
    const user = userCredential.user;

    // Estructuramos el perfil complementario para la base de datos (SIN GUARDAR LA CONTRASEÑA AQUÍ)
    const nuevoPerfil = {
      nombre: userData.nombre.trim(),
      apellido: userData.apellido.trim(),
      email: userData.email.trim().toLowerCase(),
      rol: "consultor",
      fotoPerfil: "", // Inicializamos vacío para que exista el nodo
      motto: "Tu estilo. Tu imagen. Tu mejor versión.", // Lema base por defecto
      fechaRegistro: new Date().toISOString()
    };

    // Guardamos en la Realtime Database usando exactamente el UID generado por Authentication
    await set(ref(db, `profesionales/${user.uid}`), nuevoPerfil);

    return {
      success: true,
      uid: user.uid,
      userData: nuevoPerfil
    };

  } catch (error) {
    console.error("Error al registrar en Firebase:", error.code);
    
    let mensajeError = "Error de conexión al crear el perfil.";
    if (error.code === 'auth/email-already-in-use') {
      mensajeError = "El correo ya está registrado en la base de datos.";
    } else if (error.code === 'auth/weak-password') {
      mensajeError = "La contraseña es muy débil (mínimo 6 caracteres).";
    }

    return { success: false, error: mensajeError };
  }
};

/**
 * 3. OBTENER PERFIL ESPECÍFICO PARA EL PANEL DE CONTROL
 */
export const obtenerPerfilProfesional = async (uid) => {
  try {
    const profesionalRef = ref(db, `profesionales/${uid}`);
    const snapshot = await get(profesionalRef);

    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: false, error: "El perfil no existe en la terminal." };
    }
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    return { success: false, error: error.message };
  }
};

/**
 * 4. ACTUALIZAR MUTABLE DATA (FOTO Y DESCRIPCIÓN) DESDE EL MODAL HUD
 * Realiza un update parcial sobre el nodo del profesional sin alterar los demás campos.
 */
export const actualizarPerfilProfesional = async (uid, datosActualizados) => {
  try {
    const profesionalRef = ref(db, `profesionales/${uid}`);
    // Usamos update para modificar solo las llaves del objeto que enviamos (fotoPerfil y motto)
    await update(profesionalRef, datosActualizados);
    return { success: true };
  } catch (error) {
    console.error("Error al sincronizar actualización con Realtime Database:", error);
    return { success: false, error: error.message };
  }
};