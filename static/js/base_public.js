// Inicializar Lucide Icons
lucide.createIcons();

// Obtener año actual para el footer (usando JS como alternativa a pasar 'now()' desde Flask)
// No es estrictamente necesario si usamos now() en Jinja, pero es buena práctica de JS

// Manejo del Dropdown del usuario logueado
const userMenuButton = document.getElementById("user-menu-button");
const userMenu = document.getElementById("user-menu");

if (userMenuButton) {
  userMenuButton.addEventListener("click", () => {
    const isExpanded =
      userMenuButton.getAttribute("aria-expanded") === "true" || false;
    userMenuButton.setAttribute("aria-expanded", !isExpanded);
    userMenu.classList.toggle("hidden");
  });

  // Cerrar menú al hacer click fuera
  document.addEventListener("click", (event) => {
    if (
      userMenu &&
      !userMenu.contains(event.target) &&
      !userMenuButton.contains(event.target)
    ) {
      userMenu.classList.add("hidden");
      userMenuButton.setAttribute("aria-expanded", "false");
    }
  });
}
