// src/modulos/pos/components/CreateClientModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faIdCard, faPhone, faMapMarkerAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useClientes } from '../hooks/useClientes';

const CreateClientModal = ({ isOpen, onClose, onClientCreated, initialName = '' }) => {
  const [formData, setFormData] = useState({
    nombre: initialName,
    apellido: '',
    cedula: '',
    telefono: '',
    direccion: ''
  });
  const [errors, setErrors] = useState({});
  const { crearClienteRapido, loading } = useClientes();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: initialName,
        apellido: '',
        cedula: '',
        telefono: '',
        direccion: ''
      });
      setErrors({});
    }
  }, [isOpen, initialName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }
    
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    } else if (formData.cedula.trim().length < 6) {
      newErrors.cedula = 'La cédula debe tener al menos 6 caracteres';
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (formData.telefono.trim().length < 7) {
      newErrors.telefono = 'El teléfono debe tener al menos 7 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const nuevoCliente = await crearClienteRapido({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        cedula: formData.cedula.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim()
      });

      onClientCreated(nuevoCliente);
      onClose();
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
            Crear Nuevo Cliente
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faUser} className="mr-1" />
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="Ingrese el nombre"
              disabled={loading}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faUser} className="mr-1" />
              Apellido *
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${errors.apellido ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="Ingrese el apellido"
              disabled={loading}
            />
            {errors.apellido && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.apellido}</p>
            )}
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faIdCard} className="mr-1" />
              Cédula *
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${errors.cedula ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="Ingrese la cédula"
              disabled={loading}
            />
            {errors.cedula && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cedula}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faPhone} className="mr-1" />
              Teléfono *
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${errors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="Ingrese el teléfono"
              disabled={loading}
            />
            {errors.telefono && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telefono}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
              Dirección
            </label>
            <textarea
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingrese la dirección (opcional)"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 
                       rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md 
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Cliente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientModal;
