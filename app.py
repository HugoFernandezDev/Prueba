import uuid
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import mysql.connector
from mysql.connector import Error
from config import Config
from datetime import datetime, timedelta
import functools
import hashlib # Necesario para simular el hashing de contraseñas
import json

# Inicialización de la Aplicación
app = Flask(__name__)
app.config.from_object(Config)

# --- PROCESADOR DE CONTEXTO ---
# Se ejecuta antes de renderizar CUALQUIER plantilla
@app.context_processor
def inject_now():
    """Inyecta la variable 'now' (fecha/hora actual) en el contexto de Jinja2."""
    # Retorna un diccionario con las variables a inyectar
    return {'now': datetime.now()}

# -----------------------------------------------------
# FUNCIÓN DE UTILIDAD: Conexión a la Base de Datos
# -----------------------------------------------------
def inferir_tipo_documento(num_doc):
    """Devuelve 'DNI' si tiene 8 dígitos, 'CE' si tiene 9 o más."""
    # Limpieza básica
    num_doc = str(num_doc).strip() 
    
    if len(num_doc) == 8 and num_doc.isdigit():
        return 'DNI'
    elif len(num_doc) >= 9 and num_doc.isalnum():
        return 'CE'
    return 'Otro'

def get_db_connection():
    """Establece y retorna una conexión a la base de datos MySQL."""
    try:
        conn = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DB'],
            port=app.config['MYSQL_PORT']
        )
        return conn
    except Error as e:
        print(f"Error al conectar a MySQL: {e}")
        # En una aplicación real, se manejaría un error 500
        return None

# -----------------------------------------------------
# FUNCIÓN DE UTILIDAD: Hashing de Contraseñas (Simulado)
# -----------------------------------------------------
def hash_password_simple(password):
    """Simulación simple de hashing para demostración. Usar bcrypt en producción."""
    return hashlib.sha256(password.encode()).hexdigest()

# -----------------------------------------------------
# DECORADOR DE AUTORIZACIÓN
# -----------------------------------------------------
def require_role(allowed_roles):
    """
    Decorador para restringir el acceso a rutas solo a usuarios con ciertos roles.
    Ejemplo: @require_role(['admin', 'moza'])
    """
    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            if 'logged_in' not in session or not session['logged_in']:
                flash('Debes iniciar sesión para acceder a esta área.', 'warning')
                return redirect(url_for('login'))
            
            user_role = session.get('rol')
            if user_role not in allowed_roles:
                flash('Acceso denegado. Tu rol no tiene permisos.', 'danger')
                return redirect(url_for('index')) # Redirigir al inicio o a una página de error
            
            return f(*args, **kwargs)
        return wrapper
    return decorator


# -----------------------------------------------------
# 1. RUTAS PÚBLICAS 🌐
# -----------------------------------------------------

@app.route('/')
def index():
    """Landing Page: Contiene la sección de Contacto."""
    return render_template('index.html', title='Inicio - Sumak Mikuy')

@app.route('/contactanos', methods=['POST'])
def contactanos():
    """Maneja el formulario de Contacto y simula el envío de correo."""
    name = request.form.get('name')
    email = request.form.get('email')
    message = request.form.get('message')
    
    # **********************************************
    # SIMULACIÓN DE ENVÍO DE CORREO
    # **********************************************
    print(f"\n--- Nuevo Mensaje de Contacto ---")
    print(f"De: {name} ({email})")
    print(f"Mensaje: {message}\n")
    # **********************************************
    
    flash('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success')
    return redirect(url_for('index') + '#contacto') # Redirigir a la sección de contacto

@app.route('/reservas', methods=['GET', 'POST'])
def reservas():
    """Vista y gestión del formulario de Reservas."""
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        guests = request.form.get('guests')
        date = request.form.get('date')
        time = request.form.get('time')
        notes = request.form.get('notes')
        
        try:
            # Concatenar fecha y hora para el formato DATETIME de MySQL
            reserva_at_str = f"{date} {time}:00"
            datetime.strptime(reserva_at_str, '%Y-%m-%d %H:%M:%S') # Validación de formato

            conn = get_db_connection()
            if conn:
                cursor = conn.cursor()
                # usuario_id es NULL ya que el cliente es anónimo
                query = """
                INSERT INTO reservas (name, email, guests, reserva_at, notas, status)
                VALUES (%s, %s, %s, %s, %s, 'pendiente')
                """
                cursor.execute(query, (name, email, guests, reserva_at_str, notes))
                conn.commit()
                cursor.close()
                conn.close()
                flash('¡Reserva creada con éxito! Espera nuestra confirmación por correo.', 'success')
                return redirect(url_for('index'))
            else:
                flash('Error de conexión a la base de datos.', 'danger')

        except ValueError:
            flash('Formato de fecha u hora inválido.', 'danger')
        except Error as e:
            flash(f'Error al guardar la reserva: {e}', 'danger')
        
    return render_template('reservas.html', title='Reservar una Mesa')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Maneja el inicio de sesión para Admin y Moza."""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password') 
        
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor(dictionary=True)
            # Buscar usuario por email (Solo Admin y Moza)
            query = "SELECT id, email, password, rol, nombres FROM usuarios WHERE email = %s AND rol IN (%s, %s)"
            cursor.execute(query, (email, Config.ROLES['ADMIN'], Config.ROLES['MOZA']))
            user = cursor.fetchone()
            cursor.close()
            conn.close()
            
            # Nota: El SQL de ejemplo usa 'hashed_pass', por eso se mantiene la simulación.
            # En un entorno real: user and bcrypt.check_password_hash(user['password'], password)
            if user and user['password'] == password: # Simulación de verificación
                session['logged_in'] = True
                session['user_id'] = user['id']
                session['rol'] = user['rol']
                session['username'] = user['nombres']
                
                flash(f"Bienvenido, {user['nombres']}. Has iniciado sesión como {user['rol']}.", 'success')
                
                # Redirección basada en el rol
                return redirect(app.config['LOGIN_SUCCESS_REDIRECT'].get(user['rol'], url_for('index')))
            else:
                flash('Credenciales inválidas o usuario no autorizado.', 'danger')
        else:
            flash('Error de conexión a la base de datos.', 'danger')

    return render_template('login.html', title='Iniciar Sesión')

@app.route('/logout')
def logout():
    """Cierra la sesión del usuario."""
    session.clear()
    flash('Has cerrado sesión exitosamente.', 'info')
    return redirect(url_for('index'))


# -----------------------------------------------------
# 2. RUTAS DE ADMIN (Protegidas) 👑
# -----------------------------------------------------

@app.route('/admin/dashboard')
@require_role([Config.ROLES['ADMIN']])
def admin_dashboard():
    """Dashboard principal del Admin."""
    conn = get_db_connection()
    reservas_pendientes = 0
    platos_totales = 0
    if conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM reservas WHERE status = 'pendiente'")
        reservas_pendientes = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM platos WHERE status = 'disponible'")
        platos_totales = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
    return render_template('admin_dashboard.html', 
                           title='Admin Dashboard', 
                           reservas_pendientes=reservas_pendientes,
                           platos_totales=platos_totales)


@app.route('/admin/reservas')
@require_role([Config.ROLES['ADMIN']])
def admin_reservas():
    """Vista para ver, aprobar o cancelar Reservas."""
    conn = get_db_connection()
    reservas = []
    mesas = []
    if conn:
        cursor = conn.cursor(dictionary=True)
        # Consulta para traer todas las reservas, ordenadas por fecha reciente
        cursor.execute("""
            SELECT 
                r.id, r.name, r.email, r.guests, r.reserva_at, r.notas, r.status,
                m.numero_mesa, m.capacidad
            FROM reservas r
            LEFT JOIN mesas m ON r.mesa_asignada_id = m.id
            ORDER BY r.reserva_at DESC
        """)
        reservas = cursor.fetchall()
        
        # Obtener mesas disponibles/ocupadas para la asignación
        cursor.execute("SELECT id, numero_mesa, capacidad FROM mesas WHERE status IN ('disponible', 'ocupada')")
        mesas = cursor.fetchall()
        
        cursor.close()
        conn.close()

    return render_template('admin_reservas.html', title='Gestión de Reservas', reservas=reservas, mesas=mesas)

@app.route('/admin/reservas/update/<int:reserva_id>', methods=['POST'])
@require_role([Config.ROLES['ADMIN']])
def update_reserva(reserva_id):
    """Endpoint para aprobar o cancelar una reserva."""
    status = request.form.get('status')
    mesa_id = request.form.get('mesa_id') 

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            if status == 'confirmada':
                if not mesa_id:
                    flash('Debe asignar una mesa para confirmar la reserva.', 'danger')
                    return redirect(url_for('admin_reservas'))
                    
                update_query = "UPDATE reservas SET status = %s, mesa_asignada_id = %s WHERE id = %s"
                cursor.execute(update_query, (status, mesa_id, reserva_id))
                
                # Marcar la mesa como ocupada (lógica simplificada)
                cursor.execute("UPDATE mesas SET status = 'ocupada' WHERE id = %s", (mesa_id,))
                
                flash(f'Reserva {reserva_id} confirmada y mesa {mesa_id} asignada.', 'success')
                
            elif status == 'cancelada':
                # Obtener mesa_id anterior para liberarla
                cursor.execute("SELECT mesa_asignada_id FROM reservas WHERE id = %s", (reserva_id,))
                old_mesa_id = cursor.fetchone()[0]
                
                update_query = "UPDATE reservas SET status = %s, mesa_asignada_id = NULL WHERE id = %s"
                cursor.execute(update_query, (status, reserva_id))
                
                if old_mesa_id:
                     cursor.execute("UPDATE mesas SET status = 'disponible' WHERE id = %s", (old_mesa_id,))
                     
                flash(f'Reserva {reserva_id} cancelada.', 'info')
            
            conn.commit()
            
        except Error as e:
            flash(f'Error al actualizar la reserva: {e}', 'danger')
        finally:
            conn.close()

    return redirect(url_for('admin_reservas'))


# app.py (Código corregido)

@app.route('/admin/platos', methods=['GET', 'POST'])
@require_role([Config.ROLES['ADMIN']])
def admin_platos():
    """Vista única para Listar (GET) y Agregar (POST) Platos. Soluciona el error 404."""
    conn = get_db_connection()
    platos = []
    categorias = []
    
    if conn is None:
        flash('Error al conectar a la base de datos.', 'danger')
        return render_template('admin_platos.html', title='Gestión de Platos', platos=[], categorias=[])
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 1. Obtener listado de categorías (necesario para el select del formulario)
        cursor.execute("SELECT id, nombre FROM categorias_menu ORDER BY nombre") 
        categorias = cursor.fetchall()
        
        # 2. Lógica POST: Agregar nuevo plato
        if request.method == 'POST':
            nombre = request.form.get('nombre')
            descripcion = request.form.get('descripcion')
            precio_str = request.form.get('precio')
            categoria_id = request.form.get('categoria_id')
            es_vegetariano = 1 if request.form.get('es_vegetariano') else 0
            tiempo_str = request.form.get('tiempo_preparacion_min')
            
            if not all([nombre, descripcion, precio_str, categoria_id, tiempo_str]):
                flash('Todos los campos son obligatorios.', 'warning')
            else:
                try:
                    precio = float(precio_str)
                    tiempo = int(tiempo_str)
                    query = """
                    INSERT INTO platos (categoria_id, nombre, descripcion, precio, tiempo_preparacion_min, es_vegetariano, status)
                    VALUES (%s, %s, %s, %s, %s, %s, 'disponible')
                    """
                    cursor.execute(query, (categoria_id, nombre, descripcion, precio, tiempo, es_vegetariano))
                    conn.commit()
                    flash(f'Plato "{nombre}" agregado exitosamente.', 'success')
                    # Redirigir a sí mismo para limpiar el formulario (PRG Pattern)
                    return redirect(url_for('admin_platos'))
                except ValueError:
                    flash('Error: Precio o tiempo deben ser números válidos.', 'danger')
                except Exception as e:
                    conn.rollback()
                    flash(f'Error al guardar en BD: {e}', 'danger')
        
        # 3. Lógica GET: Listar platos
        query_platos = """
        SELECT p.id, p.nombre, p.descripcion, p.precio, p.status, p.es_vegetariano, c.nombre AS categoria 
        FROM platos p 
        JOIN categorias_menu c ON p.categoria_id = c.id
        WHERE p.status != 'agotado'
        ORDER BY c.nombre, p.nombre
        """
        cursor.execute(query_platos)
        platos = cursor.fetchall()

    except Exception as e:
        flash(f'Error general: {e}', 'danger')
        if conn: conn.rollback()
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

    return render_template('admin_platos.html', title='Gestión de Platos', platos=platos, categorias=categorias)

@app.route('/admin/platos/edit/<int:plato_id>', methods=['POST'])
@require_role([Config.ROLES['ADMIN']])
def update_plato(plato_id):
    """Endpoint para editar un plato existente."""
    nombre = request.form.get('nombre')
    descripcion = request.form.get('descripcion')
    precio = request.form.get('precio')
    categoria_id = request.form.get('categoria_id')
    es_vegetariano = 1 if request.form.get('es_vegetariano') == 'on' else 0
    tiempo = request.form.get('tiempo_preparacion_min')
    status = 'disponible'
    
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query = """
            UPDATE platos SET 
                nombre = %s, descripcion = %s, precio = %s, categoria_id = %s,
                es_vegetariano = %s, tiempo_preparacion_min = %s, status = %s
            WHERE id = %s
            """
            cursor.execute(query, (nombre, descripcion, precio, categoria_id, es_vegetariano, tiempo, status, plato_id))
            conn.commit()
            flash(f'Plato ID {plato_id} actualizado exitosamente.', 'success')
        except Error as e:
            flash(f'Error al editar plato: {e}', 'danger')
        finally:
            conn.close()
            
    return redirect(url_for('admin_platos'))

@app.route('/admin/platos/delete/<int:plato_id>', methods=['POST'])
@require_role([Config.ROLES['ADMIN']])
def delete_plato(plato_id):
    """Endpoint para eliminar (cambiar estado a 'inactivo') un plato existente."""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Opción recomendada: Cambiar el estado a 'inactivo' o 'eliminado'
            # para mantener la integridad referencial en los pedidos anteriores.
            query = "UPDATE platos SET status = 'agotado' WHERE id = %s"
            cursor.execute(query, (plato_id,))
            
            # Obtener el nombre para el mensaje
            cursor.execute("SELECT nombre FROM platos WHERE id = %s", (plato_id,))
            nombre_plato = cursor.fetchone()
            nombre_plato = nombre_plato[0] if nombre_plato else 'Plato Desconocido'
            
            conn.commit()
            flash(f'Plato "{nombre_plato}" (ID: {plato_id}) marcado como inactivo.', 'success')
            
        except Error as e:
            flash(f'Error al eliminar el plato: {e}', 'danger')
        finally:
            conn.close()
            
    return redirect(url_for('admin_platos'))

@app.route('/admin/menus', methods=['GET', 'POST'])
@require_role([Config.ROLES['ADMIN']])
def admin_menus():
    """Vista y gestión para listar, crear y seleccionar Menú del Día."""
    conn = get_db_connection()
    
    if request.method == 'POST':
        if 'set_menu_del_dia' in request.form:
            # Lógica para seleccionar el Menú del Día
            menu_id = request.form.get('menu_del_dia_id')
            precio_fijo = request.form.get('precio_fijo_dia')
            
            try:
                cursor = conn.cursor()
                # 1. Desactivar el menú anterior (opcional, si solo se quiere uno activo)
                cursor.execute("UPDATE menu_del_dia_actual SET status = 'archivado' WHERE status = 'activo'")
                
                # 2. Crear o actualizar el menú del día actual
                # Se asume que menu_id ya existe en la tabla principal (no implementado en esta versión)
                query = """
                INSERT INTO menu_del_dia_actual (fecha, precio_fijo, status)
                VALUES (CURDATE(), %s, 'activo')
                ON DUPLICATE KEY UPDATE 
                    precio_fijo = %s, status = 'activo'
                """
                cursor.execute(query, (precio_fijo, precio_fijo))
                
                # Nota: En una versión completa, este POST crearía el menú y sus detalles. 
                # Aquí simulamos que se está seleccionando un "paquete" predefinido.
                
                conn.commit()
                flash('Menú del Día actualizado exitosamente.', 'success')
            except Error as e:
                flash(f'Error al seleccionar el Menú del Día: {e}', 'danger')
        
        # Aquí iría la lógica POST para crear un nuevo menú, no implementada por complejidad.
        
        return redirect(url_for('admin_menus'))
    
    # GET: Listar platos y menús
    menus = []
    platos_entrada = []
    platos_segundo = []
    platos_postre = []
    menu_dia_actual = None
    
    if conn:
        cursor = conn.cursor(dictionary=True)
        
        # 1. Obtener todos los Platos activos por categoría para la creación de menús
        cursor.execute("SELECT id, nombre, precio FROM platos WHERE status = 'disponible' AND categoria_id = (SELECT id FROM categorias_menu WHERE nombre='Entradas')")
        platos_entrada = cursor.fetchall()
        cursor.execute("SELECT id, nombre, precio FROM platos WHERE status = 'disponible' AND categoria_id = (SELECT id FROM categorias_menu WHERE nombre='Platos Principales')")
        platos_segundo = cursor.fetchall()
        cursor.execute("SELECT id, nombre, precio FROM platos WHERE status = 'disponible' AND categoria_id = (SELECT id FROM categorias_menu WHERE nombre='Postres' OR nombre='Bebidas')")
        platos_postre = cursor.fetchall() # Usamos esto para Postre/Bebida simplificado
        
        # 2. Obtener el Menú del Día Actual
        cursor.execute("""
            SELECT 
                md.id, md.fecha, md.precio_fijo, p.nombre AS plato_nombre, 
                dmd.tipo_plato_dia, dmd.plato_id
            FROM menu_del_dia_actual md
            LEFT JOIN detalle_menu_dia dmd ON md.id = dmd.menu_dia_id
            LEFT JOIN platos p ON dmd.plato_id = p.id
            WHERE md.fecha = CURDATE() AND md.status = 'activo'
        """)
        menu_items = cursor.fetchall()
        
        if menu_items and menu_items[0]['id'] is not None:
            menu_dia_actual = {
                'id': menu_items[0]['id'],
                'fecha': menu_items[0]['fecha'],
                'precio_fijo': menu_items[0]['precio_fijo'],
                'items': {}
            }
            for item in menu_items:
                tipo = item.get('tipo_plato_dia', 'No Asignado')
                if tipo not in menu_dia_actual['items']:
                    menu_dia_actual['items'][tipo] = []
                menu_dia_actual['items'][tipo].append(item['plato_nombre'])
        
        cursor.close()
        conn.close()
        
    return render_template('admin_menu_del_dia.html', 
                           title='Gestión de Menús',
                           platos_entrada=platos_entrada,
                           platos_segundo=platos_segundo,
                           platos_postre=platos_postre,
                           menu_dia_actual=menu_dia_actual)


@app.route('/admin/usuarios', methods=['GET', 'POST'])
@require_role([Config.ROLES['ADMIN']])
def admin_usuarios():
    """Vista y gestión para listar y crear nuevos usuarios (Admin/Moza)."""
    conn = get_db_connection()
    usuarios = []
    
    if request.method == 'POST':
        # Lógica para crear un nuevo usuario
        nombres = request.form.get('nombres')
        apellidos = request.form.get('apellidos') or '' # Usamos OR '' si falta
        email = request.form.get('email')
        password = request.form.get('password')
        rol = request.form.get('rol')
        
        hashed_password = password # Usamos el password sin hash por la simulación simple
        
        if conn:
            try:
                cursor = conn.cursor()
                query = """
                INSERT INTO usuarios (nombres, apellidos, email, password, rol, status)
                VALUES (%s, %s, %s, %s, %s, 'activo')
                """
                cursor.execute(query, (nombres, apellidos, email, hashed_password, rol))
                conn.commit()
                flash(f'Usuario "{nombres} {apellidos}" ({rol}) creado exitosamente.', 'success')
            except Error as e:
                flash(f'Error al crear usuario: {e}', 'danger')
            finally:
                conn.close()
            return redirect(url_for('admin_usuarios'))
        else:
            flash('Error: No se pudo conectar a la base de datos para crear el usuario.', 'danger')

    
    # GET (Listar Usuarios)
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            # Obtener todos los usuarios, excluyendo el rol 'cliente' por defecto
            cursor.execute("""
                SELECT id, nombres, apellidos, email, rol, status 
                FROM usuarios 
                WHERE rol IN (%s, %s, %s, %s) AND status != 'inactivo'
                ORDER BY rol, apellidos
                """, (Config.ROLES['ADMIN'], Config.ROLES['MOZA'], Config.ROLES['CLIENTE'], Config.ROLES['COCINA']))
            usuarios = cursor.fetchall()
            
        except Error as e:
            flash(f'Error al listar usuarios: {e}', 'danger')
        finally:
            conn.close()
            
    # Roles disponibles para crear y editar
    roles_disponibles = [Config.ROLES['ADMIN'], Config.ROLES['MOZA']]
    
    # Nota: En el HTML se usa 'system_users' para la lista.
    return render_template('admin_usuarios.html', 
                           title='Gestión de Usuarios', 
                           system_users=usuarios, 
                           roles_disponibles=roles_disponibles)


@app.route('/admin/usuarios/update/<int:user_id>', methods=['POST'])
@require_role([Config.ROLES['ADMIN']])
def update_user(user_id):
    """Endpoint para editar los datos o rol de un usuario existente."""
    nombres = request.form.get('nombres')
    apellidos = request.form.get('apellidos') or ''
    email = request.form.get('email')
    rol = request.form.get('rol')
    status = request.form.get('status')
    
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query = """
            UPDATE usuarios SET 
                nombres = %s, 
                apellidos = %s, 
                email = %s, 
                rol = %s,
                status = %s
            WHERE id = %s
            """
            cursor.execute(query, (nombres, apellidos, email, rol, status, user_id))
            conn.commit()
            
            if cursor.rowcount > 0:
                flash(f'Usuario ID {user_id} ({nombres}) actualizado exitosamente.', 'success')
            else:
                flash(f'No se encontraron cambios o el usuario ID {user_id} no existe.', 'warning')
        except Error as e:
            flash(f'Error al editar usuario: {e}', 'danger')
        finally:
            conn.close()
            
    return redirect(url_for('admin_usuarios'))


@app.route('/admin/usuarios/delete/<int:user_id>', methods=['POST'])
@require_role([Config.ROLES['ADMIN']])
def delete_user(user_id):
    """Endpoint para desactivar (o "eliminar") un usuario."""
    conn = get_db_connection()
    
    if user_id == session.get('user_id'):
        flash('No puedes desactivar tu propia cuenta de administrador.', 'warning')
        return redirect(url_for('admin_usuarios'))

    if conn:
        try:
            cursor = conn.cursor()
            # Generalmente, es mejor desactivar (status = 'inactivo') que borrar
            query = "UPDATE usuarios SET status = 'inactivo' WHERE id = %s"
            cursor.execute(query, (user_id,))
            conn.commit()
            
            if cursor.rowcount > 0:
                flash(f'Usuario ID {user_id} desactivado exitosamente.', 'success')
            else:
                flash(f'Error: El usuario ID {user_id} no existe.', 'danger')
        except Error as e:
            flash(f'Error al desactivar usuario: {e}', 'danger')
        finally:
            conn.close()
            
    return redirect(url_for('admin_usuarios'))


# -----------------------------------------------------
# 3. RUTAS DE MOZA (Protegidas) 💁‍♀️
# -----------------------------------------------------

@app.route('/moza/comandas')
@require_role([Config.ROLES['MOZA']])
def moza_comandas():
    conn = get_db_connection()
    mesas_con_estado = []
    menu_del_dia = None
    platos_a_la_carta = []

    if conn:
        cursor = conn.cursor(dictionary=True)

        # 1. Obtener TODAS las Mesas y la Comanda Activa si existe.
        cursor.execute("""
            SELECT 
                m.id AS mesa_id, 
                m.numero_mesa AS numero, 
                m.status AS mesa_status, 
                m.capacidad,
                p.id AS pedido_id, 
                p.total AS pedido_total, 
                p.status AS pedido_status
            FROM mesas m
            LEFT JOIN pedidos p ON m.id = p.mesa_id 
                AND p.status IN ('abierto', 'en_preparacion', 'listo_pago')
            ORDER BY m.numero_mesa, p.fecha_pedido DESC
        """)

        # El HTML espera una lista de objetos 'mesa', por lo que usamos 'mesas_con_estado'
        # que tiene el formato que el Jinja espera (`mesas=comandas_activas.values()` no funciona bien con todas las mesas)
        mesas_con_estado = cursor.fetchall()

        # 2. Obtener Platos a la Carta
        cursor.execute("""
            SELECT 
                p.id, p.nombre, p.precio, c.nombre AS categoria, c.id AS categoria_id
            FROM platos p
            JOIN categorias_menu c ON p.categoria_id = c.id
            WHERE p.status = 'disponible'
            ORDER BY c.orden, p.nombre
        """)
        platos_a_la_carta = cursor.fetchall()

        # 3. Obtener Menú del Día (Lógica existente)
        cursor.execute("""
            SELECT 
                md.id AS menu_dia_id, md.precio_fijo, p.id AS plato_id, p.nombre AS plato_nombre, 
                dmd.tipo_plato_dia
            FROM menu_del_dia_actual md
            JOIN detalle_menu_dia dmd ON md.id = dmd.menu_dia_id
            JOIN platos p ON dmd.plato_id = p.id
            WHERE md.fecha = CURDATE() AND md.status = 'activo'
            ORDER BY dmd.tipo_plato_dia, dmd.orden
        """)
        menu_items = cursor.fetchall()

        if menu_items:
            menu_del_dia = {
                'id': menu_items[0]['menu_dia_id'],
                'precio_fijo': menu_items[0]['precio_fijo'],
                'items': {}
            }
            for item in menu_items:
                tipo = item['tipo_plato_dia']
                if tipo not in menu_del_dia['items']:
                    menu_del_dia['items'][tipo] = []
                menu_del_dia['items'][tipo].append({'id': item['plato_id'], 'nombre': item['plato_nombre']})

        cursor.close()
        conn.close()

    # 4. Crear un diccionario de las mesas (mesa_id: mesa_data) 
    # para el bucle del modal 'Nueva Comanda' en Jinja
    comandas_activas_dict = {mesa['mesa_id']: mesa for mesa in mesas_con_estado}

    return render_template('moza_comandas.html',
                           title='Comandas',
                           mesas=mesas_con_estado,  # <-- CAMBIO: Pasar la lista completa de mesas
                           comandas_activas=comandas_activas_dict,  # <-- Pasar el dict para el select del modal
                           menu_del_dia=menu_del_dia,
                           platos_a_la_carta=platos_a_la_carta)


@app.route('/moza/comandas/new', methods=['POST'])
@require_role([Config.ROLES['MOZA']])
def new_comanda(): 
    """Endpoint para registrar un nuevo pedido/comanda."""
    mesa_id = request.form.get('mesa_id')
    items_json = request.form.get('items') # JSON string con los ítems pedidos
    moza_id = session.get('user_id')
  
    if not mesa_id or not items_json:
        flash('Debe seleccionar una mesa y al menos un ítem.', 'danger')
        return redirect(url_for('moza_comandas'))

    try:
        items = json.loads(items_json)
    except json.JSONDecodeError:
        flash('Datos de la comanda inválidos (formato JSON incorrecto).', 'danger')
        return redirect(url_for('moza_comandas'))

    conn = get_db_connection()
    if not conn:
        flash('Error de conexión a la base de datos.', 'danger')
        return redirect(url_for('moza_comandas'))

    cursor = None
    try:
        cursor = conn.cursor()
        total_pedido = 0

        # Diccionario para almacenar precios y evitar múltiples consultas redundantes (Caché simple)
        item_prices = {}

        # 1. Pre-cálculo de precios y total consultando la BD
        for item in items:
            item_id = item['id']
            item_type = item['tipo'] # 'plato' o 'menu'
            quantity = int(item.get('cantidad', 1))
            
            price = 0
            cache_key = f"{item_type}_{item_id}"
            
            if cache_key in item_prices:
                price = item_prices[cache_key]
            else:
                if item_type == 'plato':
                    # Obtener precio del plato
                    cursor.execute("SELECT precio FROM platos WHERE id = %s", (item_id,))
                    result = cursor.fetchone()
                    if result and result[0] is not None:
                        price = float(result[0])
                elif item_type == 'menu':
                    # Obtener precio fijo del menú del día
                    cursor.execute(
                        "SELECT precio_fijo FROM menu_del_dia_actual WHERE id = %s AND status = 'activo'",
                        (item_id,)
                    )
                    result = cursor.fetchone()
                    if result and result[0] is not None:
                        price = float(result[0])
            
            if price == 0:
                # Si el precio es 0, el ítem no existe o está inactivo
                raise ValueError(f"Precio no encontrado para ítem {item_type} ID {item_id}")
            
            item_prices[cache_key] = price
            total_pedido += price * quantity

        # 2. Insertar el Pedido (Comanda)
        pedido_query = """
        INSERT INTO pedidos (mesa_id, usuario_moza_id, fecha_pedido, total, status)
        VALUES (%s, %s, NOW(), %s, 'abierto')
        """
        cursor.execute(pedido_query, (mesa_id, moza_id, total_pedido))
        pedido_id = cursor.lastrowid # Obtener el ID del pedido recién insertado

        # 3. Insertar los detalles del Pedido
        detalle_query = """
        INSERT INTO detalle_pedido (pedido_id, plato_id, menu_dia_id, cantidad, precio_unitario, status)
        VALUES (%s, %s, %s, %s, %s, 'pendiente')
        """
        
        for item in items:
            item_id = item['id']
            item_type = item['tipo']
            quantity = int(item.get('cantidad', 1))
            price = item_prices[f"{item_type}_{item_id}"]
            
            # Solo uno de los dos ID (plato_id o menu_dia_id) será diferente de NULL
            plato_id = item_id if item_type == 'plato' else None
            menu_id = item_id if item_type == 'menu' else None
            
            cursor.execute(detalle_query, (pedido_id, plato_id, menu_id, quantity, price))

        # 4. Actualizar estado de la Mesa a 'ocupada' si es la primera comanda en esa mesa
        cursor.execute("UPDATE mesas SET status = 'ocupada' WHERE id = %s AND status = 'disponible'", (mesa_id,))

        conn.commit()
        flash(f'Comanda #{pedido_id} abierta para la Mesa {mesa_id}. Total: S/ {total_pedido:.2f}', 'success')
        return redirect(url_for('moza_comandas'))
    
    except ValueError as ve:
        if conn:
            conn.rollback()
        flash(f'Error de datos: {ve}', 'danger')
    except Error as e:
        if conn:
            conn.rollback()
        flash(f'Error de base de datos al crear la comanda: {e}', 'danger')
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn and conn.is_connected():
            conn.close()
        
    flash('Ocurrió un error al procesar la comanda.', 'danger')
    return redirect(url_for('moza_comandas'))

@app.route('/moza/comandas/detail/<int:pedido_id>', methods=['GET'])
@require_role([Config.ROLES['MOZA']])
def detail_comanda(pedido_id):
  """Retorna los detalles de un pedido específico en formato JSON para la Moza/UI."""
  conn = get_db_connection()
  if not conn:
    return jsonify({'error': 'Error de conexión a la base de datos.'}), 500

  try:
    cursor = conn.cursor(dictionary=True)
    # 1. Obtener el encabezado del pedido
    cursor.execute("SELECT id, mesa_id, total, status, fecha_pedido FROM pedidos WHERE id = %s", (pedido_id,))
    pedido_header = cursor.fetchone()

    if not pedido_header:
      return jsonify({'error': f'Pedido ID {pedido_id} no encontrado.'}), 404

    # 2. Obtener los detalles (ítems) del pedido
    detalle_query = """
    SELECT 
      dp.id AS detalle_id, 
      dp.cantidad, 
      dp.precio_unitario,
      dp.status AS item_status,
      COALESCE(p.nombre, 'Menú del Día') AS nombre_item,
      dp.plato_id,
      dp.menu_dia_id
    FROM detalle_pedido dp
    LEFT JOIN platos p ON dp.plato_id = p.id
    WHERE dp.pedido_id = %s
    ORDER BY dp.detalle_id
    """
    cursor.execute(detalle_query, (pedido_id,))
    pedido_details = cursor.fetchall()
    
    # Formatear la salida para JSON (Asegurar que los decimales sean float)
    response_data = {
      'pedido': {
        'id': pedido_header['id'],
        'mesa_id': pedido_header['mesa_id'],
        'total': float(pedido_header['total']),
        'status': pedido_header['status'],
        'fecha_pedido': pedido_header['fecha_pedido'].strftime('%Y-%m-%d %H:%M:%S')
      },
      'items': [
        {**item, 'precio_unitario': float(item['precio_unitario'])}
        for item in pedido_details
      ]
    }
    
    return jsonify(response_data)

  except Error as e:
    print(f"Error al obtener detalle de comanda: {e}")
    return jsonify({'error': f'Error al consultar la base de datos: {e}'}), 500
  finally:
    if conn and conn.is_connected():
      conn.close()


@app.route('/moza/comandas/close/<int:pedido_id>', methods=['POST'])
@require_role([Config.ROLES['MOZA']])
def close_comanda(pedido_id):
  """Cierra un pedido/comanda (pago realizado) y libera la mesa."""
  moza_id = session.get('user_id')
  
  conn = get_db_connection()
  if not conn:
    flash('Error de conexión a la base de datos.', 'danger')
    return redirect(url_for('moza_comandas'))

  try:
    cursor = conn.cursor()
    
    # 1. Obtener ID de la mesa, total y estado actual
    cursor.execute("SELECT mesa_id, total, status FROM pedidos WHERE id = %s", (pedido_id,))
    pedido_info = cursor.fetchone()
    
    if not pedido_info:
      flash(f'Pedido ID {pedido_id} no encontrado.', 'danger')
      return redirect(url_for('moza_comandas'))

    mesa_id, total, status = pedido_info
    
    if status == 'cerrado':
      flash(f'El pedido #{pedido_id} ya está cerrado.', 'warning')
      return redirect(url_for('moza_comandas'))
      
    # 2. Cerrar el Pedido (Actualizar status y registrar cierre)
    update_pedido_query = """
    UPDATE pedidos 
    SET status = 'cerrado', fecha_cierre = NOW(), usuario_cierre_id = %s
    WHERE id = %s
    """
    cursor.execute(update_pedido_query, (moza_id, pedido_id))
    
    # 3. Liberar la Mesa
    cursor.execute("UPDATE mesas SET status = 'disponible' WHERE id = %s", (mesa_id,))
    
    conn.commit()
    flash(f'¡Pago recibido! Comanda #{pedido_id} cerrada. Mesa {mesa_id} liberada. Total: S/ {total:.2f}', 'success')
    
  except Error as e:
    conn.rollback()
    flash(f'Error al cerrar la comanda: {e}', 'danger')
  finally:
    if conn and conn.is_connected():
      conn.close()
      
  return redirect(url_for('moza_comandas'))

@app.route('/libro-reclamaciones', methods=['GET'])
def libro_reclamaciones_view():
    """Vista pública del Libro de Reclamaciones."""
    # Nota: Asegúrate de tener una plantilla 'base.html' para esta vista pública.
    return render_template('libro_reclamaciones.html', title='Libro de Reclamaciones')


@app.route('/libro-reclamaciones', methods=['POST'])
def registrar_reclamacion():
    """Procesa y guarda el reclamo o queja en la BD MySQL."""
    
    conn = get_db_connection()
    if conn is None:
        flash('Error interno: No se pudo conectar a la base de datos.', 'danger')
        return redirect(url_for('libro_reclamaciones_view'))
        
    cursor = conn.cursor()
    
    try:
        # --- 1. CAPTURA Y VALIDACIÓN BÁSICA DE DATOS ---
        form_data = request.form
        
        # Generar código de reclamo único (R- + UUID corto)
        codigo_reclamo = 'R-' + str(uuid.uuid4())[:8].upper()
        
        # Determinar el tipo de documento
        num_doc = form_data.get('documento_identidad')
        tipo_doc = inferir_tipo_documento(num_doc)

        # Cálculo simple de fecha límite (15 días, sin descontar hábiles)
        # NOTA: Para ser estrictamente legal, se debe excluir fines de semana/feriados.
        # Esto es una simplificación.
        fecha_limite = (datetime.now() + timedelta(days=15)).strftime('%Y-%m-%d')
        
        # --- 2. INSERCIÓN EN LA BASE DE DATOS ---
        query = """
        INSERT INTO reclamaciones (
            codigo_reclamo, fecha_respuesta_limite, 
            tipo_documento, numero_documento, nombre_consumidor, 
            domicilio, telefono, email, 
            tipo_bien, monto_reclamado, descripcion_bien, 
            tipo_solicitud, detalle, pedido_consumidor
        ) VALUES (
            %s, %s, 
            %s, %s, %s, 
            %s, %s, %s, 
            %s, %s, %s, 
            %s, %s, %s
        )
        """
        data = (
            codigo_reclamo, fecha_limite,
            tipo_doc, num_doc, form_data.get('nombre_consumidor'),
            form_data.get('domicilio'), form_data.get('telefono'), form_data.get('email'),
            form_data.get('tipo_bien'), float(form_data.get('monto_reclamado', 0.00)), form_data.get('descripcion_bien'),
            form_data.get('tipo_solicitud'), form_data.get('detalle'), form_data.get('pedido_consumidor')
        )

        cursor.execute(query, data)
        conn.commit()
        
        # --- 3. RESPUESTA AL USUARIO ---
        flash(f'¡Reclamo **{codigo_reclamo}** registrado con éxito! Recibirás una respuesta antes del {fecha_limite}.', 'success')
        
    except Error as e:
        conn.rollback()
        flash(f'Error al procesar la reclamación. Intente de nuevo. Código de error: {e}', 'danger')
        
    except ValueError:
        flash('Error de formato en el monto reclamado.', 'danger')
        
    finally:
        cursor.close()
        conn.close()

    return redirect(url_for('libro_reclamaciones_view'))

# -----------------------------------------------------
# INICIO DE LA APLICACIÓN
# -----------------------------------------------------
if __name__ == '__main__':
    # Usar debug=True solo en desarrollo
    app.run(debug=True)