# services/post_services.py (CÓDIGO CORREGIDO Y COMPLETO)

from marshmallow import ValidationError
from repository.post_repository import PostRepository 
from models.models import Post 

# La clase principal original
class PostService: 

    def __init__(self):
        self.post_repo = PostRepository()
    
    # para todos los posts
    def get_all_post(self):
        return self.post_repo.get_all()
    
    # solo active TRUE
    def get_active_post(self):
        return self.post_repo.get_all_active()
    
    # por id
    def get_by_id(self, post_id):
        return self.post_repo.get_by_id(post_id)
  
    # crear post
    def new_post(self, data, user_id):
        try:
            if not data.get("categoria_id"):
                raise ValueError("Debe indicar una categoría.")
            new_post = Post(
                title=data.get('title'),
                content=data.get('content'),
                user_id=user_id,
                categoria_id=data.get('categoria_id'),
                is_active=True
            )
            return self.post_repo.add_post(new_post) 
        except ValidationError as error:
            raise error
        except Exception as error:
            raise Exception(f"Error al crear el post: {str(error)}")
    
    # editar post
    def update_post(self, post_id, data):
        post = self.get_by_id(post_id)
        if not post:
            raise ValueError("El post no existe")
        if 'title' in data:
            post.title = data['title']
        if 'content' in data:
            post.content = data['content']
        self.post_repo.update_post() 
        return post
    
    # Eliminación lógica de post
    def delete_post(self, post_id):
        post = self.get_by_id(post_id)
        if not post:
            raise ValueError("El Post no existe")
        self.post_repo.logic_delete(post)
        return True
    
    # MÉTODO AÑADIDO: FILTRADO POR CATEGORÍA
    def get_posts_by_category(self, categoria_id):
        """Obtiene una lista de posts activos filtrados por categoria_id."""
        # Se asume que el método en el repositorio se llama 'get_all_catgoryfilter'
        return self.post_repo.get_all_catgoryfilter(categoria_id)