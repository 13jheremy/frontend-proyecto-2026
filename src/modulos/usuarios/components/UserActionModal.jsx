// Este componente define un modal genérico para confirmar diversas acciones de usuario,
// como eliminación temporal, eliminación permanente, restauración o cambio de estado.

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal'; // Importa el componente Modal genérico.

const UserActionModal = ({ isOpen, onClose, user, actionType, onConfirm }) => {
  // Estado para controlar el estado de carga del botón de confirmación.
  const [loading, setLoading] = useState(false);

  // Si no se proporciona un usuario o un tipo de acción, no renderiza el modal.
  if (!user || !actionType) return null;

  // getModalConfig: Función que devuelve la configuración específica del modal
  // (título, mensaje, texto del botón de confirmación, clase CSS y texto de carga)
  // según el 'actionType' proporcionado.
  const getModalConfig = () => {
    switch(actionType) {
      case 'softDelete':
        return {
          title: 'Eliminar Usuario (Temporal)',
          message: `¿Está seguro de eliminar temporalmente al usuario "${user.username}"? Podrá restaurarlo después.`,
          confirmText: 'Eliminar Temporalmente',
          confirmClass: 'bg-orange-600 hover:bg-orange-700',
          loadingText: `Eliminando temporalmente a "${user.username}"...`
        };
      case 'hardDelete':
        return {
          title: 'Eliminar Usuario (Permanente)',
          message: `¡ADVERTENCIA! ¿Está seguro de eliminar PERMANENTEMENTE al usuario "${user.username}"? Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar Permanentemente',
          confirmClass: 'bg-red-600 hover:bg-red-700',
          loadingText: `Eliminando permanentemente a "${user.username}"...`
        };
      case 'restore':
        return {
          title: 'Restaurar Usuario',
          message: `¿Desea restaurar al usuario "${user.username}"?`,
          confirmText: 'Restaurar',
          confirmClass: 'bg-green-600 hover:bg-green-700',
          loadingText: `Restaurando usuario "${user.username}"...`
        };
      case 'toggleStatus':
        return {
          title: 'Cambiar Estado',
          message: user.is_active // El mensaje cambia si el usuario está activo o inactivo.
            ? `¿Desea desactivar al usuario "${user.username}"?`
            : `¿Desea activar al usuario "${user.username}"?`,
          confirmText: user.is_active ? 'Desactivar' : 'Activar', // El texto del botón cambia.
          confirmClass: user.is_active
            ? 'bg-red-600 hover:bg-red-700' // Clase para desactivar.
            : 'bg-green-600 hover:bg-green-700', // Clase para activar.
          loadingText: user.is_active
            ? `Desactivando usuario "${user.username}"...`
            : `Activando usuario "${user.username}"...`
        };
      default:
        // Configuración por defecto si el 'actionType' no coincide con ninguno.
        return {
          title: 'Confirmar Acción',
          message: 'Confirme la acción a realizar.',
          confirmText: 'Confirmar',
          confirmClass: 'bg-blue-600 hover:bg-blue-700',
          loadingText: 'Procesando...'
        };
    }
  };

  // Obtiene la configuración del modal basada en el tipo de acción.
  const config = getModalConfig();

  // handleConfirm: Función asíncrona que se ejecuta al confirmar la acción.
  // Activa el estado de carga, llama a 'onConfirm' y luego cierra el modal.
  const handleConfirm = async () => {
    setLoading(true); // Activa el estado de carga.

    try {
      // Llama a la función 'onConfirm' pasada como prop, enviando el ID del usuario y el tipo de acción.
      await onConfirm(user.id, actionType);
      onClose(); // Cierra el modal después de una confirmación exitosa.
    } catch (err) {
      // Captura cualquier error que ocurra durante la confirmación.
    } finally {
      setLoading(false); // Desactiva el estado de carga, independientemente del resultado.
    }
  };

  return (
    // Renderiza el componente Modal genérico.
    <Modal isOpen={isOpen} onClose={onClose} title={config.title}>
      <div className="flex flex-col space-y-4">
        {/* Muestra el mensaje de confirmación específico de la acción. */}
        <p className="text-gray-700 dark:text-gray-300">{config.message}</p>

        <div className="flex space-x-3">
          {/* Botón de confirmación de la acción. */}
          <button
            onClick={handleConfirm} // Llama a handleConfirm al hacer clic.
            disabled={loading} // Deshabilita el botón si está cargando.
            className={`flex-1 px-4 py-2 rounded-md text-white transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : config.confirmClass // Cambia la clase CSS si está cargando.
            }`}
          >
            {loading ? (
              // Muestra un spinner y texto de carga si está cargando.
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {config.loadingText}
              </span>
            ) : config.confirmText} {/* Muestra el texto normal del botón. */}
          </button>

          {/* Botón para cancelar la acción y cerrar el modal. */}
          <button
            onClick={onClose} // Llama a onClose al hacer clic.
            disabled={loading} // Deshabilita el botón si está cargando.
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Definición de PropTypes para validar las propiedades del componente UserActionModal.
UserActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // 'isOpen' debe ser un booleano y es requerido.
  onClose: PropTypes.func.isRequired, // 'onClose' debe ser una función y es requerido.
  user: PropTypes.shape({ // 'user' debe ser un objeto con las siguientes propiedades:
    id: PropTypes.number.isRequired, // 'id' debe ser un número y es requerido.
    username: PropTypes.string.isRequired, // 'username' debe ser un string y es requerido.
    is_active: PropTypes.bool.isRequired, // 'is_active' debe ser un booleano y es requerido.
  }), // 'user' es opcional.
  actionType: PropTypes.oneOf(['softDelete', 'hardDelete', 'restore', 'toggleStatus']), // 'actionType' es opcional.
  onConfirm: PropTypes.func.isRequired, // 'onConfirm' debe ser una función y es requerido.
};

export default UserActionModal;
