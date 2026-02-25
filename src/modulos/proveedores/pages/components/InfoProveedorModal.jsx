// src/modules/proveedores/components/InfoProveedorModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faBuilding, 
  faIdCard, 
  faUser, 
  faPhone, 
  faEnvelope, 
  faMapMarkerAlt, 
  faCheckCircle, 
  faTimesCircle, 
  faCalendarAlt,
  faBoxes
} from '@fortawesome/free-solid-svg-icons';

const InfoProveedorModal = ({ isOpen, onClose, proveedor = null }) => {
  if (!isOpen || !proveedor) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Proveedor: ${proveedor.nombre}`}>
      <div className="flex flex-col space-y-4 text-gray-700 dark:text-gray-300">
        {/* Sección de nombre e identificación */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
              <FontAwesomeIcon icon={faBuilding} size="2x" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{proveedor.nombre}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faIdCard} className="mr-1" />
              NIT: {proveedor.nit}
            </p>
            {proveedor.productos_count !== undefined && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <FontAwesomeIcon icon={faBoxes} className="mr-1" />
                {proveedor.productos_count} producto{proveedor.productos_count !== 1 ? 's' : ''} asociado{proveedor.productos_count !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Detalles principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contacto Principal */}
          {proveedor.contacto_principal && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-green-500" />
                Contacto Principal:
              </p>
              <p className="ml-6">{proveedor.contacto_principal}</p>
            </div>
          )}

          {/* Teléfono */}
          {proveedor.telefono && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faPhone} className="mr-2 text-orange-500" />
                Teléfono:
              </p>
              <p className="ml-6">{proveedor.telefono}</p>
            </div>
          )}

          {/* Correo */}
          {proveedor.correo && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-purple-500" />
                Correo Electrónico:
              </p>
              <p className="ml-6">{proveedor.correo}</p>
            </div>
          )}
        </div>

        {/* Dirección */}
        {proveedor.direccion && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-red-500" />
              Dirección:
            </p>
            <p className="ml-6 whitespace-pre-wrap">{proveedor.direccion}</p>
          </div>
        )}

        {/* Estados y Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {proveedor.activo ? <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" /> : <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" />}
              Estado:
            </p>
            <p className="ml-6">{proveedor.activo ? 'Activo' : 'Inactivo'}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {proveedor.eliminado ? <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" /> : <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />}
              Eliminado:
            </p>
            <p className="ml-6">{proveedor.eliminado ? 'Sí' : 'No'}</p>
          </div>
          
          {proveedor.fecha_creacion && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Creado el:
              </p>
              <p className="ml-6">{formatDate(proveedor.fecha_creacion)}</p>
            </div>
          )}
          
          {proveedor.fecha_actualizacion && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Última Actualización:
              </p>
              <p className="ml-6">{formatDate(proveedor.fecha_actualizacion)}</p>
            </div>
          )}
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

InfoProveedorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  proveedor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    nit: PropTypes.string.isRequired,
    contacto_principal: PropTypes.string,
    telefono: PropTypes.string,
    correo: PropTypes.string,
    direccion: PropTypes.string,
    activo: PropTypes.bool,
    eliminado: PropTypes.bool,
    productos_count: PropTypes.number,
    fecha_creacion: PropTypes.string,
    fecha_actualizacion: PropTypes.string,
  }),
};


export default InfoProveedorModal;