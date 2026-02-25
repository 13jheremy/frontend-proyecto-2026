// src/modulos/mantenimiento/hooks/useRecordatoriosMantenimiento.js
import { useState, useEffect, useCallback } from 'react';
import { recordatorioMantenimientoApi } from '../api/recordatorioMantenimiento';
import { handleRecordatorioMantenimientoError } from '../utils/apiErrorHandlers';

/**
 * Hook personalizado para la gestión de recordatorios de mantenimiento.
 */
export const useRecordatoriosMantenimiento = () => {
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1
  });

  /**
   * Obtener lista de recordatorios de mantenimiento con filtros.
   */
  const fetchRecordatoriosMantenimiento = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recordatorioMantenimientoApi.getRecordatoriosMantenimiento(params);

      if (response.results) {
        setRecordatorios(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          current_page: params.page || 1,
          total_pages: Math.ceil(response.count / (params.page_size || 10))
        });
      } else {
        setRecordatorios(Array.isArray(response) ? response : []);
        setPagination({
          count: Array.isArray(response) ? response.length : 0,
          next: null,
          previous: null,
          current_page: 1,
          total_pages: 1
        });
      }
    } catch (err) {
      const errorInfo = handleRecordatorioMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error fetching recordatorios de mantenimiento:', err);
      setRecordatorios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener recordatorios próximos.
   */
  const fetchRecordatoriosProximos = useCallback(async (dias = 7) => {
    setLoading(true);
    setError(null);
    try {
      const recordatoriosProximos = await recordatorioMantenimientoApi.getProximos(dias);
      return recordatoriosProximos;
    } catch (err) {
      const errorInfo = handleRecordatorioMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error fetching recordatorios próximos:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un recordatorio de mantenimiento por ID.
   */
  const fetchRecordatorioById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const recordatorio = await recordatorioMantenimientoApi.getRecordatorioMantenimientoById(id);
      return recordatorio;
    } catch (err) {
      const errorInfo = handleRecordatorioMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error fetching recordatorio by id:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo recordatorio de mantenimiento.
   */
  const createRecordatorioMantenimiento = useCallback(async (recordatorioData) => {
    setLoading(true);
    setError(null);
    try {
      const newRecordatorio = await recordatorioMantenimientoApi.createRecordatorioMantenimiento(recordatorioData);
      setRecordatorios((prev) => [newRecordatorio, ...prev]);
      setPagination(prev => ({
        ...prev,
        count: prev.count + 1
      }));
      return newRecordatorio;
    } catch (err) {
      const errorInfo = handleRecordatorioMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error al crear recordatorio de mantenimiento:', errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar recordatorio de mantenimiento existente.
   */
  const updateRecordatorioMantenimiento = useCallback(async (id, recordatorioData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedRecordatorio = await recordatorioMantenimientoApi.updateRecordatorioMantenimiento(id, recordatorioData);
      setRecordatorios((prev) =>
        prev.map((r) => (r.id === id ? updatedRecordatorio : r))
      );
      return updatedRecordatorio;
    } catch (err) {
      const errorInfo = handleRecordatorioMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al actualizar recordatorio con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar recordatorio de mantenimiento (hard delete).
   */
  const deleteRecordatorioMantenimiento = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await recordatorioMantenimientoApi.deleteRecordatorioMantenimiento(id);
      setRecordatorios((prev) => prev.filter((r) => r.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleRecordatorioMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar recordatorio con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marcar recordatorio como enviado.
   */
  const markAsSent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const updatedRecordatorio = await recordatorioMantenimientoApi.markAsSent(id);
      setRecordatorios((prev) =>
        prev.map((r) => (r.id === id ? updatedRecordatorio : r))
      );
      return updatedRecordatorio;
    } catch (err) {
      const errorInfo = handleRecordatorioMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al marcar como enviado recordatorio con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas de recordatorios.
   */
  const getRecordatorioStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await recordatorioMantenimientoApi.getStats();
      return stats;
    } catch (err) {
      const errorInfo = handleRecordatorioMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error al obtener estadísticas de recordatorios:', errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar error.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    recordatorios,
    loading,
    error,
    pagination,
    fetchRecordatoriosMantenimiento,
    fetchRecordatoriosProximos,
    fetchRecordatorioById,
    createRecordatorioMantenimiento,
    updateRecordatorioMantenimiento,
    deleteRecordatorioMantenimiento,
    markAsSent,
    getRecordatorioStats,
    clearError,
  };
};