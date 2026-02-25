// src/modules/proveedores/pages/ProveedoresPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useProveedores } from '../hooks/useProveedores';
import ProveedorTable from './components/ProveedorTable';
import ProveedorCreateModal from './components/ProveedorCreateModal';
import ProveedorEditModal from './components/ProveedorEditModal';
import ProveedorSearch from './components/ProveedorSearch';
import ProveedorActionModal from './components/ProveedorActionModal';
import InfoProveedorModal from './components/InfoProveedorModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBuilding, faCheckCircle, faBan, faBoxes, faArchive } from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS } from '../../../utils/constants';
import { hasPermission } from '../../../utils/rolePermissions';
import { useAuth } from '../../../context/AuthContext';

const ProveedoresPage = () => {
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

  // Logs para debugging
  console.log("Roles:", roles);
  console.log("CREATE_PERMS:", PERMISSIONS.SUPPLIERS.CREATE);
  console.log("EDIT_PERMS:", PERMISSIONS.SUPPLIERS.EDIT);
  console.log("DELETE_PERMS:", PERMISSIONS.SUPPLIERS.DELETE);
  
  // Función para verificar permisos con normalización
  const canPerformAction = (requiredPerms) => {
    const normalizedRoles = roles.map(r => r.toLowerCase());
    const normalizedPerms = requiredPerms.map(p => p.toLowerCase());
    const canDo = normalizedRoles.some(r => normalizedPerms.includes(r));
    return canDo;
  };
  
  // Calcular permisos
  const canCreate = canPerformAction(PERMISSIONS.SUPPLIERS.CREATE);
  const canEdit = canPerformAction(PERMISSIONS.SUPPLIERS.EDIT);
  const canDelete = canPerformAction(PERMISSIONS.SUPPLIERS.DELETE);
  
  // Logs después de calcular
  console.log("canCreate:", canCreate, "canEdit:", canEdit, "canDelete:", canDelete);
  
  // Objeto de permisos para pasar a la tabla
  const tablePermissions = {
    canEdit,
    canDelete,
    canToggleActive: canEdit,
    canRestore: canEdit
  };
  
  // Hook principal de proveedores
  const {
    proveedores,
    loading,
    error: apiError,
    fetchProveedores,
    createProveedor,
    updateProveedor,
    handleProveedorAction,
    clearError,
    pagination,
    fetchEstadisticas
  } = useProveedores();

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProveedor, setCurrentProveedor] = useState(null);

  // Estados para modal de acción (borrar/activar/etc.)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionProveedor, setSelectedActionProveedor] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Estados para modal de información
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInfoProveedor, setSelectedInfoProveedor] = useState(null);

  // Estados para búsqueda y paginación
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    eliminados: 0,
    con_productos: 0
  });

  // Función para abrir modal de acción
  const openActionModal = (proveedor, type) => {
    setSelectedActionProveedor(proveedor);
    setActionType(type);
    setActionModalOpen(true);
  };

  // Función para confirmar acciones
  const handleConfirmAction = async (proveedorId, type) => {
    try {
      await handleProveedorAction(proveedorId, type);
      fetchProveedores(filters, page, pageSize);
      setActionModalOpen(false);
      setSelectedActionProveedor(null);
      setActionType(null);
    } catch (err) {
      console.error(`Error en acción ${type}:`, err);
    }
  };

  // Handlers para información
  const handleInfoProveedor = useCallback((proveedor) => {
    setSelectedInfoProveedor(proveedor);
    setIsInfoModalOpen(true);
  }, []);

  // Handlers para acciones de proveedor
  const handleSoftDeleteProveedor = useCallback((proveedorId) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    openActionModal(proveedor, 'softDelete');
  }, [proveedores]);

  const handleHardDeleteProveedor = useCallback((proveedorId) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    openActionModal(proveedor, 'hardDelete');
  }, [proveedores]);

  const handleRestoreProveedor = useCallback((proveedorId) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    openActionModal(proveedor, 'restore');
  }, [proveedores]);

  const handleToggleActivoProveedor = useCallback((id) => {
    const proveedor = proveedores.find(p => p.id === id);
    if (!proveedor) return;
    openActionModal(proveedor, 'toggleActivo');
  }, [proveedores]);

  // Handlers para creación y edición
  const handleCreateProveedor = useCallback(async (proveedorData) => {
    try {
      await createProveedor(proveedorData);
      setIsCreateModalOpen(false);
      fetchProveedores(filters, page, pageSize);
    } catch (err) {
      console.error("Error en handleCreateProveedor:", err);
    }
  }, [createProveedor, fetchProveedores, filters, page, pageSize]);

  const handleEditProveedor = (proveedor) => {
    setCurrentProveedor(proveedor);
    setIsEditModalOpen(true);
  };

  const handleUpdateProveedor = useCallback(async (id, proveedorData) => {
    try {
      await updateProveedor(id, proveedorData);
      setIsEditModalOpen(false);
      setCurrentProveedor(null);
      fetchProveedores(filters, page, pageSize);
    } catch (err) {
      console.error("Error en handleUpdateProveedor:", err);
    }
  }, [updateProveedor, fetchProveedores, filters, page, pageSize]);

  // Handler para búsqueda
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handler para cerrar modales y limpiar errores
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentProveedor(null);
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
    const activos = proveedores.filter(p => p.activo && !p.eliminado).length;
    const inactivos = proveedores.filter(p => !p.activo && !p.eliminado).length;
    const eliminados = proveedores.filter(p => p.eliminado).length;
    const con_productos = proveedores.filter(p => (p.productos_count || 0) > 0).length;

    return { total, activos, inactivos, eliminados, con_productos };
  };

  const estadisticasLocales = getEstadisticasLocales();

  // Efecto para recargar datos cuando cambien filtros o paginación
  useEffect(() => {
    fetchProveedores(filters, page, pageSize);
  }, [filters, page, pageSize, fetchProveedores]);

  // Cargar estadísticas al inicializar - comentado para evitar 404
  // useEffect(() => {
  //   loadEstadisticas();
  // }, [loadEstadisticas]);

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faBuilding} className="mr-3 text-blue-600" />
          Gestión de Proveedores
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
              {estadisticasLocales.activos}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Activos
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {estadisticasLocales.con_productos}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Con Productos
            </div>
          </div>

          {estadisticasLocales.eliminados > 0 && (
            <>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center">
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
        <ProveedorSearch
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-wrap gap-4 mb-6">
        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Crear Proveedor
          </button>
        )}

        {estadisticasLocales.activos > 0 && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            {estadisticasLocales.activos} proveedor{estadisticasLocales.activos !== 1 ? 'es' : ''} activo{estadisticasLocales.activos !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticasLocales.con_productos > 0 && (
          <div className="flex items-center px-3 py-2 bg-purple-100 text-purple-800 rounded-md">
            <FontAwesomeIcon icon={faBoxes} className="mr-2" />
            {estadisticasLocales.con_productos} con productos
          </div>
        )}
      </div>

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Proveedores por página:</label>
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

      {/* TABLA DE PROVEEDORES */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <ProveedorTable
          proveedores={proveedores}
          permissions={tablePermissions}
          onEdit={handleEditProveedor}
          onSoftDelete={handleSoftDeleteProveedor}
          onHardDelete={handleHardDeleteProveedor}
          onRestore={handleRestoreProveedor}
          onToggleActivo={handleToggleActivoProveedor}
          onInfo={handleInfoProveedor}
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

      {/* Modal para crear proveedor */}
      <ProveedorCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onCreate={handleCreateProveedor}
        loading={loading}
        apiError={apiError}
      />

      {/* Modal para editar proveedor */}
      <ProveedorEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onUpdate={handleUpdateProveedor}
        currentProveedor={currentProveedor}
        loading={loading}
        apiError={apiError}
      />

      {/* Modal para confirmar acciones */}
      <ProveedorActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedActionProveedor(null);
          setActionType(null);
        }}
        proveedor={selectedActionProveedor}
        actionType={actionType}
        onConfirm={handleConfirmAction}
      />

      {/* Modal para ver información detallada del proveedor */}
      <InfoProveedorModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedInfoProveedor(null);
        }}
        proveedor={selectedInfoProveedor}
      />
    </div>
  );
};

export default ProveedoresPage;