// src/modulos/servicios/hooks/useCategorias.js
import { useState, useEffect, useCallback } from 'react';
import { categoriaApi } from '../api/categoria';
import { handleApiError } from '../utils/apiErrorHandlers'; // Ajusta la ruta

/**
 * Hook personalizado para la gestión de categorías de servicios.
 */
export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
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
   * Obtener lista de categorías con filtros.
   */
  const fetchCategorias = useCallback(async (params = {}) => {
    // Procesar filtros para la API
    const processFilters = (filters) => {
      const result = { ...filters };

      if (result.activo !== undefined && result.activo !== '') {
        result.activo = String(result.activo);
      }

      if (result.eliminado !== undefined && result.eliminado !== '') {
        result.eliminado = String(result.eliminado);
      }

      return result;
    };

    setLoading(true);
    setError(null);
    try {
      const processedFilters = processFilters(params);
      const response = await categoriaApi.getCategorias(processedFilters);

      if (response.results) {
        setCategorias(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          current_page: params.page || 1,
          total_pages: Math.ceil(response.count / (params.page_size || 10))
        });
      } else {
        setCategorias(Array.isArray(response) ? response : []);
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
      console.error('Error fetching categorias:', err);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener una categoría por ID.
   */
  const fetchCategoriaById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const categoria = await categoriaApi.getCategoriaById(id);
      return categoria;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error('Error fetching categoria by id:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva categoría.
   */
  const createCategoria = useCallback(async (categoriaData) => {
    setLoading(true);
    setError(null);
    try {
      const newCategoria = await categoriaApi.createCategoria(categoriaData);
      setCategorias((prev) => [newCategoria, ...prev]);
      setPagination(prev => ({
        ...prev,
        count: prev.count + 1
      }));
      return newCategoria;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error('Error al crear categoría:', errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar categoría existente.
   */
  const updateCategoria = useCallback(async (id, categoriaData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCategoria = await categoriaApi.updateCategoria(id, categoriaData);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? updatedCategoria : c))
      );
      return updatedCategoria;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error(`Error al actualizar categoría con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar categoría (hard delete).
   */
  const deleteCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.deleteCategoria(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar categoría con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Alternar estado activo/inactivo de categoría.
   */
  const toggleActiveCategoria = useCallback(async (id, activo) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCategoria = await categoriaApi.toggleActive(id, activo);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? updatedCategoria : c))
      );
      return updatedCategoria;
    } catch (err) {
      // Re-lanzar el error para preservar la respuesta del backend
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar categoría temporalmente (soft delete).
   */
  const softDeleteCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.softDelete(id);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? { ...c, eliminado: true } : c))
      );
    } catch (err) {
      // Re-lanzar el error para preservar la respuesta del backend
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Restaurar categoría eliminada.
   */
  const restoreCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.restore(id);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? { ...c, eliminado: false } : c))
      );
    } catch (err) {
      // Re-lanzar el error para preservar la respuesta del backend
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar categoría permanentemente.
   */
  const hardDeleteCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.deletePermanent(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error(`Error al eliminar permanentemente categoría con ID ${id}:`, errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas de categorías.
   */
  const getCategoriaStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await categoriaApi.getStats();
      return stats;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error('Error al obtener estadísticas de categorías:', errorInfo, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verificar relaciones de la categoría antes de eliminar/desactivar.
   */
  const verificarRelacionesCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const relaciones = await categoriaApi.verificarRelaciones(id);
      return relaciones;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error('Error al verificar relaciones:', errorInfo, err);
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
    categorias,
    loading,
    error,
    pagination,
    fetchCategorias,
    fetchCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleActiveCategoria,
    softDeleteCategoria,
    restoreCategoria,
    hardDeleteCategoria,
    getCategoriaStats,
    verificarRelacionesCategoria,
    clearError,
  };
};
