from marshmallow import Schema, fields
from models.models import User 

class PostSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    content = fields.Str(required=True)
    date_time = fields.DateTime(dump_only=True)
    
    # Relaciones fk
    user_id = fields.Int(load_only=True)
    
    # ******************* CORRECCIÓN CLAVE *******************
    # Mapea la clave 'autor' del JSON a la relación 'user' del modelo Post.
    # El frontend leerá post.autor.username
    autor = fields.Nested("UserSchema", only=["username"], dump_only=True, attribute="user") 
    # ********************************************************
    
    categoria_id = fields.Int(load_only=True)
    categoria = fields.Nested("CategoriaSchema", only=["name"], dump_only=True)
    is_active = fields.Bool(dump_only=True)

# comentarios schema
class CommentSchema(Schema):
    id = fields.Int(dump_only=True)
    content = fields.Str(required=True)
    date_time = fields.DateTime(dump_only=True)
    
    # Relaciones fk
    user_id = fields.Int(load_only=True)
    
    # ******************* CORRECCIÓN CLAVE *******************
    # Mapea la clave 'autor' del JSON a la relación 'user' del modelo Comment.
    autor = fields.Nested("UserSchema", only=["username"], dump_only=True, attribute="user")
    # ********************************************************
    
    post_id = fields.Int(load_only=True)
    post = fields.Nested("PostSchema", only=["title"], dump_only=True)
    is_active = fields.Bool(dump_only=True)
    
# Con motivos de test, agrego is_active y rol
class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    # El atributo 'name' del modelo se expone como 'username'
    username = fields.Str(attribute="name", required=True)
    email = fields.Email(required=True)
    rol = fields.Method("get_rol")
    is_active = fields.Bool(attribute="is_active")
    
    # funcion para obtener roles (credenciales)
    def get_rol(self, obj):
        # Esta función usa obj.credential.role (definido en models.py)
        return obj.credential.role
    
class RegisterSchema(Schema):
    username = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)
    role = fields.Str(load_only=True)

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)

# schema de categoria
class CategoriaSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    posts = fields.Nested("PostSchema", many=True, exclude=("categoria",), dump_only=True)