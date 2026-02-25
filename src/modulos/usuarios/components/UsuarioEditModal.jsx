// Este componente define un modal para editar un usuario existente,
// incluyendo campos para datos de usuario y datos personales asociados.
// Incorpora validaciones de frontend y manejo de errores de backend.

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal'; // Importa el componente Modal genérico.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faUser, faEnvelope, faUserTag, faIdCard, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'; // Iconos para el botón de guardar/cargar.
import RolesCheckboxSelect from './RolesCheckboxSelect'; // Componente para seleccionar roles.

const UsuarioEditModal = ({ isOpen, onClose, onUpdate, currentUsuario = null, loading = false, apiError = null, rolesDisponibles }) => {
  // Estado para almacenar los datos del formulario.
  const [formData, setFormData] = useState({
    username: '',
    correo_electronico: '',
    is_active: true,
    is_staff: false,
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

  // useEffect: Carga los datos del usuario actual en el formulario cuando el modal se abre
  // o cuando el 'currentUsuario' o 'rolesDisponibles' cambian.
  useEffect(() => {
    if (isOpen && currentUsuario) {
      // Mapea los roles del usuario a objetos de rol completos,
      // manejando tanto IDs como objetos de rol.
      const userRolesAsObjects = currentUsuario.roles
        ? currentUsuario.roles.map(role => {
            // Si el rol ya es un objeto (viene del backend), usarlo directamente
            if (typeof role === 'object' && role.id) {
              return role;
            }
            // Si el rol es un ID (número), buscar en rolesDisponibles
            if (typeof role === 'number') {
              return rolesDisponibles.find(r => r.id === role);
            }
            return null;
          }).filter(Boolean)
        : [];

      // Establece los datos del formulario con la información del 'currentUsuario'.
      setFormData({
        username: currentUsuario.username || '',
        correo_electronico: currentUsuario.correo_electronico || '',
        is_active: currentUsuario.is_active,
        is_staff: currentUsuario.is_staff,
        roles: userRolesAsObjects, // Asigna los roles como objetos.
        persona: currentUsuario.persona // Si el usuario tiene datos de persona, los carga.
          ? {
              nombre: currentUsuario.persona.nombre || '',
              apellido: currentUsuario.persona.apellido || '',
              cedula: currentUsuario.persona.cedula || '',
              telefono: currentUsuario.persona.telefono || '',
              direccion: currentUsuario.persona.direccion || '',
            }
          : { // Si no tiene datos de persona, inicializa los campos vacíos.
              nombre: '',
              apellido: '',
              cedula: '',
              telefono: '',
              direccion: '',
            },
      });
      setFormErrors({}); // Limpia los errores de validación del frontend.
      setBackendFieldErrors({}); // Limpia los errores de campo del backend al cargar un nuevo usuario.
    }
  }, [isOpen, currentUsuario, rolesDisponibles]); // Dependencias: se ejecuta cuando estas props cambian.

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

  // handlePersonaChange: Maneja los cambios en los campos de entrada de los datos personales.
  const handlePersonaChange = (e) => {
    const { name, value } = e.target; // Extrae el nombre y valor del input.

    // Capitalizar primera letra para nombre y apellido
    let processedValue = value;
    if (name === 'nombre' || name === 'apellido') {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    setFormData(prev => ({
      ...prev,
      persona: {
        ...prev.persona, // Mantiene los otros campos de persona.
        [name]: processedValue, // Actualiza el campo específico de persona.
      },
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
  const handleRolesChange = (selectedRoles) => {
    setFormData(prev => ({ ...prev, roles: selectedRoles })); // Actualiza el array de roles seleccionados.

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

    if (formData.roles.length === 0) {
      errors.roles = 'Debe seleccionar exactamente un rol.';
    } else if (formData.roles.length > 1) {
      errors.roles = 'Solo puede seleccionar un rol por usuario.';
    }

    // Validaciones de Persona (condicionales):
    const { nombre, apellido, cedula, telefono, direccion } = formData.persona;
    // Verifica si se ha ingresado algún dato en los campos de persona.
    const hasAnyPersonaField = [nombre, apellido, cedula, telefono, direccion].some(field => field && field.trim() !== '');

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
  // Realiza validaciones y llama a la función 'onUpdate' prop para enviar los datos a la API.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario.

    setBackendFieldErrors({}); // Limpia los errores de backend antes de una nueva validación/envío.

    // Realiza la validación del formulario en el frontend.
    if (!validateForm()) {
      return; // Detiene el envío si hay errores de frontend.
    }

    // Mapea los roles de objetos a solo sus IDs para enviarlos al backend.
    const rolesIds = formData.roles.map(role => role.id);

    // Construye el objeto con los datos de usuario a actualizar (SIN roles).
    const dataToUpdate = {
      username: formData.username,
      correo_electronico: formData.correo_electronico,
      is_active: formData.is_active,
      is_staff: formData.is_staff,
      // REMOVIDO: roles: rolesIds, - Los roles se manejarán por separado
    };

    // Solo añade los datos de persona si se ha ingresado alguno.
    const { nombre, apellido, cedula, telefono, direccion } = formData.persona;
    const hasAnyPersonaField = [nombre, apellido, cedula, telefono, direccion].some(field => field && field.trim() !== '');

    if (hasAnyPersonaField) {
      // Si hay datos de persona, los añade al objeto 'dataToUpdate'.
      dataToUpdate.persona_nombre = nombre || '';
      dataToUpdate.persona_apellido = apellido || '';
      dataToUpdate.persona_cedula = cedula || '';
      dataToUpdate.persona_telefono = telefono || '';
      dataToUpdate.persona_direccion = direccion || '';
    } else {
      // Si no hay datos de persona, y el usuario tenía una persona asociada,
      // la lógica para desasociarla o eliminarla dependerá de la API.
      // Por ahora, simplemente no se envían los campos de persona si están vacíos.
    }

    try {
      // Llama a la función 'onUpdate' pasada como prop para enviar los datos a la API.
      // Ahora incluye los roles como parámetro separado para manejo específico
      await onUpdate(currentUsuario.id, dataToUpdate, rolesIds);
      // Si 'onUpdate' tiene éxito, el modal se cerrará y los datos se refrescarán en la página principal.
    } catch (err) {
      // Los errores ya son manejados por el hook 'useUsuarios' y 'apiErrorHandlers.js'.
      // La prop 'apiError' se actualizará y este componente reaccionará a ello.
    }
  };

  // Evita renderizar el modal si no hay un usuario seleccionado para editar.
  if (!currentUsuario) return null;

  // getErrorMessage: Función auxiliar para obtener el mensaje de error de un campo.
  // Prioriza los errores de frontend, luego los de backend.
  const getErrorMessage = (fieldName) => {
    return formErrors[fieldName] || backendFieldErrors[fieldName];
  };

  return (
    // Renderiza el componente Modal genérico.
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Usuario: ${currentUsuario.username}`}>
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
        </div>

        {/* Separador para Datos Personales */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Datos Personales (Opcional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo: Nombre de Persona */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-green-500" />
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
                <FontAwesomeIcon icon={faUser} className="mr-2 text-green-500" />
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
            label="" // Etiqueta para la selección de roles.
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

        {/* Botones de acción (Cancelar y Guardar Cambios) */}
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
                Actualizando...
              </>
            ) : (
              // Muestra el icono y texto normal del botón.
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

// Definición de PropTypes para validar las propiedades del componente UsuarioEditModal.
UsuarioEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // 'isOpen' debe ser un booleano y es requerido.
  onClose: PropTypes.func.isRequired, // 'onClose' debe ser una función y es requerido.
  onUpdate: PropTypes.func.isRequired, // 'onUpdate' debe ser una función y es requerido.
  currentUsuario: PropTypes.object, // 'currentUsuario' debe ser un objeto (puede ser null).
  loading: PropTypes.bool, // 'loading' debe ser un booleano.
  apiError: PropTypes.object, // 'apiError' debe ser un objeto (puede ser null).
  rolesDisponibles: PropTypes.arrayOf( // 'rolesDisponibles' debe ser un array de objetos con:
    PropTypes.shape({
      id: PropTypes.number.isRequired, // 'id' debe ser un número y es requerido.
      nombre: PropTypes.string.isRequired, // 'nombre' debe ser un string y es requerido.
    })
  ).isRequired, // 'rolesDisponibles' es requerido.
};

export default UsuarioEditModal;
