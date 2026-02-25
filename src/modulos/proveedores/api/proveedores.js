// src/modules/proveedores/api/index.js
import { suppliersAPI } from '../../../services/api';

export const proveedorApi = {
  // PROVEEDORES BÁSICOS
  getProveedores: async (params = {}) => {
    const response = await suppliersAPI.getAll(params);
    return response.data;
  },

  getProveedorById: async (id) => {
    const response = await suppliersAPI.getById(id);
    return response.data;
  },

  createProveedor: async (data) => {
    const response = await suppliersAPI.create(data);
    return response.data;
  },

  updateProveedor: async (id, data) => {
    const response = await suppliersAPI.update(id, data);
    return response.data;
  },

  // TOGGLE ESTADO ACTIVO/INACTIVO
  toggleActivoProveedor: async (id) => {
    const response = await suppliersAPI.toggleActive(id);
    return response.data;
  },

  // ELIMINACIÓN TEMPORAL Y PERMANENTE
  softDeleteProveedor: async (id) => {
    const response = await suppliersAPI.softDelete(id);
    return response.data;
  },

  hardDeleteProveedor: async (id) => {
    const response = await suppliersAPI.hardDelete(id);
    return response.status;
  },

  // RESTAURAR PROVEEDOR
  restoreProveedor: async (id) => {
    const response = await suppliersAPI.restore(id);
    return response.data;
  },

  // CONSULTAS ESPECÍFICAS
  getProveedoresActivos: async (params = {}) => {
    const response = await suppliersAPI.getActive(params);
    return response.data;
  },

  getProveedoresInactivos: async (params = {}) => {
    const response = await suppliersAPI.getInactive(params);
    return response.data;
  },

  getProveedoresEliminados: async (params = {}) => {
    const response = await suppliersAPI.getDeleted(params);
    return response.data;
  },

  getProveedoresConProductos: async (params = {}) => {
    const response = await suppliersAPI.getWithProducts(params);
    return response.data;
  },

  getProductosProveedor: async (id, params = {}) => {
    const response = await suppliersAPI.getProducts(id, params);
    return response.data;
  },

  searchProveedores: async (query, params = {}) => {
    const response = await suppliersAPI.search(query, params);
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await suppliersAPI.getStats();
    return response.data;
  }
};