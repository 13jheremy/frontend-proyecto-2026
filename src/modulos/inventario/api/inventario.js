// src/modulos/inventario/api/inventario.js
import { inventoryAPI, inventoryMovementAPI, productsAPI } from '../../../services/api';

// Reutilizar las funciones existentes del api.js principal
export const inventarioApi = {
  // =======================================
  // INVENTARIO CRUD - Usando inventoryAPI
  // =======================================
  
  // Obtener inventarios con filtros y paginación
  getInventarios: async (params = {}) => {
    const response = await inventoryAPI.getAll(params);
    return response.data;
  },

  // Obtener inventario por ID
  getInventarioById: async (id) => {
    const response = await inventoryAPI.getById(id);
    return response.data;
  },

  // Crear inventario
  createInventario: async (data) => {
    const response = await inventoryAPI.create(data);
    return response.data;
  },

  // Actualizar inventario
  updateInventario: async (id, data) => {
    const response = await inventoryAPI.update(id, data);
    return response.data;
  },

  // Eliminación temporal
  softDeleteInventario: async (id) => {
    const response = await inventoryAPI.softDelete(id);
    return response.data;
  },

  // Eliminación permanente
  hardDeleteInventario: async (id) => {
    const response = await inventoryAPI.deletePermanent(id);
    return response.data;
  },

  // Restaurar inventario
  restoreInventario: async (id) => {
    const response = await inventoryAPI.restore(id);
    return response.data;
  },

  // Toggle estado activo - Usando toggleActive endpoint
  toggleActivoInventario: async (id) => {
    const response = await inventoryAPI.toggleActive(id);
    return response.data;
  },

  // =======================================
  // MOVIMIENTOS DE INVENTARIO - Usando inventoryMovementAPI
  // =======================================

  // Obtener movimientos con filtros
  getMovimientos: async (params = {}) => {
    const response = await inventoryMovementAPI.getAll(params);
    return response.data;
  },

  // Crear movimiento de inventario
  createMovimiento: async (data) => {
    const response = await inventoryMovementAPI.create(data);
    return response.data;
  },

  // Obtener movimiento por ID
  getMovimientoById: async (id) => {
    const response = await inventoryMovementAPI.getById(id);
    return response.data;
  },

  // Actualizar movimiento
  updateMovimiento: async (id, data) => {
    const response = await inventoryMovementAPI.update(id, data);
    return response.data;
  },

  // Eliminar movimiento
  deleteMovimiento: async (id) => {
    const response = await inventoryMovementAPI.delete(id);
    return response.data;
  },

  // Restaurar movimiento
  restoreMovimiento: async (id) => {
    const response = await inventoryMovementAPI.restore(id);
    return response.data;
  },

  // =======================================
  // ESTADÍSTICAS Y REPORTES - Usando funciones existentes
  // =======================================

  // Obtener estadísticas de inventario
  getEstadisticas: async () => {
    const response = await inventoryAPI.getStats();
    return response.data;
  },

  // Productos con stock bajo - Usando inventario eliminados como fallback
  getProductosStockBajo: async () => {
    // Como no hay endpoint específico, usar getAll con filtros
    const response = await inventoryAPI.getAll({ stock_bajo: true });
    return response.data;
  },

  // Reporte de movimientos por período
  getReporteMovimientos: async (fechaInicio, fechaFin) => {
    const response = await inventoryMovementAPI.getAll({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
    return response.data;
  },
};
