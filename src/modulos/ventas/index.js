// src/modulos/ventas/index.js
// Exportaciones centralizadas del módulo de ventas

// Páginas principales
export { default as VentasPage } from './pages/VentasPage';

// Componentes
export { default as VentaFormModal } from './pages/components/VentaFormModal';
export { default as VentaDetalleModal } from './pages/components/VentaDetalleModal';
export { default as VentaTable } from './pages/components/VentaTable';
export { default as VentaSearch } from './pages/components/VentaSearch';
export { default as VentaActionModal } from './pages/components/VentaActionModal';

// Hooks
export { default as useVentas } from './hooks/useVentas';

// API
export * as ventasAPI from './api/ventasAPI';
