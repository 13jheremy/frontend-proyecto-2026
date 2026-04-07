// utils/apiErrorHandlers.js

// Extract retry delay from throttle response
export const getRetryDelay = (error) => {
  if (error.response?.status === 429) {
    const data = error.response.data;
    if (data?.detail) {
      const match = data.detail.match(/(\d+)\s*segundos?/);
      if (match) {
        return parseInt(match[1]) * 1000; // Convert to milliseconds
      }
    }
    // Default retry delay for 429 errors
    return 30000; // 30 seconds
  }
  return null;
};

// Retry mechanism with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.response?.status === 404 || error.response?.status === 403) {
        throw error;
      }
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay
      let delay = baseDelay * Math.pow(2, attempt);
      
      // For 429 errors, use server-suggested delay
      if (error.response?.status === 429) {
        const serverDelay = getRetryDelay(error);
        if (serverDelay) {
          delay = Math.min(serverDelay, 60000); // Max 60 seconds
        }
      }
      
      console.log(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const handleApiError = (err) => {
  // Axios error con respuesta del servidor
  if (err.response) {
    const { status, data } = err.response;
    let message = `Error ${status}`;
    let fieldErrors = {};

    // Handle throttling errors more gracefully
    if (status === 429) {
      if (data?.detail) {
        const match = data.detail.match(/(\d+)\s*segundos?/);
        if (match) {
          message = `Servidor ocupado. Reintentando automáticamente en ${match[1]} segundos...`;
        } else {
          message = 'Servidor ocupado. Reintentando automáticamente...';
        }
      } else {
        message = 'Demasiadas solicitudes. Reintentando automáticamente...';
      }
    } else if (data) {
      // Para errores de validación tipo Django REST Framework
      if (typeof data === 'object') {
        // Don't show raw JSON for throttling errors
        if (status !== 429) {
          // Try to extract a readable message from Django errors
          const errorMessages = [];
          Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
              // Format array messages nicely
              const formattedMsg = data[key].join(', ');
              // Translate common Django validation messages
              let translatedMsg = formattedMsg;
              if (formattedMsg.toLowerCase().includes('already exists') || formattedMsg.toLowerCase().includes('ya existe')) {
                translatedMsg = `Ya existe un registro con este ${key.replace('_', ' ')}`;
              }
              errorMessages.push(translatedMsg);
            } else if (typeof data[key] === 'string') {
              errorMessages.push(`${key}: ${data[key]}`);
            }
          });
          
          if (errorMessages.length > 0) {
            message = errorMessages.join(' | ');
          } else {
            message = JSON.stringify(data, null, 2);
          }
        }
        // Extract field errors from the response data
        fieldErrors = data;
      } else {
        message = data.toString();
      }
    }

    // For 400 errors, don't show "Error 400" prefix - show the actual error message
    if (status === 400 && message.startsWith('Error 400')) {
      // Try to get a better message from fieldErrors
      const firstErrorKey = Object.keys(fieldErrors)[0];
      if (firstErrorKey && fieldErrors[firstErrorKey]) {
        const firstError = Array.isArray(fieldErrors[firstErrorKey]) 
          ? fieldErrors[firstErrorKey][0] 
          : fieldErrors[firstErrorKey];
        
        // Check for "ya existe" patterns and translate
        if (typeof firstError === 'string') {
          if (firstError.toLowerCase().includes('ya existe')) {
            message = firstError;
          } else if (firstError.toLowerCase().includes('already exists')) {
            const fieldName = firstErrorKey.replace(/_/g, ' ').replace('persona ', 'persona: ');
            message = `Ya existe un registro con este ${fieldName}`;
          } else {
            message = firstError;
          }
        }
      }
    }

    return {
      status,
      message,
      fieldErrors,
      data,
      isThrottled: status === 429,
      retryDelay: getRetryDelay(err)
    };
  } else if (err.request) {
    // La solicitud se hizo pero no hubo respuesta
    return {
      status: null,
      message: 'No se pudo conectar al servidor. Intenta nuevamente.',
      fieldErrors: {},
      data: null,
      isThrottled: false
    };
  } else {
    // Error al preparar la solicitud
    let message = err.message || 'Ocurrió un error inesperado.';

    if (err.code === 'ECONNABORTED' || message.toLowerCase().includes('timeout')) {
      message = 'No se pudo conectar al servidor. Intenta nuevamente.';
    }

    return {
      status: null,
      message,
      fieldErrors: {},
      data: null,
      isThrottled: false
    };
  }
};
