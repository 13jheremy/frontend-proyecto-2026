// src/modulos/pos/hooks/useClientes.js
import { useState, useCallback } from 'react';
import { posAPI } from '../../../services/api';
import { toast } from 'react-toastify';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const buscarClientes = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setClientes([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const apiResponse = await posAPI.buscarClientes(query);
      console.log('POS API Response:', apiResponse); // Debug log
      
      // Extract data from API response structure
      let clientesData = [];
      
      if (apiResponse && apiResponse.success && apiResponse.data) {
        // Handle nested response structure: {success: true, data: {success: true, data: Array}}
        if (apiResponse.data.success && apiResponse.data.data) {
          clientesData = Array.isArray(apiResponse.data.data) ? apiResponse.data.data : [];
        } else if (Array.isArray(apiResponse.data)) {
          clientesData = apiResponse.data;
        } else if (apiResponse.data.results) {
          clientesData = apiResponse.data.results;
        }
      } else if (apiResponse && apiResponse.results) {
        clientesData = apiResponse.results;
      } else if (Array.isArray(apiResponse)) {
        clientesData = apiResponse;
      } else if (apiResponse && typeof apiResponse === 'object') {
        clientesData = [apiResponse];
      }
      
      console.log('Processed clientes data:', clientesData); // Debug log
      setClientes(clientesData);
      return clientesData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al buscar clientes';
      setError(errorMessage);
      setClientes([]);
      console.error('Error buscando clientes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const crearClienteRapido = useCallback(async (clienteData) => {
    setLoading(true);
    setError(null);

    try {
      // Para crear clientes, seguimos usando personsAPI ya que no hay endpoint específico POS para esto
      const { personsAPI } = await import('../../../services/api');
      const nuevoCliente = await personsAPI.create(clienteData);
      // La notificación se maneja en el componente que llama esta función
      return nuevoCliente;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear cliente';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiarBusqueda = useCallback(() => {
    setClientes([]);
    setError(null);
  }, []);

  return {
    clientes,
    loading,
    error,
    clearError,
    buscarClientes,
    crearClienteRapido,
    limpiarBusqueda
  };
};
