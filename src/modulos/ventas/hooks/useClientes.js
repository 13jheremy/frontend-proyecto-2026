// src/hooks/useClientes.js
import { useState, useCallback } from 'react';
import { clientesAPI } from '../services/clientesAPI';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscarClientes = useCallback(async (query) => {
    if (!query.trim()) {
      setClientes([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await clientesAPI.buscar(query);
      setClientes(response.results || []);
      return response.results || [];
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al buscar clientes';
      setError({ message: errorMsg });
      setClientes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const crearCliente = useCallback(async (clienteData) => {
    setLoading(true);
    setError(null);
    try {
      const cliente = await clientesAPI.crear(clienteData);
      return cliente;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear cliente';
      setError({ message: errorMsg, fieldErrors: err.response?.data?.errors });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    clientes,
    loading,
    error,
    buscarClientes,
    crearCliente,
    clearError
  };
};

// src/services/ventasAPI.js
import { apiClient } from './apiClient';

export const ventasAPI = {
  crear: async (ventaData) => {
    const response = await apiClient.post('/ventas/', {
      cliente: ventaData.cliente?.id,
      fecha_venta: ventaData.fecha,
      subtotal: parseFloat(ventaData.subtotal),
      impuesto: parseFloat(ventaData.impuesto),
      total: parseFloat(ventaData.total),
      estado: 'completada',
      detalles: ventaData.items.map(item => ({
        producto: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: parseFloat(item.precio_unitario),
        subtotal: parseFloat(item.subtotal)
      }))
    });
    return response.data;
  },

  obtenerTodas: async (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== null) {
        params.append(key, filtros[key]);
      }
    });
    
    const response = await apiClient.get(`/ventas/?${params}`);
    return response.data;
  },

  obtenerPorId: async (id) => {
    const response = await apiClient.get(`/ventas/${id}/`);
    return response.data;
  },

  generarReporte: async (fechaInicio, fechaFin) => {
    const response = await apiClient.get('/reporte-ventas/', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    });
    return response.data;
  }
};