import os

class Config:
    # Clave secreta para la seguridad de las sesiones de Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'una_clave_secreta_muy_dificil_de_adivinar'
    
    # Configuración de la Base de Datos MySQL (ajusta estos valores)
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'diosito'
    MYSQL_PASSWORD = 'amen' # ¡CAMBIA ESTO!
    MYSQL_DB = 'sumak_mikuy'
    MYSQL_PORT = 3306

    # Roles de usuario para fácil referencia
    ROLES = {
        'ADMIN': 'admin',
        'MOZA': 'moza',
        'CLIENTE': 'cliente',
        'COCINA': 'cocina'
    }

    # Ruta para redirigir tras un login exitoso
    LOGIN_SUCCESS_REDIRECT = {
        'admin': '/admin/dashboard',
        'moza': '/moza/comandas',
        'cliente': '/' # Los clientes no tienen dashboard dedicado en este sistema
    }

# Simulación de la clave secreta para el entorno local
if not os.environ.get('SECRET_KEY'):
    print("ADVERTENCIA: Usando clave secreta por defecto. Define SECRET_KEY en producción.")