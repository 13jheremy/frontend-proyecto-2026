// src/modules/servicios/hooks/useServicioCategoria.js
import { useState, useEffect, useCallback } from 'react';
import { serviceCategoriesAPI } from '../../../services/api';
import { handleApiError } from '../../../utils/apiErrorHandlers';

export const useServicioCategoria = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await serviceCategoriesAPI.getAll();

      if (response.success) {
        const dataArray = response.data.results || response.data;
        setCategorias(dataArray);
      } else {
        throw new Error(response.error || 'Error desconocido en categorías de servicios');
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Solo cargar una vez al montar el hook (igual que useUsuarios)
  useEffect(() => {
    fetchCategorias();
  }, []);

  return { categorias, loading, error, fetchCategorias };
};
