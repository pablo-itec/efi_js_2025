# Efi2_python_2025/config_vars.py (CREACIÓN FINAL)

# --- Configuración de Base de Datos ---
# Usa los datos de tu configuración original
SQLALCHEMY_DATABASE_URI = (
    "mysql+pymysql://root:leli@localhost/efipp1"
)
SQLALCHEMY_TRACK_NOTIFICATIONS = False

# --- Configuración de Seguridad ---
JWT_SECRET_KEY = 'cualquier-cosa' 

# --- Configuración de CORS ---
REACT_ORIGIN = "http://localhost:5173" 
CORS_RESOURCES = {r"/app/*": {"origins": REACT_ORIGIN}}