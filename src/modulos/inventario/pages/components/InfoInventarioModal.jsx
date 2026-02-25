// src/modulos/inventario/pages/components/InfoInventarioModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, faBox, faBoxes, faWarning, faCheckCircle, faBan,
  faCalendarAlt, faUser, faIdCard, faTag, faBarcode
} from '@fortawesome/free-solid-svg-icons';

const InfoInventarioModal = ({ isOpen, onClose, inventario }) => {
  if (!inventario) return null;

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

  // Función para determinar el estado del stock
  const getStockStatus = () => {
    if (inventario.stock_actual === 0) {
      return {
        text: 'Sin Stock',
        icon: faBan,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900'
      };
    } else if (inventario.stock_actual <= inventario.stock_minimo) {
      return {
        text: 'Stock Bajo',
        icon: faWarning,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900'
      };
    } else {
      return {
        text: 'Stock Normal',
        icon: faCheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900'
      };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Información del Inventario">
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
                <FontAwesomeIcon icon={faTag} className="mr-1" />
                Nombre
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {inventario.producto_nombre || inventario.producto?.nombre || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                <FontAwesomeIcon icon={faBarcode} className="mr-1" />
                Código
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {inventario.producto_codigo || inventario.producto?.codigo || 'N/A'}
              </p>
            </div>

            {(inventario.producto?.categoria || inventario.categoria_nombre) && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <FontAwesomeIcon icon={faTag} className="mr-1" />
                  Categoría
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {inventario.producto?.categoria?.nombre || inventario.categoria_nombre || 'N/A'}
                </p>
              </div>
            )}

            {(inventario.producto?.descripcion || inventario.producto_descripcion) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Descripción
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {inventario.producto?.descripcion || inventario.producto_descripcion}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Información del Stock */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faBoxes} className="mr-2 text-green-500" />
            Información del Stock
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Stock Actual
              </label>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {inventario.stock_actual}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Stock Mínimo
              </label>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {inventario.stock_minimo}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Estado del Stock
              </label>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                <FontAwesomeIcon icon={stockStatus.icon} className="mr-2" />
                {stockStatus.text}
              </div>
            </div>
          </div>

          {/* Alerta de stock bajo */}
          {inventario.stock_actual <= inventario.stock_minimo && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex">
                <FontAwesomeIcon icon={faWarning} className="text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Advertencia:</strong> El stock actual está por debajo o igual al stock mínimo requerido.
                  Se recomienda reabastecer este producto.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Estado del Registro */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-indigo-500" />
            Estado del Registro
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Estado
              </label>
              <div className="flex items-center">
                {inventario.eliminado ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <FontAwesomeIcon icon={faBan} className="mr-1" />
                    Eliminado
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    inventario.activo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    <FontAwesomeIcon 
                      icon={inventario.activo ? faCheckCircle : faBan} 
                      className="mr-1" 
                    />
                    {inventario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                ID del Registro
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                #{inventario.id}
              </p>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-500" />
            Fechas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Fecha de Registro
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatFecha(inventario.fecha_registro)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Última Actualización
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatFecha(inventario.fecha_actualizacion)}
              </p>
            </div>
          </div>
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

InfoInventarioModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  inventario: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    producto: PropTypes.shape({
      nombre: PropTypes.string,
      codigo: PropTypes.string,
      descripcion: PropTypes.string,
      categoria: PropTypes.shape({
        nombre: PropTypes.string
      })
    }),
    stock_actual: PropTypes.number,
    stock_minimo: PropTypes.number,
    activo: PropTypes.bool,
    eliminado: PropTypes.bool,
    fecha_registro: PropTypes.string,
    fecha_actualizacion: PropTypes.string,
  }),
};

export default InfoInventarioModal;
