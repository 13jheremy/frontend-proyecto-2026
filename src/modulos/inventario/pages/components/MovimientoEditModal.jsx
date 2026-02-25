// src/modulos/inventario/pages/components/MovimientoEditModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSpinner, faBox, faArrowUp, faArrowDown, faComment } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal para editar un movimiento de inventario existente.
 */
const MovimientoEditModal = ({ isOpen, onClose, onUpdate, currentMovimiento, loading = false, apiError = null }) => {
  const [formData, setFormData] = useState({
    motivo: '',
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Cargar datos del movimiento actual cuando se abre el modal
  useEffect(() => {
    if (isOpen && currentMovimiento) {
      setFormData({
        motivo: currentMovimiento.motivo || '',
      });
      setFormErrors({});
    }
  }, [isOpen, currentMovimiento]);

  // Actualizar errores de formulario si apiError cambia
  useEffect(() => {
    if (apiError && apiError.fieldErrors) {
      setFormErrors(apiError.fieldErrors);
    } else if (apiError === null) {
      setFormErrors({});
    }
  }, [apiError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo si existe
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    const errors = {};
    
    if (!formData.motivo.trim()) {
      errors.motivo = 'El motivo es obligatorio';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Incluir todos los campos del movimiento actual y solo actualizar el motivo
      const updatedData = {
        ...currentMovimiento,  // Mantener todos los campos existentes
        motivo: formData.motivo  // Actualizar solo el motivo
      };
      
      await onUpdate(updatedData);
    } catch (error) {
      console.error('Error en handleSubmit:', error);
    }
  };

  const getFieldError = (fieldName) => {
    return formErrors[fieldName];
  };

  if (!currentMovimiento) {
    return null;
  }

  // Función para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Movimiento de Inventario">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del producto (solo lectura) */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FontAwesomeIcon icon={faBox} className="mr-2 text-blue-500" />
            Información del Producto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Producto</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentMovimiento.producto_nombre || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Código</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {currentMovimiento.producto_codigo || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Información del movimiento (solo lectura) */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FontAwesomeIcon icon={faBox} className="mr-2 text-blue-500" />
            Información del Movimiento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {currentMovimiento.tipo}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tipo de Movimiento</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {currentMovimiento.tipo}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentMovimiento.cantidad}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatFecha(currentMovimiento.fecha_creacion)}
              </p>
            </div>
            
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Usuario:</span>
              <div className="text-gray-900 dark:text-white">
                {currentMovimiento.usuario_nombre || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Motivo (editable) */}
        <div>
          <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FontAwesomeIcon icon={faComment} className="mr-2 text-purple-500" />
            Motivo *
          </label>
          <textarea
            id="motivo"
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              getFieldError('motivo')
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Describe el motivo del movimiento..."
            disabled={loading}
            required
          />
          {getFieldError('motivo') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {getFieldError('motivo')}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Solo se puede editar el motivo del movimiento. Los demás campos son de solo lectura.
          </p>
        </div>

        {/* Mostrar cambios si hay diferencias */}
        {formData.motivo !== currentMovimiento.motivo && (
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              Cambios detectados:
            </h4>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              <div className="mb-2">
                <span className="font-medium">Motivo anterior:</span>
                <div className="bg-white dark:bg-gray-800 p-2 rounded mt-1 text-gray-700 dark:text-gray-300">
                  {currentMovimiento.motivo || 'Sin motivo'}
                </div>
              </div>
              <div>
                <span className="font-medium">Nuevo motivo:</span>
                <div className="bg-white dark:bg-gray-800 p-2 rounded mt-1 text-gray-700 dark:text-gray-300">
                  {formData.motivo || 'Sin motivo'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar error general de la API si existe */}
        {apiError && apiError.message && !apiError.fieldErrors && (
          <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              {apiError.message}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={loading || formData.motivo === currentMovimiento.motivo}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Actualizando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Actualizar Movimiento
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

MovimientoEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentMovimiento: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    inventario: PropTypes.shape({
      producto: PropTypes.shape({
        nombre: PropTypes.string,
        codigo: PropTypes.string,
      })
    }),
    tipo: PropTypes.string,
    cantidad: PropTypes.number,
    motivo: PropTypes.string,
    fecha: PropTypes.string,
    usuario: PropTypes.shape({
      first_name: PropTypes.string,
      last_name: PropTypes.string,
    }),
  }),
  loading: PropTypes.bool,
  apiError: PropTypes.shape({
    message: PropTypes.string,
    fieldErrors: PropTypes.object,
  }),
};

export default MovimientoEditModal;
