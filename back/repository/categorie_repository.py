# repository/categorie_repository.py (CORREGIDO a nomenclatura ORIGINAL)

from models.models import Categoria, db

class CategoriaRepository: # Mantiene el nombre de la clase y la nomenclatura original
    @staticmethod
    def get_all(): # Revertido de fetch_all_groupings
        return Categoria.query.order_by(Categoria.id.asc()).all()

    @staticmethod
    def get_by_id(id): # Revertido de fetch_grouping_by_id
        return Categoria.query.get_or_404(id)

    @staticmethod
    def get_by_name(name): # Revertido de fetch_grouping_by_name
        return Categoria.query.filter_by(name=name).first()

    @staticmethod
    def create(name): # Revertido de create_grouping
        categoria = Categoria(name=name)
        db.session.add(categoria)
        db.session.commit()
        return categoria

    @staticmethod
    def update(categoria, name): # Revertido de update_grouping
        categoria.name = name
        db.session.commit()
        return categoria

    @staticmethod
    def delete(categoria): # Revertido de hard_delete_grouping
        db.session.delete(categoria)
        db.session.commit()