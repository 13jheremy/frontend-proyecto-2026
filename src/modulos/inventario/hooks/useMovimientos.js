// src/modulos/inventario/hooks/useMovimientos.js
import { useState, useEffect, useCallback } from 'react';
import { inventarioApi } from '../api/inventario';
import { handleApiError, showNotification, inventoryMessages } from '../../../utils/notifications';

export const useMovimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Obtener movimientos
  const fetchMovimientos = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        page,
        page_size: pageSize,
      };

      const data = await inventarioApi.getMovimientos(params);

      if (data && data.results) {
        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        setMovimientos(data.results);
        setPagination({
          page,
          pageSize,
          totalItems,
          totalPages,
          next: data.next,
          previous: data.previous,
        });
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      setMovimientos([]);
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear movimiento
  const createMovimiento = useCallback(async (movimientoData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await inventarioApi.createMovimiento(movimientoData);
      showNotification.success(inventoryMessages.movementCreated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);

      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar movimiento
  const updateMovimiento = useCallback(async (id, movimientoData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await inventarioApi.updateMovimiento(id, movimientoData);
      showNotification.success(inventoryMessages.movementUpdated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);

      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar movimiento
  const deleteMovimiento = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await inventarioApi.deleteMovimiento(id);
      showNotification.success(inventoryMessages.movementDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restaurar movimiento
  const restoreMovimiento = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await inventarioApi.restoreMovimiento(id);
      showNotification.success('Movimiento restaurado exitosamente');
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener reporte de movimientos
  const fetchReporteMovimientos = useCallback(async (fechaInicio, fechaFin) => {
    setLoading(true);
    setError(null);

    try {
      const data = await inventarioApi.getReporteMovimientos(fechaInicio, fechaFin);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicialización de movimientos
  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  return {
    // Estados
    movimientos,
    loading,
    error,
    pagination,

    // Funciones principales
    fetchMovimientos,
    createMovimiento,
    updateMovimiento,
    deleteMovimiento,
    restoreMovimiento,

    // Funciones adicionales
    fetchReporteMovimientos,

    // Utilidades
    clearError,
  };
};
