// src/modulos/servicios/api/categoria.js
import { categoriesAPI } from '../../../services/api'; // Ajusta la ruta según tu proyecto

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
      const response = await categoriesAPI.getAll(params);
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
      const response = await categoriesAPI.getById(id);
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
      const response = await categoriesAPI.create(categoriaData);
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
      const response = await categoriesAPI.update(id, categoriaData);
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
      const response = await categoriesAPI.delete(id);
      if (response.success) return response.status;
      throw new Error(response.error);
    } catch (error) {
      console.error('Error en deleteCategoria:', error);
      throw new Error(error.message || 'Error al eliminar categoría');
    }
  },
};
