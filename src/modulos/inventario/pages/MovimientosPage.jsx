// src/modulos/inventario/pages/MovimientosPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useMovimientos } from '../hooks/useMovimientos';
import { inventarioApi } from '../api/inventario';
import { showNotification } from '../../../utils/notifications';
import MovimientoTable from './components/MovimientoTable';
import MovimientoCreateModal from './components/MovimientoCreateModal';
import MovimientoEditModal from './components/MovimientoEditModal';
import MovimientoDeleteModal from './components/MovimientoDeleteModal';
import InfoMovimientoModal from './components/InfoMovimientoModal';
import MovimientoSearch from './components/MovimientoSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faExchangeAlt, faArrowUp, faArrowDown, faAdjust, faArchive, faCheckCircle, faBan } from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS } from '../../../utils/constants';
import { hasPermission } from '../../../utils/rolePermissions';
import { useAuth } from '../../../context/AuthContext';

const MovimientosPage = () => {
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
  const canCreate = canPerformAction(PERMISSIONS.INVENTORY.MOVEMENTS);
  const canEdit = canPerformAction(PERMISSIONS.INVENTORY.EDIT);
  const canDelete = canPerformAction(PERMISSIONS.INVENTORY.DELETE);
  
  // Objeto de permisos para pasar a la tabla
  const tablePermissions = {
    canEdit,
    canDelete,
    canRestore: canDelete // Los mismos permisos para restaurar
  };
  
  // Hook principal de movimientos
  const {
    movimientos,
    loading,
    error: apiError,
    fetchMovimientos,
    createMovimiento,
    updateMovimiento,
    deleteMovimiento,
    restoreMovimiento,
    clearError,
    pagination,
    fetchReporteMovimientos
  } = useMovimientos();

  // Estados para modales
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
    restore: false,
    info: false
  });
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [error, setError] = useState('');

  // Estados para filtros y paginación
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Función para manejar búsqueda
  const handleSearch = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchMovimientos(newFilters, 1, pageSize);
  }, [fetchMovimientos, pageSize]);

  // Manejar cambio de página
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    fetchMovimientos(filters, newPage, pageSize);
  }, [fetchMovimientos, filters, pageSize]);

  // Abrir modal de creación
  const openCreateModal = () => {
    setSelectedMovimiento(null);
    setModals({ ...modals, create: true });
  };

  // Abrir modal de edición
  const openEditModal = async (movimiento) => {
    try {
      // Obtener los datos completos del movimiento
      const response = await inventarioApi.getMovimientoById(movimiento.id);
      setSelectedMovimiento(response);
      setModals({ ...modals, edit: true });
    } catch (error) {
      console.error('Error al cargar los datos del movimiento:', error);
      showNotification.error('No se pudieron cargar los datos completos del movimiento');
    }
  };

  // Abrir modal de información
  const openInfoModal = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setModals({ ...modals, info: true });
  };

  // Abrir modal de eliminación temporal
  const openSoftDeleteModal = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setModals({ ...modals, delete: true });
  };

  // Abrir modal de restauración
  const openRestoreModal = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setModals({ ...modals, restore: true });
  };

  // Cerrar todos los modales
  const closeModal = (modal) => {
    setModals({ ...modals, [modal]: false });
    setSelectedMovimiento(null);
    clearError();
  };

  // Manejar creación de movimiento
  const handleCreate = async (movimientoData) => {
    try {
      await createMovimiento(movimientoData);
      closeModal('create');
      fetchMovimientos(filters, page, pageSize);
    } catch (error) {
      console.error('Error creando movimiento:', error);
    }
  };

  // Manejar actualización de movimiento
  const handleUpdate = async (movimientoData) => {
    try {
      await updateMovimiento(selectedMovimiento.id, movimientoData);
      closeModal('edit');
      fetchMovimientos(filters, page, pageSize);
    } catch (error) {
      console.error('Error actualizando movimiento:', error);
    }
  };

  // Manejar eliminación temporal de movimiento
  const handleSoftDelete = async () => {
    try {
      await deleteMovimiento(selectedMovimiento.id);
      closeModal('delete');
      fetchMovimientos(filters, page, pageSize);
    } catch (error) {
      console.error('Error eliminando movimiento:', error);
    }
  };

  // Manejar restauración de movimiento
  const handleRestore = async () => {
    try {
      await restoreMovimiento(selectedMovimiento.id);
      closeModal('restore');
      fetchMovimientos(filters, page, pageSize);
    } catch (error) {
      console.error('Error restaurando movimiento:', error);
    }
  };

  // Función para obtener estadísticas locales
  const getEstadisticasLocales = () => {
    const total = movimientos.length;
    const entradas = movimientos.filter(m => m.tipo === 'entrada').length;
    const salidas = movimientos.filter(m => m.tipo === 'salida').length;
    const ajustes = movimientos.filter(m => m.tipo === 'ajuste').length;

    return { total, entradas, salidas, ajustes };
  };

  const estadisticasLocales = getEstadisticasLocales();

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faExchangeAlt} className="mr-3 text-blue-600" />
          Movimientos de Inventario
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
              {estadisticasLocales.entradas}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Entradas
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {estadisticasLocales.salidas}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Salidas
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {estadisticasLocales.ajustes}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ajustes
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="mb-6">
        <MovimientoSearch
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
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
            Crear Movimiento
          </button>
        )}

        {estadisticasLocales.entradas > 0 && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <FontAwesomeIcon icon={faArrowUp} className="mr-2" />
            {estadisticasLocales.entradas} entrada{estadisticasLocales.entradas !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticasLocales.salidas > 0 && (
          <div className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-md">
            <FontAwesomeIcon icon={faArrowDown} className="mr-2" />
            {estadisticasLocales.salidas} salida{estadisticasLocales.salidas !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticasLocales.ajustes > 0 && (
          <div className="flex items-center px-3 py-2 bg-purple-100 text-purple-800 rounded-md">
            <FontAwesomeIcon icon={faAdjust} className="mr-2" />
            {estadisticasLocales.ajustes} ajuste{estadisticasLocales.ajustes !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Movimientos por página:</label>
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

      {/* TABLA DE MOVIMIENTOS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <MovimientoTable
          movimientos={movimientos}
          permissions={tablePermissions}
          onEdit={openEditModal}
          onSoftDelete={openSoftDeleteModal}
          onRestore={openRestoreModal}
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
      <MovimientoCreateModal
        isOpen={modals.create}
        onClose={() => closeModal('create')}
        onCreate={handleCreate}
        loading={loading}
        apiError={apiError}
      />
      
      <MovimientoEditModal
        isOpen={modals.edit}
        onClose={() => closeModal('edit')}
        onUpdate={handleUpdate}
        currentMovimiento={selectedMovimiento}
        loading={loading}
        apiError={apiError}
      />
      
      <MovimientoDeleteModal
        isOpen={modals.delete}
        onClose={() => closeModal('delete')}
        movimiento={selectedMovimiento}
        onConfirm={handleSoftDelete}
        loading={loading}
      />
      
      <MovimientoDeleteModal
        isOpen={modals.restore}
        onClose={() => closeModal('restore')}
        movimiento={selectedMovimiento}
        onConfirm={handleRestore}
        loading={loading}
        isRestore={true}
      />
      
      <InfoMovimientoModal
        isOpen={modals.info}
        onClose={() => closeModal('info')}
        movimiento={selectedMovimiento}
      />
    </div>
  );
};

export default MovimientosPage;
