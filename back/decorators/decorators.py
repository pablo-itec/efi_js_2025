from flask_jwt_extended import (
    get_jwt_identity,
    get_jwt
)
from functools import wraps
from models.models import Comment, Post

# decorator para verificar roles
def roles_required(*allowed_roles: str):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            role = claims.get("role")
            if not role or role not in allowed_roles:
                return {"Error": "acceso denegado, no tiene permisos"}, 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

#Para admin o propia"id" requerido
def admin_or_myid_required(fn):
    @wraps (fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        current_user_id = int(get_jwt_identity()) 
        target_user_id = int(kwargs.get('id'))   #user de la ruta /user/<id<
        #logica para admin o propia id
        if claims.get("role") != "admin" and current_user_id != target_user_id:
            return {"Error": "No posee permisos"}, 403
        return fn(*args, **kwargs)
    return wrapper

#Para admin, mod o propia "id" requerido en comment
def comment_admin_mod_myid_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        current_user_id = int(get_jwt_identity())
        comment_id = kwargs.get('id')
        comment = Comment.query.get(comment_id)
        if not comment:
            return {"error": "Comentario no encontrado"}, 404
        is_admin = claims.get("role") == "admin"
        is_mod = claims.get("role") == "moderator"
        is_autor = current_user_id == comment.user_id
        if not (is_admin or is_mod or is_autor):
            return {"error": "No posee permisos"}, 403
        return fn(*args, comment=comment, **kwargs)
    return wrapper
                    
#Para admin o propia "id" en post
def post_admin_myid_required(fn):
    @wraps (fn)
    def wrapper (*args, **kwargs):
        claims = get_jwt()
        current_user_id = int(get_jwt_identity()) 
        target_post_id = int(kwargs.get('id'))
        post = Post.query.get(target_post_id)
        if not post:
            return {"Error": "Post no encontrado"}, 404
        user_role = claims.get("role")
        is_admin = user_role == "admin"
        is_mod = user_role == "moderator"
        is_autor = current_user_id == post.user_id 
        if not (is_admin or is_mod or is_autor):
            return {"Error": "No posee permisos"}, 403
        return fn(*args, **kwargs)
    return wrapper
