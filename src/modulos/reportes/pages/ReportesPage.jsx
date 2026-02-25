// src/modulos/reportes/pages/ReportesPage.jsx
import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, 
  faSpinner, 
  faDownload, 
  faFileExport, 
  faSync, 
  faChartPie,
  faShoppingCart,
  faDollarSign,
  faWrench,
  faCubes,
  faMotorcycle,
  faTruck,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../context/AuthContext';
import { hasPermission } from '../../../utils/rolePermissions';
import useReportes from '../hooks/useReportes';
import ReporteVentasForm from './components/ReporteVentasForm';
import ResumenCard from './components/ResumenCard';
import ReportCard from './components/ReportCard';
import { toCSV, downloadCSV, exportJSON } from '../utils/exportUtils';
import { BarChart, PieChart } from './components/Charts';
import DataTable from './components/DataTable';

const ReportesPage = () => {
  const { user, roles } = useAuth();
  const {
    loading,
    error,
    stats,
    reporteVentas,
    reporteProductos,
    reporteInventario,
    reporteProveedores,
    reporteUsuarios,
    fetchStats,
    fetchReporteVentas,
    fetchReporteProductos,
    fetchReporteInventario,
    fetchReporteProveedores,
    fetchReporteUsuarios,
  } = useReportes();

  // Validación de usuario y roles
  if (!user || !roles) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FontAwesomeIcon 
            icon={faSpinner} 
            className="text-4xl text-blue-600 dark:text-blue-400 animate-spin mb-4" 
          />
          <p className="text-gray-600 dark:text-gray-400">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  // Verificar permisos para reportes
  const permissions = {
    canViewReports: hasPermission(roles, 'REPORTS', 'VIEW'),
    canExportReports: hasPermission(roles, 'REPORTS', 'VIEW'), // Using VIEW permission for exports as well
  };

  // Si no tiene permisos para ver reportes
  if (!permissions.canViewReports) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <FontAwesomeIcon 
            icon={faChartBar} 
            className="text-6xl text-gray-400 dark:text-gray-600 mb-4" 
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a los reportes.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchStats();
        // Load other reports in parallel but don't block on errors
        await Promise.allSettled([
          fetchReporteProductos(),
          fetchReporteInventario(),
          fetchReporteProveedores(),
          fetchReporteUsuarios(),
        ]);
      } catch (error) {
        console.error('Error loading initial reports data:', error);
      }
    };
    
    loadInitialData();
  }, [fetchStats, fetchReporteProductos, fetchReporteInventario, fetchReporteProveedores, fetchReporteUsuarios]);

  const handleGenerarVentas = (params) => {
    fetchReporteVentas(params);
  };

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchReporteProductos(),
        fetchReporteInventario(),
        fetchReporteProveedores(),
        fetchReporteUsuarios(),
      ]);
    } catch (error) {
      console.error('Error refreshing all reports:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FontAwesomeIcon 
                  icon={faChartBar} 
                  className="text-xl text-blue-600 dark:text-blue-400" 
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Reportes y Análisis
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dashboard de reportes y estadísticas del sistema
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefreshAll}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={loading}
              >
                <FontAwesomeIcon
                  icon={faSync}
                  className={`mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Actualizar Todo
              </button>
            </div>
          </div>
        </div>

        {/* Resumen dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ResumenCard
            title="Ventas (Mes)"
            value={stats?.ventas_mes}
            icon={faShoppingCart}
            iconColor="text-green-600 dark:text-green-400"
            iconBgColor="bg-green-100 dark:bg-green-900"
          />
          <ResumenCard
            title="Ingresos (Mes)"
            value={stats?.ingresos_mes}
            icon={faDollarSign}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-900"
          />
          <ResumenCard
            title="Mantenimientos Pendientes"
            value={stats?.mantenimientos_pendientes}
            icon={faWrench}
            iconColor="text-yellow-600 dark:text-yellow-400"
            iconBgColor="bg-yellow-100 dark:bg-yellow-900"
          />
          <ResumenCard
            title="Stock Bajo"
            value={stats?.productos_stock_bajo}
            icon={faCubes}
            iconColor="text-red-600 dark:text-red-400"
            iconBgColor="bg-red-100 dark:bg-red-900"
          />
        </div>

        {/* Reporte ventas */}
        <ReportCard
          title="Reporte de Ventas"
          icon={faShoppingCart}
          iconColor="text-green-600 dark:text-green-400"
          iconBgColor="bg-green-100 dark:bg-green-900"
          onRefresh={fetchStats}
          loading={loading}
          className="mb-8"
        >
          <div className="space-y-6">
            <ReporteVentasForm onGenerate={handleGenerarVentas} loading={loading} />
            
            {loading && (
              <div className="flex items-center justify-center py-8">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3 text-blue-600 text-xl" />
                <span className="text-gray-600 dark:text-gray-400">Generando reporte...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {error?.message || 'Error al generar reporte'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {reporteVentas && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                <div className="space-y-6 flex flex-col h-full">
                  {Array.isArray(reporteVentas.serie) && (
                    <BarChart
                      title="Ventas por período"
                      labels={reporteVentas.serie.map(i => i.periodo)}
                      datasetLabel="Ingresos"
                      data={reporteVentas.serie.map(i => i.total)}
                    />
                  )}
                  <BarChart
                    title="Productos más vendidos"
                    labels={(reporteVentas.productos_mas_vendidos || []).map(i => i["producto__nombre"])}
                    datasetLabel="Cantidad"
                    data={(reporteVentas.productos_mas_vendidos || []).map(i => i.cantidad_total)}
                  />
                  {permissions.canExportReports && (
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => exportJSON('reporte_ventas.json', reporteVentas)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
                      >
                        <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                        Exportar JSON
                      </button>
                      <button
                        onClick={() => downloadCSV('reporte_ventas_productos.csv', toCSV(reporteVentas.productos_mas_vendidos || []))}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Exportar CSV
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col h-full">
                  <DataTable
                    title="Productos más vendidos"
                    columns={[
                      { key: 'producto__nombre', header: 'Producto' },
                      { key: 'cantidad_total', header: 'Cantidad' },
                      { key: 'ingresos_total', header: 'Ingresos' },
                    ]}
                    rows={reporteVentas.productos_mas_vendidos || []}
                    searchable={true}
                    pageSize={8}
                  />
                </div>
              </div>
            )}
          </div>
        </ReportCard>

        {/* Otros reportes */}
        <div className="space-y-8">
          <ReportCard
            title="Productos"
            icon={faCubes}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBgColor="bg-purple-100 dark:bg-purple-900"
            onRefresh={fetchReporteProductos}
            onExportJSON={reporteProductos ? () => exportJSON(`reporte_productos_${new Date().toISOString().slice(0,10)}.json`, reporteProductos) : null}
            onExportCSV={reporteProductos ? () => downloadCSV(`reporte_productos_${new Date().toISOString().slice(0,10)}.csv`, toCSV(reporteProductos.por_categoria || [])) : null}
            loading={loading}
            canExport={permissions.canExportReports && reporteProductos}
            className="h-full"
          >
            {reporteProductos ? (
              <div className="grid grid-cols-1 gap-6 h-full">
                <PieChart
                  title="Productos por categoría"
                  labels={(reporteProductos.por_categoria || []).map(i => i["categoria__nombre"])}
                  data={(reporteProductos.por_categoria || []).map(i => i.total)}
                />
                <DataTable
                  title="Categorías"
                  columns={[
                    { key: 'categoria__nombre', header: 'Categoría' },
                    { key: 'total', header: 'Total' },
                  ]}
                  rows={reporteProductos.por_categoria || []}
                  searchable={false}
                  pageSize={6}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FontAwesomeIcon icon={faCubes} className="text-4xl text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Haz clic en "Actualizar" para cargar el reporte</p>
                </div>
              </div>
            )}
          </ReportCard>
          
          <ReportCard
            title="Inventario"
            icon={faCubes}
            iconColor="text-orange-600 dark:text-orange-400"
            iconBgColor="bg-orange-100 dark:bg-orange-900"
            onRefresh={fetchReporteInventario}
            onExportJSON={reporteInventario ? () => exportJSON(`reporte_inventario_${new Date().toISOString().slice(0,10)}.json`, reporteInventario) : null}
            onExportCSV={reporteInventario ? () => downloadCSV(`stock_bajo_${new Date().toISOString().slice(0,10)}.csv`, toCSV(reporteInventario.stock_bajo || [])) : null}
            loading={loading}
            canExport={permissions.canExportReports && reporteInventario}
          >
            {reporteInventario ? (
              <DataTable
                title="Productos con Stock Bajo"
                columns={[
                  { key: 'nombre', header: 'Producto' },
                  { key: 'stock_actual', header: 'Stock Actual' },
                  { key: 'stock_minimo', header: 'Stock Mínimo' },
                ]}
                rows={reporteInventario.stock_bajo || []}
                searchable={true}
                pageSize={8}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FontAwesomeIcon icon={faCubes} className="text-4xl text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Haz clic en "Actualizar" para cargar el reporte</p>
                </div>
              </div>
            )}
          </ReportCard>
        </div>
        

        <div className="space-y-8">
          <ReportCard
            title="Proveedores"
            icon={faTruck}
            iconColor="text-teal-600 dark:text-teal-400"
            iconBgColor="bg-teal-100 dark:bg-teal-900"
            onRefresh={fetchReporteProveedores}
            onExportJSON={reporteProveedores ? () => exportJSON(`reporte_proveedores_${new Date().toISOString().slice(0,10)}.json`, reporteProveedores) : null}
            onExportCSV={reporteProveedores ? () => downloadCSV(`proveedores_por_productos_${new Date().toISOString().slice(0,10)}.csv`, toCSV(reporteProveedores.por_productos || [])) : null}
            loading={loading}
            canExport={permissions.canExportReports && reporteProveedores}
          >
            {reporteProveedores ? (
              <DataTable
                title="Proveedores por productos"
                columns={[
                  { key: 'nombre', header: 'Proveedor' },
                  { key: 'total_productos', header: 'Productos' },
                ]}
                rows={reporteProveedores.por_productos || []}
                searchable={true}
                pageSize={8}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FontAwesomeIcon icon={faTruck} className="text-4xl text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Haz clic en "Actualizar" para cargar el reporte</p>
                </div>
              </div>
            )}
          </ReportCard>

          <ReportCard
            title="Usuarios"
            icon={faUsers}
            iconColor="text-pink-600 dark:text-pink-400"
            iconBgColor="bg-pink-100 dark:bg-pink-900"
            onRefresh={fetchReporteUsuarios}
            onExportJSON={reporteUsuarios ? () => exportJSON(`reporte_usuarios_${new Date().toISOString().slice(0,10)}.json`, reporteUsuarios) : null}
            onExportCSV={reporteUsuarios ? () => downloadCSV(`usuarios_por_rol_${new Date().toISOString().slice(0,10)}.csv`, toCSV(reporteUsuarios.por_rol || [])) : null}
            loading={loading}
            canExport={permissions.canExportReports && reporteUsuarios}
          >
            {reporteUsuarios ? (
              <div className="grid grid-cols-1 gap-6 h-full">
                <PieChart
                  title="Usuarios por rol"
                  labels={(reporteUsuarios.por_rol || []).map(i => i['rol__nombre'])}
                  data={(reporteUsuarios.por_rol || []).map(i => i.total)}
                />
                <DataTable
                  title="Roles"
                  columns={[
                    { key: 'rol__nombre', header: 'Rol' },
                    { key: 'total', header: 'Usuarios' },
                  ]}
                  rows={reporteUsuarios.por_rol || []}
                  searchable={false}
                  pageSize={6}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Haz clic en "Actualizar" para cargar el reporte</p>
                </div>
              </div>
            )}
          </ReportCard>
        </div>
      </div>
    </div>
  );
};

export default ReportesPage;


