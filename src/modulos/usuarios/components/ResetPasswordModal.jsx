
// Este componente define un modal para restablecer la contraseña de un usuario,
// incluyendo validaciones en tiempo real y manejo de notificaciones.
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../components/Modal'; // Importa el componente Modal genérico.
import { showNotification, userMessages } from '../../../utils/notifications'; // Importa utilidades de notificación.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ResetPasswordModal = ({ isOpen, onClose, user, onResetPassword }) => {
  // Si no hay usuario seleccionado, no renderizar el modal
  if (!user) return null;
  // Estado para almacenar la nueva contraseña ingresada por el usuario.
  const [newPassword, setNewPassword] = useState('');
  // Estado para indicar si una operación está en curso (ej. envío de datos).
  const [loading, setLoading] = useState(false);
  // Estado para almacenar mensajes de error de validación locales del modal.
  const [validationError, setValidationError] = useState('');
  // Estado para mostrar/ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Reiniciar estado cuando cambia el usuario o se abre el modal
  React.useEffect(() => {
    if (isOpen && user) {
      setNewPassword('');
      setValidationError('');
      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen, user?.id]);

  // validatePassword: Función para validar la fortaleza de la contraseña.
  // Retorna un mensaje de error si la contraseña no cumple los requisitos, de lo contrario, retorna null.
  const validatePassword = (password) => {
    if (!password) return 'La contraseña es requerida'; // Verifica que la contraseña no esté vacía.
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'; // Longitud mínima.
    if (password.length > 50) return 'La contraseña no puede tener más de 50 caracteres'; // Longitud máxima.
    if (!/(?=.*[a-z])/.test(password)) return 'Debe contener al menos una letra minúscula'; // Requiere minúscula.
    if (!/(?=.*[A-Z])/.test(password)) return 'Debe contener al menos una letra mayúscula'; // Requiere mayúscula.
    if (!/(?=.*\d)/.test(password)) return 'Debe contener al menos un número'; // Requiere un número.
    return null; // Si pasa todas las validaciones, no hay errores.
  };

  // handlePasswordChange: Maneja los cambios en el campo de la nueva contraseña.
  // Actualiza el estado 'newPassword' y realiza la validación en tiempo real.
  const handlePasswordChange = (e) => {
    const value = e.target.value; // Obtiene el valor actual del input.
    setNewPassword(value); // Actualiza el estado de la contraseña.

    // Valida la contraseña en tiempo real y actualiza el estado 'validationError'.
    const error = validatePassword(value);
    setValidationError(error || ''); // Si no hay error, establece una cadena vacía.
  };

  // handleSave: Maneja el envío del formulario para restablecer la contraseña.
  // Realiza la validación final y llama a la función 'onResetPassword' prop.
  const handleSave = async () => {
    // Realiza una validación final antes de intentar enviar los datos.
    const validationError = validatePassword(newPassword);

    if (validationError) {
      setValidationError(validationError); // Muestra el error de validación.
      showNotification.warning(validationError); // Muestra una notificación de advertencia.
      return; // Detiene la ejecución si hay errores de validación.
    }

    setLoading(true); // Activa el estado de carga.
    setValidationError(''); // Limpia cualquier error de validación previo.

    try {
      // Llama a la función 'onResetPassword' pasada como prop, enviando el ID del usuario y la nueva contraseña.
      await onResetPassword(user.id, newPassword);

      // 🎉 NOTIFICACIÓN DE ÉXITO: Muestra un mensaje de éxito al usuario.
      showNotification.success(`Contraseña actualizada para ${user.username || user.correo_electronico}`);

      // Limpia el campo de la contraseña y cierra el modal.
      setNewPassword('');
      onClose();
    } catch (err) {
      // Captura y maneja los errores que puedan ocurrir durante la llamada a la API.

      // 🚨 NOTIFICACIONES DE ERROR ESPECÍFICAS: Muestra mensajes de error basados en el código de estado HTTP.
      if (err.response?.status === 400) {
        showNotification.error('Datos inválidos. Verifica la contraseña.');
      } else if (err.response?.status === 404) {
        showNotification.error('Usuario no encontrado');
      } else if (err.response?.status === 500) {
        showNotification.error('Error del servidor. Intenta nuevamente.');
      } else {
        // Muestra un mensaje de error genérico si no se reconoce el tipo de error.
        showNotification.error(err.message || 'Error al actualizar la contraseña');
      }
    } finally {
      setLoading(false); // Desactiva el estado de carga, independientemente del resultado.
    }
  };

  // handleClose: Maneja el cierre del modal.
  // Limpia los estados del formulario y llama a la función 'onClose' prop.
  const handleClose = () => {
    setNewPassword(''); // Limpia el campo de la contraseña.
    setValidationError(''); // Limpia cualquier error de validación.
    onClose(); // Cierra el modal.
  };

  // isButtonDisabled: Determina si el botón de guardar debe estar deshabilitado.
  // Se deshabilita si está cargando, si la contraseña está vacía o si hay un error de validación.
  const isButtonDisabled = loading || !newPassword || !!validationError;

  return (
    // Renderiza el componente Modal genérico.
    <Modal
      isOpen={isOpen} // Pasa el estado de apertura del modal.
      onClose={handleClose} // Pasa la función para cerrar el modal.
      title={`Restablecer contraseña de ${user?.username || user?.correo_electronico || ''}`} // Título dinámico del modal.
    >
      <div className="flex flex-col space-y-4">

        {/* Input para la nueva contraseña */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Nueva contraseña (mín. 8 caracteres)"
            value={newPassword}
            onChange={handlePasswordChange} // Maneja los cambios en el input.
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
              validationError
                ? 'border-red-500 focus:ring-red-200' // Estilo para error de validación.
                : 'border-gray-300 focus:ring-blue-200' // Estilo normal.
            }`}
            disabled={loading} // Deshabilita el input si está cargando.
          />
          {/* Botón para mostrar/ocultar contraseña */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-4 w-4" />
          </button>
        </div>

        {/* Mensaje de error de validación local */}
        {validationError && (
          <p className="mt-1 text-sm text-red-600">
            {validationError}
          </p>
        )}

        {/* Indicador de fortaleza de contraseña: Muestra los requisitos de la contraseña. */}
        {newPassword && (
          <div className="text-sm">
            <div className="flex space-x-2 mb-1">
              <span className={newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                {newPassword.length >= 8 ? '✓' : '✗'} Mín. 8 caracteres
              </span>
            </div>
            <div className="flex space-x-2">
              <span className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                {/[A-Z]/.test(newPassword) ? '✓' : '✗'} Mayúscula
              </span>
              <span className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                {/[a-z]/.test(newPassword) ? '✓' : '✗'} Minúscula
              </span>
              <span className={/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                {/\d/.test(newPassword) ? '✓' : '✗'} Número
              </span>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            onClick={handleSave} // Llama a handleSave al hacer clic.
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              isButtonDisabled
                ? 'bg-gray-400 cursor-not-allowed' // Estilo deshabilitado.
                : 'bg-blue-600 hover:bg-blue-700' // Estilo habilitado.
            } text-white`}
            disabled={isButtonDisabled} // Deshabilita el botón según 'isButtonDisabled'.
          >
            {loading ? (
              // Muestra un spinner y texto de carga si está cargando.
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </span>
            ) : (
              'Cambiar Contraseña' // Texto normal del botón.
            )}
          </button>

          <button
            onClick={handleClose} // Llama a handleClose al hacer clic.
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading} // Deshabilita el botón si está cargando.
          >
            Cancelar
          </button>
        </div>

      </div>
    </Modal>
  );
};

// Definición de PropTypes para validar las propiedades del componente ResetPasswordModal.
ResetPasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // 'isOpen' debe ser un booleano y es requerido.
  onClose: PropTypes.func.isRequired, // 'onClose' debe ser una función y es requerido.
  user: PropTypes.shape({ // 'user' debe ser un objeto con las siguientes propiedades:
    id: PropTypes.number, // 'id' debe ser un número.
    username: PropTypes.string, // 'username' debe ser un string.
    correo_electronico: PropTypes.string, // 'correo_electronico' debe ser un string.
  }), // 'user' es opcional.
  onResetPassword: PropTypes.func.isRequired, // 'onResetPassword' debe ser una función y es requerido.
};

export default ResetPasswordModal;
