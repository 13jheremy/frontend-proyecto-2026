// src/modules/productos/components/ProductActionModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faRecycle, faTrashRestore, faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';

const ProductActionModal = ({ isOpen, onClose, producto, actionType, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!producto || !actionType) return null;

  const getModalConfig = () => {
    switch(actionType) {
      case 'softDelete':
        return {
          title: 'Eliminar Producto (Temporal)',
          message: `¿Está seguro de eliminar temporalmente el producto "${producto.nombre}"? Podrá restaurarlo después.`,
          confirmText: 'Eliminar Temporalmente',
          confirmClass: 'bg-orange-600 hover:bg-orange-700',
          loadingText: `Eliminando temporalmente "${producto.nombre}"...`,
          icon: faRecycle
        };
      case 'hardDelete':
        return {
          title: 'Eliminar Producto (Permanente)',
          message: `¡ADVERTENCIA! ¿Está seguro de eliminar PERMANENTEMENTE el producto "${producto.nombre}"? Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar Permanentemente',
          confirmClass: 'bg-red-600 hover:bg-red-700',
          loadingText: `Eliminando permanentemente "${producto.nombre}"...`,
          icon: faTrash
        };
      case 'restore':
        return {
          title: 'Restaurar Producto',
          message: `¿Desea restaurar el producto "${producto.nombre}"?`,
          confirmText: 'Restaurar',
          confirmClass: 'bg-green-600 hover:bg-green-700',
          loadingText: `Restaurando producto "${producto.nombre}"...`,
          icon: faTrashRestore
        };
      case 'toggleActivo':
        return {
          title: 'Cambiar Estado',
          message: producto.activo 
            ? `¿Desea desactivar el producto "${producto.nombre}"?`
            : `¿Desea activar el producto "${producto.nombre}"?`,
          confirmText: producto.activo ? 'Desactivar' : 'Activar',
          confirmClass: producto.activo
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700',
          loadingText: producto.activo
            ? `Desactivando producto "${producto.nombre}"...`
            : `Activando producto "${producto.nombre}"...`,
          icon: producto.activo ? faToggleOff : faToggleOn
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
      await onConfirm(producto.id, actionType);
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
        {/* Información del producto */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-3">
          <div className="flex items-start space-x-3">
            {producto.imagen_url && (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-16 h-16 object-cover rounded-md"
              />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {producto.nombre}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Código: {producto.codigo}
              </div>
              {producto.categoria_nombre && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Categoría: {producto.categoria_nombre}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Stock: {producto.stock_actual} / Precio: Bs {producto.precio_venta}
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

ProductActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  producto: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    codigo: PropTypes.string.isRequired,
    activo: PropTypes.bool.isRequired,
    imagen_url: PropTypes.string,
    categoria_nombre: PropTypes.string,
    stock_actual: PropTypes.number,
    precio_venta: PropTypes.number,
  }),
  actionType: PropTypes.oneOf(['softDelete', 'hardDelete', 'restore', 'toggleActivo']).isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ProductActionModal;