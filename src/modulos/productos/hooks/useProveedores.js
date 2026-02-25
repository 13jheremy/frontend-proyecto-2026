    // src/hooks/useProveedores.js
    import { useState, useEffect, useCallback } from 'react';
    import { suppliersAPI } from '../../../services/api'; // Asegúrate de que la ruta sea correcta
    import { handleApiError } from '../utils/apiErrorHandlers';

    export const useProveedores = () => {
      const [proveedores, setProveedores] = useState([]);
      const [loadingProveedores, setLoadingProveedores] = useState(false);
      const [errorProveedores, setErrorProveedores] = useState(null);

      const fetchProveedores = useCallback(async () => {
        setLoadingProveedores(true);
        setErrorProveedores(null);
        try {
          const response = await suppliersAPI.getAll();
          if (response.success) {
            setProveedores(response.data.results || response.data); // Manejar paginación o array directo
          } else {
            throw new Error(response.error);
          }
        } catch (err) {
          const errorInfo = handleApiError(err);
          setErrorProveedores(errorInfo.message);
          console.error('Error fetching suppliers:', err);
        } finally {
          setLoadingProveedores(false);
        }
      }, []);

      useEffect(() => {
        fetchProveedores();
      }, [fetchProveedores]);

      return { proveedores, loadingProveedores, errorProveedores, fetchProveedores };
    };
    