function openUserEditModal(user) {
        // 1. Mostrar el modal
        const modal = document.getElementById('editUserModal');
        modal.classList.remove('hidden');

        // 2. Rellenar los campos con los datos del usuario
        document.getElementById('edit_nombres').value = user.nombres;
        document.getElementById('edit_apellidos').value = user.apellidos || '';
        document.getElementById('edit_email').value = user.email;
        
        // Seleccionar el Rol y el Status correctos
        document.getElementById('edit_rol').value = user.rol;
        document.getElementById('edit_status').value = user.status;
        
        // 3. Actualizar la acción del formulario
        const form = document.getElementById('editUserForm');
        // Usamos la ruta update_user con el ID del usuario
        // La sintaxis de Jinja2 debe ser: {{ url_for('update_user', user_id=0) }}
        form.action = "{{ url_for('update_user', user_id=0) }}".replace('0', user.id);
    }

    function closeUserEditModal() {
        document.getElementById('editUserModal').classList.add('hidden');
    }

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            closeUserEditModal();
        }
    });