// src/modulos/business-intelligence/hooks/useRealTimeData.js

import { useState, useEffect, useCallback } from 'react';
import { biAPI } from '../api/biAPI';

const useRealTimeData = (refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await biAPI.getRealTimeMetrics();
      
      if (result.success) {
        setData(result.data);
        setLastUpdate(new Date());
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al cargar datos en tiempo real: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Configurar intervalo de actualización
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh
  };
};

export default useRealTimeData;
