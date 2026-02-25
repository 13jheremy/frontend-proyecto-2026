// src/guards/PermissionGuard.jsx

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import UnauthorizedPage from '../pages/UnauthorizedPage';

/**
 * Componente guardian que protege rutas por permisos específicos
 */
export const PermissionGuard = ({ children, module, action }) => {
  const { hasPermission } = useAuth();

  // Si no se especifican módulo y acción, permitir acceso
  if (!module || !action) {
    return children;
  }

  // Verificar permiso específico
  if (!hasPermission(module, action)) {
    return <UnauthorizedPage />;
  }

  return children;
};
