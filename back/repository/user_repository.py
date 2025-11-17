# repository/user_repository.py (CORREGIDO a nomenclatura ORIGINAL)

from models.models import db, User, UserCredentials

# La clase principal original
class UserRepository:

    # consulta que devuelve todos los usuarios (antes get_all_profiles)
    @staticmethod
    def get_all():
        return User.query.order_by(User.id.asc()).all()
    
    # consulta devuelve usuario por id (antes get_profile_by_id)
    @staticmethod
    def get_by_id(user_id):
        return User.query.get(user_id)

    # consulta devuelve usuario por id o 404 (antes get_profile_by_id_or_404)
    @staticmethod
    def get_by_id_or_404(user_id):
        """Busca un usuario por ID y levanta 404 si no existe."""
        return User.query.get_or_404(user_id)
    
    # actualiza los datos del usuario (antes update_profile)
    @staticmethod
    def update_user(user, data):
        if "username" in data:
            user.name = data["username"]
        if "email" in data:
            user.email = data["email"]
        db.session.commit()
        return user
    
    # actualiza user_credentials (rol) (antes set_role)
    @staticmethod
    def change_rol(user, new_role):
        user.credential.role = new_role
        db.session.commit()
        return user
    
    # borrado total de usuario y credenciales (antes hard_delete_profile)
    @staticmethod
    def delete_user(user_id):
        user = User.query.get_or_404(user_id)
        db.session.delete(user.credential)
        db.session.delete(user)
        db.session.commit()
        return True
    
    # borrado lógico (antes soft_deactivate_profile)
    @staticmethod
    def logic_delete (user):
        user.is_active = False
        db.session.commit()
        return user