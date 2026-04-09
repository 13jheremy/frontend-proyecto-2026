// src/modulos/categorias-servicios/api/categoria.js
import { serviceCategoriesAPI } from '../../../services/api';

/**
 * @module CategoriaServicioAPI
 * @description Módulo para interactuar con la API de gestión de categorías de servicios.
 */
export const categoriaApi = {
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

  /**
   * Verifica las relaciones de la categoría de servicio antes de eliminar/desactivar.
   * @param {string} id - ID de la categoría de servicio.
   * @returns {Promise<object>} - Promesa que resuelve con la información de relaciones.
   */
  verificarRelaciones: async (id) => {
    try {
      const response = await serviceCategoriesAPI.verificarRelaciones(id);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en verificarRelaciones:', error);
      throw new Error(error.message || 'Error al verificar relaciones');
    }
  },

  /**
   * Alternar estado activo/inactivo de categoría de servicio.
   * @param {string} id - ID de la categoría de servicio.
   * @returns {Promise<object>} - Promesa que resuelve con los datos de la categoría actualizada.
   */
  toggleActive: async (id) => {
    try {
      const response = await serviceCategoriesAPI.toggleActive(id);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en toggleActive:', error);
      if (error.response) {
        throw error;
      }
      throw new Error(error.message || 'Error al cambiar estado de categoría de servicio');
    }
  },

  /**
   * Eliminar categoría de servicio temporalmente (soft delete).
   * @param {string} id - ID de la categoría de servicio.
   * @returns {Promise<object>} - Promesa que resuelve con la respuesta.
   */
  softDelete: async (id) => {
    try {
      const response = await serviceCategoriesAPI.softDelete(id);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en softDelete:', error);
      if (error.response) {
        throw error;
      }
      throw new Error(error.message || 'Error al eliminar categoría de servicio');
    }
  },

  /**
   * Restaurar categoría de servicio eliminada.
   * @param {string} id - ID de la categoría de servicio.
   * @returns {Promise<object>} - Promesa que resuelve con los datos de la categoría restaurada.
   */
  restore: async (id) => {
    try {
      const response = await serviceCategoriesAPI.restore(id);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en restore:', error);
      if (error.response) {
        throw error;
      }
      throw new Error(error.message || 'Error al restaurar categoría de servicio');
    }
  },

  /**
   * Alternar estado activo/inactivo de categoría de servicio.
   */
  toggleActive: async (id) => {
    try {
      const response = await serviceCategoriesAPI.toggleActive(id);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en toggleActive:', error);
      throw new Error(error.message || 'Error al cambiar estado');
    }
  },

  /**
   * Eliminar categoría de servicio temporalmente (soft delete).
   */
  softDelete: async (id) => {
    try {
      const response = await serviceCategoriesAPI.softDelete(id);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en softDelete:', error);
      throw new Error(error.message || 'Error al eliminar');
    }
  },

  /**
   * Restaurar categoría de servicio eliminada.
   */
  restore: async (id) => {
    try {
      const response = await serviceCategoriesAPI.restore(id);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en restore:', error);
      throw new Error(error.message || 'Error al restaurar');
    }
  },

  /**
   * Eliminar categoría de servicio permanentemente.
   */
  hardDelete: async (id) => {
    try {
      const response = await serviceCategoriesAPI.hardDelete(id);
      if (response.success) return response.status;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en hardDelete:', error);
      throw new Error(error.message || 'Error al eliminar permanentemente');
    }
  },

  /**
   * Obtener estadísticas de servicios de categoría.
   */
  getStats: async () => {
    try {
      const response = await serviceCategoriesAPI.getStats();
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en getStats:', error);
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  },
};
