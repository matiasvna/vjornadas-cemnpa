/**
 * V Jornadas CEMNPA 2026 - Lógica de Registro y Firebase Firestore
 * Confirmación por Bloques Temáticos (Presencial o Virtual)
 * Arquitectura: ES Modules Moderno, Mobile-First
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc,
  doc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

// Títulos institucionales exactos de cada bloque
const TITULOS_BLOQUES = {
  1: "Bloque 1: Tecnologías, especialidades y capacidades instaladas en la región",
  2: "Bloque 2: Investigación aplicada, seguridad y decisiones interdisciplinarias",
  3: "Bloque 3: Cuidado integral: anticipación, acompañamiento y continuidad"
};

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
      "[CEMNPA] Credenciales de Firebase pendientes. La aplicación funciona en modo demostración local."
    );
  }
} catch (error) {
  console.error("[CEMNPA] Error al inicializar Firebase:", error);
}

/**
 * Separa nombre y apellido en base al texto completo ingresado.
 * @param {string} nombreCompleto 
 * @returns {{ nombre: string, apellido: string }}
 */
function separarNombreApellido(nombreCompleto) {
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length === 0 || !partes[0]) {
    return { nombre: "", apellido: "" };
  }
  if (partes.length === 1) {
    return { nombre: partes[0], apellido: "" };
  }
  if (partes.length === 2) {
    return { nombre: partes[0], apellido: partes[1] };
  }
  return {
    nombre: partes.slice(0, -1).join(" "),
    apellido: partes[partes.length - 1]
  };
}

/**
 * Guarda la confirmación de un bloque en Firebase Firestore y en localStorage.
 * @param {Object} datos
 * @returns {Promise<string>} ID generado para el documento
 */
export async function guardarConfirmacionBloque(datos) {
  const payload = {
    ...datos,
    fechaCreacion: serverTimestamp(),
    timestampLocal: new Date().toISOString()
  };

  if (firebaseInitialized && db) {
    const docRef = await addDoc(collection(db, "inscripciones"), payload);
    return docRef.id;
  } else {
    console.info("[CEMNPA Demo] Guardando confirmación de bloque localmente:", payload);
    const mockId = "CONF-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const previas = JSON.parse(localStorage.getItem("cemnpa_inscripciones") || "[]");
    previas.push({
      id: mockId,
      ...payload,
      fechaCreacion: new Date().toISOString()
    });
    localStorage.setItem("cemnpa_inscripciones", JSON.stringify(previas));
    return mockId;
  }
}

/**
 * Cancela una confirmación de bloque eliminando el registro de Firestore y de localStorage.
 * @param {string} docId 
 */
export async function cancelarConfirmacionBloque(docId) {
  if (!docId) return;

  if (firebaseInitialized && db) {
    try {
      await deleteDoc(doc(db, "inscripciones", docId));
      console.info(`[CEMNPA] Confirmación ${docId} eliminada correctamente de Firestore.`);
    } catch (err) {
      console.error("[CEMNPA] Error al eliminar confirmación en Firestore:", err);
    }
  }

  // Eliminar también de demostración local si existiera
  const previas = JSON.parse(localStorage.getItem("cemnpa_inscripciones") || "[]");
  const filtradas = previas.filter(item => item.id !== docId);
  localStorage.setItem("cemnpa_inscripciones", JSON.stringify(filtradas));
}

// Inicialización de la interfaz de usuario
document.addEventListener("DOMContentLoaded", () => {
  const nombreApellidoInput = document.getElementById("nombreApellidoInput");
  const errorNombreApellido = document.getElementById("error-nombre-apellido");
  const formAlert = document.getElementById("formAlert");

  // Modal de confirmación
  const confirmationModal = document.getElementById("confirmationModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  // 1. Restaurar Nombre y Apellido guardado en la sesión
  const nombreGuardado = localStorage.getItem("cemnpa_nombre_apellido");
  if (nombreGuardado && nombreApellidoInput) {
    nombreApellidoInput.value = nombreGuardado;
  }

  if (nombreApellidoInput) {
    nombreApellidoInput.addEventListener("input", () => {
      const valor = nombreApellidoInput.value;
      localStorage.setItem("cemnpa_nombre_apellido", valor);
      if (valor.trim().length >= 3) {
        clearInputError(nombreApellidoInput, errorNombreApellido);
      }
    });
  }

  // 2. Estado de bloques confirmados en almacenamiento local
  // Formato: { "1": { docId: "...", modalidad: "Presencial" }, ... }
  function obtenerConfirmacionesLocales() {
    try {
      return JSON.parse(localStorage.getItem("cemnpa_bloques_confirmados") || "{}");
    } catch {
      return {};
    }
  }

  function guardarConfirmacionesLocales(data) {
    localStorage.setItem("cemnpa_bloques_confirmados", JSON.stringify(data));
  }

  // 3. Inicializar interactividad de los 3 Bloques Temáticos
  [1, 2, 3].forEach(bloqueNum => {
    inicializarBloque(bloqueNum);
  });

  function inicializarBloque(num) {
    const btnInteresa = document.getElementById(`btn-interesa-${num}`);
    const modalityPanel = document.getElementById(`modality-panel-${num}`);
    const confirmedPanel = document.getElementById(`confirmed-panel-${num}`);
    const btnConfirmar = document.getElementById(`btn-confirmar-${num}`);
    const btnCancelar = document.getElementById(`btn-cancelar-${num}`);
    const btnCancelarConfirm = document.getElementById(`btn-cancelar-confirm-${num}`);
    const errorBloque = document.getElementById(`error-bloque-${num}`);
    const confirmedModalityText = document.getElementById(`confirmed-modality-${num}`);
    const radioChoices = document.querySelectorAll(`input[name="modalidad-bloque-${num}"]`);

    if (!btnInteresa || !modalityPanel || !confirmedPanel) return;

    // Restaurar estado si ya estaba confirmado previamente
    const confirmaciones = obtenerConfirmacionesLocales();
    if (confirmaciones[num]) {
      const { modalidad } = confirmaciones[num];
      mostrarPanelConfirmado(modalidad);
    }

    // A. Clic en "¡Me interesa!" -> Abrir selector de modalidad
    btnInteresa.addEventListener("click", () => {
      ocultarElemento(btnInteresa);
      mostrarElemento(modalityPanel);
      limpiarErrorBloque();

      // Si no ha ingresado el nombre aún, darle pista visual suave sin bloquear
      if (!nombreApellidoInput.value.trim()) {
        mostrarErrorBloque("Recuerde ingresar su Nombre y Apellido arriba para confirmar.");
      }
    });

    // B. Clic en "Cancelar" (antes de confirmar) -> Volver a botón ¡Me interesa!
    btnCancelar.addEventListener("click", () => {
      deseleccionarRadios(radioChoices);
      limpiarErrorBloque();
      ocultarElemento(modalityPanel);
      mostrarElemento(btnInteresa);
    });

    // C. Cambio en opciones de modalidad (Presencial o Virtual)
    radioChoices.forEach(radio => {
      radio.addEventListener("change", () => {
        limpiarErrorBloque();
        actualizarEstiloSeleccionRadios(num);
      });
    });

    // D. Clic en "Confirmar" -> Validar, Guardar en Firebase y mostrar Modal
    btnConfirmar.addEventListener("click", async () => {
      limpiarErrorBloque();

      const nombreCompleto = nombreApellidoInput.value.trim();
      if (!nombreCompleto || nombreCompleto.length < 3) {
        showInputError(
          nombreApellidoInput,
          errorNombreApellido,
          "Por favor, ingrese su nombre y apellido para completar la confirmación."
        );
        mostrarErrorBloque("Por favor, ingrese su nombre y apellido en el formulario arriba.");
        nombreApellidoInput.scrollIntoView({ behavior: "smooth", block: "center" });
        nombreApellidoInput.focus();
        return;
      }

      const radioSeleccionado = document.querySelector(`input[name="modalidad-bloque-${num}"]:checked`);
      if (!radioSeleccionado) {
        mostrarErrorBloque("Por favor, seleccione una modalidad: Presencial o Virtual.");
        return;
      }

      const modalidad = radioSeleccionado.value;
      const nombresSeparados = separarNombreApellido(nombreCompleto);

      const datosBloque = {
        nombreApellido: nombreCompleto,
        nombre: nombresSeparados.nombre,
        apellido: nombresSeparados.apellido,
        bloqueNumero: num,
        bloqueNombre: `Bloque ${num}`,
        bloqueTitulo: TITULOS_BLOQUES[num] || `Bloque ${num}`,
        modalidad: modalidad,
        modalidadAsistencia: modalidad, // compatibilidad
        estado: "Confirmado"
      };

      setBotonCargando(btnConfirmar, true);

      try {
        const docId = await guardarConfirmacionBloque(datosBloque);

        // Guardar estado local
        const estadoActual = obtenerConfirmacionesLocales();
        estadoActual[num] = {
          docId: docId,
          modalidad: modalidad,
          timestamp: new Date().toISOString()
        };
        guardarConfirmacionesLocales(estadoActual);

        setBotonCargando(btnConfirmar, false);

        // Transición a estado confirmado
        mostrarPanelConfirmado(modalidad);

        // Mostrar Modal institucional de éxito
        abrirModalExito(num, modalidad);
      } catch (err) {
        console.error(`[CEMNPA] Error al confirmar Bloque ${num}:`, err);
        setBotonCargando(btnConfirmar, false);
        mostrarErrorBloque("Ocurrió un error al guardar su confirmación. Por favor, reintente.");
      }
    });

    // E. Clic en "Cancelar confirmación" -> Quitar confirmación si tocó sin querer
    btnCancelarConfirm.addEventListener("click", async () => {
      const confirmaCancelacion = window.confirm(
        `¿Desea cancelar su confirmación para el Bloque ${num}?`
      );
      if (!confirmaCancelacion) return;

      btnCancelarConfirm.disabled = true;
      btnCancelarConfirm.textContent = "Cancelando...";

      const estadoActual = obtenerConfirmacionesLocales();
      const registro = estadoActual[num];

      if (registro && registro.docId) {
        await cancelarConfirmacionBloque(registro.docId);
      }

      delete estadoActual[num];
      guardarConfirmacionesLocales(estadoActual);

      btnCancelarConfirm.disabled = false;
      btnCancelarConfirm.textContent = "Cancelar confirmación";

      // Resetear tarjeta a estado inicial
      deseleccionarRadios(radioChoices);
      actualizarEstiloSeleccionRadios(num);
      ocultarElemento(confirmedPanel);
      ocultarElemento(modalityPanel);
      mostrarElemento(btnInteresa);

      mostrarAlertaGlobal(`Se canceló su confirmación para el Bloque ${num}.`, "info");
    });

    // Funciones auxiliares para el bloque
    function mostrarPanelConfirmado(modalidad) {
      ocultarElemento(btnInteresa);
      ocultarElemento(modalityPanel);
      if (confirmedModalityText) {
        confirmedModalityText.textContent = modalidad;
      }
      mostrarElemento(confirmedPanel);
    }

    function mostrarErrorBloque(msg) {
      if (errorBloque) {
        errorBloque.textContent = msg;
        errorBloque.classList.add("visible");
      }
    }

    function limpiarErrorBloque() {
      if (errorBloque) {
        errorBloque.textContent = "";
        errorBloque.classList.remove("visible");
      }
    }
  }

  // 4. Helpers de Interfaz
  function actualizarEstiloSeleccionRadios(num) {
    const choices = document.querySelectorAll(`#modality-panel-${num} .block-modality-choice`);
    choices.forEach(label => {
      const input = label.querySelector('input[type="radio"]');
      if (input && input.checked) {
        label.classList.add("is-selected");
      } else {
        label.classList.remove("is-selected");
      }
    });
  }

  function deseleccionarRadios(radios) {
    radios.forEach(radio => {
      radio.checked = false;
      const label = radio.closest(".block-modality-choice");
      if (label) label.classList.remove("is-selected");
    });
  }

  function mostrarElemento(el) {
    if (el) el.style.display = "";
  }

  function ocultarElemento(el) {
    if (el) el.style.display = "none";
  }

  function setBotonCargando(btn, cargando) {
    if (!btn) return;
    const textSpan = btn.querySelector(".btn-text");
    if (cargando) {
      btn.classList.add("loading");
      btn.disabled = true;
      if (textSpan) textSpan.textContent = "Confirmando...";
    } else {
      btn.classList.remove("loading");
      btn.disabled = false;
      if (textSpan) textSpan.textContent = "Confirmar";
    }
  }

  function showInputError(input, errorEl, message) {
    if (input) input.classList.add("has-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    }
  }

  function clearInputError(input, errorEl) {
    if (input) input.classList.remove("has-error");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("visible");
    }
  }

  function mostrarAlertaGlobal(msg, tipo = "info") {
    if (!formAlert) return;
    formAlert.textContent = msg;
    formAlert.className = `form-alert ${tipo}`;
    setTimeout(() => {
      formAlert.textContent = "";
      formAlert.className = "form-alert";
    }, 4500);
  }

  // 5. Manejo del Modal de Confirmación
  function abrirModalExito(bloqueNum, modalidad) {
    if (!confirmationModal) return;
    if (modalTitle) {
      modalTitle.textContent = `Inscripción registrada BLOQUE ${bloqueNum}`;
    }
    if (modalText) {
      modalText.textContent = `Su confirmación para el Bloque ${bloqueNum} en modalidad ${modalidad} ha sido procesada exitosamente.`;
    }
    confirmationModal.classList.add("active");
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function cerrarModal() {
    if (confirmationModal) {
      confirmationModal.classList.remove("active");
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", cerrarModal);
  }

  if (confirmationModal) {
    confirmationModal.addEventListener("click", (e) => {
      if (e.target === confirmationModal) {
        cerrarModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && confirmationModal && confirmationModal.classList.contains("active")) {
      cerrarModal();
    }
  });
});
