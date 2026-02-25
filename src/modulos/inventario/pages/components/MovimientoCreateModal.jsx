// src/modulos/inventario/pages/components/MovimientoCreateModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faBox, faArrowUp, faArrowDown, faComment } from '@fortawesome/free-solid-svg-icons';
import { inventarioApi } from '../../api/inventario';

/**
 * Modal para crear un nuevo movimiento de inventario.
 */
const MovimientoCreateModal = ({ isOpen, onClose, onCreate, loading = false, apiError = null }) => {
  const [formData, setFormData] = useState({
    inventario: '',
    tipo: 'entrada',
    cantidad: 1,
    motivo: '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [inventarios, setInventarios] = useState([]);
  const [loadingInventarios, setLoadingInventarios] = useState(false);

  // Cargar inventarios disponibles
  useEffect(() => {
    const fetchInventarios = async () => {
      if (isOpen) {
        setLoadingInventarios(true);
        try {
          const response = await inventarioApi.getInventarios({ activo: true, eliminado: false });
          setInventarios(response.results || response || []);
        } catch (error) {
          console.error('Error cargando inventarios:', error);
        } finally {
          setLoadingInventarios(false);
        }
      }
    };

    fetchInventarios();
  }, [isOpen]);

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        inventario: '',
        tipo: 'entrada',
        cantidad: 1,
        motivo: '',
      });
      setFormErrors({});
    }
  }, [isOpen]);

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
    const finalValue = type === 'number' ? parseInt(value) || 0 : value;
    
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
    
    // Validaciones básicas
    const errors = {};
    
    if (!formData.inventario) {
      errors.inventario = 'El inventario es obligatorio';
    }
    
    if (!formData.tipo) {
      errors.tipo = 'El tipo de movimiento es obligatorio';
    }
    
    if (formData.cantidad <= 0) {
      errors.cantidad = 'La cantidad debe ser mayor a 0';
    }
    
    if (!formData.motivo.trim()) {
      errors.motivo = 'El motivo es obligatorio';
    }

    // Validar stock disponible para salidas
    if (formData.tipo === 'salida' && formData.inventario) {
      const inventarioSeleccionado = inventarios.find(inv => inv.id == formData.inventario);
      if (inventarioSeleccionado && formData.cantidad > inventarioSeleccionado.stock_actual) {
        errors.cantidad = `No hay suficiente stock. Disponible: ${inventarioSeleccionado.stock_actual}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await onCreate(formData);
    } catch (error) {
      console.error('Error en handleSubmit:', error);
    }
  };

  const getFieldError = (fieldName) => {
    return formErrors[fieldName];
  };

  // Obtener inventario seleccionado para mostrar información
  const inventarioSeleccionado = inventarios.find(inv => inv.id == formData.inventario);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Movimiento de Inventario">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Inventario */}
        <div>
          <label htmlFor="inventario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FontAwesomeIcon icon={faBox} className="mr-2 text-blue-500" />
            Producto *
          </label>
          <select
            id="inventario"
            name="inventario"
            value={formData.inventario}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              getFieldError('inventario')
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={loading || loadingInventarios}
            required
          >
            <option value="">Seleccionar inventario</option>
            {inventarios.map((inventario) => (
              <option key={inventario.id} value={inventario.id}>
                {inventario.producto_nombre || inventario.producto?.nombre || 'Producto sin nombre'} - {inventario.producto_codigo || inventario.producto?.codigo || 'Sin código'} - Stock: {inventario.stock_actual}
              </option>
            ))}
          </select>
          {getFieldError('inventario') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {getFieldError('inventario')}
            </p>
          )}
          {loadingInventarios && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Cargando inventarios...
            </p>
          )}
        </div>

        {/* Mostrar información del inventario seleccionado */}
        {inventarioSeleccionado && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Información del Producto
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>
                <span className="font-medium">Código:</span> {inventarioSeleccionado.producto_codigo || inventarioSeleccionado.producto?.codigo || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Stock actual:</span> {inventarioSeleccionado.stock_actual}
              </div>
              <div>
                <span className="font-medium">Stock mínimo:</span> {inventarioSeleccionado.stock_minimo}
              </div>
            </div>
          </div>
        )}

        {/* Tipo de Movimiento */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Movimiento *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              formData.tipo === 'entrada'
                ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
              <input
                type="radio"
                name="tipo"
                value="entrada"
                checked={formData.tipo === 'entrada'}
                onChange={handleChange}
                className="sr-only"
              />
              <FontAwesomeIcon icon={faArrowUp} className="mr-2 text-green-500" />
              <span className="text-sm font-medium">Entrada</span>
            </label>
            
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              formData.tipo === 'salida'
                ? 'border-red-500 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
              <input
                type="radio"
                name="tipo"
                value="salida"
                checked={formData.tipo === 'salida'}
                onChange={handleChange}
                className="sr-only"
              />
              <FontAwesomeIcon icon={faArrowDown} className="mr-2 text-red-500" />
              <span className="text-sm font-medium">Salida</span>
            </label>
          </div>
          {getFieldError('tipo') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {getFieldError('tipo')}
            </p>
          )}
        </div>

        {/* Cantidad */}
        <div>
          <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cantidad *
          </label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleChange}
            min="1"
            max={formData.tipo === 'salida' && inventarioSeleccionado ? inventarioSeleccionado.stock_actual : undefined}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              getFieldError('cantidad')
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Cantidad del movimiento"
            disabled={loading}
            required
          />
          {getFieldError('cantidad') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {getFieldError('cantidad')}
            </p>
          )}
          {formData.tipo === 'salida' && inventarioSeleccionado && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Máximo disponible: {inventarioSeleccionado.stock_actual}
            </p>
          )}
        </div>

        {/* Motivo */}
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
            rows={3}
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
        </div>

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
                Creando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Crear Movimiento
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

MovimientoCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  apiError: PropTypes.shape({
    message: PropTypes.string,
    fieldErrors: PropTypes.object,
  }),
};

export default MovimientoCreateModal;
