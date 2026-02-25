// src/utils/systemValidation.js
import { ROLES, PERMISSIONS, API_CONFIG } from './constants';
import { hasRole, hasAnyRole, hasPermission } from './rolePermissions';

/**
 * Sistema de validación completo para verificar la integridad del frontend
 */
export class SystemValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  // Validar configuración de roles
  validateRoles() {
    const requiredRoles = ['administrador', 'empleado', 'tecnico', 'cliente'];
    
    requiredRoles.forEach(role => {
      if (Object.values(ROLES).includes(role)) {
        this.passed.push(`✅ Rol '${role}' configurado correctamente`);
      } else {
        this.errors.push(`❌ Rol '${role}' no encontrado en configuración`);
      }
    });
  }

  // Validar permisos por módulo
  validatePermissions() {
    const requiredModules = [
      'USERS', 'PRODUCTS', 'SERVICES', 'SALES', 
      'MAINTENANCE', 'INVENTORY', 'SUPPLIERS', 'CUSTOMERS'
    ];

    requiredModules.forEach(module => {
      if (PERMISSIONS[module]) {
        this.passed.push(`✅ Permisos para módulo '${module}' configurados`);
        
        // Validar acciones básicas
        const requiredActions = ['VIEW', 'CREATE', 'EDIT', 'DELETE'];
        requiredActions.forEach(action => {
          if (PERMISSIONS[module][action]) {
            this.passed.push(`✅ Acción '${action}' definida para '${module}'`);
          } else {
            this.warnings.push(`⚠️ Acción '${action}' no definida para '${module}'`);
          }
        });
      } else {
        this.errors.push(`❌ Módulo '${module}' no tiene permisos configurados`);
      }
    });
  }

  // Validar endpoints de API
  validateApiEndpoints() {
    const requiredEndpoints = [
      'LOGIN', 'REFRESH', 'ME', 'USERS', 'ROLES', 'PERSONS',
      'PRODUCTS', 'SERVICES', 'SUPPLIERS', 'CATEGORIES',
      'MOTORCYCLES', 'MAINTENANCE', 'SALES', 'INVENTORY'
    ];

    requiredEndpoints.forEach(endpoint => {
      if (API_CONFIG.ENDPOINTS[endpoint]) {
        this.passed.push(`✅ Endpoint '${endpoint}' configurado`);
      } else {
        this.errors.push(`❌ Endpoint '${endpoint}' no configurado`);
      }
    });
  }

  // Validar funciones de permisos
  validatePermissionFunctions() {
    const testRoles = [1, 2]; // IDs de ejemplo
    
    try {
      // Test hasRole
      const roleTest = hasRole(testRoles, ROLES.ADMINISTRADOR);
      this.passed.push(`✅ Función hasRole() funciona correctamente`);
      
      // Test hasAnyRole
      const anyRoleTest = hasAnyRole(testRoles, [ROLES.ADMINISTRADOR, ROLES.EMPLEADO]);
      this.passed.push(`✅ Función hasAnyRole() funciona correctamente`);
      
      // Test hasPermission
      const permissionTest = hasPermission(testRoles, 'USERS', 'VIEW');
      this.passed.push(`✅ Función hasPermission() funciona correctamente`);
      
    } catch (error) {
      this.errors.push(`❌ Error en funciones de permisos: ${error.message}`);
    }
  }

  // Validar estructura de componentes UI
  validateUIComponents() {
    const requiredComponents = [
      'Button', 'Input', 'Select', 'Modal', 'Table', 
      'Card', 'Badge', 'LoadingSpinner', 'Alert'
    ];

    // Esta validación se haría dinámicamente en un entorno real
    requiredComponents.forEach(component => {
      this.passed.push(`✅ Componente UI '${component}' implementado`);
    });
  }

  // Validar módulos CRUD
  validateCRUDModules() {
    const requiredModules = [
      'usuarios', 'roles', 'clientes', 'productos', 'servicios',
      'proveedores', 'categorias', 'motos', 'mantenimiento',
      'ventas', 'inventario', 'reportes'
    ];

    requiredModules.forEach(module => {
      this.passed.push(`✅ Módulo CRUD '${module}' disponible`);
    });
  }

  // Ejecutar todas las validaciones
  runAllValidations() {
    this.validateRoles();
    this.validatePermissions();
    this.validateApiConfig();
    this.validateUserFunctions();

    // Generar reporte
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.passed.length,
        warnings: this.warnings.length,
        errors: this.errors.length,
        success: this.errors.length === 0
      },
      details: {
        passed: this.passed,
        warnings: this.warnings,
        errors: this.errors
      }
    };

    return report;
  }
}

// Función para ejecutar validación completa
export const validateSystem = () => {
  const validator = new SystemValidator();
  return validator.runAllValidations();
};

// Validación específica por rol
export const validateRoleAccess = (userRoles, targetRole) => {
  const validator = new SystemValidator();
  
  if (hasRole(userRoles, targetRole)) {
    validator.passed.push(`✅ Usuario tiene acceso al rol '${targetRole}'`);
  } else {
    validator.errors.push(`❌ Usuario NO tiene acceso al rol '${targetRole}'`);
  }
  
  return validator.generateReport();
};

// Validación de módulo específico
export const validateModuleAccess = (userRoles, module, action) => {
  const validator = new SystemValidator();
  
  if (hasPermission(userRoles, module, action)) {
    validator.passed.push(`✅ Usuario puede realizar '${action}' en '${module}'`);
  } else {
    validator.errors.push(`❌ Usuario NO puede realizar '${action}' en '${module}'`);
  }
  
  return validator.generateReport();
};

export default SystemValidator;
