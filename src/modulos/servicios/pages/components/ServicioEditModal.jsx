// src/modules/servicios/components/ServicioEditModal.jsx
import React, { useState, useEffect } from 'react';
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
    }
  }, [isOpen, currentServicio]);

  // Actualizar errores de formulario si apiError cambia
  useEffect(() => {
    if (apiError && apiError.fieldErrors) {
      setFormErrors(apiError.fieldErrors);
    } else if (apiError === null) {
      setFormErrors({}); // Limpiar errores si apiError es null
    }
  }, [apiError]);

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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.categoria_servicio) {
      errors.categoria_servicio = 'La categoría es requerida';
    }
    
    const precio = parseFloat(formData.precio);
    let duracionTotal = 0;
    
    if (duracionTipo === 'minutos') {
      duracionTotal = parseInt(duracionMinutos);
      if (isNaN(duracionTotal) || duracionTotal <= 0) {
        errors.duracion_estimada = 'Los minutos deben ser un número mayor a 0';
      }
    } else {
      const horas = parseInt(duracionHoras) || 0;
      const minutos = parseInt(duracionMinutos) || 0;
      
      if (horas === 0 && minutos === 0) {
        errors.duracion_estimada = 'Debe especificar al menos 1 hora o 1 minuto';
      } else if (horas < 0 || minutos < 0 || minutos >= 60) {
        errors.duracion_estimada = 'Formato inválido: horas >= 0, minutos entre 0-59';
      } else {
        duracionTotal = (horas * 60) + minutos;
      }
    }

    if (isNaN(precio) || precio <= 0) {
      errors.precio = 'El precio debe ser un número mayor a 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Calcular duración total en minutos
    let duracionTotal = 0;
    if (duracionTipo === 'minutos') {
      duracionTotal = parseInt(duracionMinutos);
    } else {
      const horas = parseInt(duracionHoras) || 0;
      const minutos = parseInt(duracionMinutos) || 0;
      duracionTotal = (horas * 60) + minutos;
    }

    const dataToSubmit = {
      ...formData,
      duracion_estimada: duracionTotal
    };

    try {
      await onUpdate(currentServicio.id, dataToSubmit);
      // onClose() se llama en el padre si onUpdate es exitoso
    } catch (err) {
      // Los errores ya se manejan en el useEffect de apiError
      console.error('Error al actualizar servicio en modal:', err);
    }
  };

  if (!currentServicio) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Servicio: ${currentServicio.nombre}`}>
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
              <FontAwesomeIcon icon={faCogs} className="mr-2 text-blue-500" />
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre-edit"
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
              className={`mt-1 block w-full border ${formErrors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Nombre del servicio"
            />
            {formErrors.nombre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.nombre}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="categoria_servicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faTag} className="mr-2 text-green-500" />
              Categoría *
            </label>
            <select
              name="categoria_servicio"
              id="categoria_servicio-edit"
              value={formData.categoria_servicio}
              onChange={handleChange}
              disabled={loading}
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
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-600" />
              Precio (Bs) *
            </label>
            <input
              type="number"
              name="precio"
              id="precio-edit"
              value={formData.precio}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faAlignLeft} className="mr-2 text-purple-500" />
              Descripción
            </label>
            <textarea
              name="descripcion"
              id="descripcion-edit"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
              placeholder="Descripción detallada del servicio"
            />
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
              disabled={loading}
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

ServicioEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentServicio: PropTypes.object,
  loading: PropTypes.bool,
  apiError: PropTypes.object, // Cambiado a object para recibir el objeto completo
  categorias: PropTypes.array,
};

ServicioEditModal.defaultProps = {
  currentServicio: null,
  loading: false,
  apiError: null,
  categorias: [],
};

export default ServicioEditModal;