import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import MotoSearchInput from '../../../../components/ui/MotoSearchInput';
import ProductoSearchInput from '../../../../components/ui/ProductoSearchInput';
import { buscarServicios } from '../../../../services/busqueda';
import { toast } from 'react-toastify';

const MantenimientoFormModal = ({
  isOpen = false, 
  onClose, 
  onSubmit, 
  mantenimiento = null,
  loading = false 
}) => {
  const containerRef = useRef(null);
  const [formData, setFormData] = useState({
    moto: null,
    fecha_ingreso: '',
    fecha_entrega: '',
    descripcion_problema: '',
    diagnostico: '',
    estado: 'pendiente',
    kilometraje_ingreso: '',
    total: '0.00'
  });

  const [servicios, setServicios] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [servicioQuery, setServicioQuery] = useState('');
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [errors, setErrors] = useState({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [gridConfig, setGridConfig] = useState({ cols: 1, itemWidth: '100%' });

  const estadoOptions = [
    { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
    { value: 'en_proceso', label: 'En Proceso', color: 'blue' },
    { value: 'completado', label: 'Completado', color: 'green' },
    { value: 'cancelado', label: 'Cancelado', color: 'red' }
  ];

  // Efecto para calcular el ancho del contenedor y distribución automática
  useEffect(() => {
    const calculateLayout = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        
        // Calcular cuántos elementos caben basado en un ancho mínimo de 300px por elemento
        const minItemWidth = 300;
        const gap = 16; // 1rem = 16px para gap-4
        const availableWidth = width - (gap * 2); // Padding del contenedor
        
        let cols = Math.floor(availableWidth / (minItemWidth + gap));
        cols = Math.max(1, Math.min(cols, 4)); // Mínimo 1, máximo 4 columnas
        
        // Calcular el ancho proporcional para cada elemento
        const totalGaps = (cols - 1) * gap;
        const itemWidth = `${((availableWidth - totalGaps) / cols / availableWidth * 100).toFixed(2)}%`;
        
        setGridConfig({ cols, itemWidth });
      }
    };

    if (isOpen) {
      setTimeout(calculateLayout, 100); // Delay para asegurar que el modal esté renderizado
    }
    
    // Recalcular en resize
    const handleResize = () => {
      if (isOpen) {
        setTimeout(calculateLayout, 100); // Debounce
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Función para generar clases de grid dinámicas
  const getGridClasses = (maxCols = 4) => {
    const cols = Math.min(gridConfig.cols, maxCols);
    const gridColsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    };
    return gridColsMap[cols] || 'grid-cols-1';
  };

  // Función para obtener el estilo de ancho dinámico
  const getDynamicStyle = (maxCols = 4) => {
    const cols = Math.min(gridConfig.cols, maxCols);
    if (containerWidth < 768) return {}; // En móvil usar CSS grid normal
    
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '1rem'
    };
  };

  useEffect(() => {
    if (mantenimiento) {
      setFormData({
        moto: mantenimiento.moto || null,
        fecha_ingreso: mantenimiento.fecha_ingreso ? 
          new Date(mantenimiento.fecha_ingreso).toISOString().slice(0, 16) : '',
        fecha_entrega: mantenimiento.fecha_entrega ? 
          new Date(mantenimiento.fecha_entrega).toISOString().slice(0, 16) : '',
        descripcion_problema: mantenimiento.descripcion_problema || '',
        diagnostico: mantenimiento.diagnostico || '',
        estado: mantenimiento.estado || 'pendiente',
        kilometraje_ingreso: mantenimiento.kilometraje_ingreso || '',
        total: mantenimiento.total || '0.00'
      });
      setServicios(mantenimiento.detalles || []);
      setRepuestos(mantenimiento.repuestos || []);
    } else {
      resetForm();
    }
  }, [mantenimiento, isOpen]);

  const resetForm = () => {
    setFormData({
      moto: null,
      fecha_ingreso: '',
      fecha_entrega: '',
      descripcion_problema: '',
      diagnostico: '',
      estado: 'pendiente',
      kilometraje_ingreso: '',
      total: '0.00'
    });
    setServicios([]);
    setRepuestos([]);
    setErrors({});
  };

  const searchServicios = async (query) => {
    if (!query.trim()) {
      setServiciosDisponibles([]);
      return;
    }

    try {
      const response = await buscarServicios(query);
      setServiciosDisponibles(response.results || []);
    } catch (error) {
      console.error('Error buscando servicios:', error);
      setServiciosDisponibles([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleMotoSelect = (moto) => {
    handleInputChange('moto', moto);
    if (moto && moto.kilometraje) {
      handleInputChange('kilometraje_ingreso', moto.kilometraje.toString());
    }
  };

  const addServicio = (servicio) => {
    const nuevoServicio = {
      id: Date.now(),
      servicio: servicio.id,
      servicio_nombre: servicio.nombre,
      precio: servicio.precio,
      observaciones: ''
    };
    setServicios(prev => [...prev, nuevoServicio]);
    setServicioQuery('');
    setServiciosDisponibles([]);
    calcularTotal([...servicios, nuevoServicio], repuestos);
  };

  const removeServicio = (index) => {
    const nuevosServicios = servicios.filter((_, i) => i !== index);
    setServicios(nuevosServicios);
    calcularTotal(nuevosServicios, repuestos);
  };

  const updateServicio = (index, field, value) => {
    const nuevosServicios = [...servicios];
    nuevosServicios[index] = {
      ...nuevosServicios[index],
      [field]: value
    };
    setServicios(nuevosServicios);
    
    if (field === 'precio') {
      calcularTotal(nuevosServicios, repuestos);
    }
  };

  const addRepuesto = (producto) => {
    if (!producto.stock_disponible) {
      toast.error('El producto no tiene stock disponible');
      return;
    }

    const nuevoRepuesto = {
      id: Date.now(),
      producto: producto.id,
      producto_nombre: producto.nombre,
      producto_codigo: producto.codigo,
      cantidad: 1,
      precio_unitario: producto.precio_venta,
      subtotal: producto.precio_venta,
      stock_disponible: producto.stock_actual
    };
    setRepuestos(prev => [...prev, nuevoRepuesto]);
    calcularTotal(servicios, [...repuestos, nuevoRepuesto]);
  };

  const removeRepuesto = (index) => {
    const nuevosRepuestos = repuestos.filter((_, i) => i !== index);
    setRepuestos(nuevosRepuestos);
    calcularTotal(servicios, nuevosRepuestos);
  };

  const updateRepuesto = (index, field, value) => {
    const nuevosRepuestos = [...repuestos];
    const repuesto = { ...nuevosRepuestos[index] };

    if (field === 'cantidad') {
      const cantidad = parseInt(value) || 0;
      if (cantidad > repuesto.stock_disponible) {
        toast.error(`Stock insuficiente. Disponible: ${repuesto.stock_disponible}`);
        return;
      }
      repuesto.cantidad = cantidad;
      repuesto.subtotal = cantidad * parseFloat(repuesto.precio_unitario);
    } else if (field === 'precio_unitario') {
      repuesto.precio_unitario = value;
      repuesto.subtotal = repuesto.cantidad * parseFloat(value);
    }

    nuevosRepuestos[index] = repuesto;
    setRepuestos(nuevosRepuestos);
    calcularTotal(servicios, nuevosRepuestos);
  };

  const calcularTotal = (serviciosList, repuestosList) => {
    const totalServicios = serviciosList.reduce((sum, servicio) => 
      sum + parseFloat(servicio.precio || 0), 0);
    const totalRepuestos = repuestosList.reduce((sum, repuesto) => 
      sum + parseFloat(repuesto.subtotal || 0), 0);
    
    const total = totalServicios + totalRepuestos;
    handleInputChange('total', total.toFixed(2));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.moto) {
      newErrors.moto = 'La moto es requerida';
    }
    if (!formData.fecha_ingreso) {
      newErrors.fecha_ingreso = 'La fecha de ingreso es requerida';
    }
    if (!formData.descripcion_problema.trim()) {
      newErrors.descripcion_problema = 'La descripción del problema es requerida';
    }
    if (!formData.kilometraje_ingreso) {
      newErrors.kilometraje_ingreso = 'El kilometraje de ingreso es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    const submitData = {
      ...formData,
      moto: formData.moto.id,
      servicios,
      repuestos
    };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" ref={containerRef}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mantenimiento ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className={`grid ${getGridClasses(2)} gap-4`} style={getDynamicStyle(2)}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moto *
              </label>
              <MotoSearchInput
                value={formData.moto}
                onSelect={handleMotoSelect}
                error={errors.moto}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {estadoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Ingreso *
              </label>
              <input
                type="datetime-local"
                value={formData.fecha_ingreso}
                onChange={(e) => handleInputChange('fecha_ingreso', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fecha_ingreso ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.fecha_ingreso && (
                <p className="mt-1 text-sm text-red-600">{errors.fecha_ingreso}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Entrega
              </label>
              <input
                type="datetime-local"
                value={formData.fecha_entrega}
                onChange={(e) => handleInputChange('fecha_entrega', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kilometraje de Ingreso *
              </label>
              <input
                type="number"
                value={formData.kilometraje_ingreso}
                onChange={(e) => handleInputChange('kilometraje_ingreso', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.kilometraje_ingreso ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
                required
              />
              {errors.kilometraje_ingreso && (
                <p className="mt-1 text-sm text-red-600">{errors.kilometraje_ingreso}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total
              </label>
              <input
                type="text"
                value={`Bs. ${formData.total}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Problema *
            </label>
            <textarea
              value={formData.descripcion_problema}
              onChange={(e) => handleInputChange('descripcion_problema', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.descripcion_problema ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe el problema reportado por el cliente..."
              required
            />
            {errors.descripcion_problema && (
              <p className="mt-1 text-sm text-red-600">{errors.descripcion_problema}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnóstico
            </label>
            <textarea
              value={formData.diagnostico}
              onChange={(e) => handleInputChange('diagnostico', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Diagnóstico técnico del problema..."
            />
          </div>

          {/* Servicios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Servicios</h3>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                value={servicioQuery}
                onChange={(e) => {
                  setServicioQuery(e.target.value);
                  searchServicios(e.target.value);
                }}
                placeholder="Buscar servicio para agregar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              
              {serviciosDisponibles.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                  {serviciosDisponibles.map(servicio => (
                    <div
                      key={servicio.id}
                      onClick={() => addServicio(servicio)}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{servicio.nombre}</div>
                      <div className="text-sm text-gray-500">${servicio.precio}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {servicios.length > 0 && (
              <div className="space-y-2">
                {servicios.map((servicio, index) => (
                  <div key={servicio.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{servicio.servicio_nombre}</div>
                      <input
                        type="number"
                        step="0.01"
                        value={servicio.precio}
                        onChange={(e) => updateServicio(index, 'precio', e.target.value)}
                        className="mt-1 w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Precio"
                      />
                    </div>
                    <input
                      type="text"
                      value={servicio.observaciones}
                      onChange={(e) => updateServicio(index, 'observaciones', e.target.value)}
                      placeholder="Observaciones..."
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeServicio(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repuestos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Repuestos</h3>
            </div>
            
            <div className="mb-4">
              <ProductoSearchInput
                onSelect={addRepuesto}
                placeholder="Buscar repuesto para agregar..."
              />
            </div>

            {repuestos.length > 0 && (
              <div className="space-y-2">
                {repuestos.map((repuesto, index) => (
                  <div key={repuesto.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{repuesto.producto_codigo} - {repuesto.producto_nombre}</div>
                      <div className="text-sm text-gray-500">Stock: {repuesto.stock_disponible}</div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max={repuesto.stock_disponible}
                      value={repuesto.cantidad}
                      onChange={(e) => updateRepuesto(index, 'cantidad', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Cant."
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={repuesto.precio_unitario}
                      onChange={(e) => updateRepuesto(index, 'precio_unitario', e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Precio"
                    />
                    <div className="w-24 text-sm font-medium">
                      ${repuesto.subtotal}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRepuesto(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {mantenimiento ? 'Actualizar' : 'Crear'} Mantenimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MantenimientoFormModal;
