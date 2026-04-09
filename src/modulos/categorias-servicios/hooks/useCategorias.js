// src/modulos/categorias-servicios/hooks/useCategorias.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { categoriaApi } from '../api/categoria';
import { handleApiError } from '../utils/apiErrorHandlers';

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
  
  // Request ID para prevenir race conditions
  const requestIdRef = useRef(0);

  /**
   * Obtener lista de categorías de servicios con filtros.
   */
  const fetchCategorias = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    const currentRequestId = ++requestIdRef.current;
    
    try {
      const response = await categoriaApi.getCategoriaServicios(params);
      
      if (currentRequestId !== requestIdRef.current) {
        console.log('⚠️ Petición cancelada: respuesta de request anterior');
        return;
      }

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
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoriaById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const categoria = await categoriaApi.getCategoriaServicioById(id);
      return categoria;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategoria = useCallback(async (categoriaData) => {
    setLoading(true);
    setError(null);
    try {
      const newCategoria = await categoriaApi.createCategoriaServicio(categoriaData);
      setCategorias((prev) => [newCategoria, ...prev]);
      setPagination(prev => ({
        ...prev,
        count: prev.count + 1
      }));
      return newCategoria;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategoria = useCallback(async (id, categoriaData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCategoria = await categoriaApi.updateCategoriaServicio(id, categoriaData);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? updatedCategoria : c))
      );
      return updatedCategoria;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.deleteCategoriaServicio(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleActiveCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCategoria = await categoriaApi.toggleActive(id);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? updatedCategoria : c))
      );
      return updatedCategoria;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const softDeleteCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.softDelete(id);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? { ...c, eliminado: true } : c))
      );
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.restore(id);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? { ...c, eliminado: false } : c))
      );
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const hardDeleteCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.hardDelete(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setPagination(prev => ({
        ...prev,
        count: prev.count - 1
      }));
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoriaStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await categoriaApi.getStats();
      return stats;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verificarRelacionesCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const relaciones = await categoriaApi.verificarRelaciones(id);
      return relaciones;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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