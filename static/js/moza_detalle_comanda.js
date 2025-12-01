// Variables globales (Datos del servidor inyectados por Jinja)
    const platosCarta = {{ platos_a_la_carta | tojson }};
    const menuDelDia = {{ menu_del_dia | tojson | default('null') }};
    const pedidoInicial = { 
        id: {{ pedido.id }}, 
        total: {{ pedido.total }},
        status: '{{ pedido.status }}'
    };
    
    // Lista de IDs de ítems que el mozo desea eliminar
    let removedItems = [];

    // Función auxiliar para obtener la clase de color del estado
    function getStatusClass(status) {
        if (status === 'abierto' || status === 'en_preparacion') return 'bg-red-600';
        if (status === 'listo_pago') return 'bg-orange-500';
        if (status === 'cerrado') return 'bg-green-600';
        return 'bg-gray-400';
    }

    /**
     * Calcula el total de los ítems a AÑADIR y actualiza el campo oculto JSON.
     */
    function calculateNewItemsTotal() {
        let newTotal = 0;
        let newItems = [];

        // 1. Platos a la carta
        document.querySelectorAll('.add-quantity-input').forEach(input => {
            const cantidad = parseInt(input.value) || 0;
            const precio = parseFloat(input.dataset.precio);
            const platoId = input.dataset.platoId;
            
            if (cantidad > 0) {
                newTotal += cantidad * precio;
                newItems.push({
                    plato_id: platoId,
                    menu_id: null,
                    cantidad: cantidad,
                    precio: precio,
                    tipo: 'plato_carta'
                });
            }
        });

        // 2. Menú del día
        document.querySelectorAll('.add-menu-input').forEach(input => {
            const cantidad = parseInt(input.value) || 0;
            const precio = parseFloat(input.dataset.precio);
            const menuId = input.dataset.menuId;
            
            if (cantidad > 0) {
                newTotal += cantidad * precio;
                newItems.push({
                    plato_id: null,
                    menu_id: menuId,
                    cantidad: cantidad,
                    precio: precio,
                    tipo: 'menu_dia'
                });
            }
        });

        document.getElementById('newItemsTotalDisplay').textContent = 'S/ ' + newTotal.toFixed(2);
        document.getElementById('newItemsInput').value = JSON.stringify(newItems);
        
        // Recalcular el total general estimado (simulado)
        updateEstimatedTotal();
    }
    
    /**
     * Marca un ítem existente para ser eliminado de la comanda.
     */
    function removeItemFromComanda(event, itemId) {
        event.preventDefault();
        
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        
        if (itemElement) {
            if (itemElement.classList.contains('opacity-40')) {
                // Restaurar el ítem (deshacer eliminación)
                itemElement.classList.remove('opacity-40', 'line-through', 'bg-red-50');
                const index = removedItems.indexOf(itemId);
                if (index > -1) {
                    removedItems.splice(index, 1);
                }
            } else {
                // Marcar para eliminación
                itemElement.classList.add('opacity-40', 'line-through', 'bg-red-50');
                removedItems.push(itemId);
            }
            
            document.getElementById('removedItemsInput').value = JSON.stringify(removedItems);
            
            // Recalcular el total general estimado (simulado)
            updateEstimatedTotal();
        }
    }

    /**
     * Calcula el total de ítems eliminados y añadidos y muestra un total general (simulado).
     * NOTA: El cálculo final del total se hace en el backend. Esto es solo para feedback al mozo.
     */
    function updateEstimatedTotal() {
        // 1. Total inicial del pedido
        let estimatedTotal = pedidoInicial.total;

        // 2. Restar ítems marcados para eliminación (simulación)
        const initialItems = {{ items | tojson }};
        const removedValue = initialItems.filter(item => removedItems.includes(item.id))
                                       .reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
        
        // 3. Sumar ítems a añadir
        const newItemsJSON = document.getElementById('newItemsInput').value;
        const newItemsValue = JSON.parse(newItemsJSON || '[]')
                                 .reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
        
        // El total estimado solo reflejará los ítems AÑADIDOS
        const finalDisplayTotal = pedidoInicial.total - removedValue + newItemsValue;

        document.getElementById('currentTotalDisplay').textContent = 'S/ ' + finalDisplayTotal.toFixed(2);
    }

    /**
     * Valida y prepara la actualización de la comanda.
     */
    function prepareAndSubmitUpdate(event) {
        calculateNewItemsTotal(); // Asegura que el JSON de nuevos ítems esté actualizado
        
        const newItems = JSON.parse(document.getElementById('newItemsInput').value);
        const removed = removedItems.length > 0;
        const added = newItems.length > 0;

        if (!removed && !added) {
            showCustomAlert('Advertencia', 'No se ha realizado ninguna modificación (ni añadido ni eliminado ítems).', 'yellow');
            event.preventDefault();
            return;
        }
        
        showCustomAlert('Comanda Actualizada', 'Enviando cambios a la cocina...', 'red');
        // El formulario se envía automáticamente si no se llama a preventDefault
    }
    
    /**
     * Redirige a la página principal de comandas.
     */
    function cancelEdit() {
        if (confirm('¿Desea descartar los cambios y volver a la vista de mesas?')) {
            window.location.href = "{{ url_for('moza_comandas') }}";
        }
    }
    
    /**
     * Simula el cambio de estado de una comanda (requiere un endpoint POST real).
     */
    function changeStatus(pedidoId, newStatus) {
        if (newStatus === 'listo_pago' && pedidoInicial.status === 'listo_pago') {
            showCustomAlert('Advertencia', 'La comanda ya está marcada como pendiente de pago.', 'yellow');
            return;
        }

        if (confirm(`¿Está seguro de cambiar el estado de la comanda #${pedidoId} a "${newStatus.replace('_', ' ')}"?`)) {
            // En un entorno real, aquí harías un fetch POST
            showCustomAlert('Simulación', `El estado de la comanda #${pedidoId} se ha cambiado a ${newStatus}.`, 'orange');
            
            // Simulación de recarga y cambio de estado visual
            document.getElementById('currentStatus').textContent = newStatus.replace('_', ' ');
            document.getElementById('currentStatus').className = `uppercase font-bold text-sm text-white px-2 py-0.5 rounded-full ${getStatusClass(newStatus)}`;
            
            // Redirigir para forzar la carga de la nueva interfaz si se necesita
            setTimeout(() => {
                window.location.reload(); 
            }, 500);
        }
    }
    
    /**
     * Función personalizada para reemplazar alert().
     */
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

    // Inicializar Lucide Icons al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });