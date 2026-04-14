// src/modulos/categorias-productos/hooks/useCategorias.js
import { useState, useCallback, useRef } from 'react';
import { categoriaApi } from '../api/categoria';
import { handleApiError } from '../utils/apiErrorHandlers';
import { showNotification, categoriaMessages } from '../../../utils/notifications';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const isMountedRef = useRef(true);
  const operationInProgress = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const processFilters = (filters) => {
    const params = { ...filters };

    if (params.activo !== undefined && params.activo !== '') {
      params.activo = String(params.activo);
    }

    if (params.eliminado !== undefined && params.eliminado !== '') {
      params.eliminado = String(params.eliminado);
    }

    return params;
  };

  const fetchCategorias = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const processedFilters = processFilters(filters);
      const params = {
        ...processedFilters,
        page,
        page_size: pageSize,
      };

      const data = await categoriaApi.getCategorias(params);

      if (!isMountedRef.current) return;

      if (data && data.results) {
        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        setCategorias(data.results);
        setPagination({
          page,
          pageSize,
          totalItems,
          totalPages,
          next: data.next,
          previous: data.previous,
        });
      } else if (Array.isArray(data)) {
        setCategorias(data);
        setPagination({
          page: 1,
          pageSize: data.length,
          totalItems: data.length,
          totalPages: 1,
          next: null,
          previous: null,
        });
      } else {
        setCategorias([]);
        setPagination({
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
          next: null,
          previous: null,
        });
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      setCategorias([]);
      setPagination({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      });
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const fetchCategoriaById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const categoria = await categoriaApi.getCategoriaById(id);
      return categoria;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      throw errorInfo;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategoria = useCallback(async (categoriaData) => {
    if (operationInProgress.current) return;
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    try {
      const newCategoria = await categoriaApi.createCategoria(categoriaData);
      setCategorias((prev) => [newCategoria, ...prev]);
      setPagination(prev => ({
        ...prev,
        totalItems: prev.totalItems + 1
      }));
      showNotification.success(categoriaMessages.created);
      return newCategoria;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      const hasFieldErrors = errorInfo.fieldErrors && Object.keys(errorInfo.fieldErrors).length > 0;
      if (!hasFieldErrors) {
        showNotification.error(errorInfo.message);
      }
      throw errorInfo;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  const updateCategoria = useCallback(async (id, categoriaData) => {
    if (operationInProgress.current) return;
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    try {
      const updatedCategoria = await categoriaApi.updateCategoria(id, categoriaData);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? updatedCategoria : c))
      );
      showNotification.success(categoriaMessages.updated);
      return updatedCategoria;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      const hasFieldErrors = errorInfo.fieldErrors && Object.keys(errorInfo.fieldErrors).length > 0;
      if (!hasFieldErrors) {
        showNotification.error(errorInfo.message);
      }
      throw errorInfo;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  const toggleActiveCategoria = useCallback(async (id) => {
    if (operationInProgress.current) return;
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    try {
      const updatedCategoria = await categoriaApi.toggleActive(id);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? updatedCategoria : c))
      );
      showNotification.success(categoriaMessages.statusChanged(updatedCategoria.activo));
      return updatedCategoria;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      showNotification.error(errorInfo.message);
      throw errorInfo;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  const softDeleteCategoria = useCallback(async (id) => {
    if (operationInProgress.current) return;
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.softDelete(id);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? { ...c, eliminado: true } : c))
      );
      showNotification.success(categoriaMessages.deleted);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      showNotification.error(errorInfo.message);
      throw errorInfo;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  const restoreCategoria = useCallback(async (id) => {
    if (operationInProgress.current) return;
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.restore(id);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? { ...c, eliminado: false } : c))
      );
      showNotification.success(categoriaMessages.restored);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      showNotification.error(errorInfo.message);
      throw errorInfo;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  const hardDeleteCategoria = useCallback(async (id) => {
    if (operationInProgress.current) return;
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.deletePermanent(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setPagination(prev => ({
        ...prev,
        totalItems: prev.totalItems - 1
      }));
      showNotification.success(categoriaMessages.deleted);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      showNotification.error(errorInfo.message);
      throw errorInfo;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  const deleteCategoria = useCallback(async (id) => {
    // Some pages might call deleteCategoria instead of hardDeleteCategoria
    if (operationInProgress.current) return;
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    try {
      await categoriaApi.deleteCategoria(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setPagination(prev => ({
        ...prev,
        totalItems: prev.totalItems - 1
      }));
      showNotification.success(categoriaMessages.deleted);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      showNotification.error(errorInfo.message);
      throw errorInfo;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
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
      setError(errorInfo);
      throw errorInfo;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategoriaAction = useCallback(async (id, type) => {
    switch (type) {
      case 'softDelete':
        await softDeleteCategoria(id);
        break;
      case 'hardDelete':
        await hardDeleteCategoria(id);
        break;
      case 'restore':
        await restoreCategoria(id);
        break;
      case 'toggleActivo':
        await toggleActiveCategoria(id);
        break;
      default:
        throw new Error(`Acción desconocida: ${type}`);
    }
  }, [softDeleteCategoria, hardDeleteCategoria, restoreCategoria, toggleActiveCategoria]);

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
    handleCategoriaAction,
    clearError,
  };
};
