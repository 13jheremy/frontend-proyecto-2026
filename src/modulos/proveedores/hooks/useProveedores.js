// src/modules/proveedores/hooks/useProveedores.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { proveedorApi } from '../api/proveedores';
import { showNotification, supplierMessages } from '../../../utils/notifications';
import { handleApiError } from '../../../utils/apiErrorHandlers';

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

  // Ref para evitar operaciones concurrentes
  const operationInProgress = useRef(false);

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
      } else if (Array.isArray(data)) {
        setProveedores(data);
        setPagination({
          page: 1,
          pageSize: data.length,
          totalItems: data.length,
          totalPages: 1,
        });
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      setProveedores([]);
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
      showNotification.error(apiError.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear proveedor
  const createProveedor = useCallback(async (proveedorData) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await proveedorApi.createProveedor(proveedorData);
      showNotification.success(supplierMessages.supplierCreated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);

      // Solo mostrar toast de error si NO hay errores de campo específicos
      if (!apiError.fieldErrors || Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message || supplierMessages.error);
      } else {
        showNotification.error('Por favor, corrige los errores en el formulario.');
      }

      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Actualizar proveedor
  const updateProveedor = useCallback(async (id, proveedorData) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await proveedorApi.updateProveedor(id, proveedorData);
      showNotification.success(supplierMessages.supplierUpdated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);

      if (!apiError.fieldErrors || Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message || supplierMessages.error);
      } else {
        showNotification.error('Por favor, corrige los errores en el formulario.');
      }

      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Eliminación temporal
  const softDeleteProveedor = useCallback(async (id) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      await proveedorApi.softDeleteProveedor(id);
      showNotification.success(supplierMessages.supplierSoftDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification.error(apiError.message || 'Error al eliminar el proveedor');
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Restaurar proveedor
  const restoreProveedor = useCallback(async (id) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      await proveedorApi.restoreProveedor(id);
      showNotification.success(supplierMessages.supplierRestored);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification.error(apiError.message || 'Error al restaurar el proveedor');
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Toggle estado activo
  const toggleProveedorActivo = useCallback(async (id, activo) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await proveedorApi.toggleActivoProveedor(id, activo);
      const nuevoEstado = response.activo;
      showNotification.success(supplierMessages.statusChanged(nuevoEstado));
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification.error(apiError.message || 'Error al cambiar el estado del proveedor');
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Función unificada para manejar acciones de proveedor
  // NO muestra toasts propios — los delega a las funciones individuales
  const handleProveedorAction = useCallback(async (proveedorId, actionType) => {
    try {
      switch (actionType) {
        case 'softDelete':
          await softDeleteProveedor(proveedorId);
          break;
        case 'restore':
          await restoreProveedor(proveedorId);
          break;
        case 'toggleActivo':
          const proveedor = proveedores.find(p => p.id === proveedorId);
          if (proveedor) {
            await toggleProveedorActivo(proveedorId, !proveedor.activo);
          } else {
            showNotification.error('No se encontró el proveedor para realizar la acción.');
          }
          break;
        default:
          showNotification.error(`Acción no reconocida: ${actionType}`);
          throw new Error(`Acción no reconocida: ${actionType}`);
      }
    } catch (err) {
      // No mostrar toast aquí — ya se mostró en la función individual
      throw err;
    }
  }, [proveedores, softDeleteProveedor, restoreProveedor, toggleProveedorActivo]);

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

  // Efecto para cargar proveedores al inicio
  useEffect(() => {
    fetchProveedores({ activo: 'true' }, 1, 10);
  }, []);

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
    restoreProveedor,
    toggleProveedorActivo,
    handleProveedorAction,

    // Funciones adicionales
    fetchEstadisticas,

    // Utilidades
    clearError,
  };
};
