// src/modulos/inventario/api/lotes.js
import { lotesAPI } from '../../../services/api';

export const lotesApi = {
  // Obtener lotes con filtros y paginación
  getLotes: async (params = {}) => {
    const response = await lotesAPI.getAll(params);
    return response.data;
  },

  // Obtener lote por ID
  getLoteById: async (id) => {
    const response = await lotesAPI.getById(id);
    return response.data;
  },

  // Crear nuevo lote (entrada de inventario)
  createLote: async (data) => {
    const response = await lotesAPI.create(data);
    return response.data;
  },

  // Actualizar lote
  updateLote: async (id, data) => {
    const response = await lotesAPI.update(id, data);
    return response.data;
  },

  // Eliminar lote (desactivar)
  deleteLote: async (id) => {
    const response = await lotesAPI.delete(id);
    return response.data;
  },

  // Obtener lotes de un producto específico
  getLotesPorProducto: async (productoId) => {
    const response = await lotesAPI.getByProduct(productoId);
    return response.data;
  },

  // Obtener estadísticas de lotes
  getEstadisticas: async () => {
    const response = await lotesAPI.getStats();
    return response.data;
  },
};