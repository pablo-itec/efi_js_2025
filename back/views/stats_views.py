from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from decorators.decorators import roles_required # Asumo que tienes este decorador

# --- IMPORTS DE SERVICIO ---
from services.stats_services import StatsService

# --- BLUEPRINT SETUP ---
# Registrado en app.py con url_prefix='/stats'
stats_bp = Blueprint('stats_api', __name__) 

@stats_bp.route('/', methods=['GET'])
@jwt_required()
@roles_required("admin", "moderator") # Solo Admin y Moderador pueden ver las estadísticas
def get_stats():
    """Obtiene estadísticas segmentadas según el rol del usuario."""
    try:
        # 1. Obtener el rol del usuario del token JWT
        claims = get_jwt()
        user_role = claims.get("role")
        
        # 2. Llamar al servicio para obtener las métricas correctas
        stats = StatsService.get_stats_for_role(user_role)
        
        return jsonify(stats), 200
        
    except Exception as e:
        # En caso de que falle la conexión a DB o la lógica
        return jsonify({"error": "Error al calcular estadísticas", "details": str(e)}), 500