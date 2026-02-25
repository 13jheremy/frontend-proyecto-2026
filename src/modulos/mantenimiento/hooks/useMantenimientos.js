// src/modulos/mantenimiento/hooks/useMantenimientos.js
import { useState, useEffect, useCallback } from 'react';
import { mantenimientoApi } from '../api/mantenimiento';
import { handleMantenimientoError } from '../utils/apiErrorHandlers';

/**
 * Hook personalizado para la gestión de mantenimientos.
 */
export const useMantenimientos = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
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
   * Obtener lista de mantenimientos con filtros.
   */
  const fetchMantenimientos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mantenimientoApi.getMantenimientos(params);

      if (response.results) {
        setMantenimientos(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          current_page: params.page || 1,
          total_pages: Math.ceil(response.count / (params.page_size || 10))
        });
      } else {
        setMantenimientos(Array.isArray(response) ? response : []);
        setPagination({
          count: Array.isArray(response) ? response.length : 0,
          next: null,
          previous: null,
          current_page: 1,
          total_pages: 1
        });
      }
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error fetching mantenimientos:', err);
      setMantenimientos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un mantenimiento por ID.
   */
  const fetchMantenimientoById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const mantenimiento = await mantenimientoApi.getMantenimientoById(id);
      return mantenimiento;
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error fetching mantenimiento by id:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo mantenimiento.
   */
  const createMantenimiento = useCallback(async (mantenimientoData) => {
    setLoading(true);
    setError(null);
    try {
      const newMantenimiento = await mantenimientoApi.createMantenimiento(mantenimientoData);
      setMantenimientos((prev) => [newMantenimiento, ...prev]);
      setPagination(prev => ({
        ...prev,
        count: prev.count + 1
      }));
      return newMantenimiento;
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error al crear mantenimiento:', errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar mantenimiento existente.
   */
  const updateMantenimiento = useCallback(async (id, mantenimientoData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMantenimiento = await mantenimientoApi.updateMantenimiento(id, mantenimientoData);
      setMantenimientos((prev) =>
        prev.map((m) => (m.id === id ? updatedMantenimiento : m))
      );
      return updatedMantenimiento;
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al actualizar mantenimiento con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar mantenimiento (hard delete).
   */
  const deleteMantenimiento = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await mantenimientoApi.deleteMantenimiento(id);
      setMantenimientos((prev) => prev.filter((m) => m.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar mantenimiento con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cambiar estado del mantenimiento.
   */
  const cambiarEstadoMantenimiento = useCallback(async (id, nuevoEstado) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMantenimiento = await mantenimientoApi.updateMantenimiento(id, { estado: nuevoEstado });
      setMantenimientos((prev) =>
        prev.map((m) => (m.id === id ? updatedMantenimiento : m))
      );
      return updatedMantenimiento;
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al cambiar estado del mantenimiento con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar mantenimiento temporalmente (soft delete).
   */
  const softDeleteMantenimiento = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await mantenimientoApi.softDelete(id);
      setMantenimientos((prev) =>
        prev.map((m) => (m.id === id ? { ...m, eliminado: true } : m))
      );
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar temporalmente mantenimiento con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Restaurar mantenimiento eliminado.
   */
  const restoreMantenimiento = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await mantenimientoApi.restore(id);
      setMantenimientos((prev) =>
        prev.map((m) => (m.id === id ? { ...m, eliminado: false } : m))
      );
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al restaurar mantenimiento con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar mantenimiento permanentemente.
   */
  const hardDeleteMantenimiento = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await mantenimientoApi.hardDelete(id);
      setMantenimientos((prev) => prev.filter((m) => m.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar permanentemente mantenimiento con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas de mantenimientos.
   */
  const getMantenimientoStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await mantenimientoApi.getStats();
      return stats;
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error al obtener estadísticas de mantenimientos:', errorInfo, err);
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
    mantenimientos,
    loading,
    error,
    pagination,
    fetchMantenimientos,
    fetchMantenimientoById,
    createMantenimiento,
    updateMantenimiento,
    deleteMantenimiento,
    cambiarEstadoMantenimiento,
    softDeleteMantenimiento,
    restoreMantenimiento,
    hardDeleteMantenimiento,
    getMantenimientoStats,
    clearError,
  };
};