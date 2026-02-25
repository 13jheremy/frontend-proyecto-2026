// src/modules/recordatorios/api/recordatorio.js
import { recordatoriosAPI } from '../../../services/api';

export const recordatorioApi = {
  // SERVICIOS BÁSICOS
  getRecordatorios: async (params = {}) => {
    const response = await recordatoriosAPI.getAll(params);
    return response.data;
  },

  getRecordatorioById: async (id) => {
    const response = await recordatoriosAPI.getById(id);
    return response.data;
  },

  createRecordatorio: async (data) => {
    const response = await recordatoriosAPI.create(data);
    return response.data;
  },

  updateRecordatorio: async (id, data) => {
    const response = await recordatoriosAPI.update(id, data);
    return response.data;
  },

  // ELIMINACIÓN TEMPORAL Y PERMANENTE
  softDeleteRecordatorio: async (id) => {
    const response = await recordatoriosAPI.softDelete(id);
    return response.data;
  },

  hardDeleteRecordatorio: async (id) => {
    const response = await recordatoriosAPI.hardDelete(id);
    return response.status;
  },

  // RESTAURAR RECORDATORIO
  restoreRecordatorio: async (id) => {
    const response = await recordatoriosAPI.restore(id);
    return response.data;
  },

  // TOGGLE ESTADO ACTIVO/INACTIVO
  toggleActivoRecordatorio: async (id) => {
    const response = await recordatoriosAPI.toggleActivo(id);
    return response.data;
  },

  // MARCAR COMO ENVIADO
  marcarEnviado: async (id) => {
    const response = await recordatoriosAPI.patch(id, { enviado: true });
    return response.data;
  },

  // MARCAR COMO PENDIENTE
  marcarPendiente: async (id) => {
    const response = await recordatoriosAPI.patch(id, { enviado: false });
    return response.data;
  },

  // OBTENER RECORDATORIOS POR FECHA
  getRecordatoriosPorFecha: async (fechaInicio, fechaFin) => {
    const response = await recordatoriosAPI.getAll({
      fecha_programada__gte: fechaInicio,
      fecha_programada__lte: fechaFin
    });
    return response.data;
  },

  // OBTENER RECORDATORIOS PENDIENTES
  getRecordatoriosPendientes: async () => {
    const response = await recordatoriosAPI.getAll({
      enviado: false,
      fecha_programada__gte: new Date().toISOString().split('T')[0]
    });
    return response.data;
  },

  // OBTENER RECORDATORIOS VENCIDOS
  getRecordatoriosVencidos: async () => {
    const response = await recordatoriosAPI.getAll({
      enviado: false,
      fecha_programada__lt: new Date().toISOString().split('T')[0]
    });
    return response.data;
  }
};