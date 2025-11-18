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
            const catData = await apiFetch('/categories');
            setCategories(catData || []);
            
            if (isEditing) {
                const postData = await apiFetch(`/posts/${id}`);
                setTitle(postData.title);
                setContent(postData.content);
                setCategoriaId(postData.categoria?.id || '');
            }
        } catch (error) {}
    };
    loadData();
  }, [id, isEditing, apiFetch]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
        title,
        content,
        ...(categoriaId && { categoria_id: parseInt(categoriaId) })
    };
    
    try {
        if (isEditing) {
            const updatedPost = await apiFetch(`/posts/${id}`, { method: 'PUT', body: postData });
            showNotification('Post actualizado con éxito');
            navigateTo('postDetail', { id: updatedPost.id });
        } else {
            const newPost = await apiFetch('/posts', { method: 'POST', body: postData });
            showNotification('Post creado con éxito');
            navigateTo('postDetail', { id: newPost.id });
        }
    } catch (error) {}
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