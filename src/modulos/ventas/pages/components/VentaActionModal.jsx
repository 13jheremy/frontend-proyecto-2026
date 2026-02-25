// src/modulos/ventas/pages/components/VentaActionModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faRecycle, 
  faTrashRestore, 
  faToggleOff, 
  faToggleOn,
  faExclamationTriangle,
  faFileInvoiceDollar,
  faDollarSign,
  faUser,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const VentaActionModal = ({ 
  isOpen, 
  onClose, 
  venta, 
  actionType, 
  onConfirm 
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !venta || !actionType) return null;

  const formatearPrecio = (precio) => {
    return `Bs. ${parseFloat(precio).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getModalConfig = () => {
    switch(actionType) {
      case 'softDelete':
        return {
          title: 'Eliminar Venta (Temporal)',
          message: `¿Está seguro de eliminar temporalmente la venta #${venta.id} por ${formatearPrecio(venta.total)}? Podrá restaurarla después.`,
          confirmText: 'Eliminar Temporalmente',
          confirmClass: 'bg-orange-600 hover:bg-orange-700',
          loadingText: 'Eliminando temporalmente la venta...',
          icon: faRecycle,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20'
        };
      case 'hardDelete':
        return {
          title: 'Eliminar Venta (Permanente)',
          message: `¡ADVERTENCIA! ¿Está seguro de eliminar PERMANENTEMENTE la venta #${venta.id} por ${formatearPrecio(venta.total)}? Esta acción no se puede deshacer y eliminará todos los datos asociados.`,
          confirmText: 'Eliminar Permanentemente',
          confirmClass: 'bg-red-600 hover:bg-red-700',
          loadingText: 'Eliminando permanentemente la venta...',
          icon: faTrash,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        };
      case 'restore':
        return {
          title: 'Restaurar Venta',
          message: `¿Desea restaurar la venta #${venta.id} por ${formatearPrecio(venta.total)}?`,
          confirmText: 'Restaurar',
          confirmClass: 'bg-green-600 hover:bg-green-700',
          loadingText: 'Restaurando venta...',
          icon: faTrashRestore,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'toggleActivo':
        return {
          title: 'Cambiar Estado',
          message: venta.activo 
            ? `¿Desea desactivar la venta #${venta.id}?`
            : `¿Desea activar la venta #${venta.id}?`,
          confirmText: venta.activo ? 'Desactivar' : 'Activar',
          confirmClass: venta.activo 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-green-600 hover:bg-green-700',
          loadingText: venta.activo 
            ? 'Desactivando venta...' 
            : 'Activando venta...',
          icon: venta.activo ? faToggleOff : faToggleOn,
          iconColor: venta.activo ? 'text-red-500' : 'text-green-500',
          bgColor: venta.activo 
            ? 'bg-red-50 dark:bg-red-900/20' 
            : 'bg-green-50 dark:bg-green-900/20'
        };
      default:
        return {
          title: 'Confirmar Acción',
          message: 'Confirme la acción a realizar.',
          confirmText: 'Confirmar',
          confirmClass: 'bg-blue-600 hover:bg-blue-700',
          loadingText: 'Procesando...',
          icon: faFileInvoiceDollar,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
    }
  };

  const config = getModalConfig();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(venta.id, actionType);
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
        {/* Información de la venta */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="h-5 w-5" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Venta #{venta.id}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatearPrecio(venta.total)}
              </p>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3" />
                  <span>{venta.cliente?.nombre || 'Sin cliente'}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 h-3 w-3" />
                  <span>{formatearFecha(venta.fecha_venta || new Date())}</span>
                </div>
              </div>
            </div>
          </div>

          {venta.estado && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                venta.estado === 'completada' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : venta.estado === 'pendiente'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {venta.estado.toUpperCase()}
              </span>
            </div>
          )}

          {venta.eliminado && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
                ELIMINADA
              </span>
            </div>
          )}
        </div>

        {/* Mensaje de confirmación */}
        <div className="text-gray-700 dark:text-gray-300">
          <p>{config.message}</p>
        </div>

        {/* Advertencia para eliminación permanente */}
        {actionType === 'hardDelete' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a esta venta de forma permanente.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white ${config.confirmClass} border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {config.loadingText}
            </>
          ) : (
            config.confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};

VentaActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  venta: PropTypes.shape({
    id: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    cliente: PropTypes.shape({
      nombre: PropTypes.string
    }),
    fecha_venta: PropTypes.string,
    estado: PropTypes.string,
    eliminado: PropTypes.bool
  }),
  actionType: PropTypes.oneOf(['softDelete', 'hardDelete', 'restore', 'toggleActivo']).isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default VentaActionModal;
