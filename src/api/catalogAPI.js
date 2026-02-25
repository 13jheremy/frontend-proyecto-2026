// src/api/catalogAPI.js
import api from '../services/api';

export const catalogAPI = {
  /**
   * Obtiene todos los productos desde el endpoint público
   * @returns {Promise<Array>} Array de productos
   */
  getAllProductos: async () => {
    try {
      const response = await api.get('/catalogo/productos/');
      
      // Extraer los productos del formato paginado
      const productos = response.data.results || response.data;
      
      return productos;
    } catch (error) {
      if (error.response) {
        // Error response data available for debugging if needed
      }
      
      throw new Error(`Error al cargar productos: ${error.message}`);
    }
  },

  /**
   * Obtiene todas las categorías disponibles (endpoint público)
   * @returns {Promise<Array>} Array de categorías
   */
  getCategorias: async () => {
    try {
      const response = await api.get('/catalogo/categorias/');
      
      const categorias = response.data.results || response.data;
      
      return categorias;
    } catch (error) {
      if (error.response) {
        // Error response data available for debugging if needed
      }
      
      throw new Error(`Error al cargar categorías: ${error.message}`);
    }
  },

  /**
   * Obtiene productos destacados (endpoint público)
   * @returns {Promise<Array>} Array de productos destacados
   */
  getProductosDestacados: async () => {
    try {
      const response = await api.get('/catalogo/destacados/');
      
      const productos = response.data.results || response.data;
      
      return productos;
    } catch (error) {
      if (error.response) {
        // Error response data available for debugging if needed
      }
      
      throw new Error(`Error al cargar productos destacados: ${error.message}`);
    }
  },

  /**
   * Filtra productos por categoría
   * @param {number} categoriaId - ID de la categoría
   * @returns {Promise<Array>} Array de productos filtrados
   */
  getProductosByCategoria: async (categoriaId) => {
    try {
      const response = await api.get(`/catalogo/productos/?categoria=${categoriaId}`);
      
      const productos = response.data.results || response.data;
      
      return productos;
    } catch (error) {
      if (error.response) {
        // Error response data available for debugging if needed
      }
      
      throw new Error(`Error al filtrar productos por categoría: ${error.message}`);
    }
  },

  /**
   * Busca productos por término de búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Array de productos que coinciden con la búsqueda
   */
  searchProductos: async (searchTerm) => {
    try {
      const response = await api.get(`/catalogo/productos/?search=${encodeURIComponent(searchTerm)}`);
      
      const productos = response.data.results || response.data;
      
      return productos;
    } catch (error) {
      if (error.response) {
        // Error response data available for debugging if needed
      }
      
      throw new Error(`Error al buscar productos: ${error.message}`);
    }
  },

  /**
   * Obtiene productos con filtros combinados
   * @param {Object} filters - Objeto con filtros
   * @param {number} filters.categoria - ID de categoría
   * @param {string} filters.search - Término de búsqueda
   * @param {string} filters.ordering - Campo para ordenar
   * @param {boolean} filters.destacados_only - Solo productos destacados
   * @param {boolean} filters.con_imagen - Solo productos con imagen
   * @param {number} filters.stock_min - Stock mínimo
   * @returns {Promise<Array>} Array de productos filtrados
   */
  getProductosConFiltros: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Filtros básicos
      if (filters.categoria && filters.categoria !== 'all') {
        params.append('categoria', filters.categoria);
      }
      
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      
      if (filters.ordering) {
        params.append('ordering', filters.ordering);
      }

      // Filtros adicionales
      if (filters.destacados_only) {
        params.append('destacados_only', 'true');
      }

      if (filters.con_imagen) {
        params.append('con_imagen', 'true');
      }

      if (filters.stock_min && filters.stock_min > 0) {
        params.append('stock__gte', filters.stock_min);
      }

      // Filtro por destacados
      if (filters.destacado !== undefined) {
        params.append('destacado', filters.destacado ? 'true' : 'false');
      }
      
      const queryString = params.toString();
      const url = `/catalogo/productos/${queryString ? '?' + queryString : ''}`;
      
      const response = await api.get(url);
      
      const productos = response.data.results || response.data;
      
      return productos;
    } catch (error) {
      if (error.response) {
        // Error response data available for debugging if needed
      }
      
      throw new Error(`Error al obtener productos con filtros: ${error.message}`);
    }
  },

  /**
   * Obtiene un producto específico por ID
   * @param {number} productId - ID del producto
   * @returns {Promise<Object>} Datos del producto
   */
  getProducto: async (productId) => {
    try {
      // Como es una lista pública, obtenemos todos y filtramos localmente
      // O puedes crear un endpoint específico para un producto
      const response = await api.get(`/catalogo/productos/?search=id:${productId}`);
      
      const productos = response.data.results || response.data;
      const producto = productos.find(p => p.id === parseInt(productId));
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      
      return producto;
    } catch (error) {
      if (error.response) {
        // Error response data available for debugging if needed
      }
      
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }
};

export default catalogAPI;