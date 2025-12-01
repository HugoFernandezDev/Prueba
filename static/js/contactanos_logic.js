// --- CONFIGURACIÓN DE EMAILJS (REEMPLAZAR CON TUS DATOS REALES) ---
const SERVICE_ID = 'service_vza81bj'; 
const TEMPLATE_ID = 'template_oaajnvm';
const PUBLIC_KEY = 'iJYZ-Aek_eioVmdjM'; // (Ya inicializado en el HTML, pero es bueno tenerlo aquí también)
const DESTINATION_EMAIL = 'sanchezcoronadodeivy5@gmail.com'; // El correo al que se enviará.

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactanosForm');
    const statusMessage = document.getElementById('statusMessage');
    const enviarBtn = document.getElementById('enviarBtn');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // 1. Deshabilitar botón y mostrar carga
        enviarBtn.disabled = true;
        enviarBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 mr-2 animate-spin"></i> Enviando...';
        statusMessage.textContent = 'Enviando solicitud...';
        statusMessage.className = 'mt-4 text-center font-semibold text-blue-600';
        statusMessage.style.display = 'block';

        // 2. Recolectar datos del formulario
        const formData = new FormData(this);
        const templateParams = {
            from_name: formData.get('name'),
            from_email: formData.get('email'),
            message: formData.get('message'),
            to_email: DESTINATION_EMAIL, // Añadir el correo de destino al objeto
            reply_to: formData.get('email')
        };

        // 3. Enviar correo usando EmailJS
        emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
            .then(function (response) {
                // Éxito
                console.log('Correo Enviado con Éxito!', response.status, response.text);
                statusMessage.textContent = '✅ ¡Solicitud enviada con éxito! Te contactaremos pronto.';
                statusMessage.className = 'mt-4 text-center font-extrabold text-green-600 p-2 bg-green-50 rounded-lg';
                form.reset(); // Limpiar formulario
            }, function (error) {
                // Error
                console.error('FALLÓ EL ENVÍO DEL CORREO:', error);
                statusMessage.textContent = '❌ Error al enviar la solicitud. Inténtalo de nuevo más tarde.';
                statusMessage.className = 'mt-4 text-center font-extrabold text-red-600 p-2 bg-red-50 rounded-lg';
            })
            .finally(() => {
                // 4. Habilitar botón y restaurar icono
                enviarBtn.disabled = false;
                enviarBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5 mr-2"></i> Enviar Solicitud';
                
                // Asegurar que Lucide Icons se actualice si se cambió el icono
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
    });

    // Inicializar Lucide Icons en el resto de la página al cargar
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});