// src/modules/servicios/hooks/useServicios.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { servicioApi } from '../api/servicio';
import { showNotification, serviceMessages } from '../../../utils/notifications';
import { handleApiError } from '../../../utils/apiErrorHandlers';
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
      // Mostrar notificación de error solo para fetch (no duplica porque no se llama desde otro handler)
      showNotification.error(apiError.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear servicio — NO muestra toast de éxito aquí, se delega al caller
  // SOLO maneja errores de API y los propaga con fieldErrors
  const createServicio = useCallback(async (servicioData) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await servicioApi.createServicio(servicioData);
      showNotification.success(serviceMessages.serviceCreated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError); // Almacenar el objeto de error completo

      // Solo mostrar toast de error si NO hay errores de campo específicos
      // (los errores de campo se muestran inline en el formulario)
      if (!apiError.fieldErrors || Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message || serviceMessages.error);
      } else {
        // Si hay errores de campo, mostrar un toast genérico una sola vez
        showNotification.error('Por favor, corrige los errores en el formulario.');
      }

      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Actualizar servicio
  const updateServicio = useCallback(async (id, servicioData) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await servicioApi.updateServicio(id, servicioData);
      showNotification.success(serviceMessages.serviceUpdated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError); // Almacenar el objeto de error completo

      // Solo mostrar toast de error si NO hay errores de campo específicos
      if (!apiError.fieldErrors || Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message || serviceMessages.error);
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
  const softDeleteServicio = useCallback(async (id) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      await servicioApi.softDeleteServicio(id);
      showNotification.success(serviceMessages.serviceSoftDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification.error(apiError.message || 'Error al eliminar el servicio');
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Restaurar servicio
  const restoreServicio = useCallback(async (id) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      await servicioApi.restoreServicio(id);
      showNotification.success(serviceMessages.serviceRestored);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification.error(apiError.message || 'Error al restaurar el servicio');
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Toggle estado activo
  const toggleServicioActivo = useCallback(async (id, activo) => {
    if (operationInProgress.current) {
      showNotification.warning('Ya hay una operación en curso, espere un momento...');
      return;
    }

    operationInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await servicioApi.toggleActivoServicio(id, activo);
      const nuevoEstado = response.activo;
      showNotification.success(serviceMessages.statusChanged(nuevoEstado));
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification.error(apiError.message || 'Error al cambiar el estado del servicio');
      throw apiError;
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, []);

  // Función unificada para manejar acciones de servicio
  // NO muestra toasts propios — los delega a las funciones individuales
  const handleServicioAction = useCallback(async (servicioId, actionType, additionalData = null) => {
    try {
      switch (actionType) {
        case 'softDelete':
          await softDeleteServicio(servicioId);
          break;
        case 'restore':
          await restoreServicio(servicioId);
          break;
        case 'toggleActivo':
          const servicio = servicios.find(s => s.id === servicioId);
          if (servicio) {
            await toggleServicioActivo(servicioId, !servicio.activo);
          } else {
            showNotification.error('No se encontró el servicio para realizar la acción.');
          }
          break;
        default:
          showNotification.error(`Acción no reconocida: ${actionType}`);
          throw new Error(`Acción no reconocida: ${actionType}`);
      }
    } catch (err) {
      // No mostrar toast aquí — ya se mostró en la función individual
      // Solo propagar el error al caller
      throw err;
    }
  }, [servicios, softDeleteServicio, restoreServicio, toggleServicioActivo]);

  // Inicialización de servicios
  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  // Las categorías ya se cargan desde useServicioCategoria con cache incorporado
  // No es necesario volver a cargarlas aquí

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
    restoreServicio,
    toggleServicioActivo,
    handleServicioAction,

    // Utilidades
    clearError,
  };
};