document.addEventListener("DOMContentLoaded", () => {
  // Asegúrate de que tu formulario HTML tenga la clase 'login-form'
  // y los inputs tengan los atributos 'name' como 'usuario' y 'contraseña'.
  const form = document.querySelector(".login-form"); 
  
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // Previene el envío por defecto para la validación

      const emailInput = form.querySelector("input[name='usuario']");
      const passwordInput = form.querySelector("input[name='contraseña']");

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      let isValid = true;
      let errorMessage = "";

      // 1. Validar campos vacíos (como la validación original)
      if (!email || !password) {
        isValid = false;
        errorMessage += "Por favor, completa todos los campos.\n";
      }

      // 2. Validación del Correo Electrónico (Regex)
      // Esta regex es un estándar simple para correos: algo@algo.dominio
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

      if (isValid && !emailRegex.test(email)) {
        isValid = false;
        errorMessage += "El formato del correo electrónico no es válido.\n";
      }

      // 3. Validación de la Contraseña (Regex)
      // Ejemplo: Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

      if (isValid && !passwordRegex.test(password)) {
        // NOTA: En un formulario de *Inicio de Sesión*, lo mejor es dar 
        // un mensaje de error genérico para no dar pistas al atacante.
        // Solo para fines de *registro* se especificarían los requisitos.
        // Mantendré el mensaje genérico para seguridad:
        isValid = false;
        errorMessage += "El correo o la contraseña son incorrectos.\n"; 
        // Si fuera un formulario de REGISTRO, usarías: 
        // "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
      }

      // --- Manejo del resultado ---

      if (isValid) {
        // Si todo es válido, puedes enviar el formulario manualmente
        // o ejecutar tu lógica de inicio de sesión (e.g., fetch API)
        alert("Iniciando sesión con:\nEmail: " + email + "\nContraseña: " + "*".repeat(password.length));
        
        // Descomenta la siguiente línea para enviar el formulario real
        // form.submit();
        
      } else {
        alert(errorMessage.trim());
      }
    });
  } else {
    console.error("No se encontró el formulario con la clase '.login-form'. Asegúrate de que exista en tu HTML.");
  }
});