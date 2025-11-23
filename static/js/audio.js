document.addEventListener('DOMContentLoaded', () => {
  const link = document.getElementById('nosotros-link');
  const audio = document.getElementById('audio-nosotros');

  if (link && audio) {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // evita redirección inmediata
      audio.play().then(() => {
        // espera 500ms y luego redirige
        setTimeout(() => {
          window.location.href = link.href;
        }, 500);
      }).catch(err => {
        console.warn("Audio bloqueado:", err);
        // Redirige igual si falla
        window.location.href = link.href;
      });
    });
  }
});
