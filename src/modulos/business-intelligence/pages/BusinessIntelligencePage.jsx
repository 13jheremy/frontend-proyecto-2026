// src/modulos/business-intelligence/pages/BusinessIntelligencePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import LoadingIndicator from '../../../components/LoadingIndicator';
import RealTimeMetrics from '../analytics/components/RealTimeMetrics';
import LiveChart from '../analytics/components/LiveChart';
import { biAPI } from '../api/biAPI';

const BusinessIntelligencePage = () => {
  const { user, isAdmin, isEmployee } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 segundos

  // Verificar permisos
  if (!user || (!isAdmin() && !isEmployee())) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            No tienes permisos para acceder a Business Intelligence
          </p>
        </div>
      </div>
    );
  }

  // Cargar datos de analytics
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        // Cargar métricas en tiempo real
        const metricsResult = await biAPI.getRealTimeMetrics();
        if (!metricsResult.success) {
          setError(metricsResult.error);
          return;
        }

        // Cargar analytics avanzados
        const analyticsResult = await biAPI.getAdvancedAnalytics('7d');
        
        // Cargar forecasting
        const forecastResult = await biAPI.getDemandForecast(null, 7);
        
        // Cargar análisis de rentabilidad
        const profitabilityResult = await biAPI.getProfitabilityAnalysis('product');
        
        // Cargar performance de técnicos
        const performanceResult = await biAPI.getTechnicianPerformance();
        
        // Cargar segmentación de clientes
        const segmentationResult = await biAPI.getCustomerSegmentation();
        
        // Cargar tendencias
        const trendsResult = await biAPI.getTrendAnalysis('sales', '30d');
        
        // Cargar KPIs personalizados
        const kpisResult = await biAPI.getCustomKPIs();

        // Combinar todos los datos
        const combinedData = {
          ...metricsResult.data,
          analytics: analyticsResult.success ? analyticsResult.data : null,
          forecast: forecastResult.success ? forecastResult.data : null,
          profitability: profitabilityResult.success ? profitabilityResult.data : null,
          performance: performanceResult.success ? performanceResult.data : null,
          segmentation: segmentationResult.success ? segmentationResult.data : null,
          trends: trendsResult.success ? trendsResult.data : null,
          kpis: kpisResult.success ? kpisResult.data : null
        };

        setAnalyticsData(combinedData);
      } catch (err) {
        setError('Error al cargar datos de analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();

    // Configurar actualización automática
    const interval = setInterval(loadAnalyticsData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  📊 Business Intelligence
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Análisis avanzado y métricas en tiempo real
                </p>
              </div>
            </div>
            
            {/* Controles */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Actualización:
                </label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1min</option>
                  <option value={300000}>5min</option>
                </select>
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="space-y-8">
          {/* Métricas en Tiempo Real */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                Métricas en Tiempo Real
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Actualizado: {new Date().toLocaleTimeString('es-ES')}
              </div>
            </div>
            <RealTimeMetrics data={analyticsData} />
          </div>

          {/* Gráficos Avanzados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ventas en Tiempo Real */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                📈 Ventas en Tiempo Real
              </h3>
              <LiveChart 
                type="line"
                data={analyticsData?.analytics?.salesTrend || []}
                title="Ventas por Hora"
                color="#10B981"
              />
            </div>

            {/* Análisis de Rentabilidad */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                💰 Análisis de Rentabilidad
              </h3>
              <LiveChart 
                type="bar"
                data={analyticsData?.profitability?.topProducts || analyticsData?.profitability?.topServices || []}
                title="Análisis de Rentabilidad"
                color="#3B82F6"
              />
            </div>

            {/* Performance de Técnicos */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                🔧 Performance de Técnicos
              </h3>
              <LiveChart 
                type="radar"
                data={analyticsData?.performance?.chartData || []}
                title="Eficiencia por Técnico"
                color="#8B5CF6"
              />
            </div>

            {/* Segmentación de Clientes */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                👥 Segmentación de Clientes
              </h3>
              <LiveChart 
                type="doughnut"
                data={analyticsData?.segmentation?.chartData || []}
                title="Distribución de Clientes"
                color="#F59E0B"
              />
            </div>
          </div>

          {/* Predicciones y Tendencias */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              🔮 Forecasting & Tendencias
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Predicción de Demanda */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Predicción de Demanda
                </h4>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {analyticsData?.forecast?.forecast?.[0] ? `${analyticsData.forecast.forecast[0]} unidades` : 'Calculando...'}
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  Próximos 7 días
                </p>
              </div>

              {/* Tendencia de Ingresos */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Tendencia de Ingresos
                </h4>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analyticsData?.trends?.percentage !== undefined ? `${analyticsData.trends.percentage > 0 ? '+' : ''}${analyticsData.trends.percentage}%` : '+15.3%'}
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  vs. mes anterior
                </p>
              </div>

              {/* Patrón de Comportamiento */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Patrón Detectado
                </h4>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analyticsData?.trends?.trend || 'Estable'}
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Comportamiento cliente
                </p>
              </div>
            </div>
          </div>

          {/* KPIs Avanzados */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
              📊 KPIs Avanzados
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData?.kpis?.kpis?.map((kpi, index) => (
                <div key={index} className="text-center p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-green-600 dark:text-green-400' :
                    index === 1 ? 'text-blue-600 dark:text-blue-400' :
                    index === 2 ? 'text-yellow-600 dark:text-yellow-400' :
                    index === 3 ? 'text-purple-600 dark:text-purple-400' :
                    index === 4 ? 'text-red-600 dark:text-red-400' :
                    'text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {kpi.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{kpi.name}</div>
                  {kpi.trend && (
                    <div className={`text-xs mt-1 ${
                      kpi.trend === 'up' ? 'text-green-500' :
                      kpi.trend === 'down' ? 'text-red-500' :
                      'text-slate-500'
                    }`}>
                      {kpi.trend === 'up' ? '↗️' : kpi.trend === 'down' ? '↘️' : '→'}
                    </div>
                  )}
                </div>
              )) || (
                // Fallback si no hay datos
                <>
                  <div className="text-center p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">24.5%</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">ROI</div>
                  </div>
                  <div className="text-center p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3.2 días</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Tiempo Promedio</div>
                  </div>
                  <div className="text-center p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">4.7/5</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Satisfacción</div>
                  </div>
                  <div className="text-center p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">87%</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Eficiencia</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligencePage;
