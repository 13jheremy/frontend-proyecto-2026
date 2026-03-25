// src/modulos/reportes/hooks/useReportes.js
import { useCallback, useState } from 'react';
import reportesAPI from '../api/reportesAPI';
import pdfService from '../../../services/pdfService';

export default function useReportes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  
  const [stats, setStats] = useState(null);
  const [reporteVentas, setReporteVentas] = useState(null);
  const [reporteProductos, setReporteProductos] = useState(null);
  const [reporteInventario, setReporteInventario] = useState(null);
  const [reporteMantenimientos, setReporteMantenimientos] = useState(null);
  const [reporteMotos, setReporteMotos] = useState(null);
  const [reporteProveedores, setReporteProveedores] = useState(null);
  const [reporteUsuarios, setReporteUsuarios] = useState(null);

  const setReportLoading = (report, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [report]: isLoading }));
  };

  const fetchStats = useCallback(async () => {
    try {
      setReportLoading('stats', true);
      const data = await reportesAPI.obtenerDashboardStats();
      setStats(data);
      return data;
    } catch (e) {
      console.error('Error fetching stats:', e);
      setError(e);
    } finally {
      setReportLoading('stats', false);
    }
  }, []);

  const fetchReporteVentas = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Generando reporte de ventas con params:', params);
      
      const data = await reportesAPI.generarReporteVentas(params);
      console.log('Datos recibidos:', data);
      
      // Verificar si la respuesta es un error
      if (data && data.error) {
        throw new Error(data.error || data.detail || 'Error en el servidor');
      }
      
      // Verificar que tenemos los datos necesarios
      if (!data || !data.resumen) {
        console.warn('Datos del reporte pueden estar incompletos:', data);
      }
      
      setReporteVentas(data);
      
      // Si el formato es pdf, generar y descargar automáticamente
      if (params.formato === 'pdf') {
        const timestamp = new Date().toISOString().split('T')[0];
        const doc = pdfService.generarReporteVentas(data);
        if (doc) {
          pdfService.descargarPDF(doc, `reporte_ventas_${timestamp}.pdf`);
        } else {
          throw new Error('No se pudo generar el documento PDF');
        }
      }
      
      return data;
    } catch (e) {
      console.error('Error generando reporte de ventas:', e);
      // Extraer mensaje de error legible
      const errorMessage = e.response?.data?.detail || e.response?.data?.error || e.message || 'Error al generar reporte';
      setError(new Error(errorMessage));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReporteProductos = useCallback(async () => {
    try {
      setReportLoading('productos', true);
      setError(null);
      const data = await reportesAPI.obtenerReporteProductos();
      setReporteProductos(data);
      return data;
    } catch (e) {
      console.error('Error fetching productos report:', e);
      setError(e);
      return null;
    } finally {
      setReportLoading('productos', false);
    }
  }, []);

  const fetchReporteInventario = useCallback(async () => {
    try {
      setReportLoading('inventario', true);
      setError(null);
      const data = await reportesAPI.obtenerReporteInventario();
      setReporteInventario(data);
      return data;
    } catch (e) {
      console.error('Error fetching inventario report:', e);
      setError(e);
      return null;
    } finally {
      setReportLoading('inventario', false);
    }
  }, []);

  const fetchReporteMantenimientos = useCallback(async () => {
    try {
      setReportLoading('mantenimientos', true);
      setError(null);
      const data = await reportesAPI.obtenerReporteMantenimientos();
      setReporteMantenimientos(data);
      return data;
    } catch (e) {
      console.error('Error fetching mantenimientos report:', e);
      setError(e);
      return null;
    } finally {
      setReportLoading('mantenimientos', false);
    }
  }, []);

  const fetchReporteMotos = useCallback(async () => {
    try {
      setReportLoading('motos', true);
      setError(null);
      const data = await reportesAPI.obtenerReporteMotos();
      setReporteMotos(data);
      return data;
    } catch (e) {
      console.error('Error fetching motos report:', e);
      setError(e);
      return null;
    } finally {
      setReportLoading('motos', false);
    }
  }, []);

  const fetchReporteProveedores = useCallback(async () => {
    try {
      setReportLoading('proveedores', true);
      setError(null);
      const data = await reportesAPI.obtenerReporteProveedores();
      setReporteProveedores(data);
      return data;
    } catch (e) {
      console.error('Error fetching proveedores report:', e);
      setError(e);
      return null;
    } finally {
      setReportLoading('proveedores', false);
    }
  }, []);

  const fetchReporteUsuarios = useCallback(async () => {
    try {
      setReportLoading('usuarios', true);
      setError(null);
      const data = await reportesAPI.obtenerReporteUsuarios();
      setReporteUsuarios(data);
      return data;
    } catch (e) {
      console.error('Error fetching usuarios report:', e);
      setError(e);
      return null;
    } finally {
      setReportLoading('usuarios', false);
    }
  }, []);

  return {
    loading,
    error,
    loadingStates,
    stats,
    reporteVentas,
    reporteProductos,
    reporteInventario,
    reporteMantenimientos,
    reporteMotos,
    reporteProveedores,
    reporteUsuarios,
    fetchStats,
    fetchReporteVentas,
    fetchReporteProductos,
    fetchReporteInventario,
    fetchReporteMantenimientos,
    fetchReporteMotos,
    fetchReporteProveedores,
    fetchReporteUsuarios,
  };
}
