// src/modulos/inventario/pages/components/InventarioCreateModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faBoxes, faBox, faHashtag, faWarning } from '@fortawesome/free-solid-svg-icons';
import { productsAPI } from '../../../../services/api';

/**
 * Modal para crear un nuevo registro de inventario.
 */
const InventarioCreateModal = ({ isOpen, onClose, onCreate, loading = false, apiError = null }) => {
  const [formData, setFormData] = useState({
    producto: '',
    stock_actual: 0,
    stock_minimo: 0,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);

  // Cargar productos disponibles
  useEffect(() => {
    const fetchProductos = async () => {
      if (isOpen) {
        setLoadingProductos(true);
        try {
          const response = await productsAPI.getAll({ activo: true, eliminado: false });
          setProductos(response.data.results || response.data || []);
        } catch (error) {
          console.error('Error cargando productos:', error);
        } finally {
          setLoadingProductos(false);
        }
      }
    };

    fetchProductos();
  }, [isOpen]);

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        producto: '',
        stock_actual: 0,
        stock_minimo: 0,
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
    
    if (!formData.producto) {
      errors.producto = 'El producto es obligatorio';
    }
    
    if (formData.stock_actual < 0) {
      errors.stock_actual = 'El stock actual no puede ser negativo';
    }
    
    if (formData.stock_minimo < 0) {
      errors.stock_minimo = 'El stock mínimo no puede ser negativo';
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Inventario">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Producto */}
        <div>
          <label htmlFor="producto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FontAwesomeIcon icon={faBox} className="mr-2 text-blue-500" />
            Producto *
          </label>
          <select
            id="producto"
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              getFieldError('producto')
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={loading || loadingProductos}
            required
          >
            <option value="">Seleccionar producto...</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} - {producto.codigo}
              </option>
            ))}
          </select>
          {getFieldError('producto') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {getFieldError('producto')}
            </p>
          )}
          {loadingProductos && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Cargando productos...
            </p>
          )}
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
            value={formData.stock_actual}
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
            value={formData.stock_minimo}
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
                Crear Inventario
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

InventarioCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  apiError: PropTypes.shape({
    message: PropTypes.string,
    fieldErrors: PropTypes.object,
  }),
};

export default InventarioCreateModal;
