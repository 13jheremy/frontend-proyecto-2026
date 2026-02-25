// src/modulos/pos/index.js

// Components
export { default as ProductSearchInput } from './components/ProductSearchInput';
export { default as ClientSearchInput } from './components/ClientSearchInput';
export { default as CartSummary } from './components/CartSummary';
export { default as CreateClientModal } from './components/CreateClientModal';
export { default as MotoSearchInput } from './components/MotoSearchInput';
export { default as ServiceSearchInput } from './components/ServiceSearchInput';
export { default as TechnicianSelector } from './components/TechnicianSelector';

// Pages
export { default as NuevaVentaPage } from './pages/NuevaVentaPage';
export { default as NuevoMantenimientoPage } from './pages/NuevoMantenimientoPage';
export { default as NuevoMantenimientoPOSPage } from './pages/NuevoMantenimientoPOSPage';

// Hooks
export { usePOS } from './hooks/usePOS';
export { useCarrito } from './hooks/useCarrito';
export { useClientes } from './hooks/useClientes';
export { useMaintenanceCart } from './hooks/useMaintenanceCart';

