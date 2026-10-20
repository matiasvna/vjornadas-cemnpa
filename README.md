# V Jornadas CEMNPA 2026 - Aplicación Web de Inscripciones

Aplicación web institucional desarrollada bajo los más rigurosos estándares de experiencia de usuario (UX/UI), arquitectura Mobile-First y conectividad con la base de datos no relacional **Firebase Firestore**.

---

## 1. Arquitectura y Especificaciones de Diseño

- **Enfoque Mobile-First**: Prioridad de visualización, legibilidad y facilidad de interacción en dispositivos táctiles móviles, escalando fluidamente hacia tablets y pantallas de escritorio.
- **Modo Claro Exclusivo**: Cumplimiento estricto de no inclusión de tema oscuro (Dark Mode).
- **Paleta de Colores Institucional**:
  - Fondos generales y contenedores: `#eef7fb`, `#ffffff`, `#f1f9fc`, `#f5f6fb`, `#f2f9f7`.
  - Textos principales y destacados: `#263f78`, `#344f62`.
  - Acentos y títulos de bloques: `#23a9db`, `#168ab8`, `#236fa1`, `#268f83`.
- **Estructura Modular**: Estilos nativos en CSS moderno con variables personalizadas y JavaScript modular (ES Modules) sin necesidad de empaquetadores complejos.

---

## 2. Estructura del Proyecto

```text
├── index.html                    # Estructura semántica de la página
├── css/
│   └── styles.css               # Estilos institucionales y diseño responsive
├── js/
│   ├── firebase-config.js       # Configuración y credenciales de Firebase
│   └── app.js                   # Lógica de validación, UI y persistencia en Firestore
├── assets/
│   └── images/
│       ├── logo-encabezado.png  # Logotipo institucional CEMNPA
│       ├── sponsors.png         # Banner de auspiciantes oficiales
│       ├── bloque1.jpg          # Imagen temática Bloque 1
│       ├── bloque2.jpg          # Imagen temática Bloque 2
│       └── bloque3.jpg          # Imagen temática Bloque 3
├── .github/
│   └── workflows/
│       └── static.yml           # Flujo de despliegue automático a GitHub Pages
├── firebase.json                # Configuración para Firebase Hosting
└── README.md                    # Documentación técnica
```

---

## 3. Configuración de Firebase Firestore

Para conectar la aplicación con su propio proyecto de Firebase:

1. Ingrese a [Firebase Console](https://console.firebase.google.com/).
2. Cree o seleccione su proyecto institucional.
3. Habilite **Firestore Database** en la sección *Build > Firestore Database*.
4. Registre una aplicación web para obtener el objeto de configuración.
5. Abra el archivo `js/firebase-config.js` y reemplace los marcadores por sus credenciales reales:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "su-proyecto.firebaseapp.com",
  projectId: "su-proyecto-id",
  storageBucket: "su-proyecto.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};
```

> **Nota sobre el Modo Demostración:** Mientras las credenciales no sean reemplazadas, la aplicación continuará funcionando en modo demostración local (guardando las inscripciones en `localStorage` del navegador), lo que permite probar la interfaz de inmediato.

---

## 4. Reglas de Seguridad Recomendadas para Firestore

Para permitir que los asistentes registren su inscripción pero restringir la lectura pública de datos personales a administradores autorizados, configure las siguientes reglas en la pestaña **Rules** de Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inscripciones/{document} {
      // Permitir la creación de nuevos registros con validación de campos obligatorios
      allow create: if request.resource.data.modalidadAsistencia in ['Virtual', 'Presencial', 'Ambas']
                    && request.resource.data.nombre is string
                    && request.resource.data.apellido is string
                    && request.resource.data.correoElectronico is string
                    && request.resource.data.profesionOcupacion in [
                        'Profesional de la salud', 
                        'Estudiante', 
                        'Gestor/Institución', 
                        'Residente', 
                        'Investigador', 
                        'Solo por información'
                       ]
                    && request.resource.data.lugarResidencia is string;
      
      // Proteger la lectura, actualización y eliminación
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

---

## 5. Vinculación con GitHub y Despliegue Automático

El repositorio remoto asignado es:  
`https://github.com/matiasvna/vjornadas-cemnpa.git`

Para inicializar y enviar el código a su repositorio de GitHub:

```bash
git init
git add .
git commit -m "feat: Aplicación web de inscripciones V Jornadas CEMNPA 2026"
git branch -M main
git remote add origin https://github.com/matiasvna/vjornadas-cemnpa.git
git push -u origin main
```

Una vez enviado a GitHub:
- Puede habilitar **GitHub Pages** en `Settings > Pages > Source: GitHub Actions` para despliegue instantáneo con el workflow incluido.
- O bien ejecutar `firebase deploy` para alojarlo en **Firebase Hosting**.
