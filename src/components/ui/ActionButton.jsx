// src/components/ui/ActionButton.jsx
// Standardized action button component for CRUD operations

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faTrashRestore, 
  faEye, 
  faToggleOn, 
  faToggleOff,
  faCheck,
  faTimes,
  faPlus,
  faDownload,
  faUpload,
  faCopy,
  faArchive,
  faUndo
} from '@fortawesome/free-solid-svg-icons';

const ActionButton = ({ 
  action, 
  onClick, 
  disabled = false, 
  size = 'sm', 
  variant = 'default',
  tooltip,
  className = '',
  children,
  ...props 
}) => {
  // Define action configurations
  const actionConfigs = {
    view: {
      icon: faEye,
      className: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
      tooltip: 'Ver detalles'
    },
    edit: {
      icon: faEdit,
      className: 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50',
      tooltip: 'Editar'
    },
    delete: {
      icon: faTrash,
      className: 'text-red-600 hover:text-red-800 hover:bg-red-50',
      tooltip: 'Eliminar'
    },
    softDelete: {
      icon: faArchive,
      className: 'text-orange-600 hover:text-orange-800 hover:bg-orange-50',
      tooltip: 'Eliminar temporalmente'
    },
    hardDelete: {
      icon: faTrash,
      className: 'text-red-700 hover:text-red-900 hover:bg-red-50',
      tooltip: 'Eliminar permanentemente'
    },
    restore: {
      icon: faTrashRestore,
      className: 'text-green-600 hover:text-green-800 hover:bg-green-50',
      tooltip: 'Restaurar'
    },
    activate: {
      icon: faToggleOn,
      className: 'text-green-600 hover:text-green-800 hover:bg-green-50',
      tooltip: 'Activar'
    },
    deactivate: {
      icon: faToggleOff,
      className: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
      tooltip: 'Desactivar'
    },
    toggle: {
      icon: faToggleOn,
      className: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
      tooltip: 'Cambiar estado'
    },
    create: {
      icon: faPlus,
      className: 'text-green-600 hover:text-green-800 hover:bg-green-50',
      tooltip: 'Crear'
    },
    copy: {
      icon: faCopy,
      className: 'text-purple-600 hover:text-purple-800 hover:bg-purple-50',
      tooltip: 'Duplicar'
    },
    download: {
      icon: faDownload,
      className: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
      tooltip: 'Descargar'
    },
    upload: {
      icon: faUpload,
      className: 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50',
      tooltip: 'Subir'
    },
    approve: {
      icon: faCheck,
      className: 'text-green-600 hover:text-green-800 hover:bg-green-50',
      tooltip: 'Aprobar'
    },
    reject: {
      icon: faTimes,
      className: 'text-red-600 hover:text-red-800 hover:bg-red-50',
      tooltip: 'Rechazar'
    },
    undo: {
      icon: faUndo,
      className: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
      tooltip: 'Deshacer'
    }
  };

  // Size configurations
  const sizeConfigs = {
    xs: 'p-1 text-xs',
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg'
  };

  // Variant configurations
  const variantConfigs = {
    default: 'border border-transparent',
    outlined: 'border border-current',
    filled: 'border border-transparent bg-current/10',
    ghost: 'border border-transparent bg-transparent'
  };

  const config = actionConfigs[action] || {};
  const sizeClass = sizeConfigs[size] || sizeConfigs.sm;
  const variantClass = variantConfigs[variant] || variantConfigs.default;

  const buttonClassName = `
    inline-flex items-center justify-center
    rounded-md
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
    ${sizeClass}
    ${variantClass}
    ${config.className || 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const buttonTooltip = tooltip || config.tooltip || action;

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
      title={buttonTooltip}
      aria-label={buttonTooltip}
      {...props}
    >
      {config.icon && (
        <FontAwesomeIcon 
          icon={config.icon} 
          className={children ? 'mr-1.5' : ''} 
        />
      )}
      {children}
    </button>
  );
};

export default ActionButton;
