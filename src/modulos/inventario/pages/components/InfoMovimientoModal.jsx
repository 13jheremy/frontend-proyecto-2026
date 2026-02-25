// src/modulos/inventario/pages/components/InfoMovimientoModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, faBox, faArrowUp, faArrowDown, faCalendarAlt, 
  faUser, faComment, faIdCard, faTag, faBarcode
} from '@fortawesome/free-solid-svg-icons';

const InfoMovimientoModal = ({ isOpen, onClose, movimiento }) => {
  if (!movimiento) return null;

  // Función para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Información del Movimiento">
      <div className="space-y-6">
        {/* Información del Producto */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faBox} className="mr-2 text-blue-500" />
            Información del Producto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faIdCard} className="mr-1" />
                ID Inventario
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                #{movimiento.inventario || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faTag} className="mr-1" />
                Nombre del Producto
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {movimiento.producto_nombre || movimiento.inventario_producto_nombre || 'N/A'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faBarcode} className="mr-1" />
                Código del Producto
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {movimiento.producto_codigo || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                ID Usuario
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                #{movimiento.usuario || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                Usuario
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {movimiento.usuario_nombre || 'Sistema'}
              </p>
            </div>
          </div>
        </div>

        {/* Detalles del Movimiento */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-indigo-500" />
            Detalles del Movimiento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Tipo de Movimiento
              </label>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                movimiento.tipo === 'entrada'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : movimiento.tipo === 'salida'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                <FontAwesomeIcon 
                  icon={movimiento.tipo === 'entrada' ? faArrowUp : movimiento.tipo === 'salida' ? faArrowDown : faInfoCircle} 
                  className="mr-2" 
                />
                {movimiento.tipo?.charAt(0).toUpperCase() + movimiento.tipo?.slice(1) || 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Cantidad
              </label>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {movimiento.cantidad}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faIdCard} className="mr-1" />
                ID del Movimiento
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                #{movimiento.id}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                Fecha de Registro
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatFecha(movimiento.fecha_registro)}
              </p>
            </div>
          </div>
        </div>

        {/* Motivo del Movimiento */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faComment} className="mr-2 text-purple-500" />
            Motivo del Movimiento
          </h3>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {movimiento.motivo || 'Sin motivo especificado'}
            </p>
          </div>
        </div>

        {/* Información de Fechas */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-500" />
            Información de Fechas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                Fecha de Registro
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatFecha(movimiento.fecha_registro)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                Última Actualización
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatFecha(movimiento.fecha_actualizacion)}
              </p>
            </div>
          </div>
        </div>

        {/* Impacto en el Stock */}
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
            Impacto en el Stock
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Este movimiento de <strong>{movimiento.tipo}</strong> de <strong>{movimiento.cantidad} unidades</strong> 
            {movimiento.tipo === 'entrada' 
              ? ' incrementó el stock del producto.' 
              : ' redujo el stock del producto.'
            }
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
            El stock se actualiza automáticamente cuando se registra un movimiento.
          </p>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

InfoMovimientoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  movimiento: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    inventario: PropTypes.shape({
      producto: PropTypes.shape({
        nombre: PropTypes.string,
        codigo: PropTypes.string,
        categoria: PropTypes.shape({
          nombre: PropTypes.string
        })
      }),
      stock_actual: PropTypes.number,
    }),
    tipo: PropTypes.string,
    cantidad: PropTypes.number,
    motivo: PropTypes.string,
    fecha: PropTypes.string,
    usuario: PropTypes.shape({
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      email: PropTypes.string,
      rol: PropTypes.string,
    }),
  }),
};

export default InfoMovimientoModal;
