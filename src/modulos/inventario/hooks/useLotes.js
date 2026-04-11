// src/modulos/inventario/hooks/useLotes.js
import { useState, useEffect, useCallback } from 'react';
import { lotesApi } from '../api/lotes';
import { showNotification } from '../../../utils/notifications';
import { handleApiError } from '../../../utils/apiErrorHandlers';

export const useLotes = () => {
  const [lotes, setLotes] = useState([]);
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

  // Obtener lotes
  const fetchLotes = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        page,
        page_size: pageSize,
      };

      const data = await lotesApi.getLotes(params);

      if (data && data.results) {
        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        setLotes(data.results);
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
      setLotes([]);
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear lote (entrada de inventario)
  const createLote = useCallback(async (loteData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await lotesApi.createLote(loteData);
      showNotification.success('Lote creado exitosamente');
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

  // Actualizar lote
  const updateLote = useCallback(async (id, loteData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await lotesApi.updateLote(id, loteData);
      showNotification.success('Lote actualizado exitosamente');
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

  // Eliminar lote (desactivar)
  const deleteLote = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await lotesApi.deleteLote(id);
      showNotification.success('Lote eliminado exitosamente');
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification.error(apiError.message);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener lotes por producto
  const fetchLotesPorProducto = useCallback(async (productoId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await lotesApi.getLotesPorProducto(productoId);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas
  const fetchEstadisticas = useCallback(async () => {
    try {
      const data = await lotesApi.getEstadisticas();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    }
  }, []);

  // Inicialización
  useEffect(() => {
    fetchLotes();
  }, [fetchLotes]);

  return {
    // Estados
    lotes,
    loading,
    error,
    pagination,

    // Funciones principales
    fetchLotes,
    createLote,
    updateLote,
    deleteLote,
    fetchLotesPorProducto,
    fetchEstadisticas,

    // Utilidades
    clearError,
  };
};