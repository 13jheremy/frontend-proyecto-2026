// src/modulos/servicios/api/categoriaServicio.js
import { serviceCategoriesAPI } from '../../../services/api'; // Ajusta la ruta según tu proyecto

/**
 * @module CategoriaServicioAPI
 * @description Módulo para interactuar con la API de gestión de servicios dentro de categorías.
 */
export const categoriaServicioApi = {
  /**
   * Obtiene la lista de todos los servicios de categoría.
   * @param {object} params - Parámetros de consulta para filtrar y buscar servicios.
   * @returns {Promise<object>} - Promesa que resuelve con el objeto de respuesta paginado.
   */
  getCategoriaServicios: async (params = {}) => {
    try {
      const response = await serviceCategoriesAPI.getAll(params);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en getCategoriaServicios:', error);
      throw new Error(error.message || 'Error al obtener servicios de categoría');
    }
  },

  /**
   * Obtiene un servicio de categoría por su ID.
   * @param {string} id - ID del servicio de categoría.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del servicio.
   */
  getCategoriaServicioById: async (id) => {
    try {
      const response = await serviceCategoriesAPI.getById(id);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en getCategoriaServicioById:', error);
      throw new Error(error.message || 'Error al obtener servicio de categoría');
    }
  },

  /**
   * Crea un nuevo servicio de categoría.
   * @param {object} categoriaServicioData - Datos del nuevo servicio.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del servicio creado.
   */
  createCategoriaServicio: async (categoriaServicioData) => {
    try {
      const response = await serviceCategoriesAPI.create(categoriaServicioData);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en createCategoriaServicio:', error);
      throw new Error(error.message || 'Error al crear servicio de categoría');
    }
  },

  /**
   * Actualiza un servicio de categoría existente.
   * @param {string} id - ID del servicio a actualizar.
   * @param {object} categoriaServicioData - Datos actualizados del servicio.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del servicio actualizado.
   */
  updateCategoriaServicio: async (id, categoriaServicioData) => {
    try {
      const response = await serviceCategoriesAPI.update(id, categoriaServicioData);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en updateCategoriaServicio:', error);
      throw new Error(error.message || 'Error al actualizar servicio de categoría');
    }
  },

  /**
   * Elimina un servicio de categoría.
   * @param {string} id - ID del servicio a eliminar.
   * @returns {Promise<number>} - Promesa que resuelve con el status code para indicar éxito.
   */
  deleteCategoriaServicio: async (id) => {
    try {
      const response = await serviceCategoriesAPI.delete(id);
      if (response.success) return response.status;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en deleteCategoriaServicio:', error);
      throw new Error(error.message || 'Error al eliminar servicio de categoría');
    }
  },
};
