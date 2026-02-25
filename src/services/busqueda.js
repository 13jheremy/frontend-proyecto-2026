import api from './api';

/**
 * Buscar motos por múltiples criterios
 * @param {string} query - Término de búsqueda
 * @returns {Promise} - Respuesta con resultados de motos
 */
export const buscarMotos = async (query) => {
  try {
    const response = await api.get('/pos/motos/buscar/', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Buscar productos por múltiples criterios
 * @param {string} query - Término de búsqueda
 * @returns {Promise} - Respuesta con resultados de productos
 */
export const buscarProductos = async (query) => {
  try {
    const response = await api.get('/buscar/productos/', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Buscar servicios por múltiples criterios
 * @param {string} query - Término de búsqueda
 * @returns {Promise} - Respuesta con resultados de servicios
 */
export const buscarServicios = async (query) => {
  try {
    const response = await api.get('/buscar/servicios/', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
