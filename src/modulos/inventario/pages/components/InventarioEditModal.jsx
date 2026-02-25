// src/modulos/inventario/pages/components/InventarioEditModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSpinner, faBoxes, faBox, faHashtag, faWarning } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal para editar un registro de inventario existente.
 */
const InventarioEditModal = ({ isOpen, onClose, onUpdate, currentInventario, loading = false, apiError = null }) => {
  const [formData, setFormData] = useState({
    stock_actual: 0,
    stock_minimo: 0,
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Cargar datos del inventario actual cuando se abre el modal
  useEffect(() => {
    if (isOpen && currentInventario) {
      setFormData({
        stock_actual: currentInventario.stock_actual || 0,
        stock_minimo: currentInventario.stock_minimo || 0,
      });
      setFormErrors({});
    }
  }, [isOpen, currentInventario]);

  // Actualizar errores de formulario si apiError cambia
  useEffect(() => {
    if (apiError && apiError.fieldErrors) {
      setFormErrors(apiError.fieldErrors);
    } else if (apiError === null) {
      setFormErrors({});
    }
  }, [apiError]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Si el campo está vacío, guardar como cadena vacía en lugar de 0
    const finalValue = value === '' ? '' : (type === 'number' ? parseInt(value) || 0 : value);
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
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
    
    // Resetear errores
    setFormErrors({});
    
    // Validaciones básicas
    const errors = {};
    
    // Convertir cadenas vacías a 0 para la validación
    const stockActual = formData.stock_actual === '' ? 0 : Number(formData.stock_actual);
    const stockMinimo = formData.stock_minimo === '' ? 0 : Number(formData.stock_minimo);
    
    // Validar que sean números válidos
    if (isNaN(stockActual)) {
      errors.stock_actual = 'El stock actual debe ser un número';
    } else if (stockActual < 0) {
      errors.stock_actual = 'El stock actual no puede ser negativo';
    }
    
    if (isNaN(stockMinimo)) {
      errors.stock_minimo = 'El stock mínimo debe ser un número';
    } else if (stockMinimo < 0) {
      errors.stock_minimo = 'El stock mínimo no puede ser negativo';
    }

    // Si hay errores, mostrarlos y detener el envío
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Crear un objeto con solo los campos que se pueden actualizar
      const formDataToSend = {
        stock_actual: stockActual,
        stock_minimo: stockMinimo,
        // No incluir el campo 'producto' ya que es de solo lectura
      };

      console.log('Enviando datos al servidor:', formDataToSend);
      await onUpdate(formDataToSend);
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      
      // Manejar errores de validación del servidor
      if (error.response?.data) {
        const apiError = error.response.data;
        console.log('Error del servidor:', apiError);
        
        // Mapear errores del servidor al formulario
        const serverErrors = {};
        
        // Procesar field_errors si existen
        if (apiError.details) {
          Object.entries(apiError.details).forEach(([field, messages]) => {
            serverErrors[field] = Array.isArray(messages) ? messages.join(' ') : messages;
          });
        } 
        // Procesar errores no específicos de campo
        else if (apiError.error) {
          serverErrors.general = apiError.error;
        } 
        // Procesar errores de validación estándar de DRF
        else if (typeof apiError === 'object') {
          Object.entries(apiError).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              serverErrors[field] = messages.join(' ');
            } else if (typeof messages === 'string') {
              serverErrors[field] = messages;
            }
          });
        }
        
        // Si no se encontraron errores de campo específicos, mostrar error general
        if (Object.keys(serverErrors).length === 0 && apiError.message) {
          serverErrors.general = apiError.message;
        }
        
        setFormErrors(serverErrors);
      } else if (error.message) {
        // Error de red u otro error inesperado
        setFormErrors({ 
          general: `Error al actualizar el inventario: ${error.message}` 
        });
      } else {
        setFormErrors({ 
          general: 'Error desconocido al actualizar el inventario' 
        });
      }
    }
  };

  const getFieldError = (fieldName) => {
    return formErrors[fieldName];
  };

  if (!currentInventario) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Inventario">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del producto (solo lectura) */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FontAwesomeIcon icon={faBox} className="mr-2 text-blue-500" />
            Producto
          </h3>
          <div className="text-sm text-gray-900 dark:text-white">
            <div className="font-medium">
              {currentInventario.producto_nombre || currentInventario.producto?.nombre || 'Producto sin nombre'}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Código: {currentInventario.producto_codigo || currentInventario.producto?.codigo || 'N/A'}
            </div>
            {(currentInventario.producto?.categoria || currentInventario.categoria_nombre) && (
              <div className="text-gray-500 dark:text-gray-400">
                Categoría: {currentInventario.producto?.categoria?.nombre || currentInventario.categoria_nombre || 'N/A'}
              </div>
            )}
          </div>
        </div>

        {/* Stock Actual */}
        <div>
          <label htmlFor="stock_actual" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FontAwesomeIcon icon={faBoxes} className="mr-2 text-green-500" />
            Stock Actual *
          </label>
          <input
            type="number"
            id="stock_actual"
            name="stock_actual"
            value={formData.stock_actual === 0 ? '' : formData.stock_actual}
            onChange={handleChange}
            min="0"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              getFieldError('stock_actual')
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Cantidad actual en stock"
            disabled={loading}
            required
          />
          {getFieldError('stock_actual') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {getFieldError('stock_actual')}
            </p>
          )}
        </div>

        {/* Stock Mínimo */}
        <div>
          <label htmlFor="stock_minimo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FontAwesomeIcon icon={faWarning} className="mr-2 text-yellow-500" />
            Stock Mínimo *
          </label>
          <input
            type="number"
            id="stock_minimo"
            name="stock_minimo"
            value={formData.stock_minimo === 0 ? '' : formData.stock_minimo}
            onChange={handleChange}
            min="0"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              getFieldError('stock_minimo')
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Cantidad mínima requerida"
            disabled={loading}
            required
          />
          {getFieldError('stock_minimo') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {getFieldError('stock_minimo')}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Se generará una alerta cuando el stock esté por debajo de este valor
          </p>
        </div>

        {/* Mostrar diferencias si hay cambios */}
        {(formData.stock_actual !== currentInventario.stock_actual || 
          formData.stock_minimo !== currentInventario.stock_minimo) && (
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              Cambios detectados:
            </h4>
            <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              {formData.stock_actual !== currentInventario.stock_actual && (
                <div>
                  Stock actual: {currentInventario.stock_actual} → {formData.stock_actual}
                </div>
              )}
              {formData.stock_minimo !== currentInventario.stock_minimo && (
                <div>
                  Stock mínimo: {currentInventario.stock_minimo} → {formData.stock_minimo}
                </div>
              )}
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
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Actualizando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Actualizar Inventario
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

InventarioEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentInventario: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    producto: PropTypes.shape({
      nombre: PropTypes.string,
      codigo: PropTypes.string,
      categoria: PropTypes.shape({
        nombre: PropTypes.string
      })
    }),
    stock_actual: PropTypes.number,
    stock_minimo: PropTypes.number,
  }),
  loading: PropTypes.bool,
  apiError: PropTypes.shape({
    message: PropTypes.string,
    fieldErrors: PropTypes.object,
  }),
};

export default InventarioEditModal;
