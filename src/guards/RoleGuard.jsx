// src/guards/RoleGuard.jsx

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import UnauthorizedPage from '../pages/UnauthorizedPage';

/**
 * Componente guardian que protege rutas por roles
 */
export const RoleGuard = ({ children, requiredRoles, requireAll = false }) => {
  const { hasRole, hasAnyRole } = useAuth();

  // Si no se especifican roles requeridos, permitir acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    return children;
  }

  // Verificar permisos según la configuración
  const hasPermission = requireAll
    ? requiredRoles.every(role => hasRole(role))
    : hasAnyRole(requiredRoles);

  // Si no tiene permisos, mostrar página de no autorizado
  if (!hasPermission) {
    return <UnauthorizedPage />;
  }

  return children;
};