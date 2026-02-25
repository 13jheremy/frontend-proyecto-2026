// src/modulos/mantenimiento/api/mantenimiento.js
import { maintenanceAPI } from '../../../services/api'; // Importar la API de mantenimiento

/**
 * @module MantenimientoAPI
 * @description Módulo para interactuar con la API de gestión de mantenimientos.
 */
export const mantenimientoApi = {
  /**
   * Obtiene la lista de todos los mantenimientos.
   * @param {object} params - Parámetros de consulta para filtrar y buscar mantenimientos.
   * @returns {Promise<object>} - Promesa que resuelve con el objeto de respuesta paginado.
   */
  getMantenimientos: async (params = {}) => {
    try {
      const response = await maintenanceAPI.getAll(params);
      return response;
    } catch (error) {
      console.error('Error en getMantenimientos:', error);
      throw new Error(error.message || 'Error al obtener mantenimientos');
    }
  },

  /**
   * Obtiene un mantenimiento por su ID.
   * @param {string} id - ID del mantenimiento.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del mantenimiento.
   */
  getMantenimientoById: async (id) => {
    try {
      const response = await maintenanceAPI.getById(id);
      return response;
    } catch (error) {
      console.error('Error en getMantenimientoById:', error);
      throw new Error(error.message || 'Error al obtener mantenimiento');
    }
  },

  /**
   * Crea un nuevo mantenimiento.
   * @param {object} mantenimientoData - Datos del nuevo mantenimiento.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del mantenimiento creado.
   */
  createMantenimiento: async (mantenimientoData) => {
    try {
      const response = await maintenanceAPI.create(mantenimientoData);
      return response;
    } catch (error) {
      console.error('Error en createMantenimiento:', error);
      throw new Error(error.message || 'Error al crear mantenimiento');
    }
  },

  /**
   * Actualiza un mantenimiento existente.
   * @param {string} id - ID del mantenimiento a actualizar.
   * @param {object} mantenimientoData - Datos actualizados del mantenimiento.
   * @returns {Promise<object>} - Promesa que resuelve con los datos del mantenimiento actualizado.
   */
  updateMantenimiento: async (id, mantenimientoData) => {
    try {
      const response = await maintenanceAPI.update(id, mantenimientoData);
      return response;
    } catch (error) {
      console.error('Error en updateMantenimiento:', error);
      throw new Error(error.message || 'Error al actualizar mantenimiento');
    }
  },

  /**
   * Elimina un mantenimiento.
   * @param {string} id - ID del mantenimiento a eliminar.
   * @returns {Promise<number>} - Promesa que resuelve con el status code para indicar éxito.
   */
  deleteMantenimiento: async (id) => {
    try {
      const response = await maintenanceAPI.delete(id);
      return response;
    } catch (error) {
      console.error('Error en deleteMantenimiento:', error);
      throw new Error(error.message || 'Error al eliminar mantenimiento');
    }
  },

  /**
   * Alterna el estado activo/inactivo de un mantenimiento.
   * @param {string} id - ID del mantenimiento.
   * @returns {Promise<object>} - Promesa que resuelve con los datos actualizados.
   */
  toggleActive: async (id) => {
    try {
      const response = await maintenanceAPI.patch(id, { activo: true });
      return response;
    } catch (error) {
      console.error('Error en toggleActive:', error);
      throw new Error(error.message || 'Error al cambiar estado del mantenimiento');
    }
  },

  /**
   * Elimina un mantenimiento temporalmente (soft delete).
   * @param {string} id - ID del mantenimiento.
   * @returns {Promise<object>} - Promesa que resuelve con los datos actualizados.
   */
  softDelete: async (id) => {
    try {
      const response = await maintenanceAPI.patch(id, { eliminado: true });
      return response;
    } catch (error) {
      console.error('Error en softDelete:', error);
      throw new Error(error.message || 'Error al eliminar temporalmente el mantenimiento');
    }
  },

  /**
   * Restaura un mantenimiento eliminado.
   * @param {string} id - ID del mantenimiento.
   * @returns {Promise<object>} - Promesa que resuelve con los datos actualizados.
   */
  restore: async (id) => {
    try {
      const response = await maintenanceAPI.patch(id, { eliminado: false });
      return response;
    } catch (error) {
      console.error('Error en restore:', error);
      throw new Error(error.message || 'Error al restaurar el mantenimiento');
    }
  },

  /**
   * Elimina un mantenimiento permanentemente.
   * @param {string} id - ID del mantenimiento.
   * @returns {Promise<number>} - Promesa que resuelve con el status code.
   */
  hardDelete: async (id) => {
    try {
      const response = await maintenanceAPI.delete(id);
      return response;
    } catch (error) {
      console.error('Error en hardDelete:', error);
      throw new Error(error.message || 'Error al eliminar permanentemente el mantenimiento');
    }
  },

  /**
   * Obtiene estadísticas de mantenimientos.
   * @returns {Promise<object>} - Promesa que resuelve con las estadísticas.
   */
  getStats: async () => {
    try {
      const response = await maintenanceAPI.get('/estadisticas/');
      return response;
    } catch (error) {
      console.error('Error en getStats:', error);
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  },

  /**
   * Actualiza el estado de un mantenimiento (para técnicos).
   * @param {string} id - ID del mantenimiento.
   * @param {string} nuevoEstado - Nuevo estado del mantenimiento.
   * @param {string} observaciones - Observaciones opcionales.
   * @returns {Promise<object>} - Promesa que resuelve con los datos actualizados.
   */
  updateStatus: async (id, nuevoEstado, observaciones = '') => {
    try {
      const response = await maintenanceAPI.patch(id, { 
        estado: nuevoEstado,
        observaciones_tecnico: observaciones
      });
      return response;
    } catch (error) {
      console.error('Error en updateStatus:', error);
      throw new Error(error.message || 'Error al actualizar estado del mantenimiento');
    }
  },

  /**
   * Agrega observaciones a un mantenimiento (para técnicos).
   * @param {string} id - ID del mantenimiento.
   * @param {string} observaciones - Observaciones del técnico.
   * @param {string} diagnostico - Diagnóstico técnico.
   * @returns {Promise<object>} - Promesa que resuelve con los datos actualizados.
   */
  addObservations: async (id, observaciones, diagnostico = '') => {
    try {
      const response = await maintenanceAPI.patch(id, { 
        observaciones_tecnico: observaciones,
        diagnostico_tecnico: diagnostico
      });
      return response;
    } catch (error) {
      console.error('Error en addObservations:', error);
      throw new Error(error.message || 'Error al agregar observaciones');
    }
  },

  /**
   * Obtiene mantenimientos asignados al técnico actual.
   * @param {object} params - Parámetros de consulta.
   * @returns {Promise<object>} - Promesa que resuelve con los mantenimientos asignados.
   */
  getAssignedMaintenances: async (params = {}) => {
    try {
      const response = await maintenanceAPI.getAll({ ...params, tecnico_asignado: 'me' });
      return response;
    } catch (error) {
      console.error('Error en getAssignedMaintenances:', error);
      throw new Error(error.message || 'Error al obtener mantenimientos asignados');
    }
  }
};