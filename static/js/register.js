// static/js/register.js
document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("logoAnim");
  const form = document.getElementById("registerForm");
  const loader = document.getElementById("loader");
  const submitBtn = form ? form.querySelector("button[type='submit']") : null;

  // --- Helper: apply a style safely ---
  const setStyle = (el, styles = {}) => {
    if (!el) return;
    Object.keys(styles).forEach(k => el.style[k] = styles[k]);
  };

  // --- Inicial: preparar estados para animaciones ---
  if (logo) {
    setStyle(logo, {
      opacity: "0",
      transform: "scale(0.8)",
      transition: "transform 0.6s ease, opacity 0.6s ease"
    });
  }

  if (form) {
    setStyle(form, {
      opacity: "0",
      transform: "translateY(20px)",
      transition: "transform 0.7s ease, opacity 0.7s ease"
    });
  }

  // (Opcional) preparar loader para animación de fade
  if (loader) {
    // Aseguramos que el loader esté oculto pero preparado para fade
    loader.classList.add("hidden");
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.25s ease";
  }

  // Forzar repaint antes de animar (garantiza la transición)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (logo) {
        logo.style.opacity = "1";
        logo.style.transform = "scale(1)";
      }
      if (form) {
        form.style.opacity = "1";
        form.style.transform = "translateY(0)";
      }
    });
  });

  // --- Evento submit: mostrar loader con fade y bloquear botón ---
  if (form) {
    form.addEventListener("submit", (e) => {
      // Mostrar loader (removemos 'hidden' y hacemos fade-in)
      if (loader) {
        loader.classList.remove("hidden");
        // small delay to allow removal of hidden to take effect, then fade
        requestAnimationFrame(() => {
          loader.style.opacity = "1";
        });
      }

      // Desactivar el botón para evitar doble envío
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-50", "cursor-not-allowed");
      }
  })
}
});
