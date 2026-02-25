// src/modulos/inventario/pages/components/MovimientoDeleteModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faRecycle, 
  faTrashRestore, 
  faArchive,
  faBox,
  faArrowUp, 
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';

const MovimientoDeleteModal = ({ isOpen, onClose, movimiento, onConfirm, isRestore = false }) => {
  const [loading, setLoading] = useState(false);

  if (!movimiento) return null;

  const getModalConfig = () => {
    const productoNombre = movimiento.producto_nombre || movimiento.inventario?.producto?.nombre || 'Producto sin nombre';
    const tipoMovimiento = movimiento.tipo === 'entrada' ? 'Entrada' : movimiento.tipo === 'salida' ? 'Salida' : 'Ajuste';
    
    if (isRestore) {
      return {
        title: 'Restaurar Movimiento',
        message: `¿Desea restaurar el movimiento de ${tipoMovimiento.toLowerCase()} del producto "${productoNombre}" por cantidad ${movimiento.cantidad}?`,
        confirmText: 'Restaurar',
        confirmClass: 'bg-green-600 hover:bg-green-700',
        loadingText: 'Restaurando movimiento...',
        icon: faTrashRestore
      };
    } else {
      return {
        title: 'Eliminar Movimiento (Temporal)',
        message: `¿Está seguro de eliminar temporalmente el movimiento de ${tipoMovimiento.toLowerCase()} del producto "${productoNombre}" por cantidad ${movimiento.cantidad}? Podrá restaurarlo después.`,
        confirmText: 'Eliminar Temporalmente',
        confirmClass: 'bg-orange-600 hover:bg-orange-700',
        loadingText: 'Eliminando temporalmente...',
        icon: faArchive
      };
    }
  };

  const config = getModalConfig();

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(`Error en acción ${isRestore ? 'restore' : 'softDelete'}:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title}>
      <div className="flex flex-col space-y-4">
        {/* Información del movimiento */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                <FontAwesomeIcon icon={faBox} />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {movimiento.producto_nombre || movimiento.inventario?.producto?.nombre || 'Producto sin nombre'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Código: {movimiento.inventario?.producto?.codigo || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ID Movimiento: {movimiento.id}
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                  movimiento.tipo === 'entrada'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : movimiento.tipo === 'salida'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  <FontAwesomeIcon 
                    icon={movimiento.tipo === 'entrada' ? faArrowUp : movimiento.tipo === 'salida' ? faArrowDown : faRecycle} 
                    className="mr-1" 
                  />
                  {movimiento.tipo === 'entrada' ? 'Entrada' : movimiento.tipo === 'salida' ? 'Salida' : 'Ajuste'}
                </div>
                Cantidad: {movimiento.cantidad}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Usuario: {movimiento.usuario_nombre || movimiento.usuario?.first_name + ' ' + movimiento.usuario?.last_name || 'N/A'}
              </div>
              {movimiento.motivo && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Motivo: {movimiento.motivo}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300">{config.message}</p>

        {/* Información adicional para restauración */}
        {isRestore && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
            <div className="flex">
              <FontAwesomeIcon icon={faTrashRestore} className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Restaurar movimiento
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  El movimiento volverá a estar visible en el sistema y afectará los reportes de inventario.
                </p>
              </div>
            </div>
          </div>
        )}

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

MovimientoDeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  movimiento: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    producto_nombre: PropTypes.string,
    inventario: PropTypes.shape({
      producto: PropTypes.shape({
        nombre: PropTypes.string,
        codigo: PropTypes.string,
      })
    }),
    tipo: PropTypes.string,
    cantidad: PropTypes.number,
    motivo: PropTypes.string,
    fecha: PropTypes.string,
    usuario_nombre: PropTypes.string,
    usuario: PropTypes.shape({
      first_name: PropTypes.string,
      last_name: PropTypes.string,
    }),
  }),
  onConfirm: PropTypes.func.isRequired,
  isRestore: PropTypes.bool,
};

export default MovimientoDeleteModal;
