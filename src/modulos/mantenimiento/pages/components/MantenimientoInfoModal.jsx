// src/modulos/mantenimiento/pages/components/MantenimientoInfoModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal'; // Ajusta la ruta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCalendarAlt, faUser, faMotorcycle, faFileAlt, faStethoscope, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import {
  formatFechaMantenimiento,
  formatFechaHoraMantenimiento,
  getEstadoMantenimientoNombre,
  getEstadoMantenimientoClass,
  getMotoNombre,
  getPropietarioNombre,
  formatPrecioMantenimiento
} from '../../utils/mantenimientoUtils';

/**
 * Modal para mostrar información detallada de un mantenimiento.
 */
export default function MantenimientoInfoModal({ isOpen, onClose, mantenimiento = null }) {
  if (!mantenimiento) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Información del Mantenimiento">
      <div className="space-y-6">
        {/* Estado del mantenimiento */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mr-2" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Estado del Mantenimiento</span>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoMantenimientoClass(mantenimiento.estado)}`}>
            {getEstadoMantenimientoNombre(mantenimiento.estado)}
          </span>
        </div>

        {/* Información de la moto */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FontAwesomeIcon icon={faMotorcycle} className="text-green-600 mr-2" />
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Información de la Moto</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Moto:</span>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{getMotoNombre(mantenimiento.moto)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Propietario:</span>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{getPropietarioNombre(mantenimiento.moto?.propietario)}</p>
            </div>
            {mantenimiento.kilometraje_ingreso && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kilometraje:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{mantenimiento.kilometraje_ingreso} km</p>
              </div>
            )}
          </div>
        </div>

        {/* Fechas */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-600 mr-2" />
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Fechas</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Ingreso:</span>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {formatFechaMantenimiento(mantenimiento.fecha_ingreso)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFechaHoraMantenimiento(mantenimiento.fecha_ingreso)}
              </p>
            </div>
            {mantenimiento.fecha_entrega && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Entrega:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                  {formatFechaMantenimiento(mantenimiento.fecha_entrega)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFechaHoraMantenimiento(mantenimiento.fecha_entrega)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Problema y diagnóstico */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FontAwesomeIcon icon={faFileAlt} className="text-orange-600 mr-2" />
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Problema Reportado</h4>
          </div>
          <div className="text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 p-3 rounded border">
            {mantenimiento.descripcion_problema}
          </div>
        </div>

        {mantenimiento.diagnostico && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <FontAwesomeIcon icon={faStethoscope} className="text-red-600 mr-2" />
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Diagnóstico</h4>
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 p-3 rounded border">
              {mantenimiento.diagnostico}
            </div>
          </div>
        )}

        {/* Total */}
        {mantenimiento.total && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <FontAwesomeIcon icon={faDollarSign} className="text-green-600 mr-2" />
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Total del Mantenimiento</h4>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPrecioMantenimiento(mantenimiento.total)}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Información Adicional</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">ID del Mantenimiento:</span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">#{mantenimiento.id}</p>
            </div>
            {mantenimiento.fecha_actualizacion && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Última Actualización:</span>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {formatFechaHoraMantenimiento(mantenimiento.fecha_actualizacion)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
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

MantenimientoInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mantenimiento: PropTypes.object,
};