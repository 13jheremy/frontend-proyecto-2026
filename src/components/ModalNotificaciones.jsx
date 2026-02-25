// src/components/modals/ActionModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal';
import { showNotification, handleApiError } from '../../utils/notifications';

const ActionModal = ({
  isOpen,
  onClose,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  confirmDisabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) return;

    setLoading(true);
    try {
      await onConfirm(); // Ejecuta la acción pasada como prop
      showNotification.success(`${title} ejecutado exitosamente`);
      onClose();
    } catch (err) {
      handleApiError(err); // Maneja errores automáticamente con toast
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title}>
      <div className="flex flex-col space-y-4">
        {/* Descripción o mensaje de advertencia */}
        {description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
        )}

        {/* Botones */}
        <div className="flex space-x-3 justify-end">
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-md text-white transition-colors ${
              loading || confirmDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading || confirmDisabled}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Ejecutando...
              </span>
            ) : (
              confirmText
            )}
          </button>

          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

ActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  confirmDisabled: PropTypes.bool,
};

export default ActionModal;
