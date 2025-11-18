// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// --- CONFIGURACIÓN DE LA API ---
const API_URL = "http://127.0.0.1:5000";

// --- HELPER PARA DECODIFICAR JWT ---
const jwtDecodeHelper = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) throw new Error("Token inválido");
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estado de Navegación y Notificaciones
  const [page, setPage] = useState("home");
  const [pageParams, setPageParams] = useState(null);
  const [notification, setNotification] = useState({ visible: false, message: "", type: "success" });

  // --- EFECTO INICIAL ---
  useEffect(() => {
    if (token) {
      const decodedUser = jwtDecodeHelper(token);
      const isExpired = decodedUser && decodedUser.exp * 1000 < Date.now();
      if (decodedUser && !isExpired) {
        setUser(decodedUser);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("token");
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const showNotification = (message, type = "success") => {
    setNotification({ visible: true, message, type });
    setTimeout(() => setNotification({ visible: false, message: "", type }), 3000);
  };

  const navigateTo = (page, params = null) => {
    setPage(page);
    setPageParams(params);
  };

  const apiFetch = useCallback(async (endpoint, options = {}) => {
      const { headers = {}, body, ...restOptions } = options;
      const defaultHeaders = { ...headers };
      if (body) defaultHeaders["Content-Type"] = "application/json";
      if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;

      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          ...restOptions,
          headers: defaultHeaders,
          body: body ? JSON.stringify(body) : null,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.Error || errorData.error || "Error en la solicitud");
        }
        if (response.status === 204) return null;
        return await response.json();
      } catch (error) {
        showNotification(error.message, "error");
        throw error;
      }
    }, [token]);

  const login = async (email, password) => {
    try {
      const data = await apiFetch("/login", { method: "POST", body: { email, password } });
      if (data.access_token) {
        const decodedUser = jwtDecodeHelper(data.access_token);
        setToken(data.access_token);
        setUser(decodedUser);
        setIsAuthenticated(true);
        localStorage.setItem("token", data.access_token);
        showNotification("¡Bienvenido!");
        navigateTo("home");
      }
    } catch (error) { console.error(error); }
  };

  const register = async (name, email, password, role) => {
    try {
      await apiFetch("/register", { method: "POST", body: { username: name, email, password, role } });
      showNotification("¡Registro exitoso!");
      navigateTo("login");
    } catch (error) { console.error(error); }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    showNotification("Sesión cerrada.");
    navigateTo("home");
  };

  const value = { user, token, isAuthenticated, loading, login, register, logout, apiFetch, page, pageParams, navigateTo, showNotification, notification, setNotification };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};