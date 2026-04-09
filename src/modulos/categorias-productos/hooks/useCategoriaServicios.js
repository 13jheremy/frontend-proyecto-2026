// src/modulos/categorias-productos/hooks/useCategoriaServicios.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { categoriaProductoApi } from '../api/categoriaServicio';
import { handleApiError } from '../utils/apiErrorHandlers';

/**
 * Hook personalizado para la gestión de categorías de productos.
 */
export const useCategoriaServicios = () => {
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
  
  const requestIdRef = useRef(0);

  const fetchCategorias = useCallback(async (params = {}, retryCount = 0) => {
    const MAX_RETRIES = 2;
    const processFilters = (filters) => {
      const result = {};

      if (filters.search) {
        result.search = filters.search;
      }

      if (filters.activo !== undefined && filters.activo !== '') {
        result.activo = filters.activo === 'true' || filters.activo === true;
      }

      if (filters.eliminado !== undefined && filters.eliminado !== '') {
        result.eliminado = filters.eliminado === 'true' || filters.eliminado === true;
      }

      if (filters.page) result.page = filters.page;
      if (filters.page_size) result.page_size = filters.page_size;

      return result;
    };

    setLoading(true);
    setError(null);
    
    const currentRequestId = ++requestIdRef.current;
    
    try {
      const processedFilters = processFilters(params);
      
      console.log('📡 Enviando filtros al backend (productos):', processedFilters);
      
      const response = await categoriaProductoApi.getCategorias(processedFilters);
      
      if (currentRequestId !== requestIdRef.current) {
        console.log('⚠️ Petición cancelada: respuesta de request anterior');
        return;
      }
      
      console.log('📥 Respuesta del backend:', response);

      if (response && response.results) {
        setCategorias(response.results);
        setPagination({
          count: response.count || 0,
          next: response.next || null,
          previous: response.previous || null,
          current_page: params.page || 1,
          total_pages: Math.ceil((response.count || 0) / (params.page_size || 10))
        });
      } else if (Array.isArray(response)) {
        setCategorias(response);
        setPagination({
          count: response.length,
          next: null,
          previous: null,
          current_page: 1,
          total_pages: 1
        });
      } else {
        console.warn('⚠️ Respuesta inesperada del backend:', response);
        setCategorias([]);
        setPagination({
          count: 0,
          next: null,
          previous: null,
          current_page: 1,
          total_pages: 1
        });
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error('❌ Error fetching categorias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoriaById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const categoria = await categoriaProductoApi.getCategoriaById(id);
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
      const newCategoria = await categoriaProductoApi.createCategoria(categoriaData);
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
      const updatedCategoria = await categoriaProductoApi.updateCategoria(id, categoriaData);
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
      await categoriaProductoApi.deleteCategoria(id);
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

  const toggleActiveCategoria = useCallback(async (id, activo) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCategoria = await categoriaProductoApi.toggleActive(id, activo);
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
      await categoriaProductoApi.softDelete(id);
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
      await categoriaProductoApi.restore(id);
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
      await categoriaProductoApi.deletePermanent(id);
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
      const stats = await categoriaProductoApi.getStats();
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
      const relaciones = await categoriaProductoApi.verificarRelaciones(id);
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