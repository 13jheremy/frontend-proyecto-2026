// src/utils/rolePermissions.js - VERSIÓN CORREGIDA

import { ROLES, PERMISSIONS, ROLE_ROUTES } from './constants';

/**
 * =======================================
 * FUNCIONES DE UTILIDAD PARA ROLES
 * =======================================
 */

/**
 * Obtener rol primario basado en roles del usuario
 * CORREGIDO: Ahora maneja roles como array de strings
 */
export const getPrimaryRole = (roles) => {
  if (!roles || roles.length === 0) return null;
  
  // Orden de prioridad para roles
  const prioridades = [
    ROLES.ADMINISTRADOR,
    ROLES.EMPLEADO, 
    ROLES.TECNICO,
    ROLES.CLIENTE
  ];

  // Los roles ya vienen en el formato correcto desde el backend
  for (const rolPrioridad of prioridades) {
    if (roles.includes(rolPrioridad)) {
      return rolPrioridad;
    }
  }
  
  return roles[0]; // Fallback al primer rol si no encuentra coincidencias
};

/**
 * Obtener nombres de roles para mostrar en UI
 * CORREGIDO: Maneja roles como array de strings
 */
export const getRoleNames = (roles = []) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return [];
  }

  // Los roles ya vienen normalizados desde AuthContext, solo retornar
  return roles.filter(Boolean);
};

/**
 * Verificar si el usuario tiene un rol específico
 * CORREGIDO: Funciona con array de strings
 */
export const hasRole = (userRoles = [], requiredRole) => {
  if (!Array.isArray(userRoles) || !requiredRole) {
    return false;
  }

  // Los roles ya vienen normalizados desde AuthContext como strings en minúsculas
  const normalizedRoles = userRoles.map(rol => {
    if (typeof rol === 'string') {
      return rol.toLowerCase(); // Asegurar minúsculas
    } else if (typeof rol === 'object' && rol.nombre) {
      return rol.nombre.toLowerCase(); // Extraer nombre del objeto
    } else if (typeof rol === 'object' && rol.rol && rol.rol.nombre) {
      return rol.rol.nombre.toLowerCase(); // Formato anidado
    }
    return null;
  }).filter(Boolean);

  const result = normalizedRoles.includes(requiredRole.toLowerCase());
  return result;
};

/**
 * Verificar si el usuario tiene cualquiera de los roles requeridos
 */
export const hasAnyRole = (userRoles = [], requiredRoles = []) => {
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
    return false;
  }
  
  return requiredRoles.some(role => hasRole(userRoles, role));
};

/**
 * =======================================
 * FUNCIONES DE VERIFICACIÓN DE TIPO DE USUARIO
 * =======================================
 */

export const isAdmin = (roles) => hasRole(roles, ROLES.ADMINISTRADOR);
export const isEmployee = (roles) => hasRole(roles, ROLES.EMPLEADO);
export const isTechnician = (roles) => hasRole(roles, ROLES.TECNICO);
export const isClient = (roles) => hasRole(roles, ROLES.CLIENTE);

/**
 * =======================================
 * FUNCIONES DE PERMISOS
 * =======================================
 */

/**
 * Verificar si el usuario tiene permiso para un módulo y acción específica
 */
export const hasPermission = (userRoles, module, action) => {
  if (!userRoles || !module || !action) {
    return false;
  }

  const modulePermissions = PERMISSIONS[module];
  if (!modulePermissions) {
    return false;
  }

  const actionPermissions = modulePermissions[action];
  if (!actionPermissions) {
    return false;
  }

  // Verificar si el usuario tiene alguno de los roles requeridos para esta acción
  return hasAnyRole(userRoles, actionPermissions);
};

/**
 * Obtener todos los permisos de un módulo para el usuario
 */
export const getModulePermissions = (module, userRoles) => {
  const modulePermissions = PERMISSIONS[module];
  if (!modulePermissions) {
    return {};
  }

  const permissions = {};
  Object.keys(modulePermissions).forEach(action => {
    permissions[action] = hasPermission(userRoles, module, action);
  });

  return permissions;
};

/**
 * =======================================
 * FUNCIONES DE NAVEGACIÓN
 * =======================================
 */

/**
 * Verificar si el usuario puede acceder a una ruta específica
 */
export const canAccessRoute = (route, userRoles) => {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  const primaryRole = getPrimaryRole(userRoles);
  if (!primaryRole) {
    return false;
  }

  const allowedRoutes = ROLE_ROUTES[primaryRole] || [];
  return allowedRoutes.some(allowedRoute => 
    allowedRoute.path === route || route.startsWith(allowedRoute.path)
  );
};

/**
 * Obtener rutas disponibles para el usuario
 */
export const getAvailableRoutes = (userRoles) => {
  const primaryRole = getPrimaryRole(userRoles);
  if (!primaryRole) {
    return [];
  }

  return ROLE_ROUTES[primaryRole] || [];
};

/**
 * =======================================
 * FUNCIONES DE DEBUGGING
 * =======================================
 */

/**
 * Función para debugging de roles
 */
export const debugRoles = (userRoles) => {
  // Debug function - logs removed for production
  return {
    roles: userRoles,
    isArray: Array.isArray(userRoles),
    length: userRoles?.length,
    primaryRole: getPrimaryRole(userRoles),
    roleNames: getRoleNames(userRoles),
    isAdmin: isAdmin(userRoles),
    isEmployee: isEmployee(userRoles),
    isTechnician: isTechnician(userRoles),
    isClient: isClient(userRoles)
  };
};

/**
 * =======================================
 * FUNCIONES AUXILIARES
 * =======================================
 */

/**
 * Normalizar roles del backend
 */
export const normalizeRoles = (roles) => {
  if (!roles) return [];
  if (typeof roles === 'string') return [roles];
  if (Array.isArray(roles)) return roles;
  return [];
};

/**
 * Validar estructura de roles
 */
export const validateRoles = (roles) => {
  const normalized = normalizeRoles(roles);
  const validRoles = ['Administrador', 'Empleado', 'Tecnico', 'Cliente'];
  
  return {
    isValid: normalized.every(role => validRoles.includes(role)),
    normalized,
    invalid: normalized.filter(role => !validRoles.includes(role))
  };
};