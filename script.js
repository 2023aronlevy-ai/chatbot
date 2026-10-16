// Referencias a las secciones exactas definidas en la interfaz y el boceto// Elementos de la interfaz según boceto y HTML
const areaDeChat = document.getElementById('area-de-chat');
const seleccionDeOpciones = document.getElementById('seleccion-de-opciones');
const campoTexto = document.getElementById('campo-texto');
const botonEnviar = document.getElementById('boton-enviar');
const formularioIngreso = document.getElementById('formulario-ingreso');
const errorMensaje = document.getElementById('error-mensaje');

// Estado interno
let arbolDecision = {};
let nodoActual = null;
let eleccionGuardada = "";

// Función asíncrona para la carga del JSON compatible con GitHub Pages y servidores locales
async function cargarArbol() {
  try {
    const response = await fetch('./arbol_decision.json');
    if (!response.ok) {
      throw new Error(`Estado de respuesta HTTP: ${response.status}`);
    }
    arbolDecision = await response.json();
    irANodo('inicio');
  } catch (error) {
    console.error("Error al cargar arbol_decision.json:", error);
    mostrarMensajeBot("Abrí el proyecto con Live Server o un servidor local para que pueda leer arbol_decision.json");
  }
}

// Iniciar la carga
cargarArbol();

// Navega e interactúa con un nodo específico
function irANodo(nodeId) {
  nodoActual = arbolDecision[nodeId];

  if (!nodoActual) {
    console.error(`El nodo '${nodeId}' no existe en el JSON.`);
    return;
  }

  // Reemplazo dinámico de variables en el texto
  let textoBot = nodoActual.texto.replace('{eleccion}', eleccionGuardada);
  mostrarMensajeBot(textoBot);

  limpiarOpciones();
  desactivarInput();

  if (nodoActual.requiereInput) {
    activarInput(nodoActual.validacion);
  } else if (nodoActual.opciones) {
    generarBotonesOpciones(nodoActual.opciones);
  }
}

function mostrarMensajeBot(texto) {
  const divMsg = document.createElement('div');
  divMsg.classList.add('mensaje', 'bot');
  divMsg.textContent = texto;
  areaDeChat.appendChild(divMsg);
  scrollAlFinal();
}

function mostrarMensajeUsuario(texto) {
  const divMsg = document.createElement('div');
  divMsg.classList.add('mensaje', 'usuario');
  divMsg.textContent = texto;
  areaDeChat.appendChild(divMsg);
  scrollAlFinal();
}

function generarBotonesOpciones(opciones) {
  opciones.forEach(opcion => {
    const btn = document.createElement('button');
    btn.classList.add('btn-opcion');
    btn.textContent = opcion.texto;

    btn.addEventListener('click', () => {
      mostrarMensajeUsuario(opcion.texto);

      if (opcion.guardarEleccion) {
        eleccionGuardada = opcion.texto;
      }

      if (opcion.siguiente === 'inicio') {
        eleccionGuardada = "";
      }

      irANodo(opcion.siguiente);
    });

    seleccionDeOpciones.appendChild(btn);
  });
}

function activarInput(tipoValidacion) {
  campoTexto.disabled = false;
  botonEnviar.disabled = false;
  campoTexto.focus();
  campoTexto.placeholder = tipoValidacion === 'nombre' ? "Ingresa tu nombre..." : "Escribe tu respuesta...";
}

function desactivarInput() {
  campoTexto.disabled = true;
  botonEnviar.disabled = true;
  campoTexto.value = "";
  campoTexto.placeholder = "Escribe tu respuesta...";
  errorMensaje.textContent = "";
}

formularioIngreso.addEventListener('submit', (e) => {
  e.preventDefault();
  const valor = campoTexto.value.trim();
  const tipoValidacion = nodoActual.validacion;

  if (!valor) {
    errorMensaje.textContent = "Por favor ingresa un dato.";
    return;
  }

  if (tipoValidacion === 'nombre') {
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regexNombre.test(valor)) {
      errorMensaje.textContent = "El nombre no debe contener números ni caracteres especiales.";
      return;
    }
  }

  errorMensaje.textContent = "";
  mostrarMensajeUsuario(valor);

  if (nodoActual.guardarVariable) {
    eleccionGuardada = valor;
  }

  const siguienteNodo = nodoActual.siguiente;
  desactivarInput();
  irANodo(siguienteNodo);
});

function scrollAlFinal() {
  areaDeChat.scrollTop = areaDeChat.scrollHeight;
}

function limpiarOpciones() {
  seleccionDeOpciones.innerHTML = "";
}
