// src/hooks/useBaseCrud.js
// Base hook for standardized CRUD operations across all modules

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Base CRUD Hook
 * Provides standardized state management and operations for CRUD modules
 */
export const useBaseCrud = (service, entityName, entityNamePlural = null) => {
  const entityPlural = entityNamePlural || `${entityName}s`;

  // =======================================
  // STATE MANAGEMENT
  // =======================================
  
  const [state, setState] = useState({
    // Data states
    items: [],
    currentItem: null,
    
    // Loading states
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    
    // Error states
    error: null,
    validationErrors: null,
    
    // Pagination
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false
    },
    
    // Filters and search
    filters: {},
    searchQuery: '',
    
    // UI states
    selectedItems: [],
    viewMode: 'active', // 'active', 'inactive', 'deleted', 'all'
    
    // Statistics
    stats: null
  });

  // =======================================
  // UTILITY FUNCTIONS
  // =======================================

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null, validationErrors: null });
  }, [updateState]);

  const setLoading = useCallback((loading) => {
    updateState({ loading });
  }, [updateState]);

  const setPagination = useCallback((paginationData) => {
    const pagination = {
      page: paginationData.page || 1,
      pageSize: paginationData.page_size || 10,
      totalItems: paginationData.count || 0,
      totalPages: Math.ceil((paginationData.count || 0) / (paginationData.page_size || 10)),
      hasNext: !!paginationData.next,
      hasPrevious: !!paginationData.previous
    };
    updateState({ pagination });
  }, [updateState]);

  // =======================================
  // BASIC CRUD OPERATIONS
  // =======================================

  const fetchItems = useCallback(async (params = {}) => {
    setLoading(true);
    clearError();

    try {
      const mergedParams = { ...state.filters, ...params };
      
      let response;
      switch (state.viewMode) {
        case 'active':
          response = service.hasMethod('getActive') 
            ? await service.getActive(mergedParams)
            : await service.getAll({ ...mergedParams, activo: true });
          break;
        case 'inactive':
          response = service.hasMethod('getInactive')
            ? await service.getInactive(mergedParams)
            : await service.getAll({ ...mergedParams, activo: false });
          break;
        case 'deleted':
          response = service.hasMethod('getDeleted')
            ? await service.getDeleted(mergedParams)
            : await service.getAll({ ...mergedParams, eliminado: true });
          break;
        default:
          response = await service.getAll(mergedParams);
      }

      if (response.success) {
        const data = response.data;
        updateState({ 
          items: data.results || data,
          error: null 
        });

        // Handle pagination if present
        if (data.results && (data.count !== undefined || data.next || data.previous)) {
          setPagination(data);
        }
      } else {
        updateState({ 
          items: [],
          error: response.error 
        });
      }
    } catch (error) {
      updateState({ 
        items: [],
        error: `Error al cargar ${entityPlural}` 
      });
    } finally {
      setLoading(false);
    }
  }, [service, entityPlural, state.filters, state.viewMode, setLoading, clearError, updateState, setPagination]);

  const fetchById = useCallback(async (id) => {
    setLoading(true);
    clearError();

    try {
      const response = await service.getById(id);
      if (response.success) {
        updateState({ 
          currentItem: response.data,
          error: null 
        });
        return response.data;
      } else {
        updateState({ error: response.error });
        return null;
      }
    } catch (error) {
      updateState({ error: `Error al cargar ${entityName}` });
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, entityName, setLoading, clearError, updateState]);

  const createItem = useCallback(async (data) => {
    updateState({ creating: true });
    clearError();

    try {
      const response = await service.create(data);
      if (response.success) {
        updateState({ 
          creating: false,
          error: null,
          validationErrors: null 
        });
        // Refresh the list
        await fetchItems();
        return response.data;
      } else {
        updateState({ 
          creating: false,
          error: response.error,
          validationErrors: response.validationErrors 
        });
        return null;
      }
    } catch (error) {
      updateState({ 
        creating: false,
        error: `Error al crear ${entityName}` 
      });
      return null;
    }
  }, [service, entityName, fetchItems, clearError, updateState]);

  const updateItem = useCallback(async (id, data, isPartial = false) => {
    updateState({ updating: true });
    clearError();

    try {
      const response = isPartial 
        ? await service.patch(id, data)
        : await service.update(id, data);
        
      if (response.success) {
        updateState({ 
          updating: false,
          error: null,
          validationErrors: null 
        });
        // Refresh the list
        await fetchItems();
        return response.data;
      } else {
        updateState({ 
          updating: false,
          error: response.error,
          validationErrors: response.validationErrors 
        });
        return null;
      }
    } catch (error) {
      updateState({ 
        updating: false,
        error: `Error al actualizar ${entityName}` 
      });
      return null;
    }
  }, [service, entityName, fetchItems, clearError, updateState]);

  const deleteItem = useCallback(async (id) => {
    updateState({ deleting: true });
    clearError();

    try {
      const response = await service.delete(id);
      if (response.success) {
        updateState({ 
          deleting: false,
          error: null 
        });
        // Refresh the list
        await fetchItems();
        return true;
      } else {
        updateState({ 
          deleting: false,
          error: response.error 
        });
        return false;
      }
    } catch (error) {
      updateState({ 
        deleting: false,
        error: `Error al eliminar ${entityName}` 
      });
      return false;
    }
  }, [service, entityName, fetchItems, clearError, updateState]);

  // =======================================
  // ADVANCED CRUD OPERATIONS
  // =======================================

  const toggleActive = useCallback(async (id, isActive = null) => {
    clearError();

    try {
      const response = await service.toggleActive(id, isActive);
      if (response.success) {
        // Refresh the list
        await fetchItems();
        return response.data;
      } else {
        updateState({ error: response.error });
        return null;
      }
    } catch (error) {
      updateState({ error: `Error al cambiar estado de ${entityName}` });
      return null;
    }
  }, [service, entityName, fetchItems, clearError, updateState]);

  const softDelete = useCallback(async (id) => {
    clearError();

    try {
      const response = await service.softDelete(id);
      if (response.success) {
        // Refresh the list
        await fetchItems();
        return true;
      } else {
        updateState({ error: response.error });
        return false;
      }
    } catch (error) {
      updateState({ error: `Error al eliminar temporalmente ${entityName}` });
      return false;
    }
  }, [service, entityName, fetchItems, clearError, updateState]);

  const hardDelete = useCallback(async (id) => {
    clearError();

    try {
      const response = await service.hardDelete(id);
      if (response.success) {
        // Refresh the list
        await fetchItems();
        return true;
      } else {
        updateState({ error: response.error });
        return false;
      }
    } catch (error) {
      updateState({ error: `Error al eliminar permanentemente ${entityName}` });
      return false;
    }
  }, [service, entityName, fetchItems, clearError, updateState]);

  const restore = useCallback(async (id) => {
    clearError();

    try {
      const response = await service.restore(id);
      if (response.success) {
        // Refresh the list
        await fetchItems();
        return true;
      } else {
        updateState({ error: response.error });
        return false;
      }
    } catch (error) {
      updateState({ error: `Error al restaurar ${entityName}` });
      return false;
    }
  }, [service, entityName, fetchItems, clearError, updateState]);

  // =======================================
  // BULK OPERATIONS
  // =======================================

  const bulkActivate = useCallback(async (ids) => {
    if (!service.hasMethod('activateMultiple')) {
      toast.error('Operación no soportada');
      return false;
    }

    clearError();

    try {
      const response = await service.activateMultiple(ids);
      if (response.success) {
        updateState({ selectedItems: [] });
        await fetchItems();
        return true;
      } else {
        updateState({ error: response.error });
        return false;
      }
    } catch (error) {
      updateState({ error: `Error al activar múltiples ${entityPlural}` });
      return false;
    }
  }, [service, entityPlural, fetchItems, clearError, updateState]);

  const bulkDeactivate = useCallback(async (ids) => {
    if (!service.hasMethod('deactivateMultiple')) {
      toast.error('Operación no soportada');
      return false;
    }

    clearError();

    try {
      const response = await service.deactivateMultiple(ids);
      if (response.success) {
        updateState({ selectedItems: [] });
        await fetchItems();
        return true;
      } else {
        updateState({ error: response.error });
        return false;
      }
    } catch (error) {
      updateState({ error: `Error al desactivar múltiples ${entityPlural}` });
      return false;
    }
  }, [service, entityPlural, fetchItems, clearError, updateState]);

  const bulkSoftDelete = useCallback(async (ids) => {
    if (!service.hasMethod('softDeleteMultiple')) {
      toast.error('Operación no soportada');
      return false;
    }

    clearError();

    try {
      const response = await service.softDeleteMultiple(ids);
      if (response.success) {
        updateState({ selectedItems: [] });
        await fetchItems();
        return true;
      } else {
        updateState({ error: response.error });
        return false;
      }
    } catch (error) {
      updateState({ error: `Error al eliminar múltiples ${entityPlural}` });
      return false;
    }
  }, [service, entityPlural, fetchItems, clearError, updateState]);

  const bulkRestore = useCallback(async (ids) => {
    if (!service.hasMethod('restoreMultiple')) {
      toast.error('Operación no soportada');
      return false;
    }

    clearError();

    try {
      const response = await service.restoreMultiple(ids);
      if (response.success) {
        updateState({ selectedItems: [] });
        await fetchItems();
        return true;
      } else {
        updateState({ error: response.error });
        return false;
      }
    } catch (error) {
      updateState({ error: `Error al restaurar múltiples ${entityPlural}` });
      return false;
    }
  }, [service, entityPlural, fetchItems, clearError, updateState]);

  // =======================================
  // SEARCH AND FILTER OPERATIONS
  // =======================================

  const search = useCallback(async (query, params = {}) => {
    if (!service.hasMethod('search')) {
      // Fallback to regular fetch with search parameter
      return await fetchItems({ ...params, search: query });
    }

    setLoading(true);
    clearError();

    try {
      const response = await service.search(query, params);
      if (response.success) {
        const data = response.data;
        updateState({ 
          items: data.results || data,
          searchQuery: query,
          error: null 
        });

        if (data.results && (data.count !== undefined || data.next || data.previous)) {
          setPagination(data);
        }
      } else {
        updateState({ 
          items: [],
          error: response.error 
        });
      }
    } catch (error) {
      updateState({ 
        items: [],
        error: `Error al buscar ${entityPlural}` 
      });
    } finally {
      setLoading(false);
    }
  }, [service, entityPlural, fetchItems, setLoading, clearError, updateState, setPagination]);

  const setFilters = useCallback((newFilters) => {
    updateState({ 
      filters: newFilters,
      pagination: { ...state.pagination, page: 1 }
    });
  }, [updateState, state.pagination]);

  const setViewMode = useCallback((mode) => {
    updateState({ 
      viewMode: mode,
      pagination: { ...state.pagination, page: 1 }
    });
  }, [updateState, state.pagination]);

  // =======================================
  // STATISTICS
  // =======================================

  const fetchStats = useCallback(async () => {
    if (!service.hasMethod('getStats')) {
      return;
    }

    try {
      const response = await service.getStats();
      if (response.success) {
        updateState({ stats: response.data });
      }
    } catch (error) {
      // Stats fetch error - silent fail
    }
  }, [service, entityName, updateState]);

  // =======================================
  // SELECTION MANAGEMENT
  // =======================================

  const toggleItemSelection = useCallback((id) => {
    updateState({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter(itemId => itemId !== id)
        : [...state.selectedItems, id]
    });
  }, [state.selectedItems, updateState]);

  const selectAllItems = useCallback(() => {
    updateState({
      selectedItems: state.items.map(item => item.id)
    });
  }, [state.items, updateState]);

  const clearSelection = useCallback(() => {
    updateState({ selectedItems: [] });
  }, [updateState]);

  // =======================================
  // PAGINATION HELPERS
  // =======================================

  const goToPage = useCallback((page) => {
    updateState({
      pagination: { ...state.pagination, page }
    });
  }, [state.pagination, updateState]);

  const changePageSize = useCallback((pageSize) => {
    updateState({
      pagination: { ...state.pagination, pageSize, page: 1 }
    });
  }, [state.pagination, updateState]);

  // =======================================
  // AUTO-FETCH ON DEPENDENCY CHANGES
  // =======================================

  useEffect(() => {
    fetchItems();
  }, [state.filters, state.pagination.page, state.pagination.pageSize, state.viewMode]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // =======================================
  // RETURN HOOK INTERFACE
  // =======================================

  return {
    // Data
    items: state.items,
    currentItem: state.currentItem,
    stats: state.stats,
    
    // Loading states
    loading: state.loading,
    creating: state.creating,
    updating: state.updating,
    deleting: state.deleting,
    
    // Error states
    error: state.error,
    validationErrors: state.validationErrors,
    
    // Pagination
    pagination: state.pagination,
    
    // Filters and search
    filters: state.filters,
    searchQuery: state.searchQuery,
    viewMode: state.viewMode,
    
    // Selection
    selectedItems: state.selectedItems,
    
    // Basic CRUD operations
    fetchItems,
    fetchById,
    createItem,
    updateItem,
    deleteItem,
    
    // Advanced operations
    toggleActive,
    softDelete,
    hardDelete,
    restore,
    
    // Bulk operations
    bulkActivate,
    bulkDeactivate,
    bulkSoftDelete,
    bulkRestore,
    
    // Search and filter
    search,
    setFilters,
    setViewMode,
    
    // Statistics
    fetchStats,
    
    // Selection management
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    
    // Pagination
    goToPage,
    changePageSize,
    
    // Utilities
    clearError,
    updateState
  };
};

export default useBaseCrud;
