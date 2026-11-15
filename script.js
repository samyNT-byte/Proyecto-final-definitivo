// Las solicitudes se guardan aquí mientras no recargues la página.
let solicitudes = [];

// Indica si el administrador entró a la demostración.
let administrador = false;


// 1. Cambiar de sección
function mostrar(id) {
  let secciones = document.querySelectorAll("main section");

  for (let i = 0; i < secciones.length; i++) {
    secciones[i].classList.add("oculto");
  }

  document.getElementById(id).classList.remove("oculto");

  if (id === "admin" && administrador) {
    verSolicitudes();
  }
}


// 2. Elegir un servicio desde una tarjeta
function elegirServicio(nombreServicio) {
  document.getElementById("servicio").value = nombreServicio;
  mostrar("cotizar");
}


// 3. Recomendar según las casillas marcadas
function recomendar() {
  let mudanza = document.getElementById("quiereMudanza").checked;
  let aseo = document.getElementById("quiereAseo").checked;
  let texto = document.getElementById("recomendacion");

  if (mudanza && aseo) {
    texto.textContent = "Te recomendamos Departamento listo.";
    document.getElementById("servicio").value = "Departamento listo";
  } else if (mudanza) {
    texto.textContent = "Te recomendamos Mudanza residencial.";
    document.getElementById("servicio").value = "Mudanza residencial";
  } else if (aseo) {
    texto.textContent = "Te recomendamos Aseo profundo.";
    document.getElementById("servicio").value = "Aseo profundo";
  } else {
    texto.textContent = "Marca si necesitas mudanza, aseo o ambos.";
  }
}


// 4. Guardar una solicitud en Firestore
async function enviarSolicitud(evento) {
  evento.preventDefault();

  let nombre = document.getElementById("nombre").value.trim();
  let telefono = document.getElementById("telefono").value.trim();
  let servicio = document.getElementById("servicio").value;
  let mensaje = document.getElementById("mensaje");

  if (nombre === "" || telefono === "") {
    mensaje.style.color = "#b42318";
    mensaje.textContent = "Escribe tu nombre y teléfono.";
    return;
  }

  mensaje.textContent = "Enviando solicitud...";

  try {
    await db.collection("solicitudes").add({
      nombre: nombre,
      telefono: telefono,
      servicio: servicio,
      estado: "Pendiente",
      fecha: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (fallo) {
    console.error("Error al guardar:", fallo);
    mensaje.style.color = "#b42318";
    mensaje.textContent = "No se pudo guardar: " + fallo.code;
    return;
  }

  mensaje.style.color = "#166534";
  mensaje.textContent = "Solicitud guardada correctamente.";

  document.getElementById("formulario").reset();
  document.getElementById("recomendacion").textContent = "";
}


// 5. Entrar al panel de demostración
async function entrar(evento) {
  evento.preventDefault();

  let correo = document.getElementById("correo").value.trim();
  let clave = document.getElementById("clave").value;
  let error = document.getElementById("error");

  try {
    await auth.signInWithEmailAndPassword(correo, clave);
  } catch (fallo) {
    console.error("ERROR DE LOGIN:", fallo.code, fallo.message);
    error.textContent = fallo.code || fallo.message;
    return;
  }


  administrador = true;
  error.textContent = "";

  document.getElementById("login").classList.add("oculto");
  document.getElementById("panel").classList.remove("oculto");
  document.getElementById("clave").value = "";

  verSolicitudes();
}


// 6. Mostrar las solicitudes guardadas
function verSolicitudes() {
  if (!administrador) {
    return;
  }

  let lista = document.getElementById("lista");
  lista.textContent = "Cargando solicitudes...";

  db.collection("solicitudes")
    .orderBy("fecha", "desc")
    .get()
    .then(function (consulta) {
      lista.textContent = "";

      if (consulta.empty) {
        lista.textContent = "Todavía no hay solicitudes.";
        return;
      }

      consulta.forEach(function (documento) {
        let solicitud = documento.data();

        let tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        let nombre = document.createElement("h3");
        nombre.textContent = solicitud.nombre;

        let telefono = document.createElement("p");
        telefono.textContent = "Teléfono: " + solicitud.telefono;

        let servicio = document.createElement("p");
        servicio.textContent = "Servicio: " + solicitud.servicio;

        let estado = document.createElement("p");
        estado.textContent = "Estado: " + solicitud.estado;
        let botones = document.createElement("div");
botones.className = "botones-estado";

let botonPendiente = document.createElement("button");
botonPendiente.textContent = "Pendiente";
botonPendiente.onclick = function () {
  cambiarEstado(documento.id, "Pendiente");
};

let botonProceso = document.createElement("button");
botonProceso.textContent = "En proceso";
botonProceso.onclick = function () {
  cambiarEstado(documento.id, "En proceso");
};

let botonCompletada = document.createElement("button");
botonCompletada.textContent = "Completada";
botonCompletada.onclick = function () {
  cambiarEstado(documento.id, "Completada");
};

botones.appendChild(botonPendiente);
botones.appendChild(botonProceso);
botones.appendChild(botonCompletada);


        tarjeta.appendChild(nombre);
        tarjeta.appendChild(telefono);
        tarjeta.appendChild(servicio);
        tarjeta.appendChild(estado);
        tarjeta.appendChild(botones);
        lista.appendChild(tarjeta);
      });
    })
    .catch(function (error) {
      lista.textContent = "No se pudieron cargar las solicitudes.";
      console.log(error);
    });
}


// 7. Salir del panel de demostración
function cambiarEstado(id, nuevoEstado) {
  if (!administrador) {
    return;
  }

  db.collection("solicitudes")
    .doc(id)
    .update({
      estado: nuevoEstado
    })
    .then(function () {
      verSolicitudes();
    })
    .catch(function (error) {
      alert("No se pudo cambiar el estado.");
      console.log(error);
    });
}

function salir() {
  administrador = false;

  document.getElementById("panel").classList.add("oculto");
  document.getElementById("login").classList.remove("oculto");
  document.getElementById("login").reset();
  document.getElementById("error").textContent = "";
  document.getElementById("lista").textContent = "";
}

function recomendarServicio() {
  const tipo = document.getElementById("tipoNecesidad").value;
  const tamano = document.getElementById("tamanoLugar").value;
  const resultado = document.getElementById("resultadoIA");

  if (tipo === "" || tamano === "") {
    resultado.innerHTML = `
      <p class="aviso">Selecciona las dos opciones para recibir una recomendación.</p>
    `;
    return;
  }

  let servicio = "";
  let explicacion = "";

  if (tipo === "mudanza") {
    servicio = "Servicio de mudanza";
    explicacion = "Nuestro equipo puede ayudarte a transportar tus pertenencias de forma organizada y segura.";
  } else if (tipo === "aseo") {
    servicio = "Aseo profundo";
    explicacion = "Realizamos una limpieza detallada para dejar tu espacio fresco, ordenado e higiénico.";
  } else {
    servicio = "Paquete Departamento listo";
    explicacion = "Es la mejor opción si quieres mudarte y recibir tu nuevo hogar completamente limpio.";
  }

  let equipo = "";

  if (tamano === "pequeno") {
    equipo = "Para un espacio pequeño, recomendamos un equipo reducido y un servicio ágil.";
  } else if (tamano === "mediano") {
    equipo = "Para un espacio mediano, recomendamos un equipo de dos personas y aproximadamente medio día de trabajo.";
  } else {
    equipo = "Para un espacio grande, recomendamos un equipo completo y coordinar el servicio con anticipación.";
  }

  resultado.innerHTML = `
    <h3>Servicio recomendado</h3>
    <p><strong>${servicio}</strong></p>
    <p>${explicacion}</p>
    <p>${equipo}</p>
  `;
}
