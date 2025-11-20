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
from views.views import auth_bp
from views.user_view import user_bp
from views.stats_views import stats_bp
from views.post_views import post_bp
from views.categories_views import categorie_bp
from views.comments_views import post_comments_bp, comment_detail_bp 


#-------------------------------------------------------------
#INICIA FLASK, SQL, ETC
#-------------------------------------------------------------
app = Flask(__name__)

# Configuración del Frontend de React
REACT_ORIGIN = "http://localhost:5173" 
# Permitir los posibles orígenes de tu entorno de desarrollo (localhost y 127.0.0.1)
ALLOWED_ORIGINS = [REACT_ORIGIN, "http://127.0.0.1:5173"]

# --- CORRECCIÓN DE CORS ---
# Permite los orígenes de React y habilita el soporte de credenciales (supports_credentials=True)
# Esto es necesario para que el navegador envíe el token JWT en el header 'Authorization'.
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS, "supports_credentials": True}})
# --------------------------


# Configuración de la Base de Datos
app.config['SQLALCHEMY_DATABASE_URI'] = (
    "mysql+pymysql://root:root2205@localhost/py_efi2_db" 
)
app.config['SQLALCHEMY_TRACK_NOTIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'cualquier-cosa'

jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)


#-------------------------------------------------------------
# REGISTRO DE BLUEPRINTS
#-------------------------------------------------------------

app.register_blueprint(auth_bp) 
app.register_blueprint(user_bp, url_prefix='/users') 
app.register_blueprint(stats_bp, url_prefix='/stats') 
app.register_blueprint(post_bp, url_prefix='/posts')
app.register_blueprint(categorie_bp, url_prefix='/categories')
app.register_blueprint(post_comments_bp)
app.register_blueprint(comment_detail_bp)

#-------------------------------------------------------------
# RUN
#-------------------------------------------------------------

if __name__ == '__main__':
    with app.app_context():
        # Creamos las tablas si no existen
        db.create_all() 
    app.run(debug=True)