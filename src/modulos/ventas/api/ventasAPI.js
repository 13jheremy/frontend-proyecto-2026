// src/modulos/ventas/api/ventasAPI.js
import api from '../../../services/api';

export const ventasAPI = {
  // Obtener todas las ventas con filtros y paginación
  obtenerTodas: async (filtros = {}, page = 1, pageSize = 10) => {
    const params = new URLSearchParams();
    
    // Agregar filtros
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });
    
    // Agregar paginación
    params.append('page', page);
    params.append('page_size', pageSize);
    
    const response = await api.get(`/ventas/?${params}`);
    return response.data;
  },

  // Obtener venta por ID
  obtenerPorId: async (id) => {
    const response = await api.get(`/ventas/${id}/`);
    return response.data;
  },

  // Crear nueva venta
  crear: async (ventaData) => {
    const response = await api.post('/ventas/', ventaData);
    return response.data;
  },

  // Actualizar venta
  actualizar: async (id, ventaData) => {
    const response = await api.patch(`/ventas/${id}/`, ventaData);
    return response.data;
  },

  // Eliminar venta (soft delete)
  eliminar: async (id) => {
    const response = await api.patch(`/ventas/${id}/soft_delete/`);
    return response.data;
  },

  // Eliminar permanentemente
  eliminarPermanente: async (id) => {
    const response = await api.delete(`/ventas/${id}/hard_delete/`);
    return response.data;
  },

  // Restaurar venta eliminada
  restaurar: async (id) => {
    const response = await api.patch(`/ventas/${id}/restore/`);
    return response.data;
  },

  // Cambiar estado de la venta
  cambiarEstado: async (id, estado) => {
    const response = await api.patch(`/ventas/${id}/`, { estado });
    return response.data;
  },

  // Obtener estadísticas de ventas
  obtenerEstadisticas: async () => {
    const response = await api.get('/ventas/estadisticas/');
    return response.data;
  },

  // Generar reporte de ventas
  generarReporte: async (fechaInicio, fechaFin, formato = 'json') => {
    const response = await api.get('/reporte-ventas/', {
      params: { 
        fecha_inicio: fechaInicio, 
        fecha_fin: fechaFin,
        formato 
      }
    });
    return response.data;
  },

  // Obtener ventas activas
  obtenerActivas: async (page = 1, pageSize = 10) => {
    const response = await api.get('/ventas/activos/', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  // Obtener ventas eliminadas
  obtenerEliminadas: async (page = 1, pageSize = 10) => {
    const response = await api.get('/ventas/eliminados/', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

};

// API para Pagos
export const pagosAPI = {
  // Obtener todos los pagos 
  obtenerTodos: async (page = 1, pageSize = 10) => {
    const response = await api.get('/pagos/', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  // Obtener pago por ID
  obtenerPorId: async (id) => {
    const response = await api.get(`/pagos/${id}/`);
    return response.data;
  },

  // Crear nuevo pago
  crear: async (pagoData) => {
    const response = await api.post('/pagos/', pagoData);
    return response.data;
  },

  // Actualizar pago
  actualizar: async (id, pagoData) => {
    const response = await api.patch(`/pagos/${id}/`, pagoData);
    return response.data;
  },

  // Eliminar pago
  eliminar: async (id) => {
    const response = await api.delete(`/pagos/${id}/`);
    return response.data;
  },

  // Obtener pagos por venta
  obtenerPorVenta: async (ventaId) => {
    const response = await api.get(`/pagos/por_venta/?venta_id=${ventaId}`);
    return response.data;
  },

  // Obtener estadísticas de pagos
  obtenerEstadisticas: async (fechaInicio = null, fechaFin = null) => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    
    const response = await api.get(`/pagos/estadisticas/?${params}`);
    return response.data;
  }
};
