document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formContacto");

  // Es buena idea mantener el mensaje de confirmación 
  // por si acaso, aunque ahora lo manejará Flask.
  const mensajeConfirmacion = document.getElementById("mensajeConfirmacion");

  form.addEventListener("submit", (e) => {
    
    // Obtenemos los valores
    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const mensaje = form.mensaje.value.trim();

    // --- ESTA ES LA LÓGICA CORREGIDA ---

    // 1. Validación del lado del cliente
    if (!nombre || !correo || !mensaje) {
      // Si algo falta, AHORA SÍ detenemos el envío
      e.preventDefault(); 
      alert("Por favor completa todos los campos.");
      return;
    }
  });
});
