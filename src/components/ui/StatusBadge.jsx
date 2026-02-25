// src/components/ui/StatusBadge.jsx
// Standardized status badge component for displaying entity states

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faTimes, 
  faArchive, 
  faClock, 
  faExclamationTriangle,
  faCircle
} from '@fortawesome/free-solid-svg-icons';

const StatusBadge = ({ 
  status, 
  type = 'active', // 'active', 'deleted', 'custom'
  size = 'sm',
  showIcon = true,
  className = '',
  ...props 
}) => {
  // Size configurations
  const sizeConfigs = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  // Status configurations for active/inactive states
  const activeStatusConfigs = {
    true: {
      icon: faCheck,
      text: 'Activo',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    false: {
      icon: faTimes,
      text: 'Inactivo',
      className: 'bg-red-100 text-red-800 border-red-200'
    }
  };

  // Status configurations for deleted states
  const deletedStatusConfigs = {
    true: {
      icon: faArchive,
      text: 'Eliminado',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    false: {
      icon: faCheck,
      text: 'Normal',
      className: 'bg-green-100 text-green-800 border-green-200'
    }
  };

  // Custom status configurations
  const customStatusConfigs = {
    // Maintenance states
    pendiente: {
      icon: faClock,
      text: 'Pendiente',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    en_proceso: {
      icon: faCircle,
      text: 'En Proceso',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    completado: {
      icon: faCheck,
      text: 'Completado',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    cancelado: {
      icon: faTimes,
      text: 'Cancelado',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    
    // Inventory movement types
    entrada: {
      icon: faCheck,
      text: 'Entrada',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    salida: {
      icon: faTimes,
      text: 'Salida',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    ajuste: {
      icon: faExclamationTriangle,
      text: 'Ajuste',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    
    // Stock levels
    stock_bajo: {
      icon: faExclamationTriangle,
      text: 'Stock Bajo',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    stock_normal: {
      icon: faCheck,
      text: 'Stock Normal',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    sin_stock: {
      icon: faTimes,
      text: 'Sin Stock',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    
    // Payment states
    pagado: {
      icon: faCheck,
      text: 'Pagado',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    pendiente_pago: {
      icon: faClock,
      text: 'Pendiente de Pago',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    vencido: {
      icon: faExclamationTriangle,
      text: 'Vencido',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    
    // Default states
    activo: {
      icon: faCheck,
      text: 'Activo',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    inactivo: {
      icon: faTimes,
      text: 'Inactivo',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    eliminado: {
      icon: faArchive,
      text: 'Eliminado',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  };

  // Determine which config to use
  let config;
  if (type === 'active') {
    config = activeStatusConfigs[status];
  } else if (type === 'deleted') {
    config = deletedStatusConfigs[status];
  } else {
    config = customStatusConfigs[status];
  }

  // Fallback config
  if (!config) {
    config = {
      icon: faCircle,
      text: status?.toString() || 'Desconocido',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    };
  }

  const sizeClass = sizeConfigs[size] || sizeConfigs.sm;

  const badgeClassName = `
    inline-flex items-center
    rounded-full border
    font-medium
    ${sizeClass}
    ${config.className}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={badgeClassName} {...props}>
      {showIcon && config.icon && (
        <FontAwesomeIcon 
          icon={config.icon} 
          className={config.text ? 'mr-1' : ''} 
        />
      )}
      {config.text}
    </span>
  );
};

export default StatusBadge;
