import { useState, useEffect, useCallback } from 'react';
import { categoriesAPI } from '../../../services/api'; // Ajusta la ruta
import { handleApiError } from '../utils/apiErrorHandlers';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategorias = useCallback(async () => {
    console.log('[useCategorias] 🚀 Iniciando fetchCategorias...');
    setLoading(true);
    setError(null);

    try {
      console.log('[useCategorias] 🔍 Llamando API categoriesAPI.getAll()...');
      const response = await categoriesAPI.getAll();

      console.log('[useCategorias] ✅ Respuesta completa:', response);

      if (response.success) {
        const dataArray = response.data.results || response.data;
        console.log('[useCategorias] 📦 Datos procesados:', dataArray);

        setCategorias(dataArray);
      } else {
        console.error('[useCategorias] ❌ Error en response:', response.error);
        throw new Error(response.error || 'Error desconocido en categorías');
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      console.error('[useCategorias] 💥 Error capturado:', err);
      console.error('[useCategorias] 🔔 Error procesado:', errorInfo);

      setError(errorInfo.message);
    } finally {
      setLoading(false);
      console.log('[useCategorias] 🏁 fetchCategorias finalizado');
    }
  }, []);

  useEffect(() => {
    console.log('[useCategorias] 📢 useEffect ejecutado → llamando fetchCategorias');
    fetchCategorias();
  }, [fetchCategorias]);

  return { categorias, loading, error, fetchCategorias };
};
