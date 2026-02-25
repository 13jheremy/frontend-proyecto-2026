// src/modulos/business-intelligence/api/biAPI.js

import api from '../../../services/api';
import { API_CONFIG } from '../../../utils/constants';

const biAPI = {
  // Métricas en tiempo real
  getRealTimeMetrics: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.DASHBOARD_STATS);
      
      // Mapear los datos del backend a nuestro formato BI
      const backendData = response.data.data || response.data;
      
      const biMetrics = {
        ventasHoy: backendData.ventas_hoy || 0,
        ingresosHoy: backendData.ingresos_hoy || 0,
        mantenimientosActivos: backendData.mantenimientos_activos || 0,
        stockBajo: backendData.productos_stock_bajo || 0,
        clientesNuevos: backendData.clientes_nuevos || 0,
        eficienciaTecnicos: backendData.eficiencia_tecnicos || 85,
        
        // Datos de gráficos (por ahora mock hasta implementar endpoints específicos)
        profitability: {
          labels: ['Repuestos', 'Aceites', 'Filtros', 'Llantas', 'Baterías'],
          datasets: [{
            label: 'Margen (%)',
            data: [25, 35, 20, 40, 30],
            backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'],
            borderRadius: 4
          }]
        },
        
        technicianPerformance: {
          labels: ['Velocidad', 'Calidad', 'Satisfacción', 'Eficiencia', 'Puntualidad'],
          datasets: [{
            label: 'Técnico A',
            data: [85, 90, 88, 92, 87],
            borderColor: '#8B5CF6',
            backgroundColor: '#8B5CF630',
            pointBackgroundColor: '#8B5CF6'
          }, {
            label: 'Técnico B',
            data: [78, 85, 82, 88, 90],
            borderColor: '#EF4444',
            backgroundColor: '#EF444430',
            pointBackgroundColor: '#EF4444'
          }]
        },
        
        customerSegmentation: {
          labels: ['VIP', 'Frecuente', 'Ocasional', 'Nuevo'],
          datasets: [{
            data: [25, 35, 30, 10],
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        
        // Predicciones
        demandForecast: '+18% productos',
        revenueTrend: '+15.3%',
        behaviorPattern: 'Pico vespertino',
        
        // KPIs avanzados
        roi: '24.5%',
        avgMaintenanceTime: '3.2h',
        customerSatisfaction: '4.7/5',
        operationalEfficiency: '87%'
      };

      return {
        success: true,
        data: biMetrics
      };
    } catch (error) {
      console.error('Error al obtener métricas en tiempo real:', error);
      return {
        success: false,
        error: 'Error al obtener métricas en tiempo real'
      };
    }
  },

  // Analytics avanzados
  getAdvancedAnalytics: async (timeRange = '7d') => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.BI_ANALYTICS_ADVANCED}?range=${timeRange}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error al obtener analytics avanzados:', error);
      return {
        success: false,
        error: 'Error al obtener analytics avanzados'
      };
    }
  },

  // Forecasting
  getDemandForecast: async (productId = null, days = 7) => {
    try {
      const params = new URLSearchParams();
      if (productId) params.append('product_id', productId);
      params.append('days', days);
      
      const response = await api.get(`${API_CONFIG.ENDPOINTS.BI_DEMAND_FORECAST}?${params}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error al obtener pronóstico de demanda:', error);
      return {
        success: false,
        error: 'Error al obtener pronóstico de demanda'
      };
    }
  },

  // Análisis de rentabilidad
  getProfitabilityAnalysis: async (type = 'product') => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.BI_PROFITABILITY_ANALYSIS}${type}/`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error al obtener análisis de rentabilidad:', error);
      return {
        success: false,
        error: 'Error al obtener análisis de rentabilidad'
      };
    }
  },

  // Performance de técnicos
  getTechnicianPerformance: async (technicianId = null) => {
    try {
      const url = technicianId 
        ? `${API_CONFIG.ENDPOINTS.BI_TECHNICIAN_PERFORMANCE}${technicianId}/`
        : API_CONFIG.ENDPOINTS.BI_TECHNICIAN_PERFORMANCE;
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error al obtener performance de técnicos:', error);
      return {
        success: false,
        error: 'Error al obtener performance de técnicos'
      };
    }
  },

  // Segmentación de clientes
  getCustomerSegmentation: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.BI_CUSTOMER_SEGMENTATION);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error al obtener segmentación de clientes:', error);
      return {
        success: false,
        error: 'Error al obtener segmentación de clientes'
      };
    }
  },

  // Análisis de tendencias
  getTrendAnalysis: async (metric, timeRange = '30d') => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.BI_TREND_ANALYSIS}${metric}/?range=${timeRange}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error al obtener análisis de tendencias:', error);
      return {
        success: false,
        error: 'Error al obtener análisis de tendencias'
      };
    }
  },

  // KPIs personalizados
  getCustomKPIs: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.BI_CUSTOM_KPIS);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error al obtener KPIs personalizados:', error);
      return {
        success: false,
        error: 'Error al obtener KPIs personalizados'
      };
    }
  }
};

export { biAPI };
export default biAPI;
