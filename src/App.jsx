// App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import PublicRoutes from "./routes/PublicRoutes";
import PrivateRoutes from "./routes/PrivateRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarPublic from "./components/layout/Navbarpublic";
import MainLayout from "./components/layout/MainLayout";

function AppContent() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <MainLayout>
      <PrivateRoutes />
    </MainLayout>
  ) : (
    <>
      <NavbarPublic />
      <PublicRoutes />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-100 dark:bg-slate-900">
          <AppContent />
          {/* Configuración del ToastContainer */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light" // Cambiar a "dark" si quieres modo oscuro
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
