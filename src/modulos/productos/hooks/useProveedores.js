import { useState, useEffect, useCallback } from 'react';
import { suppliersAPI } from '../../../services/api';
import { handleApiError } from '../utils/apiErrorHandlers';

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await suppliersAPI.getAll({ activo: true });
      if (response.success) {
        setProveedores(response.data.results || response.data);
      } else {
        throw new Error(response.error);
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
    fetchProveedores();
  }, []);

  return { proveedores, loading, error, fetchProveedores };
};
