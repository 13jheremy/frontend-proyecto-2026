// src/modules/servicios/pages/ServiciosPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useServicios } from '../hooks/useServicios';
import ServicioTable from './components/ServicioTable';
import ServicioCreateModal from './components/ServicioCreateModal';
import ServicioEditModal from './components/ServicioEditModal';
import ServicioSearch from './components/ServicioSearch';
import ServicioActionModal from './components/ServicioActionModal';
import InfoServicioModal from './components/InfoServicioModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCog, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS } from '../../../utils/constants';
import { hasPermission } from '../../../utils/rolePermissions';
import { useAuth } from '../../../context/AuthContext';

const ServiciosPage = () => {
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
  console.log("CREATE_PERMS:", PERMISSIONS.SERVICES.CREATE);
  console.log("EDIT_PERMS:", PERMISSIONS.SERVICES.EDIT);
  console.log("DELETE_PERMS:", PERMISSIONS.SERVICES.DELETE);
  
  // Función para verificar permisos con normalización
  const canPerformAction = (requiredPerms) => {
    const normalizedRoles = roles.map(r => r.toLowerCase());
    const normalizedPerms = requiredPerms.map(p => p.toLowerCase());
    const canDo = normalizedRoles.some(r => normalizedPerms.includes(r));
    return canDo;
  };
  
  // Calcular permisos
  const canCreate = canPerformAction(PERMISSIONS.SERVICES.CREATE);
  const canEdit = canPerformAction(PERMISSIONS.SERVICES.EDIT);
  const canDelete = canPerformAction(PERMISSIONS.SERVICES.DELETE);
  
  // Logs después de calcular
  console.log("canCreate:", canCreate, "canEdit:", canEdit, "canDelete:", canDelete);
  
  // Objeto de permisos para pasar a la tabla
  const tablePermissions = {
    canEdit,
    canDelete,
    canToggleActive: canEdit,
    canRestore: canEdit
  };
  
  // Hook principal de servicios
  const {
    servicios,
    categorias,
    loading,
    error: apiError,
    fetchServicios,
    createServicio,
    updateServicio,
    handleServicioAction,
    clearError,
    pagination
  } = useServicios();

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentServicio, setCurrentServicio] = useState(null);

  // Estados para modal de acción (borrar/activar/etc.)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionServicio, setSelectedActionServicio] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Estados para modal de información
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInfoServicio, setSelectedInfoServicio] = useState(null);

  // Estados para búsqueda y paginación
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Función para abrir modal de acción
  const openActionModal = (servicio, type) => {
    setSelectedActionServicio(servicio);
    setActionType(type);
    setActionModalOpen(true);
  };

  // Función para confirmar acciones
  const handleConfirmAction = async (servicioId, type) => {
    try {
      await handleServicioAction(servicioId, type);
      fetchServicios(filters, page, pageSize); // Refrescar la lista después de la acción
      setActionModalOpen(false);
      setSelectedActionServicio(null);
      setActionType(null);
    } catch (err) {
      console.error(`Error en acción ${type}:`, err);
    }
  };

  // Handlers para información
  const handleInfoServicio = useCallback((servicio) => {
    setSelectedInfoServicio(servicio);
    setIsInfoModalOpen(true);
  }, []);

  // Handlers para acciones de servicio
  const handleSoftDeleteServicio = useCallback((servicioId) => {
    const servicio = servicios.find(s => s.id === servicioId);
    if (!servicio) return;
    openActionModal(servicio, 'softDelete');
  }, [servicios]);

  const handleHardDeleteServicio = useCallback((servicioId) => {
    const servicio = servicios.find(s => s.id === servicioId);
    if (!servicio) return;
    openActionModal(servicio, 'hardDelete');
  }, [servicios]);

  const handleRestoreServicio = useCallback((servicioId) => {
    const servicio = servicios.find(s => s.id === servicioId);
    if (!servicio) return;
    openActionModal(servicio, 'restore');
  }, [servicios]);

  const handleToggleActivoServicio = useCallback((id) => {
    const servicio = servicios.find(s => s.id === id);
    if (!servicio) return;
    openActionModal(servicio, 'toggleActivo');
  }, [servicios]);

  // Handlers para creación y edición
  const handleCreateServicio = useCallback(async (servicioData) => {
    try {
      await createServicio(servicioData);
      setIsCreateModalOpen(false);
      fetchServicios(filters, page, pageSize);
    } catch (err) {
      console.error("Error en handleCreateServicio en página:", err);
    }
  }, [createServicio, fetchServicios, filters, page, pageSize]);

  const handleEditServicio = (servicio) => {
    setCurrentServicio(servicio);
    setIsEditModalOpen(true);
  };

  const handleUpdateServicio = useCallback(async (id, servicioData) => {
    try {
      await updateServicio(id, servicioData);
      setIsEditModalOpen(false);
      setCurrentServicio(null);
      fetchServicios(filters, page, pageSize);
    } catch (err) {
      console.error("Error en handleUpdateServicio en página:", err);
    }
  }, [updateServicio, fetchServicios, filters, page, pageSize]);

  // Handler para búsqueda
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handler para cerrar modales y limpiar errores
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentServicio(null);
    clearError();
  };

  // Efecto para recargar datos cuando cambien filtros o paginación
  useEffect(() => {
    fetchServicios(filters, page, pageSize);
  }, [filters, page, pageSize, fetchServicios]);

  // Función para obtener estadísticas
  const getEstadisticas = () => {
    const total = pagination.totalItems || 0;
    const activos = servicios.filter(s => s.activo && !s.eliminado).length;
    const inactivos = servicios.filter(s => !s.activo && !s.eliminado).length;
    const eliminados = servicios.filter(s => s.eliminado).length;

    return { total, activos, inactivos, eliminados };
  };

  const estadisticas = getEstadisticas();

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faCog} className="mr-3 text-blue-600" />
          Gestión de Servicios
        </h1>

        {/* ESTADÍSTICAS MEJORADAS */}
        <div className="hidden md:flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estadisticas.total}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {estadisticas.activos}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Activos
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {estadisticas.inactivos}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Inactivos
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {estadisticas.eliminados}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Eliminados
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="mb-6">
        <ServicioSearch
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          categorias={categorias}
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
            Crear Servicio
          </button>
        )}

        {estadisticas.activos > 0 && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            {estadisticas.activos} servicio{estadisticas.activos !== 1 ? 's' : ''} activo{estadisticas.activos !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticas.inactivos > 0 && (
          <div className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-md">
            <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
            {estadisticas.inactivos} servicio{estadisticas.inactivos !== 1 ? 's' : ''} inactivo{estadisticas.inactivos !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Servicios por página:</label>
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

      {/* TABLA DE SERVICIOS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <ServicioTable
          servicios={servicios}
          categorias={categorias}
          permissions={tablePermissions}
          onEdit={handleEditServicio}
          onSoftDelete={handleSoftDeleteServicio}
          onHardDelete={handleHardDeleteServicio}
          onRestore={handleRestoreServicio}
          onToggleActivo={handleToggleActivoServicio}
          onInfo={handleInfoServicio}
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

      {/* Modal para crear servicio */}
      <ServicioCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onCreate={handleCreateServicio}
        loading={loading}
        apiError={apiError}
        categorias={categorias}
      />

      {/* Modal para editar servicio */}
      <ServicioEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onUpdate={handleUpdateServicio}
        currentServicio={currentServicio}
        loading={loading}
        apiError={apiError}
        categorias={categorias}
      />

      {/* Modal para confirmar acciones */}
      <ServicioActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedActionServicio(null);
          setActionType(null);
        }}
        servicio={selectedActionServicio}
        actionType={actionType}
        onConfirm={handleConfirmAction}
      />

      {/* Modal para ver información detallada del servicio */}
      <InfoServicioModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedInfoServicio(null);
        }}
        servicio={selectedInfoServicio}
      />
    </div>
  );
};

export default ServiciosPage;