// src/modulos/ventas/pages/components/VentaFormModal.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faShoppingCart, faUser, faCalendar, faDollarSign, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import ProductoSearchInput from '../../../../components/ui/ProductoSearchInput'; // Importar el componente

const VentaFormModal = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  onUpdate, 
  currentVenta, 
  loading, 
  apiError, 
  mode = 'create' 
}) => {
  const [formData, setFormData] = useState({
    cliente: '',
    fecha_venta: new Date().toISOString().split('T')[0],
    subtotal: 0,
    impuesto: 0,
    total: 0,
    estado: 'pendiente',
    metodo_pago: 'efectivo',
    observaciones: '',
    detalles: []
  });

  const [errors, setErrors] = useState({});
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');

  // Estados de los métodos de pago disponibles
  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'credito', label: 'Crédito' }
  ];

  // Estados disponibles para ventas (deben coincidir con el modelo backend)
  const estadosVenta = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'PAGADA', label: 'Pagada' },
    { value: 'ANULADA', label: 'Anulada' }
  ];

  // Efecto para cargar datos cuando se abre el modal en modo edición
  useEffect(() => {
    if (isOpen && mode === 'edit' && currentVenta) {
      setFormData({
        cliente: currentVenta.cliente?.id || '',
        fecha_venta: currentVenta.fecha_venta ? currentVenta.fecha_venta.split('T')[0] : new Date().toISOString().split('T')[0],
        subtotal: currentVenta.subtotal || 0,
        impuesto: currentVenta.impuesto || 0,
        total: currentVenta.total || 0,
        estado: currentVenta.estado || 'PENDIENTE',
        metodo_pago: currentVenta.metodo_pago || 'efectivo',
        observaciones: currentVenta.observaciones || '',
        detalles: currentVenta.detalles || []
      });
    } else if (isOpen && mode === 'create') {
      // Resetear formulario para nueva venta
      setFormData({
        cliente: '',
        fecha_venta: new Date().toISOString().split('T')[0],
        subtotal: 0,
        impuesto: 0,
        total: 0,
        estado: 'PENDIENTE',
        metodo_pago: 'efectivo',
        observaciones: '',
        detalles: []
      });
    }
    setErrors({});
  }, [isOpen, mode, currentVenta]);

  // Calcular totales automáticamente
  useEffect(() => {
    const subtotal = formData.detalles.reduce((sum, detalle) => 
      sum + (detalle.cantidad * detalle.precio_unitario), 0
    );
    const impuesto = subtotal * 0.19; // 19% IVA
    const total = subtotal + impuesto;

    setFormData(prev => ({
      ...prev,
      subtotal: parseFloat(subtotal.toFixed(2)),
      impuesto: parseFloat(impuesto.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }));
  }, [formData.detalles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const agregarDetalle = () => {
    const nuevoDetalle = {
      id: Date.now(), // ID temporal
      producto: '',
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0
    };
    
    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, nuevoDetalle]
    }));
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevosDetalles = [...formData.detalles];
    nuevosDetalles[index][campo] = valor;
    
    // Recalcular subtotal del detalle
    if (campo === 'cantidad' || campo === 'precio_unitario') {
      nuevosDetalles[index].subtotal = 
        nuevosDetalles[index].cantidad * nuevosDetalles[index].precio_unitario;
    }
    
    setFormData(prev => ({
      ...prev,
      detalles: nuevosDetalles
    }));
  };

  const eliminarDetalle = (index) => {
    const nuevosDetalles = formData.detalles.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      detalles: nuevosDetalles
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cliente) {
      newErrors.cliente = 'El cliente es requerido';
    }

    if (!formData.fecha_venta) {
      newErrors.fecha_venta = 'La fecha de venta es requerida';
    }

    if (formData.detalles.length === 0) {
      newErrors.detalles = 'Debe agregar al menos un producto';
    }

    // Validar detalles
    formData.detalles.forEach((detalle, index) => {
      if (!detalle.producto) {
        newErrors[`detalle_${index}_producto`] = 'Producto requerido';
      }
      if (detalle.cantidad <= 0) {
        newErrors[`detalle_${index}_cantidad`] = 'Cantidad debe ser mayor a 0';
      }
      if (detalle.precio_unitario <= 0) {
        newErrors[`detalle_${index}_precio`] = 'Precio debe ser mayor a 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        await onCreate(formData);
      } else {
        await onUpdate(currentVenta.id, formData);
      }
    } catch (error) {
      console.error('Error en submit:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      cliente: '',
      fecha_venta: new Date().toISOString().split('T')[0],
      subtotal: 0,
      impuesto: 0,
      total: 0,
      estado: 'PENDIENTE',
      metodo_pago: 'efectivo',
      observaciones: '',
      detalles: []
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <FontAwesomeIcon icon={faShoppingCart} className="mr-2 text-blue-600" />
            {mode === 'create' ? 'Nueva Venta' : 'Editar Venta'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error general de API */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Cliente *
              </label>
              <select
                name="cliente"
                value={formData.cliente}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.cliente ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Seleccionar cliente...</option>
                {/* Aquí se cargarían los clientes desde la API */}
              </select>
              {errors.cliente && (
                <p className="mt-1 text-sm text-red-600">{errors.cliente}</p>
              )}
            </div>

            {/* Fecha de Venta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                Fecha de Venta *
              </label>
              <input
                type="date"
                name="fecha_venta"
                value={formData.fecha_venta}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.fecha_venta ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.fecha_venta && (
                <p className="mt-1 text-sm text-red-600">{errors.fecha_venta}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {estadosVenta.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                Método de Pago
              </label>
              <select
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {metodosPago.map(metodo => (
                  <option key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observaciones */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Detalles de la Venta */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Productos de la Venta
              </h3>
              <button
                type="button"
                onClick={agregarDetalle}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Agregar Producto
              </button>
            </div>

            {errors.detalles && (
              <p className="mb-4 text-sm text-red-600">{errors.detalles}</p>
            )}

            <div className="space-y-4">
              {formData.detalles.map((detalle, index) => (
                <div key={detalle.id || index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {/* Producto */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Producto *
                      </label>
                      <ProductoSearchInput
                        onSelect={(producto) => {
                          const nuevosDetalles = [...formData.detalles];
                          if (producto) {
                            nuevosDetalles[index].producto = producto.id;
                            nuevosDetalles[index].precio_unitario = producto.precio_venta;
                            nuevosDetalles[index].subtotal = nuevosDetalles[index].cantidad * producto.precio_venta;
                          } else {
                            nuevosDetalles[index].producto = '';
                            nuevosDetalles[index].precio_unitario = 0;
                            nuevosDetalles[index].subtotal = 0;
                          }
                          setFormData(prev => ({ ...prev, detalles: nuevosDetalles }));
                        }}
                        error={errors[`detalle_${index}_producto`]}
                      />
                      {errors[`detalle_${index}_producto`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`detalle_${index}_producto`]}</p>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={detalle.cantidad}
                        onChange={(e) => actualizarDetalle(index, 'cantidad', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                          errors[`detalle_${index}_cantidad`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors[`detalle_${index}_cantidad`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`detalle_${index}_cantidad`]}</p>
                      )}
                    </div>

                    {/* Precio Unitario */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Precio Unitario *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={detalle.precio_unitario}
                        onChange={(e) => actualizarDetalle(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                          errors[`detalle_${index}_precio`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors[`detalle_${index}_precio`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`detalle_${index}_precio`]}</p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Subtotal: ${detalle.subtotal.toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarDetalle(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          {formData.detalles.length > 0 && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Subtotal</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${formData.subtotal.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">IVA (19%)</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${formData.impuesto.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    ${formData.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (mode === 'create' ? 'Crear Venta' : 'Actualizar Venta')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VentaFormModal;
