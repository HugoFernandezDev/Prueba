document.addEventListener('DOMContentLoaded', () => {
    // Parallax suave sobre la imagen del header (usa transform inline)
    const hero = document.getElementById('heroImage');
    if (hero) {
        const container = hero.closest('header') || document.body;
        let rafId = null;
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const tx = x * 8;
            const ty = y * 6;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                hero.style.transform = `translate(${tx}px, ${ty}px) scale(1.02)`;
                hero.style.transition = 'transform 160ms ease-out';
            });
        });
        container.addEventListener('mouseleave', () => {
            if (rafId) cancelAnimationFrame(rafId);
            hero.style.transform = 'translate(0,0) scale(1)';
            hero.style.transition = 'transform 300ms ease';
        });
    }

    // Pulse periódico en el botón de reserva (usa transform/transition inline, sin clases nuevas)
    const reserve = document.getElementById('reserveBtn');
    if (reserve) {
        const duration = 550; // ms
        let pulseTimeout;
        const triggerPulse = () => {
            reserve.style.transition = `transform ${duration}ms cubic-bezier(.4,0,.2,1)`;
            reserve.style.transform = 'scale(1.04)';
            clearTimeout(pulseTimeout);
            pulseTimeout = setTimeout(() => {
                reserve.style.transform = 'scale(1)';
            }, duration);
        };
        const intervalId = setInterval(triggerPulse, 4200);
        reserve.addEventListener('mouseenter', triggerPulse);
        window.addEventListener('beforeunload', () => clearInterval(intervalId));
    }
});
