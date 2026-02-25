import {apiClient} from './apiClient';

export const homeAPI = {
  /**
   * Obtiene los productos destacados desde el backend
   * @returns {Promise<Array>} Array de productos destacados
   */
  getProductosDestacados: async () => {
    try {
      const response = await apiClient.get('/productos/destacados/');
      
      // Extraer los productos del formato paginado
      const productos = response.data.results || response.data;
      
      return productos;
    } catch (error) {
      if (error.response) {
        // Error response data available for debugging if needed
      }
      
      throw new Error(`Error al cargar productos destacados: ${error.message}`);
    }
  }
};

export default homeAPI;