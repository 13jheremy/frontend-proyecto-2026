// src/modules/servicios/hooks/useServicioCategoria.js
import { useState, useEffect, useCallback } from 'react';
import { serviceCategoriesAPI } from '../../../services/api';
import { handleApiError } from '../../../utils/apiErrorHandlers';

export const useServicioCategoria = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategorias = useCallback(async () => {
    console.log('[useServicioCategoria] 🚀 Iniciando fetchCategorias...');
    setLoading(true);
    setError(null);

    try {
      console.log('[useServicioCategoria] 🔍 Llamando API serviceCategoriesAPI.getAll()...');
      const response = await serviceCategoriesAPI.getAll();

      console.log('[useServicioCategoria] ✅ Respuesta completa:', response);

      if (response.success) {
        const dataArray = response.data.results || response.data;
        console.log('[useServicioCategoria] 📦 Datos procesados:', dataArray);

        setCategorias(dataArray);
      } else {
        console.error('[useServicioCategoria] ❌ Error en response:', response.error);
        throw new Error(response.error || 'Error desconocido en categorías de servicios');
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      console.error('[useServicioCategoria] 💥 Error capturado:', err);
      console.error('[useServicioCategoria] 🔔 Error procesado:', errorInfo);

      setError(errorInfo.message);
    } finally {
      setLoading(false);
      console.log('[useServicioCategoria] 🏁 fetchCategorias finalizado');
    }
  }, []);

  useEffect(() => {
    console.log('[useServicioCategoria] 📢 useEffect ejecutado → llamando fetchCategorias');
    fetchCategorias();
  }, [fetchCategorias]);

  return { categorias, loading, error, fetchCategorias };
};