# app.py (CÓDIGO CORREGIDO Y LIMPIO)

#-------------------------------------------------------------
#IMPORTS
#-------------------------------------------------------------
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models.models import (
    db,
    User,
    Post,
)
from flask_migrate import Migrate

# --- IMPORTACIÓN DE BLUEPRINTS ---
# 1. Rutas de Autenticación (Login, Register)
from views.views import auth_bp
# 2. Rutas de Usuarios (CRUD)
from views.user_view import user_bp
# 3. Rutas de Estadísticas
from views.stats_views import stats_bp
# 4. Rutas de Posts
from views.post_views import post_bp
# 5. Rutas de Categorías
from views.categories_views import categorie_bp
# 6. Rutas de Comentarios
from views.comments_views import post_comments_bp, comment_detail_bp 


#-------------------------------------------------------------
#INICIA FLASK, SQL, ETC
#-------------------------------------------------------------
app = Flask(__name__)

# Configuración del Frontend de React
REACT_ORIGIN = "http://localhost:5173" 

# --- CORRECCIÓN DE CORS ---
# Permitir TODAS las rutas (r"/*") desde CUALQUIER origen ("*").
# La configuración anterior (r"/app/*") bloqueaba tus llamadas a /login, /posts, etc.
CORS(app, resources={r"/*": {"origins": "*"}})
# --------------------------


# Configuración de la Base de Datos
app.config['SQLALCHEMY_DATABASE_URI'] = (
    "mysql+pymysql://root:shurta@localhost/py_efi2_db" 
)
app.config['SQLALCHEMY_TRACK_NOTIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'cualquier-cosa'

jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)


#-------------------------------------------------------------
# REGISTRO DE BLUEPRINTS
#-------------------------------------------------------------

# 1. Autenticación (Login, Register)
app.register_blueprint(auth_bp) 

# 2. Usuarios. Prefijo: /users
app.register_blueprint(user_bp, url_prefix='/users') 

# 3. Estadísticas. Prefijo: /stats
app.register_blueprint(stats_bp, url_prefix='/stats') 

# 4. Posts. Prefijo: /posts
app.register_blueprint(post_bp, url_prefix='/posts')

# 5. Categorías. Prefijo: /categories
app.register_blueprint(categorie_bp, url_prefix='/categories')

# 6. Comentarios
#    - Rutas /posts/<int:id>/comments (GET, POST)
app.register_blueprint(post_comments_bp)
#    - Rutas /comments/<int:id> (DELETE)
app.register_blueprint(comment_detail_bp)

#-------------------------------------------------------------
# RUN
#-------------------------------------------------------------

if __name__ == '__main__':
    with app.app_context():
        # Creamos las tablas si no existen
        db.create_all() 
    app.run(debug=True)
