import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Home,
  Newspaper,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  Trash2,
  Edit,
  Send,
  AlertCircle,
  CheckCircle,
  X,
  Menu,
} from "lucide-react"; // instalar: npm install lucide-react

// config de la api
// url flask
const API_URL = "http://127.0.0.1:5000";
// helper deco jwt
// Reemplazo para la librería jwt-decode para evitar problemas de importación
const jwtDecodeHelper = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      throw new Error("Token JWT inválido: Faltan partes.");
    }
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decodificando el token:", e);
    throw new Error("Token JWT inválido o malformado.");
  }
};

// contexto de la autenticacion
// 1. Crear el contexto
const AuthContext = createContext();

// 2. hook para consumir el contexto
export const useAuth = () => useContext(AuthContext);

// 3. proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Para la carga inicial

  // estado de nav (roteo simple)
  const [page, setPage] = useState("home"); // home, login, register, posts, postDetail, admin
  const [pageParams, setPageParams] = useState(null); // Para pasar IDs, ej: { id: 1 }

  // estado de notificaciones
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "success", // 'success' or 'error'
  });

  // validar al cargar token
  useEffect(() => {
    if (token) {
      try {
        
        const decodedUser = jwtDecodeHelper(token);
        const isExpired = decodedUser.exp * 1000 < Date.now();

        if (!isExpired) {
          setUser(decodedUser);
          setIsAuthenticated(true);
        } else {
          // Token expirado
          localStorage.removeItem("token");
          setToken(null);
        }
      } catch (error) {
        console.error("Token inválido:", error);
        localStorage.removeItem("token");
        setToken(null);
      }
    }
    setLoading(false); // Terminó la carga inicial
  }, [token]);

  // funcion de notificacion
  const showNotification = (message, type = "success") => {
    setNotification({ visible: true, message, type });
    setTimeout(() => {
      setNotification({ visible: false, message: "", type });
    }, 3000); // se oculta despues de 3 segundos
  };

  // funcion feth con token
  const apiFetch = useCallback(
    async (endpoint, options = {}) => {
      const { headers = {}, body, ...restOptions } = options;

      const defaultHeaders = {
        ...headers,
      };

      // Si hay body, es JSON
      if (body) {
        defaultHeaders["Content-Type"] = "application/json";
      }

      // Adjuntar el token si existe
      if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          ...restOptions,
          headers: defaultHeaders,
          body: body ? JSON.stringify(body) : null,
        });

        if (!response.ok) {
          // intento extraer mensaje de error del json
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.Error ||
            errorData.error ||
            errorData.errors?.credentials?.[0] ||
            "Error en la solicitud";
          throw new Error(errorMessage);
        }
        
        // Si la respuesta no tiene contenido (ej. 204 No Content)
        if (response.status === 204) {
            return null;
        }

        return await response.json();
      } catch (error) {
        console.error("Error en apiFetch:", error.message);
        showNotification(error.message, "error");
        throw error; 
      }
    },
    [token] // Se recalcula si el token cambia
  );

  // funciones de auth
  const login = async (email, password) => {
    try {
      const data = await apiFetch("/login", {
        method: "POST",
        body: { email, password },
      });

      if (data.access_token) {
        
        const decodedUser = jwtDecodeHelper(data.access_token);
        setToken(data.access_token);
        setUser(decodedUser);
        setIsAuthenticated(true);
        localStorage.setItem("token", data.access_token);
        showNotification("¡Bienvenido!");
        navigateTo("home");
      }
    } catch (error) {
      console.error("Error en login:", error);
      // La notificación de error ya la muestra apiFetch
    }
  };

  const register = async (name, email, password, role) => {
    try {
      await apiFetch("/register", {
        method: "POST",
        body: { username: name, email, password, role },
      });
      showNotification("¡Registro exitoso! Por favor, inicia sesión.");
      navigateTo("login");
    } catch (error) {
      console.error("Error en registro:", error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    showNotification("Sesión cerrada.");
    navigateTo("home");
  };

  // nav funcion simple
  const navigateTo = (page, params = null) => {
    setPage(page);
    setPageParams(params);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    apiFetch,
    page,
    pageParams,
    navigateTo,
    showNotification,
    notification,
    setNotification, 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// notificacion component
const Notification = () => {
  const { notification, setNotification } = useAuth();

  if (!notification.visible) return null;

  const isError = notification.type === "error";

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
        isError ? "bg-red-500" : "bg-green-500"
      } text-white`}
    >
      {isError ? (
        <AlertCircle className="h-6 w-6" />
      ) : (
        <CheckCircle className="h-6 w-6" />
      )}
      <span>{notification.message}</span>
      <button
        onClick={() => setNotification({ ...notification, visible: false })}
        className="ml-auto -mr-1 p-1"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

// componente ruta protegida
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, navigateTo } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo("login");
      return;
    }
    // Si se especifican roles y el usuario no tiene uno de esos roles
    if (roles && !roles.includes(user?.role)) {
      navigateTo("home"); 
    }
  }, [isAuthenticated, user, roles, navigateTo]);

  // Chequeo final
  if (!isAuthenticated) return null;
  if (roles && !roles.includes(user?.role)) return null;

  return children;
};

// navbar component
const Navbar = () => {
  const { isAuthenticated, user, logout, navigateTo } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const NavLink = ({ page, params, children }) => (
    <button
      onClick={() => {
        navigateTo(page, params);
        setMenuOpen(false);
      }}
      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900"
    >
      {children}
    </button>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              onClick={() => navigateTo("home")}
              className="flex-shrink-0 flex items-center font-bold text-xl text-indigo-600"
            >
              BlogReact
            </button>
          </div>
          
          {/* Menu Desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <NavLink page="home">
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </NavLink>
            <NavLink page="posts">
              <Newspaper className="h-4 w-4" />
              <span>Posts</span>
            </NavLink>

            {isAuthenticated ? (
              <>
                {user.role === "admin" && (
                  <NavLink page="admin">
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </NavLink>
                )}
                <span className="text-gray-500 text-sm">
                  Hola, {user.username || user.email}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink page="login">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </NavLink>
                <NavLink page="register">
                  <UserPlus className="h-4 w-4" />
                  <span>Registro</span>
                </NavLink>
              </>
            )}
          </div>
          
          {/* Botón Menú Móvil */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Abrir menú</span>
              {menuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Panel Menú Móvil */}
      {menuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink page="home">
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </NavLink>
            <NavLink page="posts">
              <Newspaper className="h-4 w-4" />
              <span>Posts</span>
            </NavLink>

            {isAuthenticated ? (
              <>
                {user.role === "admin" && (
                  <NavLink page="admin">
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </NavLink>
                )}
                <div className="px-3 py-2 text-sm text-gray-500">
                  Hola, {user.username || user.email}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink page="login">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </NavLink>
                <NavLink page="register">
                  <UserPlus className="h-4 w-4" />
                  <span>Registro</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// home
const HomePage = () => {
  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold mb-4">Bienvenido al Proyecto EFI</h1>
      <p className="text-lg text-gray-600">
        Usa la barra de navegación para explorar los posts o iniciar sesión.
      </p>
    </div>
  );
};

// login
const LoginPage = () => {
  const { login, navigateTo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Entrar
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        ¿No tenés cuenta?{" "}
        <button
          onClick={() => navigateTo("register")}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Registrate
        </button>
      </p>
    </div>
  );
};

// registro
const RegisterPage = () => {
  const { register, navigateTo } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Rol por defecto

  const handleSubmit = (e) => {
    e.preventDefault();
    register(name, email, password, role);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">Crear Cuenta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre (username)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Rol
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
            {/* La API también acepta 'moderator', pero lo ocultamos del registro público */}
          </select>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Registrarse
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        ¿Ya tenés cuenta?{" "}
        <button
          onClick={() => navigateTo("login")}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Inicia Sesión
        </button>
      </p>
    </div>
  );
};

// post
const PostsListPage = () => {
  const { apiFetch, navigateTo, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);

  // Cargar posts al montar
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await apiFetch("/posts/"); // Endpoint público
        setPosts(data || []);
      } catch (error) {
        // El error ya se muestra en la notificación
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
                  Por:{" "}
                  <strong className="text-gray-700">
                    {post.autor?.username || "Anónimo"}
                  </strong>
                </span>
                <span>
                  Categoría:{" "}
                  <strong className="text-gray-700">
                    {post.categoria?.name || "Sin categoría"}
                  </strong>
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

// detalle post
const PostDetailPage = ({ id }) => {
  const { apiFetch, user, isAuthenticated, navigateTo, showNotification } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Cargar post y comentarios
  useEffect(() => {
    if (!id) return;
    
    const fetchPostData = async () => {
      try {
        const postData = await apiFetch(`/posts/${id}`);
        setPost(postData);
        // La API de comments es /posts/<id>/comments
        const commentsData = await apiFetch(`/posts/${id}/comments/`);
        setComments(commentsData || []);
      } catch (error) {
        navigateTo("posts"); // Si el post no existe, volver
      }
    };
    fetchPostData();
  }, [id, apiFetch, navigateTo]);

  // Handler para crear comentario
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      // POST /posts/<id>/comments
      const createdComment = await apiFetch(`/posts/${id}/comments/`, {
        method: "POST",
        body: { content: newComment },
      });
      setComments([createdComment, ...comments]); 
      setNewComment("");
      showNotification("Comentario agregado");
    } catch (error) {
      
    }
  };

  // Handler para borrar post
  const handleDeletePost = async () => {
    if (window.confirm("¿Estás seguro de que querés eliminar este post?")) {
      try {
        // DELETE /posts/<id>
        await apiFetch(`/posts/${id}`, { method: "DELETE" });
        showNotification("Post eliminado");
        navigateTo("posts");
      } catch (error) {
        // error
      }
    }
  };

  // Handler para borrar comentario
  const handleDeleteComment = async (commentId) => {
     if (window.confirm("¿Estás seguro de que querés eliminar este comentario?")) {
        try {
            // DELETE /comments/<comment_id>
            await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
            setComments(comments.filter(c => c.id !== commentId));
            showNotification("Comentario eliminado");
        } catch (error) {
            // error
        }
     }
  };

  if (!post) {
    return <div className="text-center mt-10">Cargando post...</div>;
  }
  
  // Permisos de edición/borrado de post
  const canEditPost = isAuthenticated && (user.role === 'admin' || user.id === post.autor?.id);
  
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      {/* --- DETALLE DEL POST --- */}
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        <span>
          Por:{" "}
          <strong className="text-gray-700">
            {post.autor?.username || "Anónimo"}
          </strong>
        </span>
        {" | "}
        <span>
          Categoría:{" "}
          <strong className="text-gray-700">
            {post.categoria?.name || "Sin categoría"}
          </strong>
        </span>
      </div>
      <p className="text-gray-800 text-lg whitespace-pre-wrap mb-6">
        {post.content}
      </p>
      
      {/* Botones de Acción (Post) */}
      {canEditPost && (
         <div className="flex space-x-4 mb-6">
            <button
               onClick={() => navigateTo('postForm', { id: post.id })}
               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
            >
               <Edit className="h-5 w-5" />
               <span>Editar Post</span>
            </button>
            <button
               onClick={handleDeletePost}
               className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
            >
               <Trash2 className="h-5 w-5" />
               <span>Eliminar Post</span>
            </button>
         </div>
      )}

      <hr className="my-8" />

      {/* comentarios */}
      <h2 className="text-2xl font-bold mb-6">
        Comentarios / Reseñas ({comments.length})
      </h2>

      {/* Formulario de nuevo comentario */}
      {isAuthenticated && (
        <form onSubmit={handleCommentSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario..."
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
          <button
            type="submit"
            className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
          >
            <Send className="h-5 w-5" />
            <span>Enviar</span>
          </button>
        </form>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => {
            // Permisos de borrado de comentario
            const canDeleteComment = isAuthenticated && (
                user.role === 'admin' || 
                user.role === 'moderator' || 
                user.id === comment.autor?.id
            );
            return (
              <div key={comment.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <p className="text-gray-700">{comment.content}</p>
                <div className="text-sm text-gray-500 mt-2 flex justify-between items-center">
                  <span>
                    Por:{" "}
                    <strong className="text-gray-700">
                      {comment.autor?.username || "Anónimo"}
                    </strong>
                  </span>
                  {canDeleteComment && (
                    <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">
            Todavía no hay comentarios. ¡Sé el primero!
          </p>
        )}
      </div>
    </div>
  );
};

// --- formulario de post ---
const PostFormPage = ({ id }) => {
  const { apiFetch, navigateTo, showNotification } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [categories, setCategories] = useState([]);
  
  const isEditing = Boolean(id);

  // Cargar categorías y datos del post (si se está editando)
  useEffect(() => {
    const loadData = async () => {
        try {
            // Cargar categorías (GET /categories)
            const catData = await apiFetch('/categories/');
            setCategories(catData || []);
            
            if (isEditing) {
                // Cargar datos del post (GET /posts/<id>)
                const postData = await apiFetch(`/posts/${id}`);
                setTitle(postData.title);
                setContent(postData.content);
                setCategoriaId(postData.categoria?.id || '');
            }
        } catch (error) {
            // error
        }
    };
    loadData();
  }, [id, isEditing, apiFetch]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
        title,
        content,
        // Enviar categoria_id solo si se seleccionó una
        ...(categoriaId && { categoria_id: parseInt(categoriaId) })
    };
    
    try {
        if (isEditing) {
            // Actualizar (PUT /posts/<id>)
            const updatedPost = await apiFetch(`/posts/${id}`, {
                method: 'PUT',
                body: postData
            });
            showNotification('Post actualizado con éxito');
            navigateTo('postDetail', { id: updatedPost.id });
        } else {
            // Crear (POST /posts)
            const newPost = await apiFetch('/posts/', {
                method: 'POST',
                body: postData
            });
            showNotification('Post creado con éxito');
            navigateTo('postDetail', { id: newPost.id }); // API no devuelve el post, asumimos que devuelve algo con id
        }
    } catch (error) {
        // error
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isEditing ? 'Editar Post' : 'Crear Nuevo Post'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Contenido
          </label>
          <textarea
            id="content"
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Categoría
          </label>
          <select
            id="category"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Sin Categoría --</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isEditing ? 'Guardar Cambios' : 'Publicar Post'}
        </button>
      </form>
    </div>
  );
};

// --- admin page ---
const AdminPage = () => {
  const { apiFetch, showNotification } = useAuth(); 
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  // funcion para cargar users
  const fetchUsers = useCallback(async () => {
    try {
      const usersData = await apiFetch('/users/');
      setUsers(usersData || []);
    } catch (error) {
      // El error ya lo muestra apiFetch
    }
  }, [apiFetch]);

  // Cargar stats y usuarios al montar
  useEffect(() => {
    const loadAdminData = async () => {
        try {
            // GET /stats (requiere admin/mod)
            const statsData = await apiFetch('/stats/');
            setStats(statsData);
            
            // Cargar usuarios
            await fetchUsers();
            
        } catch (error) {
            // error
        }
    };
    loadAdminData();
  }, [apiFetch, fetchUsers]); // Añadir fetchUsers a las dependencias
  

  // Handler para Cambiar Rol
  const handleChangeRole = async (userId, currentRole) => {
    const newRole = window.prompt(
      `Ingresa el nuevo rol para el usuario ${userId} (ej: admin, moderator, user):`,
      currentRole // Pre-carga el rol actual
    );

    if (!newRole || newRole === currentRole) {
      return; // No hacer nada si cancela o no cambia el rol
    }
    
    // Validamos que el rol sea uno de los permitidos por la API
    if (!['admin', 'moderator', 'user'].includes(newRole)) {
        showNotification('Rol inválido. Debe ser "admin", "moderator" o "user".', 'error');
        return;
    }

    try {
      // PATCH /users/<id>/role
      await apiFetch(`/users/${userId}/role`, {
        method: 'PATCH',
        body: { role: newRole }
      });
      showNotification('Rol actualizado con éxito');
      await fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      // El error ya lo muestra apiFetch
    }
  };

  // Handler para Desactivar (Soft Delete)
  const handleDeactivateUser = async (userId, isActive) => {
    // Si el usuario ya está inactivo, no hacemos nada
    if (!isActive) {
        showNotification('Este usuario ya está inactivo.', 'error');
        return;
    }
    
    if (window.confirm(`¿Estás seguro de que querés desactivar al usuario ${userId}? (Soft Delete)`)) {
      try {
        // DELETE /users/<id> (Esto dispara el soft delete en tu backend)
        await apiFetch(`/users/${userId}`, {
          method: 'DELETE'
        });
        showNotification('Usuario desactivado');
        await fetchUsers(); // Recargar la lista de usuarios para ver el estado "Inactivo"
      } catch (error) {
        // El error ya lo muestra apiFetch
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
        <h2 className="text-3xl font-bold mb-6">Panel de Administración</h2>
        
        {/* Sección de Estadísticas (sin cambios) */}
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

        {/* Sección de Gestión de Usuarios (CON BOTONES FUNCIONALES) */}
        <div>
            <h3 className="text-2xl font-semibold mb-4">Gestión de Usuarios</h3>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre (username)</th>
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
                                    {/* --- BOTONES CONECTADOS --- */}
                                    <button 
                                      onClick={() => handleChangeRole(user.id, user.rol)}
                                      className="text-indigo-600 hover:text-indigo-900"
                                    >
                                      Cambiar Rol
                                    </button>
                                    
                                    {/* Deshabilitar si ya está inactivo */}
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
// --- COMPONENTE PRINCIPAL (LAYOUT) ---
const MainLayout = () => {
  const { page, pageParams } = useAuth();

  // "Router" principal
  const CurrentPage = () => {
    switch (page) {
      case "login":
        return <LoginPage />;
      case "register":
        return <RegisterPage />;
      case "posts":
        return <PostsListPage />;
      case "postDetail":
        // Asegurarse de que el componente protegido esté *adentro*
        return <PostDetailPage id={pageParams?.id} />;
      case "postForm":
        // Proteger la creación/edición de posts
        return (
          <ProtectedRoute>
            <PostFormPage id={pageParams?.id} />
          </ProtectedRoute>
        );
      case "admin":
        // Proteger el panel de admin
        return (
          <ProtectedRoute roles={["admin"]}>
            <AdminPage />
          </ProtectedRoute>
        );
      case "home":
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Notification />
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <CurrentPage />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;