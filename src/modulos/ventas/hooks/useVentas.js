// src/modulos/ventas/hooks/useVentas.js
import { useState, useCallback } from 'react';
import { ventasAPI } from '../api/ventasAPI';
import { showNotification } from '../../../utils/notifications';

export const useVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Obtener ventas con filtros y paginación
  const fetchVentas = useCallback(async (filtros = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ventasAPI.obtenerTodas(filtros, page, pageSize);
      
      setVentas(response.results || []);
      setPagination({
        page: page,
        totalPages: Math.ceil((response.count || 0) / pageSize),
        totalItems: response.count || 0,
        hasNext: !!response.next,
        hasPrevious: !!response.previous,
        next: response.next,
        previous: response.previous
      });
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Error al cargar ventas';
      setError(errorMessage);
      showNotification.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva venta
  const createVenta = useCallback(async (ventaData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ventasAPI.crear(ventaData);
      showNotification.success('Venta creada exitosamente');
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Error al crear venta';
      setError(errorMessage);
      showNotification.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar venta
  const updateVenta = useCallback(async (id, ventaData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ventasAPI.actualizar(id, ventaData);
      // No mostrar notificación aquí - se maneja en el componente
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Error al actualizar venta';
      setError(errorMessage);
      showNotification.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Manejar acciones de venta (eliminar, restaurar, etc.)
  const handleVentaAction = useCallback(async (ventaId, actionType) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      let successMessage;
      
      switch (actionType) {
        case 'softDelete':
          response = await ventasAPI.eliminar(ventaId);
          successMessage = 'Venta eliminada exitosamente';
          break;
        case 'hardDelete':
          response = await ventasAPI.eliminarPermanente(ventaId);
          successMessage = 'Venta eliminada permanentemente';
          break;
        case 'restore':
          response = await ventasAPI.restaurar(ventaId);
          successMessage = 'Venta restaurada exitosamente';
          break;
        case 'cambiarEstado':
          response = await ventasAPI.cambiarEstado(ventaId, actionType);
          successMessage = `Estado cambiado a ${actionType}`;
          break;
        default:
          throw new Error(`Acción no reconocida: ${actionType}`);
      }
      
      if (successMessage) {
        showNotification.success(successMessage);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          `Error al ${actionType} venta`;
      setError(errorMessage);
      showNotification.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar estado de venta
  const cambiarEstadoVenta = useCallback(async (ventaId, nuevoEstado) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ventasAPI.cambiarEstado(ventaId, nuevoEstado);
      showNotification.success(`Estado cambiado a ${nuevoEstado}`);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Error al cambiar estado de venta';
      setError(errorMessage);
      showNotification.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas
  const fetchEstadisticas = useCallback(async () => {
    try {
      const response = await ventasAPI.obtenerEstadisticas();
      return response;
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err);
      return {
        total: 0,
        completadas: 0,
        pendientes: 0,
        canceladas: 0,
        eliminadas: 0
      };
    }
  }, []);

  // Generar reporte
  const generarReporte = useCallback(async (fechaInicio, fechaFin, formato = 'json') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ventasAPI.generarReporte(fechaInicio, fechaFin, formato);
      showNotification.success('Reporte generado exitosamente');
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Error al generar reporte';
      setError(errorMessage);
      showNotification.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ventas,
    loading,
    error,
    pagination,
    fetchVentas,
    createVenta,
    updateVenta,
    handleVentaAction,
    cambiarEstadoVenta,
    fetchEstadisticas,
    generarReporte,
    clearError
  };
};
