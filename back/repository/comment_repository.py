# repository/comment_repository.py (CORREGIDO a nomenclatura ORIGINAL)

from models.models import Comment, db

class CommentRepository:
    # Revertido de fetch_feedback_by_id
    @staticmethod
    def get_by_id(id):
        return Comment.query.get_or_404(id)

    # Revertido de fetch_active_feedback_by_content
    @staticmethod
    def get_active_by_post(post_id):
        # Mantiene la lógica de filtro en post_id
        return (
            Comment.query
            .filter_by(post_id=post_id, is_active=True)
            .order_by(Comment.date_time.desc())
            .all()
        )

# repository/comment_repository.py (Código a añadir a la clase CommentRepository)
    @staticmethod
    def get_all_active():
        """Consulta DB para obtener todos los comentarios activos."""
        return Comment.query.filter_by(is_active=True).order_by(Comment.id.asc()).all()

    # Revertido de create_feedback
    @staticmethod
    def create(content, user_id, post_id):
        # Mantiene los nombres de argumentos originales
        comment = Comment(content=content, user_id=user_id, post_id=post_id)
        db.session.add(comment)
        db.session.commit()
        return comment
    
    # MÉTODO AÑADIDO: Para confirmar la modificación hecha en la capa Service
    @staticmethod
    def update_comment():
        """Confirma los cambios pendientes en la sesión (commit)."""
        db.session.commit()
        return True

    # Revertido de soft_delete_feedback
    @staticmethod
    def soft_delete(comment):
        # Mantiene el nombre de argumento original
        comment.is_active = False
        db.session.commit()
        return comment