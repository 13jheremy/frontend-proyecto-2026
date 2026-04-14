import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Save, AlertCircle, Package } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMotorcycle,
  faUser,
  faCalendarAlt,
  faTachometerAlt,
  faDollarSign,
  faFileAlt,
  faStethoscope,
  faWrench,
  faTools,
  faFlag,
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import MotoSearchInput from '../../../../components/ui/MotoSearchInput';
import ProductoSearchInput from '../../../../components/ui/ProductoSearchInput';
import TecnicoSearchInput from '../../../../components/ui/TecnicoSearchInput';
import { buscarServicios } from '../../../../services/busqueda';
import { posAPI } from '../../../../services/api';
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
    total: '0.00',
    adicional: '0.00',
    tecnico_asignado: null
  });

  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoLoading, setTecnicoLoading] = useState(false);

  // Estado para campos de aceite (cuando se agrega servicio de cambio de aceite)
  const [aceiteData, setAceiteData] = useState({
    tipo_aceite: '',
    tipo_recordatorio: 'km',
    km_proximo: '',
    fecha_programada: ''
  });

  // Verificar si hay servicio de cambio de aceite (se evalúa en render)
  // const tieneCambioAceite = servicios.some(
  //   s => s.servicio_nombre?.toLowerCase().includes('cambio de aceite') || 
  //        s.servicio?.nombre?.toLowerCase().includes('cambio de aceite')
  // );

  const [servicios, setServicios] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [servicioQuery, setServicioQuery] = useState('');
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null); // Backend API errors state
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

  // Fetch tecnicos on mount
  useEffect(() => {
    const fetchTecnicos = async () => {
      setTecnicoLoading(true);
      try {
        const response = await posAPI.buscarTecnicos('');
        console.log('FETCH TECNICOS - Response:', response);
        setTecnicos(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching tecnicos:', error);
        setTecnicos([]);
      } finally {
        setTecnicoLoading(false);
      }
    };
    
    if (isOpen) {
      fetchTecnicos();
    }
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
      console.log('MANTENIMIENTO DATA:', JSON.stringify(mantenimiento, null, 2));
      
      // Usar los campos del serializer directamente o el objeto moto
      let motoData = null;
      const marca = mantenimiento.moto_marca || mantenimiento.moto?.marca || '';
      const modelo = mantenimiento.moto_modelo || mantenimiento.moto?.modelo || '';
      const placa = mantenimiento.moto_placa || mantenimiento.moto?.placa || '';
      const kilometraje = mantenimiento.moto?.kilometraje || 0;
      const motoId = mantenimiento.moto?.id || mantenimiento.moto;
      
      console.log('MOTO FIELDS - marca:', marca, 'modelo:', modelo, 'placa:', placa);
      
      // Solo crear motoData si hay información de la moto
      if (marca || modelo || placa || motoId) {
        const displayText = placa ? `${marca} ${modelo} (${placa})`.trim() : `${marca} ${modelo}`.trim();
        
        motoData = {
          id: motoId,
          marca: marca,
          modelo: modelo,
          placa: placa,
          display_text: displayText || 'Moto sin información',
          kilometraje: kilometraje
        };
      }
      console.log('MOTO DATA CREATED:', motoData);

      // Preparar datos del técnico
      let tecnicoData = null;
      if (mantenimiento.tecnico_asignado) {
        const tecnico = mantenimiento.tecnico_asignado;
        tecnicoData = {
          id: tecnico.id || tecnico,
          display_text: mantenimiento.tecnico_asignado_persona_nombre || tecnico.username || 'Técnico'
        };
      }

      setFormData({
        moto: motoData,
        fecha_ingreso: mantenimiento.fecha_ingreso ? 
          new Date(mantenimiento.fecha_ingreso).toISOString().slice(0, 16) : '',
        fecha_entrega: mantenimiento.fecha_entrega ? 
          new Date(mantenimiento.fecha_entrega).toISOString().slice(0, 16) : '',
        descripcion_problema: mantenimiento.descripcion_problema || '',
        diagnostico: mantenimiento.diagnostico || '',
        estado: mantenimiento.estado || 'pendiente',
        kilometraje_ingreso: mantenimiento.kilometraje_ingreso || '',
        total: mantenimiento.total || '0.00',
        adicional: mantenimiento.costo_adicional || '0.00',
        tecnico_asignado: tecnicoData
      });
      setServicios(mantenimiento.detalles || []);
      setRepuestos(mantenimiento.repuestos || []);
      
      // Cargar datos de aceite si existen
      if (mantenimiento.detalles && mantenimiento.detalles.length > 0) {
        const detalleConAceite = mantenimiento.detalles.find(
          d => d.tipo_aceite || d.km_proximo_cambio
        );
        if (detalleConAceite) {
          setAceiteData({
            tipo_aceite: detalleConAceite.tipo_aceite || '',
            tipo_recordatorio: detalleConAceite.km_proximo_cambio ? 'km' : 'fecha',
            km_proximo: detalleConAceite.km_proximo_cambio || '',
            fecha_programada: ''
          });
        }
      }
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
      total: '0.00',
      adicional: '0.00',
      tecnico_asignado: null
    });
    setServicios([]);
    setRepuestos([]);
    setErrors({});
    setApiError(null);
    setAceiteData({
      tipo_aceite: '',
      tipo_recordatorio: 'km',
      km_proximo: '',
      fecha_programada: ''
    });
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

    // Limpiar error local y de API
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    if (apiError && apiError.type === 'validation' && apiError.errors && apiError.errors[field]) {
      setApiError(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: null
        }
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
    if (!producto.disponible) {
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
      stock_disponible: producto.stock_actual,
      imagen_url: producto.imagen_url || null
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
    
    // Obtener el valor del adicional directamente del estado actual
    const adicionalValue = formData.adicional || '0';
    const adicional = Number(adicionalValue) || 0;
    
    const total = totalServicios + totalRepuestos + adicional;
    handleInputChange('total', total.toFixed(2));
  };

  // Calcular kilómetros para próximo cambio según tipo de aceite
  const calcularProximoCambioKm = (tipo) => {
    const kmActual = parseInt(formData.kilometraje_ingreso) || 0;
    let kmAdicional = 0;
    
    switch (tipo) {
      case 'sintetico':
        kmAdicional = 6000;
        break;
      case 'semisintetico':
        kmAdicional = 4000;
        break;
      case 'mineral':
      default:
        kmAdicional = 2000;
        break;
    }
    
    return (kmActual + kmAdicional).toString();
  };

  // Calcular fecha para próximo cambio según tipo de aceite
  const calcularProximaFecha = (tipo) => {
    const fechaActual = new Date();
    let diasAdicionales = 0;
    
    switch (tipo) {
      case 'sintetico':
        diasAdicionales = 180;
        break;
      case 'semisintetico':
        diasAdicionales = 90;
        break;
      case 'mineral':
      default:
        diasAdicionales = 30;
        break;
    }
    
    fechaActual.setDate(fechaActual.getDate() + diasAdicionales);
    return fechaActual.toISOString().split('T')[0];
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
    if (!formData.tecnico_asignado || !formData.tecnico_asignado.id) {
      newErrors.tecnico_asignado = 'Debe asignar un técnico';
    }

    // Validar campos de aceite si hay servicio de cambio de aceite
    const tieneCambioAceite = servicios.some(s => {
      const nombre = s.servicio_nombre || s.servicio?.nombre || '';
      return nombre.toLowerCase().includes('cambio de aceite');
    });
    
    if (tieneCambioAceite && aceiteData.tipo_aceite) {
      if (aceiteData.tipo_recordatorio === 'km' && !aceiteData.km_proximo) {
        newErrors.km_proximo = 'Ingrese los km para próximo cambio';
      }
      if (aceiteData.tipo_recordatorio === 'fecha' && !aceiteData.fecha_programada) {
        newErrors.fecha_programada = 'Ingrese la fecha para próximo cambio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    // Verificar si hay servicio de cambio de aceite
    const tieneCambioAceite = servicios.some(s => {
      const nombre = s.servicio_nombre || s.servicio?.nombre || '';
      return nombre.toLowerCase().includes('cambio de aceite');
    });

    // Preparar datos de servicios con información de aceite
    const serviciosConAceite = servicios.map(servicio => {
      const nombre = servicio.servicio_nombre || servicio.servicio?.nombre || '';
      const isCambioAceite = nombre.toLowerCase().includes('cambio de aceite');
      
      return {
        ...servicio,
        tipo_aceite: isCambioAceite && aceiteData.tipo_aceite ? aceiteData.tipo_aceite : null,
        km_proximo_cambio: isCambioAceite && aceiteData.tipo_recordatorio === 'km' ? parseInt(aceiteData.km_proximo) || null : null
      };
    });

    // Preparar datos del recordatorio si aplica
    let recordatorioData = null;
    if (tieneCambioAceite && aceiteData.tipo_aceite) {
      recordatorioData = {
        tipo: aceiteData.tipo_recordatorio,
        km_proximo: aceiteData.tipo_recordatorio === 'km' ? parseInt(aceiteData.km_proximo) || null : null,
        fecha_programada: aceiteData.tipo_recordatorio === 'fecha' ? aceiteData.fecha_programada : null
      };
    }

    // Asegurar que kilometraje_ingreso sea un número válido
    const kilometrajeIngreso = parseInt(formData.kilometraje_ingreso) || 0;

    // Asegurar que fecha_ingreso tenga el formato correcto para Django
    let fechaIngresoFormateada = formData.fecha_ingreso;
    if (formData.fecha_ingreso) {
      // Convertir formato YYYY-MM-DDTHH:MM a formato ISO
      fechaIngresoFormateada = new Date(formData.fecha_ingreso).toISOString();
    }

    const submitData = {
      // Solo enviar campos requeridos
      moto: formData.moto.id,
      // Extraer el ID del técnico del objeto
      tecnico_asignado: formData.tecnico_asignado?.id || formData.tecnico_asignado || null,
      // Convertir kilometraje a entero
      kilometraje_ingreso: kilometrajeIngreso,
      // Formatear fecha correctamente
      fecha_ingreso: fechaIngresoFormateada,
      descripcion_problema: formData.descripcion_problema,
      // Solo enviar diagnostico si tiene contenido (no vacío)
      ...(formData.diagnostico && formData.diagnostico.trim() !== '' && { diagnostico: formData.diagnostico }),
      // Estado del mantenimiento
      estado: formData.estado || 'pendiente',
      // Tipo y prioridad con valores por defecto
      tipo: formData.tipo || 'correctivo',
      prioridad: formData.prioridad || 'media',
      servicios: serviciosConAceite,
      // El backend espera repuestos_data
      repuestos_data: repuestos,
      // Costo adicional - enviar como costo_adicional
      costo_adicional: Number(formData.adicional) || 0,
      // No enviar fecha_entrega vacía - enviar null si está vacía
      ...(formData.fecha_entrega && formData.fecha_entrega.trim() !== '' && { fecha_entrega: formData.fecha_entrega }),
      ...(recordatorioData && { recordatorio: recordatorioData })
    };

    // DEBUG: Ver qué se está enviando al backend
    console.log('=== DEBUG: Datos enviados al backend ===');
    console.log('submitData completo:', JSON.stringify(submitData, null, 2));

    try {
      await onSubmit(submitData);
      // Se asume que onSubmit llama a la página, que a su vez llama a crear/actualizar en el hook.
      // Si todo va bien, no lanzará error y podemos cerrar
      onClose(); 
    } catch (error) {
      console.error("Error capturado en el formulario:", error);
      
      // Intentar obtener los detalles de error de la API
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log("Error detallado de API:", errorData);
        
        // Si hay errores de campos específicos
        if (typeof errorData === 'object' && !errorData.detail && !errorData.error) {
          setApiError({
            type: 'validation',
            message: 'Por favor, corrige los errores en los campos marcados.',
            errors: errorData
          });
        } else {
          setApiError({
            type: 'general',
            message: errorData.detail || errorData.error || 'Ocurrió un error al procesar la solicitud.',
          });
        }
      } else {
        setApiError({
          type: 'general',
          message: error.message || 'Error de conexión con el servidor.',
        });
      }
    }
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

        {apiError && apiError.type === 'general' && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error al guardar</p>
              <p className="text-sm">{apiError.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className={`grid ${getGridClasses(2)} gap-4`} style={getDynamicStyle(2)}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faMotorcycle} className="mr-2 text-blue-500" />
                Moto *
              </label>
              <MotoSearchInput
                value={formData.moto}
                onSelect={handleMotoSelect}
                error={errors.moto || (apiError?.errors?.moto ? apiError.errors.moto[0] : null)}
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
                <FontAwesomeIcon icon={faUser} className="mr-2 text-indigo-500" />
                Técnico Asignado *
              </label>
              <TecnicoSearchInput
                value={formData.tecnico_asignado}
                onSelect={(tecnico) => handleInputChange('tecnico_asignado', tecnico)}
                error={errors.tecnico_asignado || (apiError?.errors?.tecnico_asignado ? apiError.errors.tecnico_asignado[0] : null)}
              />
              {errors.tecnico_asignado && (
                <p className="mt-1 text-sm text-red-600">{errors.tecnico_asignado}</p>
              )}
              {apiError?.errors?.tecnico_asignado && (
                <p className="mt-1 text-sm text-red-600">{apiError.errors.tecnico_asignado[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-500" />
                Fecha de Ingreso *
              </label>
              <input
                type="datetime-local"
                value={formData.fecha_ingreso}
                onChange={(e) => handleInputChange('fecha_ingreso', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fecha_ingreso || apiError?.errors?.fecha_ingreso ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.fecha_ingreso && (
                <p className="mt-1 text-sm text-red-600">{errors.fecha_ingreso}</p>
              )}
              {apiError?.errors?.fecha_ingreso && (
                <p className="mt-1 text-sm text-red-600">{apiError.errors.fecha_ingreso[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-500" />
                Fecha de Entrega
              </label>
              <input
                type="datetime-local"
                value={formData.fecha_entrega}
                onChange={(e) => handleInputChange('fecha_entrega', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  apiError?.errors?.fecha_entrega ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {apiError?.errors?.fecha_entrega && (
                <p className="mt-1 text-sm text-red-600">{apiError.errors.fecha_entrega[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-2 text-orange-500" />
                Kilometraje de Ingreso *
              </label>
              <input
                type="number"
                value={formData.kilometraje_ingreso}
                onChange={(e) => handleInputChange('kilometraje_ingreso', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.kilometraje_ingreso || apiError?.errors?.kilometraje_ingreso ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
                required
              />
              {errors.kilometraje_ingreso && (
                <p className="mt-1 text-sm text-red-600">{errors.kilometraje_ingreso}</p>
              )}
              {apiError?.errors?.kilometraje_ingreso && (
                <p className="mt-1 text-sm text-red-600">{apiError.errors.kilometraje_ingreso[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faPlusCircle} className="mr-2 text-blue-500" />
                Costo Adicional
              </label>
              <input
                type="number"
                value={formData.adicional}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('adicional', value);
                  // Recalcular total inmediatamente con el nuevo valor
                  const serviciosTotal = servicios.reduce((sum, s) => sum + (parseFloat(s.precio) || 0), 0);
                  const repuestosTotal = repuestos.reduce((sum, r) => sum + (parseFloat(r.subtotal) || 0), 0);
                  const adicionalValue = Number(value) || 0;
                  const total = serviciosTotal + repuestosTotal + adicionalValue;
                  handleInputChange('total', total.toFixed(2));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Para costos adicionales por complicaciones
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-500" />
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
              <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-orange-500" />
              Descripción del Problema *
            </label>
            <textarea
              value={formData.descripcion_problema}
              onChange={(e) => handleInputChange('descripcion_problema', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.descripcion_problema || apiError?.errors?.descripcion_problema ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe el problema reportado por el cliente..."
              required
            />
            {errors.descripcion_problema && (
              <p className="mt-1 text-sm text-red-600">{errors.descripcion_problema}</p>
            )}
            {apiError?.errors?.descripcion_problema && (
              <p className="mt-1 text-sm text-red-600">{apiError.errors.descripcion_problema[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faStethoscope} className="mr-2 text-red-500" />
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

          {/* Sección de Cambio de Aceite - Solo visible si hay servicio de cambio de aceite */}
          {servicios.some(s => {
            const nombre = s.servicio_nombre || s.servicio?.nombre || '';
            return nombre.toLowerCase().includes('cambio de aceite');
          }) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Datos del Cambio de Aceite</h3>
              <div className={`grid ${getGridClasses(2)} gap-4`} style={getDynamicStyle(2)}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Aceite
                  </label>
                  <select
                    value={aceiteData.tipo_aceite}
                    onChange={(e) => setAceiteData(prev => ({ ...prev, tipo_aceite: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar tipo...</option>
                    <option value="mineral">Mineral</option>
                    <option value="semisintetico">Semisintético</option>
                    <option value="sintetico">Sintético</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recordatorio para próximo cambio
                  </label>
                  <select
                    value={aceiteData.tipo_recordatorio}
                    onChange={(e) => setAceiteData(prev => ({ 
                      ...prev, 
                      tipo_recordatorio: e.target.value,
                      km_proximo: e.target.value === 'km' ? calcularProximoCambioKm(aceiteData.tipo_aceite) : '',
                      fecha_programada: e.target.value === 'fecha' ? calcularProximaFecha(e.target.value) : ''
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="km">Por Kilometraje</option>
                    <option value="fecha">Por Fecha</option>
                  </select>
                </div>

                {aceiteData.tipo_recordatorio === 'km' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kilómetros para próximo cambio
                    </label>
                    <input
                      type="number"
                      value={aceiteData.km_proximo}
                      onChange={(e) => setAceiteData(prev => ({ ...prev, km_proximo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Basado en tipo de aceite: {aceiteData.tipo_aceite === 'sintetico' ? '6,000 km' : aceiteData.tipo_aceite === 'semisintetico' ? '4,000 km' : '2,000 km'}
                    </p>
                  </div>
                )}

                {aceiteData.tipo_recordatorio === 'fecha' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha para próximo cambio
                    </label>
                    <input
                      type="date"
                      value={aceiteData.fecha_programada}
                      onChange={(e) => setAceiteData(prev => ({ ...prev, fecha_programada: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Basado en tipo de aceite: {aceiteData.tipo_aceite === 'sintetico' ? '180 días' : aceiteData.tipo_aceite === 'semisintetico' ? '90 días' : '30 días'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Servicios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">
                <FontAwesomeIcon icon={faWrench} className="mr-2 text-blue-500" />
                Servicios
              </h3>
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
              <h3 className="text-lg font-medium text-gray-900">
                <FontAwesomeIcon icon={faTools} className="mr-2 text-green-500" />
                Repuestos
              </h3>
            </div>
            
            <div className="mb-4">
              <ProductoSearchInput
                onSelect={addRepuesto}
                placeholder="Buscar repuesto para agregar..."
                showStock={true}
              />
            </div>

            {repuestos.length > 0 && (
              <div className="space-y-2">
                {repuestos.map((repuesto, index) => (
                  <div key={repuesto.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md">
                    {repuesto.imagen_url ? (
                      <img 
                        src={repuesto.imagen_url} 
                        alt={repuesto.producto_nombre}
                        className="h-10 w-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
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
