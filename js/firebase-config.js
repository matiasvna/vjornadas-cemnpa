// Configuración oficial de Firebase para las V Jornadas CEMNPA 2026
export const firebaseConfig = {
  apiKey: "AIzaSyB7D0gdbzmmHiYKxy7IT8ky1lereNF3gWQ",
  authDomain: "vjornadas-cemnpa.firebaseapp.com",
  projectId: "vjornadas-cemnpa",
  storageBucket: "vjornadas-cemnpa.firebasestorage.app",
  messagingSenderId: "467358846133",
  appId: "1:467358846133:web:bf2f803c888a41c5f0c2fc",
  measurementId: "G-BGSSGDK17L"
};

// Valida que las credenciales estén presentes
export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "TU_API_KEY_AQUI"
  );
}
