// src/modulos/mantenimiento/hooks/useMantenimientos.js
import { useState, useEffect, useCallback } from 'react';
import { mantenimientoApi } from '../api/mantenimiento';
import { handleMantenimientoError } from '../utils/apiErrorHandlers';
import { showNotification, mantenimientoMessages } from '../../../utils/notifications';

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

      // La API retorna { success: true, data: {...}, status: 200 }
      const data = response.data || response;

      if (data.results) {
        setMantenimientos(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          current_page: params.page || 1,
          total_pages: Math.ceil(data.count / (params.page_size || 10))
        });
      } else {
        setMantenimientos(Array.isArray(data) ? data : []);
        setPagination({
          count: Array.isArray(data) ? data.length : 0,
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
      // DEBUG: Ver datos recibidos del formulario
      console.log('=== DEBUG HOOK: Datos recibidos del formulario ===');
      console.log('mantenimientoData:', JSON.stringify(mantenimientoData, null, 2));
      console.log('=================================================');
      const response = await mantenimientoApi.createMantenimiento(mantenimientoData);
      
      // DEBUG: Ver respuesta del backend
      console.log('=== DEBUG HOOK: Respuesta del backend ===');
      console.log('response:', response);
      console.log('==========================================');
      
      // La API retorna { success: true, data: {...}, status: 200 }
      const newMantenimiento = response.data || response;
      
      setMantenimientos((prev) => [newMantenimiento, ...prev]);
      setPagination(prev => ({
        ...prev,
        count: prev.count + 1
      }));
      
      // Mostrar notificación de éxito
      showNotification.success(mantenimientoMessages.created);
      
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
      
      // Mostrar notificación de éxito
      showNotification.success(mantenimientoMessages.updated);
      
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
      
      // Mostrar notificación de éxito
      showNotification.success(mantenimientoMessages.deleted);
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
      
      // Mostrar notificación de éxito
      showNotification.success(mantenimientoMessages.deleted);
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
      
      // Mostrar notificación de éxito
      showNotification.success(mantenimientoMessages.restored);
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
   * Obtener mantenimientos eliminados (soft delete).
   */
  const getDeletedMantenimientos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mantenimientoApi.getDeleted(params);
      return response;
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error al obtener mantenimientos eliminados:', errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar múltiples mantenimientos temporalmente (soft delete).
   */
  const softDeleteMultipleMantenimiento = useCallback(async (ids) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mantenimientoApi.softDeleteMultiple(ids);
      setMantenimientos((prev) =>
        prev.filter((m) => !ids.includes(m.id))
      );
      setPagination(prev => ({
        ...prev,
        count: prev.count - ids.length
      }));
      return response;
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error al eliminar múltiples mantenimientos:', errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Restaurar múltiples mantenimientos eliminados.
   */
  const restoreMultipleMantenimiento = useCallback(async (ids) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mantenimientoApi.restoreMultiple(ids);
      return response;
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error al restaurar múltiples mantenimientos:', errorInfo, err);
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

  /**
   * Manejar acciones de mantenimiento (soft delete, restore, etc.)
   */
  const handleMantenimientoAction = useCallback(async (id, type) => {
    setLoading(true);
    setError(null);
    try {
      switch (type) {
        case 'softDelete':
          await softDeleteMantenimiento(id);
          break;
        case 'restore':
          await restoreMantenimiento(id);
          break;
        case 'toggleActivo':
          // No implementado en este hook, usar update
          throw new Error('Acción toggleActivo no implementada');
        default:
          throw new Error(`Tipo de acción desconocido: ${type}`);
      }
    } catch (err) {
      const errorInfo = handleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error en handleMantenimientoAction (${type}):`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [softDeleteMantenimiento, restoreMantenimiento]);

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
    getMantenimientoStats,
    fetchEstadisticas: getMantenimientoStats, // Alias para compatibilidad
    getDeletedMantenimientos,
    softDeleteMultipleMantenimiento,
    restoreMultipleMantenimiento,
    handleMantenimientoAction,
    clearError,
  };
};