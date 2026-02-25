// Este archivo contiene una utilidad para manejar y formatear errores de la API,
// especialmente aquellos que provienen de respuestas HTTP (como Axios).

/**
 * Maneja los errores de la API, extrayendo mensajes legibles y errores de campo específicos.
 * @param {object} err - El objeto de error capturado (ej. de un bloque catch de una llamada Axios).
 * @returns {object} Un objeto con el estado HTTP, un mensaje de error consolidado,
 *                   los datos de error originales y un objeto de errores por campo.
 */
export const handleApiError = (err) => {
  // Verifica si el error tiene una respuesta HTTP (típico de errores de Axios).
  if (err.response) {
    const { status, data } = err.response; // Extrae el estado HTTP y los datos de la respuesta.
    let message = `Error ${status}`; // Mensaje de error por defecto con el estado HTTP.
    let fieldErrors = {}; // Objeto para almacenar errores específicos por campo.

    // Si hay datos en la respuesta (ej. cuerpo de la respuesta JSON con errores).
    if (data) {
      // Si los datos son un objeto (esperado para errores de validación o generales de la API).
      if (typeof data === 'object') {
        const nonFieldErrors = []; // Array para errores no asociados a un campo específico.
        const specificFieldErrors = {}; // Objeto para errores asociados a campos específicos.

        // Itera sobre las propiedades del objeto de datos para identificar los tipos de errores.
        for (const key in data) {
          // Asegura que la propiedad pertenece al objeto y no a su prototipo.
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const errors = data[key]; // Obtiene los errores asociados a la clave actual.

            // Si la clave es 'non_field_errors' o si es un array de strings directamente,
            // se considera un error no de campo.
            if (key === 'non_field_errors' || (Array.isArray(errors) && errors.every(e => typeof e === 'string'))) {
              nonFieldErrors.push(...(Array.isArray(errors) ? errors : [errors]));
            } else if (typeof errors === 'string' || Array.isArray(errors)) {
              // Si es un string o un array de strings, se considera un error de campo específico.
              specificFieldErrors[key] = Array.isArray(errors) ? errors.join(', ') : errors;
            } else {
              // Para otros formatos de error inesperados, se convierten a string JSON.
              specificFieldErrors[key] = JSON.stringify(errors);
            }
          }
        }

        // Si hay errores no de campo, se usan como el mensaje principal.
        if (nonFieldErrors.length > 0) {
          message = nonFieldErrors.join(' | ');
        } else if (Object.keys(specificFieldErrors).length > 0) {
          // Si solo hay errores de campo, se construye un mensaje general a partir de ellos.
          message = Object.entries(specificFieldErrors)
            .map(([field, errMsgs]) => `${field}: ${errMsgs}`)
            .join(' | ');
        } else {
          // Si el objeto de datos no tiene el formato esperado, se convierte a string.
          message = JSON.stringify(data);
        }

        fieldErrors = specificFieldErrors; // Almacena los errores de campo para uso específico.
      } else {
        // Si los datos son un string simple (ej. "Not Found"), se usa directamente como mensaje.
        message = data.toString();
      }
    }

    // Retorna un objeto con la información del error procesada.
    return { status, message, data, fieldErrors };
  } else if (err.request) {
    // Si la solicitud fue hecha pero no se recibió respuesta (ej. problema de red).
    return {
      status: null,
      message: 'No se recibió respuesta del servidor. Verifica tu conexión a internet.',
      data: null,
      fieldErrors: {}
    };
  } else {
    // Si algo más causó el error (ej. error en la configuración de Axios o en el código).
    return {
      status: null,
      message: err.message || 'Ocurrió un error inesperado.',
      data: null,
      fieldErrors: {}
    };
  }
};
