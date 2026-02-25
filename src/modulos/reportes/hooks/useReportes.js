// src/modulos/reportes/hooks/useReportes.js
import { useCallback, useState } from 'react';
import reportesAPI from '../api/reportesAPI';

export default function useReportes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [reporteVentas, setReporteVentas] = useState(null);
  const [reporteProductos, setReporteProductos] = useState(null);
  const [reporteInventario, setReporteInventario] = useState(null);
  const [reporteMantenimientos, setReporteMantenimientos] = useState(null);
  const [reporteMotos, setReporteMotos] = useState(null);
  const [reporteProveedores, setReporteProveedores] = useState(null);
  const [reporteUsuarios, setReporteUsuarios] = useState(null);
  
  // Individual loading states for each report
  const [loadingStates, setLoadingStates] = useState({
    stats: false,
    ventas: false,
    productos: false,
    inventario: false,
    mantenimientos: false,
    motos: false,
    proveedores: false,
    usuarios: false,
  });

  const setReportLoading = (report, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [report]: isLoading }));
  };

  const fetchStats = useCallback(async () => {
    try {
      setReportLoading('stats', true);
      setError(null);
      const data = await reportesAPI.obtenerDashboardStats();
      setStats(data);
      return data;
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
      setError(e);
      throw e;
    } finally {
      setReportLoading('stats', false);
    }
  }, []);

  const fetchReporteVentas = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportesAPI.generarReporteVentas(params);
      setReporteVentas(data);
      return data;
    } catch (e) {
      setError(e);
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
      // Don't throw error to prevent blocking other reports
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
      setError(null);
      const data = await reportesAPI.obtenerReporteMantenimientos();
      setReporteMantenimientos(data);
      return data;
    } catch (e) {
      console.error('Error fetching mantenimientos report:', e);
      setError(e);
      throw e;
    }
  }, []);

  const fetchReporteMotos = useCallback(async () => {
    try {
      setError(null);
      const data = await reportesAPI.obtenerReporteMotos();
      setReporteMotos(data);
      return data;
    } catch (e) {
      console.error('Error fetching motos report:', e);
      setError(e);
      throw e;
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
    loadingStates,
    error,
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


