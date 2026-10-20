/**
 * V Jornadas CEMNPA 2026 - Lógica de Registro y Firebase Firestore
 * Arquitectura: ES Modules Moderno, Mobile-First
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

// Estado de inicialización de Firebase
let db = null;
let firebaseInitialized = false;

try {
  if (isFirebaseConfigured()) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseInitialized = true;
    console.info("[CEMNPA] Firebase Firestore inicializado correctamente.");
  } else {
    console.warn(
      "[CEMNPA] Credenciales de Firebase pendientes. La aplicación funciona en modo demostración local hasta configurar js/firebase-config.js."
    );
  }
} catch (error) {
  console.error("[CEMNPA] Error al inicializar Firebase:", error);
}

/**
 * Función requerida para guardar el objeto de inscripción en la colección "inscripciones" de Firebase Firestore.
 * @param {Object} datosInscripcion - Objeto con los datos del participante
 * @returns {Promise<string>} - ID del documento generado en Firestore
 */
export async function guardarInscripcion(datosInscripcion) {
  if (firebaseInitialized && db) {
    const docRef = await addDoc(collection(db, "inscripciones"), {
      ...datosInscripcion,
      fechaCreacion: serverTimestamp(),
      timestampLocal: new Date().toISOString()
    });
    return docRef.id;
  } else {
    // Simulación controlada para pruebas locales previas a la inserción de claves
    console.info("[CEMNPA Demo] Guardando inscripción localmente:", datosInscripcion);
    const mockId = "DEMO-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const inscripcionesPrevias = JSON.parse(localStorage.getItem("cemnpa_inscripciones") || "[]");
    inscripcionesPrevias.push({
      id: mockId,
      ...datosInscripcion,
      timestampLocal: new Date().toISOString()
    });
    localStorage.setItem("cemnpa_inscripciones", JSON.stringify(inscripcionesPrevias));
    return mockId;
  }
}

// Elementos del DOM
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  const submitBtn = document.getElementById("submitBtn");
  const formAlert = document.getElementById("formAlert");
  const selectedBlockBanner = document.getElementById("selectedBlockBanner");
  const selectedBlockText = document.getElementById("selectedBlockText");
  const resetBlockBtn = document.getElementById("resetBlockBtn");
  const bloqueInteresInput = document.getElementById("bloqueInteresInput");

  const modalidadRadios = document.querySelectorAll('input[name="modalidad"]');
  const modalidadCards = document.querySelectorAll(".modality-card");

  const nombreInput = document.getElementById("nombreInput");
  const apellidoInput = document.getElementById("apellidoInput");
  const profesionSelect = document.getElementById("profesionSelect");
  const emailInput = document.getElementById("emailInput");
  const residenciaInput = document.getElementById("residenciaInput");

  // Modal de confirmación
  const confirmationModal = document.getElementById("confirmationModal");
  const modalSummary = document.getElementById("modalSummary");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  // 1. Manejo visual de radio buttons de modalidad
  modalidadRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      modalidadCards.forEach(card => card.classList.remove("is-selected"));
      if (radio.checked) {
        radio.closest(".modality-card").classList.add("is-selected");
        clearError("modalidad");
      }
    });
  });

  // 2. Limpieza de errores en tiempo real al escribir
  nombreInput.addEventListener("input", () => clearError("nombre"));
  apellidoInput.addEventListener("input", () => clearError("apellido"));
  profesionSelect.addEventListener("change", () => clearError("profesion"));
  emailInput.addEventListener("input", () => clearError("email"));
  residenciaInput.addEventListener("input", () => clearError("residencia"));

  // 3. Botones "Inscribirse a este bloque"
  const blockButtons = document.querySelectorAll(".btn-block-action");
  blockButtons.forEach(button => {
    button.addEventListener("click", () => {
      const blockTitle = button.getAttribute("data-block-id");
      seleccionarBloque(blockTitle);
    });
  });

  // Restablecer selección de bloque
  resetBlockBtn.addEventListener("click", () => {
    bloqueInteresInput.value = "";
    selectedBlockBanner.classList.remove("active");
  });

  function seleccionarBloque(blockTitle) {
    bloqueInteresInput.value = blockTitle;
    selectedBlockText.textContent = `Inscripción específica: ${blockTitle}`;
    selectedBlockBanner.classList.add("active");

    const formSection = document.getElementById("formulario-inscripcion");
    formSection.scrollIntoView({ behavior: "smooth", block: "start" });

    // Foco en la primera opción de modalidad para accesibilidad
    const firstRadio = document.getElementById("modalidad-virtual");
    if (firstRadio) {
      firstRadio.focus();
    }
  }

  // 4. Validaciones de formulario
  function validarFormulario() {
    let isValid = true;

    // Modalidad
    const modalidadSeleccionada = document.querySelector('input[name="modalidad"]:checked');
    if (!modalidadSeleccionada) {
      showError("modalidad", "Por favor, seleccione una modalidad de asistencia.");
      isValid = false;
    } else {
      clearError("modalidad");
    }

    // Nombre
    if (!nombreInput.value.trim() || nombreInput.value.trim().length < 2) {
      showError("nombre", "Por favor, ingrese un nombre válido.");
      isValid = false;
    } else {
      clearError("nombre");
    }

    // Apellido
    if (!apellidoInput.value.trim() || apellidoInput.value.trim().length < 2) {
      showError("apellido", "Por favor, ingrese un apellido válido.");
      isValid = false;
    } else {
      clearError("apellido");
    }

    // Profesión
    if (!profesionSelect.value) {
      showError("profesion", "Por favor, seleccione su profesión u ocupación.");
      isValid = false;
    } else {
      clearError("profesion");
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      showError("email", "Por favor, ingrese un correo electrónico válido.");
      isValid = false;
    } else {
      clearError("email");
    }

    // Lugar de residencia
    if (!residenciaInput.value.trim() || residenciaInput.value.trim().length < 2) {
      showError("residencia", "Por favor, ingrese su lugar de residencia.");
      isValid = false;
    } else {
      clearError("residencia");
    }

    return isValid;
  }

  function showError(fieldId, message) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    }
    const inputEl = document.getElementById(`${fieldId}Input`) || document.getElementById(`${fieldId}Select`);
    if (inputEl) {
      inputEl.classList.add("has-error");
    }
  }

  function clearError(fieldId) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (errorEl) {
      errorEl.classList.remove("visible");
    }
    const inputEl = document.getElementById(`${fieldId}Input`) || document.getElementById(`${fieldId}Select`);
    if (inputEl) {
      inputEl.classList.remove("has-error");
    }
  }

  // 5. Envío de Formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    if (!validarFormulario()) {
      showAlert("Por favor, complete todos los campos requeridos correctamente.", "error");
      return;
    }

    const modalidadSeleccionada = document.querySelector('input[name="modalidad"]:checked').value;
    const datosInscripcion = {
      modalidadAsistencia: modalidadSeleccionada,
      nombre: nombreInput.value.trim(),
      apellido: apellidoInput.value.trim(),
      profesionOcupacion: profesionSelect.value,
      correoElectronico: emailInput.value.trim().toLowerCase(),
      lugarResidencia: residenciaInput.value.trim(),
      bloqueInteres: bloqueInteresInput.value || "Todas las Jornadas"
    };

    setLoadingState(true);

    try {
      const registrationId = await guardarInscripcion(datosInscripcion);

      // Mostrar modal de éxito
      mostrarModalExito(datosInscripcion, registrationId);

      // Limpiar formulario
      form.reset();
      modalidadCards.forEach(card => card.classList.remove("is-selected"));
      bloqueInteresInput.value = "";
      selectedBlockBanner.classList.remove("active");
    } catch (error) {
      console.error("[CEMNPA] Error al registrar la inscripción:", error);
      showAlert(
        "Ocurrió un error al procesar su inscripción. Por favor, verifique su conexión e intente nuevamente.",
        "error"
      );
    } finally {
      setLoadingState(false);
    }
  });

  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
      submitBtn.querySelector(".btn-text").textContent = "Procesando inscripción...";
    } else {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      submitBtn.querySelector(".btn-text").textContent = "Confirmar Inscripción";
    }
  }

  function showAlert(message, type) {
    formAlert.textContent = message;
    formAlert.className = `form-alert ${type}`;
  }

  function hideAlert() {
    formAlert.textContent = "";
    formAlert.className = "form-alert";
  }

  function mostrarModalExito(datos, id) {
    modalSummary.innerHTML = `
      <p><strong>Número de Registro:</strong> ${id}</p>
      <p><strong>Participante:</strong> ${datos.nombre} ${datos.apellido}</p>
      <p><strong>Modalidad:</strong> ${datos.modalidadAsistencia}</p>
      <p><strong>Profesión / Ocupación:</strong> ${datos.profesionOcupacion}</p>
      <p><strong>Correo electrónico:</strong> ${datos.correoElectronico}</p>
      <p><strong>Lugar de residencia:</strong> ${datos.lugarResidencia}</p>
      <p><strong>Participación:</strong> ${datos.bloqueInteres}</p>
    `;
    confirmationModal.classList.add("active");
  }

  modalCloseBtn.addEventListener("click", () => {
    confirmationModal.classList.remove("active");
  });

  // Cerrar modal al hacer clic en el fondo
  confirmationModal.addEventListener("click", (e) => {
    if (e.target === confirmationModal) {
      confirmationModal.classList.remove("active");
    }
  });
});
