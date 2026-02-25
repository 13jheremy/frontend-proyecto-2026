// src/modulos/categorias/pages/components/InfoCategoriaModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faListAlt, faCheckCircle, faTimesCircle, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const InfoCategoriaModal = ({ isOpen, onClose, categoria }) => {
  if (!isOpen || !categoria) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles de la Categoría: ${categoria.nombre}`}>
      <div className="flex flex-col space-y-4 text-gray-700 dark:text-gray-300">
        {/* Sección de nombre e ícono */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
          <div className="w-24 h-24 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
            <FontAwesomeIcon icon={faListAlt} size="2x" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{categoria.nombre}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {categoria.id}
            </p>
          </div>
        </div>

        {/* Descripción */}
        {categoria.descripcion && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faInfoCircle} className="mr-2" />Descripción:</p>
            <p className="ml-6 whitespace-pre-wrap">{categoria.descripcion}</p>
          </div>
        )}

        {/* Estados y Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {categoria.activo ? <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" /> : <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" />}
              Estado:
            </p>
            <p className="ml-6">{categoria.activo ? 'Activa' : 'Inactiva'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {categoria.eliminado ? <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" /> : <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />}
              Eliminada:
            </p>
            <p className="ml-6">{categoria.eliminado ? 'Sí' : 'No'}</p>
          </div>
          {categoria.fecha_creacion && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />Creada el:</p>
              <p className="ml-6">{formatDate(categoria.fecha_creacion)}</p>
            </div>
          )}
          {categoria.fecha_actualizacion && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />Última Actualización:</p>
              <p className="ml-6">{formatDate(categoria.fecha_actualizacion)}</p>
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

InfoCategoriaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categoria: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    activo: PropTypes.bool,
    eliminado: PropTypes.bool,
    fecha_creacion: PropTypes.string,
    fecha_actualizacion: PropTypes.string,
  }),
};

InfoCategoriaModal.defaultProps = {
  categoria: null,
};

export default InfoCategoriaModal;