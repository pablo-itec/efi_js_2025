# services/user_services.py (CORREGIDO a nomenclatura ORIGINAL)

from repository.user_repository import UserRepository 
from schemas.schemas import UserSchema 
from marshmallow import ValidationError # Necesario si se usa .load() en la vista, aunque lo mantendremos simple

# Logica de los datos de Repository (datos de las consultas a DB)
class UserService: # Revertido de ProfileManager
    
    def __init__(self):
        # Variable renombrada para mayor claridad
        self.user_repository = UserRepository()

    # Obtener todos los usuarios (antes get_all_profiles)    
    def get_all_users(self):
        return self.user_repository.get_all() # Llama al método original del repositorio
    
    # obtiene el usuario por id o 404 (antes get_profile_details)
    def get_user_details(self, user_id): # Revertido de profile_id
        user = self.user_repository.get_by_id_or_404(user_id) 
        return user
    
    # Obtiene el usuario, y lo actualiza con el json (antes update_profile_data)
    def update_user_profile(self, user_id, user_data): # Revertido de update_profile_data
        # Asumo que la validación del esquema se hace en la vista o tiene try/except aquí
        data = UserSchema(partial=True).load(user_data) 
        user = self.user_repository.get_by_id_or_404(user_id)
        # Llama al método original del repositorio
        updated_user = self.user_repository.update_user(user, data) 
        return updated_user
    
    # cambia rol (antes change_access_role)
    def change_role (self, user_id, role_data): # Revertido de change_access_role
        new_role = role_data.get("role")
        if new_role not in ["user", "moderator", "admin"]:
            raise ValueError(f"Rol inválido: '{new_role}'. Los roles permitidos son: user, moderator, admin.")
        user = self.user_repository.get_by_id_or_404(user_id)
        # Llama al método original del repositorio
        update_user = self.user_repository.change_rol(user, new_role)
        return update_user
    
    # borrado lógico (antes soft_deactivate_profile)
    def softdelete_user(self, user_id): # Revertido de soft_deactivate_profile
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise ValueError("El usuario no existe")
        # Llama al método original del repositorio
        self.user_repository.logic_delete(user)
        return True
    
    # Eliminación física (antes hard_delete_profile)
    def delete_user(self, user_id): # Revertido de hard_delete_profile
        return self.user_repository.delete_user(user_id)