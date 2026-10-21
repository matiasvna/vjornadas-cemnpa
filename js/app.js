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

// Dataset de Provincias y Ciudades de Argentina
const UBICACIONES_ARGENTINA = {
  "Santa Cruz": [
    "Río Gallegos",
    "Caleta Olivia",
    "El Calafate",
    "Pico Truncado",
    "Puerto Deseado",
    "Las Heras",
    "Perito Moreno",
    "Río Turbio",
    "28 de Noviembre",
    "Puerto San Julián",
    "Puerto Santa Cruz",
    "Comandante Luis Piedrabuena",
    "Los Antiguos",
    "Gobernador Gregores",
    "El Chaltén",
    "Jaramillo y Fitz Roy",
    "Lago Posadas",
    "Koluel Kayke",
    "Tres Lagos",
    "Bajo Caracoles",
    "Otra localidad"
  ],
  "Tierra del Fuego, Antártida e Islas del Atlántico Sur": [
    "Ushuaia",
    "Río Grande",
    "Tolhuin",
    "Otra localidad"
  ],
  "Chubut": [
    "Comodoro Rivadavia",
    "Trelew",
    "Puerto Madryn",
    "Rawson",
    "Esquel",
    "Rada Tilly",
    "Sarmiento",
    "Trevelin",
    "Gaiman",
    "Dolavon",
    "Lago Puelo",
    "El Hoyo",
    "El Maitén",
    "Epuyén",
    "Cholila",
    "Río Mayo",
    "Otra localidad"
  ],
  "Río Negro": [
    "San Carlos de Bariloche",
    "General Roca",
    "Cipolletti",
    "Viedma",
    "Villa Regina",
    "Allen",
    "Cinco Saltos",
    "Catriel",
    "El Bolsón",
    "Choele Choel",
    "San Antonio Oeste",
    "Las Grutas",
    "Río Colorado",
    "Ingeniero Jacobacci",
    "Sierra Grande",
    "Otra localidad"
  ],
  "Neuquén": [
    "Neuquén Capital",
    "San Martín de los Andes",
    "Plottier",
    "Centenario",
    "Cutral Có",
    "Plaza Huincul",
    "Zapala",
    "Chos Malal",
    "Villa La Angostura",
    "Junín de los Andes",
    "Rincón de los Sauces",
    "Añelo",
    "Otra localidad"
  ],
  "Ciudad Autónoma de Buenos Aires (CABA)": [
    "CABA (Toda la ciudad)",
    "Comuna 1 (Retiro, San Nicolás, Pto. Madero, San Telmo, Montserrat, Constitución)",
    "Comuna 2 (Recoleta)",
    "Comuna 3 (Balvanera, San Cristóbal)",
    "Comuna 4 (La Boca, Barracas, Parque Patricios, Pompeya)",
    "Comuna 5 (Almagro, Boedo)",
    "Comuna 6 (Caballito)",
    "Comuna 7 (Flores, Parque Chacabuco)",
    "Comuna 8 (Villa Soldati, Riachuelo, Lugano)",
    "Comuna 9 (Liniers, Mataderos, Parque Avellaneda)",
    "Comuna 10 (Villa Real, Monte Castro, Versalles, Floresta, Luro)",
    "Comuna 11 (Villa Devoto, del Parque, Mitre, Santa Rita)",
    "Comuna 12 (Coghlan, Saavedra, Urquiza, Pueyrredón)",
    "Comuna 13 (Núñez, Belgrano, Colegiales)",
    "Comuna 14 (Palermo)",
    "Comuna 15 (Chacarita, Villa Crespo, Paternal, Ortúzar, Agronomía)",
    "Otra localidad"
  ],
  "Buenos Aires": [
    "La Plata",
    "Mar del Plata",
    "Bahía Blanca",
    "Tandil",
    "Olavarría",
    "San Nicolás de los Arroyos",
    "Pergamino",
    "Junín",
    "Campana",
    "Zárate",
    "Necochea",
    "Azul",
    "Mercedes",
    "Chivilcoy",
    "Tres Arroyos",
    "Balcarce",
    "Gran Buenos Aires (Zona Norte)",
    "Gran Buenos Aires (Zona Oeste)",
    "Gran Buenos Aires (Zona Sur)",
    "Otra localidad"
  ],
  "Córdoba": [
    "Córdoba Capital",
    "Río Cuarto",
    "Villa María",
    "Villa Carlos Paz",
    "San Francisco",
    "Alta Gracia",
    "Río Tercero",
    "Bell Ville",
    "La Falda",
    "Jesús María",
    "Villa Dolores",
    "Cruz del Eje",
    "Marcos Juárez",
    "Arroyito",
    "Otra localidad"
  ],
  "Santa Fe": [
    "Rosario",
    "Santa Fe Capital",
    "Rafaela",
    "Venado Tuerto",
    "Reconquista",
    "Santo Tomé",
    "Villa Gobernador Gálvez",
    "Esperanza",
    "Granadero Baigorria",
    "Casilda",
    "San Lorenzo",
    "Sunchales",
    "Otra localidad"
  ],
  "Mendoza": [
    "Mendoza Capital",
    "San Rafael",
    "Godoy Cruz",
    "Guaymallén",
    "Las Heras",
    "Maipú",
    "Luján de Cuyo",
    "San Martín",
    "Rivadavia",
    "Tunuyán",
    "General Alvear",
    "Malargüe",
    "Tupungato",
    "Otra localidad"
  ],
  "Catamarca": [
    "San Fernando del Valle de Catamarca",
    "Valle Viejo",
    "Andalgalá",
    "Belén",
    "Santa María",
    "Tinogasta",
    "Recreo",
    "Otra localidad"
  ],
  "Chaco": [
    "Resistencia",
    "Presidencia Roque Sáenz Peña",
    "Barranqueras",
    "Fontana",
    "Villa Ángela",
    "Castelli",
    "Charata",
    "Quitilipi",
    "Otra localidad"
  ],
  "Corrientes": [
    "Corrientes Capital",
    "Goya",
    "Paso de los Libres",
    "Curuzú Cuatiá",
    "Mercedes",
    "Bella Vista",
    "Santo Tomé",
    "Monte Caseros",
    "Ituzaingó",
    "Otra localidad"
  ],
  "Entre Ríos": [
    "Paraná",
    "Concordia",
    "Gualeguaychú",
    "Concepción del Uruguay",
    "Gualeguay",
    "Villaguay",
    "Chajarí",
    "Victoria",
    "La Paz",
    "Colón",
    "Otra localidad"
  ],
  "Formosa": [
    "Formosa Capital",
    "Clorinda",
    "Pirané",
    "El Colorado",
    "Ingeniero Juárez",
    "Las Lomitas",
    "Otra localidad"
  ],
  "Jujuy": [
    "San Salvador de Jujuy",
    "San Pedro de Jujuy",
    "Palpalá",
    "Libertador General San Martín",
    "Perico",
    "La Quiaca",
    "Humahuaca",
    "Tilcara",
    "Otra localidad"
  ],
  "La Pampa": [
    "Santa Rosa",
    "General Pico",
    "General Acha",
    "Eduardo Castex",
    "Realicó",
    "Intendente Alvear",
    "25 de Mayo",
    "Otra localidad"
  ],
  "La Rioja": [
    "La Rioja Capital",
    "Chilecito",
    "Chamical",
    "Aimogasta",
    "Chepes",
    "Villa Unión",
    "Otra localidad"
  ],
  "Misiones": [
    "Posadas",
    "Oberá",
    "Eldorado",
    "Puerto Iguazú",
    "Apóstoles",
    "Leandro N. Alem",
    "San Vicente",
    "Montecarlo",
    "Otra localidad"
  ],
  "Salta": [
    "Salta Capital",
    "San Ramón de la Nueva Orán",
    "Tartagal",
    "General Güemes",
    "San José de Metán",
    "Rosario de la Frontera",
    "Cafayate",
    "Otra localidad"
  ],
  "San Juan": [
    "San Juan Capital",
    "Rawson",
    "Chimbas",
    "Rivadavia",
    "Santa Lucía",
    "Pocito",
    "Caucete",
    "Jáchal",
    "Otra localidad"
  ],
  "San Luis": [
    "San Luis Capital",
    "Villa Mercedes",
    "Merlo",
    "La Punta",
    "Juana Koslay",
    "Justo Daract",
    "Otra localidad"
  ],
  "Santiago del Estero": [
    "Santiago del Estero Capital",
    "La Banda",
    "Termas de Río Hondo",
    "Frías",
    "Añatuya",
    "Fernández",
    "Otra localidad"
  ],
  "Tucumán": [
    "San Miguel de Tucumán",
    "Banda del Río Salí",
    "Yerba Buena",
    "Villa Carmela",
    "Concepción",
    "Tafí Viejo",
    "Aguilares",
    "Famaillá",
    "Monteros",
    "Tafí del Valle",
    "Otra localidad"
  ]
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
      "[CEMNPA] Credenciales de Firebase pendientes. La aplicación funciona en modo demostración local hasta configurar js/firebase-config.js."
    );
  }
} catch (error) {
  console.error("[CEMNPA] Error al inicializar Firebase:", error);
}

/**
 * Guarda el objeto de inscripción en la colección "inscripciones" de Firebase Firestore.
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
    console.info("[CEMNPA Demo] Guardando confirmación localmente:", datosInscripcion);
    const mockId = "CONF-" + Math.random().toString(36).substring(2, 10).toUpperCase();
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

// Elementos del DOM e inicialización
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

  // Selectores dependientes de Provincia y Ciudad
  const provinciaSelect = document.getElementById("provinciaSelect");
  const ciudadSelect = document.getElementById("ciudadSelect");
  const otraCiudadGroup = document.getElementById("otraCiudadGroup");
  const otraCiudadInput = document.getElementById("otraCiudadInput");

  // Modal de confirmación
  const confirmationModal = document.getElementById("confirmationModal");
  const modalSummary = document.getElementById("modalSummary");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  // 1. Cargar Provincias en el dropdown
  cargarProvincias();

  function cargarProvincias() {
    const provincias = Object.keys(UBICACIONES_ARGENTINA).sort((a, b) => {
      // Priorizar Santa Cruz primera por ser sede provincial del evento
      if (a === "Santa Cruz") return -1;
      if (b === "Santa Cruz") return 1;
      return a.localeCompare(b, "es");
    });

    provincias.forEach(prov => {
      const option = document.createElement("option");
      option.value = prov;
      option.textContent = prov;
      provinciaSelect.appendChild(option);
    });
  }

  // Cambio de Provincia -> Cargar Ciudades
  provinciaSelect.addEventListener("change", () => {
    const provSeleccionada = provinciaSelect.value;
    clearError("provincia");

    ciudadSelect.innerHTML = '<option value="" disabled selected>Seleccione su ciudad o localidad</option>';
    ciudadSelect.disabled = false;
    otraCiudadGroup.style.display = "none";
    otraCiudadInput.value = "";
    clearError("ciudad");
    clearError("otra-ciudad");

    const ciudades = UBICACIONES_ARGENTINA[provSeleccionada] || ["Otra localidad"];
    ciudades.forEach(ciudad => {
      const option = document.createElement("option");
      option.value = ciudad;
      option.textContent = ciudad;
      ciudadSelect.appendChild(option);
    });
  });

  // Cambio de Ciudad -> Mostrar input si elige 'Otra localidad'
  ciudadSelect.addEventListener("change", () => {
    clearError("ciudad");
    if (ciudadSelect.value === "Otra localidad") {
      otraCiudadGroup.style.display = "block";
      otraCiudadInput.focus();
    } else {
      otraCiudadGroup.style.display = "none";
      otraCiudadInput.value = "";
      clearError("otra-ciudad");
    }
  });

  otraCiudadInput.addEventListener("input", () => clearError("otra-ciudad"));

  // 2. Manejo visual de radio buttons de modalidad
  modalidadRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      modalidadCards.forEach(card => card.classList.remove("is-selected"));
      if (radio.checked) {
        radio.closest(".modality-card").classList.add("is-selected");
        clearError("modalidad");
      }
    });
  });

  // Manejo visual de checkboxes de momentos temáticos de interés
  const blockCheckboxes = document.querySelectorAll('input[name="bloquesInteres"]');
  blockCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const card = checkbox.closest(".block-interest-card");
      if (card) {
        if (checkbox.checked) {
          card.classList.add("is-selected");
        } else {
          card.classList.remove("is-selected");
        }
      }
    });
  });

  // 3. Limpieza de errores en tiempo real
  nombreInput.addEventListener("input", () => clearError("nombre"));
  apellidoInput.addEventListener("input", () => clearError("apellido"));
  profesionSelect.addEventListener("change", () => clearError("profesion"));
  emailInput.addEventListener("input", () => clearError("email"));

  // 4. Botones "Me interesa este contenido"
  const blockButtons = document.querySelectorAll(".btn-block-action");
  blockButtons.forEach(button => {
    button.addEventListener("click", () => {
      const blockTitle = button.getAttribute("data-block-id");
      const blockName = button.getAttribute("data-block-name") || "bloque 1";
      const checkboxId = button.getAttribute("data-checkbox-id");

      // Marcar el bloque de interés en el formulario
      if (checkboxId) {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
          checkbox.checked = true;
          const card = checkbox.closest(".block-interest-card");
          if (card) card.classList.add("is-selected");
        }
      }

      seleccionarBloque(blockTitle, blockName);
    });
  });

  resetBlockBtn.addEventListener("click", () => {
    bloqueInteresInput.value = "";
    selectedBlockBanner.classList.remove("active");
  });

  function seleccionarBloque(blockTitle, blockName) {
    bloqueInteresInput.value = blockTitle;
    selectedBlockText.textContent = `Participaré del ${blockName}`;
    selectedBlockBanner.classList.add("active");

    const formSection = document.getElementById("formulario-inscripcion");
    formSection.scrollIntoView({ behavior: "smooth", block: "start" });

    const firstRadio = document.getElementById("modalidad-virtual");
    if (firstRadio) {
      firstRadio.focus();
    }
  }

  // 5. Validaciones de formulario
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

    // Provincia
    if (!provinciaSelect.value) {
      showError("provincia", "Por favor, seleccione su provincia.");
      isValid = false;
    } else {
      clearError("provincia");
    }

    // Ciudad
    if (!ciudadSelect.value) {
      showError("ciudad", "Por favor, seleccione su ciudad o localidad.");
      isValid = false;
    } else {
      clearError("ciudad");
    }

    // Si eligió 'Otra localidad', validar campo de texto
    if (ciudadSelect.value === "Otra localidad") {
      if (!otraCiudadInput.value.trim() || otraCiudadInput.value.trim().length < 2) {
        showError("otra-ciudad", "Por favor, especifique el nombre de su localidad.");
        isValid = false;
      } else {
        clearError("otra-ciudad");
      }
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

  // 6. Envío de Formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    if (!validarFormulario()) {
      showAlert("Por favor, complete todos los campos requeridos correctamente.", "error");
      return;
    }

    const modalidadSeleccionada = document.querySelector('input[name="modalidad"]:checked').value;
    const ciudadFinal = ciudadSelect.value === "Otra localidad" 
      ? otraCiudadInput.value.trim() 
    // Momentos temáticos seleccionados
    const bloquesChecked = Array.from(
      document.querySelectorAll('input[name="bloquesInteres"]:checked')
    ).map(cb => cb.value);

    const bloqueInteresResumen = bloquesChecked.length > 0 
      ? bloquesChecked.join(" | ") 
      : (bloqueInteresInput.value || "Todas las Jornadas (General)");

    const datosInscripcion = {
      modalidadAsistencia: modalidadSeleccionada,
      nombre: nombreInput.value.trim(),
      apellido: apellidoInput.value.trim(),
      profesionOcupacion: profesionSelect.value,
      correoElectronico: emailInput.value.trim().toLowerCase(),
      provincia: provinciaSelect.value,
      ciudad: ciudadFinal,
      bloquesInteres: bloquesChecked.length > 0 ? bloquesChecked : ["Todas las Jornadas (General)"],
      bloqueInteres: bloqueInteresResumen
    };

    setLoadingState(true);

    try {
      const registrationId = await guardarInscripcion(datosInscripcion);

      // Mostrar modal de éxito
      mostrarModalExito(datosInscripcion, registrationId);

      // Limpiar formulario
      form.reset();
      ciudadSelect.innerHTML = '<option value="" disabled selected>Primero seleccione una provincia</option>';
      ciudadSelect.disabled = true;
      otraCiudadGroup.style.display = "none";
      modalidadCards.forEach(card => card.classList.remove("is-selected"));
      blockCheckboxes.forEach(cb => {
        cb.checked = false;
        const card = cb.closest(".block-interest-card");
        if (card) card.classList.remove("is-selected");
      });
      bloqueInteresInput.value = "";
      selectedBlockBanner.classList.remove("active");
    } catch (error) {
      console.error("[CEMNPA] Error al registrar la confirmación:", error);
      showAlert(
        "Ocurrió un error al procesar su confirmación. Por favor, verifique su conexión e intente nuevamente.",
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
      submitBtn.querySelector(".btn-text").textContent = "Procesando confirmación...";
    } else {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      submitBtn.querySelector(".btn-text").textContent = "Participaré";
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
    let bloqueNombre = "BLOQUE 1";

    if (datos.bloquesInteres && datos.bloquesInteres.length > 0) {
      const match = datos.bloquesInteres[0].match(/Bloque\s*\d+/i);
      if (match) {
        bloqueNombre = match[0].toUpperCase();
      }
    } else if (bloqueInteresInput.value) {
      const match = bloqueInteresInput.value.match(/Bloque\s*\d+/i);
      if (match) {
        bloqueNombre = match[0].toUpperCase();
      }
    }

    const modalTitleEl = document.getElementById("modalTitle");
    if (modalTitleEl) {
      modalTitleEl.textContent = `Inscripción registrada ${bloqueNombre}`;
    }

    if (modalSummary) {
      modalSummary.style.display = "none";
      modalSummary.innerHTML = "";
    }

    confirmationModal.classList.add("active");
  }

  modalCloseBtn.addEventListener("click", () => {
    confirmationModal.classList.remove("active");
  });

  confirmationModal.addEventListener("click", (e) => {
    if (e.target === confirmationModal) {
      confirmationModal.classList.remove("active");
    }
  });
});
