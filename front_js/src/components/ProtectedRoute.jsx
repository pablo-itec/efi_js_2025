// src/components/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, navigateTo } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo("login");
      return;
    }
    if (roles && !roles.includes(user?.role)) {
      navigateTo("home");
    }
  }, [isAuthenticated, user, roles, navigateTo]);

  if (!isAuthenticated) return null;
  if (roles && !roles.includes(user?.role)) return null;
  return children;
};
export default ProtectedRoute;