// src/modules/proveedores/components/ProveedorCreateModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faBuilding, faIdCard, faPhone, faEnvelope, faMapMarkerAlt, faUser } from '@fortawesome/free-solid-svg-icons';

// Constantes de validación
const VALIDATION = {
  NOMBRE_MIN: 2,
  NOMBRE_MAX: 200,
  NIT_MIN: 3,
  NIT_MAX: 20,
  CONTACTO_MIN: 2,
  CONTACTO_MAX: 100,
  TELEFONO_MAX: 20,
  CORREO_MAX: 100,
  DIRECCION_MAX: 300,
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nombreInputRef = useRef(null);

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
      setIsSubmitting(false);
      // Enfocar el campo nombre al abrir
      setTimeout(() => {
        if (nombreInputRef.current) {
          nombreInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Actualizar errores de formulario si apiError cambia
  useEffect(() => {
    if (apiError && apiError.fieldErrors) {
      setFormErrors(prev => ({
        ...prev,
        ...apiError.fieldErrors,
      }));
    }
  }, [apiError]);

  // Sanitizar texto
  const sanitizeText = (text) => {
    return text.replace(/\s+/g, ' ').trim();
  };

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

  // Validar un campo individual
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre': {
        const trimmed = sanitizeText(value);
        if (!trimmed) return 'El nombre del proveedor es requerido';
        if (trimmed.length < VALIDATION.NOMBRE_MIN) return `El nombre debe tener al menos ${VALIDATION.NOMBRE_MIN} caracteres`;
        if (trimmed.length > VALIDATION.NOMBRE_MAX) return `El nombre no puede exceder ${VALIDATION.NOMBRE_MAX} caracteres`;
        if (/[<>{}[\]\\]/.test(trimmed)) return 'El nombre contiene caracteres no permitidos';
        return null;
      }
      case 'nit': {
        const trimmed = sanitizeText(value);
        if (!trimmed) return 'El NIT es requerido';
        if (trimmed.length < VALIDATION.NIT_MIN) return `El NIT debe tener al menos ${VALIDATION.NIT_MIN} caracteres`;
        if (trimmed.length > VALIDATION.NIT_MAX) return `El NIT no puede exceder ${VALIDATION.NIT_MAX} caracteres`;
        if (!/^[a-zA-Z0-9\-]+$/.test(trimmed)) return 'El NIT solo puede contener letras, números y guiones';
        return null;
      }
      case 'contacto_principal': {
        const trimmed = sanitizeText(value);
        if (!trimmed) return 'El contacto principal es requerido';
        if (trimmed.length < VALIDATION.CONTACTO_MIN) return `El contacto debe tener al menos ${VALIDATION.CONTACTO_MIN} caracteres`;
        if (trimmed.length > VALIDATION.CONTACTO_MAX) return `El contacto no puede exceder ${VALIDATION.CONTACTO_MAX} caracteres`;
        return null;
      }
      case 'telefono': {
        const trimmed = sanitizeText(value);
        if (trimmed && trimmed.length > VALIDATION.TELEFONO_MAX) return `El teléfono no puede exceder ${VALIDATION.TELEFONO_MAX} caracteres`;
        if (trimmed && !/^[+\d\s\-()]+$/.test(trimmed)) return 'El teléfono solo puede contener números, +, -, (), y espacios';
        return null;
      }
      case 'correo': {
        const trimmed = sanitizeText(value);
        if (trimmed && trimmed.length > VALIDATION.CORREO_MAX) return `El correo no puede exceder ${VALIDATION.CORREO_MAX} caracteres`;
        if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'El correo electrónico no es válido';
        return null;
      }
      case 'direccion': {
        const trimmed = sanitizeText(value);
        if (trimmed && trimmed.length > VALIDATION.DIRECCION_MAX) return `La dirección no puede exceder ${VALIDATION.DIRECCION_MAX} caracteres`;
        return null;
      }
      default:
        return null;
    }
  };

  // Validar al salir del campo (onBlur)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    const fields = ['nombre', 'nit', 'contacto_principal', 'telefono', 'correo', 'direccion'];
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });
    
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

    // Sanitizar datos antes de enviar
    const dataToSubmit = {
      nombre: sanitizeText(formData.nombre),
      nit: sanitizeText(formData.nit),
      telefono: sanitizeText(formData.telefono),
      correo: sanitizeText(formData.correo).toLowerCase(),
      direccion: sanitizeText(formData.direccion),
      contacto_principal: sanitizeText(formData.contacto_principal),
      activo: formData.activo,
    };

    try {
      await onCreate(dataToSubmit);
    } catch (err) {
      console.error('Error al crear proveedor en modal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contadores de caracteres
  const nombreLength = formData.nombre.length;
  const direccionLength = formData.direccion.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Proveedor">
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
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faBuilding} className="mr-2 text-blue-500" />
              Nombre del Proveedor *
            </label>
            <input
              ref={nombreInputRef}
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              maxLength={VALIDATION.NOMBRE_MAX}
              className={`mt-1 block w-full border ${formErrors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Ej. Distribuidora ABC S.R.L."
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
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              maxLength={VALIDATION.NIT_MAX}
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
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              maxLength={VALIDATION.CONTACTO_MAX}
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
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              maxLength={VALIDATION.TELEFONO_MAX}
              className={`mt-1 block w-full border ${formErrors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
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
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              maxLength={VALIDATION.CORREO_MAX}
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
              onBlur={handleBlur}
              disabled={loading || isSubmitting}
              maxLength={VALIDATION.DIRECCION_MAX}
              className={`mt-1 block w-full border ${formErrors.direccion ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed`}
              placeholder="Ej. Av. 6 de Agosto #1234, La Paz, Bolivia"
            />
            <div className="flex justify-between mt-1">
              {formErrors.direccion ? (
                <p className="text-sm text-red-600 dark:text-red-400">{formErrors.direccion}</p>
              ) : (
                <span />
              )}
              <span className={`text-xs ${direccionLength > VALIDATION.DIRECCION_MAX * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
                {direccionLength}/{VALIDATION.DIRECCION_MAX}
              </span>
            </div>
          </div>
        </div>

        {/* Checkbox Activo */}
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
            <span className="ml-2 text-gray-700 dark:text-gray-300">Proveedor Activo</span>
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
  onCreate: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  apiError: PropTypes.object,
};

export default ProveedorCreateModal;