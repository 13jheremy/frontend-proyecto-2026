// src/modulos/inventario/hooks/useInventario.js
import { useState, useEffect, useCallback } from 'react';
import { inventarioApi } from '../api/inventario';
import { productsAPI } from '../../../services/api';
import { showNotification, inventoryMessages } from '../../../utils/notifications';
import { handleApiError } from '../../../utils/apiErrorHandlers';
import { generarPDFInventario, exportarCSVProductos, descargarPDF } from '../../productos/utils/exportUtils';

export const useInventario = () => {
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  // Obtener inventarios
  const fetchInventarios = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const processedFilters = processFilters(filters);
      const params = {
        ...processedFilters,
        page,
        page_size: pageSize,
      };

      const data = await inventarioApi.getInventarios(params);

      if (data && data.results) {
        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        setInventarios(data.results);
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
      const apiError = handleApiError(err);
      setError(apiError);
      setInventarios([]);
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear inventario
  const createInventario = useCallback(async (inventarioData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await inventarioApi.createInventario(inventarioData);
      showNotification.success(inventoryMessages.inventoryCreated);
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

  // Actualizar inventario
  const updateInventario = useCallback(async (id, inventarioData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await inventarioApi.updateInventario(id, inventarioData);
      showNotification.success(inventoryMessages.inventoryUpdated);
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

  // Función para manejar acciones de inventario (eliminada funcionalidad de eliminación)

  // Obtener estadísticas
  const fetchEstadisticas = useCallback(async () => {
    try {
      const data = await inventarioApi.getEstadisticas();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    }
  }, []);

  // Obtener productos con stock bajo
  const fetchProductosStockBajo = useCallback(async () => {
    try {
      const data = await inventarioApi.getProductosStockBajo();
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    }
  }, []);

  // Obtener reporte de inventario desde la API
  const fetchReporteInventario = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsAPI.getReporteInventario(filters);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar inventario a PDF
  const exportarInventarioPDF = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsAPI.getReporteInventario({});
      const doc = generarPDFInventario(data.inventario || []);
      descargarPDF(doc, `reporte_inventario_${new Date().toISOString().split('T')[0]}.pdf`);
      showNotification('Reporte PDF generado exitosamente', 'success');
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification('Error al generar reporte PDF', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar inventario a CSV
  const exportarInventarioCSV = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsAPI.getReporteInventario({});
      exportarCSVProductos(data.inventario || [], `inventario_${new Date().toISOString().split('T')[0]}.csv`);
      showNotification('Reporte CSV generado exitosamente', 'success');
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showNotification('Error al generar reporte CSV', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicialización de inventarios
  useEffect(() => {
    fetchInventarios();
  }, [fetchInventarios]);

  return {
    // Estados
    inventarios,
    loading,
    error,
    pagination,

    // Funciones principales
    fetchInventarios,
    createInventario,
    updateInventario,

    // Funciones adicionales
    fetchEstadisticas,
    fetchProductosStockBajo,

    // Utilidades
    clearError,
    
    // Funciones de exportación
    fetchReporteInventario,
    exportarInventarioPDF,
    exportarInventarioCSV,
  };
};
