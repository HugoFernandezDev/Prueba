document.addEventListener("DOMContentLoaded", () => {



  /* =========================
     Botón "Ver Más" para scroll
  ============================ */
  const btnVerMas = document.getElementById('ver-mas');
  const siguienteSeccion = document.getElementById('especialidades');

  if (btnVerMas && siguienteSeccion) {
    btnVerMas.addEventListener('click', () => {
      siguienteSeccion.scrollIntoView({ behavior: 'smooth' });
    });
  }

})
