// static/js/carousel_logic.js
document.addEventListener('DOMContentLoaded', () => {
    // Referencia al contenedor del carrusel y las imágenes
    const carouselContainer = document.getElementById('heroCarousel');
    if (!carouselContainer) return; // Salir si el contenedor no existe

    const images = carouselContainer.querySelectorAll('.carousel-image');
    if (images.length < 2) return; // No es un carrusel si hay menos de 2 imágenes

    let currentIndex = 0;
    const intervalTime = 5000; // 5 segundos entre cada cambio de imagen

    // Función para mostrar la imagen actual y ocultar las demás
    function showImage(index) {
        // Asegura que el índice esté dentro del rango
        const nextIndex = index % images.length;
        
        images.forEach((img, i) => {
            if (i === nextIndex) {
                // Muestra la imagen (z-10 para estar al frente, opacidad 70%)
                img.classList.remove('opacity-0', 'z-0');
                img.classList.add('opacity-70', 'z-10');
            } else {
                // Oculta la imagen (z-0 para estar detrás, opacidad 0%)
                img.classList.remove('opacity-70', 'z-10');
                img.classList.add('opacity-0', 'z-0');
            }
        });
        currentIndex = nextIndex;
    }

    // Función principal para avanzar el carrusel
    function nextImage() {
        showImage(currentIndex + 1);
    }

    // Iniciar el carrusel y establecer el intervalo
    showImage(currentIndex); // Mostrar la primera imagen al cargar
    setInterval(nextImage, intervalTime);

});