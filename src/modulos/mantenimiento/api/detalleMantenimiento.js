// src/modulos/mantenimiento/api/detalleMantenimiento.js
import { maintenanceDetailsAPI } from '../../../services/api';
import { handleMantenimientoError } from '../utils/apiErrorHandlers';

/**
 * @module DetalleMantenimientoAPI
 * @description Módulo para interactuar con la API de gestión de detalles de mantenimiento.
 */
export const detalleMantenimientoApi = {
  /**
   * Obtiene la lista de todos los detalles de mantenimiento.
   * @param {object} params - Parámetros de consulta para filtrar y buscar detalles.
   * @returns {Promise<object>} - Promesa que resuelve con el objeto de respuesta paginado.
   */
  getDetallesMantenimiento: async (params = {}) => {
    try {
      const response = await maintenanceDetailsAPI.getAll(params);
      return response;
    } catch (error) {
      console.error('Error en getDetallesMantenimiento:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Obtiene un detalle de mantenimiento por su ID.
   * @param {string} id - ID del detalle de mantenimiento.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del detalle.
   */
  getDetalleMantenimientoById: async (id) => {
    try {
      const response = await maintenanceDetailsAPI.getById(id);
      return response;
    } catch (error) {
      console.error('Error en getDetalleMantenimientoById:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Crea un nuevo detalle de mantenimiento.
   * @param {object} detalleData - Datos del nuevo detalle.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del detalle creado.
   */
  createDetalleMantenimiento: async (detalleData) => {
    try {
      const response = await maintenanceDetailsAPI.create(detalleData);
      return response;
    } catch (error) {
      console.error('Error en createDetalleMantenimiento:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Actualiza un detalle de mantenimiento existente.
   * @param {string} id - ID del detalle a actualizar.
   * @param {object} detalleData - Datos actualizados del detalle.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del detalle actualizado.
   */
  updateDetalleMantenimiento: async (id, detalleData) => {
    try {
      const response = await maintenanceDetailsAPI.update(id, detalleData);
      return response;
    } catch (error) {
      console.error('Error en updateDetalleMantenimiento:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Elimina un detalle de mantenimiento.
   * @param {string} id - ID del detalle a eliminar.
   * @returns {Promise<number>} - Promesa que resuelve con el status code para indicar éxito.
   */
  deleteDetalleMantenimiento: async (id) => {
    try {
      const response = await maintenanceDetailsAPI.delete(id);
      return response;
    } catch (error) {
      console.error('Error en deleteDetalleMantenimiento:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Elimina un detalle de mantenimiento temporalmente (soft delete).
   * @param {string} id - ID del detalle.
   * @returns {Promise<object>} - Promesa que resuelve con los datos actualizados.
   */
  softDelete: async (id) => {
    try {
      const response = await maintenanceDetailsAPI.softDelete(id);
      return response;
    } catch (error) {
      console.error('Error en softDelete:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Restaura un detalle de mantenimiento eliminado.
   * @param {string} id - ID del detalle.
   * @returns {Promise<object>} - Promesa que resuelve con los datos actualizados.
   */
  restore: async (id) => {
    try {
      const response = await maintenanceDetailsAPI.restore(id);
      return response;
    } catch (error) {
      console.error('Error en restore:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Elimina un detalle de mantenimiento permanentemente.
   * @param {string} id - ID del detalle.
   * @returns {Promise<number>} - Promesa que resuelve con el status code.
   */
  hardDelete: async (id) => {
    try {
      const response = await maintenanceDetailsAPI.deletePermanent(id);
      return response;
    } catch (error) {
      console.error('Error en hardDelete:', error);
      throw handleMantenimientoError(error);
    }
  }
};