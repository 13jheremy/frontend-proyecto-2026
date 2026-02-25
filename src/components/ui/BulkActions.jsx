// src/components/ui/BulkActions.jsx
// Component for bulk operations on selected items

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faTimes, 
  faArchive, 
  faTrashRestore,
  faChevronDown,
  faCheckSquare,
  faSquare
} from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';
import ConfirmationDialog from './ConfirmationDialog';

const BulkActions = ({ 
  selectedItems = [], 
  totalItems = 0,
  onSelectAll,
  onClearSelection,
  onBulkAction,
  availableActions = ['activate', 'deactivate', 'softDelete', 'restore'],
  loading = false,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    action: null,
    title: '',
    message: ''
  });

  const selectedCount = selectedItems.length;
  const allSelected = selectedCount === totalItems && totalItems > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalItems;

  // Action configurations
  const actionConfigs = {
    activate: {
      label: 'Activar seleccionados',
      icon: faCheck,
      color: 'green',
      confirmTitle: 'Activar elementos seleccionados',
      confirmMessage: `¿Estás seguro de que deseas activar ${selectedCount} elemento(s) seleccionado(s)?`
    },
    deactivate: {
      label: 'Desactivar seleccionados',
      icon: faTimes,
      color: 'red',
      confirmTitle: 'Desactivar elementos seleccionados',
      confirmMessage: `¿Estás seguro de que deseas desactivar ${selectedCount} elemento(s) seleccionado(s)?`
    },
    softDelete: {
      label: 'Eliminar temporalmente',
      icon: faArchive,
      color: 'yellow',
      confirmTitle: 'Eliminar temporalmente elementos seleccionados',
      confirmMessage: `¿Estás seguro de que deseas eliminar temporalmente ${selectedCount} elemento(s) seleccionado(s)? Podrás restaurarlos más tarde.`
    },
    restore: {
      label: 'Restaurar seleccionados',
      icon: faTrashRestore,
      color: 'blue',
      confirmTitle: 'Restaurar elementos seleccionados',
      confirmMessage: `¿Estás seguro de que deseas restaurar ${selectedCount} elemento(s) seleccionado(s)?`
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  };

  const handleActionClick = (action) => {
    const config = actionConfigs[action];
    if (!config) return;

    setConfirmDialog({
      isOpen: true,
      action,
      title: config.confirmTitle,
      message: config.confirmMessage
    });
    setShowActions(false);
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action && selectedItems.length > 0) {
      onBulkAction(confirmDialog.action, selectedItems);
    }
    setConfirmDialog({ isOpen: false, action: null, title: '', message: '' });
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ isOpen: false, action: null, title: '', message: '' });
  };

  if (totalItems === 0) return null;

  return (
    <>
      <div className={`flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border ${className}`}>
        {/* Select All Checkbox */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <FontAwesomeIcon 
              icon={allSelected ? faCheckSquare : someSelected ? faCheckSquare : faSquare}
              className={`mr-2 ${someSelected ? 'text-blue-600' : ''}`}
            />
            {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>

        {/* Selection Info */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-4 flex-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount} de {totalItems} seleccionado(s)
            </span>

            {/* Bulk Actions */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowActions(!showActions)}
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Acciones
                <FontAwesomeIcon icon={faChevronDown} className="ml-2 h-3 w-3" />
              </button>

              {/* Actions Dropdown */}
              {showActions && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    {availableActions.map((action) => {
                      const config = actionConfigs[action];
                      if (!config) return null;

                      return (
                        <button
                          key={action}
                          onClick={() => handleActionClick(action)}
                          disabled={loading}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FontAwesomeIcon 
                            icon={config.icon} 
                            className={`mr-3 h-4 w-4 text-${config.color}-600`} 
                          />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Selection */}
            <button
              type="button"
              onClick={onClearSelection}
              disabled={loading}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar selección
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Confirmar"
        cancelText="Cancelar"
        type="warning"
        loading={loading}
      />
    </>
  );
};

export default BulkActions;
