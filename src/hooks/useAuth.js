// src/hooks/useAuth.js

import { useContext, useMemo } from 'react';
import AuthContext from '../context/AuthContext';
import { 
  hasRole, 
  hasAnyRole, 
  hasPermission, 
  getPrimaryRole, 
  getRoleNames,
  isAdmin,
  isEmployee,
  isTechnician,
  isClient,
  getModulePermissions,
  canAccessRoute
} from '../utils/rolePermissions';

/**
 * Hook personalizado para manejar autenticación y autorización
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    roles,
    primaryRole,
    roleNames,
    login,
    logout,
    loadUser,
    changePassword,
    updateUser,
    clearError
  } = context;

  // Funciones de utilidad memoizadas para evitar re-renders innecesarios
  const authUtils = useMemo(() => ({
    // Verificaciones de rol
    hasRole: (requiredRole) => hasRole(roles, requiredRole),
    hasAnyRole: (requiredRoles) => hasAnyRole(roles, requiredRoles),
    
    // Verificaciones de permiso
    hasPermission: (module, action) => hasPermission(roles, module, action),
    getModulePermissions: (module) => getModulePermissions(module, roles),
    
    // Verificaciones de tipo de usuario
    isAdmin: () => isAdmin(roles),
    isEmployee: () => isEmployee(roles),
    isTechnician: () => isTechnician(roles),
    isClient: () => isClient(roles),
    
    // Utilidades de navegación
    canAccessRoute: (route) => canAccessRoute(route, roles),
    
    // Información del usuario
    getUserFullName: () => {
      if (user?.persona) {
        return `${user.persona.nombre} ${user.persona.apellido}`;
      }
      return user?.first_name && user?.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user?.username || 'Usuario';
    },
    
    getUserInitials: () => {
      const fullName = authUtils.getUserFullName();
      return fullName.split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    },
    
    // Información de contacto
    getUserEmail: () => user?.correo_electronico || '',
    getUserPhone: () => user?.persona?.telefono || '',
    
    // Estado del usuario
    isUserActive: () => user?.is_active || false,
    isStaff: () => user?.is_staff || false
  }), [roles, user]);

  // Información completa del contexto
  return {
    // Estados básicos
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    roles,
    primaryRole,
    roleNames,

    // Acciones
    login,
    logout,
    loadUser,
    changePassword,
    updateUser,
    clearError,

    // Utilidades
    ...authUtils
  };
};