import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const AdminPage = () => {
  const { apiFetch, showNotification } = useAuth(); 
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const usersData = await apiFetch('/users');
      setUsers(usersData || []);
    } catch (error) {}
  }, [apiFetch]);

  useEffect(() => {
    const loadAdminData = async () => {
        try {
            const statsData = await apiFetch('/stats');
            setStats(statsData);
            await fetchUsers();
        } catch (error) {}
    };
    loadAdminData();
  }, [apiFetch, fetchUsers]);
  
  const handleChangeRole = async (userId, currentRole) => {
    const newRole = window.prompt(
      `Ingresa el nuevo rol para el usuario ${userId} (ej: admin, moderator, user):`,
      currentRole
    );

    if (!newRole || newRole === currentRole) return;
    
    if (!['admin', 'moderator', 'user'].includes(newRole)) {
        showNotification('Rol inválido. Debe ser "admin", "moderator" o "user".', 'error');
        return;
    }

    try {
      // PATCH /users/<id>/role/
      await apiFetch(`/users/${userId}/role/`, {
        method: 'PATCH',
        body: { role: newRole }
      });
      showNotification('Rol actualizado con éxito');
      await fetchUsers(); 
    } catch (error) {}
  };

  const handleDeactivateUser = async (userId, isActive) => {
    if (!isActive) {
        showNotification('Este usuario ya está inactivo.', 'error');
        return;
    }
    
    if (window.confirm(`¿Estás seguro de que querés desactivar al usuario ${userId}? (Soft Delete)`)) {
      try {
        // DELETE /users/<id>/
        await apiFetch(`/users/${userId}/`, {
          method: 'DELETE'
        });
        showNotification('Usuario desactivado');
        await fetchUsers(); 
      } catch (error) {}
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
        <h2 className="text-3xl font-bold mb-6">Panel de Administración</h2>
        
        <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Estadísticas</h3>
            {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="text-gray-500">Usuarios Activos</h4>
                        <p className="text-3xl font-bold">{stats.total_users_activos}</p>
                   </div>
                   <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="text-gray-500">Posts Activos</h4>
                        <p className="text-3xl font-bold">{stats.total_posts_activos}</p>
                   </div>
                   <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="text-gray-500">Comentarios Activos</h4>
                        <p className="text-3xl font-bold">{stats.total_comments_activos}</p>
                   </div>
                </div>
            ) : <p>Cargando estadísticas...</p>}
        </div>

        <div>
            <h3 className="text-2xl font-semibold mb-4">Gestión de Usuarios</h3>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.rol}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {user.is_active ? 
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activo</span> :
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactivo</span>
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    <button 
                                      onClick={() => handleChangeRole(user.id, user.rol)}
                                      className="text-indigo-600 hover:text-indigo-900"
                                    >
                                      Cambiar Rol
                                    </button>
                                    <button 
                                      onClick={() => handleDeactivateUser(user.id, user.is_active)}
                                      className={`hover:text-red-900 ${user.is_active ? 'text-red-600' : 'text-gray-400 cursor-not-allowed'}`}
                                      disabled={!user.is_active}
                                    >
                                      Desactivar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AdminPage;