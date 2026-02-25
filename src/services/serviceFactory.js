// src/services/serviceFactory.js
// Factory for creating standardized CRUD services with consistent patterns

import { BaseCrudService } from './baseCrudService';
import * as API from './api';

/**
 * Service Factory for creating standardized CRUD services
 * Provides consistent interface across all modules
 */
export class ServiceFactory {
  /**
   * Create a standardized CRUD service
   * @param {string} moduleName - Name of the module (e.g., 'usuarios', 'productos')
   * @param {Object} apiService - API service object with CRUD methods
   * @param {Object} options - Additional configuration options
   */
  static createService(moduleName, apiService, options = {}) {
    const {
      entityName = moduleName,
      entityNamePlural = `${moduleName}s`,
      customMethods = {},
      ...serviceOptions
    } = options;

    // Create base service
    const service = new BaseCrudService(apiService, entityName, entityNamePlural);

    // Add custom methods if provided
    Object.entries(customMethods).forEach(([methodName, methodImpl]) => {
      service[methodName] = methodImpl.bind(service);
    });

    return service;
  }

  /**
   * Create all standard services for the application
   */
  static createAllServices() {
    return {
      // User Management
      usuarios: this.createService('usuario', API.usersAPI, {
        entityNamePlural: 'usuarios',
        customMethods: {
          createComplete: async function(data) {
            try {
              const response = await this.api.createComplete(data);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al crear ${this.entityName} completo`);
            }
          },
          updateComplete: async function(id, data) {
            try {
              const response = await this.api.updateComplete(id, data);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al actualizar ${this.entityName} completo`);
            }
          },
          resetPassword: async function(id, newPassword) {
            try {
              const response = await this.api.resetPassword(id, newPassword);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al cambiar contraseña de ${this.entityName}`);
            }
          }
        }
      }),

      // Role Management
      roles: this.createService('rol', API.rolesAPI, {
        entityNamePlural: 'roles'
      }),

      // Person Management
      personas: this.createService('persona', API.personsAPI, {
        entityNamePlural: 'personas',
        customMethods: {
          associateUser: async function(id, userId) {
            try {
              const response = await this.api.associateUser(id, userId);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al asociar usuario a ${this.entityName}`);
            }
          },
          disassociateUser: async function(id) {
            try {
              const response = await this.api.disassociateUser(id);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al desasociar usuario de ${this.entityName}`);
            }
          },
          getWithoutUser: async function(params = {}) {
            try {
              const response = await this.api.getWithoutUser(params);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al obtener ${this.entityNamePlural} sin usuario`);
            }
          }
        }
      }),

      // Product Management
      productos: this.createService('producto', API.productsAPI, {
        entityNamePlural: 'productos',
        customMethods: {
          updateStock: async function(id, stockActual, motivo = 'Actualización manual') {
            try {
              const response = await this.api.updateStock(id, stockActual, motivo);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al actualizar stock de ${this.entityName}`);
            }
          },
          getLowStock: async function() {
            try {
              const response = await this.api.getLowStock();
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al obtener ${this.entityNamePlural} con stock bajo`);
            }
          },
          toggleFeatured: async function(id, destacado) {
            try {
              const response = await this.api.toggleFeatured(id, destacado);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al cambiar estado destacado de ${this.entityName}`);
            }
          },
          getFeatured: async function(params = {}) {
            try {
              const response = await this.api.getFeatured(params);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al obtener ${this.entityNamePlural} destacados`);
            }
          }
        }
      }),

      // Service Management
      servicios: this.createService('servicio', API.servicesAPI, {
        entityNamePlural: 'servicios'
      }),

      // Category Management
      categorias: this.createService('categoría', API.categoriesAPI, {
        entityNamePlural: 'categorías'
      }),

      // Service Category Management
      categoriasServicios: this.createService('categoría de servicio', API.serviceCategoriesAPI, {
        entityNamePlural: 'categorías de servicios'
      }),

      // Supplier Management
      proveedores: this.createService('proveedor', API.suppliersAPI, {
        entityNamePlural: 'proveedores',
        customMethods: {
          getWithProducts: async function(params = {}) {
            try {
              const response = await this.api.getWithProducts(params);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al obtener ${this.entityNamePlural} con productos`);
            }
          },
          getProducts: async function(id, params = {}) {
            try {
              const response = await this.api.getProducts(id, params);
              return {
                success: true,
                data: response.data,
                status: response.status
              };
            } catch (error) {
              return this.handleError(error, `Error al obtener productos de ${this.entityName}`);
            }
          }
        }
      }),

      // Motorcycle Management
      motos: this.createService('motocicleta', API.motorcyclesAPI, {
        entityNamePlural: 'motocicletas'
      }),

      // Maintenance Management
      mantenimientos: this.createService('mantenimiento', API.maintenanceAPI, {
        entityNamePlural: 'mantenimientos'
      }),

      // Sales Management
      ventas: this.createService('venta', API.salesAPI, {
        entityNamePlural: 'ventas'
      }),

      // Sales Detail Management
      detallesVenta: this.createService('detalle de venta', API.detailSalesAPI, {
        entityNamePlural: 'detalles de venta'
      }),

      // Inventory Management
      inventario: this.createService('inventario', API.inventoryAPI, {
        entityNamePlural: 'inventario'
      }),

      // Inventory Movement Management
      movimientosInventario: this.createService('movimiento de inventario', API.inventoryMovementAPI, {
        entityNamePlural: 'movimientos de inventario'
      }),

      // Maintenance Reminder Management
      recordatoriosMantenimiento: this.createService('recordatorio de mantenimiento', API.maintenanceReminderAPI, {
        entityNamePlural: 'recordatorios de mantenimiento'
      })
    };
  }

  /**
   * Get service by module name
   * @param {string} moduleName - Name of the module
   * @returns {BaseCrudService} - The service instance
   */
  static getService(moduleName) {
    const services = this.createAllServices();
    return services[moduleName];
  }

  /**
   * Create a service with custom configuration
   * @param {string} moduleName - Name of the module
   * @param {Object} config - Custom configuration
   * @returns {BaseCrudService} - The service instance
   */
  static createCustomService(moduleName, config) {
    const {
      apiService,
      entityName,
      entityNamePlural,
      customMethods = {},
      ...options
    } = config;

    return this.createService(moduleName, apiService, {
      entityName,
      entityNamePlural,
      customMethods,
      ...options
    });
  }
}

// Export pre-configured services
export const services = ServiceFactory.createAllServices();

// Export individual services for convenience
export const {
  usuarios: usuariosService,
  roles: rolesService,
  personas: personasService,
  productos: productosService,
  servicios: serviciosService,
  categorias: categoriasService,
  categoriasServicios: categoriasServiciosService,
  proveedores: proveedoresService,
  motos: motosService,
  mantenimientos: mantenimientosService,
  ventas: ventasService,
  detallesVenta: detallesVentaService,
  inventario: inventarioService,
  movimientosInventario: movimientosInventarioService,
  recordatoriosMantenimiento: recordatoriosMantenimientoService
} = services;

export default ServiceFactory;
