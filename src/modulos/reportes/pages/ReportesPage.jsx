// src/modulos/reportes/pages/ReportesPage.jsx
import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, 
  faSpinner, 
  faDownload, 
  faFileExport, 
  faSync,
  faFilePdf,
  faFileAlt,
  faChartLine,
  faBox,
  faUsers,
  faTruck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../context/AuthContext';
import useReportes from '../hooks/useReportes';
import ReporteVentasForm from './components/ReporteVentasForm';
import ResumenCard from './components/ResumenCard';
import ReportCard from './components/ReportCard';
import { toCSV, downloadCSV, exportJSON } from '../utils/exportUtils';
import { BarChart, PieChart } from './components/Charts';
import DataTable from './components/DataTable';
import pdfService from '../../../services/pdfService';

const ReportesPage = () => {
  const { user } = useAuth();
  const {
    loading,
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
  } = useReportes();

  // Loading state for user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FontAwesomeIcon 
            icon={faSpinner} 
            className="text-4xl text-blue-600 dark:text-blue-400 animate-spin mb-4" 
          />
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchStats();
        await Promise.allSettled([
          fetchReporteProductos(),
          fetchReporteInventario(),
          fetchReporteProveedores(),
          fetchReporteUsuarios(),
        ]);
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    };
    loadInitialData();
  }, [fetchStats, fetchReporteProductos, fetchReporteInventario, fetchReporteProveedores, fetchReporteUsuarios]);

  const handleGenerarVentas = (params) => {
    fetchReporteVentas(params);
  };

  // PDF Export function
  const handleExportPDF = (type, data) => {
    if (!data) return;
    const timestamp = new Date().toISOString().split('T')[0];
    let doc, filename;
    
    switch (type) {
      case 'ventas':
        doc = pdfService.generarReporteVentas(data);
        filename = `reporte_ventas_${timestamp}.pdf`;
        break;
      case 'productos':
        doc = pdfService.generarReporteProductos(data);
        filename = `reporte_productos_${timestamp}.pdf`;
        break;
      case 'inventario':
        doc = pdfService.generarReporteInventarioCompleto(data);
        filename = `reporte_inventario_${timestamp}.pdf`;
        break;
      case 'proveedores':
        doc = pdfService.generarReporteProveedores(data);
        filename = `reporte_proveedores_${timestamp}.pdf`;
        break;
      case 'usuarios':
        doc = pdfService.generarReporteUsuarios(data);
        filename = `reporte_usuarios_${timestamp}.pdf`;
        break;
      case 'mantenimientos':
        doc = pdfService.generarReporteMantenimientos(data);
        filename = `reporte_mantenimientos_${timestamp}.pdf`;
        break;
      case 'motos':
        doc = pdfService.generarReporteMotos(data);
        filename = `reporte_motos_${timestamp}.pdf`;
        break;
      default:
        return;
    }
    pdfService.descargarPDF(doc, filename);
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
      console.error('Error refreshing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <FontAwesomeIcon 
                  icon={faChartBar} 
                  className="text-2xl text-blue-600 dark:text-blue-400" 
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Reportes
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Estadísticas y análisis del sistema
                </p>
              </div>
            </div>
            <button
              onClick={handleRefreshAll}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSync} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ResumenCard
            title="Ventas del mes"
            value={stats?.ventas_mes ?? '-'}
            icon={faChartLine}
            iconColor="text-green-600"
            iconBgColor="bg-green-100 dark:bg-green-900"
          />
          <ResumenCard
            title="Ingresos"
            value={stats?.ingresos_mes ?? '-'}
            icon={faFileAlt}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100 dark:bg-blue-900"
          />
          <ResumenCard
            title="Mantenimientos"
            value={stats?.mantenimientos_pendientes ?? '-'}
            icon={faExclamationTriangle}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100 dark:bg-amber-900"
          />
          <ResumenCard
            title="Stock bajo"
            value={stats?.productos_stock_bajo ?? '-'}
            icon={faBox}
            iconColor="text-red-600"
            iconBgColor="bg-red-100 dark:bg-red-900"
          />
        </div>

        {/* Reporte de Ventas */}
        <div className="mb-6">
          <ReportCard
            title="Ventas"
            icon={faChartLine}
            iconColor="text-green-600 dark:text-green-400"
            iconBgColor="bg-green-100 dark:bg-green-900"
            onRefresh={fetchStats}
            onExportPDF={reporteVentas ? () => handleExportPDF('ventas', reporteVentas) : null}
            onExportJSON={reporteVentas ? () => exportJSON('reporte_ventas.json', reporteVentas) : null}
            onExportCSV={reporteVentas ? () => downloadCSV('reporte_ventas.csv', toCSV(reporteVentas.productos_mas_vendidos || [])) : null}
            loading={loading}
            canExport={!!reporteVentas}
          >
            <div className="space-y-4">
              <ReporteVentasForm onGenerate={handleGenerarVentas} loading={loading} />
              
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error.message || 'Error al generar reporte'}</p>
                </div>
              )}
              
              {reporteVentas && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {reporteVentas.serie?.length > 0 && (
                      <BarChart
                        title="Ventas por período"
                        labels={reporteVentas.serie.map(i => i.periodo)}
                        datasetLabel="Ingresos"
                        data={reporteVentas.serie.map(i => i.total)}
                      />
                    )}
                    {reporteVentas.productos_mas_vendidos?.length > 0 && (
                      <BarChart
                        title="Productos más vendidos"
                        labels={reporteVentas.productos_mas_vendidos.map(i => i.producto__nombre)}
                        datasetLabel="Cantidad"
                        data={reporteVentas.productos_mas_vendidos.map(i => i.cantidad_total)}
                      />
                    )}
                  </div>
                  <div>
                    <DataTable
                      title="Productos más vendidos"
                      columns={[
                        { key: 'producto__nombre', header: 'Producto' },
                        { key: 'cantidad_total', header: 'Cantidad' },
                        { key: 'ingresos_total', header: 'Ingresos' },
                      ]}
                      rows={reporteVentas.productos_mas_vendidos || []}
                      searchable={true}
                      pageSize={6}
                    />
                  </div>
                </div>
              )}
            </div>
          </ReportCard>
        </div>

        {/* Other Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Productos */}
          <ReportCard
            title="Productos"
            icon={faBox}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBgColor="bg-purple-100 dark:bg-purple-900"
            onRefresh={fetchReporteProductos}
            onExportPDF={reporteProductos ? () => handleExportPDF('productos', reporteProductos) : null}
            onExportJSON={reporteProductos ? () => exportJSON('reporte_productos.json', reporteProductos) : null}
            onExportCSV={reporteProductos ? () => downloadCSV('reporte_productos.csv', toCSV(reporteProductos.por_categoria || [])) : null}
            loading={loading}
            canExport={!!reporteProductos}
          >
            {reporteProductos ? (
              <div className="space-y-4">
                {reporteProductos.por_categoria?.length > 0 && (
                  <PieChart
                    title="Por categoría"
                    labels={reporteProductos.por_categoria.map(i => i.categoria__nombre)}
                    data={reporteProductos.por_categoria.map(i => i.total)}
                  />
                )}
                <DataTable
                  title="Categorías"
                  columns={[
                    { key: 'categoria__nombre', header: 'Categoría' },
                    { key: 'total', header: 'Total' },
                  ]}
                  rows={reporteProductos.por_categoria || []}
                  searchable={false}
                  pageSize={5}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
              </div>
            )}
          </ReportCard>

          {/* Inventario */}
          <ReportCard
            title="Inventario"
            icon={faExclamationTriangle}
            iconColor="text-orange-600 dark:text-orange-400"
            iconBgColor="bg-orange-100 dark:bg-orange-900"
            onRefresh={fetchReporteInventario}
            onExportPDF={reporteInventario ? () => handleExportPDF('inventario', reporteInventario) : null}
            onExportJSON={reporteInventario ? () => exportJSON('reporte_inventario.json', reporteInventario) : null}
            onExportCSV={reporteInventario ? () => downloadCSV('reporte_inventario.csv', toCSV(reporteInventario.stock_bajo || [])) : null}
            loading={loading}
            canExport={!!reporteInventario}
          >
            {reporteInventario ? (
              <DataTable
                title="Stock bajo"
                columns={[
                  { key: 'nombre', header: 'Producto' },
                  { key: 'stock_actual', header: 'Actual' },
                  { key: 'stock_minimo', header: 'Mínimo' },
                ]}
                rows={reporteInventario.stock_bajo || []}
                searchable={true}
                pageSize={6}
              />
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
              </div>
            )}
          </ReportCard>

          {/* Proveedores */}
          <ReportCard
            title="Proveedores"
            icon={faTruck}
            iconColor="text-teal-600 dark:text-teal-400"
            iconBgColor="bg-teal-100 dark:bg-teal-900"
            onRefresh={fetchReporteProveedores}
            onExportPDF={reporteProveedores ? () => handleExportPDF('proveedores', reporteProveedores) : null}
            onExportJSON={reporteProveedores ? () => exportJSON('reporte_proveedores.json', reporteProveedores) : null}
            onExportCSV={reporteProveedores ? () => downloadCSV('reporte_proveedores.csv', toCSV(reporteProveedores.por_productos || [])) : null}
            loading={loading}
            canExport={!!reporteProveedores}
          >
            {reporteProveedores ? (
              <DataTable
                title="Por productos"
                columns={[
                  { key: 'nombre', header: 'Proveedor' },
                  { key: 'total_productos', header: 'Productos' },
                ]}
                rows={reporteProveedores.por_productos || []}
                searchable={true}
                pageSize={6}
              />
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
              </div>
            )}
          </ReportCard>

          {/* Usuarios */}
          <ReportCard
            title="Usuarios"
            icon={faUsers}
            iconColor="text-pink-600 dark:text-pink-400"
            iconBgColor="bg-pink-100 dark:bg-pink-900"
            onRefresh={fetchReporteUsuarios}
            onExportPDF={reporteUsuarios ? () => handleExportPDF('usuarios', reporteUsuarios) : null}
            onExportJSON={reporteUsuarios ? () => exportJSON('reporte_usuarios.json', reporteUsuarios) : null}
            onExportCSV={reporteUsuarios ? () => downloadCSV('reporte_usuarios.csv', toCSV(reporteUsuarios.por_rol || [])) : null}
            loading={loading}
            canExport={!!reporteUsuarios}
          >
            {reporteUsuarios ? (
              <div className="space-y-4">
                {reporteUsuarios.por_rol?.length > 0 && (
                  <PieChart
                    title="Por rol"
                    labels={reporteUsuarios.por_rol.map(i => i.rol__nombre)}
                    data={reporteUsuarios.por_rol.map(i => i.total)}
                  />
                )}
                <DataTable
                  title="Roles"
                  columns={[
                    { key: 'rol__nombre', header: 'Rol' },
                    { key: 'total', header: 'Usuarios' },
                  ]}
                  rows={reporteUsuarios.por_rol || []}
                  searchable={false}
                  pageSize={5}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
              </div>
            )}
          </ReportCard>
        </div>
      </div>
    </div>
  );
};

export default ReportesPage;
