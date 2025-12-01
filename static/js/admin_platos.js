function openEditModal(plato) {
        // 1. Mostrar el modal
        const modal = document.getElementById('editModal');
        modal.classList.remove('hidden');

        // 2. Rellenar los campos con los datos del plato
        document.getElementById('edit_nombre').value = plato.nombre;
        document.getElementById('edit_precio').value = plato.precio;
        document.getElementById('edit_tiempo').value = plato.tiempo_preparacion_min;
        document.getElementById('edit_descripcion').value = plato.descripcion;
        
        // Manejo de select (Categoría) y checkbox (Vegetariano)
        // Asegúrate que tu objeto 'plato' tenga 'categoria_id'
        if(plato.categoria_id) {
            document.getElementById('edit_categoria_id').value = plato.categoria_id;
        }
        document.getElementById('edit_es_vegetariano').checked = plato.es_vegetariano;

        // 3. Actualizar la acción del formulario
        // Se asume que tienes una ruta flask llamada 'update_plato' que acepta el ID
        // Ejemplo de URL final: /admin/platos/update/5
        const form = document.getElementById('editForm');
        // Usamos una URL base y le concatenamos el ID
        form.action = "{{ url_for('update_plato', plato_id=0) }}".replace('0', plato.id);
    }

    function closeEditModal() {
        document.getElementById('editModal').classList.add('hidden');
    }

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            closeEditModal();
        }
    });