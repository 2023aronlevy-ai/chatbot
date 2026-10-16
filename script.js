// Referencias a las secciones exactas definidas en la interfaz y el boceto
const areaDeChat = document.getElementById('area-de-chat');
const seleccionDeOpciones = document.getElementById('seleccion-de-opciones');
const campoTexto = document.getElementById('campo-texto');
const botonEnviar = document.getElementById('boton-enviar');
const formularioIngreso = document.getElementById('formulario-ingreso');
const errorMensaje = document.getElementById('error-mensaje');

// Variables globales de estado del chat
let arbolDecision = {};
let nodoActual = null;
let eleccionGuardada = ""; // Memoria simple para recordar la selección del usuario

// Carga inicial del archivo JSON mediante fetch
fetch('arbol_decision.json')
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo cargar el archivo");
    }
    return response.json();
  })
  .then(data => {
    arbolDecision = data;
    // Iniciar conversación desde el nodo 'inicio'
    irANodo('inicio');
  })
  .catch(error => {
    // Manejo explícito de error si se abre por doble clic sin servidor local
    mostrarMensajeBot("Abrí el proyecto con Live Server o un servidor local para que pueda leer arbol_decision.json");
    console.error("Error al cargar JSON:", error);
  });

// Función para procesar y renderizar un nodo específico del árbol
function irANodo(nodeId) {
  nodoActual = arbolDecision[nodeId];

  if (!nodoActual) {
    console.error(`El nodo con id '${nodeId}' no existe.`);
    return;
  }

  // Reemplazar la variable personalizada si existe en el texto (ej. {eleccion})
  let textoBot = nodoActual.texto.replace('{eleccion}', eleccionGuardada);
  mostrarMensajeBot(textoBot);

  // Limpiar controles previos
  limpiarOpciones();
  desactivarInput();

  // Configurar modo de interacción según el tipo de nodo (Botones vs Input)
  if (nodoActual.requiereInput) {
    activarInput(nodoActual.validacion);
  } else {
    generarBotonesOpciones(nodoActual.opciones);
  }
}

// Muestra el mensaje enviado por el bot en el área de chat
function mostrarMensajeBot(texto) {
  const divMsg = document.createElement('div');
  divMsg.classList.add('mensaje', 'bot');
  divMsg.textContent = texto;
  areaDeChat.appendChild(divMsg);
  scrollAlFinal();
}

// Muestra el mensaje del usuario en el área de chat
function mostrarMensajeUsuario(texto) {
  const divMsg = document.createElement('div');
  divMsg.classList.add('mensaje', 'usuario');
  divMsg.textContent = texto;
  areaDeChat.appendChild(divMsg);
  scrollAlFinal();
}

// Genera dinámicamente las opciones de respuesta por botones
function generarBotonesOpciones(opciones) {
  if (!opciones || opciones.length === 0) return;

  opciones.forEach(opcion => {
    const btn = document.createElement('button');
    btn.classList.add('btn-opcion');
    btn.textContent = opcion.texto;

    btn.addEventListener('click', () => {
      mostrarMensajeUsuario(opcion.texto);

      // Guardar elección si la opción lo solicita
      if (opcion.guardarEleccion) {
        eleccionGuardada = opcion.texto;
      }

      // Reiniciar memoria si vuelve al inicio o termina
      if (opcion.siguiente === 'inicio') {
        eleccionGuardada = "";
      }

      irANodo(opcion.siguiente);
    });

    seleccionDeOpciones.appendChild(btn);
  });
}

// Habilita el campo de entrada cuando es imperioso solicitar un dato
function activarInput(tipoValidacion) {
  campoTexto.disabled = false;
  botonEnviar.disabled = false;
  campoTexto.focus();
  campoTexto.placeholder = tipoValidacion === 'nombre' ? "Ingresá tu nombre..." : "Ingresá un valor...";
}

// Deshabilita el área de ingreso de texto
function desactivarInput() {
  campoTexto.disabled = true;
  botonEnviar.disabled = true;
  campoTexto.value = "";
  campoTexto.placeholder = "Escribí aquí...";
  errorMensaje.textContent = "";
}

// Manejador del formulario de ingreso de datos
formularioIngreso.addEventListener('submit', (e) => {
  e.preventDefault();
  const valor = campoTexto.value.trim();
  const tipoValidacion = nodoActual.validacion;

  // Validaciones del dato ingresado
  if (!valor) {
    errorMensaje.textContent = "Por favor ingresá un dato.";
    return;
  }

  if (tipoValidacion === 'nombre') {
    // Verifica que solo contenga letras y espacios (sin números)
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regexNombre.test(valor)) {
      errorMensaje.textContent = "El nombre no debe contener números ni símbolos.";
      return;
    }
  }

  // Si pasa la validación
  errorMensaje.textContent = "";
  mostrarMensajeUsuario(valor);

  // Guardar nombre si aplica
  if (nodoActual.guardarVariable) {
    eleccionGuardada = valor;
  }

  const siguienteNodo = nodoActual.siguiente;
  desactivarInput();
  irANodo(siguienteNodo);
});

// Desplazamiento automático al final del área de chat
function scrollAlFinal() {
  areaDeChat.scrollTop = areaDeChat.scrollHeight;
}

// Limpia los botones de opciones generados anteriormente
function limpiarOpciones() {
  seleccionDeOpciones.innerHTML = "";
}
