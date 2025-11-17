# services/comment_services.py (CORREGIDO Y VERIFICADO)

from marshmallow import ValidationError
# --- CORRECCIONES DE IMPORTACIÓN ---
# Apunta al archivo correcto en la carpeta repository/
from repository.comment_repository import CommentRepository
# Apunta al archivo correcto en la carpeta repository/
from repository.post_repository import PostRepository 

class CommentService:
    @staticmethod
    def get_comments_by_post(post_id):
        # Llama al método original del repositorio
        PostRepository.get_by_id(post_id)
        # Llama al método original del repositorio
        return CommentRepository.get_active_by_post(post_id)

# services/comment_services.py (CÓDIGO AÑADIDO)

    @staticmethod
    def get_all_active_comments():
        """Obtiene una lista de todos los comentarios activos."""
        # Llama al repositorio para obtener los comentarios filtrados
        return CommentRepository.get_all_active()
    
    @staticmethod
    def create_comment(post_id, user_id, data):
        # Llama al método original del repositorio
        PostRepository.get_by_id(post_id)
        content = data.get("content", "").strip()

        if not content:
            raise ValidationError({"content": "El comentario no puede estar vacío"})

        # Llama al método original del repositorio
        comment = CommentRepository.create(content, user_id, post_id)
        return comment

    # services/comment_services.py (Método update_comment CORREGIDO)

    @staticmethod
    def update_comment(id, data):
        # 1. Recuperar y modificar el objeto 'comment'
        comment = CommentRepository.get_by_id(id) 
        content = data.get("content", "").strip()
        if not content:
            raise ValidationError({"content": "El comentario no puede estar vacío"})
        comment.content = content
        
        # 2. Persistir el cambio (hacer el commit en el repositorio)
        CommentRepository.update_comment() 
        
        # 3. Devolver el objeto modificado (¡CLAVE!)
        return comment # <-- Retorna el objeto Comment de SQLAlchemy
        
    @staticmethod
    def delete_comment(id):
        # Llama al método original del repositorio
        comment = CommentRepository.get_by_id(id)
        if not comment.is_active:
            raise ValidationError({"error": "El comentario ya fue eliminado"})
        # Llama al método original del repositorio
        CommentRepository.soft_delete(comment)
        return {"message": "Comentario eliminado correctamente"}