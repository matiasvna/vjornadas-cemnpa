# Guía Administrativa: Gestión de Datos y Métricas de Participación
## V Jornadas CEMNPA 2026 — Medicina Nuclear, Radioterapia y Oncología

---

### 1. Resumen Ejecutivo
Con la nueva arquitectura del sistema de confirmación, la información se captura de forma **directa e individual por cada Bloque Temático**, discriminando con precisión la modalidad de asistencia (**Presencial** o **Virtual**).

Al haber sido recolectada la información complementaria (correos, profesiones, procedencia) en instancias previas, este formulario se enfoca en el **Nombre y Apellido** para permitir el cruce y filtrado inmediato con planillas maestras ya existentes.

---

### 2. Estructura de la Base de Datos (Colección: `inscripciones`)

Cada confirmación realizada por un participante genera un documento en la colección `inscripciones` de **Google Firebase Firestore** con la siguiente estructura:

| Campo | Tipo | Ejemplo | Descripción / Utilidad para Administración |
| :--- | :--- | :--- | :--- |
| **`nombreApellido`** | `String` | `"Martín Albarracín"` | Nombre completo tal como lo ingresó el usuario. |
| **`apellido`** | `String` | `"Albarracín"` | Permite ordenar alfabéticamente y filtrar en planillas. |
| **`nombre`** | `String` | `"Martín"` | Nombre de pila discriminado. |
| **`bloqueNumero`** | `Number` | `1` (1, 2 o 3) | Número de bloque para conteos numéricos rápidos. |
| **`bloqueNombre`** | `String` | `"Bloque 1"` | Identificador textual legible. |
| **`bloqueTitulo`** | `String` | `"Bloque 1: Tecnologías..."` | Título oficial del bloque para informes. |
| **`modalidad`** | `String` | `"Presencial"` o `"Virtual"` | **Clave para aforo de sala y streaming.** |
| **`estado`** | `String` | `"Confirmado"` | Estado de la inscripción. |
| **`fechaCreacion`** | `Timestamp` | `21 de octubre de 2026...` | Marca temporal oficial del servidor. |
| **`timestampLocal`** | `String` | `"2026-10-21T20:30:00Z"` | Marca temporal en formato ISO para exportaciones. |

> **Nota sobre cancelaciones**: Si un participante cancela su inscripción haciendo clic en el botón *"Cancelar confirmación"* del bloque (por si tocó sin querer), el documento se elimina automáticamente de Firestore, garantizando que los conteos no tengan duplicados ni errores.

---

### 3. Métricas Clave para la Organización

Este nuevo esquema permite responder en tiempo real las tres preguntas fundamentales de logística:

1. **Aforo Presencial (Auditorio OSDE)**:
   - ¿Cuántas personas confirmaron asistencia presencial para el **Bloque 1** (Jueves Mañana)?
   - ¿Cuántas para el **Bloque 2** (Jueves Tarde)?
   - ¿Cuántas para el **Bloque 3** (Viernes Mañana)?
2. **Capacidad de Transmisión Virtual**:
   - Cantidad de participantes virtuales por bloque para dimensionar la sala de Zoom / Streaming institucional.
3. **Cruce de Planillas**:
   - Con el campo `apellido` y `nombreApellido`, el equipo administrativo puede aplicar `BUSCARV` (VLOOKUP) en Excel o Google Sheets contra el padrón general de preinscriptos para vincular su profesión, institución o correo sin obligar al usuario a cargarlo dos veces.

---

### 4. Opciones para Visualizar y Compartir la Información

#### Opción A: Acceso Directo por Consola Firebase (Sin programar)
1. Ingresar a: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Iniciar sesión con la cuenta de Google institucional del CEMNPA.
3. Seleccionar el proyecto: **`vjornadas-cemnpa`**.
4. En el menú lateral izquierdo, hacer clic en **Firestore Database**.
5. Abrir la colección **`inscripciones`**:
   - Permite ver cada registro en vivo.
   - Permite filtrar con el botón *"Filtrar"* por `bloqueNumero == 1` y `modalidad == "Presencial"`.

---

#### Opción B: Sincronización Automática con Google Sheets / Excel
Para sincronizar automáticamente los datos con una planilla de Google Sheets compartida para todo el equipo organizador:

1. Abrir una planilla en Google Drive: **"V Jornadas CEMNPA 2026 - Padrón Confirmados"**.
2. Ir a **Extensiones > Apps Script**.
3. Pegar el siguiente script que lee directamente de Firebase vía API REST y actualiza la planilla con 1 solo clic:

```javascript
/**
 * Sincronización Automática de Confirmaciones CEMNPA 2026 con Google Sheets
 */
function sincronizarInscripcionesCEMNPA() {
  const projectId = "vjornadas-cemnpa";
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/inscripciones`;
  
  const response = UrlFetchApp.fetch(url);
  const json = JSON.parse(response.getContentText());
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Encabezados de la planilla
  const rows = [
    ["Nombre y Apellido", "Apellido", "Nombre", "Bloque", "Modalidad", "Estado", "Fecha y Hora"]
  ];
  
  if (json.documents) {
    json.documents.forEach(doc => {
      const f = doc.fields;
      rows.push([
        f.nombreApellido ? f.nombreApellido.stringValue : "",
        f.apellido ? f.apellido.stringValue : "",
        f.nombre ? f.nombre.stringValue : "",
        f.bloqueNombre ? f.bloqueNombre.stringValue : "",
        f.modalidad ? f.modalidad.stringValue : "",
        f.estado ? f.estado.stringValue : "",
        f.timestampLocal ? f.timestampLocal.stringValue : ""
      ]);
    });
  }
  
  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#263f78").setFontColor("#ffffff");
}
```

---

#### Opción C: Panel Visual de Monitoreo en Tiempo Real (Dashboard)
El equipo administrativo puede consultar en tiempo real las métricas mediante cualquier consulta directa a Firestore:

```javascript
// Conteo en vivo de participantes por bloque y modalidad
import { collection, onSnapshot, query, where } from "firebase/firestore";

const q = query(collection(db, "inscripciones"), where("estado", "==", "Confirmado"));
onSnapshot(q, (snapshot) => {
  const metricas = {
    bloque1: { presencial: 0, virtual: 0 },
    bloque2: { presencial: 0, virtual: 0 },
    bloque3: { presencial: 0, virtual: 0 }
  };
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.bloqueNumero && data.modalidad) {
      const bKey = `bloque${data.bloqueNumero}`;
      const mKey = data.modalidad.toLowerCase();
      if (metricas[bKey] && metricas[bKey][mKey] !== undefined) {
        metricas[bKey][mKey]++;
      }
    }
  });
  
  console.log("Métricas en vivo:", metricas);
});
```

---

### 5. Resumen de Contacto Técnico y Accesos
- **Proyecto Firebase**: `vjornadas-cemnpa`
- **Colección principal**: `inscripciones`
- **Hosting del evento**: Activo con despliegue en Firebase Hosting.
- **Soporte técnico**: Comité de Docencia e Investigación · CEMNPA.
