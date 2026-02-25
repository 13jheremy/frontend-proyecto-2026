// src/modules/proveedores/hooks/useProveedores.js
import { useState, useEffect, useCallback } from 'react';
import { proveedorApi } from '../api/proveedores';
import { handleApiError, showNotification, supplierMessages } from '../../../utils/notifications';

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Almacena el objeto de error completo
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Procesar filtros para la API
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

  // Obtener proveedores
  const fetchProveedores = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const processedFilters = processFilters(filters);
      const params = {
        ...processedFilters,
        page,
        page_size: pageSize,
      };

      const data = await proveedorApi.getProveedores(params);

      if (data && data.results) {
        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        setProveedores(data.results);
        setPagination({
          page,
          pageSize,
          totalItems,
          totalPages,
          next: data.next,
          previous: data.previous,
        });
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError); // Almacenar el objeto de error completo
      setProveedores([]);
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear proveedor
  const createProveedor = useCallback(async (proveedorData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await proveedorApi.createProveedor(proveedorData);
      showNotification.success(supplierMessages.supplierCreated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError); // Almacenar el objeto de error completo

      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar proveedor
  const updateProveedor = useCallback(async (id, proveedorData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await proveedorApi.updateProveedor(id, proveedorData);
      showNotification.success(supplierMessages.supplierUpdated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError); // Almacenar el objeto de error completo

      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminación temporal
  const softDeleteProveedor = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await proveedorApi.softDeleteProveedor(id);
      showNotification.success(supplierMessages.supplierSoftDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminación permanente
  const hardDeleteProveedor = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await proveedorApi.hardDeleteProveedor(id);
      showNotification.success(supplierMessages.supplierHardDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restaurar proveedor
  const restoreProveedor = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await proveedorApi.restoreProveedor(id);
      showNotification.success(supplierMessages.supplierRestored);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle estado activo
  const toggleProveedorActivo = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const updatedProveedor = await proveedorApi.toggleActivoProveedor(id);
      showNotification.success(supplierMessages.statusChanged(updatedProveedor.activo));
      return updatedProveedor;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función unificada para manejar acciones de proveedor
  const handleProveedorAction = useCallback(async (proveedorId, actionType) => {
    try {
      switch (actionType) {
        case 'softDelete':
          await softDeleteProveedor(proveedorId);
          break;
        case 'hardDelete':
          await hardDeleteProveedor(proveedorId);
          break;
        case 'restore':
          await restoreProveedor(proveedorId);
          break;
        case 'toggleActivo':
          await toggleProveedorActivo(proveedorId);
          break;
        default:
          throw new Error(`Acción no reconocida: ${actionType}`);
      }
    } catch (err) {
      console.error(`Error en acción ${actionType}:`, err);
      throw err;
    }
  }, [softDeleteProveedor, hardDeleteProveedor, restoreProveedor, toggleProveedorActivo]);

  // Obtener estadísticas
  const fetchEstadisticas = useCallback(async () => {
    try {
      const data = await proveedorApi.getEstadisticas();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    }
  }, []);

  // Inicialización de proveedores
  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  return {
    // Estados
    proveedores,
    loading,
    error, // Objeto de error completo
    pagination,

    // Funciones principales
    fetchProveedores,
    createProveedor,
    updateProveedor,
    
    // Funciones de gestión de estado
    softDeleteProveedor,
    hardDeleteProveedor,
    restoreProveedor,
    toggleProveedorActivo,
    handleProveedorAction,

    // Funciones adicionales
    fetchEstadisticas,

    // Utilidades
    clearError,
  };
};
