// src/modules/servicios/hooks/useServicios.js
import { useState, useEffect, useCallback } from 'react';
import { servicioApi } from '../api/servicio';
import { handleApiError, showNotification, serviceMessages } from '../../../utils/notifications';
import { useServicioCategoria } from './useServicioCategoria';

export const useServicios = () => {
  const [servicios, setServicios] = useState([]);
  const { categorias, loading: loadingCategorias, error: errorCategorias } = useServicioCategoria();
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

    if (Array.isArray(params.categorias) && params.categorias.length > 0) {
      params.categorias = params.categorias.join(',');
    } else if (Array.isArray(params.categorias) && params.categorias.length === 0) {
      delete params.categorias;
    }

    return params;
  };

  // Obtener servicios
  const fetchServicios = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const processedFilters = processFilters(filters);
      const params = {
        ...processedFilters,
        page,
        page_size: pageSize,
      };

      const data = await servicioApi.getServicios(params);

      if (data && data.results) {
        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        setServicios(data.results);
        setPagination({
          page,
          pageSize,
          totalItems,
          totalPages,
          next: data.next,
          previous: data.previous,
        });
      } else if (Array.isArray(data)) {
        // Si la respuesta es un array directo
        setServicios(data);
        setPagination({
          page: 1,
          pageSize: data.length,
          totalItems: data.length,
          totalPages: 1,
        });
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError); // Almacenar el objeto de error completo
      setServicios([]);
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear servicio
  const createServicio = useCallback(async (servicioData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await servicioApi.createServicio(servicioData);
      showNotification.success(serviceMessages.serviceCreated);
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

  // Actualizar servicio
  const updateServicio = useCallback(async (id, servicioData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await servicioApi.updateServicio(id, servicioData);
      showNotification.success(serviceMessages.serviceUpdated);
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
  const softDeleteServicio = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await servicioApi.softDeleteServicio(id);
      showNotification.success(serviceMessages.serviceSoftDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminación permanente
  const hardDeleteServicio = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await servicioApi.hardDeleteServicio(id);
      showNotification.success(serviceMessages.serviceHardDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restaurar servicio
  const restoreServicio = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await servicioApi.restoreServicio(id);
      showNotification.success(serviceMessages.serviceRestored);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle estado activo
  const toggleServicioActivo = useCallback(async (id, activo) => {
    setLoading(true);
    setError(null);

    try {
      await servicioApi.toggleActivoServicio(id);
      showNotification.success(serviceMessages.statusChanged(activo));
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función unificada para manejar acciones de servicio
  const handleServicioAction = useCallback(async (servicioId, actionType, additionalData = null) => {
    try {
      switch (actionType) {
        case 'softDelete':
          await softDeleteServicio(servicioId);
          break;
        case 'hardDelete':
          await hardDeleteServicio(servicioId);
          break;
        case 'restore':
          await restoreServicio(servicioId);
          break;
        case 'toggleActivo':
          const servicio = servicios.find(s => s.id === servicioId);
          if (servicio) {
            await toggleServicioActivo(servicioId, !servicio.activo);
          }
          break;
        default:
          throw new Error(`Acción no reconocida: ${actionType}`);
      }
    } catch (err) {
      console.error(`Error en acción ${actionType}:`, err);
      throw err;
    }
  }, [servicios, softDeleteServicio, hardDeleteServicio, restoreServicio, toggleServicioActivo]);

  // Inicialización de servicios
  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  return {
    // Estados
    servicios,
    categorias, // Ahora vienen del hook useServicioCategoria
    loading: loading || loadingCategorias, // Combinar estados de carga
    error, // Objeto de error completo
    pagination,

    // Funciones principales
    fetchServicios,
    createServicio,
    updateServicio,
    
    // Funciones de gestión de estado
    softDeleteServicio,
    hardDeleteServicio,
    restoreServicio,
    toggleServicioActivo,
    handleServicioAction,

    // Utilidades
    clearError,
  };
};