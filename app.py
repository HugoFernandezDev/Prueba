from flask import (
    Flask, render_template, request, redirect, url_for, 
    jsonify, flash, session, send_from_directory
)
import os
import time
from functools import wraps
from werkzeug.utils import secure_filename
import mysql.connector 
from mysql.connector import Error 
import hashlib 
from config import DB_CONFIG
import requests
import json

# --- Configuración de la Aplicación ---
app = Flask(__name__)
app.secret_key = 'clave_secreta_segura'  # Clave para encriptar sesiones

# Configuración de subida de archivos
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ============================================================================
# Funciones de Utilidad (Helpers)
# ============================================================================

def allowed_file(filename):
    """Verifica si la extensión del archivo es permitida."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    """Establece y retorna una conexión a la base de datos."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error conectando a MySQL: {e}")
        return None

def hash_password(password):
    """Hashea una contraseña usando SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

def admin_required(f):
    """Decorador para proteger rutas de administrador."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'rol' not in session or session['rol'] != 'admin':
            flash("Acceso denegado. Se requieren permisos de administrador.", "danger")
            return redirect(url_for('login')) # Redirigir al login normal
        return f(*args, **kwargs)
    return decorated_function

def login_required(f):
    """Decorador para proteger rutas que requieren inicio de sesión."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_id' not in session:
            flash("Debes iniciar sesión para acceder a esta página.", "warning")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ============================================================================
# Rutas Públicas (Cliente)
# ============================================================================

@app.route('/')
def index():
    """Sirve la página principal (Home)."""
    return render_template('index.html')

@app.route('/nosotros')
def nosotros():
    """Sirve la página 'Nosotros'."""
    return render_template('nosotros.html')

@app.route('/contacto', methods=['GET', 'POST'])
def contacto():
    """Sirve la página de contacto y procesa el formulario."""
    if request.method == 'POST':
        
        # --- CORRECCIONES AQUÍ ---
        # Asumimos que tu HTML usa name="nombre", name="correo", name="telefono", name="mensaje"
        
        nombre = request.form.get('nombre')
        email = request.form.get('email')   # <-- CAMBIADO DE 'email' A 'correo'
        """ telefono = request.form.get('telefono') """
        telefono = 999999999
        mensaje = request.form.get('mensaje')
        
        # --- FIN DE CORRECCIONES ---

        # Validación simple en el backend (¡siempre es buena idea!)
        if not nombre or not email or not telefono or not mensaje:
            flash("Todos los campos son obligatorios.", "danger")
            return redirect(url_for('contacto'))

        connection = get_db_connection()
        if connection:
            try:
                cursor = connection.cursor()
                query = "INSERT INTO contactos (nombre, email, telefono, mensaje) VALUES (%s, %s, %s, %s)"
                cursor.execute(query, (nombre, email, telefono, mensaje))
                connection.commit()
                flash("¡Mensaje enviado con éxito! Te responderemos pronto.", "success")
                print("DATOS GUARDADOS:", nombre, email) # <-- Tu print ahora sí se ejecutará
            except Error as e:
                print(f"Error al guardar contacto: {e}")
                flash("Error al enviar el mensaje. Inténtalo de nuevo.", "danger")
            finally:
                cursor.close()
                connection.close()
        else:
            flash("Error de conexión con la base de datos.", "danger")
        
        return redirect(url_for('contacto'))
        
    return render_template('contacto.html')

@app.route('/menu')
def menu():
    """Muestra el menú completo, agrupado por categorías."""
    categorias = []
    platos = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            # 1. Obtener categorías activas
            cursor.execute("SELECT * FROM categorias_menu WHERE status = 'activo' ORDER BY orden")
            categorias = cursor.fetchall()
            
            # 2. Obtener platos disponibles
            cursor.execute("SELECT * FROM platos WHERE status = 'disponible' ORDER BY nombre")
            platos = cursor.fetchall()
        except Error as e:
            print(f"Error al obtener menú: {e}")
            flash("Error al cargar el menú.", "danger")
        finally:
            cursor.close()
            connection.close()
            
    # El template (Jinja2) se encargará de agrupar los platos por categoría
    return render_template('menu.html', categorias=categorias, platos=platos)

# ============================================================================
# Rutas de Autenticación (Auth)
# ============================================================================

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Maneja el registro de nuevos usuarios (clientes)."""
    if request.method == 'POST':
        # Tu DB tiene: nombres, email, password, direccion, celular
        nombres = request.form['nombres']
        apellidos = request.form['apellidos']
        email = request.form['email']
        password = request.form['password']
        direccion = request.form['direccion']
        celular = request.form['celular']
        password_hash = hash_password(password)
        
        connection = get_db_connection()
        if connection:
            try:
                cursor = connection.cursor()
                # Verificar si el email ya existe
                cursor.execute("SELECT email FROM usuarios WHERE email = %s", (email,))
                if cursor.fetchone():
                    flash("El correo electrónico ya está registrado.", "warning")
                    return render_template('register.html')
                
                # Insertar nuevo usuario (rol 'cliente' por defecto)
                query = """
                    INSERT INTO usuarios (nombres, apellidos, email, password, direccion, celular, rol) 
                    VALUES (%s, %s, %s, %s, %s, %s, 'cliente')
                """
                cursor.execute(query, (nombres, apellidos, email, password_hash, direccion, celular))
                connection.commit()
                
                flash("¡Registro exitoso! Ahora puedes iniciar sesión.", "success")
                return redirect(url_for('login'))

            except Error as e:
                print(f"Error en registro: {e}")
                flash("Error al registrar. Intenta nuevamente.", "danger")
            finally:
                cursor.close()
                connection.close()
        else:
            flash("No se pudo conectar a la base de datos.", "danger")
        
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Maneja el inicio de sesión para clientes y administradores."""
    if request.method == 'POST':
        email = request.form['email']
        contraseña = request.form['contraseña']
        contraseña_hash = hash_password(contraseña)

        connection = get_db_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                query = "SELECT * FROM usuarios WHERE email = %s AND password = %s AND status = 'activo'"
                cursor.execute(query, (email, contraseña_hash))
                usuario = cursor.fetchone()

                if usuario:
                    # Limpiar sesión anterior
                    session.clear()
                    
                    # Guardar datos de sesión
                    session['usuario_id'] = usuario['id']
                    session['nombres'] = usuario['nombres']
                    session['email'] = usuario['email']
                    session['rol'] = usuario['rol'] # <-- ¡Muy importante!

                    # Actualizar 'ultima_sesion'
                    cursor.execute("UPDATE usuarios SET ultima_sesion = CURRENT_TIMESTAMP WHERE id = %s", (usuario['id'],))
                    connection.commit()
                    
                    # Redirigir según el rol
                    if usuario['rol'] == 'admin':
                        flash(f"¡Bienvenido Administrador {usuario['nombres']}!", "success")
                        return redirect(url_for('admin_dashboard'))
                    else:
                        flash(f"¡Bienvenido {usuario['nombres']}!", "success")
                        return redirect(url_for('index'))
                else:
                    flash('Credenciales incorrectas o cuenta inactiva.', 'danger')

            except Error as e:
                print(f"Error en login: {e}")
                flash('Error en el servidor durante el login.', 'danger')
            finally:
                cursor.close()
                connection.close()
        else:
            flash('No se pudo conectar a la base de datos.', 'danger')

    return render_template('login.html')

@app.route('/logout')
def logout():
    """Cierra la sesión del usuario o administrador."""
    session.clear() # Limpia todos los datos de la sesión
    flash("Has cerrado sesión.", "info")
    return redirect(url_for('index'))

# ============================================================================
# Rutas de Clientes (Autenticados)
# ============================================================================

@app.route('/reservar-mesa', methods=['GET', 'POST'])
@login_required
def reservar_mesa():
    """Permite a un usuario logueado reservar una mesa."""
    
    if request.method == 'POST':
        # --- Lógica POST (Tu código original) ---
        mesa_id = request.form.get('mesa_id')
        numero_personas = request.form.get('num_personas')
        fecha_reserva = request.form.get('fecha_reserva')
        hora_reserva = request.form.get('hora_reserva')
        notas = request.form.get('notas') # Asumo que tienes un campo de notas
        usuario_id = session['usuario_id']
        
        connection = get_db_connection()
        if connection:
            try:
                cursor = connection.cursor()
                query_reserva = """
                    INSERT INTO reservas (usuario_id, mesa_id, numero_personas, fecha_reserva, hora_reserva, notas) 
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                cursor.execute(query_reserva, (usuario_id, mesa_id, numero_personas, fecha_reserva, hora_reserva, notas))
                
                query_mesa = "UPDATE mesas SET status = 'reservada' WHERE id = %s"
                cursor.execute(query_mesa, (mesa_id,))
                
                connection.commit()
                flash("¡Tu mesa ha sido reservada con éxito!", "success")
                return redirect(url_for('mis_reservas'))
                
            except Error as e:
                connection.rollback()
                print(f"Error al crear reserva: {e}")
                flash("Error al procesar la reserva.", "danger")
            finally:
                cursor.close()
                connection.close()
        else:
            flash("Error de conexión con la base de datos.", "danger")

        # Si el POST falla, recargamos la página con los datos
        return redirect(url_for('reservar_mesa'))

    
    # --- Lógica GET (Modificada para incluir al usuario) ---
    mesas_disponibles = []
    usuario_data = None  # <-- INICIAMOS USUARIO
    connection = get_db_connection()
    
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # 1. OBTENER DATOS DEL USUARIO
            cursor.execute("SELECT nombres, apellidos, email, celular FROM usuarios WHERE id = %s", (session['usuario_id'],))
            usuario_data = cursor.fetchone()
            
            # 2. OBTENER MESAS OCUPADAS (para la fecha de HOY, como ejemplo)
            # ¡Tu JS debería hacer un fetch para actualizar esto cuando cambie la fecha!
            cursor.execute("SELECT mesa_id FROM reservas WHERE DATE(fecha_reserva) = CURDATE() AND status IN ('confirmada', 'pendiente')")
            mesas_ocupadas_raw = cursor.fetchall()
            # Convertir lista de diccionarios a lista de IDs
            mesas_ocupadas_list = [m['mesa_id'] for m in mesas_ocupadas_raw]
            
        except Error as e:
            print(f"Error al obtener datos para reserva: {e}")
            flash("Error al cargar la página de reservas.", "danger")
        finally:
            cursor.close()
            connection.close()
            
    # <-- PASAMOS EL USUARIO AL TEMPLATE
    return render_template('reservas.html', mesas_ocupadas=mesas_ocupadas_list, usuario=usuario_data)
    
    # --- Lógica GET ---
    # Cargar mesas disponibles para el formulario
    mesas_disponibles = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT id, numero_mesa, capacidad, ubicacion FROM mesas WHERE status = 'disponible'")
            mesas_disponibles = cursor.fetchall()
        except Error as e:
            print(f"Error al obtener mesas: {e}")
        finally:
            cursor.close()
            connection.close()
            
    return render_template('reservas.html', mesas=mesas_disponibles)

@app.route('/reservar', methods=['GET'])
def mostrar_reserva():
    """Sirve la página del formulario de reserva."""
    # Renderizamos la plantilla HTML que contiene el formulario y la lógica JS/Firestore.
    return render_template('reservar.html')

@app.route('/mis-reservas')
@login_required
def mis_reservas():
    """Muestra el historial de reservas de MESA del usuario."""
    reservas = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT r.*, m.numero_mesa, m.ubicacion
                FROM reservas r
                JOIN mesas m ON r.mesa_id = m.id
                WHERE r.usuario_id = %s
                ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC
            """
            cursor.execute(query, (session['usuario_id'],))
            reservas = cursor.fetchall()
        except Error as e:
            print(f"Error al obtener mis reservas: {e}")
        finally:
            cursor.close()
            connection.close()
    
    return render_template('mis_reservas.html', reservas=reservas)

@app.route('/mis-pedidos')
@login_required
def mis_pedidos():
    """Muestra el historial de PEDIDOS DE COMIDA del usuario."""
    pedidos = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            # 1. Obtener todos los pedidos del usuario
            query_pedidos = """
                SELECT p.id, p.fecha_pedido, p.total, p.status, m.numero_mesa
                FROM pedidos p
                LEFT JOIN mesas m ON p.mesa_id = m.id
                WHERE p.usuario_id = %s
                ORDER BY p.fecha_pedido DESC
            """
            cursor.execute(query_pedidos, (session['usuario_id'],))
            pedidos = cursor.fetchall()
            
            # 2. (Opcional) Para cada pedido, obtener sus detalles
            # Esto puede ser lento (N+1 query), es mejor hacerlo con un JOIN complejo
            # o en la misma consulta si el volumen de datos no es muy grande.
            # Por simplicidad, solo mostraremos el resumen del pedido.

        except Error as e:
            print(f"Error al obtener mis pedidos: {e}")
        finally:
            cursor.close()
            connection.close()
    
    return render_template('mis_pedidos.html', pedidos=pedidos)

# ============================================================================
# Rutas de Administración (Protegidas)
# ============================================================================

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    """Panel principal de administración con estadísticas."""
    stats = {}
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Usar 'AS total' para que el fetchone() funcione
            cursor.execute("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'cliente'")
            stats['total_usuarios'] = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) AS total FROM platos WHERE status = 'disponible'")
            stats['total_platos'] = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) AS total FROM reservas WHERE status = 'pendiente'")
            stats['reservas_pendientes'] = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) AS total FROM pedidos WHERE status = 'en_preparacion'")
            stats['pedidos_en_cocina'] = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) AS total FROM reservas WHERE DATE(fecha_reserva) = CURDATE()")
            stats['reservas_hoy'] = cursor.fetchone()['total']
            
        except Error as e:
            print(f"Error obteniendo estadísticas: {e}")
        finally:
            cursor.close()
            connection.close()
    
    return render_template('admin/dashboard.html', stats=stats)

# --- CRUD: CATEGORÍAS ---

@app.route('/admin/categorias')
@admin_required
def admin_categorias():
    """Muestra la lista de categorías del menú."""
    categorias = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM categorias_menu ORDER BY orden")
            categorias = cursor.fetchall()
        except Error as e:
            print(f"Error obteniendo categorías: {e}")
        finally:
            cursor.close()
            connection.close()
    return render_template('admin/categorias.html', categorias=categorias)

@app.route('/admin/categorias/agregar', methods=['POST'])
@admin_required
def admin_categoria_agregar():
    """Agrega una nueva categoría."""
    nombre = request.form.get('nombre')
    descripcion = request.form.get('descripcion')
    orden = request.form.get('orden', 0)
    
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = "INSERT INTO categorias_menu (nombre, descripcion, orden) VALUES (%s, %s, %s)"
            cursor.execute(query, (nombre, descripcion, orden))
            connection.commit()
            flash("Categoría agregada exitosamente.", "success")
        except Error as e:
            print(f"Error agregando categoría: {e}")
            flash("Error al agregar categoría.", "danger")
        finally:
            cursor.close()
            connection.close()
    return redirect(url_for('admin_categorias'))

@app.route('/admin/categorias/editar', methods=['POST'])
@admin_required
def admin_categoria_editar():
    """Actualiza una categoría existente."""
    id_cat = request.form.get('id')
    nombre = request.form.get('nombre')
    descripcion = request.form.get('descripcion')
    orden = request.form.get('orden')
    status = request.form.get('status')
    
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = """
                UPDATE categorias_menu 
                SET nombre = %s, descripcion = %s, orden = %s, status = %s 
                WHERE id = %s
            """
            cursor.execute(query, (nombre, descripcion, orden, status, id_cat))
            connection.commit()
            flash("Categoría actualizada.", "success")
        except Error as e:
            print(f"Error editando categoría: {e}")
            flash("Error al editar categoría.", "danger")
        finally:
            cursor.close()
            connection.close()
    return redirect(url_for('admin_categorias'))

# --- CRUD: PLATOS ---

@app.route('/admin/platos')
@admin_required
def admin_platos():
    """Muestra la lista de todos los platos."""
    platos = []
    categorias = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            # Obtener platos con el nombre de la categoría
            query_platos = """
                SELECT p.*, c.nombre as categoria_nombre 
                FROM platos p 
                LEFT JOIN categorias_menu c ON p.categoria_id = c.id
                ORDER BY p.categoria_id, p.nombre
            """
            cursor.execute(query_platos)
            platos = cursor.fetchall()
            
            # Obtener categorías para el formulario de "Agregar"
            cursor.execute("SELECT id, nombre FROM categorias_menu WHERE status = 'activo' ORDER BY nombre")
            categorias = cursor.fetchall()
            
        except Error as e:
            print(f"Error obteniendo platos: {e}")
            flash("Error al cargar los platos.", "danger")
        finally:
            cursor.close()
            connection.close()
    return render_template('admin/platos.html', platos=platos, categorias=categorias)

@app.route('/admin/platos/agregar', methods=['POST'])
@admin_required
def admin_platos_agregar():
    """Agrega un nuevo plato (lógica POST)."""
    categoria_id = request.form.get('categoria_id')
    nombre = request.form.get('nombre')
    descripcion = request.form.get('descripcion')
    precio = request.form.get('precio')
    tiempo = request.form.get('tiempo_preparacion')
    ingredientes = request.form.get('ingredientes')
    es_vegetariano = 'es_vegetariano' in request.form
    es_picante = 'es_picante' in request.form
    
    imagen_url = None
    if 'imagen' in request.files:
        file = request.files['imagen']
        if file and file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{int(time.time())}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(filepath)
            imagen_url = unique_filename # Guardar solo el nombre del archivo
            
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = """
                INSERT INTO platos (categoria_id, nombre, descripcion, precio, imagen_url, 
                                    tiempo_preparacion, ingredientes, es_vegetariano, es_picante)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (categoria_id, nombre, descripcion, precio, imagen_url,
                                   tiempo, ingredientes, es_vegetariano, es_picante))
            connection.commit()
            flash(f"Plato '{nombre}' agregado exitosamente.", "success")
        except Error as e:
            print(f"Error agregando plato: {e}")
            flash("Error al agregar el plato.", "danger")
        finally:
            cursor.close()
            connection.close()
    
    return redirect(url_for('admin_platos'))

@app.route('/admin/platos/editar/<int:id>', methods=['GET', 'POST'])
@admin_required
def admin_platos_editar(id):
    """Muestra el formulario para editar un plato (GET) y procesa la actualización (POST)."""
    
    connection = get_db_connection()
    if not connection:
        flash("Error de conexión.", "danger")
        return redirect(url_for('admin_platos'))
    
    if request.method == 'POST':
        categoria_id = request.form.get('categoria_id')
        nombre = request.form.get('nombre')
        descripcion = request.form.get('descripcion')
        precio = request.form.get('precio')
        tiempo = request.form.get('tiempo_preparacion')
        ingredientes = request.form.get('ingredientes')
        es_vegetariano = 'es_vegetariano' in request.form
        es_picante = 'es_picante' in request.form
        status = request.form.get('status')
        
        try:
            cursor = connection.cursor()
            
            # Lógica para actualizar imagen (igual a tu código original)
            if 'imagen' in request.files:
                file = request.files['imagen']
                if file and file.filename != '' and allowed_file(file.filename):
                    # ... (lógica para borrar imagen anterior y guardar la nueva) ...
                    # ... (aquí iría la query con UPDATE ... SET imagen_url = %s) ...
                    pass # Implementar lógica de subida de imagen

            # Query para actualizar sin cambiar la imagen
            query = """
                UPDATE platos SET 
                    categoria_id = %s, nombre = %s, descripcion = %s, precio = %s, 
                    tiempo_preparacion = %s, ingredientes = %s, es_vegetariano = %s, 
                    es_picante = %s, status = %s
                WHERE id = %s
            """
            cursor.execute(query, (categoria_id, nombre, descripcion, precio, tiempo, 
                                   ingredientes, es_vegetariano, es_picante, status, id))
            connection.commit()
            flash("Plato actualizado.", "success")
        except Error as e:
            print(f"Error editando plato: {e}")
            flash("Error al editar el plato.", "danger")
        finally:
            cursor.close()
            connection.close()
            
        return redirect(url_for('admin_platos'))

    # --- Lógica GET ---
    # Cargar datos del plato y categorías para poblar el formulario
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM platos WHERE id = %s", (id,))
        plato = cursor.fetchone()
        
        cursor.execute("SELECT id, nombre FROM categorias_menu WHERE status = 'activo'")
        categorias = cursor.fetchall()
        
        if not plato:
            flash("Plato no encontrado.", "danger")
            return redirect(url_for('admin_platos'))
            
        return render_template('admin/editar_plato.html', plato=plato, categorias=categorias)
        
    except Error as e:
        print(f"Error cargando plato para editar: {e}")
        flash("Error al cargar el plato.", "danger")
        return redirect(url_for('admin_platos'))
    finally:
        # No cerrar la conexión aquí si 'cursor' no fue asignado (en caso de fallo de conexión)
        if 'cursor' in locals() and cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Sirve los archivos de imagen subidos."""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- CRUD: MESAS ---

@app.route('/admin/mesas')
@admin_required
def admin_mesas():
    """Muestra la lista de mesas y formulario para agregar."""
    mesas = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM mesas ORDER BY numero_mesa")
            mesas = cursor.fetchall()
        except Error as e:
            print(f"Error obteniendo mesas: {e}")
        finally:
            cursor.close()
            connection.close()
    return render_template('admin/mesas.html', mesas=mesas)

@app.route('/admin/mesas/agregar', methods=['POST'])
@admin_required
def admin_mesas_agregar():
    """Agrega una nueva mesa."""
    numero_mesa = request.form.get('numero_mesa')
    capacidad = request.form.get('capacidad')
    ubicacion = request.form.get('ubicacion')
    descripcion = request.form.get('descripcion')
    
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = "INSERT INTO mesas (numero_mesa, capacidad, ubicacion, descripcion) VALUES (%s, %s, %s, %s)"
            cursor.execute(query, (numero_mesa, capacidad, ubicacion, descripcion))
            connection.commit()
            flash("Mesa agregada.", "success")
        except Error as e:
            print(f"Error agregando mesa: {e}")
            flash("Error al agregar mesa (¿número duplicado?).", "danger")
        finally:
            cursor.close()
            connection.close()
    return redirect(url_for('admin_mesas'))

@app.route('/admin/mesas/actualizar_status', methods=['POST'])
@admin_required
def admin_mesas_actualizar_status():
    """Actualiza el estado de una mesa (ej. 'disponible', 'mantenimiento')."""
    id_mesa = request.form.get('id')
    status = request.form.get('status')
    
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = "UPDATE mesas SET status = %s WHERE id = %s"
            cursor.execute(query, (status, id_mesa))
            connection.commit()
            flash("Estado de la mesa actualizado.", "success")
        except Error as e:
            print(f"Error actualizando estado de mesa: {e}")
            flash("Error al actualizar.", "danger")
        finally:
            cursor.close()
            connection.close()
    return redirect(url_for('admin_mesas'))


# --- GESTIÓN: RESERVAS Y PEDIDOS ---

@app.route('/admin/reservas')
@admin_required
def admin_reservas():
    """Muestra todas las reservas de mesas."""
    reservas = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            # Query corregida: une con usuarios y mesas
            query = """
                SELECT r.*, u.nombres as usuario_nombre, m.numero_mesa
                FROM reservas r
                JOIN usuarios u ON r.usuario_id = u.id
                JOIN mesas m ON r.mesa_id = m.id
                ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC
            """
            cursor.execute(query)
            reservas = cursor.fetchall()
        except Error as e:
            print(f"Error obteniendo reservas: {e}")
            flash("Error al cargar reservas.", "danger")
        finally:
            cursor.close()
            connection.close()
    return render_template('admin/reservas.html', reservas=reservas)

@app.route('/admin/reservas/actualizar_status', methods=['POST'])
@admin_required
def admin_reservas_actualizar_status():
    """Actualiza el estado de una reserva (confirmada, cancelada, etc.)."""
    id_reserva = request.form.get('id')
    status = request.form.get('status')
    
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            # Query corregida: actualiza 'status'
            query = "UPDATE reservas SET status = %s WHERE id = %s"
            cursor.execute(query, (status, id_reserva))
            
            # Lógica extra: Si se cancela o completa, liberar la mesa
            if status in ['completada', 'cancelada', 'no_asistio']:
                # Obtener el mesa_id de esta reserva
                cursor.execute("SELECT mesa_id FROM reservas WHERE id = %s", (id_reserva,))
                resultado = cursor.fetchone()
                if resultado:
                    mesa_id = resultado[0]
                    # Poner mesa como 'disponible'
                    cursor.execute("UPDATE mesas SET status = 'disponible' WHERE id = %s", (mesa_id,))

            connection.commit()
            flash("Estado de la reserva actualizado.", "success")
        except Error as e:
            connection.rollback()
            print(f"Error actualizando estado de reserva: {e}")
            flash("Error al actualizar.", "danger")
        finally:
            cursor.close()
            connection.close()
    return redirect(url_for('admin_reservas'))

@app.route('/admin/pedidos')
@admin_required
def admin_pedidos():
    """Muestra todos los pedidos de comida (cocina, caja)."""
    pedidos = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT p.*, u.nombres as usuario_nombre, m.numero_mesa
                FROM pedidos p
                LEFT JOIN usuarios u ON p.usuario_id = u.id
                LEFT JOIN mesas m ON p.mesa_id = m.id
                WHERE p.status NOT IN ('entregado', 'cancelado')
                ORDER BY p.fecha_pedido ASC
            """
            cursor.execute(query)
            pedidos = cursor.fetchall()
        except Error as e:
            print(f"Error obteniendo pedidos: {e}")
            flash("Error al cargar pedidos.", "danger")
        finally:
            cursor.close()
            connection.close()
    return render_template('admin/pedidos.html', pedidos=pedidos)

@app.route('/admin/pedidos/ver/<int:id>')
@admin_required
def admin_pedidos_ver(id):
    """Muestra el detalle de un pedido específico."""
    pedido = None
    detalles = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            # 1. Obtener el pedido principal
            query_pedido = """
                SELECT p.*, u.nombres as usuario_nombre, m.numero_mesa
                FROM pedidos p
                LEFT JOIN usuarios u ON p.usuario_id = u.id
                LEFT JOIN mesas m ON p.mesa_id = m.id
                WHERE p.id = %s
            """
            cursor.execute(query_pedido, (id,))
            pedido = cursor.fetchone()
            
            # 2. Obtener los detalles (platos) de ese pedido
            query_detalles = """
                SELECT d.*, pl.nombre as plato_nombre
                FROM detalle_pedidos d
                JOIN platos pl ON d.plato_id = pl.id
                WHERE d.pedido_id = %s
            """
            cursor.execute(query_detalles, (id,))
            detalles = cursor.fetchall()
            
        except Error as e:
            print(f"Error viendo detalle de pedido: {e}")
            flash("Error al cargar el pedido.", "danger")
        finally:
            cursor.close()
            connection.close()
            
    if not pedido:
        flash("Pedido no encontrado.", "danger")
        return redirect(url_for('admin_pedidos'))
        
    return render_template('admin/pedido_detalle.html', pedido=pedido, detalles=detalles)

# ============================================================================
# Ruta para el Chatbot
# ============================================================================
@app.route('/chatbot', methods=['POST'])
def chatbot_response():
    """Recibe un mensaje del usuario y devuelve la respuesta del chatbot."""
    
    # --- 1. Obtener el mensaje del usuario ---
    data = request.get_json()
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
    api_key = "AIzaSyAWHd8zye_oDfWuhtlFgW6wc0Fiv6Y1vzs"
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key={api_key}"
    
    # Instrucción del sistema para darle contexto al chatbot
    system_prompt = """Eres 'SumaqBot', un asistente virtual amigable y servicial del restaurante Sumak Mikuy. 
    Tu objetivo es ayudar a los clientes con sus preguntas sobre el restaurante. 
    Puedes responder sobre:
    - El menú (platos, ingredientes generales, si son picantes/vegetarianos).
    - Horarios de atención (Sábado y Domingo de 7am a 7pm).
    - Cómo hacer una reserva (dirigiendo al usuario a la página de reservas).
    - La ubicación (Calle Miraflores Mz 39, San Luis, Cañete).
    - Información general del restaurante (cocina andina, ambiente).
    Sé conciso, amable y mantén el tono del restaurante. 
    Si no sabes la respuesta o te preguntan algo fuera de tema, indica amablemente que solo puedes ayudar con información sobre Sumak Mikuy."""

    payload = {
        "contents": [{"parts": [{"text": user_message}]}],
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        }
    }

    headers = {'Content-Type': 'application/json'}

    # --- 3. Llamar a la API de Gemini ---
    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=60) # Timeout de 60 segundos
        response.raise_for_status()  # Lanza un error si la respuesta es 4xx o 5xx
        
        result = response.json()
        
        # --- 4. Extraer la respuesta del bot ---
        # La estructura puede variar ligeramente, esto es lo más común
        bot_response = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'Lo siento, no pude procesar tu solicitud en este momento.')

        return jsonify({"response": bot_response})

    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        # Enviar un mensaje de error genérico al usuario
        error_message = "Hubo un problema al conectar con el asistente. Por favor, intenta de nuevo más tarde."
        # Podrías verificar e.response para errores específicos de la API si lo necesitas
        # if e.response is not None:
        #     print(f"API Error Response: {e.response.text}")
        return jsonify({"response": error_message}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"response": "Ocurrió un error inesperado."}), 500

# --- PUNTO DE ENTRADA ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)