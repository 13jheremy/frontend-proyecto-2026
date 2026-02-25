// components/auth/ResetPasswordForm.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner, faArrowLeft, faExclamationTriangle, faCheckCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { API_CONFIG } from '../../utils/constants';

const ResetPasswordForm = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Verificar que tenemos uid y token
    if (!uid || !token) {
      setError('Enlace de recuperación inválido');
    }
  }, [uid, token]);

  const validatePassword = (password) => {
    const errors = {};
    
    if (password.length < 8) {
      errors.length = 'Debe tener al menos 8 caracteres';
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.lowercase = 'Debe contener al menos una letra minúscula';
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.uppercase = 'Debe contener al menos una letra mayúscula';
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.number = 'Debe contener al menos un número';
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar contraseña en tiempo real
    if (name === 'new_password') {
      const errors = validatePassword(value);
      setValidationErrors(errors);
    }

    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { new_password, confirm_password } = formData;

    // Validaciones
    if (!new_password || !confirm_password) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (new_password !== confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const passwordErrors = validatePassword(new_password);
    if (Object.keys(passwordErrors).length > 0) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.PASSWORD_RESET_CONFIRM, {
        uid,
        token,
        new_password
      });
      
      setMessage(response.data.message);
      setPasswordReset(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al cambiar la contraseña. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (passwordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faCheckCircle} className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              ¡Contraseña Actualizada!
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                Serás redirigido al login en unos segundos...
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Ir al Login Ahora
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faLock} className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Cambiar Contraseña
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tu nueva contraseña para completar la recuperación.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nueva Contraseña */}
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="new_password"
                  name="new_password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Ingresa tu nueva contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon 
                    icon={showPassword ? faEyeSlash : faEye} 
                    className="h-5 w-5 text-gray-400 hover:text-gray-600" 
                  />
                </button>
              </div>
              
              {/* Indicadores de validación de contraseña */}
              {formData.new_password && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center ${!validationErrors.length ? 'text-green-600' : 'text-red-600'}`}>
                      <FontAwesomeIcon 
                        icon={!validationErrors.length ? faCheckCircle : faExclamationTriangle} 
                        className="h-3 w-3 mr-1" 
                      />
                      Al menos 8 caracteres
                    </div>
                    <div className={`flex items-center ${!validationErrors.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                      <FontAwesomeIcon 
                        icon={!validationErrors.lowercase ? faCheckCircle : faExclamationTriangle} 
                        className="h-3 w-3 mr-1" 
                      />
                      Una letra minúscula
                    </div>
                    <div className={`flex items-center ${!validationErrors.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                      <FontAwesomeIcon 
                        icon={!validationErrors.uppercase ? faCheckCircle : faExclamationTriangle} 
                        className="h-3 w-3 mr-1" 
                      />
                      Una letra mayúscula
                    </div>
                    <div className={`flex items-center ${!validationErrors.number ? 'text-green-600' : 'text-red-600'}`}>
                      <FontAwesomeIcon 
                        icon={!validationErrors.number ? faCheckCircle : faExclamationTriangle} 
                        className="h-3 w-3 mr-1" 
                      />
                      Un número
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirma tu nueva contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesomeIcon 
                    icon={showConfirmPassword ? faEyeSlash : faEye} 
                    className="h-5 w-5 text-gray-400 hover:text-gray-600" 
                  />
                </button>
              </div>
              
              {/* Indicador de coincidencia */}
              {formData.confirm_password && (
                <div className="mt-1">
                  <div className={`text-xs flex items-center ${
                    formData.new_password === formData.confirm_password ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <FontAwesomeIcon 
                      icon={formData.new_password === formData.confirm_password ? faCheckCircle : faExclamationTriangle} 
                      className="h-3 w-3 mr-1" 
                    />
                    {formData.new_password === formData.confirm_password ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0 || formData.new_password !== formData.confirm_password}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Cambiando Contraseña...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faLock} className="mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </button>

            <Link
              to="/login"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Volver al Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
