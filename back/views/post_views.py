# views/post_views.py (CÓDIGO CORREGIDO Y COMPLETO)

from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

# --- CORRECCIONES DE IMPORTACIÓN ---
from schemas.schemas import PostSchema
from decorators.decorators import post_admin_myid_required
from services.post_services import PostService 

# --- BLUEPRINT SETUP ---
post_bp = Blueprint('post_api', __name__) 
post_service = PostService()

# -------------------------------------------------------------
# Reemplaza PostAPI.get() y PostAPI.post() para /posts
# -------------------------------------------------------------

@post_bp.route('/', methods=['GET'])
def list_all_posts():
    """Listar todos los posts (Público)."""
    # Esta función puede ser reutilizada para listados públicos si el service maneja el filtro de is_active=True
    # Pero usaremos get_all_post() que debe devolver todos (activos e inactivos)
    posts = post_service.get_all_post()
    return PostSchema(many=True).dump(posts), 200

# -------------------------------------------------------------
# NUEVA RUTA: GET /posts/active
# -------------------------------------------------------------
@post_bp.route('/active', methods=['GET'])
def list_all_active_posts():
    """Listar solo posts que están activos (Público)."""
    try:
        # Llama al método del servicio para obtener solo activos (get_active_post)
        posts = post_service.get_active_post()
        
        if not posts:
            return {"message": "No se encontraron posts activos."}, 404
            
        return PostSchema(many=True).dump(posts), 200
        
    except Exception as e:
        return {"Error": str(e)}, 500

@post_bp.route('/', methods=['POST'])
@jwt_required()
def create_new_post():
    """Crear un nuevo post (Usuario autenticado)."""
    try:
        data = PostSchema().load(request.json)
        user_id = get_jwt_identity()
        new_post = post_service.new_post(data, user_id)
        return {"message" :f"post publicado con exito. Post: {PostSchema().dump(new_post)}"}, 200
    except ValidationError as error:
        return {"Error": error.messages}, 400
    except Exception as error:
        return {"Error": str(error)}, 500       

# -------------------------------------------------------------
# RUTA: Filtrado por Categoría
# -------------------------------------------------------------
@post_bp.route('/category/<int:categoria_id>', methods=['GET'])
def get_posts_by_category(categoria_id):
    """Obtiene posts filtrados por ID de Categoría (Público)."""
    try:
        posts = post_service.get_posts_by_category(categoria_id)
        
        if not posts:
            return {"message": f"No se encontraron posts para la categoría ID: {categoria_id}"}, 404
            
        return PostSchema(many=True).dump(posts), 200
    
    except Exception as e:
        return {"message": "Error al listar posts por categoría", "error": str(e)}, 500

# -------------------------------------------------------------
# Reemplaza PostDetailAPI (GET, PUT, DELETE) para /posts/<int:id>
# -------------------------------------------------------------

@post_bp.route('/<int:id>', methods=['GET'])
def get_post_detail(id):
    """Ver un post específico por ID (Público)."""
    post = post_service.get_by_id(id)
    # Corrección: Verifica que el post exista Y esté activo
    if not post or not post.is_active: 
        return {"error": "El post que busca ya no está disponible"}, 404
    return PostSchema().dump(post), 200
    
@post_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@post_admin_myid_required
def update_existing_post(id):
    """Actualizar un post (Autor, Moderador o Admin)."""
    try:
        data = PostSchema(partial=True).load(request.json)
        post = post_service.update_post(id, data)
        return PostSchema().dump(post), 200
    except ValidationError as error:
        return {"Error": error.messages}, 400

@post_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@post_admin_myid_required
def delete_existing_post(id):
    """Eliminar un post (Autor, Moderador o Admin)."""
    try:
        post_service.delete_post(id)
        return {"message": "Post eliminado"}, 200
    except Exception as error:
        return {"error": str(error)}, 400