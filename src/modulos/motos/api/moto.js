// src/modules/motos/api/index.js
import { motorcyclesAPI } from '../../../services/api';

export const motoApi = {
  // MOTOS BÁSICAS
  getMotos: async (params = {}) => {
    const response = await motorcyclesAPI.getAll(params);
    return response.data;
  },

  getMotoById: async (id) => {
    const response = await motorcyclesAPI.getById(id);
    return response.data;
  },

  createMoto: async (data) => {
    const response = await motorcyclesAPI.create(data);
    return response.data;
  },

  updateMoto: async (id, data) => {
    const response = await motorcyclesAPI.update(id, data);
    return response.data;
  },

  // TOGGLE ESTADO ACTIVO/INACTIVO
  toggleActivoMoto: async (id) => {
    const response = await motorcyclesAPI.toggleActive(id);
    return response.data;
  },

  // ELIMINACIÓN TEMPORAL Y PERMANENTE
  softDeleteMoto: async (id) => {
    const response = await motorcyclesAPI.softDelete(id);
    return response.data;
  },

  hardDeleteMoto: async (id) => {
    const response = await motorcyclesAPI.hardDelete(id);
    return response.data || { success: true }; // Para status 204, devolver objeto de éxito
  },

  // RESTAURAR MOTO
  restoreMoto: async (id) => {
    const response = await motorcyclesAPI.restore(id);
    return response.data;
  },

  // CONSULTAS ESPECÍFICAS
  getMotosActivas: async (params = {}) => {
    const response = await motorcyclesAPI.getActive(params);
    return response.data;
  },

  getMotosInactivas: async (params = {}) => {
    const response = await motorcyclesAPI.getInactive(params);
    return response.data;
  },

  getMotosEliminadas: async (params = {}) => {
    const response = await motorcyclesAPI.getDeleted(params);
    return response.data;
  },

  searchMotos: async (query, params = {}) => {
    const response = await motorcyclesAPI.search(query, params);
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await motorcyclesAPI.getStats();
    return response.data;
  }
};