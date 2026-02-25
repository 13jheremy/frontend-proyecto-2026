// src/modules/servicios/api/index.js
import { servicesAPI, serviceCategoriesAPI } from '../../../services/api';

export const servicioApi = {
  // SERVICIOS BÁSICOS
  getServicios: async (params = {}) => {
    const response = await servicesAPI.getAll(params);
    return response.data;
  },

  getServicioById: async (id) => {
    const response = await servicesAPI.getById(id);
    return response.data;
  },

  createServicio: async (data) => {
    const response = await servicesAPI.create(data);
    return response.data;
  },

  updateServicio: async (id, data) => {
    const response = await servicesAPI.update(id, data);
    return response.data;
  },

  // ELIMINACIÓN TEMPORAL Y PERMANENTE
  softDeleteServicio: async (id) => {
    const response = await servicesAPI.softDelete(id);
    return response.data;
  },

  hardDeleteServicio: async (id) => {
    const response = await servicesAPI.hardDelete(id);
    return response.status;
  },

  // RESTAURAR SERVICIO
  restoreServicio: async (id) => {
    const response = await servicesAPI.restore(id);
    return response.data;
  },

  // TOGGLE ESTADO ACTIVO/INACTIVO
  toggleActivoServicio: async (id) => {
    const response = await servicesAPI.toggleActivo(id);
    return response.data;
  },

  // CATEGORÍAS DE SERVICIOS
  getCategorias: async (params = {}) => {
    const response = await serviceCategoriesAPI.getAll(params);
    return response.data;
  }
};