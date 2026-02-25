// src/components/ui/ActionButtons.jsx
// Standardized action buttons component for consistent CRUD operations across modules

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faEye, 
  faCheck, 
  faTimes, 
  faUndo,
  faTrashRestore,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Button from './Button';

const ActionButtons = ({ 
  item,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onRestore,
  onHardDelete,
  permissions = {},
  size = 'sm',
  variant = 'horizontal',
  showLabels = false,
  className = ''
}) => {
  // Determine item state
  const isActive = item?.activo ?? true;
  const isDeleted = item?.eliminado ?? false;
  const hasDeletedAt = item?.deleted_at !== null && item?.deleted_at !== undefined;
  const isInTrash = isDeleted || hasDeletedAt;

  // Default permissions
  const defaultPermissions = {
    view: true,
    edit: true,
    delete: true,
    activate: true,
    restore: true,
    hardDelete: false, // More restrictive by default
    ...permissions
  };

  // Button configurations
  const buttonConfigs = {
    view: {
      icon: faEye,
      label: 'Ver',
      color: 'blue',
      onClick: onView,
      show: defaultPermissions.view && onView,
      disabled: false
    },
    edit: {
      icon: faEdit,
      label: 'Editar',
      color: 'yellow',
      onClick: onEdit,
      show: defaultPermissions.edit && onEdit && !isInTrash,
      disabled: isInTrash
    },
    activate: {
      icon: faCheck,
      label: 'Activar',
      color: 'green',
      onClick: () => onActivate(item.id),
      show: defaultPermissions.activate && onActivate && !isActive && !isInTrash,
      disabled: isInTrash
    },
    deactivate: {
      icon: faTimes,
      label: 'Desactivar',
      color: 'red',
      onClick: () => onDeactivate(item.id),
      show: defaultPermissions.activate && onDeactivate && isActive && !isInTrash,
      disabled: isInTrash
    },
    delete: {
      icon: faTrash,
      label: 'Eliminar',
      color: 'red',
      onClick: () => onDelete(item.id),
      show: defaultPermissions.delete && onDelete && !isInTrash,
      disabled: isInTrash
    },
    restore: {
      icon: faTrashRestore,
      label: 'Restaurar',
      color: 'green',
      onClick: () => onRestore(item.id),
      show: defaultPermissions.restore && onRestore && isInTrash,
      disabled: !isInTrash
    },
    hardDelete: {
      icon: faExclamationTriangle,
      label: 'Eliminar Permanente',
      color: 'red',
      onClick: () => onHardDelete(item.id),
      show: defaultPermissions.hardDelete && onHardDelete && isInTrash,
      disabled: !isInTrash,
      variant: 'danger'
    }
  };

  // Filter visible buttons
  const visibleButtons = Object.entries(buttonConfigs)
    .filter(([_, config]) => config.show)
    .map(([key, config]) => ({ key, ...config }));

  if (visibleButtons.length === 0) {
    return null;
  }

  // Size configurations
  const sizeConfigs = {
    xs: 'text-xs px-1.5 py-1',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  };

  const iconSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClass = variant === 'vertical' 
    ? 'flex flex-col gap-1' 
    : 'flex flex-wrap gap-1';

  return (
    <div className={`${containerClass} ${className}`}>
      {visibleButtons.map(({ key, icon, label, color, onClick, disabled, variant: btnVariant }) => {
        const buttonSize = sizeConfigs[size];
        const iconSize = iconSizes[size];
        
        // Determine button variant based on action type
        let buttonVariant = 'outline';
        if (btnVariant === 'danger') {
          buttonVariant = 'danger';
        } else if (key === 'activate') {
          buttonVariant = 'success';
        } else if (key === 'deactivate' || key === 'delete') {
          buttonVariant = 'danger';
        } else if (key === 'restore') {
          buttonVariant = 'success';
        } else if (key === 'edit') {
          buttonVariant = 'warning';
        } else if (key === 'view') {
          buttonVariant = 'primary';
        }

        return (
          <Button
            key={key}
            variant={buttonVariant}
            size={size}
            onClick={onClick}
            disabled={disabled}
            className={`
              inline-flex items-center justify-center
              ${!showLabels ? 'aspect-square' : ''}
              ${buttonSize}
            `.trim().replace(/\s+/g, ' ')}
            title={label}
          >
            <FontAwesomeIcon 
              icon={icon} 
              className={`${iconSize} ${showLabels ? 'mr-1' : ''}`} 
            />
            {showLabels && (
              <span className="hidden sm:inline">{label}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

// Preset configurations for common use cases
export const ActionButtonsPresets = {
  // Full CRUD operations
  full: {
    permissions: {
      view: true,
      edit: true,
      delete: true,
      activate: true,
      restore: true,
      hardDelete: false
    }
  },
  
  // Read-only operations
  readOnly: {
    permissions: {
      view: true,
      edit: false,
      delete: false,
      activate: false,
      restore: false,
      hardDelete: false
    }
  },
  
  // Basic operations (no hard delete)
  basic: {
    permissions: {
      view: true,
      edit: true,
      delete: true,
      activate: true,
      restore: true,
      hardDelete: false
    }
  },
  
  // Admin operations (including hard delete)
  admin: {
    permissions: {
      view: true,
      edit: true,
      delete: true,
      activate: true,
      restore: true,
      hardDelete: true
    }
  },
  
  // Status management only
  statusOnly: {
    permissions: {
      view: false,
      edit: false,
      delete: false,
      activate: true,
      restore: true,
      hardDelete: false
    }
  }
};

export default ActionButtons;
