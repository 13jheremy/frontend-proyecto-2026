// src/modulos/categorias/pages/components/CategoriaActionModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faRecycle, faTrashRestore, faToggleOff, faToggleOn, faListAlt } from '@fortawesome/free-solid-svg-icons';

const CategoriaActionModal = ({ isOpen, onClose, categoria, actionType, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!categoria || !actionType) return null;

  const getModalConfig = () => {
    switch(actionType) {
      case 'softDelete':
        return {
          title: 'Eliminar Categoría (Temporal)',
          message: `¿Está seguro de eliminar temporalmente la categoría "${categoria.nombre}"? Podrá restaurarla después.`,
          confirmText: 'Eliminar Temporalmente',
          confirmClass: 'bg-orange-600 hover:bg-orange-700',
          loadingText: `Eliminando temporalmente "${categoria.nombre}"...`,
          icon: faRecycle
        };
      case 'hardDelete':
        return {
          title: 'Eliminar Categoría (Permanente)',
          message: `¡ADVERTENCIA! ¿Está seguro de eliminar PERMANENTEMENTE la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar Permanentemente',
          confirmClass: 'bg-red-600 hover:bg-red-700',
          loadingText: `Eliminando permanentemente "${categoria.nombre}"...`,
          icon: faTrash
        };
      case 'restore':
        return {
          title: 'Restaurar Categoría',
          message: `¿Desea restaurar la categoría "${categoria.nombre}"?`,
          confirmText: 'Restaurar',
          confirmClass: 'bg-green-600 hover:bg-green-700',
          loadingText: `Restaurando categoría "${categoria.nombre}"...`,
          icon: faTrashRestore
        };
      case 'toggleActivo':
        return {
          title: 'Cambiar Estado',
          message: categoria.activo
            ? `¿Desea desactivar la categoría "${categoria.nombre}"?`
            : `¿Desea activar la categoría "${categoria.nombre}"?`,
          confirmText: categoria.activo ? 'Desactivar' : 'Activar',
          confirmClass: categoria.activo
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700',
          loadingText: categoria.activo
            ? `Desactivando categoría "${categoria.nombre}"...`
            : `Activando categoría "${categoria.nombre}"...`,
          icon: categoria.activo ? faToggleOff : faToggleOn
        };
      default:
        return {
          title: 'Confirmar Acción',
          message: 'Confirme la acción a realizar.',
          confirmText: 'Confirmar',
          confirmClass: 'bg-blue-600 hover:bg-blue-700',
          loadingText: 'Procesando...',
          icon: null
        };
    }
  };

  const config = getModalConfig();

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await onConfirm(categoria.id, actionType);
      onClose();
    } catch (err) {
      console.error(`Error en acción ${actionType}:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title}>
      <div className="flex flex-col space-y-4">
        {/* Información de la categoría */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-3">
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-md text-blue-600 dark:text-blue-400">
              <FontAwesomeIcon icon={faListAlt} size="lg" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {categoria.nombre}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ID: {categoria.id}
              </div>
              {categoria.descripcion && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {categoria.descripcion.length > 50
                    ? `${categoria.descripcion.substring(0, 50)}...`
                    : categoria.descripcion}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Estado: {categoria.activo ? 'Activa' : 'Inactiva'}
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300">{config.message}</p>

        <div className="flex space-x-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-md text-white transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : config.confirmClass
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {config.loadingText}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {config.icon && <FontAwesomeIcon icon={config.icon} className="mr-2" />}
                {config.confirmText}
              </span>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

CategoriaActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categoria: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    activo: PropTypes.bool.isRequired,
  }),
  actionType: PropTypes.oneOf(['softDelete', 'hardDelete', 'restore', 'toggleActivo']).isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default CategoriaActionModal;