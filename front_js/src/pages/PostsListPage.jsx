import React, { useState, useEffect } from "react";
// Importante: Necesitas el 'user' del contexto para la lógica de roles
import { useAuth } from "../context/AuthContext"; 
import { UserPlus } from "lucide-react";

const PostsListPage = () => {
  // Aseguramos que user se extraiga para la lógica de roles
  const { apiFetch, navigateTo, isAuthenticated, user } = useAuth(); 
  const [posts, setPosts] = useState([]);

  // Determinamos si el usuario tiene permisos de gestión (Admin o Moderador)
  const isAdminOrModerator = user && (user.role === 'admin' || user.role === 'moderator');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // La petición /posts debe devolver TODOS los posts (activos e inactivos)
        const data = await apiFetch("/posts"); 
        setPosts(data || []);
      } catch (error) {
        // Manejo de errores
      }
    };
    fetchPosts();
  }, [apiFetch]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Últimos Posts</h2>
        {isAuthenticated && (
          <button
            onClick={() => navigateTo("postForm")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>Crear Post</span>
          </button>
        )}
      </div>
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts
            // ------------------------------------------------------------------
            // LÓGICA DE FILTRADO: Oculta posts inactivos a usuarios comunes.
            // ------------------------------------------------------------------
            .filter(post => isAdminOrModerator || post.is_active)
            .map((post) => {
              
              const isDeleted = !post.is_active;
              
              // ------------------------------------------------------------------
              // LÓGICA DE ESTILO: Estilos condicionales para posts borrados
              // ------------------------------------------------------------------
              const cardClass = isDeleted
                ? "bg-red-100 p-6 rounded-lg shadow-md border-2 border-red-500 transition-shadow cursor-pointer opacity-70" // Estilo para post borrado
                : "bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer";
                
              const titleClass = isDeleted 
                ? "text-2xl font-semibold text-red-700 mb-2 line-through" // Tachar el título
                : "text-2xl font-semibold text-indigo-700 mb-2";

              return (
                <div
                  key={post.id}
                  className={cardClass}
                  onClick={() => navigateTo("postDetail", { id: post.id })}
                >
                  <h3 className={titleClass}>
                    {post.title} {isDeleted && "(BORRADO)"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.content.substring(0, 150)}...
                  </p>
                  {/* ******************************************************
                      * CORRECCIÓN: AÑADIR FECHA Y HORA AL LISTADO *
                      ****************************************************** */}
                  <div className="text-sm text-gray-500 flex justify-between items-center mt-2">
                    <div className="flex flex-col">
                      <span>
                        Por: <strong className="text-gray-700">{post.autor?.username || "Anónimo"}</strong>
                      </span>
                      {post.date_time && (
                        <span className="text-xs text-gray-400">
                          Creado: {new Date(post.date_time).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span>
                      Categoría: <strong className="text-gray-700">{post.categoria?.name || "Sin categoría"}</strong>
                    </span>
                  </div>
                </div>
              );
            })
        ) : (
          <p className="text-gray-500">No hay posts disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default PostsListPage;