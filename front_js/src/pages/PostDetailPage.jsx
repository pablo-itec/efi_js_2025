import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Edit, Trash2, Send } from "lucide-react";

const PostDetailPage = ({ id }) => {
  const { apiFetch, user, isAuthenticated, navigateTo, showNotification } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchPostData = async () => {
      try {
        const postData = await apiFetch(`/posts/${id}`);
        setPost(postData);
        // ASUMO que la respuesta del backend incluye el autor (user) en cada comentario
        const commentsData = await apiFetch(`/posts/${id}/comments`); 
        setComments(commentsData || []);
      } catch (error) {
        // Redirigir si el post no existe o no está activo
        navigateTo("posts");
      }
    };
    fetchPostData();
  }, [id, apiFetch, navigateTo]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const createdComment = await apiFetch(`/posts/${id}/comments`, {
        method: "POST",
        body: { content: newComment },
      });
      // Asegurar que el nuevo comentario tenga el autor para el check de canDeleteComment
      setComments([createdComment, ...comments]); 
      setNewComment("");
      showNotification("Comentario agregado");
    } catch (error) {}
  };

  const handleDeletePost = async () => {
    if (window.confirm("¿Estás seguro de que querés eliminar este post?")) {
      try {
        await apiFetch(`/posts/${id}`, { method: 'DELETE' });
        showNotification("Post eliminado (Soft Delete)", 'success');
        navigateTo("posts");
      } catch (error) {
        showNotification("Error al eliminar el post", 'error');
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("¿Estás seguro de que querés eliminar este comentario?")) {
      try {
        await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
        setComments(comments.filter(c => c.id !== commentId));
        showNotification("Comentario eliminado", 'success');
      } catch (error) {
        showNotification("Error al eliminar el comentario", 'error');
      }
    }
  };


  if (!post) return <div className="text-center mt-10">Cargando post...</div>;
  
  const canEditPost = isAuthenticated && (
    user.role === 'admin' || 
    user.role === 'moderator' || 
    user.id === post.autor?.id
  );
  
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        <span>Por: <strong className="text-gray-700">{post.autor?.username || "Anónimo"}</strong></span>
        {" | "}
        <span>Categoría: <strong className="text-gray-700">{post.categoria?.name || "Sin categoría"}</strong></span>
      </div>
      
      <p className="text-gray-800 text-lg whitespace-pre-wrap mb-6">{post.content}</p>
      
      {/* ******************************************************
          * INSERCIÓN: FECHA DE CREACIÓN DEL POST *
          ****************************************************** */}
      {post.date_time && (
        <p className="text-xs text-gray-400 mb-8 italic">
          Publicado el: {new Date(post.date_time).toLocaleString()}
        </p>
      )}
      {/* ****************************************************** */}
      
      {canEditPost && (
         <div className="flex space-x-4 mb-6">
            <button
               onClick={() => navigateTo('postForm', { id: post.id })}
               className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
            >
               <Edit className="h-5 w-5" /><span>Editar Post</span>
            </button>
            <button
               onClick={handleDeletePost}
               className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
            >
               <Trash2 className="h-5 w-5" /><span>Eliminar Post</span>
            </button>
         </div>
      )}

      <hr className="my-8" />
      <h2 className="text-2xl font-bold mb-6">Comentarios / Reseñas ({comments.length})</h2>

      {isAuthenticated && (
        <form onSubmit={handleCommentSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribí un comentario..."
            rows="3"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
          <button type="submit" className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2">
            <Send className="h-5 w-5" /><span>Enviar</span>
          </button>
        </form>
      )}

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => {
            // 2. CORRECCIÓN: Permite a 'admin' o 'moderator' eliminar el comentario.
            const canDeleteComment = isAuthenticated && (
                user.role === 'admin' || 
                user.role === 'moderator' || 
                user.id === comment.autor?.id
            );
            return (
              <div key={comment.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <p className="text-gray-700">{comment.content}</p>
                <div className="text-sm text-gray-500 mt-2 flex justify-between items-center">
                  
                  {/* ******************************************************
                      * INSERCIÓN: FECHA DE CREACIÓN DEL COMENTARIO *
                      ****************************************************** */}
                  <div>
                    <span>Por: <strong className="text-gray-700">{comment.autor?.username || "Anónimo"}</strong></span>
                    {comment.date_time && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(comment.date_time).toLocaleString()}
                        </p>
                    )}
                  </div>
                  {/* ****************************************************** */}

                  {canDeleteComment && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">Todavía no hay comentarios. ¡Sé el primero!</p>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;