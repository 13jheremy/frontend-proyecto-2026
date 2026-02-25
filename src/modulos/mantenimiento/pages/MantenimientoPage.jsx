// src/modulos/mantenimiento/pages/MantenimientoPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMantenimientos } from '../hooks/useMantenimientos';
import { useMotos } from '../../motos/hooks/useMotos'; // Para obtener motos
import MantenimientoTable from './components/MantenimientoTable';
import MantenimientoEditModal from './components/MantenimientoEditModal';
import MantenimientoSearch from './components/MantenimientoSearch';
import MantenimientoActionModal from './components/MantenimientoActionModal';
import MantenimientoInfoModal from './components/MantenimientoInfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTools, 
  faCheckCircle, 
  faBan, 
  faMotorcycle, 
  faCalendarAlt,
  faWrench,
  faInfoCircle,
  faTrash,
  faUndo,
  faEdit,
  faArchive,
  faClock,
  faPlay,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS, ROLES } from '../../../utils/constants';
import { useAuth } from '../../../context/AuthContext';
import { hasRole } from '../../../utils/rolePermissions';

/**
 * Página principal para la gestión de mantenimientos.
 */
const MantenimientoPage = () => {
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
  console.log("CREATE_PERMS:", PERMISSIONS.MAINTENANCE?.CREATE);
  console.log("EDIT_PERMS:", PERMISSIONS.MAINTENANCE?.EDIT);
  console.log("DELETE_PERMS:", PERMISSIONS.MAINTENANCE?.DELETE);
  
  // Función para verificar permisos con normalización
  const canPerformAction = (requiredPerms) => {
    const normalizedRoles = roles.map(r => r.toLowerCase());
    const normalizedPerms = requiredPerms.map(p => p.toLowerCase());
    const canDo = normalizedRoles.some(r => normalizedPerms.includes(r));
    return canDo;
  };
  
  // Calcular permisos
  const canCreate = canPerformAction(PERMISSIONS.MAINTENANCE?.CREATE || ['administrador']);
  const canEdit = canPerformAction(PERMISSIONS.MAINTENANCE?.EDIT || ['administrador']);
  const canDelete = canPerformAction(PERMISSIONS.MAINTENANCE?.DELETE || ['administrador']);
  const canChangeStatus = canPerformAction(PERMISSIONS.MAINTENANCE?.CHANGE_STATUS || []);
  const canAddObservations = canPerformAction(PERMISSIONS.MAINTENANCE?.ADD_OBSERVATIONS || []);

  // Logs después de calcular
  console.log("canCreate:", canCreate, "canEdit:", canEdit, "canDelete:", canDelete, "canChangeStatus:", canChangeStatus);

  // Objeto de permisos para pasar a la tabla
  const tablePermissions = {
    canEdit,
    canDelete,
    canToggleActive: canEdit,
    canRestore: canEdit,
    canChangeStatus,
    canAddObservations
  };

  // Hook principal de mantenimientos
  const {
    mantenimientos,
    loading,
    error: apiError,
    fetchMantenimientos,
    createMantenimiento,
    updateMantenimiento,
    handleMantenimientoAction,
    clearError,
    pagination,
    fetchEstadisticas
  } = useMantenimientos();

  // Hook para obtener motos
  const { motos } = useMotos();

  // Estados para modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMantenimiento, setCurrentMantenimiento] = useState(null);

  // Estados para modal de acción (borrar/activar/etc.)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionMantenimiento, setSelectedActionMantenimiento] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Estados para modal de información
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInfoMantenimiento, setSelectedInfoMantenimiento] = useState(null);

  // Estados para búsqueda y paginación
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    enProgreso: 0,
    completados: 0,
    cancelados: 0,
    mantenimientosEliminados: 0
  });

  // Función para filtrar mantenimientos según permisos del usuario
  const getFilteredMantenimientos = () => {
    if (!user || !roles) return mantenimientos;

    // Si es administrador o empleado, ver todos
    if (hasRole(roles, ROLES.ADMINISTRADOR) || hasRole(roles, ROLES.EMPLEADO)) {
      return mantenimientos;
    }

    // Si es técnico, solo ver mantenimientos asignados
    if (hasRole(roles, ROLES.TECNICO)) {
      return mantenimientos.filter(mantenimiento =>
        mantenimiento.tecnico_id === user.id ||
        mantenimiento.tecnico?.id === user.id
      );
    }

    // Si es cliente, solo ver sus propios mantenimientos
    if (hasRole(roles, ROLES.CLIENTE)) {
      return mantenimientos.filter(mantenimiento =>
        mantenimiento.moto?.propietario_id === user.id ||
        mantenimiento.moto?.propietario?.id === user.id
      );
    }

    return [];
  };

  // Función para abrir modal de acción
  const openActionModal = (mantenimiento, type) => {
    setSelectedActionMantenimiento(mantenimiento);
    setActionType(type);
    setActionModalOpen(true);
  };

  // Función para confirmar acciones
  const handleConfirmAction = async (mantenimientoId, type) => {
    try {
      await handleMantenimientoAction(mantenimientoId, type);
      fetchMantenimientos(filters, page, pageSize);
      setActionModalOpen(false);
      setSelectedActionMantenimiento(null);
      setActionType(null);
    } catch (err) {
      console.error(`Error en acción ${type}:`, err);
    }
  };

  // Handlers para edición

  const handleEditMantenimiento = (mantenimiento) => {
    setCurrentMantenimiento(mantenimiento);
    setIsEditModalOpen(true);
  };

  const handleUpdateMantenimiento = async (id, mantenimientoData) => {
    try {
      await updateMantenimiento(id, mantenimientoData);
      setIsEditModalOpen(false);
      setCurrentMantenimiento(null);
      fetchMantenimientos(filters, page, pageSize);
    } catch (err) {
      console.error("Error en handleUpdateMantenimiento:", err);
    }
  };

  // Handler para búsqueda
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handler para cerrar modales y limpiar errores
  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setCurrentMantenimiento(null);
    clearError();
  };

  const handleInfoClick = (mantenimiento) => {
    setSelectedInfoMantenimiento(mantenimiento);
    setIsInfoModalOpen(true);
  };

  const handleChangeStatus = (mantenimiento) => {
    if (!canChangeStatus) return;

    // Lógica para cambiar estado: pendiente -> en_proceso -> completado
    let nuevoEstado = '';
    switch (mantenimiento.estado) {
      case 'pendiente':
        nuevoEstado = 'en_proceso';
        break;
      case 'en_proceso':
        nuevoEstado = 'completado';
        break;
      case 'completado':
        // No permitir cambiar de completado
        return;
      default:
        nuevoEstado = 'pendiente';
    }

    // Aquí podrías abrir un modal de confirmación o directamente cambiar el estado
    // Por simplicidad, cambiamos directamente
    handleUpdateMantenimiento(mantenimiento.id, { estado: nuevoEstado });
  };

  // Función para obtener estadísticas locales
  const getEstadisticasLocales = () => {
    const filteredMantenimientos = getFilteredMantenimientos();
    const total = filteredMantenimientos.length;
    const pendientes = filteredMantenimientos.filter(m => m.estado === 'pendiente' && !m.eliminado).length;
    const enProgreso = filteredMantenimientos.filter(m => m.estado === 'en_progreso' && !m.eliminado).length;
    const completados = filteredMantenimientos.filter(m => m.estado === 'completado' && !m.eliminado).length;
    const cancelados = filteredMantenimientos.filter(m => m.estado === 'cancelado' && !m.eliminado).length;
    const eliminados = filteredMantenimientos.filter(m => m.eliminado).length;

    return { total, pendientes, enProgreso, completados, cancelados, eliminados };
  };

  const estadisticasLocales = getEstadisticasLocales();

  // Renderizar la página
  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faWrench} className="mr-3 text-yellow-600" />
          Gestión de Mantenimientos
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
              {estadisticasLocales.completados}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Completados
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
        <MantenimientoSearch
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          motosDisponibles={motos}
        />
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-wrap gap-4 mb-6">

        {estadisticasLocales.pendientes > 0 && (
          <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            {estadisticasLocales.pendientes} pendiente{estadisticasLocales.pendientes !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticasLocales.enProgreso > 0 && (
          <div className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-md">
            <FontAwesomeIcon icon={faPlay} className="mr-2" />
            {estadisticasLocales.enProgreso} en progreso
          </div>
        )}

        {estadisticasLocales.completados > 0 && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            {estadisticasLocales.completados} completado{estadisticasLocales.completados !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Mantenimientos por página:</label>
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

      {/* TABLA DE MANTENIMIENTOS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <MantenimientoTable
          mantenimientos={getFilteredMantenimientos()}
          permissions={tablePermissions}
          onEdit={handleEditMantenimiento}
          onSoftDelete={(mantenimientoId) => {
            const mantenimiento = getFilteredMantenimientos().find(m => m.id === mantenimientoId);
            if (!mantenimiento) return;
            openActionModal(mantenimiento, 'softDelete');
          }}
          onHardDelete={(mantenimientoId) => {
            const mantenimiento = getFilteredMantenimientos().find(m => m.id === mantenimientoId);
            if (!mantenimiento) return;
            openActionModal(mantenimiento, 'hardDelete');
          }}
          onRestore={(mantenimientoId) => {
            const mantenimiento = getFilteredMantenimientos().find(m => m.id === mantenimientoId);
            if (!mantenimiento) return;
            openActionModal(mantenimiento, 'restore');
          }}
          onToggleActivo={(mantenimientoId) => {
            const mantenimiento = getFilteredMantenimientos().find(m => m.id === mantenimientoId);
            if (!mantenimiento) return;
            openActionModal(mantenimiento, 'toggleActivo');
          }}
          onChangeStatus={handleChangeStatus}
          onInfo={handleInfoClick}
          loading={loading}
        />

      </div>

      {/* PAGINACIÓN */}
      {pagination && pagination.totalPages > 1 && (
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


      {/* Modal para editar mantenimiento */}
      <MantenimientoEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onUpdate={handleUpdateMantenimiento}
        currentMantenimiento={currentMantenimiento}
        motosDisponibles={motos}
        loading={loading}
        apiError={apiError}
        userRoles={roles}
      />

      {/* Modal para confirmar acciones */}
      <MantenimientoActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedActionMantenimiento(null);
          setActionType(null);
        }}
        mantenimiento={selectedActionMantenimiento}
        actionType={actionType}
        onConfirm={handleConfirmAction}
      />

      {/* Modal para ver información detallada del mantenimiento */}
      <MantenimientoInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedInfoMantenimiento(null);
        }}
        mantenimiento={selectedInfoMantenimiento}
      />
    </div>
  );
};

export default MantenimientoPage;