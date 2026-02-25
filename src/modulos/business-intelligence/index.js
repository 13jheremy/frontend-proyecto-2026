// src/modulos/business-intelligence/index.js

// Analytics components
export { default as AnalyticsPage } from './analytics/pages/AnalyticsPage';
export { default as RealTimeMetrics } from './analytics/components/RealTimeMetrics';
export { default as LiveChart } from './analytics/components/LiveChart';

// Dashboard BI
export { default as BusinessIntelligencePage } from './pages/BusinessIntelligencePage';

// API services
export { default as analyticsAPI } from './api/analyticsAPI';
export { default as biAPI } from './api/biAPI';

// Hooks
export { default as useRealTimeData } from './hooks/useRealTimeData';
export { default as useAnalytics } from './hooks/useAnalytics';

// Utils
export * from './utils/chartConfig';
export * from './utils/metricsCalculations';
export * from './utils/dataTransformers';
