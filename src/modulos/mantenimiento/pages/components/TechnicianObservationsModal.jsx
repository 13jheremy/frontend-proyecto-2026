// src/modulos/mantenimiento/pages/components/TechnicianObservationsModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSave, 
  faFileText, 
  faWrench,
  faMotorcycle,
  faUser,
  faCalendarAlt,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Modal especializado para técnicos - agregar observaciones y diagnóstico
 */
const TechnicianObservationsModal = ({
  isOpen,
  onClose,
  mantenimiento,
  onSave,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    diagnostico: '',
    observaciones_tecnico: ''
  });
  const [errors, setErrors] = useState({});

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && mantenimiento) {
      setFormData({
        diagnostico: mantenimiento.diagnostico || '',
        observaciones_tecnico: mantenimiento.observaciones_tecnico || ''
      });
      setErrors({});
    }
  }, [isOpen, mantenimiento]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.diagnostico.trim()) {
      newErrors.diagnostico = 'El diagnóstico es requerido';
    }
    
    if (!formData.observaciones_tecnico.trim()) {
      newErrors.observaciones_tecnico = 'Las observaciones son requeridas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSave(mantenimiento.id, formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar observaciones:', error);
    }
  };

  // No renderizar si no está abierto
  if (!isOpen || !mantenimiento) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faFileText} className="text-blue-600 mr-3 h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Agregar Observaciones Técnicas
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Diagnóstico y observaciones del mantenimiento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Información del mantenimiento */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMotorcycle} className="text-blue-600 mr-3 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {mantenimiento.moto_info?.placa || 'N/A'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {mantenimiento.moto_info?.marca} {mantenimiento.moto_info?.modelo}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUser} className="text-green-600 mr-3 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {mantenimiento.cliente_info?.nombre || 'N/A'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {mantenimiento.cliente_info?.telefono}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-600 mr-3 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {mantenimiento.fecha_ingreso ? 
                    format(parseISO(mantenimiento.fecha_ingreso), 'dd/MM/yyyy', { locale: es }) : 
                    'N/A'
                  }
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Fecha de ingreso</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FontAwesomeIcon icon={faWrench} className="text-purple-600 mr-3 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {mantenimiento.estado}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Estado actual</p>
              </div>
            </div>
          </div>
          
          {/* Descripción del problema */}
          {mantenimiento.descripcion && (
            <div className="mt-4 p-3 bg-white dark:bg-slate-700 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                Descripción del problema:
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {mantenimiento.descripcion}
              </p>
            </div>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Diagnóstico */}
          <div>
            <label htmlFor="diagnostico" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <FontAwesomeIcon icon={faWrench} className="mr-2 text-blue-600" />
              Diagnóstico Técnico *
            </label>
            <textarea
              id="diagnostico"
              name="diagnostico"
              value={formData.diagnostico}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                errors.diagnostico 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Describe el diagnóstico técnico del problema encontrado..."
              disabled={loading}
            />
            {errors.diagnostico && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.diagnostico}
              </p>
            )}
          </div>

          {/* Observaciones del técnico */}
          <div>
            <label htmlFor="observaciones_tecnico" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <FontAwesomeIcon icon={faFileText} className="mr-2 text-green-600" />
              Observaciones Técnicas *
            </label>
            <textarea
              id="observaciones_tecnico"
              name="observaciones_tecnico"
              value={formData.observaciones_tecnico}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                errors.observaciones_tecnico 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Agrega observaciones detalladas sobre el trabajo realizado, repuestos utilizados, recomendaciones, etc..."
              disabled={loading}
            />
            {errors.observaciones_tecnico && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.observaciones_tecnico}
              </p>
            )}
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Información importante:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• El diagnóstico debe ser claro y específico sobre el problema encontrado</li>
              <li>• Las observaciones deben incluir detalles del trabajo realizado</li>
              <li>• Menciona cualquier repuesto utilizado o recomendación para el cliente</li>
              <li>• Esta información será visible para administradores y el cliente</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 h-4 w-4" />
                  Guardando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                  Guardar Observaciones
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

TechnicianObservationsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mantenimiento: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default TechnicianObservationsModal;
