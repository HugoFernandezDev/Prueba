// Animaciones y comportamiento para la sección de contacto (#contacto, #contactanosForm)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactanosForm');
    const contacto = document.getElementById('contacto');
    const inputs = [
        document.getElementById('name'),
        document.getElementById('email'),
        document.getElementById('message')
    ].filter(Boolean);

    // Entrada suave del formulario (si ya visible)
    if (form) {
        form.style.opacity = '0';
        form.style.transform = 'translateY(12px)';
        form.style.transition = 'opacity 600ms ease, transform 600ms ease';
        requestAnimationFrame(() => {
            form.style.opacity = '1';
            form.style.transform = 'translateY(0)';
        });
    }

    // Efectos focus / blur en inputs
    inputs.forEach(el => {
        el.addEventListener('focus', () => {
            el.classList.add('scale-105', 'shadow-lg', 'ring-2', 'ring-yellow-300');
        });
        el.addEventListener('blur', () => {
            el.classList.remove('scale-105', 'shadow-lg', 'ring-2', 'ring-yellow-300');
        });
    });

    // Animar sección contacto al entrar en viewport
    if (contacto) {
        contacto.style.opacity = '0';
        contacto.style.transform = 'translateY(18px)';
        contacto.style.transition = 'opacity 700ms ease, transform 700ms ease';
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    contacto.style.opacity = '1';
                    contacto.style.transform = 'translateY(0)';
                    io.unobserve(contacto);
                }
            });
        }, { threshold: 0.18 });
        io.observe(contacto);
    }

    // Manejo de envío con animación y toast (simulado)
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalHTML = submitBtn ? submitBtn.innerHTML : null;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-70', 'cursor-wait', 'transform', 'scale-95');
                submitBtn.innerHTML = 'Enviando... <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></span>';
            }

            // Simular request (reemplazar por fetch real si se desea)
            setTimeout(() => {
                // Crear toast
                const toast = document.createElement('div');
                toast.className = 'fixed top-5 right-5 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                toast.style.opacity = '0';
                toast.innerText = 'Mensaje enviado. ¡Gracias!';
                document.body.appendChild(toast);
                requestAnimationFrame(() => toast.style.opacity = '1');

                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }, 2200);

                // Reset y restaurar botón
                form.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-70', 'cursor-wait', 'transform', 'scale-95');
                    submitBtn.innerHTML = originalHTML;
                }
            }, 1200);
        });
    }
});
