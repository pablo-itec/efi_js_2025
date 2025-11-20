import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const PostFormPage = ({ id }) => {
  const { apiFetch, navigateTo, showNotification } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [categories, setCategories] = useState([]);
  
  const isEditing = Boolean(id);

  useEffect(() => {
    const loadData = async () => {
        try {
            // 1. Cargar categorías (necesario para el formulario)
            const catData = await apiFetch('/categories');
            setCategories(catData || []);
            
            // 2. Cargar datos del post si estamos editando
            if (isEditing) {
                const postData = await apiFetch(`/posts/${id}`);
                setTitle(postData.title);
                setContent(postData.content);
                // Usamos el ID de la categoría para pre-seleccionar
                setCategoriaId(postData.categoria?.id || ''); 
            }
        } catch (error) {
            // Si falla la carga inicial (ej. el post no existe o no tiene permiso)
            if (isEditing) {
                navigateTo('posts'); 
                showNotification("No se pudo cargar el post para editar.", "error");
            }
        }
    };
    loadData();
  }, [id, isEditing, apiFetch, navigateTo, showNotification]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Preparar los datos del post
    const postData = {
        title,
        content,
        // Usar parseInt() para asegurar que el ID de categoría sea un número, si existe
        ...(categoriaId && { categoria_id: parseInt(categoriaId) }) 
    };
    
    try {
        let responsePost;
        
        if (isEditing) {
            // Lógica de Edición (PUT)
            responsePost = await apiFetch(`/posts/${id}`, { method: 'PUT', body: postData });
            showNotification('Post actualizado con éxito');
        } else {
            // Lógica de Creación (POST)
            responsePost = await apiFetch('/posts', { method: 'POST', body: postData });
            showNotification('Post creado con éxito');
        }
        
        // 1. Intenta obtener el ID de la respuesta
        const postId = responsePost?.id;

        if (postId) {
            // 2. Redirige a la página de detalle del post usando el ID
            navigateTo('postDetail', { id: postId });
        } else {
            // 3. Si no se pudo obtener el ID (a pesar del 201), lleva al usuario a la lista principal
            // Esto ocurre si la respuesta JSON del backend es inválida o incompleta.
            console.error("Redirección fallida: Respuesta del servidor incompleta o sin ID:", responsePost);
            navigateTo('posts');
        }
        
    } catch (error) {
        // La notificación ya se muestra desde AuthContext. Solo agregamos un log para depuración.
        console.error("Error al enviar el formulario:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">{isEditing ? 'Editar Post' : 'Crear Nuevo Post'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Contenido</label>
          <textarea id="content" rows="10" value={content} onChange={(e) => setContent(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
          <select id="category" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">-- Sin Categoría --</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          {isEditing ? 'Guardar Cambios' : 'Publicar Post'}
        </button>
      </form>
    </div>
  );
};

export default PostFormPage;