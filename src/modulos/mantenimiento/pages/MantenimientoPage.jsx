// src/modulos/mantenimiento/pages/MantenimientoPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMantenimientos } from '../hooks/useMantenimientos';
import { useMotos } from '../../motos/hooks/useMotos';
import MantenimientoTable from './components/MantenimientoTable';
import MantenimientoFormModal from './components/MantenimientoFormModal';
import MantenimientoSearch from './components/MantenimientoSearch';
import MantenimientoActionModal from './components/MantenimientoActionModal';
import MantenimientoInfoModal from './components/MantenimientoInfoModal';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTools, faCheckCircle, faClock, faPlay, faBan, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS } from '../../../utils/constants';
import { useAuth } from '../../../context/AuthContext';

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
  
  // Objeto de permisos para pasar a la tabla
  const tablePermissions = {
    canEdit,
    canDelete,
    canToggleActive: canEdit,
    canRestore: canEdit,
    canViewDetails: true
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
    fetchEstadisticas,
    getDeletedMantenimientos
  } = useMantenimientos();

  // Hook para obtener motos disponibles
  const { fetchMotos } = useMotos();
  const [motosDisponibles, setMotosDisponibles] = useState([]);

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
  const [mantenimientosState, setMantenimientosState] = useState([]);

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
      
      // Si la acción fue restaurar, actualizar la lista de eliminados o volver a la lista normal
      if (type === 'restore') {
        if (filters?.eliminado === 'true') {
          // Si estamos viendo eliminados, recargar la lista de eliminados
          getDeletedMantenimientos({ page, page_size: pageSize })
            .then(response => {
              const data = response?.data || response;
              if (data?.results) {
                setMantenimientosState(data.results);
              } else {
                setMantenimientosState(Array.isArray(data) ? data : []);
              }
            })
            .catch(err => console.error('Error al recargar eliminados:', err));
        } else {
          // Recargar la lista normal
          fetchMantenimientos(filters, page, pageSize);
        }
      } else {
        // Para otras acciones, recargar según el filtro actual
        if (filters?.eliminado === 'true') {
          getDeletedMantenimientos({ page, page_size: pageSize })
            .then(response => {
              const data = response?.data || response;
              if (data?.results) {
                setMantenimientosState(data.results);
              } else {
                setMantenimientosState(Array.isArray(data) ? data : []);
              }
            })
            .catch(err => console.error('Error al recargar eliminados:', err));
        } else {
          fetchMantenimientos(filters, page, pageSize);
        }
      }
      
      setActionModalOpen(false);
      setSelectedActionMantenimiento(null);
      setActionType(null);
    } catch (err) {
      console.error(`Error en acción ${type}:`, err);
    }
  };

  // Handlers para información
  const handleInfoMantenimiento = useCallback((mantenimiento) => {
    setSelectedInfoMantenimiento(mantenimiento);
    setIsInfoModalOpen(true);
  }, []);

  // Handlers para edición
  const handleEditMantenimiento = (mantenimiento) => {
    setCurrentMantenimiento(mantenimiento);
    setIsEditModalOpen(true);
  };

  // Handlers para creación
  const handleCreateMantenimiento = useCallback(async (mantenimientoData) => {
    try {
      await createMantenimiento(mantenimientoData);
      fetchMantenimientos(filters, page, pageSize);
    } catch (err) {
      console.error("Error en handleCreateMantenimiento:", err);
      throw err;
    }
  }, [createMantenimiento, fetchMantenimientos, filters, page, pageSize]);

  // Handler para actualización
  const handleUpdateMantenimiento = useCallback(async (id, mantenimientoData) => {
    try {
      await updateMantenimiento(id, mantenimientoData);
      fetchMantenimientos(filters, page, pageSize);
    } catch (err) {
      console.error("Error en handleUpdateMantenimiento:", err);
      throw err;
    }
  }, [updateMantenimiento, fetchMantenimientos, filters, page, pageSize]);

  // Handler para búsqueda
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handler para cerrar modales y limpiar errores
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentMantenimiento(null);
    clearError();
  };

  // Efecto para recargar datos cuando cambien filtros o paginación
  useEffect(() => {
    const loadData = async () => {
      // Verificar si el filtro es para eliminados
      if (filters?.eliminado === 'true') {
        try {
          // Usar endpoint de eliminados
          const response = await getDeletedMantenimientos({ page, page_size: pageSize });
          const data = response?.data || response;
          console.log('📋 Datos de eliminados:', data);
          if (data?.results) {
            setMantenimientosState(data.results);
          } else {
            setMantenimientosState(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error('Error al cargar mantenimientos eliminados:', err);
        }
      } else {
        // Usar endpoint normal
        fetchMantenimientos(filters, page, pageSize);
      }
    };
    loadData();
  }, [filters, page, pageSize, fetchMantenimientos, getDeletedMantenimientos]);

  // Efecto para cargar las motos disponibles al inicio
  useEffect(() => {
    const loadMotos = async () => {
      try {
        const response = await fetchMotos({ activo: true });
        // La respuesta puede venir en diferentes formatos, adaptarse
        const motoData = response?.data?.results || response?.data || response || [];
        setMotosDisponibles(Array.isArray(motoData) ? motoData : []);
      } catch (err) {
        console.error('Error al cargar motos disponibles:', err);
        setMotosDisponibles([]);
      }
    };
    loadMotos();
  }, [fetchMotos]);

  // Función para obtener estadísticas locales
  const getEstadisticasLocales = () => {
    const total = pagination.totalItems || 0;
    const pendientes = mantenimientos.filter(m => m.estado === 'pendiente' && !m.eliminado).length;
    const enProgreso = mantenimientos.filter(m => m.estado === 'en_progreso' && !m.eliminado).length;
    const completados = mantenimientos.filter(m => m.estado === 'completado' && !m.eliminado).length;
    const cancelados = mantenimientos.filter(m => m.estado === 'cancelado' && !m.eliminado).length;
    const eliminados = mantenimientos.filter(m => m.eliminado).length;

    return { total, pendientes, enProgreso, completados, cancelados, eliminados };
  };

  const estadisticas = getEstadisticasLocales();

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faTools} className="mr-3 text-yellow-600" />
          Gestión de Mantenimientos
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
              {estadisticas.completados}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Completados
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
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estadisticas.enProgreso}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              En Progreso
            </div>
          </div>

          {estadisticas.eliminados > 0 && (
            <>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center">
                  {estadisticas.eliminados}
                  <FontAwesomeIcon icon={faBan} className="ml-1 text-sm" />
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
          motosDisponibles={motosDisponibles}
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
            Nuevo Mantenimiento
          </button>
        )}

        {estadisticas.pendientes > 0 && (
          <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            {estadisticas.pendientes} pendiente{estadisticas.pendientes !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticas.enProgreso > 0 && (
          <div className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-md">
            <FontAwesomeIcon icon={faPlay} className="mr-2" />
            {estadisticas.enProgreso} en progreso
          </div>
        )}

        {estadisticas.completados > 0 && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            {estadisticas.completados} completado{estadisticas.completados !== 1 ? 's' : ''}
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
          mantenimientos={filters?.eliminado === 'true' ? mantenimientosState : mantenimientos}
          filters={filters}
          permissions={tablePermissions}
          onEdit={handleEditMantenimiento}
          onSoftDelete={(mantenimientoId) => {
            const currentList = filters?.eliminado === 'true' ? mantenimientosState : mantenimientos;
            const mantenimiento = currentList.find(m => m.id === mantenimientoId);
            if (!mantenimiento) return;
            openActionModal(mantenimiento, 'softDelete');
          }}
          onRestore={(mantenimientoId) => {
            const currentList = filters?.eliminado === 'true' ? mantenimientosState : mantenimientos;
            const mantenimiento = currentList.find(m => m.id === mantenimientoId);
            if (!mantenimiento) return;
            openActionModal(mantenimiento, 'restore');
          }}
          onToggleActivo={(mantenimientoId) => {
            const currentList = filters?.eliminado === 'true' ? mantenimientosState : mantenimientos;
            const mantenimiento = currentList.find(m => m.id === mantenimientoId);
            if (!mantenimiento) return;
            openActionModal(mantenimiento, 'toggleActivo');
          }}
          onInfo={handleInfoMantenimiento}
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
            Página {pagination.currentPage} de {pagination.totalPages}
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

      {/* Modal para crear mantenimiento */}
      <MantenimientoFormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleCreateMantenimiento}
        loading={loading}
      />

      {/* Modal para editar mantenimiento */}
      <MantenimientoFormModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onSubmit={(data) => handleUpdateMantenimiento(currentMantenimiento.id, data)}
        mantenimiento={currentMantenimiento}
        loading={loading}
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
