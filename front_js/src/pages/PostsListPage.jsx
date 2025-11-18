import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserPlus } from "lucide-react";

const PostsListPage = () => {
  const { apiFetch, navigateTo, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await apiFetch("/posts"); 
        setPosts(data || []);
      } catch (error) {
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
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigateTo("postDetail", { id: post.id })}
            >
              <h3 className="text-2xl font-semibold text-indigo-700 mb-2">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {post.content.substring(0, 150)}...
              </p>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>
                  Por: <strong className="text-gray-700">{post.autor?.username || "Anónimo"}</strong>
                </span>
                <span>
                  Categoría: <strong className="text-gray-700">{post.categoria?.name || "Sin categoría"}</strong>
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No hay posts para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default PostsListPage;