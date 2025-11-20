# views/user_view.py (CÓDIGO CORREGIDO)

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

# --- CORRECCIONES DE IMPORTACIÓN ---
# 1. 'schemas/schemas' (Nombre real del archivo)
from schemas.schemas import UserSchema 
# 2. 'decorators/decorators' (Nombre real del archivo)
from decorators.decorators import roles_required, admin_or_myid_required 
# 3. 'services/user_services' (Nombre real del archivo y clase)
from services.user_services import UserService 

# --- BLUEPRINT SETUP ---
# El Blueprint se registrará con url_prefix='/users' en app.py
user_bp = Blueprint('user_api', __name__) 

# Instancia del Service (usando el nombre original 'UserService')
user_service = UserService() 

# -------------------------------------------------------------
# Reemplaza UserAPI.get() para GET /users
# -------------------------------------------------------------
@user_bp.route('', methods=['GET'])
@jwt_required()
@roles_required("admin")
def list_all_users():
    """Ver todos los usuarios (Solo admin)."""
    # Llamada al método original: get_all_users()
    users = user_service.get_all_users()
    # Uso del Schema original: UserSchema
    return UserSchema(many=True).dump(users), 200

# -------------------------------------------------------------
# Reemplaza UserDetailAPI (GET, PUT, PATCH, DELETE) para /users/<int:id> y /users/<int:id>/role
# -------------------------------------------------------------

@user_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@roles_required("moderator", "user", "admin")
@admin_or_myid_required
def get_user_details(id):
    """Obtiene los detalles del usuario por ID."""
    # Llamada al método original: get_user_details()
    user = user_service.get_user_details(id)
    return UserSchema().dump(user), 200

@user_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@roles_required("moderator", "user", "admin")
@admin_or_myid_required
def update_user_profile(id):
    """Actualiza datos del perfil (método PUT)."""
    try:
        # Llamada al método original: update_user_profile()
        updated_user = user_service.update_user_profile(id, request.json) 
        return UserSchema().dump(updated_user), 200      
    except ValidationError as error:
        return {"errors": error.messages}, 400
    except Exception as error:
        return {"error": f"No se pudo cambiar los datos: {str(error)}"}, 400

@user_bp.route('/<int:id>/role/', methods=['PATCH'])
@jwt_required()
@roles_required("admin")
def change_user_role(id):
    """Cambiar roles de un usuario (Solo admin)."""
    try:
        # Llamada al método original: change_role()
        update_user = user_service.change_role(id, request.json)
        return {"message": f"El rol de '{update_user.name}' actualizado a '{update_user.credential.role}'"}, 200
    except ValueError as error:
        return {"Error": str(error)}, 400
    except Exception as error:
        return {"Error": "No se pudo asignar el role"}, 400
    
@user_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@roles_required("admin")
def soft_delete_user(id):
    """Desactivar usuario (Soft Delete) (Solo admin)."""
    try:
        # Llamada al método original: softdelete_user()
        user_service.softdelete_user(id)
        return {"message": f"Usuario {id} desactivado correctamente"}, 200
    except ValueError as error:
        return {"Error": str(error)}, 404
    except Exception as error:
        return {"Error": f"Error al eliminar el usuario: {str(error)}"}, 400