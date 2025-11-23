// contacto.js (solo animaciones disponibles en Tailwind)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formContacto");

  // Inputs
  const inputs = form.querySelectorAll("input, textarea, select");

  // --- ANIMACIÓN 1 (PROFESIONAL): Glow suave al hacer focus ---
  inputs.forEach((campo) => {
    campo.addEventListener("focus", () => {
      campo.classList.add("ring-2", "ring-amber-400", "shadow-md", "transition-all", "duration-200");
    });

    campo.addEventListener("blur", () => {
      campo.classList.remove("ring-2", "ring-amber-400", "shadow-md");
    });
  });

  // --- ANIMACIÓN 2 (PROFESIONAL): Micro-shake elegante para errores ---
  function animarError(campo) {
    campo.classList.add("animate-[shake_.3s_ease-in-out_1]", "border-red-500", "ring", "ring-red-400", "bg-red-50");

    setTimeout(() => {
      campo.classList.remove("animate-[shake_.3s_ease-in-out_1]", "border-red-500", "ring", "ring-red-400", "bg-red-50");
    }, 400);
  }

  // Animación CSS personalizada para shake suave (se inyecta en runtime)
  const estilo = document.createElement("style");
  estilo.innerHTML = `
    @keyframes shake {
      0% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      50% { transform: translateX(3px); }
      75% { transform: translateX(-3px); }
      100% { transform: translateX(0); }
    }
  `;
  document.head.appendChild(estilo);

  // --- ANIMACIÓN 2: efecto shake usando Tailwind (animate-bounce breve como simulación) ---
  function animarError(campo) {
    campo.classList.add("animate-bounce", "border-red-500", "ring", "ring-red-400");

    setTimeout(() => {
      campo.classList.remove("animate-bounce", "border-red-500", "ring", "ring-red-400");
    }, 600);
  }

  // --- ANIMACIÓN EXTRA 1: Fade-in del formulario ---
form.classList.add("opacity-0", "transition", "duration-700");
setTimeout(() => form.classList.remove("opacity-0"), 50);

// --- ANIMACIÓN EXTRA 2: Loader DOM al enviar ---
const loader = document.createElement("div");
loader.className = "fixed inset-0 bg-black/40 flex items-center justify-center z-50 hidden";
loader.innerHTML = `
  <div class='w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin'></div>
`;
document.body.appendChild(loader);

// Validaciones
  function obtenerRadioSeleccionado(nombre) {
    const opciones = form.querySelectorAll(`input[name="${nombre}"]`);
    for (const op of opciones) {
      if (op.checked) return op.value;
    }
    return null;
  }
  form.addEventListener("submit", (e) => {
    let valido = true;

    // Validación de nombre
    const nombreValor = form.nombre.value.trim();
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

    if (nombreValor === "" || !soloLetras.test(nombreValor)) {
      valido = false;
      animarError(form.nombre);
    }
    }

    // Validación de correo
    const correo = form.email.value.trim();
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      valido = false;
      animarError(form.email);
    }

    // Validación de plato favorito
if (form.plato.value.trim() === "") {
      valido = false;
      animarError(form.plato);
}

    // Validación de mensaje
    if (form.mensaje.value.trim() === "") {
      valido = false;
      animarError(form.mensaje);
    }

        // Validación de calificación (combo)
    if (!form.calificacion.value) {
      valido = false;
      animarError(form.calificacion);
    }

    // Validación de fecha
    if (!form.fecha.value.trim()) {
      valido = false;
      animarError(form.fecha);
    }

    // Validación de plato favorito
    if (form.plato.value.trim() === "") {
      valido = false;
      animarError(form.plato);
    }
    }

    // Validación de radio: ¿Nos recomendarías?
    const recomienda = obtenerRadioSeleccionado("recomienda");
    if (!recomienda) {
      valido = false;
      const radios = form.querySelectorAll("input[name='recomienda']");
      animarError(radios[0].parentElement);
    }

    // Mostrar loader si todo está OK
if (valido) {
      loader.classList.remove("hidden");
}

    // Detener si algo está mal
    if (!valido) {
      e.preventDefault();
    }
  });
});
