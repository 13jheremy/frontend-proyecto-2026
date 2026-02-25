// src/modulos/reportes/api/reportesAPI.js
import api from '../../../services/api';

export const reportesAPI = {
  obtenerDashboardStats: async () => {
    const { data } = await api.get('/dashboard/stats/');
    return data;
  },

  generarReporteVentas: async ({ fecha_inicio, fecha_fin, formato = 'json', group_by = 'day' }) => {
    const { data } = await api.get('/reportes/ventas/', {
      params: { fecha_inicio, fecha_fin, formato, group_by },
    });
    return data;
  },

  obtenerReporteProductos: async () => {
    const { data } = await api.get('/reportes/productos/');
    return data;
  },

  obtenerReporteInventario: async () => {
    const { data } = await api.get('/reportes/inventario/');
    return data;
  },

  obtenerReporteMantenimientos: async () => {
    const { data } = await api.get('/reportes/mantenimientos/');
    return data;
  },

  obtenerReporteMotos: async () => {
    const { data } = await api.get('/reportes/motos/');
    return data;
  },

  obtenerReporteProveedores: async () => {
    const { data } = await api.get('/reportes/proveedores/');
    return data;
  },

  obtenerReporteUsuarios: async () => {
    const { data } = await api.get('/reportes/usuarios/');
    return data;
  },
};

export default reportesAPI;


