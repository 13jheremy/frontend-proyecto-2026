// src/modulos/categorias-servicios/api/categoria.js
import { serviceCategoriesAPI } from '../../../services/api';

/**
 * @module CategoriaAPI
 * @description Módulo para interactuar con la API de gestión de categorías de servicios.
 */
export const categoriaApi = {
  /**
   * Obtiene la lista de todas las categorías.
   * @param {object} params - Parámetros de consulta para filtrar y buscar categorías.
   * @returns {Promise<object>} - Promesa que resuelve con el objeto de respuesta paginado.
   */
  getCategorias: async (params = {}) => {
    try {
      const response = await serviceCategoriesAPI.getAll(params);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en getCategorias:', error);
      throw new Error(error.message || 'Error al obtener categorías');
    }
  },

  /**
   * Obtiene una categoría por su ID.
   * @param {string} id - ID de la categoría.
   * @returns {Promise<object>} - Promesa que resuelve con los datos de la categoría.
   */
  getCategoriaById: async (id) => {
    try {
      const response = await serviceCategoriesAPI.getById(id);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en getCategoriaById:', error);
      throw new Error(error.message || 'Error al obtener categoría');
    }
  },

  /**
   * Crea una nueva categoría.
   * @param {object} categoriaData - Datos de la nueva categoría.
   * @returns {Promise<object>} - Promesa que resuelve con los datos de la categoría creada.
   */
  createCategoria: async (categoriaData) => {
    try {
      const response = await serviceCategoriesAPI.create(categoriaData);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en createCategoria:', error);
      throw new Error(error.message || 'Error al crear categoría');
    }
  },

  /**
   * Actualiza una categoría existente.
   * @param {string} id - ID de la categoría a actualizar.
   * @param {object} categoriaData - Datos actualizados de la categoría.
   * @returns {Promise<object>} - Promesa que resuelve con los datos de la categoría actualizada.
   */
  updateCategoria: async (id, categoriaData) => {
    try {
      const response = await serviceCategoriesAPI.update(id, categoriaData);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en updateCategoria:', error);
      throw new Error(error.message || 'Error al actualizar categoría');
    }
  },

  /**
   * Elimina una categoría.
   * @param {string} id - ID de la categoría a eliminar.
   * @returns {Promise<number>} - Promesa que resuelve con el status code para indicar éxito.
   */
  deleteCategoria: async (id) => {
    try {
      const response = await serviceCategoriesAPI.delete(id);
      if (response.success) return response.status;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en deleteCategoria:', error);
      throw new Error(error.message || 'Error al eliminar categoría');
    }
  },

  /**
   * Alternar estado activo/inactivo de categoría.
   * @param {string} id - ID de la categoría.
   * @param {boolean} activo - Estado activo a establecer.
   * @returns {Promise<object>} - Promesa que resuelve con los datos de la categoría actualizada.
   */
  toggleActive: async (id, activo) => {
    try {
      const response = await serviceCategoriesAPI.toggleActive(id);
      if (response.success) return response.data;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en toggleActive:', error);
      if (error.response) {
        throw error;
      }
      throw new Error(error.message || 'Error al cambiar estado de categoría');
    }
  },

  /**
   * Eliminar categoría temporalmente (soft delete).
   * @param {string} id - ID de la categoría.
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
      throw new Error(error.message || 'Error al eliminar categoría');
    }
  },

  /**
   * Restaurar categoría eliminada.
   * @param {string} id - ID de la categoría.
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
      throw new Error(error.message || 'Error al restaurar categoría');
    }
  },

  /**
   * Eliminar categoría permanentemente.
   * @param {string} id - ID de la categoría.
   * @returns {Promise<number>} - Promesa que resuelve con el status code.
   */
  deletePermanent: async (id) => {
    try {
      const response = await serviceCategoriesAPI.deletePermanent(id);
      if (response.success) return response.status;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en deletePermanent:', error);
      throw new Error(error.message || 'Error al eliminar permanentemente categoría');
    }
  },

  /**
   * Obtener estadísticas de categorías.
   * @returns {Promise<object>} - Promesa que resuelve con las estadísticas.
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

  /**
   * Verifica las relaciones de la categoría antes de eliminar/desactivar.
   * @param {string} id - ID de la categoría.
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
};
