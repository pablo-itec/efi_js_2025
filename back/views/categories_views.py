# views/categorie_view.py (CÓDIGO CORREGIDO)

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

# --- CORRECCIONES DE IMPORTACIÓN ---
# Apuntamos a los archivos y clases originales
from schemas.schemas import CategoriaSchema
from services.categorie_services import CategoriaService
from decorators.decorators import roles_required

# --- BLUEPRINT SETUP ---
# Define un Blueprint para las rutas de categorías
# Se registrará con url_prefix='/categories' en app.py
categorie_bp = Blueprint('categorie_api', __name__)

# -------------------------------------------------------------
# Reemplaza CategoriaListAPI.get() para GET /categories
# -------------------------------------------------------------
@categorie_bp.route('/', methods=['GET'])
def list_all_categories():
    """Listar todas las categorías (Público)."""
    # Llamada al método original: list_all()
    categorias = CategoriaService.list_all()
    return CategoriaSchema(many=True).dump(categorias), 200

# -------------------------------------------------------------
# Reemplaza CategoriaCreateAPI.post() para POST /categories
# -------------------------------------------------------------
@categorie_bp.route('/', methods=['POST'])
@jwt_required()
@roles_required("admin", "moderator")
def create_category():
    """Crear una nueva categoría (Admin/Moderator)."""
    try:
        data = request.get_json()
        # Llamada al método original: create()
        categoria = CategoriaService.create(data)
        return CategoriaSchema().dump(categoria), 201
    except ValidationError as err:
        return {"errors": err.messages}, 400

# -------------------------------------------------------------
# Reemplaza CategoriaDetailAPI.put() y .delete() para /categories/<int:id>
# -------------------------------------------------------------

@categorie_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@roles_required("admin")
def update_category(id):
    """Actualizar categoría por ID."""
    try:
        data = request.get_json()
        # Llamada al método original: update()
        categoria = CategoriaService.update(id, data)
        return CategoriaSchema().dump(categoria), 200
    except ValidationError as err:
        return {"errors": err.messages}, 400


@categorie_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@roles_required("admin")
def delete_category(id):
    """Eliminar categoría por ID (Solo admin)."""
    # Llamada al método original: delete()
    result = CategoriaService.delete(id)
    return result, 200