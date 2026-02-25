// Este componente representa la página principal de gestión de usuarios.
// Incluye control de permisos basado en roles del usuario autenticado.

import React, { useState, useEffect, useCallback } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import { useAuth } from '../../../hooks/useAuth'; // Hook para obtener usuario autenticado
import { hasPermission, isAdmin } from '../../../utils/rolePermissions';
import { PERMISSIONS } from '../../../utils/constants';
import UsuarioTable from '../components/UsuarioTable';
import UsuarioCreateModal from '../components/UsuarioCreateModal';
import UsuarioCompleteCreateModal from '../components/UsuarioCompleteCreateModal';
import UsuarioEditModal from '../components/UsuarioEditModal';
import UsuarioSearch from '../components/UsuarioSearch';
import ResetPasswordModal from '../components/ResetPasswordModal';
import UserActionModal from '../components/UserActionModal';
import UsuarioInfoModal from '../components/UsuarioInfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const UsuariosPage = () => {
  // Hook de autenticación para obtener el usuario actual
  const { user: currentUser } = useAuth();

  const {
    usuarios,
    loading,
    error: apiError,
    fetchUsuarios,
    createUsuario,
    createUsuarioComplete,
    updateUsuario,
    resetPassword,
    handleUserAction,
    clearError,
    rolesDisponibles,
    pagination
  } = useUsuarios();

  // ESTADOS DEL COMPONENTE (sin cambios)
  const [isSimpleCreateModalOpen, setIsSimpleCreateModalOpen] = useState(false);
  const [isCompleteCreateModalOpen, setIsCompleteCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState(null);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionUser, setSelectedActionUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInfoUser, setSelectedInfoUser] = useState(null);

  // =======================================
  // DEBUG ESPECÍFICO PARA ROLES Y PERMISOS
  // =======================================
  useEffect(() => {
    if (currentUser) {
      console.log('✅ PERMISOS FINALES:', {
        userRole: currentUser.roles?.[0],
        expectedRestore: PERMISSIONS.USERS.RESTORE,
        expectedHardDelete: PERMISSIONS.USERS.HARD_DELETE,
        canRestore: canPerformAction('RESTORE'),
        canHardDelete: canPerformAction('HARD_DELETE'),
        match: PERMISSIONS.USERS.RESTORE.includes(currentUser.roles?.[0])
      });
    }
  }, [currentUser]);

  // =======================================
  // FUNCIONES DE PERMISOS
  // =======================================

  /**
   * Verifica si el usuario actual puede realizar una acción
   */
  const canPerformAction = (action) => {
    if (!currentUser || !currentUser.roles) return false;
    const result = hasPermission(currentUser.roles, 'USERS', action);
    return result;
  };

  /**
   * Verifica si puede ver un usuario específico
   * Los empleados solo pueden ver clientes y personas sin usuario
   */
  const canViewUser = (targetUser) => {
    if (!currentUser || !currentUser.roles) return false;
    
    // Los administradores pueden ver a todos
    if (isAdmin(currentUser.roles)) return true;

    // Si es persona sin usuario, todos pueden verla
    if (targetUser.es_persona_sin_usuario) return true;

    // Los empleados solo pueden ver clientes
    const targetUserRoles = targetUser.roles || [];
    const hasOnlyClientRole = targetUserRoles.length === 1 && 
                             targetUserRoles.some(role => 
                               (typeof role === 'string' && role === 'Cliente') ||
                               (typeof role === 'object' && role.nombre === 'Cliente')
                             );

    return hasOnlyClientRole;
  };

  /**
   * Verifica si puede editar un usuario específico
   */
  const canEditUser = (targetUser) => {
    if (!canPerformAction('EDIT')) return false;
    return canViewUser(targetUser);
  };

  /**
   * Verifica si puede eliminar un usuario específico
   */
  const canDeleteUser = (targetUser) => {
    if (!canPerformAction('DELETE')) return false;
    return canViewUser(targetUser);
  };

  /**
   * Verifica si puede cambiar el estado de un usuario
   */
  const canToggleUserStatus = (targetUser) => {
    if (!canPerformAction('ACTIVATE_DEACTIVATE')) return false;
    return canViewUser(targetUser);
  };

  /**
   * Verifica si puede resetear la contraseña
   */
  const canResetUserPassword = (targetUser) => {
    if (!canPerformAction('RESET_PASSWORD')) return false;
    return canViewUser(targetUser) && !targetUser.es_persona_sin_usuario;
  };

  /**
   * Filtra la lista de usuarios según los permisos
   */
  const getFilteredUsers = () => {
    if (!currentUser || !currentUser.roles) return [];
    
    return usuarios.filter(user => canViewUser(user));
  };

  // =======================================
  // HANDLERS CON VALIDACIÓN DE PERMISOS
  // =======================================

  const openActionModal = (user, type) => {
    // Validar permisos antes de abrir el modal
    let canPerform = false;
    
    switch (type) {
      case 'softDelete':
        canPerform = canDeleteUser(user);
        break;
      case 'hardDelete':
        canPerform = canPerformAction('HARD_DELETE');
        break;
      case 'restore':
        canPerform = canPerformAction('RESTORE');
        break;
      case 'toggleStatus':
        canPerform = canToggleUserStatus(user);
        break;
      default:
        canPerform = false;
    }

    if (!canPerform) {
      // Mostrar mensaje de error de permisos
      return;
    }

    setSelectedActionUser(user);
    setActionType(type);
    setActionModalOpen(true);
  };

  const handleConfirmAction = async (userId, type) => {
    try {
      await handleUserAction(userId, type);
      fetchUsuarios(filters, page, pageSize);
      setActionModalOpen(false);
      setSelectedActionUser(null);
      setActionType(null);
    } catch (err) {
      // Error manejado por el hook
    }
  };

  const handleOpenResetModal = (user) => {
    if (!canResetUserPassword(user)) {
      return;
    }
    
    setSelectedUser(user);
    setResetModalOpen(true);
  };

  const handleResetPassword = async (userId, newPassword) => {
    if (!selectedUser) return;

    try {
      await resetPassword(userId, newPassword);
      setResetModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      // Error manejado por el hook
    }
  };

  // HANDLERS PARA ACCIONES CON VALIDACIÓN
  const handleSoftDeleteUsuario = useCallback((userId) => {
    const user = usuarios.find(u => u.id === userId);
    if (!user || !canDeleteUser(user)) return;
    openActionModal(user, 'softDelete');
  }, [usuarios, currentUser]);

  const handleHardDeleteUsuario = useCallback((userId) => {
    const user = usuarios.find(u => u.id === userId);
    if (!user || !canPerformAction('HARD_DELETE')) return;
    openActionModal(user, 'hardDelete');
  }, [usuarios, currentUser]);

  const handleRestoreUsuario = useCallback((userId) => {
    const user = usuarios.find(u => u.id === userId);
    if (!user || !canPerformAction('RESTORE')) return;
    openActionModal(user, 'restore');
  }, [usuarios, currentUser]);

  const handleToggleUserStatus = useCallback((id) => {
    const user = usuarios.find(u => u.id === id);
    if (!user || !canToggleUserStatus(user)) return;
    openActionModal(user, 'toggleStatus');
  }, [usuarios, currentUser]);

  // HANDLERS PARA CREACIÓN Y EDICIÓN CON VALIDACIÓN
  const handleCreateUsuario = useCallback(async (newUsuarioData) => {
    if (!canPerformAction('CREATE')) {
      return;
    }

    try {
      await createUsuario(newUsuarioData);
      setIsSimpleCreateModalOpen(false);
      fetchUsuarios(filters, page, pageSize);
    } catch (err) {
      // Error manejado por el hook
    }
  }, [createUsuario, fetchUsuarios, filters, page, pageSize, currentUser]);

  const handleCreateUsuarioComplete = useCallback(async (newUsuarioData) => {
    if (!canPerformAction('CREATE')) {
      return;
    }

    try {
      await createUsuarioComplete(newUsuarioData);
      setIsCompleteCreateModalOpen(false);
      fetchUsuarios(filters, page, pageSize);
    } catch (err) {
      // Error manejado por el hook
    }
  }, [createUsuarioComplete, fetchUsuarios, filters, page, pageSize, currentUser]);

  const handleEditUsuario = (usuario) => {
    if (!canEditUser(usuario)) {
      return;
    }
    
    setCurrentUsuario(usuario);
    setIsEditModalOpen(true);
  };

  const handleUpdateUsuario = useCallback(async (id, updatedData) => {
    try {
      await updateUsuario(id, updatedData);
      setIsEditModalOpen(false);
      setCurrentUsuario(null);
      fetchUsuarios(filters, page, pageSize);
    } catch (err) {
      // Error manejado por el hook
    }
  }, [updateUsuario, fetchUsuarios, filters, page, pageSize]);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleInfoUsuario = (usuario) => {
    if (!canViewUser(usuario)) {
      return;
    }
    
    setSelectedInfoUser(usuario);
    setIsInfoModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsSimpleCreateModalOpen(false);
    setIsCompleteCreateModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentUsuario(null);
    clearError();
  };

  // EFECTO PARA REFRESCAR DATOS
  useEffect(() => {
    fetchUsuarios(filters, page, pageSize);
  }, [filters, page, pageSize, fetchUsuarios]);

  // Estadísticas movidas al dashboard
  const filteredUsers = getFilteredUsers();

  // =======================================
  // PERMISOS PARA LA TABLA
  // =======================================
  const tablePermissions = {
    canCreate: canPerformAction('CREATE'),
    canEdit: canPerformAction('EDIT'),
    canDelete: canPerformAction('DELETE'),
    canRestore: canPerformAction('RESTORE'),
    canHardDelete: canPerformAction('HARD_DELETE'),
    canView: canPerformAction('VIEW')
  };

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faUsers} className="mr-3 text-blue-600" />
          Gestión de Usuarios
        </h1>

      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="mb-6">
        <UsuarioSearch
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          rolesDisponibles={rolesDisponibles}
        />
      </div>

      {/* BOTONES DE ACCIÓN - Solo si tiene permisos */}
      {tablePermissions.canCreate && (
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setIsSimpleCreateModalOpen(true)}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Crear Usuario
          </button>
          <button
            onClick={() => setIsCompleteCreateModalOpen(true)}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Crear Usuario Completo
          </button>
        </div>
      )}

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Usuarios por página:</label>
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

      {/* TABLA DE USUARIOS CON PERMISOS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <UsuarioTable
          users={filteredUsers} // Solo usuarios que puede ver
          allRoles={rolesDisponibles}
          onEdit={handleEditUsuario}
          onInfo={handleInfoUsuario}
          onSoftDelete={handleSoftDeleteUsuario}
          onHardDelete={handleHardDeleteUsuario}
          onRestore={handleRestoreUsuario}
          onResetPassword={handleOpenResetModal}
          onToggleStatus={handleToggleUserStatus}
          loading={loading}
          // Nuevas props para control de permisos
          permissions={tablePermissions}
          canViewUser={canViewUser}
          canEditUser={canEditUser}
          canDeleteUser={canDeleteUser}
          canToggleUserStatus={canToggleUserStatus}
          canResetUserPassword={canResetUserPassword}
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

      {/* MODALES - Solo si tiene permisos */}
      {tablePermissions.canCreate && (
        <>
          <UsuarioCreateModal
            isOpen={isSimpleCreateModalOpen}
            onClose={handleCloseModals}
            onCreate={handleCreateUsuario}
            loading={loading}
            apiError={apiError}
            rolesDisponibles={rolesDisponibles}
          />

          <UsuarioCompleteCreateModal
            isOpen={isCompleteCreateModalOpen}
            onClose={handleCloseModals}
            onCreateComplete={handleCreateUsuarioComplete}
            loading={loading}
            apiError={apiError}
            rolesDisponibles={rolesDisponibles}
          />
        </>
      )}

      {tablePermissions.canEdit && (
        <UsuarioEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onUpdate={handleUpdateUsuario}
          currentUsuario={currentUsuario}
          loading={loading}
          apiError={apiError}
          rolesDisponibles={rolesDisponibles}
        />
      )}

      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => {
          setResetModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onResetPassword={handleResetPassword}
      />

      <UserActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedActionUser(null);
          setActionType(null);
        }}
        user={selectedActionUser}
        actionType={actionType}
        onConfirm={handleConfirmAction}
      />

      <UsuarioInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedInfoUser(null);
        }}
        usuario={selectedInfoUser}
        allRoles={rolesDisponibles}
      />
    </div>
  );
};

export default UsuariosPage;