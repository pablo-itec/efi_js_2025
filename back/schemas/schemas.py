# schemas/schemas.py (VERIFICADO Y CORREGIDO)

from marshmallow import Schema, fields
# La importación debe apuntar a la clase original
from models.models import User # <-- Asegurado que se importa la clase User

class PostSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    content = fields.Str(required=True)
    date_time = fields.DateTime(dump_only=True)
    
    # Relaciones fk
    user_id = fields.Int(load_only=True)
    # Se mantiene 'autor', y debe apuntar a "UserSchema"
    autor = fields.Nested("UserSchema", only=["username"], dump_only=True) 
    categoria_id = fields.Int(load_only=True)
    categoria = fields.Nested("CategoriaSchema", only=["name"], dump_only=True)
    #boolean para eliminado logico
    is_active = fields.Bool(dump_only=True)

# comentarios schema
class CommentSchema(Schema):
    id = fields.Int(dump_only=True)
    content = fields.Str(required=True)
    date_time = fields.DateTime(dump_only=True)
    # Relaciones fk
    user_id = fields.Int(load_only=True)
    # Se mantiene 'autor'
    autor = fields.Nested("UserSchema", only=["username"], dump_only=True)
    post_id = fields.Int(load_only=True)
    post = fields.Nested("PostSchema", only=["title"], dump_only=True)
    #boolean borrado logico
    is_active = fields.Bool(dump_only=True)
    
# Con motivos de test, agrego is_active y rol
class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    # El atributo 'name' del modelo se expone como 'username'
    username = fields.Str(attribute="name", required=True)
    email = fields.Email(required=True)
    # Se mantiene 'rol'
    rol = fields.Method("get_rol")
    is_active = fields.Bool(attribute="is_active")
    # funcion para obtener roles (credenciales)
    def get_rol(self, obj):
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