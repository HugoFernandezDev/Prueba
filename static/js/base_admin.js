lucide.createIcons();

const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");
const body = document.body;

function updateSidebarState() {
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  if (isDesktop) {
    // Escritorio: siempre abierto, sin overlay, sin scrolllock
    sidebar.classList.remove("sidebar-closed");
    sidebar.classList.add("sidebar-open");
    overlay.classList.remove("overlay-active");
    body.style.overflow = "";
  } else {
    // Móvil: cerrado por defecto
    if (!sidebar.classList.contains("sidebar-open")) {
      sidebar.classList.remove("sidebar-open");
      sidebar.classList.add("sidebar-closed");
      overlay.classList.remove("overlay-active");
      body.style.overflow = "";
    }
  }
}

if (sidebarToggle && sidebar && overlay) {
  updateSidebarState(); // Inicializar estado

  // Toggle al hacer click en el botón del menú
  sidebarToggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("sidebar-closed"); // Devuelve true si la clase está AHORA AUSENTE
    sidebar.classList.toggle("sidebar-open");
    overlay.classList.toggle("overlay-active");

    // Bloquear scroll en móvil cuando el menú está abierto
    const isMobile = !window.matchMedia("(min-width: 768px)").matches;
    if (isMobile && sidebar.classList.contains("sidebar-open")) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = "";
    }
  });

  // Cerrar menú al hacer click en el overlay o dentro del sidebar (enlaces)
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("sidebar-open");
    sidebar.classList.add("sidebar-closed");
    overlay.classList.remove("overlay-active");
    body.style.overflow = "";
  });

  // Cerrar menú después de hacer click en un enlace (móvil)
  const navLinks = sidebar.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const isMobile = !window.matchMedia("(min-width: 768px)").matches;
      if (isMobile) {
        setTimeout(() => {
          // Pequeño retraso para permitir la navegación
          sidebar.classList.remove("sidebar-open");
          sidebar.classList.add("sidebar-closed");
          overlay.classList.remove("overlay-active");
          body.style.overflow = "";
        }, 100);
      }
    });
  });

  // Ajustar en resize
  window.addEventListener("resize", updateSidebarState);
}
