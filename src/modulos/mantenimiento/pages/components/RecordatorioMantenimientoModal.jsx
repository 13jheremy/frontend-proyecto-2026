// src/modulos/mantenimiento/pages/components/RecordatorioMantenimientoModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal'; // Ajusta la ruta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faSave, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { getMotoNombre, getPropietarioNombre } from '../../utils/mantenimientoUtils';

/**
 * Modal para crear recordatorios de mantenimiento.
 */
export default function RecordatorioMantenimientoModal({ isOpen, onClose, mantenimiento = null, onCreateRecordatorio }) {
  const [formData, setFormData] = useState({
    categoria_servicio_id: '',
    fecha_programada: '',
    descripcion: ''
  });

  const [categoriasServicio, setCategoriasServicio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen && mantenimiento) {
      // Calcular fecha sugerida (por ejemplo, 6 meses después del mantenimiento)
      const fechaActual = new Date();
      const fechaSugerida = new Date(fechaActual);
      fechaSugerida.setMonth(fechaSugerida.getMonth() + 6);

      setFormData({
        categoria_servicio_id: '',
        fecha_programada: fechaSugerida.toISOString().split('T')[0],
        descripcion: `Recordatorio de mantenimiento para ${getMotoNombre(mantenimiento.moto)}`
      });

      // Simular carga de categorías de servicio
      setCategoriasServicio([
        { id: 1, nombre: 'Cambio de aceite', descripcion: 'Cambio periódico de aceite del motor' },
        { id: 2, nombre: 'Revisión general', descripcion: 'Revisión completa del vehículo' },
        { id: 3, nombre: 'Cambio de filtros', descripcion: 'Reemplazo de filtros de aire, combustible y aceite' },
        { id: 4, nombre: 'Revisión de frenos', descripcion: 'Inspección y mantenimiento del sistema de frenos' },
        { id: 5, nombre: 'Alineación y balanceo', descripcion: 'Ajuste de la dirección y balanceo de ruedas' },
        { id: 6, nombre: 'Cambio de bujías', descripcion: 'Reemplazo de bujías de encendido' },
        { id: 7, nombre: 'Revisión de batería', descripcion: 'Verificación del estado de la batería' },
        { id: 8, nombre: 'Cambio de neumáticos', descripcion: 'Reemplazo de neumáticos desgastados' }
      ]);

      setFormErrors({});
    }
  }, [isOpen, mantenimiento]);

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

    if (!formData.categoria_servicio_id) {
      errors.categoria_servicio_id = 'Debes seleccionar una categoría de servicio';
    }

    if (!formData.fecha_programada) {
      errors.fecha_programada = 'La fecha programada es requerida';
    } else {
      const fechaProgramada = new Date(formData.fecha_programada);
      const fechaActual = new Date();
      if (fechaProgramada <= fechaActual) {
        errors.fecha_programada = 'La fecha programada debe ser futura';
      }
    }

    if (!formData.descripcion || formData.descripcion.trim().length === 0) {
      errors.descripcion = 'La descripción es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const recordatorioData = {
        ...formData,
        moto: mantenimiento.moto.id,
        fecha_programada: formData.fecha_programada,
        enviado: false
      };

      await onCreateRecordatorio(recordatorioData);
      onClose();
    } catch (error) {
      console.error('Error creando recordatorio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      categoria_servicio_id: '',
      fecha_programada: '',
      descripcion: ''
    });
    setFormErrors({});
    onClose();
  };

  if (!mantenimiento) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Recordatorio de Mantenimiento">
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.keys(formErrors).length > 0 && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Errores de validación:</strong>
            <ul className="mt-2 list-disc list-inside">
              {Object.values(formErrors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Información del mantenimiento */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 mr-2" />
            <h4 className="text-md font-medium text-blue-900 dark:text-blue-100">
              Información del Mantenimiento Completado
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Moto:</span>
              <p className="text-blue-900 dark:text-blue-100 mt-1">{getMotoNombre(mantenimiento.moto)}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Propietario:</span>
              <p className="text-blue-900 dark:text-blue-100 mt-1">{getPropietarioNombre(mantenimiento.moto?.propietario)}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Fecha de entrega:</span>
              <p className="text-blue-900 dark:text-blue-100 mt-1">
                {mantenimiento.fecha_entrega ? new Date(mantenimiento.fecha_entrega).toLocaleDateString('es-ES') : 'No especificada'}
              </p>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Kilometraje:</span>
              <p className="text-blue-900 dark:text-blue-100 mt-1">
                {mantenimiento.kilometraje_ingreso ? `${mantenimiento.kilometraje_ingreso} km` : 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Categoría de servicio */}
        <div>
          <label htmlFor="categoria_servicio_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de Mantenimiento a Recordar *
          </label>
          <select
            name="categoria_servicio_id"
            id="categoria_servicio_id"
            value={formData.categoria_servicio_id}
            onChange={handleChange}
            className={`mt-1 block w-full border ${formErrors.categoria_servicio_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
          >
            <option value="">Seleccionar tipo de mantenimiento</option>
            {categoriasServicio.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre} - {categoria.descripcion}
              </option>
            ))}
          </select>
          {formErrors.categoria_servicio_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.categoria_servicio_id}</p>
          )}
        </div>

        {/* Fecha programada */}
        <div>
          <label htmlFor="fecha_programada" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha Programada *
          </label>
          <input
            type="date"
            name="fecha_programada"
            id="fecha_programada"
            value={formData.fecha_programada}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`mt-1 block w-full border ${formErrors.fecha_programada ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
          />
          {formErrors.fecha_programada && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.fecha_programada}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Recomendamos programar el recordatorio con suficiente anticipación para que el cliente pueda planificar su visita.
          </p>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción del Recordatorio *
          </label>
          <textarea
            name="descripcion"
            id="descripcion"
            rows="3"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describe qué mantenimiento se debe realizar..."
            className={`mt-1 block w-full border ${formErrors.descripcion ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
          />
          {formErrors.descripcion && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.descripcion}</p>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5"
            />
            <div className="text-sm text-yellow-700 dark:text-yellow-400">
              <strong>Nota importante:</strong> El recordatorio se enviará automáticamente cuando llegue la fecha programada.
              El cliente recibirá una notificación por email y SMS (si está configurado) recordándole que debe
              traer su moto para el mantenimiento programado.
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Creando Recordatorio...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Crear Recordatorio
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

RecordatorioMantenimientoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mantenimiento: PropTypes.object,
  onCreateRecordatorio: PropTypes.func.isRequired,
};