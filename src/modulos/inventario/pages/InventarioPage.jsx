// src/modulos/inventario/pages/InventarioPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useInventario } from '../hooks/useInventario';
import InventarioTable from './components/InventarioTable';
import InventarioSearch from './components/InventarioSearch';
import InventarioCreateModal from './components/InventarioCreateModal';
import InventarioEditModal from './components/InventarioEditModal';
import InventarioActionModal from './components/InventarioActionModal';
import InfoInventarioModal from './components/InfoInventarioModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBoxes, faCheckCircle, faBan, faWarning, faArchive, faExclamationTriangle, faCubes } from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS } from '../../../utils/constants';
import { hasPermission } from '../../../utils/rolePermissions';
import { useAuth } from '../../../context/AuthContext';

const InventarioPage = () => {
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
  const canCreate = canPerformAction(PERMISSIONS.INVENTORY.CREATE);
  const canEdit = canPerformAction(PERMISSIONS.INVENTORY.EDIT);
  const canDelete = canPerformAction(PERMISSIONS.INVENTORY.DELETE);
  
  // Objeto de permisos para pasar a la tabla
  const tablePermissions = {
    canEdit,
    canDelete,
    canRestore: canEdit,
    canHardDelete: canDelete
  };
  
  // Hook principal de inventario
  const {
    inventarios,
    loading,
    error: apiError,
    fetchInventarios,
    createInventario,
    updateInventario,
    handleInventarioAction,
    clearError,
    pagination,
    fetchEstadisticas,
    fetchProductosStockBajo
  } = useInventario();

  // Estados para modales
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    action: false,
    info: false,
  });

  const [selectedInventario, setSelectedInventario] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Estados para búsqueda y paginación
  const [filters, setFilters] = useState({
    search: '',
    activo: '',
    eliminado: '',
    stock_bajo: ''
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState(null);
  const [productosStockBajo, setProductosStockBajo] = useState([]);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const loadEstadisticas = async () => {
      try {
        const stats = await fetchEstadisticas();
        setEstadisticas(stats);
        
        const stockBajo = await fetchProductosStockBajo();
        setProductosStockBajo(stockBajo);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };

    loadEstadisticas();
  }, [fetchEstadisticas, fetchProductosStockBajo]);

  // Manejar búsqueda y filtros
  const handleSearch = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchInventarios(newFilters, 1, pageSize);
  }, [fetchInventarios, pageSize]);

  // Limpiar filtros
  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
    fetchInventarios({}, 1, pageSize);
  }, [fetchInventarios, pageSize]);

  // Manejar cambio de página
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    fetchInventarios(filters, newPage, pageSize);
  }, [fetchInventarios, filters, pageSize]);

  // Manejar cambio de tamaño de página
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1);
    fetchInventarios(filters, 1, newPageSize);
  }, [fetchInventarios, filters]);

  // Abrir modal de creación
  const openCreateModal = () => {
    setSelectedInventario(null);
    setModals((prevModals) => ({ ...prevModals, create: true }));
  };

  // Abrir modal de edición
  const openEditModal = (inventario) => {
    setSelectedInventario(inventario);
    setModals((prevModals) => ({ ...prevModals, edit: true }));
  };

  // Abrir modal de información
  const openInfoModal = (inventario) => {
    setSelectedInventario(inventario);
    setModals((prevModals) => ({ ...prevModals, info: true }));
  };

  // Abrir modal de acción
  const openActionModal = (inventario, type) => {
    setSelectedInventario(inventario);
    setActionType(type);
    setModals((prevModals) => ({ ...prevModals, action: true }));
  };

  // Cerrar todos los modales
  const closeModal = (modal) => {
    setModals((prevModals) => ({ ...prevModals, [modal]: false }));
    setSelectedInventario(null);
    setActionType(null);
    clearError();
  };

  // Manejar creación de inventario
  const handleCreate = async (inventarioData) => {
    try {
      await createInventario(inventarioData);
      closeModal('create');
      fetchInventarios(filters, page, pageSize);
    } catch (error) {
      console.error('Error creando inventario:', error);
    }
  };

  // Manejar actualización de inventario
  const handleUpdate = async (inventarioData) => {
    try {
      await updateInventario(selectedInventario.id, inventarioData);
      closeModal('edit');
      fetchInventarios(filters, page, pageSize);
    } catch (error) {
      console.error('Error actualizando inventario:', error);
    }
  };

  // Manejar confirmación de acción
  const handleActionConfirm = async () => {
    try {
      await handleInventarioAction(selectedInventario.id, actionType);
      closeModal('action');
      fetchInventarios(filters, page, pageSize);
    } catch (error) {
      console.error('Error ejecutando acción:', error);
    }
  };

  // Función para obtener estadísticas locales
  const getEstadisticasLocales = () => {
    const total = inventarios.length;
    const conStock = inventarios.filter(inv => (inv.stock_actual || 0) > 0).length;
    const stockBajo = inventarios.filter(inv => (inv.stock_actual || 0) <= (inv.stock_minimo || 0) && (inv.stock_actual || 0) > 0).length;
    const sinStock = inventarios.filter(inv => (inv.stock_actual || 0) === 0).length;
    const eliminados = inventarios.filter(inv => inv.eliminado).length;

    return { total, conStock, stockBajo, sinStock, eliminados };
  };

  const estadisticasLocales = getEstadisticasLocales();

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faCubes} className="mr-3 text-blue-600" />
          Gestión de Inventario
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
              {estadisticasLocales.conStock}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Con Stock
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {estadisticasLocales.stockBajo}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Stock Bajo
            </div>
          </div>

          {estadisticasLocales.eliminados > 0 && (
            <>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center">
                  {estadisticasLocales.eliminados}
                  <FontAwesomeIcon icon={faArchive} className="ml-1 text-sm" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Eliminados
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="mb-6">
        <InventarioSearch
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
          loading={loading}
        />
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-wrap gap-4 mb-6">
        {canCreate && (
          <button
            onClick={openCreateModal}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Crear Inventario
          </button>
        )}

        {estadisticasLocales.conStock > 0 && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            {estadisticasLocales.conStock} producto{estadisticasLocales.conStock !== 1 ? 's' : ''} con stock
          </div>
        )}

        {estadisticasLocales.stockBajo > 0 && (
          <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {estadisticasLocales.stockBajo} stock bajo
          </div>
        )}

        {estadisticasLocales.sinStock > 0 && (
          <div className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-md">
            <FontAwesomeIcon icon={faBan} className="mr-2" />
            {estadisticasLocales.sinStock} sin stock
          </div>
        )}
      </div>

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Inventarios por página:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            handlePageSizeChange(parseInt(e.target.value));
          }}
          className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* TABLA DE INVENTARIOS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <InventarioTable
          inventarios={inventarios}
          permissions={tablePermissions}
          onEdit={openEditModal}
          onSoftDelete={(inventario) => openActionModal(inventario, 'softDelete')}
          onHardDelete={(inventario) => openActionModal(inventario, 'hardDelete')}
          onRestore={(inventario) => openActionModal(inventario, 'restore')}
          onToggleActivo={(inventario) => openActionModal(inventario, 'toggleActivo')}
          onInfo={openInfoModal}
          loading={loading}
        />
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <button
            disabled={!pagination.previous}
            onClick={() => handlePageChange(page - 1)}
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <span className="px-3 py-1">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.next}
            onClick={() => handlePageChange(page + 1)}
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modales */}
      <InventarioCreateModal
        isOpen={modals.create}
        onClose={() => closeModal('create')}
        onCreate={handleCreate}
        loading={loading}
        apiError={apiError}
      />
      
      <InventarioEditModal
        isOpen={modals.edit}
        onClose={() => closeModal('edit')}
        onUpdate={handleUpdate}
        currentInventario={selectedInventario}
        loading={loading}
        apiError={apiError}
      />
      
      <InventarioActionModal
        isOpen={modals.action}
        onClose={() => closeModal('action')}
        inventario={selectedInventario}
        actionType={actionType}
        onConfirm={handleActionConfirm}
        loading={loading}
      />
      
      <InfoInventarioModal
        isOpen={modals.info}
        onClose={() => closeModal('info')}
        inventario={selectedInventario}
      />
    </div>
  );
};

export default InventarioPage;
