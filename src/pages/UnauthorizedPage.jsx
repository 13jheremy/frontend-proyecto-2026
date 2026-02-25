import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { primaryRole } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20 dark:border-slate-700/20">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Acceso Denegado
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          No tienes permisos para acceder a esta página.
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Tu rol actual es: <span className="font-semibold text-blue-600 dark:text-blue-400">{primaryRole}</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGoBack}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200"
          >
            Volver Atrás
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg font-medium transition-colors duration-200"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 
