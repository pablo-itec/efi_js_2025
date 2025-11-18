import React, { useState } from "react";
import { Home, Newspaper, LogIn, LogOut, UserPlus, Shield, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout, navigateTo } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const NavLink = ({ page, params, children }) => (
    <button onClick={() => { navigateTo(page, params); setMenuOpen(false); }} className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900">
      {children}
    </button>
  );

  // ... (Copia y pega aquí el resto del return (HTML) de tu Navbar original) ...
  // NOTA: Asegúrate de que el return incluya todo el <nav>...</nav>
  return (
     <nav className="bg-white shadow-md sticky top-0 z-40">
        {/* ... PEGA EL CONTENIDO DE TU NAVBAR AQUÍ ... */}
        {/* Si necesitas que te pase el HTML completo avísame, pero es el mismo de antes */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button onClick={() => navigateTo("home")} className="flex-shrink-0 flex items-center font-bold text-xl text-indigo-600">
              BlogReact
            </button>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <NavLink page="home"><Home className="h-4 w-4" /><span>Inicio</span></NavLink>
            <NavLink page="posts"><Newspaper className="h-4 w-4" /><span>Posts</span></NavLink>
            {isAuthenticated ? (
              <>
                {user.role === "admin" && (<NavLink page="admin"><Shield className="h-4 w-4" /><span>Admin</span></NavLink>)}
                <span className="text-gray-500 text-sm">Hola, {user.username || user.email}</span>
                <button onClick={logout} className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100">
                  <LogOut className="h-4 w-4" /><span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink page="login"><LogIn className="h-4 w-4" /><span>Login</span></NavLink>
                <NavLink page="register"><UserPlus className="h-4 w-4" /><span>Registro</span></NavLink>
              </>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              <span className="sr-only">Abrir menú</span>
              {menuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink page="home"><Home className="h-4 w-4" /><span>Inicio</span></NavLink>
            <NavLink page="posts"><Newspaper className="h-4 w-4" /><span>Posts</span></NavLink>
            {isAuthenticated ? (
              <>
                {user.role === "admin" && (<NavLink page="admin"><Shield className="h-4 w-4" /><span>Admin</span></NavLink>)}
                <div className="px-3 py-2 text-sm text-gray-500">Hola, {user.username || user.email}</div>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100">
                  <LogOut className="h-4 w-4" /><span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink page="login"><LogIn className="h-4 w-4" /><span>Login</span></NavLink>
                <NavLink page="register"><UserPlus className="h-4 w-4" /><span>Registro</span></NavLink>
              </>
            )}
          </div>
        </div>
      )}
     </nav>
  );
};
export default Navbar;