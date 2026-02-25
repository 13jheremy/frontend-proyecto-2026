import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Catalogo from '../pages/Catalogo'
import Contactos from '../pages/Contactos';
import AuthGuard from '../guards/AuthGuard';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

const PublicRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Home y páginas públicas siempre accesibles */}
      <Route path="/" element={<Home />} />
      <Route path="/catalogo" element={<Catalogo/>} />
      <Route path="/contactos" element={<Contactos />} />

      {/* Login solo accesible si NO está autenticado */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login />
          ) : (
            // Si ya está logueado, redirigimos al Dashboard
            <AuthGuard>
              <Navigate to="/" replace />
            </AuthGuard>
          )
        }
      />

      {/* Rutas de recuperación de contraseña - solo para usuarios NO autenticados */}
      <Route
        path="/forgot-password"
        element={
          !isAuthenticated ? (
            <ForgotPasswordForm />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/reset-password/:uid/:token"
        element={
          !isAuthenticated ? (
            <ResetPasswordForm />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Fallback: cualquier ruta pública inválida va a Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PublicRoutes;
