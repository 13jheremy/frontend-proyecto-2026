// src/modulos/inventario/hooks/useInventario.js
import { useState, useEffect, useCallback } from 'react';
import { inventarioApi } from '../api/inventario';
import { handleApiError, showNotification, inventoryMessages } from '../../../utils/notifications';

export const useInventario = () => {
  const [inventarios, setInventarios] = useState([]);
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

  // Procesar filtros para la API
  const processFilters = (filters) => {
    const params = { ...filters };

    if (params.activo !== undefined && params.activo !== '') {
      params.activo = String(params.activo);
    }

    if (params.eliminado !== undefined && params.eliminado !== '') {
      params.eliminado = String(params.eliminado);
    }

    return params;
  };

  // Obtener inventarios
  const fetchInventarios = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const processedFilters = processFilters(filters);
      const params = {
        ...processedFilters,
        page,
        page_size: pageSize,
      };

      const data = await inventarioApi.getInventarios(params);

      if (data && data.results) {
        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        setInventarios(data.results);
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
      setInventarios([]);
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear inventario
  const createInventario = useCallback(async (inventarioData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await inventarioApi.createInventario(inventarioData);
      showNotification.success(inventoryMessages.inventoryCreated);
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

  // Actualizar inventario
  const updateInventario = useCallback(async (id, inventarioData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await inventarioApi.updateInventario(id, inventarioData);
      showNotification.success(inventoryMessages.inventoryUpdated);
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

  // Eliminación temporal
  const softDeleteInventario = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await inventarioApi.softDeleteInventario(id);
      showNotification.success(inventoryMessages.inventorySoftDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminación permanente
  const hardDeleteInventario = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await inventarioApi.hardDeleteInventario(id);
      showNotification.success(inventoryMessages.inventoryHardDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restaurar inventario
  const restoreInventario = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await inventarioApi.restoreInventario(id);
      showNotification.success(inventoryMessages.inventoryRestored);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle estado activo
  const toggleInventarioActivo = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const updatedInventario = await inventarioApi.toggleActivoInventario(id);
      showNotification.success(inventoryMessages.statusChanged(updatedInventario.activo));
      return updatedInventario;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función unificada para manejar acciones de inventario
  const handleInventarioAction = useCallback(async (inventarioId, actionType) => {
    try {
      switch (actionType) {
        case 'softDelete':
          await softDeleteInventario(inventarioId);
          break;
        case 'hardDelete':
          await hardDeleteInventario(inventarioId);
          break;
        case 'restore':
          await restoreInventario(inventarioId);
          break;
        case 'toggleActivo':
          await toggleInventarioActivo(inventarioId);
          break;
        default:
          throw new Error(`Acción no reconocida: ${actionType}`);
      }
    } catch (err) {
      console.error(`Error en acción ${actionType}:`, err);
      throw err;
    }
  }, [softDeleteInventario, hardDeleteInventario, restoreInventario, toggleInventarioActivo]);

  // Obtener estadísticas
  const fetchEstadisticas = useCallback(async () => {
    try {
      const data = await inventarioApi.getEstadisticas();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    }
  }, []);

  // Obtener productos con stock bajo
  const fetchProductosStockBajo = useCallback(async () => {
    try {
      const data = await inventarioApi.getProductosStockBajo();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    }
  }, []);

  // Inicialización de inventarios
  useEffect(() => {
    fetchInventarios();
  }, [fetchInventarios]);

  return {
    // Estados
    inventarios,
    loading,
    error,
    pagination,

    // Funciones principales
    fetchInventarios,
    createInventario,
    updateInventario,
    
    // Funciones de gestión de estado
    softDeleteInventario,
    hardDeleteInventario,
    restoreInventario,
    toggleInventarioActivo,
    handleInventarioAction,

    // Funciones adicionales
    fetchEstadisticas,
    fetchProductosStockBajo,

    // Utilidades
    clearError,
  };
};
