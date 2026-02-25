// src/services/pagosAPI.js
import { api } from './api';

export const pagosAPI = {
  // Registrar un pago para una venta existente
  registrarPago: async (datosPago) => {
    try {
      const response = await api.post('/pos/pagos/registrar/', datosPago);
      return response.data;
    } catch (error) {
      console.error('Error registrando pago:', error);
      throw error;
    }
  },

  // Obtener pagos de una venta específica
  getByVenta: async (ventaId) => {
    try {
      const response = await api.get(`/pagos/?venta=${ventaId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo pagos:', error);
      throw error;
    }
  },

  // Obtener todos los pagos con filtros
  getAll: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.venta) params.append('venta', filtros.venta);
      if (filtros.metodo) params.append('metodo', filtros.metodo);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      
      const response = await api.get(`/pagos/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo pagos:', error);
      throw error;
    }
  }
};
