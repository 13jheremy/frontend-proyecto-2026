// src/modulos/ventas/pages/VentasPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useVentas } from '../hooks/useVentas';
import VentaTable from './components/VentaTable';
import VentaSearch from './components/VentaSearch';
import VentaActionModal from './components/VentaActionModal';
import VentaDetalleModal from './components/VentaDetalleModal';
import PagoModal from './components/PagoModal';
import VentaEditEstadoModal from './components/VentaEditEstadoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faShoppingCart, faCheckCircle, faClock, faTimes, faArchive, faChartLine, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS, PAYMENT_STATUS_COLORS } from '../../../utils/constants';
import { pagosAPI } from '../api/ventasAPI';
import { hasPermission } from '../../../utils/rolePermissions';
import { useAuth } from '../../../context/AuthContext';
import { showNotification } from '../../../utils/notifications';

const VentasPage = () => {
  const { user, roles } = useAuth();
  
  // Validar que el usuario y roles estén cargados antes de calcular permisos
  if (!user || !roles) {
    return (
      <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">⏳ Esperando usuario...</div>
        </div>
      </div>
    );
  }

  // Función para verificar permisos con normalización
  const canPerformAction = (requiredPerms) => {
    const normalizedRoles = roles.map(r => r.toLowerCase());
    const normalizedPerms = requiredPerms.map(p => p.toLowerCase());
    const canDo = normalizedRoles.some(r => normalizedPerms.includes(r));
    return canDo;
  };
  
  // Calcular permisos
  const canCreate = canPerformAction(PERMISSIONS.SALES.CREATE);
  const canEdit = canPerformAction(PERMISSIONS.SALES.EDIT);
  const canDelete = canPerformAction(PERMISSIONS.SALES.DELETE);
  const canManagePayments = canPerformAction(PERMISSIONS.SALES.PAYMENTS);
  
  // Objeto de permisos para pasar a la tabla
  const tablePermissions = {
    canEdit,
    canDelete,
    canChangeStatus: canEdit,
    canRestore: canEdit,
    canManagePayments
  };
  
  // Hook principal de ventas
  const {
    ventas,
    loading,
    error: apiError,
    fetchVentas,
    createVenta,
    updateVenta,
    handleVentaAction,
    cambiarEstadoVenta,
    clearError,
    pagination,
    fetchEstadisticas
  } = useVentas();

  // Estados para modales (solo detalle, sin crear/editar)
  const [currentVenta, setCurrentVenta] = useState(null);

  // Estados para modal de acción (borrar/activar/etc.)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionVenta, setSelectedActionVenta] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Estados para modal de detalle
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [selectedDetalleVenta, setSelectedDetalleVenta] = useState(null);

  // Estados para modal de pago
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [selectedPagoVenta, setSelectedPagoVenta] = useState(null);
  const [pagoLoading, setPagoLoading] = useState(false);

  // Estados para modal de editar estado
  const [isEditEstadoModalOpen, setIsEditEstadoModalOpen] = useState(false);
  const [selectedEditVenta, setSelectedEditVenta] = useState(null);
  const [editEstadoLoading, setEditEstadoLoading] = useState(false);

  // Estados para búsqueda y paginación
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    completadas: 0,
    pendientes: 0,
    canceladas: 0,
    eliminadas: 0
  });

  // Función para abrir modal de acción
  const openAction = (venta, type) => {
    setSelectedActionVenta(venta);
    setActionType(type);
    setActionModalOpen(true);
  };

  // Función para confirmar acciones
  const handleConfirmAction = async (ventaId, type) => {
    try {
      await handleVentaAction(ventaId, type);
      fetchVentas(filters, page, pageSize);
      setActionModalOpen(false);
      setSelectedActionVenta(null);
      setActionType(null);
    } catch (err) {
      console.error(`Error en acción ${type}:`, err);
    }
  };

  // Handlers para detalle
  const handleDetalleVenta = useCallback((venta) => {
    setSelectedDetalleVenta(venta);
    setIsDetalleModalOpen(true);
  }, []);

  // Handlers para acciones de venta
  const handleSoftDeleteVenta = useCallback((ventaId) => {
    const venta = ventas.find(v => v.id === ventaId);
    if (!venta) return;
    openActionModal(venta, 'softDelete');
  }, [ventas]);

  const handleRestoreVenta = useCallback((ventaId) => {
    const venta = ventas.find(v => v.id === ventaId);
    if (!venta) return;
    openAction(venta, 'restore');
  }, [ventas]);

  const handleCambiarEstado = useCallback(async (ventaId, nuevoEstado) => {
    try {
      await cambiarEstadoVenta(ventaId, nuevoEstado);
      fetchVentas(filters, page, pageSize);
    } catch (err) {
      console.error('Error cambiando estado:', err);
    }
  }, [cambiarEstadoVenta, fetchVentas, filters, page, pageSize]);

  // Función para ver información detallada de venta
  const handleInfoVenta = (venta) => {
    setSelectedDetalleVenta(venta);
    setIsDetalleModalOpen(true);
  };

  // Handlers para pagos
  const handleRegistrarPago = useCallback((venta) => {
    setSelectedPagoVenta(venta);
    setIsPagoModalOpen(true);
  }, []);

  const handleConfirmarPago = async (pagoData) => {
    setPagoLoading(true);
    try {
      await pagosAPI.crear(pagoData);
      showNotification.success('Pago registrado exitosamente');
      // Recargar ventas para actualizar saldos
      await fetchVentas(filters, page, pageSize);
      setIsPagoModalOpen(false);
      setSelectedPagoVenta(null);
    } catch (error) {
      console.error('Error registrando pago:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          'Error al registrar pago';
      showNotification.error(errorMessage);
      throw error;
    } finally {
      setPagoLoading(false);
    }
  };

  // Handlers para editar estado
  const handleEditarEstado = useCallback((venta) => {
    setSelectedEditVenta(venta);
    setIsEditEstadoModalOpen(true);
  }, []);

  const handleConfirmarEditEstado = async (ventaId, updateData) => {
    setEditEstadoLoading(true);
    try {
      await updateVenta(ventaId, updateData);
      showNotification.success('Estado y método de pago actualizados exitosamente');
      // Recargar ventas para mostrar cambios
      await fetchVentas(filters, page, pageSize);
      setIsEditEstadoModalOpen(false);
      setSelectedEditVenta(null);
    } catch (error) {
      console.error('Error actualizando estado:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          'Error al actualizar estado';
      showNotification.error(errorMessage);
      throw error;
    } finally {
      setEditEstadoLoading(false);
    }
  };

  // Handler para búsqueda
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handler para cerrar modales y limpiar errores
  const handleCloseModals = () => {
    setCurrentVenta(null);
    clearError();
  };

  // Cargar estadísticas
  const loadEstadisticas = useCallback(async () => {
    try {
      const stats = await fetchEstadisticas();
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, [fetchEstadisticas]);

  // Función para obtener estadísticas de la página actual
  const getEstadisticasLocales = () => {
    const total = pagination.totalItems || 0;
    const completadas = ventas.filter(v => v.estado === 'completada' && !v.eliminado).length;
    const pendientes = ventas.filter(v => v.estado === 'pendiente' && !v.eliminado).length;
    const canceladas = ventas.filter(v => v.estado === 'cancelada' && !v.eliminado).length;
    const eliminadas = ventas.filter(v => v.eliminado).length;

    return { total, completadas, pendientes, canceladas, eliminadas };
  };

  const estadisticasLocales = getEstadisticasLocales();

  // Efecto para recargar datos cuando cambien filtros o paginación
  useEffect(() => {
    fetchVentas(filters, page, pageSize);
  }, [filters, page, pageSize, fetchVentas]);

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faShoppingCart} className="mr-3 text-blue-600" />
          Gestión de Ventas
        </h1>

        {/* ESTADÍSTICAS MEJORADAS */}
        <div className="hidden md:flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estadisticasLocales.total}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {estadisticasLocales.completadas}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Completadas
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {estadisticasLocales.pendientes}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pendientes
            </div>
          </div>

          {estadisticasLocales.canceladas > 0 && (
            <>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {estadisticasLocales.canceladas}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Canceladas
                </div>
              </div>
            </>
          )}

          {estadisticasLocales.eliminadas > 0 && (
            <>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 flex items-center">
                  {estadisticasLocales.eliminadas}
                  <FontAwesomeIcon icon={faArchive} className="ml-1 text-sm" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Eliminadas
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="mb-6">
        <VentaSearch
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />
      </div>

      {/* INFORMACIÓN DE ESTADO */}
      <div className="flex flex-wrap gap-4 mb-6">

        {estadisticasLocales.completadas > 0 && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            {estadisticasLocales.completadas} venta{estadisticasLocales.completadas !== 1 ? 's' : ''} completada{estadisticasLocales.completadas !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticasLocales.pendientes > 0 && (
          <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            {estadisticasLocales.pendientes} pendiente{estadisticasLocales.pendientes !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticasLocales.canceladas > 0 && (
          <div className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-md">
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            {estadisticasLocales.canceladas} cancelada{estadisticasLocales.canceladas !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Ventas por página:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setPage(1);
          }}
          className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* TABLA DE VENTAS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <VentaTable
          ventas={ventas}
          permissions={tablePermissions}
          onInfo={handleInfoVenta}
          onSoftDelete={handleSoftDeleteVenta}
          onRestore={handleRestoreVenta}
          onCambiarEstado={handleCambiarEstado}
          onDetalle={handleDetalleVenta}
          onRegistrarPago={handleRegistrarPago}
          onEditarEstado={handleEditarEstado}
          loading={loading}
        />
      </div>

      {/* PAGINACIÓN */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <button
            disabled={!pagination.previous}
            onClick={() => setPage(prev => prev - 1)}
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <span className="px-3 py-1">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.next}
            onClick={() => setPage(prev => prev + 1)}
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* MODALES */}

      {/* Modal para confirmar acciones */}
      <VentaActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedActionVenta(null);
          setActionType(null);
        }}
        venta={selectedActionVenta}
        actionType={actionType}
        onConfirm={handleConfirmAction}
      />

      {/* Modal para ver detalle de la venta */}
      <VentaDetalleModal
        isOpen={isDetalleModalOpen}
        onClose={() => {
          setIsDetalleModalOpen(false);
          setSelectedDetalleVenta(null);
        }}
        venta={selectedDetalleVenta}
      />

      {/* Modal para registrar pago */}
      <PagoModal
        isOpen={isPagoModalOpen}
        onClose={() => {
          setIsPagoModalOpen(false);
          setSelectedPagoVenta(null);
        }}
        venta={selectedPagoVenta}
        onConfirm={handleConfirmarPago}
        loading={pagoLoading}
      />

      {/* Modal para editar estado y método de pago */}
      <VentaEditEstadoModal
        isOpen={isEditEstadoModalOpen}
        onClose={() => {
          setIsEditEstadoModalOpen(false);
          setSelectedEditVenta(null);
        }}
        venta={selectedEditVenta}
        onConfirm={handleConfirmarEditEstado}
        loading={editEstadoLoading}
      />
    </div>
  );
};

export default VentasPage;
