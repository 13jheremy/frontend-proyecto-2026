// src/modules/recordatorios/pages/RecordatoriosPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useRecordatorios } from '../hooks/useRecordatorios';
import RecordatoriosTable from './components/RecordatoriosTable';
import RecordatorioCreateModal from './components/RecordatorioCreateModal';
import RecordatorioEditModal from './components/RecordatorioEditModal';
import RecordatorioSearch from './components/RecordatorioSearch';
import RecordatorioActionModal from './components/RecordatorioActionModal';
import InfoRecordatorioModal from './components/InfoRecordatorioModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faTimesCircle, faClock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS } from '../../../utils/constants';
import { hasPermission } from '../../../utils/rolePermissions';
import { useAuth } from '../../../context/AuthContext';

const RecordatoriosPage = () => {
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
  const canCreate = canPerformAction(PERMISSIONS.RECORDATORIOS.CREATE);
  const canEdit = canPerformAction(PERMISSIONS.RECORDATORIOS.EDIT);
  const canDelete = canPerformAction(PERMISSIONS.RECORDATORIOS.DELETE);

  // Objeto de permisos para pasar a la tabla
  const tablePermissions = {
    canEdit,
    canDelete,
    canRestore: canEdit,
    canToggleActive: canEdit, // Para activar/desactivar recordatorios
    canMarcarEstado: canEdit, // Para marcar enviado/pendiente
    canMarcarEnviado: canEdit,
    canMarcarPendiente: canEdit
  };

  // Hook principal de recordatorios
  const {
    recordatorios,
    loading,
    error: apiError,
    fetchRecordatorios,
    createRecordatorio,
    updateRecordatorio,
    toggleRecordatorioActivo,
    handleRecordatorioAction,
    clearError,
    pagination
  } = useRecordatorios();

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecordatorio, setCurrentRecordatorio] = useState(null);

  // Estados para modal de acción (borrar/activar/etc.)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionRecordatorio, setSelectedActionRecordatorio] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Estados para modal de información
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInfoRecordatorio, setSelectedInfoRecordatorio] = useState(null);

  // Estados para búsqueda y paginación
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Función para abrir modal de acción
  const openActionModal = (recordatorio, type) => {
    setSelectedActionRecordatorio(recordatorio);
    setActionType(type);
    setActionModalOpen(true);
  };

  // Función para confirmar acciones
  const handleConfirmAction = async (recordatorioId, type) => {
    try {
      await handleRecordatorioAction(recordatorioId, type);
      fetchRecordatorios(filters, page, pageSize); // Refrescar la lista después de la acción
      setActionModalOpen(false);
      setSelectedActionRecordatorio(null);
      setActionType(null);
    } catch (err) {
      console.error(`Error en acción ${type}:`, err);
    }
  };

  // Handlers para información
  const handleInfoRecordatorio = useCallback((recordatorio) => {
    setSelectedInfoRecordatorio(recordatorio);
    setIsInfoModalOpen(true);
  }, []);

  // Handlers para acciones de recordatorio
  const handleSoftDeleteRecordatorio = useCallback((recordatorioId) => {
    const recordatorio = recordatorios.find(r => r.id === recordatorioId);
    if (!recordatorio) return;
    openActionModal(recordatorio, 'softDelete');
  }, [recordatorios]);

  const handleHardDeleteRecordatorio = useCallback((recordatorioId) => {
    const recordatorio = recordatorios.find(r => r.id === recordatorioId);
    if (!recordatorio) return;
    openActionModal(recordatorio, 'hardDelete');
  }, [recordatorios]);

  const handleRestoreRecordatorio = useCallback((recordatorioId) => {
    const recordatorio = recordatorios.find(r => r.id === recordatorioId);
    if (!recordatorio) return;
    openActionModal(recordatorio, 'restore');
  }, [recordatorios]);

  const handleMarcarEnviado = useCallback((id) => {
    const recordatorio = recordatorios.find(r => r.id === id);
    if (!recordatorio) return;
    openActionModal(recordatorio, 'marcarEnviado');
  }, [recordatorios]);

  const handleMarcarPendiente = useCallback((id) => {
    const recordatorio = recordatorios.find(r => r.id === id);
    if (!recordatorio) return;
    openActionModal(recordatorio, 'marcarPendiente');
  }, [recordatorios]);

  const handleToggleActivo = useCallback(async (id, activo) => {
    try {
      await toggleRecordatorioActivo(id, !activo); // Toggle the current state
      fetchRecordatorios(filters, page, pageSize); // Refrescar la lista después de la acción
    } catch (err) {
      console.error(`Error en toggle activo ${id}:`, err);
    }
  }, [toggleRecordatorioActivo, fetchRecordatorios, filters, page, pageSize]);

  // Handlers para creación y edición
  const handleCreateRecordatorio = useCallback(async (recordatorioData) => {
    try {
      await createRecordatorio(recordatorioData);
      setIsCreateModalOpen(false);
      fetchRecordatorios(filters, page, pageSize);
    } catch (err) {
      console.error("Error en handleCreateRecordatorio en página:", err);
    }
  }, [createRecordatorio, fetchRecordatorios, filters, page, pageSize]);

  const handleEditRecordatorio = (recordatorio) => {
    setCurrentRecordatorio(recordatorio);
    setIsEditModalOpen(true);
  };

  const handleUpdateRecordatorio = useCallback(async (id, recordatorioData) => {
    try {
      await updateRecordatorio(id, recordatorioData);
      setIsEditModalOpen(false);
      setCurrentRecordatorio(null);
      fetchRecordatorios(filters, page, pageSize);
    } catch (err) {
      console.error("Error en handleUpdateRecordatorio en página:", err);
    }
  }, [updateRecordatorio, fetchRecordatorios, filters, page, pageSize]);

  // Handler para búsqueda
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handler para cerrar modales y limpiar errores
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentRecordatorio(null);
    clearError();
  };

  // Efecto para recargar datos cuando cambien filtros o paginación
  useEffect(() => {
    fetchRecordatorios(filters, page, pageSize);
  }, [filters, page, pageSize, fetchRecordatorios]);

  // Función para obtener estadísticas
  const getEstadisticas = () => {
    const total = pagination.totalItems || 0;
    const enviados = recordatorios.filter(r => r.enviado && !r.eliminado).length;
    const pendientes = recordatorios.filter(r => !r.enviado && !r.eliminado).length;
    const vencidos = recordatorios.filter(r => {
      if (r.enviado || r.eliminado) return false;
      const fechaProgramada = new Date(r.fecha_programada);
      const hoy = new Date();
      return fechaProgramada < hoy;
    }).length;
    const eliminados = recordatorios.filter(r => r.eliminado).length;

    return { total, enviados, pendientes, vencidos, eliminados };
  };

  const estadisticas = getEstadisticas();

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faBell} className="mr-3 text-blue-600" />
          Gestión de Recordatorios
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
              {estadisticas.enviados}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Enviados
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {estadisticas.pendientes}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pendientes
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {estadisticas.vencidos}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Vencidos
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="mb-6">
        <RecordatorioSearch
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
            <FontAwesomeIcon icon={faBell} className="mr-2" />
            Crear Recordatorio
          </button>
        )}

        {estadisticas.enviados > 0 && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            {estadisticas.enviados} enviado{estadisticas.enviados !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticas.pendientes > 0 && (
          <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            {estadisticas.pendientes} pendiente{estadisticas.pendientes !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticas.vencidos > 0 && (
          <div className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-md">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {estadisticas.vencidos} vencido{estadisticas.vencidos !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Recordatorios por página:</label>
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

      {/* TABLA DE RECORDATORIOS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <RecordatoriosTable
          recordatorios={recordatorios}
          permissions={tablePermissions}
          onEdit={handleEditRecordatorio}
          onSoftDelete={handleSoftDeleteRecordatorio}
          onHardDelete={handleHardDeleteRecordatorio}
          onRestore={handleRestoreRecordatorio}
          onToggleActivo={handleToggleActivo}
          onMarcarEnviado={handleMarcarEnviado}
          onMarcarPendiente={handleMarcarPendiente}
          onInfo={handleInfoRecordatorio}
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

      {/* Modal para crear recordatorio */}
      <RecordatorioCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onCreate={handleCreateRecordatorio}
        loading={loading}
        apiError={apiError}
      />

      {/* Modal para editar recordatorio */}
      <RecordatorioEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onUpdate={handleUpdateRecordatorio}
        currentRecordatorio={currentRecordatorio}
        loading={loading}
        apiError={apiError}
      />

      {/* Modal para confirmar acciones */}
      <RecordatorioActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedActionRecordatorio(null);
          setActionType(null);
        }}
        recordatorio={selectedActionRecordatorio}
        actionType={actionType}
        onConfirm={handleConfirmAction}
      />

      {/* Modal para ver información detallada del recordatorio */}
      <InfoRecordatorioModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedInfoRecordatorio(null);
        }}
        recordatorio={selectedInfoRecordatorio}
      />
    </div>
  );
};

export default RecordatoriosPage;