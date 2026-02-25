// src/modulos/pos/hooks/usePOS.js
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { posAPI } from '../../../services/api';

export const usePOS = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Procesar venta
  const procesarVenta = useCallback(async (ventaData) => {
    console.log('🔧 usePOS.procesarVenta - INICIADO');
    console.log('📋 Datos recibidos:', ventaData);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Llamando a posAPI.procesarVenta...');
      
      const data = await posAPI.procesarVenta(ventaData);
      console.log('✅ Respuesta de posAPI:', data);
      
      // Si la respuesta tiene venta_id, es exitosa
      if (data && (data.venta_id || data.id)) {
        console.log('✅ Venta procesada exitosamente');
        return {
          success: true,
          data: data,
          message: 'Venta procesada exitosamente'
        };
      }
      
      // Handle nested response structure if needed
      let ventaResult = data;
      if (data.success && data.data) {
        if (data.data.success && data.data.data) {
          ventaResult = data.data.data;
        } else if (data.data) {
          ventaResult = data.data;
        }
      }
      
      console.log('📦 Resultado final procesado:', ventaResult);
      return ventaResult;
    } catch (err) {
      console.error('❌ Error en usePOS.procesarVenta:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.error || err.message || 'Error al procesar la venta';
      setError(errorMessage);
      // No mostrar toast aquí para evitar duplicación - se maneja en NuevaVentaPage
      throw err;
    } finally {
      setLoading(false);
      console.log('🏁 usePOS.procesarVenta - FINALIZADO');
    }
  }, []);

  // Buscar productos para el POS
  const buscarProductos = useCallback(async (query) => {
    setLoading(true);
    try {
      const data = await posAPI.buscarProductos(query);
      return data;
    } catch (err) {
      const errorMessage = 'Error al buscar productos';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    clearError,
    procesarVenta,
    buscarProductos // Exportar la nueva función
  };
};
