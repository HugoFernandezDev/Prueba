document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica del Carrusel (Existente) ---
    const carousel = document.getElementById('carousel');
    
    // Si el carrusel no existe, salimos
    if (!carousel) return; 

    const items = carousel.querySelectorAll('.carousel-item');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotIndicators = document.getElementById('dotIndicators');
    
    // Asegúrate de que hay ítems para prevenir errores
    if (items.length === 0 || !dotIndicators) {
        console.error("Carrusel no inicializado: Faltan elementos DOM o imágenes.");
        return;
    }
    
    let currentIndex = 0;
    let intervalId;
    const slideDuration = 5000; // 5 segundos

    // 1. Mostrar un ítem
    function showItem(index) {
        // Quitar 'active' y 'fade-in' de todos
        items.forEach(item => {
            item.classList.remove('active', 'fade-in');
        });

        // Añadir 'active' y 'fade-in' al ítem actual
        items[index].classList.add('active', 'fade-in');
        updateIndicators(index);
    }

    // 2. Navegar al siguiente/anterior
    function navigate(direction) {
        // Detener el carrusel temporalmente para el cambio manual
        clearInterval(intervalId);
        
        // Módulo para asegurar que el índice se envuelva correctamente
        currentIndex = (currentIndex + direction + items.length) % items.length;
        showItem(currentIndex);
        
        // Reiniciar el carrusel automático
        startCarousel();
    }

    // 3. Generar y actualizar los indicadores (puntos)
    function updateIndicators(activeIndex) {
        dotIndicators.innerHTML = ''; // Limpiar indicadores anteriores
        items.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('w-3', 'h-3', 'rounded-full', 'mx-1', 'transition', 'duration-300', 'focus:outline-none');
            
            // Clases según si es el punto activo (usando las clases de Tailwind y primary)
            if (index === activeIndex) {
                dot.classList.add('bg-primary', 'shadow-md', 'scale-110');
            } else {
                dot.classList.add('bg-white', 'bg-opacity-50', 'hover:bg-opacity-75');
            }

            // Navegación al hacer click en el punto
            dot.addEventListener('click', () => {
                clearInterval(intervalId);
                currentIndex = index;
                showItem(currentIndex);
                startCarousel();
            });

            dotIndicators.appendChild(dot);
        });
    }

    // 4. Iniciar la transición automática
    function startCarousel() {
        intervalId = setInterval(() => {
            navigate(1); // Mover al siguiente
        }, slideDuration);
    }

    // 5. Inicialización del Carrusel
    if (nextBtn && prevBtn) {
        // Event Listeners para botones de control
        nextBtn.addEventListener('click', () => navigate(1));
        prevBtn.addEventListener('click', () => navigate(-1));
    }
    
    // Mostrar el primer ítem e iniciar el carrusel
    showItem(currentIndex);
    startCarousel();

    // --- 6. Lógica del Menú Móvil (Existente) ---
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuButton.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
        
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuButton.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // --- 7. Lógica de Cambio de Estilo en el Navbar al hacer Scroll (Estilo Pastilla) ---
    const mainNav = document.getElementById('mainNav');
    const navLogo = document.getElementById('navLogo');
    const logoText = document.getElementById('logoText');
    const loginButton = document.getElementById('loginButton');
    
    // Links de navegación de escritorio
    const desktopLinks = [
        document.getElementById('nav-inicio'),
        document.getElementById('nav-nosotros'),
        document.getElementById('nav-menu'),
        document.getElementById('nav-contacto')
    ].filter(el => el != null); 
    
    // Contenedor de enlaces (para el padding especial de la pastilla)
    const navContainer = mainNav.querySelector('.container');

    if (mainNav) {
        window.addEventListener('scroll', () => {
            // Umbral de 1 píxel para cambiar inmediatamente al hacer scroll
            const scrollThreshold = 1; 

            if (window.scrollY > scrollThreshold) {
                // ESTADO SCROLLED: Navbar Pastilla Negra
                
                // 1. Estilo Contenedor Principal (La Pastilla)
                // CLAVE: Se añade el bg-secondary aquí para darle fondo
                mainNav.classList.remove('bg-transparent', 'shadow-none', 'py-4', 'top-0');
                mainNav.classList.add('bg-secondary', 'shadow-2xl', 'rounded-full', 'max-w-max', 'mx-auto', 'md:mx-auto', 'top-4', 'md:top-6');
                
                // 2. Estilo Contenedor de Links (Ajuste interno)
                navContainer.classList.remove('px-4', 'py-4');
                navContainer.classList.add('py-2', 'px-6', 'md:px-8', 'space-x-4');
                
                // 3. Logo/Ícono
                if (navLogo) {
                    navLogo.classList.add('text-white');
                    navLogo.classList.remove('text-primary');
                }
                if (logoText) {
                    logoText.classList.remove('hidden'); // Mostrar el texto del logo
                }

                // 4. Links de Navegación
                desktopLinks.forEach(link => {
                    link.classList.remove('text-white', 'hover:text-primary', 'font-medium');
                    link.classList.add('text-gray-200', 'hover:text-white', 'font-light');
                });
                
                // 5. Botón de Sesión (Estilo Contraste)
                if (loginButton) {
                    loginButton.classList.remove('bg-white', 'text-secondary', 'shadow-md', 'hover:bg-gray-200');
                    loginButton.classList.add('bg-primary', 'text-secondary', 'shadow-lg', 'hover:bg-yellow-400');
                }
                
            } else {
                // ESTADO INICIAL: Navbar Transparente
                
                // 1. Estilo Contenedor Principal (Vuelve a ser transparente y ocupa todo el ancho)
                mainNav.classList.remove('bg-secondary', 'shadow-2xl', 'rounded-full', 'max-w-max', 'mx-auto', 'md:mx-auto', 'top-4', 'md:top-6');
                mainNav.classList.add('bg-transparent', 'shadow-none', 'py-4', 'top-0');
                
                // 2. Estilo Contenedor de Links (Restaurar)
                navContainer.classList.remove('py-2', 'px-6', 'md:px-8', 'space-x-4');
                navContainer.classList.add('px-4', 'py-4'); // Restaurar padding

                // 3. Logo/Ícono (Solo el ícono grande)
                if (navLogo) {
                    navLogo.classList.remove('text-white');
                    navLogo.classList.add('text-primary'); // Restaurar color inicial del ícono
                }
                if (logoText) {
                    logoText.classList.add('hidden'); // Ocultar el texto del logo
                }
                
                // 4. Links de Navegación
                desktopLinks.forEach(link => {
                    link.classList.remove('text-gray-200', 'font-light');
                    link.classList.add('text-white', 'hover:text-primary', 'font-medium');
                });

                // 5. Botón de Sesión (Estilo inicial blanco con texto secondary)
                if (loginButton) {
                    loginButton.classList.remove('bg-primary', 'text-secondary', 'shadow-lg', 'hover:bg-yellow-400');
                    loginButton.classList.add('bg-white', 'text-secondary', 'shadow-md', 'hover:bg-gray-200');
                }
            }
        });
        
        // Ejecutar el listener una vez al cargar para establecer el estado inicial correcto
        window.dispatchEvent(new Event('scroll'));
    }
});