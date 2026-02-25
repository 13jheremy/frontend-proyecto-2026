// src/modulos/mantenimiento/api/recordatorioMantenimiento.js
import { maintenanceReminderAPI } from '../../../services/api';
import { handleMantenimientoError } from '../utils/apiErrorHandlers';

/**
 * @module RecordatorioMantenimientoAPI
 * @description Módulo para interactuar con la API de gestión de recordatorios de mantenimiento.
 */
export const recordatorioMantenimientoApi = {
  /**
   * Obtiene la lista de todos los recordatorios de mantenimiento.
   * @param {object} params - Parámetros de consulta para filtrar y buscar recordatorios.
   * @returns {Promise<object>} - Promesa que resuelve con el objeto de respuesta paginado.
   */
  getRecordatoriosMantenimiento: async (params = {}) => {
    try {
      const response = await maintenanceReminderAPI.getAll(params);
      return response;
    } catch (error) {
      console.error('Error en getRecordatoriosMantenimiento:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Obtiene un recordatorio de mantenimiento por su ID.
   * @param {string} id - ID del recordatorio.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del recordatorio.
   */
  getRecordatorioMantenimientoById: async (id) => {
    try {
      const response = await maintenanceReminderAPI.getById(id);
      return response;
    } catch (error) {
      console.error('Error en getRecordatorioMantenimientoById:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Crea un nuevo recordatorio de mantenimiento.
   * @param {object} recordatorioData - Datos del nuevo recordatorio.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del recordatorio creado.
   */
  createRecordatorioMantenimiento: async (recordatorioData) => {
    try {
      const response = await maintenanceReminderAPI.create(recordatorioData);
      return response;
    } catch (error) {
      console.error('Error en createRecordatorioMantenimiento:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Actualiza un recordatorio de mantenimiento existente.
   * @param {string} id - ID del recordatorio a actualizar.
   * @param {object} recordatorioData - Datos actualizados del recordatorio.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del recordatorio actualizado.
   */
  updateRecordatorioMantenimiento: async (id, recordatorioData) => {
    try {
      const response = await maintenanceReminderAPI.update(id, recordatorioData);
      return response;
    } catch (error) {
      console.error('Error en updateRecordatorioMantenimiento:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Elimina un recordatorio de mantenimiento.
   * @param {string} id - ID del recordatorio a eliminar.
   * @returns {Promise<number>} - Promesa que resuelve con el status code para indicar éxito.
   */
  deleteRecordatorioMantenimiento: async (id) => {
    try {
      const response = await maintenanceReminderAPI.delete(id);
      return response;
    } catch (error) {
      console.error('Error en deleteRecordatorioMantenimiento:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Marca un recordatorio como enviado.
   * @param {string} id - ID del recordatorio.
   * @returns {Promise<object>} - Promesa que resuelve con los datos actualizados.
   */
  markAsSent: async (id) => {
    try {
      const response = await maintenanceReminderAPI.patch(id, { enviado: true });
      return response;
    } catch (error) {
      console.error('Error en markAsSent:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Obtiene recordatorios próximos (dentro de X días).
   * @param {number} days - Número de días para considerar como próximos.
   * @returns {Promise<object>} - Promesa que resuelve con la lista de recordatorios próximos.
   */
  getProximos: async (days = 7) => {
    try {
      const response = await maintenanceReminderAPI.getUpcoming(days);
      return response;
    } catch (error) {
      console.error('Error en getProximos:', error);
      throw handleMantenimientoError(error);
    }
  },

  /**
   * Obtiene estadísticas de recordatorios.
   * @returns {Promise<object>} - Promesa que resuelve con las estadísticas.
   */
  getStats: async () => {
    try {
      const response = await maintenanceReminderAPI.getStats();
      return response;
    } catch (error) {
      console.error('Error en getStats:', error);
      throw handleMantenimientoError(error);
    }
  }
};