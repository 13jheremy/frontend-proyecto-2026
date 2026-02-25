// Este componente define un modal para crear un nuevo usuario, incluyendo
// campos para datos de usuario y datos personales asociados (opcional).
// Incorpora validaciones de frontend y manejo de errores de backend.

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal'; // Importa el componente Modal genérico.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSpinner, 
  faUser, 
  faEnvelope, 
  faLock, 
  faUserTag, 
  faIdCard, 
  faPhone, 
  faMapMarkerAlt,
  faEye,
  faEyeSlash 
} from '@fortawesome/free-solid-svg-icons'; // Iconos para el botón de crear/cargar y campos del formulario.
import RolesCheckboxSelect from './RolesCheckboxSelect'; // Componente para seleccionar roles.

const UsuarioCompleteCreateModal = ({ isOpen, onClose, onCreateComplete, loading, apiError, rolesDisponibles }) => {
  // Estado para almacenar los datos del formulario.
  const [formData, setFormData] = useState({
    username: '',
    correo_electronico: '',
    password: '',
    is_active: true, // Por defecto, el usuario está activo.
    is_staff: false, // Por defecto, no es administrador.
    roles: [], // Array para almacenar los objetos de rol seleccionados.
    persona: { // Objeto anidado para los datos personales.
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      direccion: '',
    },
  });

  // Estado para almacenar los errores de validación del formulario en el frontend.
  const [formErrors, setFormErrors] = useState({});
  // Estado para almacenar los errores específicos de campo devueltos por la API (backend).
  const [backendFieldErrors, setBackendFieldErrors] = useState({});
  // Estado para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);

  // useEffect: Se ejecuta cuando el modal se abre o se cierra.
  // Su propósito es limpiar el formulario y los errores al abrir o cerrar el modal.
  useEffect(() => {
    if (isOpen) {
      // Restablece el formulario a sus valores iniciales.
      setFormData({
        username: '',
        correo_electronico: '',
        password: '',
        is_active: true,
        is_staff: false,
        roles: [],
        persona: {
          nombre: '',
          apellido: '',
          cedula: '',
          telefono: '',
          direccion: '',
        },
      });
      setFormErrors({}); // Limpia los errores de validación del frontend.
      setBackendFieldErrors({}); // Limpia los errores de campo del backend.
      setShowPassword(false); // Resetea la visibilidad de la contraseña
    }
  }, [isOpen]); // Dependencia: se ejecuta cuando 'isOpen' cambia.

  // useEffect: Observa cambios en la prop 'apiError' para mostrar errores de backend.
  useEffect(() => {
    if (apiError && apiError.fieldErrors) {
      // Si hay errores de campo en 'apiError', los establece en 'backendFieldErrors'.
      setBackendFieldErrors(apiError.fieldErrors);
    } else {
      // Si no hay errores de campo, limpia 'backendFieldErrors'.
      setBackendFieldErrors({});
    }
  }, [apiError]); // Dependencia: se ejecuta cuando 'apiError' cambia.

  // handleChange: Maneja los cambios en los campos de entrada del formulario principal (usuario).
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target; // Extrae el nombre, valor, tipo y estado 'checked' del input.

    // Actualiza el estado 'formData' según el tipo de input (checkbox o texto).
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked // Para checkboxes, usa 'checked'.
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value // Para otros inputs, usa 'value'.
      }));
    }

    // Limpia el error de validación del frontend para el campo actual si existe.
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    // Limpia el error de backend para el campo actual si existe, cuando el usuario lo modifica.
    if (backendFieldErrors[name]) {
      setBackendFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // handlePersonaChange: Maneja los cambios en los campos de entrada del formulario de persona.
  const handlePersonaChange = (e) => {
    const { name, value } = e.target; // Extrae el nombre y valor del input.

    // Capitalizar primera letra para nombre y apellido
    let processedValue = value;
    if (name === 'nombre' || name === 'apellido') {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    // Actualiza el objeto 'persona' dentro de 'formData'.
    setFormData(prev => ({
      ...prev,
      persona: {
        ...prev.persona,
        [name]: processedValue // Actualiza el campo específico de 'persona'.
      }
    }));

    // Limpia el error de validación del frontend para el campo de persona actual.
    const personaField = `persona.${name}`; // Crea un identificador único para errores de persona.
    if (formErrors[personaField]) {
      setFormErrors(prev => ({
        ...prev,
        [personaField]: null
      }));
    }
    // Limpia el error de backend para el campo de persona actual.
    if (backendFieldErrors[personaField]) {
      setBackendFieldErrors(prev => ({
        ...prev,
        [personaField]: null
      }));
    }
  };

  // handleRolesChange: Maneja los cambios en la selección de roles.
  // Espera un array de objetos de rol seleccionados.
  const handleRolesChange = (newSelectedRoles) => {
    setFormData(prev => ({
      ...prev,
      roles: newSelectedRoles, // Actualiza el array de roles seleccionados.
    }));

    // Limpia los errores de validación de roles del frontend y backend.
    if (formErrors.roles) {
      setFormErrors(prev => ({
        ...prev,
        roles: null
      }));
    }
    if (backendFieldErrors.roles) {
      setBackendFieldErrors(prev => ({
        ...prev,
        roles: null
      }));
    }
  };

  /**
   * validateForm: Valida los campos del formulario en el frontend.
   * @returns {boolean} True si el formulario es válido, false en caso contrario.
   */
  const validateForm = () => {
    const errors = {}; // Objeto para almacenar los errores encontrados.

    // Validaciones de Usuario:
    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es requerido.';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres.';
    } else if (formData.username.trim().length > 50) {
      errors.username = 'El nombre de usuario no puede exceder los 50 caracteres.';
    }

    if (!formData.correo_electronico.trim()) {
      errors.correo_electronico = 'El correo electrónico es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
      errors.correo_electronico = 'El formato del correo electrónico es inválido.';
    }

    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida.';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (formData.password.length > 50) {
      errors.password = 'La contraseña no puede exceder los 50 caracteres.';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una letra minúscula.';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una letra mayúscula.';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos un número.';
    }

    if (formData.roles.length === 0) {
      errors.roles = 'Debe seleccionar exactamente un rol.';
    } else if (formData.roles.length > 1) {
      errors.roles = 'Solo puede seleccionar un rol por usuario.';
    }

    // Validaciones de Persona (condicionales):
    const { nombre, apellido, cedula, telefono, direccion } = formData.persona;
    // Verifica si se ha ingresado algún dato en los campos de persona.
    const hasAnyPersonaField = [nombre, apellido, cedula, telefono, direccion].some(field => field.trim() !== '');

    if (hasAnyPersonaField) {
      // Si se ingresó algún dato personal, los campos 'nombre' y 'apellido' son requeridos.
      if (!nombre.trim()) {
        errors['persona.nombre'] = 'El nombre de la persona es requerido si se ingresan otros datos personales.';
      }
      if (!apellido.trim()) {
        errors['persona.apellido'] = 'El apellido de la persona es requerido si se ingresan otros datos personales.';
      }
      // Valida que la cédula contenga solo números si se ha ingresado.
      if (cedula.trim() && !/^\d+$/.test(cedula.trim())) {
        errors['persona.cedula'] = 'La cédula debe contener solo números.';
      }
      // Se pueden añadir más validaciones para teléfono, dirección si son necesarias.
    }

    setFormErrors(errors); // Actualiza el estado de los errores del formulario.
    return Object.keys(errors).length === 0; // Retorna true si no hay errores.
  };

  // handleSubmit: Maneja el envío del formulario.
  // Realiza validaciones y llama a la función 'onCreateComplete' prop para enviar los datos a la API.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario.

    setBackendFieldErrors({}); // Limpia los errores de backend antes de una nueva validación/envío.

    // Realiza la validación del formulario en el frontend.
    if (!validateForm()) {
      return; // Detiene el envío si hay errores de frontend.
    }

    try {
      // Prepara los datos para el UsuarioPersonaCompleteSerializer de la API.
      const dataToCreate = {
        username: formData.username,
        correo_electronico: formData.correo_electronico,
        password: formData.password,
        is_active: formData.is_active,
        is_staff: formData.is_staff,
        roles: formData.roles.map(role => role.id), // Mapea los objetos de rol a solo sus IDs.
      };

      // Añade los datos de persona solo si se ha ingresado alguno.
      const { nombre, apellido, cedula, telefono, direccion } = formData.persona;
      const hasAnyPersonaField = [nombre, apellido, cedula, telefono, direccion].some(field => field.trim() !== '');

      if (hasAnyPersonaField) {
        // Si hay datos de persona, los añade al objeto 'dataToCreate'.
        dataToCreate.persona_nombre = nombre || '';
        dataToCreate.persona_apellido = apellido || '';
        dataToCreate.persona_cedula = cedula || '';
        dataToCreate.persona_telefono = telefono || '';
        dataToCreate.persona_direccion = direccion || '';
      }

      // Llama a la función 'onCreateComplete' pasada como prop para enviar los datos a la API.
      await onCreateComplete(dataToCreate);
      // Si 'onCreateComplete' tiene éxito, el modal se cerrará y los datos se refrescarán en la página principal.
    } catch (err) {
      // Los errores ya son manejados por el hook 'useUsuarios' y 'apiErrorHandlers.js'.
      // La prop 'apiError' se actualizará y este componente reaccionará a ello.
    }
  };

  // getErrorMessage: Función auxiliar para obtener el mensaje de error de un campo.
  // Prioriza los errores de frontend, luego los de backend.
  const getErrorMessage = (fieldName) => {
    return formErrors[fieldName] || backendFieldErrors[fieldName];
  };

  return (
    // Renderiza el componente Modal genérico.
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Usuario (con Persona)">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Muestra un error general de la API si existe y no está asociado a un campo específico. */}
        {apiError && apiError.message && !Object.keys(apiError.fieldErrors).length && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-1">{apiError.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo: Nombre de Usuario */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
              Nombre de Usuario *
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className={`mt-1 block w-full border ${getErrorMessage('username') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="john.doe"
              disabled={loading} // Deshabilita el input si está cargando.
            />
            {getErrorMessage('username') && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getErrorMessage('username')}</p>
            )}
          </div>

          {/* Campo: Correo Electrónico */}
          <div>
            <label htmlFor="correo_electronico" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-purple-500" />
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="correo_electronico"
              id="correo_electronico"
              value={formData.correo_electronico}
              onChange={handleChange}
              className={`mt-1 block w-full border ${getErrorMessage('correo_electronico') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="john.doe@example.com"
              disabled={loading}
            />
            {getErrorMessage('correo_electronico') && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getErrorMessage('correo_electronico')}</p>
            )}
          </div>

          {/* Campo: Contraseña */}
          <div className="md:col-span-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FontAwesomeIcon icon={faLock} className="mr-2 text-red-500" />
              Contraseña *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full border ${getErrorMessage('password') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                placeholder="Mínimo 8 caracteres, mayúscula, minúscula, número"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                disabled={loading}
              >
                <FontAwesomeIcon 
                  icon={showPassword ? faEyeSlash : faEye} 
                  className="h-4 w-4" 
                />
              </button>
            </div>
            {getErrorMessage('password') && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getErrorMessage('password')}</p>
            )}
          </div>
        </div>

        {/* Separador para Datos Personales */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Datos Personales (Opcional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo: Nombre de Persona */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                value={formData.persona.nombre}
                onChange={handlePersonaChange}
                className={`mt-1 block w-full border ${getErrorMessage('persona.nombre') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                placeholder="Juan"
                disabled={loading}
              />
              {getErrorMessage('persona.nombre') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getErrorMessage('persona.nombre')}</p>
              )}
            </div>

            {/* Campo: Apellido de Persona */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                id="apellido"
                value={formData.persona.apellido}
                onChange={handlePersonaChange}
                className={`mt-1 block w-full border ${getErrorMessage('persona.apellido') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                placeholder="Pérez"
                disabled={loading}
              />
              {getErrorMessage('persona.apellido') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getErrorMessage('persona.apellido')}</p>
              )}
            </div>

            {/* Campo: Cédula de Persona */}
            <div>
              <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FontAwesomeIcon icon={faIdCard} className="mr-2 text-gray-500" />
                Cédula
              </label>
              <input
                type="text"
                name="cedula"
                id="cedula"
                value={formData.persona.cedula}
                onChange={handlePersonaChange}
                className={`mt-1 block w-full border ${getErrorMessage('persona.cedula') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                placeholder="12345678"
                disabled={loading}
              />
              {getErrorMessage('persona.cedula') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getErrorMessage('persona.cedula')}</p>
              )}
            </div>

            {/* Campo: Teléfono de Persona */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FontAwesomeIcon icon={faPhone} className="mr-2 text-orange-500" />
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                id="telefono"
                value={formData.persona.telefono}
                onChange={handlePersonaChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="70123456"
                disabled={loading}
              />
            </div>

            {/* Campo: Dirección de Persona */}
            <div className="md:col-span-2">
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-red-500" />
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                id="direccion"
                value={formData.persona.direccion}
                onChange={handlePersonaChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Av. Principal #123"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Sección de Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <FontAwesomeIcon icon={faUserTag} className="mr-2 text-green-500" />
            Roles *
          </label>
          <RolesCheckboxSelect
            label="" // La etiqueta se maneja fuera del componente RolesCheckboxSelect en este caso.
            rolesDisponibles={rolesDisponibles} // Roles que se pueden seleccionar.
            selectedRoles={formData.roles} // Roles actualmente seleccionados.
            onChange={handleRolesChange} // Función para manejar cambios en la selección de roles.
            disabled={loading} // Deshabilita la selección de roles si está cargando.
          />
          {getErrorMessage('roles') && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getErrorMessage('roles')}</p>
          )}
        </div>

        {/* Checkboxes para 'Es Administrador' y 'Usuario Activo' */}
        <div className="flex items-center space-x-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="is_staff"
              checked={formData.is_staff}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Es Administrador</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Usuario Activo</span>
          </label>
        </div>

        {/* Botones de acción (Cancelar y Crear Usuario Completo) */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose} // Cierra el modal al hacer clic.
            disabled={loading} // Deshabilita el botón si está cargando.
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading} // Deshabilita el botón si está cargando.
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              // Muestra un spinner y texto de carga si está cargando.
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Creando...
              </>
            ) : (
              // Muestra el icono y texto normal del botón.
              <>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Crear Usuario Completo
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Definición de PropTypes para validar las propiedades del componente UsuarioCompleteCreateModal.
UsuarioCompleteCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // 'isOpen' debe ser un booleano y es requerido.
  onClose: PropTypes.func.isRequired, // 'onClose' debe ser una función y es requerido.
  onCreateComplete: PropTypes.func.isRequired, // 'onCreateComplete' debe ser una función y es requerido.
  loading: PropTypes.bool.isRequired, // 'loading' debe ser un booleano y es requerido.
  apiError: PropTypes.object, // 'apiError' debe ser un objeto (puede ser null).
  rolesDisponibles: PropTypes.arrayOf( // 'rolesDisponibles' debe ser un array de objetos con:
    PropTypes.shape({
      id: PropTypes.number.isRequired, // 'id' debe ser un número y es requerido.
      nombre: PropTypes.string.isRequired, // 'nombre' debe ser un string y es requerido.
    })
  ).isRequired, // 'rolesDisponibles' es requerido.
};

export default UsuarioCompleteCreateModal;
