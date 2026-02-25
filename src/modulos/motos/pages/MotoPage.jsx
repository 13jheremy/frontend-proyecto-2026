// src/modules/motos/pages/MotosPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useMotos } from '../hooks/useMotos';
import { usersAPI } from '../../../services/api'; // Para obtener usuarios/propietarios
import MotoTable from './components/MotoTable';
import MotoCreateModal from './components/MotoCreateModal';
import MotoEditModal from './components/MotoEditModal';
import MotoSearch from './components/MotoSearch';
import MotoActionModal from './components/MotoActionModal';
import InfoMotoModal from './components/InfoMotoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMotorcycle, faCheckCircle, faBan, faUser, faArchive } from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS } from '../../../utils/constants';
import { useAuth } from '../../../context/AuthContext';

const MotoPage = () => {
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

  // Permission calculation
  
  // Función para verificar permisos con normalización
  const canPerformAction = (requiredPerms) => {
    const normalizedRoles = roles.map(r => r.toLowerCase());
    const normalizedPerms = requiredPerms.map(p => p.toLowerCase());
    const canDo = normalizedRoles.some(r => normalizedPerms.includes(r));
    return canDo;
  };
  
  // Calcular permisos (usar defaults si no están definidos en constants)
  const canCreate = canPerformAction(PERMISSIONS.MOTOS?.CREATE || ['administrador']);
  const canEdit = canPerformAction(PERMISSIONS.MOTOS?.EDIT || ['administrador']);
  const canDelete = canPerformAction(PERMISSIONS.MOTOS?.DELETE || ['administrador']);
  
  
  // Objeto de permisos para pasar a la tabla
  const tablePermissions = {
    canEdit,
    canDelete,
    canToggleActive: canEdit,
    canRestore: canEdit
  };
  // Hook principal de motos
  const {
    motos,
    loading,
    error: apiError,
    fetchMotos,
    createMoto,
    updateMoto,
    handleMotoAction,
    clearError,
    pagination,
    fetchEstadisticas
  } = useMotos();

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMoto, setCurrentMoto] = useState(null);

  // Estados para modal de acción (borrar/activar/etc.)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionMoto, setSelectedActionMoto] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Estados para modal de información
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInfoMoto, setSelectedInfoMoto] = useState(null);

  // Estados para búsqueda y paginación
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Estados para usuarios disponibles (propietarios)
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    eliminados: 0
  });

  // Cargar usuarios disponibles para asignar como propietarios
  const fetchUsuarios = useCallback(async () => {
    setLoadingUsuarios(true);
    try {
      const response = await usersAPI.getAll({
        is_active: true,
        page_size: 1000 // Traer todos los usuarios activos
      });
      
      if (response.data && response.data.results) {
        // Filtrar solo usuarios que tengan persona asociada
        const usuariosConPersona = response.data.results.filter(usuario => 
          usuario.persona && usuario.persona.id
        );
        setUsuariosDisponibles(usuariosConPersona);
      }
    } catch (error) {
      setUsuariosDisponibles([]);
    } finally {
      setLoadingUsuarios(false);
    }
  }, []);

  // Función para abrir modal de acción
  const openActionModal = (moto, type) => {
    setSelectedActionMoto(moto);
    setActionType(type);
    setActionModalOpen(true);
  };

  // Función para confirmar acciones
  const handleConfirmAction = async (motoId, type) => {
    try {
      await handleMotoAction(motoId, type);
      fetchMotos(filters, page, pageSize);
      setActionModalOpen(false);
      setSelectedActionMoto(null);
      setActionType(null);
    } catch (err) {
      // Error handling for action
    }
  };

  // Handlers para información
  const handleInfoMoto = useCallback((moto) => {
    setSelectedInfoMoto(moto);
    setIsInfoModalOpen(true);
  }, []);

  // Handlers para acciones de moto
  const handleSoftDeleteMoto = useCallback((motoId) => {
    const moto = motos.find(m => m.id === motoId);
    if (!moto) return;
    openActionModal(moto, 'softDelete');
  }, [motos]);

  const handleHardDeleteMoto = useCallback((motoId) => {
    const moto = motos.find(m => m.id === motoId);
    if (!moto) return;
    openActionModal(moto, 'hardDelete');
  }, [motos]);

  const handleRestoreMoto = useCallback((motoId) => {
    const moto = motos.find(m => m.id === motoId);
    if (!moto) return;
    openActionModal(moto, 'restore');
  }, [motos]);

  const handleToggleActivoMoto = useCallback((id) => {
    const moto = motos.find(m => m.id === id);
    if (!moto) return;
    openActionModal(moto, 'toggleActivo');
  }, [motos]);

  // Handlers para creación y edición
  const handleCreateMoto = useCallback(async (motoData) => {
    try {
      await createMoto(motoData);
      setIsCreateModalOpen(false);
      fetchMotos(filters, page, pageSize);
    } catch (err) {
      // Error handling for create
    }
  }, [createMoto, fetchMotos, filters, page, pageSize]);

  const handleEditMoto = (moto) => {
    setCurrentMoto(moto);
    setIsEditModalOpen(true);
  };

  const handleUpdateMoto = useCallback(async (id, motoData) => {
    try {
      await updateMoto(id, motoData);
      
      setIsEditModalOpen(false);
      setCurrentMoto(null);
      
      fetchMotos(filters, page, pageSize);
    } catch (err) {
      // Error handling for update
    }
  }, [updateMoto, fetchMotos, filters, page, pageSize]);

  // Handler para búsqueda
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handler para cerrar modales y limpiar errores
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentMoto(null);
    clearError();
  };

  // Cargar estadísticas
  const loadEstadisticas = useCallback(async () => {
    try {
      const stats = await fetchEstadisticas();
      setEstadisticas(stats);
    } catch (err) {
      // Error handling for stats
    }
  }, [fetchEstadisticas]);

  // Función para obtener estadísticas de la página actual
  const getEstadisticasLocales = () => {
    const total = pagination.totalItems || 0;
    const activos = motos.filter(m => m.activo && !m.eliminado).length;
    const inactivos = motos.filter(m => !m.activo && !m.eliminado).length;
    const eliminados = motos.filter(m => m.eliminado).length;

    return { total, activos, inactivos, eliminados };
  };

  const estadisticasLocales = getEstadisticasLocales();

  // Efecto para recargar datos cuando cambien filtros o paginación
  useEffect(() => {
    fetchMotos(filters, page, pageSize);
  }, [filters, page, pageSize, fetchMotos]);

  // Cargar usuarios al inicializar
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faMotorcycle} className="mr-3 text-blue-600" />
          Gestión de Motos
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
              Activas
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {estadisticasLocales.inactivos}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Inactivas
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
                  Eliminadas
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="mb-6">
        <MotoSearch
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
            Registrar Moto
          </button>
        )}

        {estadisticasLocales.activos > 0 && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            {estadisticasLocales.activos} moto{estadisticasLocales.activos !== 1 ? 's' : ''} activa{estadisticasLocales.activos !== 1 ? 's' : ''}
          </div>
        )}

        {estadisticasLocales.inactivos > 0 && (
          <div className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-md">
            <FontAwesomeIcon icon={faBan} className="mr-2" />
            {estadisticasLocales.inactivos} moto{estadisticasLocales.inactivos !== 1 ? 's' : ''} inactiva{estadisticasLocales.inactivos !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Motos por página:</label>
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

      {/* TABLA DE MOTOS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <MotoTable
          motos={motos}
          permissions={tablePermissions}
          onEdit={handleEditMoto}
          onSoftDelete={handleSoftDeleteMoto}
          onHardDelete={handleHardDeleteMoto}
          onRestore={handleRestoreMoto}
          onToggleActivo={handleToggleActivoMoto}
          onInfo={handleInfoMoto}
          loading={loading}
          usuariosDisponibles={usuariosDisponibles}
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

      {/* Modal para crear moto */}
      <MotoCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onCreate={handleCreateMoto}
        loading={loading}
        apiError={apiError}
        usuariosDisponibles={usuariosDisponibles}
        loadingUsuarios={loadingUsuarios}
      />

      {/* Modal para editar moto */}
      <MotoEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onUpdate={handleUpdateMoto}
        currentMoto={currentMoto}
        loading={loading}
        apiError={apiError}
        usuariosDisponibles={usuariosDisponibles}
        loadingUsuarios={loadingUsuarios}
      />

      {/* Modal para confirmar acciones */}
      <MotoActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedActionMoto(null);
          setActionType(null);
        }}
        moto={selectedActionMoto}
        actionType={actionType}
        onConfirm={handleConfirmAction}
      />

      {/* Modal para ver información detallada de la moto */}
      <InfoMotoModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedInfoMoto(null);
        }}
        moto={selectedInfoMoto}
      />
    </div>
  );
};

export default MotoPage;