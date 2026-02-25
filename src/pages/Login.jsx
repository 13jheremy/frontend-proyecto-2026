// src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingIndicator from "../components/LoadingIndicator";
import loginBackground from "../assets/login.jpg";
import { MESSAGES } from '../utils/constants';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Estados locales
  const [formData, setFormData] = useState({
    correo_electronico: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  // Limpiar errores cuando cambian los campos
  useEffect(() => {
    if (error) {
      clearError();
    }
    setFormErrors({});
  }, [formData.correo_electronico, formData.password]);

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.correo_electronico.trim()) {
      errors.correo_electronico = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo_electronico)) {
      errors.correo_electronico = MESSAGES.LOGIN.INVALID_EMAIL;
    }

    if (!formData.password.trim()) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(formData.correo_electronico, formData.password);
      
      if (result.success) {
        // El redirect se maneja en el useEffect
        console.log('Login exitoso');
      } else {
        // Los errores se manejan automáticamente por el contexto
        console.error('Error en login:', result.error);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si está cargando la autenticación inicial, mostrar loading
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <section 
        className="relative h-full flex items-center justify-center p-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url(${loginBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="w-full max-w-4xl">
          {/* Tarjeta de login moderna - Layout horizontal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 max-h-[90vh]">
            {/* Panel izquierdo - Branding */}
            <div className="bg-red-600 px-8 py-8 flex flex-col justify-center items-center text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
                <span className="text-3xl font-bold text-red-600">JIC</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Sistema de Gestión
              </h1>
              <p className="text-red-100 text-lg mb-6">
                Taller de Motocicletas
              </p>
              <div className="text-red-200 text-sm">
                <p>• Gestión de inventario</p>
                <p>• Control de mantenimientos</p>
                <p>• Sistema POS integrado</p>
              </div>
            </div>

            {/* Panel derecho - Formulario */}
            <div className="px-8 py-6 flex flex-col justify-center">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Iniciar Sesión
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Accede a tu cuenta del sistema
                </p>
              </div>
              
              {/* Mostrar errores generales */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo Email */}
                <div>
                  <label htmlFor="correo_electronico" className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-sm">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    Correo Electrónico
                  </label>
                  <input
                    id="correo_electronico"
                    name="correo_electronico"
                    type="email"
                    value={formData.correo_electronico}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.correo_electronico ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="ejemplo@correo.com"
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.correo_electronico && (
                    <p className="mt-1 text-red-600 text-xs">{formErrors.correo_electronico}</p>
                  )}
                </div>

                {/* Campo Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-sm">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        formErrors.password ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Ingrese su contraseña"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-red-600 text-xs">{formErrors.password}</p>
                  )}
                </div>

                {/* Opciones adicionales */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500" 
                      disabled={isSubmitting} 
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Recuérdame
                    </span>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-red-600 hover:text-red-700 font-medium transition-colors duration-300 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-400/50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <LoadingIndicator size="sm" className="mr-2" />
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                      </svg>
                      <span>Iniciar Sesión</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;