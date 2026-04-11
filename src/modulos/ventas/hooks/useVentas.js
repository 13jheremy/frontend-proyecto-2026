// src/modulos/ventas/hooks/useVentas.js
import { useState, useCallback, useRef } from 'react';
import { ventasAPI } from '../api/ventasAPI';
import { showNotification } from '../../../utils/notifications';
import { handleApiError } from '../../../utils/apiErrorHandlers';

export const useVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Almacena el objeto de error completo
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Ref para evitar operaciones concurrentes
  const operationInProgress = useRef(false);

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
      const apiError = handleApiError(err);
      setError(apiError);
      setVentas([]);
      setPagination({ page: 1, totalPages: 1, totalItems: 0, hasNext: false, hasPrevious: false });
      showNotification.error(apiError.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva venta
  const createVenta = useCallback(async (ventaData) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await ventasAPI.crear(ventaData);
      showNotification.success('Venta creada exitosamente');
      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      
      if (!apiError.fieldErrors || Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message || 'Error al crear venta');
      } else {
        showNotification.error('Por favor, corrige los errores en el formulario.');
      }
      
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Actualizar venta
  const updateVenta = useCallback(async (id, ventaData) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await ventasAPI.actualizar(id, ventaData);
      showNotification.success('Venta actualizada exitosamente');
      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      
      if (!apiError.fieldErrors || Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message || 'Error al actualizar venta');
      } else {
        showNotification.error('Por favor, corrige los errores en el formulario.');
      }
      
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Manejar acciones de venta (eliminar, restaurar, etc.)
  const handleVentaAction = useCallback(async (ventaId, actionType) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
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
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification.error(apiError.message || `Error al ${actionType} venta`);
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Cambiar estado de venta (delegada desde updateVenta o acción separada)
  const cambiarEstadoVenta = useCallback(async (ventaId, nuevoEstado) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await ventasAPI.cambiarEstado(ventaId, nuevoEstado);
      showNotification.success(`Estado de venta cambiado exitosamente`);
      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification.error(apiError.message || 'Error al cambiar estado de venta');
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
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
    if (operationInProgress.current) {
      showNotification.warning('Generando reporte, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await ventasAPI.generarReporte(fechaInicio, fechaFin, formato);
      showNotification.success('Reporte generado exitosamente');
      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification.error(apiError.message || 'Error al generar reporte');
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
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
