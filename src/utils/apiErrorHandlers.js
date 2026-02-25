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
          message = JSON.stringify(data, null, 2);
        }
      } else {
        message = data.toString();
      }
    }

    return {
      status,
      message,
      data,
      isThrottled: status === 429,
      retryDelay: getRetryDelay(err)
    };
  } else if (err.request) {
    // La solicitud se hizo pero no hubo respuesta
    return {
      status: null,
      message: 'No se recibió respuesta del servidor',
      data: null,
      isThrottled: false
    };
  } else {
    // Error al preparar la solicitud
    return {
      status: null,
      message: err.message,
      data: null,
      isThrottled: false
    };
  }
};
