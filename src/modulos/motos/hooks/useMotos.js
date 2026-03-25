// src/modules/motos/hooks/useMotos.js
import { useState, useEffect, useCallback } from 'react';
import { motoApi } from '../api/moto';
import { showNotification, motoMessages } from '../../../utils/notifications';
import { handleApiError } from '../../../utils/apiErrorHandlers';

export const useMotos = () => {
  const [motos, setMotos] = useState([]);
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

  // Obtener motos
  const fetchMotos = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const processedFilters = processFilters(filters);
      const params = {
        ...processedFilters,
        page,
        page_size: pageSize,
      };

      console.log(`🔄 fetchMotos - Filtros procesados:`, processedFilters);
      console.log(`📋 Parámetros de consulta:`, params);

      const data = await motoApi.getMotos(params);

      console.log(`📥 Respuesta de getMotos:`, data);

      if (data && data.results) {
        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        console.log(`📊 Total de motos encontradas: ${totalItems}, Página actual: ${page}/${totalPages}`);
        console.log(`🏍️ Motos en la página actual:`, data.results);

        setMotos(data.results);
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
      console.error(`❌ Error en fetchMotos:`, err);
      const apiError = handleApiError(err);
      setError(apiError);
      setMotos([]);
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear moto
  const createMoto = useCallback(async (motoData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await motoApi.createMoto(motoData);
      showNotification.success(motoMessages.motoCreated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);

      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar moto
  const updateMoto = useCallback(async (id, motoData) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Iniciando actualización de moto ${id}`);
      console.log(`📦 Datos a enviar:`, motoData);
      
      const data = await motoApi.updateMoto(id, motoData);
      
      console.log(`✅ Moto ${id} actualizada exitosamente:`, data);
      showNotification.success(motoMessages.motoUpdated);
      return data;
    } catch (err) {
      console.error(`❌ Error actualizando moto ${id}:`, err);
      const apiError = handleApiError(err);
      setError(apiError);

      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminación temporal
  const softDeleteMoto = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await motoApi.softDeleteMoto(id);
      showNotification.success(motoMessages.motoSoftDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restaurar moto
  const restoreMoto = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await motoApi.restoreMoto(id);
      showNotification.success(motoMessages.motoRestored);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle estado activo
  const toggleMotoActivo = useCallback(async (id, activo) => {
    setLoading(true);
    setError(null);

    try {
      const response = await motoApi.toggleActivoMoto(id, activo);
      const nuevoEstado = response.activo;
      showNotification.success(motoMessages.statusChanged(nuevoEstado));
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función unificada para manejar acciones de moto
  const handleMotoAction = useCallback(async (motoId, actionType) => {
    try {
      switch (actionType) {
        case 'softDelete':
          await softDeleteMoto(motoId);
          break;
        case 'restore':
          await restoreMoto(motoId);
          break;
        case 'toggleActivo':
          const moto = motos.find(m => m.id === motoId);
          if (moto) {
            await toggleMotoActivo(motoId, !moto.activo);
          }
          break;
        default:
          throw new Error(`Acción no reconocida: ${actionType}`);
      }
    } catch (err) {
      console.error(`Error en acción ${actionType}:`, err);
      throw err;
    }
  }, [motos, softDeleteMoto, restoreMoto, toggleMotoActivo]);

  // Obtener estadísticas
  const fetchEstadisticas = useCallback(async () => {
    try {
      const data = await motoApi.getEstadisticas();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    }
  }, []);

  return {
    // Estados
    motos,
    loading,
    error,
    pagination,

    // Funciones principales
    fetchMotos,
    createMoto,
    updateMoto,
    
    // Funciones de gestión de estado
    softDeleteMoto,
    restoreMoto,
    toggleMotoActivo,
    handleMotoAction,

    // Funciones adicionales
    fetchEstadisticas,

    // Utilidades
    clearError,
  };
};