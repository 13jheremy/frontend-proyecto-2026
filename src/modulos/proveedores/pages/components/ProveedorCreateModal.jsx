// src/modules/proveedores/components/ProveedorCreateModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faBuilding, faIdCard, faPhone, faEnvelope, faMapMarkerAlt, faUser } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal para crear un nuevo proveedor.
 */
const ProveedorCreateModal = ({ isOpen, onClose, onCreate, loading = false, apiError = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    telefono: '',
    correo: '',
    direccion: '',
    contacto_principal: '',
    activo: true,
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: '',
        nit: '',
        telefono: '',
        correo: '',
        direccion: '',
        contacto_principal: '',
        activo: true,
      });
      setFormErrors({});
    }
  }, [isOpen]);

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
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre del proveedor es requerido';
    }
    
    if (!formData.nit.trim()) {
      errors.nit = 'El NIT es requerido';
    }
    
    if (!formData.contacto_principal.trim()) {
      errors.contacto_principal = 'El contacto principal es requerido';
    }

    // Validación básica de correo electrónico
    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = 'El correo electrónico no es válido';
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
      await onCreate(formData);
      // onClose() se llama en el padre si onCreate es exitoso
    } catch (err) {
      // Los errores ya se manejan en el useEffect de apiError
      console.error('Error al crear proveedor en modal:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Proveedor">
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
              <FontAwesomeIcon icon={faBuilding} className="mr-2 text-blue-500" />
              Nombre del Proveedor *
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
              className={`mt-1 block w-full border ${formErrors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Ej. Distribuidora ABC S.R.L."
            />
            {formErrors.nombre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.nombre}</p>
            )}
          </div>

          {/* NIT */}
          <div>
            <label htmlFor="nit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faIdCard} className="mr-2 text-gray-500" />
              NIT *
            </label>
            <input
              type="text"
              name="nit"
              id="nit"
              value={formData.nit}
              onChange={handleChange}
              disabled={loading}
              className={`mt-1 block w-full border ${formErrors.nit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Ej. 1234567890"
            />
            {formErrors.nit && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.nit}</p>
            )}
          </div>

          {/* Contacto Principal */}
          <div>
            <label htmlFor="contacto_principal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-green-500" />
              Contacto Principal *
            </label>
            <input
              type="text"
              name="contacto_principal"
              id="contacto_principal"
              value={formData.contacto_principal}
              onChange={handleChange}
              disabled={loading}
              className={`mt-1 block w-full border ${formErrors.contacto_principal ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Ej. Juan Pérez"
            />
            {formErrors.contacto_principal && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.contacto_principal}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faPhone} className="mr-2 text-orange-500" />
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              id="telefono"
              value={formData.telefono}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
              placeholder="Ej. +591 70123456"
            />
            {formErrors.telefono && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.telefono}</p>
            )}
          </div>

          {/* Correo */}
          <div className="md:col-span-2">
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-purple-500" />
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              id="correo"
              value={formData.correo}
              onChange={handleChange}
              disabled={loading}
              className={`mt-1 block w-full border ${formErrors.correo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Ej. contacto@proveedor.com"
            />
            {formErrors.correo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.correo}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-red-500" />
              Dirección
            </label>
            <textarea
              name="direccion"
              id="direccion"
              rows="3"
              value={formData.direccion}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
              placeholder="Ej. Av. 6 de Agosto #1234, La Paz, Bolivia"
            />
            {formErrors.direccion && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.direccion}</p>
            )}
          </div>
        </div>

        {/* Checkbox Activo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
            disabled={loading}
            className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300">Proveedor Activo</span>
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
                Creando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Crear Proveedor
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

ProveedorCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  loading: PropTypes.bool,
  apiError: PropTypes.object,
};


export default ProveedorCreateModal;