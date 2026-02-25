// src/modulos/motos/pages/components/MotoCreateModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import PropietarioSearchSelect from './PropietarioSearchSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faMotorcycle, faIdCard, faCalendarAlt, faCogs, faTachometerAlt, faPalette, faRoad, faUser } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal para crear una nueva moto.
 */
const MotoCreateModal = ({ isOpen, onClose, onCreate, loading, error, usuariosDisponibles }) => {
  console.log('🏗️ MotoCreateModal renderizado con props:', {
    isOpen,
    loading,
    error,
    hasOnCreate: typeof onCreate === 'function',
    hasOnClose: typeof onClose === 'function',
    usuariosCount: usuariosDisponibles?.length || 0
  });

  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    numero_chasis: '',
    numero_motor: '',
    color: '',
    cilindrada: '',
    kilometraje: '',
    propietario: '',
    activo: true,
  });

  const [formErrors, setFormErrors] = useState({});

  // Función para limpiar el formulario
  const resetForm = useCallback(() => {
    setFormData({
      marca: '',
      modelo: '',
      año: '',
      placa: '',
      numero_chasis: '',
      numero_motor: '',
      color: '',
      cilindrada: '',
      kilometraje: '',
      propietario: '',
      activo: true,
    });
    setFormErrors({});
  }, []);

  // Limpiar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.marca.trim()) {
      errors.marca = 'La marca es requerida';
    }
    if (!formData.modelo.trim()) {
      errors.modelo = 'El modelo es requerido';
    }
    if (!formData.año || parseInt(formData.año) < 1900 || parseInt(formData.año) > new Date().getFullYear() + 1) {
      errors.año = 'El año debe ser válido';
    }
    if (!formData.placa.trim()) {
      errors.placa = 'La placa es requerida';
    }
    if (!formData.numero_chasis.trim()) {
      errors.numero_chasis = 'El número de chasis es requerido';
    }
    if (!formData.numero_motor.trim()) {
      errors.numero_motor = 'El número de motor es requerido';
    }
    if (!formData.color.trim()) {
      errors.color = 'El color es requerido';
    }
    if (!formData.cilindrada || parseInt(formData.cilindrada) <= 0) {
      errors.cilindrada = 'La cilindrada debe ser mayor a 0';
    }
    if (!formData.kilometraje || parseInt(formData.kilometraje) < 0) {
      errors.kilometraje = 'El kilometraje no puede ser negativo';
    }
    if (!formData.propietario) {
      errors.propietario = 'El propietario es requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    console.log('🚀 Intentando enviar formulario...');
    console.log('📋 Datos del formulario:', formData);

    if (loading) {
      console.log('⏳ Ya está cargando, ignorando envío');
      return;
    }

    if (!validateForm()) {
      console.log('❌ Validación falló');
      return;
    }

    try {
      console.log('✅ Validación exitosa, llamando onCreate...');
      await onCreate(formData);
      console.log('🎉 onCreate completado exitosamente');
    } catch (err) {
      console.error('💥 Error al crear moto:', err);
    }
  }, [formData, loading, validateForm, onCreate]);

  // Si no está abierto, no renderizar nada
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nueva Moto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-1">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Propietario con búsqueda avanzada */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-green-500" />
              Propietario *
            </label>
            <PropietarioSearchSelect
              value={formData.propietario}
              onChange={handleChange}
              clientesDisponibles={usuariosDisponibles}
              error={!!formErrors.propietario}
              placeholder="Buscar por nombre, cédula o usuario..."
            />
            {formErrors.propietario && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.propietario}</p>
            )}
          </div>

          {/* Marca */}
          <div>
            <label htmlFor="marca" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faMotorcycle} className="mr-2 text-blue-500" />
              Marca *
            </label>
            <input
              type="text"
              name="marca"
              id="marca"
              value={formData.marca}
              onChange={handleChange}
              className={`mt-1 block w-full border ${formErrors.marca ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="Marca de la moto"
              maxLength="50"
            />
            {formErrors.marca && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.marca}</p>
            )}
          </div>

          {/* Modelo */}
          <div>
            <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faMotorcycle} className="mr-2 text-blue-500" />
              Modelo *
            </label>
            <input
              type="text"
              name="modelo"
              id="modelo"
              value={formData.modelo}
              onChange={handleChange}
              className={`mt-1 block w-full border ${formErrors.modelo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="Modelo de la moto"
              maxLength="50"
            />
            {formErrors.modelo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.modelo}</p>
            )}
          </div>

          {/* Año */}
          <div>
            <label htmlFor="año" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-orange-500" />
              Año *
            </label>
            <input
              type="number"
              name="año"
              id="año"
              value={formData.año}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear() + 1}
              className={`mt-1 block w-full border ${formErrors.año ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="Año de fabricación"
            />
            {formErrors.año && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.año}</p>
            )}
          </div>

          {/* Placa */}
          <div>
            <label htmlFor="placa" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faIdCard} className="mr-2 text-gray-500" />
              Placa *
            </label>
            <input
              type="text"
              name="placa"
              id="placa"
              value={formData.placa}
              onChange={handleChange}
              className={`mt-1 block w-full border ${formErrors.placa ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 uppercase`}
              placeholder="Ej. ABC-123"
              maxLength="10"
              style={{textTransform: 'uppercase'}}
            />
            {formErrors.placa && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.placa}</p>
            )}
          </div>

          {/* Número de Chasis */}
          <div>
            <label htmlFor="numero_chasis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faCogs} className="mr-2 text-purple-500" />
              Número de Chasis *
            </label>
            <input
              type="text"
              name="numero_chasis"
              id="numero_chasis"
              value={formData.numero_chasis}
              onChange={handleChange}
              className={`mt-1 block w-full border ${formErrors.numero_chasis ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 uppercase`}
              placeholder="Número de chasis"
              maxLength="50"
              style={{textTransform: 'uppercase'}}
            />
            {formErrors.numero_chasis && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.numero_chasis}</p>
            )}
          </div>

          {/* Número de Motor */}
          <div>
            <label htmlFor="numero_motor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faCogs} className="mr-2 text-purple-500" />
              Número de Motor *
            </label>
            <input
              type="text"
              name="numero_motor"
              id="numero_motor"
              value={formData.numero_motor}
              onChange={handleChange}
              className={`mt-1 block w-full border ${formErrors.numero_motor ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 uppercase`}
              placeholder="Número de motor"
              maxLength="50"
              style={{textTransform: 'uppercase'}}
            />
            {formErrors.numero_motor && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.numero_motor}</p>
            )}
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faPalette} className="mr-2 text-pink-500" />
              Color *
            </label>
            <input
              type="text"
              name="color"
              id="color"
              value={formData.color}
              onChange={handleChange}
              className={`mt-1 block w-full border ${formErrors.color ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="Color de la moto"
              maxLength="30"
            />
            {formErrors.color && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.color}</p>
            )}
          </div>

          {/* Cilindrada */}
          <div>
            <label htmlFor="cilindrada" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faCogs} className="mr-2 text-red-500" />
              Cilindrada (cc) *
            </label>
            <input
              type="number"
              name="cilindrada"
              id="cilindrada"
              value={formData.cilindrada}
              onChange={handleChange}
              min="1"
              className={`mt-1 block w-full border ${formErrors.cilindrada ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="Ej. 150"
            />
            {formErrors.cilindrada && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.cilindrada}</p>
            )}
          </div>

          {/* Kilometraje */}
          <div>
            <label htmlFor="kilometraje" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faRoad} className="mr-2 text-green-500" />
              Kilometraje (km) *
            </label>
            <input
              type="number"
              name="kilometraje"
              id="kilometraje"
              value={formData.kilometraje}
              onChange={handleChange}
              min="0"
              className={`mt-1 block w-full border ${formErrors.kilometraje ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="Kilometraje actual"
            />
            {formErrors.kilometraje && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.kilometraje}</p>
            )}
          </div>

          {/* Checkbox Activo */}
          <div className="md:col-span-2 flex items-center">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo" className="ml-2 text-gray-700 dark:text-gray-300">
              Moto Activa
            </label>
          </div>
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
                Registrando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Registrar Moto
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

MotoCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  usuariosDisponibles: PropTypes.array,
};

export default MotoCreateModal;