document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");

  form.addEventListener("submit", (e) => {
    const email = form.querySelector("input[name='usuario']").value.trim();
    const password = form.querySelector("input[name='contraseña']").value.trim();

    if (!email || !password) {
      e.preventDefault();
      alert("Por favor completa todos los campos.");
    }
  });
});
