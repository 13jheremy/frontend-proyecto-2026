// src/modulos/servicios/hooks/useCategoriaServicios.js
import { useState, useEffect, useCallback } from 'react';
import { categoriaServicioApi } from '../api/categoriaServicio';
import { handleApiError } from '../utils/apiErrorHandlers'; // Ajusta la ruta

/**
 * Hook personalizado para la gestión de servicios de categoría.
 */
export const useCategoriaServicios = () => {
  const [categoriaServicios, setCategoriaServicios] = useState([]);
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
   * Obtener lista de servicios de categoría con filtros.
   */
  const fetchCategoriaServicios = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoriaServicioApi.getCategoriaServicios(params);

      if (response.results) {
        setCategoriaServicios(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          current_page: params.page || 1,
          total_pages: Math.ceil(response.count / (params.page_size || 10))
        });
      } else {
        setCategoriaServicios(Array.isArray(response) ? response : []);
        setPagination({
          count: Array.isArray(response) ? response.length : 0,
          next: null,
          previous: null,
          current_page: 1,
          total_pages: 1
        });
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error('Error fetching categoriaServicios:', err);
      setCategoriaServicios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un servicio de categoría por ID.
   */
  const fetchCategoriaServicioById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const servicio = await categoriaServicioApi.getCategoriaServicioById(id);
      return servicio;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error('Error fetching categoriaServicio by id:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo servicio de categoría.
   */
  const createCategoriaServicio = useCallback(async (categoriaServicioData) => {
    setLoading(true);
    setError(null);
    try {
      const newServicio = await categoriaServicioApi.createCategoriaServicio(categoriaServicioData);
      setCategoriaServicios((prev) => [newServicio, ...prev]);
      setPagination(prev => ({
        ...prev,
        count: prev.count + 1
      }));
      return newServicio;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error('Error al crear servicio de categoría:', errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar servicio de categoría existente.
   */
  const updateCategoriaServicio = useCallback(async (id, categoriaServicioData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedServicio = await categoriaServicioApi.updateCategoriaServicio(id, categoriaServicioData);
      setCategoriaServicios((prev) =>
        prev.map((s) => (s.id === id ? updatedServicio : s))
      );
      return updatedServicio;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error(`Error al actualizar servicio de categoría con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar servicio de categoría (hard delete).
   */
  const deleteCategoriaServicio = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaServicioApi.deleteCategoriaServicio(id);
      setCategoriaServicios((prev) => prev.filter((s) => s.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar servicio de categoría con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Alternar estado activo/inactivo de servicio de categoría.
   */
  const toggleActiveCategoriaServicio = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const updatedServicio = await categoriaServicioApi.toggleActive(id);
      setCategoriaServicios((prev) =>
        prev.map((s) => (s.id === id ? updatedServicio : s))
      );
      return updatedServicio;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error(`Error al alternar estado de servicio de categoría con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar servicio de categoría temporalmente (soft delete).
   */
  const softDeleteCategoriaServicio = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaServicioApi.softDelete(id);
      setCategoriaServicios((prev) =>
        prev.map((s) => (s.id === id ? { ...s, eliminado: true } : s))
      );
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar temporalmente servicio de categoría con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Restaurar servicio de categoría eliminado.
   */
  const restoreCategoriaServicio = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaServicioApi.restore(id);
      setCategoriaServicios((prev) =>
        prev.map((s) => (s.id === id ? { ...s, eliminado: false } : s))
      );
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error(`Error al restaurar servicio de categoría con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar servicio de categoría permanentemente.
   */
  const hardDeleteCategoriaServicio = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaServicioApi.hardDelete(id);
      setCategoriaServicios((prev) => prev.filter((s) => s.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar permanentemente servicio de categoría con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas de servicios de categoría.
   */
  const getCategoriaServicioStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await categoriaServicioApi.getStats();
      return stats;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error('Error al obtener estadísticas de servicios de categoría:', errorInfo, err);
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
    categoriaServicios,
    loading,
    error,
    pagination,
    fetchCategoriaServicios,
    fetchCategoriaServicioById,
    createCategoriaServicio,
    updateCategoriaServicio,
    deleteCategoriaServicio,
    toggleActiveCategoriaServicio,
    softDeleteCategoriaServicio,
    restoreCategoriaServicio,
    hardDeleteCategoriaServicio,
    getCategoriaServicioStats,
    clearError,
  };
};
