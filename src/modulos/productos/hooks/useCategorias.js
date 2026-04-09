import { useState, useEffect, useCallback } from 'react';
import { categoriesAPI } from '../../../services/api';
import { handleApiError } from '../utils/apiErrorHandlers';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await categoriesAPI.getAll();

      if (response.success) {
        const dataArray = response.data.results || response.data;
        setCategorias(dataArray);
      } else {
        throw new Error(response.error || 'Error desconocido en categorías');
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Solo cargar una vez al montar - igual que useUsuarios
  useEffect(() => {
    fetchCategorias();
  }, []);

  return { categorias, loading, error, fetchCategorias };
};
