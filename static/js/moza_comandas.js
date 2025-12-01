// Obtener datos inyectados desde el template (valores por defecto si faltan)
const comandasActivas = window.comandasActivas || {};
const platosCarta = window.platosCarta || [];
const menuDelDia = (typeof window.menuDelDia !== 'undefined') ? window.menuDelDia : null;

// El script ahora se asume en un archivo separado, por lo que las variables de Jinja2 deben
// ser pasadas o estar disponibles globalmente (asumiendo que están disponibles en el DOM como se muestra en el HTML)

/**
 * UTILITIES
 */

// Abre un modal
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

// Cierra un modal
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    // Opcional: limpiar el formulario al cerrar el modal de nueva comanda
    if (id === 'newComandaModal') {
        document.getElementById('newComandaForm').reset();
        document.querySelectorAll('.quantity-input, .menu-input').forEach(input => {
            input.value = 0;
        });
        document.getElementById('comandaTotal').textContent = 'S/ 0.00';
    }
}

// Determina el color del estado para Tailwind.
function getStatusColor(mesaStatus, pedidoStatus) {
    if (pedidoStatus === 'listo_pago') return 'orange-600';
    if (pedidoStatus === 'abierto' || pedidoStatus === 'en_preparacion') return 'red-600';
    if (mesaStatus === 'disponible') return 'green-600';
    if (mesaStatus === 'reservada') return 'yellow-600';
    return 'gray-500'; // Default o inactiva
}

// Función personalizada para reemplazar alert()
function showCustomAlert(title, message, color) {
    console.log(`[${title} - ${color.toUpperCase()}]: ${message}`);
    const alertBox = document.createElement('div');
    alertBox.innerHTML = `
        <div id="customAlert" class="fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white z-[100]
                                     bg-${color}-600 border border-${color}-800 transition-opacity duration-300 opacity-0"
                                     style="min-width: 250px;">
            <p class="font-bold">${title}</p>
            <p class="text-sm">${message}</p>
        </div>
    `;
    document.body.appendChild(alertBox);

    setTimeout(() => {
        document.getElementById('customAlert').style.opacity = '1';
    }, 10);

    setTimeout(() => {
        const alert = document.getElementById('customAlert');
        if (alert) {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }
    }, 3000);
}


/**
 * GESTIÓN DE COMANDAS
 */

function calculateTotal() {
    let total = 0;
    let items = [];

    // 1. Platos a la carta
    document.querySelectorAll('.quantity-input').forEach(input => {
        const cantidad = parseInt(input.value) || 0;
        const precio = parseFloat(input.dataset.precio);
        const platoId = input.dataset.platoId;

        if (cantidad > 0) {
            total += cantidad * precio;
            items.push({
                plato_id: platoId,
                menu_id: null,
                cantidad: cantidad,
                precio: precio,
                tipo: 'plato_carta'
            });
        }
    });

    // 2. Menú del día
    document.querySelectorAll('.menu-input').forEach(input => {
        const cantidad = parseInt(input.value) || 0;
        const precio = parseFloat(input.dataset.precio);
        const menuId = input.dataset.menuId;

        if (cantidad > 0) {
            total += cantidad * precio;
            items.push({
                plato_id: null,
                menu_id: menuId,
                cantidad: cantidad,
                precio: precio,
                tipo: 'menu_dia'
            });
        }
    });

    document.getElementById('comandaTotal').textContent = 'S/ ' + total.toFixed(2);
    document.getElementById('itemsInput').value = JSON.stringify(items);
}

// Abre el modal de nueva comanda y resetea los valores
function openNewComandaModal() {
    document.getElementById('newComandaForm').reset();
    document.querySelectorAll('.quantity-input, .menu-input').forEach(input => {
        input.value = 0;
    });
    document.getElementById('comandaTotal').textContent = 'S/ 0.00';
    document.getElementById('modal_mesa_id').value = "";
    openModal('newComandaModal');
}

// Abre el modal de nueva comanda y preselecciona la mesa.
function openNewComandaModalForTable(mesaId) {
    openNewComandaModal();
    // Asegurarse de que el <select> del modal de comanda se actualice
    const mesaSelect = document.getElementById('modal_mesa_id');
    if (mesaSelect) {
        mesaSelect.value = mesaId;
    }
    closeModal('detailsModal');
}

// Valida y prepara la comanda antes de enviarla.
function prepareAndSubmitComanda(event) {
    calculateTotal(); // Asegura que el JSON esté actualizado

    const mesaId = document.getElementById('modal_mesa_id').value;
    const items = JSON.parse(document.getElementById('itemsInput').value);

    if (!mesaId) {
        showCustomAlert('Error', 'Debe seleccionar una mesa antes de enviar la comanda.', 'red');
        event.preventDefault();
        return;
    }

    if (items.length === 0) {
        showCustomAlert('Error', 'Debe agregar al menos un ítem a la comanda.', 'red');
        event.preventDefault();
        return;
    }

    // Aquí se enviaría el formulario
    showCustomAlert('Comanda Enviada', 'La comanda se está procesando...', 'blue');
    // Si la llamada AJAX o POST es exitosa, se puede cerrar el modal:
    // closeModal('newComandaModal');
}

// Simula el cambio de estado de una comanda (requiere un endpoint POST real).
function changeStatus(pedidoId, newStatus) {
    if (confirm(`¿Está seguro de cambiar el estado de la comanda #${pedidoId} a "${newStatus.replace('_', ' ')}"?`)) {
        // Aquí iría el fetch/POST al servidor
        showCustomAlert('Simulación', `El estado de la comanda #${pedidoId} se ha cambiado a ${newStatus}.`, 'orange');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}


/**
 * GESTIÓN DE DETALLES DE MESA (viewMesaDetails MEJORADO)
 */
function viewMesaDetails(mesa) {
    const titleEl = document.getElementById('detailMesaTitle');
    const contentEl = document.getElementById('detailContent');
    const actionsEl = document.getElementById('detailActions');
    const statusColor = getStatusColor(mesa.mesa_status, mesa.pedido_status);

    titleEl.innerHTML = `<i data-lucide="utensils" class="w-6 h-6 inline-block mr-2 text-${statusColor}"></i> Mesa #${mesa.numero}`;
    contentEl.innerHTML = ''; // Limpiar contenido
    actionsEl.innerHTML = ''; // Limpiar acciones

    // --- Contenido de Detalles ---
    
    // Bloque de información básica de la mesa
    contentEl.innerHTML += `
        <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-sm"><span class="font-semibold">ID:</span> ${mesa.mesa_id}</p>
            <p class="text-sm"><span class="font-semibold">Capacidad:</span> <span class="font-bold text-gray-700">${mesa.capacidad} pers.</span></p>
            <p class="text-sm"><span class="font-semibold">Estado:</span> <span class="uppercase font-extrabold text-${statusColor} text-sm">${mesa.mesa_status}</span></p>
        </div>
    `;

    // Bloque de información de Comanda Activa
    if (mesa.pedido_id) {
        const pedidoColor = getStatusColor(null, mesa.pedido_status);
        contentEl.innerHTML += `
            <div class="p-4 bg-red-50 border-l-4 border-${pedidoColor} rounded-lg">
                <h4 class="font-extrabold text-xl text-${pedidoColor} mb-2">Comanda Activa #${mesa.pedido_id}</h4>
                <p class="text-sm"><span class="font-semibold">Estado Comanda:</span> <span class="uppercase font-bold">${mesa.pedido_status.replace('_', ' ')}</span></p>
                <p class="text-sm"><span class="font-semibold">Total:</span> <span class="text-2xl font-extrabold text-red-600">S/ ${mesa.pedido_total.toFixed(2)}</span></p>
            </div>
        `;
    }
    
    // Bloque de Acciones
    let actionButtons = '';

    if (mesa.pedido_id) {
        // Pedidos abiertos, en preparación o listos
        if (mesa.pedido_status === 'abierto' || mesa.pedido_status === 'en_preparacion') {
            actionButtons += `
                <a href="/moza/comandas/detail/${mesa.pedido_id}" class="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold flex items-center justify-center transition">
                    <i data-lucide="eye" class="w-5 h-5 mr-2"></i> Ver / Agregar Ítems
                </a>
                <button onclick="changeStatus(${mesa.pedido_id}, 'listo_pago')" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center transition">
                    <i data-lucide="bell" class="w-5 h-5 mr-2"></i> Pedir la Cuenta (Aviso)
                </button>
            `;
        } else if (mesa.pedido_status === 'listo_pago') {
            actionButtons += `
                <a href="/moza/comandas/pago/${mesa.pedido_id}" class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center transition">
                    <i data-lucide="wallet" class="w-5 h-5 mr-2"></i> Cobrar y Cerrar Comanda
                </a>
            `;
        }
    } else if (mesa.mesa_status === 'disponible') {
        // Mesa disponible
        actionButtons += `
            <button onclick="openNewComandaModalForTable(${mesa.mesa_id})" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center transition">
                <i data-lucide="plus-circle" class="w-5 h-5 mr-2"></i> Iniciar Comanda Ahora
            </button>
        `;
    } else if (mesa.mesa_status === 'reservada') {
        // Mesa reservada
        actionButtons += `
            <button class="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold flex items-center justify-center transition">
                <i data-lucide="calendar" class="w-5 h-5 mr-2"></i> Ver Detalles de Reserva
            </button>
        `;
    }
    
    // Botón de cerrar siempre al final
    actionsEl.innerHTML = actionButtons + `<button type="button" onclick="closeModal('detailsModal')" class="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold mt-1">Cerrar</button>`;

    // Re-renderizar iconos de Lucide dentro del modal
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    openModal('detailsModal');
}

// Inicializar Lucide Icons al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});