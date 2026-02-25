// src/modules/recordatorios/pages/components/RecordatorioEditModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import MotoSearchInput from '../../../pos/components/MotoSearchInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faSpinner, faMotorcycle, faCalendarAlt, faCogs, faCheck } from '@fortawesome/free-solid-svg-icons';
import { serviceCategoriesAPI as categoriaServicioAPI } from '../../../../services/api';

/**
 * Modal para editar un recordatorio de mantenimiento.
 * Sigue el mismo patrón que MotoCreateModal para consistencia.
 */
const RecordatorioEditModal = ({ isOpen, onClose, onUpdate, currentRecordatorio, loading, apiError }) => {
  console.log('🏗️ RecordatorioEditModal renderizado con props:', {
    isOpen,
    loading,
    apiError,
    hasOnUpdate: typeof onUpdate === 'function',
    hasOnClose: typeof onClose === 'function',
    currentRecordatorio: currentRecordatorio?.id
  });

  const [formData, setFormData] = useState({
    fecha_programada: '',
    moto: '',
    categoria_servicio: '',
    activo: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [categoriasServicio, setCategoriasServicio] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [selectedMoto, setSelectedMoto] = useState(null);

  // Función para limpiar el formulario
  const resetForm = useCallback(() => {
    setFormData({
      fecha_programada: '',
      moto: '',
      categoria_servicio: '',
      activo: true,
    });
    setFormErrors({});
    setSelectedMoto(null);
  }, []);

  // Limpiar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      resetForm();
      loadCategoriasServicio();
    }
  }, [isOpen, resetForm]);

  // Cargar categorías de servicio disponibles
  const loadCategoriasServicio = useCallback(async () => {
    setLoadingCategorias(true);
    try {
      const response = await categoriaServicioAPI.getAll({ activo: true });
      console.log('📋 Respuesta completa de categorías de servicio (Edit):', response);
      console.log('📋 response.data (Edit):', response.data);

      // Handle paginated response format
      let categorias = [];
      if (response.data && response.data.results) {
        // Paginated response: { count, next, previous, results: [...] }
        categorias = response.data.results;
        console.log('📋 Respuesta paginada detectada (Edit), usando results:', categorias);
      } else if (Array.isArray(response.data)) {
        // Direct array response
        categorias = response.data;
        console.log('📋 Respuesta como array directo (Edit):', categorias);
      } else {
        console.warn('📋 Formato de respuesta inesperado (Edit):', response.data);
        categorias = [];
      }

      console.log('📋 Categorías finales procesadas (Edit):', categorias);
      setCategoriasServicio(Array.isArray(categorias) ? categorias : []);
    } catch (error) {
      console.error('❌ Error cargando categorías de servicio (Edit):', error);
      console.error('❌ Error details (Edit):', error.response?.data);
      setCategoriasServicio([]);
    } finally {
      setLoadingCategorias(false);
    }
  }, []);

  // Cargar datos del recordatorio actual
  useEffect(() => {
    if (isOpen && currentRecordatorio) {
      setFormData({
        fecha_programada: currentRecordatorio.fecha_programada
          ? new Date(currentRecordatorio.fecha_programada).toISOString().split('T')[0]
          : '',
        moto: currentRecordatorio.moto?.id || currentRecordatorio.moto || '',
        categoria_servicio: currentRecordatorio.categoria_servicio?.id || currentRecordatorio.categoria_servicio || '',
        activo: currentRecordatorio.activo !== undefined ? currentRecordatorio.activo : true,
      });
      setSelectedMoto(currentRecordatorio.moto);
      setFormErrors({});
    }
  }, [isOpen, currentRecordatorio]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [formErrors]);

  // Handler para selección de moto desde MotoSearchInput
  const handleMotoSelect = useCallback((moto) => {
    setFormData(prev => ({
      ...prev,
      moto: moto.id
    }));
    setSelectedMoto(moto);

    // Limpiar error del campo moto
    if (formErrors.moto) {
      setFormErrors(prev => ({
        ...prev,
        moto: null
      }));
    }
  }, [formErrors.moto]);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.fecha_programada) {
      errors.fecha_programada = 'La fecha programada es requerida';
    } else {
      const selectedDate = new Date(formData.fecha_programada);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.fecha_programada = 'La fecha programada no puede ser anterior a hoy';
      }
    }

    if (!formData.moto) {
      errors.moto = 'La moto es requerida';
    }

    if (!formData.categoria_servicio) {
      errors.categoria_servicio = 'La categoría de servicio es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    console.log('🚀 Intentando enviar formulario de edición de recordatorio...');
    console.log('📋 Datos del formulario:', formData);

    if (loading) {
      console.log('⏳ Ya está cargando, ignorando envío');
      return;
    }

    if (!validateForm()) {
      console.log('❌ Validación falló');
      return;
    }

    try {
      // Preparar datos para enviar al backend con los nombres de campos correctos
      const dataToSend = {
        fecha_programada: formData.fecha_programada,
        moto_id: formData.moto,
        categoria_servicio_id: formData.categoria_servicio,
        activo: formData.activo,
      };

      console.log('✅ Validación exitosa, llamando onUpdate con datos preparados:', dataToSend);
      await onUpdate(currentRecordatorio.id, dataToSend);
      console.log('🎉 onUpdate completado exitosamente');
    } catch (err) {
      console.error('💥 Error al actualizar recordatorio:', err);
    }
  }, [formData, loading, validateForm, onUpdate, currentRecordatorio]);

  // Si no está abierto, no renderizar nada
  if (!isOpen || !currentRecordatorio) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Recordatorio de Mantenimiento">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {apiError && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-1">
              {typeof apiError === 'string' ? apiError : apiError.message || 'Error desconocido'}
            </span>
            {/* Mostrar errores de campos específicos si existen */}
            {apiError.fieldErrors && Object.keys(apiError.fieldErrors).length > 0 && (
              <div className="mt-2 text-sm">
                <strong>Detalles:</strong>
                <ul className="list-disc list-inside mt-1">
                  {Object.entries(apiError.fieldErrors).map(([field, errors]) => (
                    <li key={field}>
                      <strong className="capitalize">{field}:</strong> {Array.isArray(errors) ? errors.join(', ') : errors}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Moto con búsqueda avanzada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faMotorcycle} className="mr-2 text-blue-500" />
              Moto *
            </label>
            <MotoSearchInput
              onMotoSelect={handleMotoSelect}
              placeholder="Buscar moto por placa, marca o modelo..."
            />
            {selectedMoto && (
              <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faMotorcycle} className="text-blue-600 dark:text-blue-400 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {selectedMoto.marca} {selectedMoto.modelo} ({selectedMoto.año})
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      <span className="font-semibold">Placa:</span> <span className="font-bold">{selectedMoto.placa}</span>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      <span className="font-semibold">Propietario:</span> {selectedMoto.propietario?.nombre_completo || 'N/A'}
                      {selectedMoto.propietario?.cedula && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                          (CI: {selectedMoto.propietario.cedula})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Kilometraje: {selectedMoto.kilometraje?.toLocaleString() || '0'} km | Color: {selectedMoto.color}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {formErrors.moto && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.moto}</p>
            )}
          </div>

          {/* Categoría de Servicio */}
          <div>
            <label htmlFor="categoria_servicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faCogs} className="mr-2 text-green-500" />
              Categoría de Servicio *
            </label>
            <select
              name="categoria_servicio"
              id="categoria_servicio"
              value={formData.categoria_servicio}
              onChange={handleChange}
              disabled={loadingCategorias}
              className={`mt-1 block w-full border ${formErrors.categoria_servicio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
            >
              <option value="">
                {loadingCategorias ? 'Cargando categorías...' : 'Seleccionar categoría de servicio'}
              </option>
              {Array.isArray(categoriasServicio) && categoriasServicio.length > 0 ? (
                categoriasServicio.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {loadingCategorias ? 'Cargando categorías...' : 'No hay categorías disponibles'}
                </option>
              )}
            </select>
            {formErrors.categoria_servicio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.categoria_servicio}</p>
            )}
          </div>

          {/* Fecha programada */}
          <div>
            <label htmlFor="fecha_programada" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-orange-500" />
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
              placeholder="Seleccionar fecha"
            />
            {formErrors.fecha_programada && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.fecha_programada}</p>
            )}
          </div>

          {/* Checkbox Activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo" className="ml-2 text-gray-700 dark:text-gray-300">
              <FontAwesomeIcon icon={faCheck} className="mr-1" />
              Recordatorio Activo
            </label>
          </div>
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
                Actualizar Recordatorio
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

RecordatorioEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentRecordatorio: PropTypes.object,
  loading: PropTypes.bool,
  apiError: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
      fieldErrors: PropTypes.object
    })
  ]),
};

export default RecordatorioEditModal;