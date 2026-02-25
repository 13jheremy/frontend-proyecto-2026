// src/hooks/useCategorias.js
import { useState, useEffect, useCallback } from 'react';
import { categoriesAPI } from '../services/api';
import { handleApiError } from '../utils/apiErrorHandlers';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [errorCategorias, setErrorCategorias] = useState(null);

  const fetchCategorias = useCallback(async () => {
    setLoadingCategorias(true);
    setErrorCategorias(null);
    try {
      const response = await categoriesAPI.getAll();
      if (response.success) {
        setCategorias(response.data.results || response.data);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setErrorCategorias(errorInfo.message);
    } finally {
      setLoadingCategorias(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return { categorias, loadingCategorias, errorCategorias, fetchCategorias };
};
    