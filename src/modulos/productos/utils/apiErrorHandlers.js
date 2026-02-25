// src/utils/apiErrorHandlers.js - CORREGIDO
/**
 * Maneja y normaliza los errores de la API - MEJORADO para roles y usuarios.
 * @param {object} error - El objeto de error capturado (ej. de Axios).
 * @returns {object} Un objeto de error normalizado con un mensaje, tipo y errores de campo.
 */
export const handleApiError = (error) => {
  console.error('API Error Completo:', error);

  if (error.response) {
    const { status, data } = error.response;
    let message = 'Error desconocido';
    let type = 'unknown';
    let fieldErrors = {}; // Objeto para almacenar errores de campo específicos

    // Función auxiliar recursiva para buscar el primer mensaje de error significativo
    const getErrorMessage = (obj, prefix = '') => {
      if (typeof obj === 'string') {
        return obj;
      }
      if (Array.isArray(obj) && obj.length > 0) {
        // Para arrays, tomar el primer mensaje válido
        const firstMessage = getErrorMessage(obj[0]);
        return firstMessage ? `${prefix}${firstMessage}` : null;
      }
      if (typeof obj === 'object' && obj !== null) {
        // Prioriza campos comunes de error
        const priorityFields = ['detail', 'non_field_errors', 'message', 'error'];
        
        for (const field of priorityFields) {
          if (obj[field]) {
            const errorMsg = getErrorMessage(obj[field], field === 'non_field_errors' ? '' : `${field}: `);
            if (errorMsg) return errorMsg;
          }
        }
        
        // Si no se encuentra en los prioritarios, busca en cualquier otro campo
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Si es un objeto o array, intenta extraer un mensaje
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              const errorMsg = getErrorMessage(obj[key], `${key}: `);
              if (errorMsg) return errorMsg;
            } else if (typeof obj[key] === 'string') {
              return obj[key]; // Retorna el primer string encontrado
            }
          }
        }
      }
      return null;
    };

    // Función para extraer errores de campo
    const extractFieldErrors = (data) => {
      const errors = {};
      if (typeof data === 'object' && data !== null) {
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (Array.isArray(data[key]) && typeof data[key][0] === 'string') {
              errors[key] = data[key][0]; // Toma el primer mensaje de error para el campo
            } else if (typeof data[key] === 'string') {
              errors[key] = data[key];
            } else if (typeof data[key] === 'object' && data[key] !== null) {
              // Recursivamente extrae errores de objetos anidados (ej. para campos de relaciones)
              const nestedErrors = extractFieldErrors(data[key]);
              if (Object.keys(nestedErrors).length > 0) {
                errors[key] = Object.values(nestedErrors).join(', '); // Combina mensajes de errores anidados
              }
            }
          }
        }
      }
      return errors;
    };

    // Extraer errores de campo si el status es 400 (Bad Request)
    if (status === 400) {
      fieldErrors = extractFieldErrors(data);
      // Si hay errores de campo, el mensaje general puede ser más genérico
      if (Object.keys(fieldErrors).length > 0) {
        message = 'Por favor, corrige los errores en el formulario.';
      }
    }

    // Prioriza mensajes de error específicos del backend si no se ha establecido un mensaje general
    if (!message || message === 'Error desconocido') {
      if (data.detail) {
        message = data.detail;
      } else if (data.non_field_errors) {
        if (Array.isArray(data.non_field_errors)) {
          message = data.non_field_errors.join(', ');
        } else {
          message = data.non_field_errors;
        }
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      } else {
        // Intenta extraer un mensaje de error detallado de cualquier nivel de anidación
        const detailedMessage = getErrorMessage(data);
        if (detailedMessage) {
          message = detailedMessage;
        } else if (typeof data === 'string') {
          message = data;
        } else {
          // Mensajes específicos para errores comunes de usuarios si no hay otro mensaje
          if (data.roles_ids || data.roles) {
            message = 'Error en la asignación de roles. Verifique los roles seleccionados.';
          } else if (data.persona) {
            message = 'Error en los datos de persona. Verifique la información personal.';
          } else if (data.correo_electronico) {
            message = 'Error en el correo electrónico. Verifique que sea válido y único.';
          } else if (data.username) {
            message = 'Error en el nombre de usuario. Verifique que sea único.';
          } else if (data.activo !== undefined) {
            message = 'Error al cambiar el estado activo. Verifique los datos.';
          } else if (data.eliminado !== undefined) {
            message = 'Error al cambiar el estado de eliminación. Verifique los datos.';
          } else {
            message = 'Datos inválidos. Por favor, revisa el formulario.';
          }
        }
      }
    }


    switch (status) {
      case 400:
        type = 'validation';
        // Mejorar mensaje para errores de validación específicos si no hay fieldErrors
        if (Object.keys(fieldErrors).length === 0) {
          if (message.includes('correo_electronico') || message.includes('email')) {
            message = 'El correo electrónico ya está en uso o no es válido.';
          } else if (message.includes('username')) {
            message = 'El nombre de usuario ya está en uso.';
          } else if (message.includes('cedula')) {
            message = 'La cédula ya está registrada o no es válida.';
          } else if (message.includes('roles') || message.includes('rol')) {
            message = 'Error en la asignación de roles. Verifique los roles seleccionados.';
          }
        }
        break;
      case 401:
        type = 'auth';
        message = 'No autorizado. Por favor, inicia sesión nuevamente.';
        break;
      case 403:
        type = 'permission';
        message = 'No tienes permisos para realizar esta acción.';
        break;
      case 404:
        type = 'notfound';
        message = 'Recurso no encontrado.';
        break;
      case 409: // Conflict
        type = 'conflict';
        message = message || 'Conflicto de datos. Es posible que el recurso ya exista.';
        break;
      case 500:
        type = 'server';
        message = 'Error interno del servidor. Por favor, intenta más tarde.';
        break;
      default:
        type = 'unknown';
        message = message || `Error del servidor con código ${status}.`;
    }
    
    return { message, type, fieldErrors, details: data }; // Retorna fieldErrors y details
  } else if (error.request) {
    return { 
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.', 
      type: 'network',
      fieldErrors: {}
    };
  } else {
    return { 
      message: error.message || 'Ocurrió un error inesperado.', 
      type: 'unknown',
      fieldErrors: {}
    };
  }
};
