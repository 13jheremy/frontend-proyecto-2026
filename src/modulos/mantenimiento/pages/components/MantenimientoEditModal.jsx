// src/modulos/mantenimiento/pages/components/MantenimientoEditModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal'; // Ajusta la ruta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { validarMantenimiento, getMotoNombre, getPropietarioNombre } from '../../utils/mantenimientoUtils';
import { hasRole } from '../../../../utils/rolePermissions';
import { ROLES } from '../../../../utils/constants';

/**
 * Modal para editar un mantenimiento existente.
 */
export default function MantenimientoEditModal({ isOpen, onClose, currentMantenimiento = null, onUpdate, loading = false, error = null, userRoles = [] }) {
  const [formData, setFormData] = useState({
    fecha_ingreso: '',
    descripcion_problema: '',
    diagnostico: '',
    kilometraje_ingreso: '',
    estado: 'pendiente',
    fecha_entrega: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Check if user is tecnico
  const isTecnico = hasRole(userRoles, ROLES.TECNICO);

  useEffect(() => {
    if (isOpen && currentMantenimiento) {
      setFormData({
        fecha_ingreso: currentMantenimiento.fecha_ingreso ? new Date(currentMantenimiento.fecha_ingreso).toISOString().split('T')[0] : '',
        descripcion_problema: currentMantenimiento.descripcion_problema || '',
        diagnostico: currentMantenimiento.diagnostico || '',
        kilometraje_ingreso: currentMantenimiento.kilometraje_ingreso || '',
        estado: currentMantenimiento.estado || 'pendiente',
        fecha_entrega: currentMantenimiento.fecha_entrega ? new Date(currentMantenimiento.fecha_entrega).toISOString().split('T')[0] : '',
      });
      setFormErrors({});
    }
  }, [isOpen, currentMantenimiento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fecha_ingreso) {
      errors.fecha_ingreso = 'La fecha de ingreso es requerida';
    }

    if (!formData.descripcion_problema || formData.descripcion_problema.trim().length === 0) {
      errors.descripcion_problema = 'La descripción del problema es requerida';
    }

    if (formData.kilometraje_ingreso && formData.kilometraje_ingreso < 0) {
      errors.kilometraje_ingreso = 'El kilometraje no puede ser negativo';
    }

    // Validar fecha de entrega si está completado
    if (formData.estado === 'completado' && !formData.fecha_entrega) {
      errors.fecha_entrega = 'La fecha de entrega es requerida para mantenimientos completados';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar
    const mantenimientoData = {
      ...formData,
      kilometraje_ingreso: formData.kilometraje_ingreso ? parseInt(formData.kilometraje_ingreso) : null,
      fecha_entrega: formData.fecha_entrega || null,
    };

    try {
      await onUpdate(currentMantenimiento.id, mantenimientoData);
    } catch (err) {
      console.error('Error al actualizar mantenimiento:', err);
    }
  };

  if (!currentMantenimiento) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Mantenimiento - ${getMotoNombre(currentMantenimiento.moto)}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-1">{error}</span>
          </div>
        )}

        {/* Información de la moto (solo lectura) */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Información de la Moto</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Moto:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">{getMotoNombre(currentMantenimiento.moto)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Propietario:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">{getPropietarioNombre(currentMantenimiento.moto?.propietario)}</span>
            </div>
          </div>
        </div>

        {/* Fecha de Ingreso */}
        <div>
          <label htmlFor="fecha_ingreso-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha de Ingreso *
          </label>
          <input
            type="date"
            name="fecha_ingreso"
            id="fecha_ingreso-edit"
            value={formData.fecha_ingreso}
            onChange={handleChange}
            disabled={isTecnico}
            className={`mt-1 block w-full border ${formErrors.fecha_ingreso ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 ${isTecnico ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500'} transition-colors duration-200`}
          />
          {formErrors.fecha_ingreso && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.fecha_ingreso}</p>
          )}
        </div>

        {/* Fecha de Entrega */}
        <div>
          <label htmlFor="fecha_entrega-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha de Entrega
            {formData.estado === 'completado' && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="date"
            name="fecha_entrega"
            id="fecha_entrega-edit"
            value={formData.fecha_entrega}
            onChange={handleChange}
            disabled={isTecnico}
            className={`mt-1 block w-full border ${formErrors.fecha_entrega ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 ${isTecnico ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500'} transition-colors duration-200`}
          />
          {formErrors.fecha_entrega && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.fecha_entrega}</p>
          )}
        </div>

        {/* Kilometraje */}
        <div>
          <label htmlFor="kilometraje_ingreso-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kilometraje de Ingreso
          </label>
          <input
            type="number"
            name="kilometraje_ingreso"
            id="kilometraje_ingreso-edit"
            value={formData.kilometraje_ingreso}
            onChange={handleChange}
            min="0"
            placeholder="Ej. 15000"
            disabled={isTecnico}
            className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 ${isTecnico ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500'} transition-colors duration-200`}
          />
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="estado-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            name="estado"
            id="estado-edit"
            value={formData.estado}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completado</option>
            {!isTecnico && <option value="cancelado">Cancelado</option>}
          </select>
        </div>

        {/* Descripción del Problema */}
        <div>
          <label htmlFor="descripcion_problema-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción del Problema *
          </label>
          <textarea
            name="descripcion_problema"
            id="descripcion_problema-edit"
            rows="3"
            value={formData.descripcion_problema}
            onChange={handleChange}
            placeholder="Describe detalladamente el problema reportado por el cliente..."
            disabled={isTecnico}
            className={`mt-1 block w-full border ${formErrors.descripcion_problema ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 ${isTecnico ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500'} transition-colors duration-200`}
          />
          {formErrors.descripcion_problema && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.descripcion_problema}</p>
          )}
        </div>

        {/* Diagnóstico */}
        <div>
          <label htmlFor="diagnostico-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Diagnóstico
          </label>
          <textarea
            name="diagnostico"
            id="diagnostico-edit"
            rows="2"
            value={formData.diagnostico}
            onChange={handleChange}
            placeholder="Diagnóstico del problema..."
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Actualizando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

MantenimientoEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentMantenimiento: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  userRoles: PropTypes.array,
};