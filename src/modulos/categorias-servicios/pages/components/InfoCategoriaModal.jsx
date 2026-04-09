// src/modulos/categorias/pages/components/InfoCategoriaServicioModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTools, faCheckCircle, faTimesCircle, faCalendarAlt, faDollarSign, faClock, faUser, faUserEdit, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { formatPrecioServicio } from '../../utils/servicioUtils';

const InfoCategoriaServicioModal = ({ isOpen, onClose, servicio, categoriasDisponibles }) => {
  if (!isOpen || !servicio) return null;

  // Handle different field names between API responses
  const getNombre = () => servicio.nombre_servicio || servicio.nombre || 'Sin nombre';
  const getDescripcion = () => servicio.descripcion_servicio || servicio.descripcion || '';
  const getPrecio = () => servicio.precio || 0;
  const getDuracion = () => servicio.duracion_estimada_minutos || servicio.duracion_estimada || 0;
  const getCategoriaId = () => servicio.categoria_id || servicio.categoria;
  const getFechaCreacion = () => servicio.fecha_creacion || servicio.fecha_registro;
  const getFechaActualizacion = () => servicio.fecha_actualizacion || servicio.fecha_actualizacion;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getCategoriaNombre = (categorias, categoriaId) => {
    if (!categorias || !categoriaId) return 'N/A';
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : 'N/A';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Servicio: ${getNombre()}`}>
      <div className="flex flex-col space-y-4 text-gray-700 dark:text-gray-300">
        {/* Sección de nombre e ícono */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
          <div className="w-24 h-24 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-400">
            <FontAwesomeIcon icon={faTools} size="2x" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getNombre()}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {servicio.id}
            </p>
          </div>
        </div>

        {/* Detalles principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faTools} className="mr-2" />Categoría:</p>
            <p className="ml-6">{getCategoriaNombre(categoriasDisponibles, getCategoriaId())}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faDollarSign} className="mr-2" />Precio:</p>
            <p className="ml-6">{formatPrecioServicio(getPrecio())}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faClock} className="mr-2" />Duración Estimada:</p>
            <p className="ml-6">{getDuracion()} minutos</p>
          </div>
        </div>

        {/* Descripción del servicio */}
        {getDescripcion() && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faInfoCircle} className="mr-2" />Descripción del Servicio:</p>
            <p className="ml-6 whitespace-pre-wrap">{getDescripcion()}</p>
          </div>
        )}

        {/* Estados y Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {servicio.activo ? <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" /> : <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" />}
              Estado:
            </p>
            <p className="ml-6">{servicio.activo ? 'Activo' : 'Inactivo'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {servicio.eliminado ? <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" /> : <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />}
              Eliminado:
            </p>
            <p className="ml-6">{servicio.eliminado ? 'Sí' : 'No'}</p>
          </div>
          {getFechaCreacion() && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />Creado el:</p>
              <p className="ml-6">{formatDate(getFechaCreacion())}</p>
            </div>
          )}
          {getFechaActualizacion() && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />Última Actualización:</p>
              <p className="ml-6">{formatDate(getFechaActualizacion())}</p>
            </div>
          )}
        </div>

        {/* Trazabilidad - Información de auditoría */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
            Trazabilidad
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Creado por */}
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold flex items-center text-green-700 dark:text-green-400 text-sm">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Creado por:
              </p>
              <p className="ml-6 text-gray-900 dark:text-gray-100">
                {servicio.creado_por_nombre || 'No disponible'}
              </p>
              {servicio.fecha_creacion && (
                <p className="ml-6 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                  {formatDate(getFechaCreacion())}
                </p>
              )}
            </div>

            {/* Actualizado por */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
              <p className="font-semibold flex items-center text-blue-700 dark:text-blue-400 text-sm">
                <FontAwesomeIcon icon={faUserEdit} className="mr-2" />
                Actualizado por:
              </p>
              <p className="ml-6 text-gray-900 dark:text-gray-100">
                {servicio.actualizado_por_nombre || 'No disponible'}
              </p>
              {servicio.fecha_actualizacion && (
                <p className="ml-6 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                  {formatDate(getFechaActualizacion())}
                </p>
              )}
            </div>

            {/* Eliminado por - solo mostrar si el servicio está eliminado */}
            {servicio.eliminado && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-500 md:col-span-2">
                <p className="font-semibold flex items-center text-red-700 dark:text-red-400 text-sm">
                  <FontAwesomeIcon icon={faUserSlash} className="mr-2" />
                  Eliminado por:
                </p>
                <p className="ml-6 text-gray-900 dark:text-gray-100">
                  {servicio.eliminado_por_nombre || 'No disponible'}
                </p>
                {servicio.fecha_eliminacion && (
                  <p className="ml-6 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                    {formatDate(servicio.fecha_eliminacion)}
                  </p>
                )}
              </div>
            )}
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

InfoCategoriaServicioModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  servicio: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre_servicio: PropTypes.string,
    nombre: PropTypes.string,
    descripcion_servicio: PropTypes.string,
    descripcion: PropTypes.string,
    categoria_id: PropTypes.number,
    categoria: PropTypes.number,
    precio: PropTypes.number,
    duracion_estimada_minutos: PropTypes.number,
    duracion_estimada: PropTypes.number,
    activo: PropTypes.bool,
    eliminado: PropTypes.bool,
    fecha_creacion: PropTypes.string,
    fecha_actualizacion: PropTypes.string,
    fecha_registro: PropTypes.string,
  }),
  categoriasDisponibles: PropTypes.array,
};

InfoCategoriaServicioModal.defaultProps = {
  servicio: null,
  categoriasDisponibles: [],
};

export default InfoCategoriaServicioModal;