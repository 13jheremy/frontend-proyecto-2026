// src/modules/recordatorios/hooks/useRecordatorios.js
import { useState, useEffect, useCallback } from 'react';
import { recordatorioApi } from '../api/recordatorio';
import { handleApiError, showNotification, recordatorioMessages } from '../../../utils/notifications';

export const useRecordatorios = () => {
  const [recordatorios, setRecordatorios] = useState([]);
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

    if (params.enviado !== undefined && params.enviado !== '') {
      params.enviado = String(params.enviado);
    }

    if (params.eliminado !== undefined && params.eliminado !== '') {
      params.eliminado = String(params.eliminado);
    }

    if (params.fecha_programada && params.fecha_programada !== '') {
      params.fecha_programada = params.fecha_programada;
    }

    if (params.moto && params.moto !== '') {
      params.moto = params.moto;
    }

    return params;
  };

  // Obtener recordatorios
  const fetchRecordatorios = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const processedFilters = processFilters(filters);
      const params = {
        ...processedFilters,
        page,
        page_size: pageSize,
      };

      const data = await recordatorioApi.getRecordatorios(params);

      if (data && data.results) {
        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        setRecordatorios(data.results);
        setPagination({
          page,
          pageSize,
          totalItems,
          totalPages,
          next: data.next,
          previous: data.previous,
        });
      } else if (Array.isArray(data)) {
        setRecordatorios(data);
        setPagination({
          page: 1,
          pageSize: data.length,
          totalItems: data.length,
          totalPages: 1,
        });
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      setRecordatorios([]);
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear recordatorio
  const createRecordatorio = useCallback(async (recordatorioData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await recordatorioApi.createRecordatorio(recordatorioData);
      showNotification.success(recordatorioMessages.recordatorioCreated);
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

  // Actualizar recordatorio
  const updateRecordatorio = useCallback(async (id, recordatorioData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await recordatorioApi.updateRecordatorio(id, recordatorioData);
      showNotification.success(recordatorioMessages.recordatorioUpdated);
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
  const softDeleteRecordatorio = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await recordatorioApi.softDeleteRecordatorio(id);
      showNotification.success(recordatorioMessages.recordatorioSoftDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminación permanente
  const hardDeleteRecordatorio = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await recordatorioApi.hardDeleteRecordatorio(id);
      showNotification.success(recordatorioMessages.recordatorioHardDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restaurar recordatorio
  const restoreRecordatorio = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await recordatorioApi.restoreRecordatorio(id);
      showNotification.success(recordatorioMessages.recordatorioRestored);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle estado activo
  const toggleRecordatorioActivo = useCallback(async (id, activo) => {
    setLoading(true);
    setError(null);

    try {
      await recordatorioApi.toggleActivoRecordatorio(id);
      showNotification.success(recordatorioMessages.statusChanged(activo));
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar como enviado
  const marcarEnviado = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await recordatorioApi.marcarEnviado(id);
      showNotification.success(recordatorioMessages.recordatorioEnviado);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar como pendiente
  const marcarPendiente = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await recordatorioApi.marcarPendiente(id);
      showNotification.success(recordatorioMessages.recordatorioPendiente);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función unificada para manejar acciones de recordatorio
  const handleRecordatorioAction = useCallback(async (recordatorioId, actionType, additionalData = null) => {
    try {
      switch (actionType) {
        case 'softDelete':
          await softDeleteRecordatorio(recordatorioId);
          break;
        case 'hardDelete':
          await hardDeleteRecordatorio(recordatorioId);
          break;
        case 'restore':
          await restoreRecordatorio(recordatorioId);
          break;
        case 'toggleActivo':
          await toggleRecordatorioActivo(recordatorioId, additionalData);
          break;
        case 'marcarEnviado':
          await marcarEnviado(recordatorioId);
          break;
        case 'marcarPendiente':
          await marcarPendiente(recordatorioId);
          break;
        default:
          throw new Error(`Acción no reconocida: ${actionType}`);
      }
    } catch (err) {
      console.error(`Error en acción ${actionType}:`, err);
      throw err;
    }
  }, [softDeleteRecordatorio, hardDeleteRecordatorio, restoreRecordatorio, toggleRecordatorioActivo, marcarEnviado, marcarPendiente]);

  // Inicialización de recordatorios
  useEffect(() => {
    fetchRecordatorios();
  }, [fetchRecordatorios]);

  return {
    // Estados
    recordatorios,
    loading,
    error,
    pagination,

    // Funciones principales
    fetchRecordatorios,
    createRecordatorio,
    updateRecordatorio,

    // Funciones de gestión de estado
    softDeleteRecordatorio,
    hardDeleteRecordatorio,
    restoreRecordatorio,
    toggleRecordatorioActivo,
    marcarEnviado,
    marcarPendiente,
    handleRecordatorioAction,

    // Utilidades
    clearError,
  };
};