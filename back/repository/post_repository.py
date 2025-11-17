# repository/post_repository.py (CORREGIDO a nomenclatura ORIGINAL)

from models.models import db, Post

class PostRepository:

    # Revertido de fetch_all_content
    @staticmethod
    def get_all():
        return Post.query.order_by(Post.id.asc()).all()
    
    # Revertido de fetch_all_active_content
    @staticmethod
    def get_all_active():
        return Post.query.filter_by(is_active=True).all()
    
    # Revertido de fetch_content_by_grouping
    @staticmethod
    def get_all_catgoryfilter(categoria_id):
        return Post.query.filter_by(is_active=True, categoria_id=categoria_id).all()
    
    # Revertido de fetch_content_by_id
    @staticmethod
    def get_by_id(id):
        return Post.query.get(id)
    
    # Revertido de save_content (el argumento debe ser un objeto Post)
    @staticmethod
    def add_post(new_post):
        db.session.add(new_post)
        db.session.commit()
        return new_post
    
    # Revertido de commit_changes (este método no era llamado por services/post_services.py original, pero update_post sí)
    # Sin embargo, el original update_post() no tenía argumentos y solo hacía commit. Mantenemos la función de commit.
    @staticmethod
    def update_post():
        db.session.commit()

    # Revertido de soft_delete_content
    @staticmethod
    def logic_delete (post):
        post.is_active = False
        db.session.commit()
        return post
    
    # Revertido de hard_delete_content
    @staticmethod
    def delete(post):
        db.session.delete(post)
        db.session.commit()
        return True