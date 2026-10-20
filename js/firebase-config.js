// Configuración de Firebase para las V Jornadas CEMNPA 2026
// Reemplace estos valores con las credenciales de su proyecto de Firebase Console
export const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Verifica si las credenciales han sido provistas o permanecen como marcadores
export function isFirebaseConfigured() {
  return (
    firebaseConfig.apiKey !== "TU_API_KEY_AQUI" &&
    firebaseConfig.projectId !== "TU_PROJECT_ID" &&
    firebaseConfig.apiKey.trim().length > 0
  );
}
