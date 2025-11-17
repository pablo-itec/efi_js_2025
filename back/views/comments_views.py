# views/comments_views.py (CÓDIGO CORREGIDO)

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

# --- CORRECCIONES DE IMPORTACIÓN ---
# Apuntamos a los archivos y clases originales
from schemas.schemas import CommentSchema
from services.comment_services import CommentService
from decorators.decorators import comment_admin_mod_myid_required
# NO se necesita importar 'post_views.py' ya que en este enfoque usaremos 
# un Blueprint propio para la creación y listado de comentarios en un post.

# --- BLUEPRINT SETUP ---
# 1. Blueprint para rutas de comentarios relacionadas con un post (GET, POST)
# Este Blueprint se registrará con url_prefix='/posts' en app.py
# views/comments_views.py
post_comments_bp = Blueprint('post_comments_api', __name__, url_prefix='/posts/<int:id>/comments', strict_slashes=False)

# 2. Blueprint para la ruta de detalle/eliminación de comentarios (DELETE)
# Este Blueprint se registrará con url_prefix='/comments' en app.py
comment_detail_bp = Blueprint('comment_detail_api', __name__, url_prefix='/comments') 


# -------------------------------------------------------------
# GET /posts/<id>/comments
# -------------------------------------------------------------
@post_comments_bp.route('/', methods=['GET'])
def list_post_comments(id):
    """Listar comentarios de un post específico."""
    # Usamos el 'id' del post en la ruta, que Flask pasa como argumento
    comments = CommentService.get_comments_by_post(id)
    return CommentSchema(many=True).dump(comments), 200


# views/comments_views.py (Código a añadir)

# ... después de la definición del Blueprint comment_detail_bp ...

@comment_detail_bp.route('/active', methods=['GET'])
def list_all_active_comments():
    """Listar solo comentarios que están activos (is_active=True)."""
    try:
        # Llama al nuevo método del servicio para obtener solo activos
        comments = CommentService.get_all_active_comments()
        
        if not comments:
            return {"message": "No se encontraron comentarios activos."}, 404
            
        # Serializamos y devolvemos la lista
        return CommentSchema(many=True).dump(comments), 200
        
    except Exception as e:
        return {"Error": str(e)}, 500
    

# -------------------------------------------------------------
# POST /posts/<id>/comments
# -------------------------------------------------------------
@post_comments_bp.route('/', methods=['POST'])
@jwt_required()
def create_new_comment(id):
    """Crear un comentario en un post (Usuario autenticado)."""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        # El 'id' aquí es el ID del post
        comment = CommentService.create_comment(id, user_id, data) 
        return CommentSchema().dump(comment), 201
    except ValidationError as err:
        return {"errors": err.messages}, 400


# -------------------------------------------------------------
# PUT /comments/<int:id>
# -------------------------------------------------------------
@comment_detail_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@comment_admin_mod_myid_required
def update_comment_by_id(id, comment=None):
    """Actualizar un comentario por ID (Autor, Mod o Admin)."""
    try:
        # Cargamos solo el campo 'content', el único modificable
        data = CommentSchema(only=('content',), partial=True).load(request.json)
        
        # Asumo que CommentService tiene un método update_comment(id, data) similar a PostService
        updated_comment = CommentService.update_comment(id, data) 
        
        return CommentSchema().dump(updated_comment), 200
    except ValidationError as err:
        return {"errors": err.messages}, 400
    except ValueError as err:
        # Se lanza si el comentario no existe (aunque el decorador ya lo valida, es buena práctica)
        return {"error": str(err)}, 404


# -------------------------------------------------------------
# DELETE /comments/<int:id>
# -------------------------------------------------------------
@comment_detail_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@comment_admin_mod_myid_required
def delete_comment_by_id(id, comment=None):
    """Eliminar un comentario por ID (Autor, Mod o Admin)."""
    try:
        # El 'id' aquí es el ID del comentario
        result = CommentService.delete_comment(id)
        return result, 200
    except ValidationError as err:
        return {"errors": err.messages}, 400