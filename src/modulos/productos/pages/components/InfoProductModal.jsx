// src/modules/productos/components/InfoProductModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal'; // Ajusta la ruta si es necesario
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faBox, faTag, faDollarSign, faWarehouse, faCheckCircle, faTimesCircle, faStar, faBuilding, faBarcode, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const InfoProductModal = ({ isOpen, onClose, producto }) => {
  if (!isOpen || !producto) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Producto: ${producto.nombre}`}>
      <div className="flex flex-col space-y-4 text-gray-700 dark:text-gray-300">
        {/* Sección de imagen y nombre */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faBox} size="2x" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{producto.nombre}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faBarcode} className="mr-1" />
              Código: {producto.codigo}
            </p>
          </div>
        </div>

        {/* Detalles principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faTag} className="mr-2" />Categoría:</p>
            <p className="ml-6">{producto.categoria_nombre || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faBuilding} className="mr-2" />Proveedor:</p>
            <p className="ml-6">{producto.proveedor_nombre || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faDollarSign} className="mr-2" />Precio de Compra:</p>
            <p className="ml-6">{formatPrice(producto.precio_compra)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faDollarSign} className="mr-2" />Precio de Venta:</p>
            <p className="ml-6">{formatPrice(producto.precio_venta)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faWarehouse} className="mr-2" />Stock Actual:</p>
            <p className="ml-6">{producto.stock_actual}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faWarehouse} className="mr-2" />Stock Mínimo:</p>
            <p className="ml-6">{producto.stock_minimo}</p>
          </div>
        </div>

        {/* Descripción */}
        {producto.descripcion && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faInfoCircle} className="mr-2" />Descripción:</p>
            <p className="ml-6 whitespace-pre-wrap">{producto.descripcion}</p>
          </div>
        )}

        {/* Estados y Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {producto.activo ? <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" /> : <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" />}
              Estado:
            </p>
            <p className="ml-6">{producto.activo ? 'Activo' : 'Inactivo'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {producto.destacado ? <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-500" /> : <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-gray-500" />}
              Destacado:
            </p>
            <p className="ml-6">{producto.destacado ? 'Sí' : 'No'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {producto.eliminado ? <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" /> : <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />}
              Eliminado:
            </p>
            <p className="ml-6">{producto.eliminado ? 'Sí' : 'No'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />Creado el:</p>
            <p className="ml-6">{formatDate(producto.fecha_creacion)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />Última Actualización:</p>
            <p className="ml-6">{formatDate(producto.fecha_actualizacion)}</p>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

InfoProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  producto: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    codigo: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    categoria: PropTypes.number,
    categoria_nombre: PropTypes.string,
    proveedor: PropTypes.number,
    proveedor_nombre: PropTypes.string,
    precio_compra: PropTypes.number,
    precio_venta: PropTypes.number,
    stock_minimo: PropTypes.number,
    stock_actual: PropTypes.number,
    imagen: PropTypes.string,
    imagen_url: PropTypes.string,
    destacado: PropTypes.bool,
    activo: PropTypes.bool,
    eliminado: PropTypes.bool,
    fecha_creacion: PropTypes.string,
    fecha_actualizacion: PropTypes.string,
  }),
};

InfoProductModal.defaultProps = {
  producto: null,
};

export default InfoProductModal;
