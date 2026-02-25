// src/modulos/mantenimiento/hooks/useDetallesMantenimiento.js
import { useState, useEffect, useCallback } from 'react';
import { detalleMantenimientoApi } from '../api/detalleMantenimiento';
import { handleDetalleMantenimientoError } from '../utils/apiErrorHandlers';

/**
 * Hook personalizado para la gestión de detalles de mantenimiento.
 */
export const useDetallesMantenimiento = () => {
  const [detalles, setDetalles] = useState([]);
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
   * Obtener lista de detalles de mantenimiento con filtros.
   */
  const fetchDetallesMantenimiento = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await detalleMantenimientoApi.getDetallesMantenimiento(params);

      if (response.results) {
        setDetalles(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          current_page: params.page || 1,
          total_pages: Math.ceil(response.count / (params.page_size || 10))
        });
      } else {
        setDetalles(Array.isArray(response) ? response : []);
        setPagination({
          count: Array.isArray(response) ? response.length : 0,
          next: null,
          previous: null,
          current_page: 1,
          total_pages: 1
        });
      }
    } catch (err) {
      const errorInfo = handleDetalleMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error fetching detalles de mantenimiento:', err);
      setDetalles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener detalles de un mantenimiento específico.
   */
  const fetchDetallesByMantenimiento = useCallback(async (mantenimientoId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await detalleMantenimientoApi.getDetallesMantenimiento({
        mantenimiento: mantenimientoId
      });
      return response.results || response;
    } catch (err) {
      const errorInfo = handleDetalleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error fetching detalles for mantenimiento ${mantenimientoId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un detalle de mantenimiento por ID.
   */
  const fetchDetalleById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const detalle = await detalleMantenimientoApi.getDetalleMantenimientoById(id);
      return detalle;
    } catch (err) {
      const errorInfo = handleDetalleMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error fetching detalle by id:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo detalle de mantenimiento.
   */
  const createDetalleMantenimiento = useCallback(async (detalleData) => {
    setLoading(true);
    setError(null);
    try {
      const newDetalle = await detalleMantenimientoApi.createDetalleMantenimiento(detalleData);
      setDetalles((prev) => [newDetalle, ...prev]);
      setPagination(prev => ({
        ...prev,
        count: prev.count + 1
      }));
      return newDetalle;
    } catch (err) {
      const errorInfo = handleDetalleMantenimientoError(err);
      setError(errorInfo.message);
      console.error('Error al crear detalle de mantenimiento:', errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar detalle de mantenimiento existente.
   */
  const updateDetalleMantenimiento = useCallback(async (id, detalleData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedDetalle = await detalleMantenimientoApi.updateDetalleMantenimiento(id, detalleData);
      setDetalles((prev) =>
        prev.map((d) => (d.id === id ? updatedDetalle : d))
      );
      return updatedDetalle;
    } catch (err) {
      const errorInfo = handleDetalleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al actualizar detalle con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar detalle de mantenimiento (hard delete).
   */
  const deleteDetalleMantenimiento = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await detalleMantenimientoApi.deleteDetalleMantenimiento(id);
      setDetalles((prev) => prev.filter((d) => d.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleDetalleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar detalle con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar detalle de mantenimiento temporalmente (soft delete).
   */
  const softDeleteDetalle = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await detalleMantenimientoApi.softDelete(id);
      setDetalles((prev) =>
        prev.map((d) => (d.id === id ? { ...d, eliminado: true } : d))
      );
    } catch (err) {
      const errorInfo = handleDetalleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar temporalmente detalle con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Restaurar detalle de mantenimiento eliminado.
   */
  const restoreDetalle = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await detalleMantenimientoApi.restore(id);
      setDetalles((prev) =>
        prev.map((d) => (d.id === id ? { ...d, eliminado: false } : d))
      );
    } catch (err) {
      const errorInfo = handleDetalleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al restaurar detalle con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar detalle de mantenimiento permanentemente.
   */
  const hardDeleteDetalle = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await detalleMantenimientoApi.hardDelete(id);
      setDetalles((prev) => prev.filter((d) => d.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleDetalleMantenimientoError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar permanentemente detalle con ID ${id}:`, errorInfo, err);
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
    detalles,
    loading,
    error,
    pagination,
    fetchDetallesMantenimiento,
    fetchDetallesByMantenimiento,
    fetchDetalleById,
    createDetalleMantenimiento,
    updateDetalleMantenimiento,
    deleteDetalleMantenimiento,
    softDeleteDetalle,
    restoreDetalle,
    hardDeleteDetalle,
    clearError,
  };
};