// src/modulos/mantenimiento/utils/apiErrorHandlers.js

/**
 * @module ApiErrorHandlers
 * @description Manejadores de errores para las APIs del módulo de mantenimientos
 */

/**
 * Maneja errores de la API de mantenimientos
 * @param {object} error - Error de la API
 * @returns {object} Objeto con información del error procesado
 */
export const handleApiError = (error) => {
  console.error('Error en API de mantenimientos:', error);

  // Error de red
  if (!error.response) {
    return {
      message: 'Error de conexión. Verifica tu conexión a internet.',
      type: 'network',
      status: null
    };
  }

  const { response } = error;
  const { status, data } = response;

  // Errores específicos por código de estado
  switch (status) {
    case 400:
      return {
        message: data.detail || data.message || 'Datos inválidos. Verifica la información ingresada.',
        type: 'validation',
        status: 400,
        errors: data.errors || {}
      };

    case 401:
      return {
        message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
        type: 'auth',
        status: 401
      };

    case 403:
      return {
        message: 'No tienes permisos para realizar esta acción.',
        type: 'permission',
        status: 403
      };

    case 404:
      return {
        message: 'El recurso solicitado no fue encontrado.',
        type: 'not_found',
        status: 404
      };

    case 409:
      return {
        message: data.detail || 'Conflicto de datos. El recurso ya existe o hay un conflicto.',
        type: 'conflict',
        status: 409
      };

    case 422:
      return {
        message: 'Datos inválidos. Verifica la información enviada.',
        type: 'validation',
        status: 422,
        errors: data.errors || {}
      };

    case 500:
      return {
        message: 'Error interno del servidor. Inténtalo más tarde.',
        type: 'server',
        status: 500
      };

    default:
      return {
        message: data.detail || data.message || `Error inesperado (${status})`,
        type: 'unknown',
        status
      };
  }
};

/**
 * Maneja errores específicos de mantenimientos
 * @param {object} error - Error específico
 * @returns {object} Error procesado
 */
export const handleMantenimientoError = (error) => {
  const baseError = handleApiError(error);

  // Errores específicos de mantenimientos
  if (baseError.type === 'validation' && baseError.errors) {
    const fieldErrors = baseError.errors;

    // Errores específicos por campo
    if (fieldErrors.moto) {
      baseError.message = 'Debes seleccionar una moto válida.';
    } else if (fieldErrors.fecha_ingreso) {
      baseError.message = 'La fecha de ingreso es requerida y debe ser válida.';
    } else if (fieldErrors.descripcion_problema) {
      baseError.message = 'La descripción del problema es requerida.';
    } else if (fieldErrors.kilometraje_ingreso) {
      baseError.message = 'El kilometraje debe ser un número positivo.';
    }
  }

  return baseError;
};

/**
 * Maneja errores específicos de detalles de mantenimiento
 * @param {object} error - Error específico
 * @returns {object} Error procesado
 */
export const handleDetalleMantenimientoError = (error) => {
  const baseError = handleApiError(error);

  if (baseError.type === 'validation' && baseError.errors) {
    const fieldErrors = baseError.errors;

    if (fieldErrors.servicio) {
      baseError.message = 'Debes seleccionar un servicio válido.';
    } else if (fieldErrors.precio) {
      baseError.message = 'El precio debe ser un número positivo.';
    } else if (fieldErrors.mantenimiento) {
      baseError.message = 'El mantenimiento asociado es inválido.';
    }
  }

  return baseError;
};

/**
 * Maneja errores específicos de recordatorios de mantenimiento
 * @param {object} error - Error específico
 * @returns {object} Error procesado
 */
export const handleRecordatorioMantenimientoError = (error) => {
  const baseError = handleApiError(error);

  if (baseError.type === 'validation' && baseError.errors) {
    const fieldErrors = baseError.errors;

    if (fieldErrors.moto) {
      baseError.message = 'Debes seleccionar una moto válida.';
    } else if (fieldErrors.categoria_servicio) {
      baseError.message = 'Debes seleccionar una categoría de servicio válida.';
    } else if (fieldErrors.fecha_programada) {
      baseError.message = 'La fecha programada es requerida y debe ser futura.';
    }
  }

  return baseError;
};

/**
 * Determina si un error es recuperable
 * @param {object} error - Error procesado
 * @returns {boolean} True si es recuperable
 */
export const isRecoverableError = (error) => {
  const recoverableStatuses = [400, 409, 422];
  return recoverableStatuses.includes(error.status);
};

/**
 * Obtiene el mensaje de error para mostrar al usuario
 * @param {object} error - Error procesado
 * @returns {string} Mensaje para el usuario
 */
export const getUserFriendlyErrorMessage = (error) => {
  switch (error.type) {
    case 'network':
      return 'Problema de conexión. Verifica tu internet e intenta nuevamente.';
    case 'auth':
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    case 'permission':
      return 'No tienes permisos para realizar esta acción.';
    case 'validation':
      return error.message || 'Los datos ingresados no son válidos.';
    case 'server':
      return 'Error del servidor. Inténtalo más tarde.';
    case 'not_found':
      return 'El elemento que buscas no existe.';
    case 'conflict':
      return 'Hay un conflicto con los datos existentes.';
    default:
      return 'Ha ocurrido un error inesperado. Inténtalo nuevamente.';
  }
};