import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Notification from "./components/Notification";
import ProtectedRoute from "./components/ProtectedRoute";

// Importar Páginas
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PostsListPage from "./pages/PostsListPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostFormPage from "./pages/PostFormPage";
import AdminPage from "./pages/AdminPage";

// Layout Principal
const MainLayout = () => {
  const { page, pageParams } = useAuth();

  const CurrentPage = () => {
    switch (page) {
      case "login": return <LoginPage />;
      case "register": return <RegisterPage />;
      case "posts": return <PostsListPage />;
      case "postDetail": return <PostDetailPage id={pageParams?.id} />;
      case "postForm":
        return (
          <ProtectedRoute>
            <PostFormPage id={pageParams?.id} />
          </ProtectedRoute>
        );
      case "admin":
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