// src/components/ProductoEditModal.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner, 
  faImage, 
  faTimes, 
  faBox, 
  faBarcode, 
  faAlignLeft, 
  faTag, 
  faBuilding, 
  faDollarSign, 
  faCubes, 
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';

/**
 * Modal para editar un producto existente.
 */
const ProductoEditModal = ({ isOpen, onClose, onUpdate, currentProducto, loading, apiError, categorias, proveedores }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    categoria: '',
    proveedor: '',
    precio_compra: '',
    precio_venta: '',
    imagen: null,
    destacado: false,
    activo: true,
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [hasNewImage, setHasNewImage] = useState(false);

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (isOpen && currentProducto) {
      const producto = currentProducto;
      setFormData({
        nombre: producto.nombre || '',
        codigo: producto.codigo || '',
        descripcion: producto.descripcion || '',
        categoria: producto.categoria || '',
        proveedor: producto.proveedor || '',
        precio_compra: producto.precio_compra || '',
        precio_venta: producto.precio_venta || '',
        imagen: null, // No cargamos la imagen existente aquí
        destacado: Boolean(producto.destacado),
        activo: Boolean(producto.activo),
      });
      
      // Establecer la imagen actual si existe
      const imageUrl = producto.imagen_url || producto.imagen;
      setCurrentImageUrl(imageUrl);
      setImagePreview(null);
      setHasNewImage(false);
      setFormErrors({});
    }
  }, [isOpen, currentProducto]);

  // Actualizar errores de formulario si apiError cambia
  useEffect(() => {
    if (apiError && apiError.fieldErrors) {
      setFormErrors(apiError.fieldErrors);
    } else if (apiError === null) {
      setFormErrors({}); // Limpiar errores si apiError es null
    }
  }, [apiError]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Crear preview de la nueva imagen
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
          setHasNewImage(true);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
        setHasNewImage(false);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Capitalizar primera letra para nombre y descripción
      let processedValue = value;
      if (name === 'nombre' || name === 'descripcion') {
        processedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const removeNewImage = () => {
    setFormData(prev => ({
      ...prev,
      imagen: null
    }));
    setImagePreview(null);
    setHasNewImage(false);
    // Limpiar el input file
    const fileInput = document.getElementById('imagen-edit');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.codigo.trim()) {
      errors.codigo = 'El código es requerido';
    }
    
    if (!formData.categoria) {
      errors.categoria = 'La categoría es requerida';
    }
    
    // Convertir a número para validaciones numéricas
    const precioVenta = parseFloat(formData.precio_venta);
    const precioCompra = parseFloat(formData.precio_compra);

    if (isNaN(precioVenta) || precioVenta <= 0) {
      errors.precio_venta = 'El precio de venta debe ser un número mayor a 0';
    }
    
    if (isNaN(precioCompra) || precioCompra <= 0) {
      errors.precio_compra = 'El precio de compra debe ser un número mayor a 0';
    }
    
    if (!isNaN(precioVenta) && !isNaN(precioCompra) && precioVenta <= precioCompra) {
      errors.precio_venta = 'El precio de venta debe ser mayor al precio de compra';
    }
    

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Solo incluir la imagen si hay una nueva imagen seleccionada
      const dataToSend = { ...formData };
      if (!hasNewImage) {
        delete dataToSend.imagen;
      }
      
      await onUpdate(currentProducto.id, dataToSend);
      // onClose() se llama en el padre si onUpdate es exitoso
    } catch (err) {
      // Los errores ya se manejan en el useEffect de apiError
      console.error('Error al actualizar producto en modal:', err);
    }
  };

  if (!currentProducto) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Producto: ${currentProducto.nombre}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general (si no hay errores de campo específicos) */}
        {apiError && !Object.keys(formErrors).length && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-1">{apiError.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faBox} className="mr-2 text-blue-500" />
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
              className={`mt-1 block w-full border ${formErrors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Nombre del producto"
            />
            {formErrors.nombre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.nombre}</p>
            )}
          </div>

          {/* Código */}
          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faBarcode} className="mr-2 text-gray-500" />
              Código *
            </label>
            <input
              type="text"
              name="codigo"
              id="codigo"
              value={formData.codigo}
              onChange={handleChange}
              disabled={loading}
              className={`mt-1 block w-full border ${formErrors.codigo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Código único del producto"
            />
            {formErrors.codigo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.codigo}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faAlignLeft} className="mr-2 text-purple-500" />
              Descripción
            </label>
            <textarea
              name="descripcion"
              id="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
              placeholder="Descripción del producto"
            />
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="categoria-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faTag} className="mr-2 text-green-500" />
              Categoría *
            </label>
            <select
              name="categoria"
              id="categoria-edit"
              value={formData.categoria}
              onChange={handleChange}
              disabled={loading}
              className={`mt-1 block w-full border ${formErrors.categoria ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
            >
              <option value="">Seleccionar categoría</option>
              {categorias && categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            {formErrors.categoria && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.categoria}</p>
            )}
          </div>

          {/* Proveedor */}
          <div>
            <label htmlFor="proveedor-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faBuilding} className="mr-2 text-orange-500" />
              Proveedor
            </label>
            <select
              name="proveedor"
              id="proveedor-edit"
              value={formData.proveedor}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <option value="">Sin proveedor</option>
              {proveedores && proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Precio de compra */}
          <div>
            <label htmlFor="precio_compra-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-600" />
              Precio de Compra (Bs) *
            </label>
            <input
              type="number"
              name="precio_compra"
              id="precio_compra-edit"
              value={formData.precio_compra}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={loading}
              className={`mt-1 block w-full border ${formErrors.precio_compra ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="0.00"
            />
            {formErrors.precio_compra && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.precio_compra}</p>
            )}
          </div>

          {/* Precio de venta */}
          <div>
            <label htmlFor="precio_venta-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-blue-600" />
              Precio de Venta (Bs) *
            </label>
            <input
              type="number"
              name="precio_venta"
              id="precio_venta-edit"
              value={formData.precio_venta}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={loading}
              className={`mt-1 block w-full border ${formErrors.precio_venta ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="0.00"
            />
            {formErrors.precio_venta && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.precio_venta}</p>
            )}
          </div>

        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Imagen del Producto
          </label>
          
          {/* Mostrar imagen actual y/o nueva */}
          <div className="space-y-4">
            {/* Imagen actual */}
            {currentImageUrl && !hasNewImage && (
              <div className="flex items-center space-x-4">
                <img
                  src={currentImageUrl}
                  alt="Imagen actual"
                  className="h-24 w-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Imagen actual</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Selecciona una nueva imagen para reemplazarla</p>
                </div>
              </div>
            )}

            {/* Nueva imagen seleccionada */}
            {imagePreview && hasNewImage && (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Nueva imagen"
                    className="h-24 w-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeNewImage}
                    disabled={loading}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <FontAwesomeIcon icon={faTimes} size="xs" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Nueva imagen seleccionada</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Esta imagen reemplazará la actual</p>
                </div>
              </div>
            )}

            {/* Área de subida */}
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200">
              <div className="space-y-1 text-center">
                <FontAwesomeIcon icon={faImage} className="mx-auto h-8 w-8 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="imagen-edit"
                    className={`relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <span>{hasNewImage ? 'Cambiar imagen' : currentImageUrl ? 'Cambiar imagen' : 'Subir imagen'}</span>
                    <input
                      id="imagen-edit"
                      name="imagen"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF hasta 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex items-center space-x-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="destacado"
              checked={formData.destacado}
              onChange={handleChange}
              disabled={loading}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Producto Destacado</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              disabled={loading}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Producto Activo</span>
          </label>
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

ProductoEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentProducto: PropTypes.object,
  loading: PropTypes.bool,
  apiError: PropTypes.object, // Cambiado a object para recibir el objeto completo
  categorias: PropTypes.array,
  proveedores: PropTypes.array,
};

ProductoEditModal.defaultProps = {
  currentProducto: null,
  loading: false,
  apiError: null,
  categorias: [],
  proveedores: [],
};

export default ProductoEditModal;
