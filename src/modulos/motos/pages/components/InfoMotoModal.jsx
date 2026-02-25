// src/modules/motos/components/InfoMotoModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faMotorcycle, 
  faIdCard, 
  faUser, 
  faCalendarAlt, 
  faCheckCircle, 
  faTimesCircle, 
  faCogs,
  faTachometerAlt,
  faPalette,
  faHashtag,
  faUserCog
} from '@fortawesome/free-solid-svg-icons';

const InfoMotoModal = ({ isOpen, onClose, moto = null }) => {
  if (!isOpen || !moto) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const formatNumber = (number) => {
    if (number === null || number === undefined) return 'N/A';
    return number.toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles de la Moto: ${moto.marca} ${moto.modelo}`}>
      <div className="flex flex-col space-y-4 text-gray-700 dark:text-gray-300">
        
        {/* Sección de información principal */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
              <FontAwesomeIcon icon={faMotorcycle} size="2x" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {moto.marca} {moto.modelo}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faHashtag} className="mr-1" />
              Placa: {moto.placa}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
              Año: {moto.año}
            </p>
          </div>
        </div>

        {/* Detalles técnicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Cilindrada */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faCogs} className="mr-2 text-orange-500" />
              Cilindrada:
            </p>
            <p className="ml-6 text-lg font-mono">{moto.cilindrada}cc</p>
          </div>

          {/* Kilometraje */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faTachometerAlt} className="mr-2 text-purple-500" />
              Kilometraje:
            </p>
            <p className="ml-6 text-lg font-mono">{formatNumber(moto.kilometraje)} km</p>
          </div>

          {/* Color */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faPalette} className="mr-2 text-red-500" />
              Color:
            </p>
            <p className="ml-6">{moto.color}</p>
          </div>

          {/* Propietario */}
          {moto.propietario_nombre && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-green-500" />
                Propietario:
              </p>
              <p className="ml-6">{moto.propietario_nombre}</p>
            </div>
          )}
        </div>

        {/* Números de identificación */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <FontAwesomeIcon icon={faIdCard} className="mr-2 text-blue-500" />
            Números de Identificación
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Número de Chasis:</span>
              <p className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                {moto.numero_chasis}
              </p>
            </div>
            <div>
              <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Número de Motor:</span>
              <p className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                {moto.numero_motor}
              </p>
            </div>
          </div>
        </div>

        {/* Estados y metadatos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Estado */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {moto.activo ? 
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" /> : 
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" />
              }
              Estado:
            </p>
            <p className="ml-6">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                moto.activo
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {moto.activo ? 'Activa' : 'Inactiva'}
              </span>
            </p>
          </div>
          
          {/* Estado de eliminación */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {moto.eliminado ? 
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" /> : 
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />
              }
              Eliminado:
            </p>
            <p className="ml-6">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                moto.eliminado
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {moto.eliminado ? 'Sí' : 'No'}
              </span>
            </p>
          </div>

          {/* Registrado por */}
          {moto.registrado_por_nombre && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faUserCog} className="mr-2 text-indigo-500" />
                Registrado por:
              </p>
              <p className="ml-6">{moto.registrado_por_nombre}</p>
            </div>
          )}
          
          {/* Fecha de registro */}
          {moto.fecha_registro && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Fecha de Registro:
              </p>
              <p className="ml-6 text-sm">{formatDate(moto.fecha_registro)}</p>
            </div>
          )}
          
          {/* Última actualización */}
          {moto.fecha_actualizacion && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg md:col-span-2">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Última Actualización:
              </p>
              <p className="ml-6 text-sm">{formatDate(moto.fecha_actualizacion)}</p>
            </div>
          )}
        </div>

        {/* Información adicional si está disponible */}
        {(moto.observaciones || moto.historial_count) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Información Adicional
            </h4>
            {moto.observaciones && (
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                <strong>Observaciones:</strong> {moto.observaciones}
              </p>
            )}
            {moto.historial_count !== undefined && (
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Mantenimientos registrados:</strong> {moto.historial_count || 0}
              </p>
            )}
          </div>
        )}

        {/* Botón cerrar */}
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

InfoMotoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  moto: PropTypes.shape({
    id: PropTypes.number.isRequired,
    marca: PropTypes.string.isRequired,
    modelo: PropTypes.string.isRequired,
    año: PropTypes.number.isRequired,
    placa: PropTypes.string.isRequired,
    numero_chasis: PropTypes.string.isRequired,
    numero_motor: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    cilindrada: PropTypes.number.isRequired,
    kilometraje: PropTypes.number,
    activo: PropTypes.bool.isRequired,
    eliminado: PropTypes.bool,
    propietario_nombre: PropTypes.string,
    registrado_por_nombre: PropTypes.string,
    fecha_registro: PropTypes.string,
    fecha_actualizacion: PropTypes.string,
    observaciones: PropTypes.string,
    historial_count: PropTypes.number,
  }),
};

export default InfoMotoModal;