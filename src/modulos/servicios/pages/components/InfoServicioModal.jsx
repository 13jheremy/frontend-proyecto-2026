// src/modules/servicios/components/InfoServicioModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faCog, 
  faTag, 
  faDollarSign, 
  faClock, 
  faCheckCircle, 
  faTimesCircle, 
  faCalendarAlt,
  faFileText
} from '@fortawesome/free-solid-svg-icons';

const InfoServicioModal = ({ isOpen, onClose, servicio }) => {
  if (!isOpen || !servicio) return null;

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

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'min' : ''}`.trim();
    }
    return `${minutes} min`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Servicio: ${servicio.nombre}`}>
      <div className="flex flex-col space-y-4 text-gray-700 dark:text-gray-300">
        {/* Sección de nombre y servicio principal */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
          <div className="w-16 h-16 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
            <FontAwesomeIcon icon={faCog} size="2x" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{servicio.nombre}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faTag} className="mr-1" />
              Código: #{servicio.id}
            </p>
          </div>
        </div>

        {/* Detalles principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faTag} className="mr-2" />
              Categoría:
            </p>
            <p className="ml-6">{servicio.categoria_servicio_nombre || 'N/A'}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
              Precio:
            </p>
            <p className="ml-6">{formatPrice(servicio.precio)}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-2" />
              Duración Estimada:
            </p>
            <p className="ml-6">{formatDuration(servicio.duracion_estimada)}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {servicio.activo ? 
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" /> : 
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" />
              }
              Estado:
            </p>
            <p className="ml-6">{servicio.activo ? 'Activo' : 'Inactivo'}</p>
          </div>
        </div>

        {/* Descripción */}
        {servicio.descripcion && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faFileText} className="mr-2" />
              Descripción:
            </p>
            <p className="ml-6 whitespace-pre-wrap">{servicio.descripcion}</p>
          </div>
        )}

        {/* Estados y Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {servicio.eliminado ? 
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" /> : 
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />
              }
              Estado del Sistema:
            </p>
            <p className="ml-6">{servicio.eliminado ? 'Eliminado' : 'Disponible'}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              Fecha de Registro:
            </p>
            <p className="ml-6">{formatDate(servicio.fecha_registro)}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              Última Actualización:
            </p>
            <p className="ml-6">{formatDate(servicio.fecha_actualizacion)}</p>
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

InfoServicioModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  servicio: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    categoria_servicio: PropTypes.number,
    categoria_servicio_nombre: PropTypes.string,
    precio: PropTypes.number,
    duracion_estimada: PropTypes.number,
    activo: PropTypes.bool,
    eliminado: PropTypes.bool,
    fecha_registro: PropTypes.string,
    fecha_actualizacion: PropTypes.string,
  }),
};

InfoServicioModal.defaultProps = {
  servicio: null,
};

export default InfoServicioModal;