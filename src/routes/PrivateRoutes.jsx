import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Dashboard from '../pages/Dashboard';

import AuthGuard from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { PermissionGuard } from '../guards/PermissionGuard';

//Páginas principales
import UsuariosPage from '../modulos/usuarios/pages/UsuariosPage';
import RolesPage from '../modulos/roles/pages/RolesPage';
import ProductoPage from '../modulos/productos/pages/ProductoPage';
import ProveedoresPage from '../modulos/proveedores/pages/ProveedoresPage';
import VentasPage from '../modulos/ventas/pages/VentasPage.jsx';
import ReportesPage from '../modulos/reportes/pages/ReportesPage.jsx';
import MotoPage from '../modulos/motos/pages/MotoPage.jsx'
import ServicioPage from '../modulos/servicios/pages/ServicioPage.jsx';
import CombinedCategoriaPage from '../modulos/categorias/pages/CombinedCategoriaPage.jsx';
import MantenimientoPage from '../modulos/mantenimiento/pages/MantenimientoPage.jsx';
import TechnicianMantenimientoPage from '../modulos/mantenimiento/pages/TechnicianMantenimientoPage.jsx';
import InventarioPage from '../modulos/inventario/pages/InventarioPage';
import MovimientosPage from '../modulos/inventario/pages/MovimientosPage';
import POSRoutes from '../modulos/pos/routes/POSRoutes';
import NuevaVentaPage from '../modulos/pos/pages/NuevaVentaPage';
import NuevoMantenimientoPOSPage from "../modulos/pos/pages/NuevoMantenimientoPOSPage";
import LoginPage from '../pages/Login';
import PerfilPage from '../modulos/perfil/pages/PerfilPage.jsx';
import BusinessIntelligencePage from '../modulos/business-intelligence/pages/BusinessIntelligencePage.jsx';

// Páginas específicas para clientes
import MisMotosPage from '../modulos/cliente/pages/MisMotosPage';
import MisMantenimientosPage from '../modulos/cliente/pages/MisMantenimientosPage';
import MisComprasPage from '../modulos/cliente/pages/MisComprasPage';
import MiPerfilPage from '../modulos/cliente/pages/MiPerfilPage';
import RecordatoriosPage from '../modulos/recordatorios/pages/RecordatoriosPage.jsx';

// Configuración de rutas con roles
const routesConfig = [
  // Módulo de Usuario y Seguridad
  { path: '/usuarios', component: UsuariosPage, roles: ['administrador','empleado'] },
  { path: '/roles', component: RolesPage, roles: ['administrador'] },
  
  // Módulo de Clientes y Proveedores
  { path: '/proveedores', component: ProveedoresPage, roles: ['administrador','empleado'] },
  { path: '/mantenimiento', component: MantenimientoPage, roles: ['administrador', 'empleado'] },
  { path: '/mantenimientos', component: TechnicianMantenimientoPage, roles: ['tecnico', 'empleado'] },
  { path: '/recordatorios', component: RecordatoriosPage, roles: ['administrador', 'tecnico', 'empleado'] },

  // Módulo de Productos y Servicios
  { path: '/productos', component: ProductoPage, roles: ['administrador', 'empleado'] },
  { path: '/servicios', component: ServicioPage, roles: ['administrador', 'empleado'], viewRoles: ['tecnico'] },
  { path: '/categorias', component: CombinedCategoriaPage, roles: ['administrador', 'empleado'] },
  
  // Módulo de Mantenimientos y Vehículos
  { path: '/motos', component: MotoPage, roles: ['administrador', 'empleado', 'tecnico'], viewRoles: ['cliente'] },

  
  // Módulo de Ventas e Inventario
  { path: '/ventas', component: VentasPage, roles: ['administrador','empleado'], viewRoles: ['cliente'] },
  { path: '/inventario', component: InventarioPage, roles: ['administrador','empleado'], viewRoles: ['tecnico'] },
  { path: '/movimientos', component: MovimientosPage, roles: ['administrador','empleado'], viewRoles: ['tecnico'] },
  { path: '/reportes', component: ReportesPage, roles: ['administrador','empleado'] },
  { path: '/business-intelligence', component: BusinessIntelligencePage, roles: ['administrador','empleado'] },
  
  // Módulo POS - Páginas independientes
  { path: '/nueva-venta', component: NuevaVentaPage, roles: ['administrador','empleado'] },
  { path: '/nuevo-mantenimiento', component: NuevoMantenimientoPOSPage, roles: ['administrador','empleado','tecnico'] },
  { path: '/perfil', component: PerfilPage, roles: ['administrador','empleado','técnico','cliente'] },

];

const PrivateRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta de login */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />

      {/* Dashboard - Role-based */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <RoleGuard requiredRoles={['administrador', 'empleado', 'tecnico', 'cliente']}>
              <Dashboard />
            </RoleGuard>
          </AuthGuard>
        }
      />

      {/* Dashboard específico para clientes */}
      <Route 
        path="/dashboard" 
        element={
          <RoleGuard requiredRoles={['cliente']}>
            <Dashboard />
          </RoleGuard>
        } 
      />

      {/* Rutas específicas para clientes */}
      <Route 
        path="/mis-motos" 
        element={
          <RoleGuard requiredRoles={['cliente']}>
            <MisMotosPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="/mis-mantenimientos" 
        element={
          <RoleGuard requiredRoles={['cliente']}>
            <MisMantenimientosPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="/mis-compras" 
        element={
          <RoleGuard requiredRoles={['cliente']}>
            <MisComprasPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="/perfil" 
        element={
          <RoleGuard requiredRoles={['cliente']}>
            <MiPerfilPage />
          </RoleGuard>
        } 
      />

      {/* POS Module Routes */}
      <Route
        path="/pos/*"
        element={
          <AuthGuard>
            <RoleGuard requiredRoles={['administrador', 'empleado', 'tecnico']}>
              <POSRoutes />
            </RoleGuard>
          </AuthGuard>
        }
      />

      {/* Rutas dinámicas protegidas */}
      {routesConfig.map(({ path, component: Component, roles, viewRoles }) => {
        // Combinar roles de escritura y solo lectura
        const allAllowedRoles = [...(roles || []), ...(viewRoles || [])];
        
        return (
          <Route
            key={path}
            path={path}
            element={
              <AuthGuard>
                <RoleGuard requiredRoles={allAllowedRoles}>
                  <Component />
                </RoleGuard>
              </AuthGuard>
            }
          />
        );
      })}

      {/* Ruta 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">404</h1>
              <p className="text-gray-600">Página no encontrada</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default PrivateRoutes;
