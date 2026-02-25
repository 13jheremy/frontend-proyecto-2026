// src/components/ui/ConfirmationDialog.jsx
// Standardized confirmation dialog for CRUD operations

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faTrash, 
  faArchive, 
  faTrashRestore, 
  faToggleOn, 
  faToggleOff,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  action = null, // 'delete', 'softDelete', 'hardDelete', 'restore', 'activate', 'deactivate'
  entity = null,
  loading = false
}) => {
  if (!isOpen) return null;

  // Action-specific configurations
  const actionConfigs = {
    delete: {
      icon: faTrash,
      title: `Eliminar ${entity?.nombre || 'elemento'}`,
      message: `¿Estás seguro de que deseas eliminar "${entity?.nombre || 'este elemento'}"?`,
      confirmText: 'Eliminar',
      type: 'danger'
    },
    softDelete: {
      icon: faArchive,
      title: `Eliminar temporalmente ${entity?.nombre || 'elemento'}`,
      message: `¿Estás seguro de que deseas eliminar temporalmente "${entity?.nombre || 'este elemento'}"? Podrás restaurarlo más tarde.`,
      confirmText: 'Eliminar temporalmente',
      type: 'warning'
    },
    hardDelete: {
      icon: faTrash,
      title: `Eliminar permanentemente ${entity?.nombre || 'elemento'}`,
      message: `¿Estás seguro de que deseas eliminar permanentemente "${entity?.nombre || 'este elemento'}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar permanentemente',
      type: 'danger'
    },
    restore: {
      icon: faTrashRestore,
      title: `Restaurar ${entity?.nombre || 'elemento'}`,
      message: `¿Estás seguro de que deseas restaurar "${entity?.nombre || 'este elemento'}"?`,
      confirmText: 'Restaurar',
      type: 'success'
    },
    activate: {
      icon: faToggleOn,
      title: `Activar ${entity?.nombre || 'elemento'}`,
      message: `¿Estás seguro de que deseas activar "${entity?.nombre || 'este elemento'}"?`,
      confirmText: 'Activar',
      type: 'success'
    },
    deactivate: {
      icon: faToggleOff,
      title: `Desactivar ${entity?.nombre || 'elemento'}`,
      message: `¿Estás seguro de que deseas desactivar "${entity?.nombre || 'este elemento'}"?`,
      confirmText: 'Desactivar',
      type: 'warning'
    },
    toggle: {
      icon: entity?.activo || entity?.is_active ? faToggleOff : faToggleOn,
      title: `${entity?.activo || entity?.is_active ? 'Desactivar' : 'Activar'} ${entity?.nombre || 'elemento'}`,
      message: `¿Estás seguro de que deseas ${entity?.activo || entity?.is_active ? 'desactivar' : 'activar'} "${entity?.nombre || 'este elemento'}"?`,
      confirmText: entity?.activo || entity?.is_active ? 'Desactivar' : 'Activar',
      type: entity?.activo || entity?.is_active ? 'warning' : 'success'
    }
  };

  // Use action config if available, otherwise use props
  const config = action ? actionConfigs[action] : {};
  const finalTitle = title || config.title || 'Confirmar acción';
  const finalMessage = message || config.message || '¿Estás seguro de que deseas continuar?';
  const finalConfirmText = confirmText !== 'Confirmar' ? confirmText : config.confirmText || 'Confirmar';
  const finalType = type !== 'warning' ? type : config.type || 'warning';
  const icon = config.icon || faExclamationTriangle;

  // Type-specific styles
  const typeStyles = {
    warning: {
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    danger: {
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    success: {
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
    },
    info: {
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  };

  const styles = typeStyles[finalType] || typeStyles.warning;

  const handleConfirm = () => {
    if (entity) {
      onConfirm(entity.id, action);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Center the modal */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

        {/* Modal panel */}
        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
              <FontAwesomeIcon 
                icon={icon} 
                className={`h-6 w-6 ${styles.iconColor}`}
              />
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {finalTitle}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {finalMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                finalConfirmText
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
