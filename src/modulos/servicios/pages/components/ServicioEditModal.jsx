// src/modules/servicios/components/ServicioEditModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner, 
  faCogs, 
  faTag, 
  faDollarSign, 
  faClock, 
  faAlignLeft 
} from '@fortawesome/free-solid-svg-icons';

// Constantes de validación (mismas que en ServicioCreateModal)
const VALIDATION = {
  NOMBRE_MIN: 2,
  NOMBRE_MAX: 150,
  DESCRIPCION_MAX: 500,
  PRECIO_MIN: 0.01,
  PRECIO_MAX: 999999.99,
  DURACION_MIN: 1,
  DURACION_MAX: 1440, // 24 horas en minutos
};

/**
 * Modal para editar un servicio existente.
 */
const ServicioEditModal = ({ isOpen, onClose, onUpdate, currentServicio, loading, apiError, categorias }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion_estimada: '',
    categoria_servicio: '',
    activo: true,
  });
  
  const [duracionTipo, setDuracionTipo] = useState('minutos');
  const [duracionHoras, setDuracionHoras] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState('');
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nombreInputRef = useRef(null);

  // Cargar datos del servicio cuando se abre el modal
  useEffect(() => {
    if (isOpen && currentServicio) {
      const servicio = currentServicio;
      const duracionTotal = parseInt(servicio.duracion_estimada) || 0;
      
      // Convertir duración total a horas y minutos
      const horas = Math.floor(duracionTotal / 60);
      const minutos = duracionTotal % 60;
      
      setFormData({
        nombre: servicio.nombre || '',
        descripcion: servicio.descripcion || '',
        precio: servicio.precio || '',
        duracion_estimada: servicio.duracion_estimada || '',
        categoria_servicio: servicio.categoria_servicio || '',
        activo: Boolean(servicio.activo),
      });
      
      // Determinar el tipo de duración y establecer valores
      if (horas > 0) {
        setDuracionTipo('horas_minutos');
        setDuracionHoras(horas.toString());
        setDuracionMinutos(minutos.toString());
      } else {
        setDuracionTipo('minutos');
        setDuracionHoras('');
        setDuracionMinutos(duracionTotal.toString());
      }
      
      setFormErrors({});
      setIsSubmitting(false);

      // Enfocar el campo nombre al abrir
      setTimeout(() => {
        if (nombreInputRef.current) {
          nombreInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, currentServicio]);

  // Actualizar errores de formulario si apiError cambia
  useEffect(() => {
    if (apiError && apiError.fieldErrors) {
      setFormErrors(prev => ({
        ...prev,
        ...apiError.fieldErrors,
      }));
    } else if (apiError === null) {
      // Solo limpiar errores de API, no los de validación local
    }
  }, [apiError]);

  // Sanitizar texto: eliminar caracteres especiales HTML
  const sanitizeText = (text) => {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim();
  };

  // Normalizar nombre: solo primera letra mayúscula, resto minúscula, un espacio entre palabras
  const normalizeNombre = (value) => {
    if (!value) return '';
    const lower = value.toLowerCase();
    const trimmed = lower.trim().replace(/\s+/g, ' ');
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  // Sanitizar nombre para envío: eliminar espacios múltiples, trim
  const sanitizeNombre = (text) => {
    return text.replace(/\s+/g, ' ').trim();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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

  // Validar un campo individual (para validación en tiempo real)
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre': {
        const trimmed = sanitizeText(value);
        if (!trimmed) return 'El nombre es requerido';
        if (trimmed.length < VALIDATION.NOMBRE_MIN) return `El nombre debe tener al menos ${VALIDATION.NOMBRE_MIN} caracteres`;
        if (trimmed.length > VALIDATION.NOMBRE_MAX) return `El nombre no puede exceder ${VALIDATION.NOMBRE_MAX} caracteres`;
        if (/[<>{}[\]\\\/]/.test(trimmed)) return 'El nombre contiene caracteres no permitidos';
        return null;
      }
      case 'descripcion': {
        const trimmed = sanitizeText(value);
        if (trimmed.length > VALIDATION.DESCRIPCION_MAX) return `La descripción no puede exceder ${VALIDATION.DESCRIPCION_MAX} caracteres`;
        return null;
      }
      case 'precio': {
        if (value === '' || value === null || value === undefined) return 'El precio es requerido';
        const precio = parseFloat(value);
        if (isNaN(precio)) return 'El precio debe ser un número válido';
        if (precio < VALIDATION.PRECIO_MIN) return `El precio debe ser al menos ${VALIDATION.PRECIO_MIN}`;
        if (precio > VALIDATION.PRECIO_MAX) return `El precio no puede exceder ${VALIDATION.PRECIO_MAX.toLocaleString()}`;
        const decimalPart = value.toString().split('.')[1];
        if (decimalPart && decimalPart.length > 2) return 'El precio puede tener máximo 2 decimales';
        return null;
      }
      case 'categoria_servicio': {
        if (!value) return 'La categoría es requerida';
        return null;
      }
      default:
        return null;
    }
  };

  // Validar y normalizar al salir del campo (onBlur)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let valueToValidate = value;
    if (name === 'nombre' && value) {
      const normalized = normalizeNombre(value);
      setFormData(prev => ({
        ...prev,
        [name]: normalized
      }));
      valueToValidate = normalized;
    }
    const error = validateField(name, valueToValidate);
    if (error) {
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validar nombre
    const nombreError = validateField('nombre', formData.nombre);
    if (nombreError) errors.nombre = nombreError;
    
    // Validar categoría
    const categoriaError = validateField('categoria_servicio', formData.categoria_servicio);
    if (categoriaError) errors.categoria_servicio = categoriaError;
    
    // Validar precio
    const precioError = validateField('precio', formData.precio);
    if (precioError) errors.precio = precioError;

    // Validar duración
    let duracionTotal = 0;
    
    if (duracionTipo === 'minutos') {
      const mins = parseInt(duracionMinutos);
      if (!duracionMinutos || duracionMinutos === '') {
        errors.duracion_estimada = 'La duración es requerida';
      } else if (isNaN(mins)) {
        errors.duracion_estimada = 'La duración debe ser un número válido';
      } else if (mins < VALIDATION.DURACION_MIN) {
        errors.duracion_estimada = `La duración debe ser al menos ${VALIDATION.DURACION_MIN} minuto(s)`;
      } else if (mins > VALIDATION.DURACION_MAX) {
        errors.duracion_estimada = `La duración no puede exceder ${VALIDATION.DURACION_MAX} minutos (24 horas)`;
      } else {
        duracionTotal = mins;
      }
    } else {
      const horas = parseInt(duracionHoras) || 0;
      const minutos = parseInt(duracionMinutos) || 0;
      
      if (horas === 0 && minutos === 0) {
        errors.duracion_estimada = 'Debe especificar al menos 1 hora o 1 minuto';
      } else if (horas < 0) {
        errors.duracion_estimada = 'Las horas no pueden ser negativas';
      } else if (minutos < 0 || minutos >= 60) {
        errors.duracion_estimada = 'Los minutos deben estar entre 0 y 59';
      } else {
        duracionTotal = (horas * 60) + minutos;
        if (duracionTotal > VALIDATION.DURACION_MAX) {
          errors.duracion_estimada = `La duración total no puede exceder ${VALIDATION.DURACION_MAX} minutos (24 horas)`;
        }
      }
    }

    // Validar descripción
    const descripcionError = validateField('descripcion', formData.descripcion);
    if (descripcionError) errors.descripcion = descripcionError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevenir envío doble
    if (isSubmitting || loading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Calcular duración total en minutos
    let duracionTotal = 0;
    if (duracionTipo === 'minutos') {
      duracionTotal = parseInt(duracionMinutos);
    } else {
      const horas = parseInt(duracionHoras) || 0;
      const minutos = parseInt(duracionMinutos) || 0;
      duracionTotal = (horas * 60) + minutos;
    }

    // Sanitizar datos antes de enviar
    const dataToSubmit = {
      nombre: sanitizeNombre(formData.nombre),
      descripcion: sanitizeText(formData.descripcion),
      precio: parseFloat(formData.precio),
      duracion_estimada: duracionTotal,
      categoria_servicio: formData.categoria_servicio,
      activo: formData.activo,
    };

    try {
      await onUpdate(currentServicio.id, dataToSubmit);
      // onClose() se llama en el padre si onUpdate es exitoso
    } catch (err) {
      // Los errores de API se manejan en el useEffect de apiError
      // y los toasts se manejan en el hook useServicios
      console.error('Error al actualizar servicio en modal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentServicio) {
    return null;
  }

  // Contadores de caracteres
  const nombreLength = formData.nombre.length;
  const descripcionLength = formData.descripcion.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Servicio: ${currentServicio.nombre}`}>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Error general de API (si no hay errores de campo específicos) */}
        {apiError && apiError.message && (!apiError.fieldErrors || Object.keys(apiError.fieldErrors).length === 0) && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-1">{apiError.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faCogs} className="mr-2 text-blue-500" />
              Nombre *
            </label>
            <input
              ref={nombreInputRef}
              type="text"
              name="nombre"
              id="nombre-edit"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              maxLength={VALIDATION.NOMBRE_MAX}
              className={`mt-1 block w-full border ${formErrors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Nombre del servicio"
            />
            <div className="flex justify-between mt-1">
              {formErrors.nombre ? (
                <p className="text-sm text-red-600 dark:text-red-400">{formErrors.nombre}</p>
              ) : (
                <span />
              )}
              <span className={`text-xs ${nombreLength > VALIDATION.NOMBRE_MAX * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
                {nombreLength}/{VALIDATION.NOMBRE_MAX}
              </span>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="categoria_servicio-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faTag} className="mr-2 text-green-500" />
              Categoría *
            </label>
            <select
              name="categoria_servicio"
              id="categoria_servicio-edit"
              value={formData.categoria_servicio}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              className={`mt-1 block w-full border ${formErrors.categoria_servicio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
            >
              <option value="">Seleccionar categoría</option>
              {categorias && categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            {formErrors.categoria_servicio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.categoria_servicio}</p>
            )}
          </div>

          {/* Precio */}
          <div>
            <label htmlFor="precio-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-600" />
              Precio (Bs) *
            </label>
            <input
              type="number"
              name="precio"
              id="precio-edit"
              value={formData.precio}
              onChange={handleChange}
              onBlur={handleBlur}
              min={VALIDATION.PRECIO_MIN}
              max={VALIDATION.PRECIO_MAX}
              step="0.01"
              disabled={loading || isSubmitting}
              className={`mt-1 block w-full border ${formErrors.precio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="0.00"
            />
            {formErrors.precio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.precio}</p>
            )}
          </div>

          {/* Duración Estimada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faClock} className="mr-2 text-orange-500" />
              Duración Estimada *
            </label>
            
            {/* Selector de tipo de duración */}
            <div className="mb-2">
              <select
                value={duracionTipo}
                onChange={(e) => {
                  setDuracionTipo(e.target.value);
                  if (e.target.value === 'minutos') {
                    // Convertir horas y minutos actuales a solo minutos
                    const horas = parseInt(duracionHoras) || 0;
                    const minutos = parseInt(duracionMinutos) || 0;
                    const totalMinutos = (horas * 60) + minutos;
                    setDuracionMinutos(totalMinutos > 0 ? totalMinutos.toString() : '');
                    setDuracionHoras('');
                  } else {
                    // Convertir minutos a horas y minutos
                    const totalMinutos = parseInt(duracionMinutos) || 0;
                    const horas = Math.floor(totalMinutos / 60);
                    const minutos = totalMinutos % 60;
                    setDuracionHoras(horas > 0 ? horas.toString() : '');
                    setDuracionMinutos(minutos > 0 ? minutos.toString() : '');
                  }
                  if (formErrors.duracion_estimada) {
                    setFormErrors(prev => ({ ...prev, duracion_estimada: null }));
                  }
                }}
                disabled={loading || isSubmitting}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="minutos">Solo Minutos</option>
                <option value="horas_minutos">Horas y Minutos</option>
              </select>
            </div>
            
            {/* Campos de entrada según el tipo seleccionado */}
            {duracionTipo === 'minutos' ? (
              <input
                type="number"
                value={duracionMinutos}
                onChange={(e) => {
                  setDuracionMinutos(e.target.value);
                  if (formErrors.duracion_estimada) {
                    setFormErrors(prev => ({ ...prev, duracion_estimada: null }));
                  }
                }}
                min="1"
                max={VALIDATION.DURACION_MAX}
                disabled={loading || isSubmitting}
                className={`block w-full border ${formErrors.duracion_estimada ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
                placeholder="Duración en minutos"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    value={duracionHoras}
                    onChange={(e) => {
                      setDuracionHoras(e.target.value);
                      if (formErrors.duracion_estimada) {
                        setFormErrors(prev => ({ ...prev, duracion_estimada: null }));
                      }
                    }}
                    min="0"
                    max="24"
                    disabled={loading || isSubmitting}
                    className={`block w-full border ${formErrors.duracion_estimada ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
                    placeholder="Horas"
                  />
                  <label className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Horas</label>
                </div>
                <div>
                  <input
                    type="number"
                    value={duracionMinutos}
                    onChange={(e) => {
                      setDuracionMinutos(e.target.value);
                      if (formErrors.duracion_estimada) {
                        setFormErrors(prev => ({ ...prev, duracion_estimada: null }));
                      }
                    }}
                    min="0"
                    max="59"
                    disabled={loading || isSubmitting}
                    className={`block w-full border ${formErrors.duracion_estimada ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
                    placeholder="Minutos"
                  />
                  <label className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Minutos (0-59)</label>
                </div>
              </div>
            )}
            
            {formErrors.duracion_estimada && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.duracion_estimada}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label htmlFor="descripcion-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faAlignLeft} className="mr-2 text-purple-500" />
              Descripción
            </label>
            <textarea
              name="descripcion"
              id="descripcion-edit"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              maxLength={VALIDATION.DESCRIPCION_MAX}
              className={`mt-1 block w-full border ${formErrors.descripcion ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Descripción detallada del servicio"
            />
            <div className="flex justify-between mt-1">
              {formErrors.descripcion ? (
                <p className="text-sm text-red-600 dark:text-red-400">{formErrors.descripcion}</p>
              ) : (
                <span />
              )}
              <span className={`text-xs ${descripcionLength > VALIDATION.DESCRIPCION_MAX * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
                {descripcionLength}/{VALIDATION.DESCRIPCION_MAX}
              </span>
            </div>
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              disabled={loading || isSubmitting}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Servicio Activo</span>
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading || isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || isSubmitting ? (
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

ServicioEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentServicio: PropTypes.object,
  loading: PropTypes.bool,
  apiError: PropTypes.object,
  categorias: PropTypes.array,
};

ServicioEditModal.defaultProps = {
  currentServicio: null,
  loading: false,
  apiError: null,
  categorias: [],
};

export default ServicioEditModal;