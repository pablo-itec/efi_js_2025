# services/categorie_services.py (CORREGIDO a nomenclatura ORIGINAL)

from repository.categorie_repository import CategoriaRepository # Mantiene la importación
from marshmallow import ValidationError

class CategoriaService: # Revertido de GroupingManager
    
    # Métodos estáticos revertidos a sus nombres originales
    @staticmethod
    def list_all(): # Revertido de fetch_all_groupings
        return CategoriaRepository.get_all() # Llama al método original del repositorio

    @staticmethod
    def create(data): # Revertido de create_new_grouping
        name = data.get("name", "").strip()
        if not name:
            raise ValidationError({"name": "El nombre no puede estar vacío"})
        # Llama al método original del repositorio
        if CategoriaRepository.get_by_name(name): 
            raise ValidationError({"name": "Ya existe una agrupación con ese nombre"})
        # Llama al método original del repositorio
        return CategoriaRepository.create(name)

    @staticmethod
    def update(id, data): # Revertido de modify_grouping
        categoria = CategoriaRepository.get_by_id(id)
        name = data.get("name", "").strip()
        if not name:
            raise ValidationError({"name": "El nombre no puede estar vacío"})
        existente = CategoriaRepository.get_by_name(name)
        if existente and existente.id != id:
            raise ValidationError({"name": "Ya existe otra agrupación con ese nombre"})
        # Llama al método original del repositorio
        return CategoriaRepository.update(categoria, name)

    @staticmethod
    def delete(id): # Revertido de remove_grouping
        categoria = CategoriaRepository.get_by_id(id)
        # Llama al método original del repositorio
        CategoriaRepository.delete(categoria)
        return {"message": "Categoría eliminada correctamente"} # Mensaje corregido