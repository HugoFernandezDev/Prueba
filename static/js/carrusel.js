document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("slider");
  const slides = document.querySelectorAll(".slide");
  const indicators = document.querySelectorAll(".indicator");
  const prevBtn = document.querySelector(".slider-button.prev");
  const nextBtn = document.querySelector(".slider-button.next");

  let currentIndex = 0;
  let slideInterval;
  const slideCount = slides.length;

  function updateSliderPosition() {
    const slideWidth = slides[0].clientWidth;
    slider.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    updateIndicators();
  }

  function updateIndicators() {
    indicators.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = (index + slideCount) % slideCount;
    updateSliderPosition();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Eventos botones
  nextBtn.addEventListener("click", () => {
    nextSlide();
    restartAutoSlide();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    restartAutoSlide();
  });

  // Indicadores clic
  indicators.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToSlide(index);
      restartAutoSlide();
    });
  });

  // Auto Slide
  function startAutoSlide() {
    slideInterval = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function restartAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
  }

  window.addEventListener("resize", () => {
    updateSliderPosition();
  });

  // Iniciar
  updateSliderPosition();
  startAutoSlide();
});
