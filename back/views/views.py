# views/views.py (CÓDIGO CORREGIDO: AUTENTICACIÓN BLUEPRINT)

from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from flask_jwt_extended import create_access_token
from passlib.hash import bcrypt
from datetime import timedelta

# --- CORRECCIONES DE IMPORTACIÓN ---
# Apuntamos a los archivos y clases originales: models.py -> User, UserCredentials
from models.models import User, UserCredentials 
# Apuntamos a los archivos y clases originales: schemas.py -> RegisterSchema, LoginSchema, UserSchema 
from schemas.schemas import RegisterSchema, LoginSchema, UserSchema 
from models.models import db # <--- ¡CORRECTO! Importar 'db' desde models.models

# --- BLUEPRINT SETUP ---
# Define un Blueprint para las rutas de autenticación
auth_bp = Blueprint('auth_api', __name__)

# -------------------------------------------------------------
# Reemplaza la clase UserRegisterAPI(MethodView) para /register
# -------------------------------------------------------------
@auth_bp.route('/register', methods=['POST'])
def register_user(): 
    """Registro de cuentas."""
    try:
        data = RegisterSchema().load(request.json)
    except ValidationError as err:
        return {"Error": err.messages}, 400
    
    # Usamos el modelo ORIGINAL: User
    if User.query.filter_by(email=data['email']).first():
        return {"Error": "Email en uso"}, 409

    password_hash = bcrypt.hash(data['password'])

    # Usamos el modelo y la variable ORIGINAL: new_user
    new_user = User(name=data["username"], email=data['email']) 
    db.session.add(new_user)
    db.session.flush() # Necesario para obtener new_user.id
    
    # Usamos el modelo ORIGINAL: UserCredentials
    credentials = UserCredentials(
        user_id=new_user.id,
        password_hash=password_hash,
        role=data['role'] 
    )
    db.session.add(credentials)
    db.session.commit()

    # Usamos el Schema ORIGINAL: UserSchema
    return {"message": "Usuario creado", "user_id": new_user.id, "user_details": UserSchema().dump(new_user)}, 201

# -------------------------------------------------------------
# Reemplaza la clase AuthLoginAPI(MethodView) para /login
# -------------------------------------------------------------
@auth_bp.route('/login', methods=['POST'])
def login_user(): 
    """Autenticación al loguearse."""
    try:
        data = LoginSchema().load(request.json)
    except ValidationError as err:
        return {"errors": err.messages}, 400

    # Usamos el modelo ORIGINAL: User. La variable es 'user'
    user = User.query.filter_by(email=data["email"]).first()
    
    # La credencial está en user.credential
    if not user or not user.credential:
        return {"errors": {"credentials": ["Inválidas"]}}, 401
        
    if not bcrypt.verify(data["password"], user.credential.password_hash):
        return {"errors": {"credentials": ["Inválidas"]}}, 401
        
    # Creación del token usando la terminología ORIGINAL
    identity = str(user.id)
    additional_claims = {
        "id": user.id,
        "email": user.email,
        "role": user.credential.role,
        "username": user.name
    }
    
    token = create_access_token(
        identity=identity,
        additional_claims=additional_claims,
        # *****************cambio temporal, para facilitar el test*************************
        expires_delta=timedelta(minutes=60)
    )
    
    return jsonify(access_token=token), 200