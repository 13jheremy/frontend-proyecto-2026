// src/services/baseCrudService.js
// Base service class for standardized CRUD operations across all modules

import { toast } from 'react-toastify';

/**
 * Base CRUD Service Class
 * Provides standardized CRUD operations that can be extended by specific module services
 */
export class BaseCrudService {
  constructor(apiService, entityName, entityNamePlural = null) {
    this.api = apiService;
    this.entityName = entityName;
    this.entityNamePlural = entityNamePlural || `${entityName}s`;
  }

  // =======================================
  // BASIC CRUD OPERATIONS
  // =======================================

  /**
   * Get all entities with optional filters and pagination
   */
  async getAll(params = {}) {
    try {
      const response = await this.api.getAll(params);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al obtener ${this.entityNamePlural}`);
    }
  }

  /**
   * Get entity by ID
   */
  async getById(id) {
    try {
      const response = await this.api.getById(id);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al obtener ${this.entityName}`);
    }
  }

  /**
   * Create new entity
   */
  async create(data) {
    try {
      const response = await this.api.create(data);
      toast.success(`${this.entityName} creado exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al crear ${this.entityName}`);
    }
  }

  /**
   * Update entity (full update)
   */
  async update(id, data) {
    try {
      const response = await this.api.update(id, data);
      toast.success(`${this.entityName} actualizado exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al actualizar ${this.entityName}`);
    }
  }

  /**
   * Partial update entity
   */
  async patch(id, data) {
    try {
      const response = await this.api.patch(id, data);
      toast.success(`${this.entityName} actualizado exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al actualizar ${this.entityName}`);
    }
  }

  /**
   * Delete entity (usually soft delete)
   */
  async delete(id) {
    try {
      const response = await this.api.delete(id);
      toast.success(`${this.entityName} eliminado exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al eliminar ${this.entityName}`);
    }
  }

  // =======================================
  // ADVANCED CRUD OPERATIONS
  // =======================================

  /**
   * Activate entity
   */
  async activate(id) {
    try {
      const response = await this.api.activate(id);
      toast.success(`${this.entityName} activado exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al activar ${this.entityName}`);
    }
  }

  /**
   * Deactivate entity
   */
  async deactivate(id) {
    try {
      const response = await this.api.deactivate(id);
      toast.success(`${this.entityName} desactivado exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al desactivar ${this.entityName}`);
    }
  }

  /**
   * Toggle active status
   */
  async toggleActive(id, isActive = null) {
    try {
      const response = await this.api.toggleActive(id, isActive);
      const action = response.data?.activo ? 'activado' : 'desactivado';
      toast.success(`${this.entityName} ${action} exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al cambiar estado de ${this.entityName}`);
    }
  }

  /**
   * Soft delete entity
   */
  async softDelete(id) {
    try {
      const response = await this.api.softDelete(id);
      toast.success(`${this.entityName} eliminado temporalmente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al eliminar temporalmente ${this.entityName}`);
    }
  }

  /**
   * Hard delete entity (permanent)
   */
  async hardDelete(id) {
    try {
      const response = await this.api.hardDelete(id);
      toast.success(`${this.entityName} eliminado permanentemente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al eliminar permanentemente ${this.entityName}`);
    }
  }

  /**
   * Restore soft deleted entity
   */
  async restore(id) {
    try {
      const response = await this.api.restore(id);
      toast.success(`${this.entityName} restaurado exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al restaurar ${this.entityName}`);
    }
  }

  // =======================================
  // QUERY OPERATIONS
  // =======================================

  /**
   * Get active entities
   */
  async getActive(params = {}) {
    try {
      const response = await this.api.getActive(params);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al obtener ${this.entityNamePlural} activos`);
    }
  }

  /**
   * Get inactive entities
   */
  async getInactive(params = {}) {
    try {
      const response = await this.api.getInactive(params);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al obtener ${this.entityNamePlural} inactivos`);
    }
  }

  /**
   * Get deleted entities
   */
  async getDeleted(params = {}) {
    try {
      const response = await this.api.getDeleted(params);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al obtener ${this.entityNamePlural} eliminados`);
    }
  }

  /**
   * Search entities
   */
  async search(query, params = {}) {
    try {
      const response = await this.api.search(query, params);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al buscar ${this.entityNamePlural}`);
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    try {
      const response = await this.api.getStats();
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al obtener estadísticas de ${this.entityNamePlural}`);
    }
  }

  // =======================================
  // BULK OPERATIONS
  // =======================================

  /**
   * Activate multiple entities
   */
  async activateMultiple(ids) {
    try {
      const response = await this.api.activateMultiple(ids);
      toast.success(`${ids.length} ${this.entityNamePlural} activados exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al activar múltiples ${this.entityNamePlural}`);
    }
  }

  /**
   * Deactivate multiple entities
   */
  async deactivateMultiple(ids) {
    try {
      const response = await this.api.deactivateMultiple(ids);
      toast.success(`${ids.length} ${this.entityNamePlural} desactivados exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al desactivar múltiples ${this.entityNamePlural}`);
    }
  }

  /**
   * Soft delete multiple entities
   */
  async softDeleteMultiple(ids) {
    try {
      const response = await this.api.softDeleteMultiple(ids);
      toast.success(`${ids.length} ${this.entityNamePlural} eliminados temporalmente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al eliminar múltiples ${this.entityNamePlural}`);
    }
  }

  /**
   * Restore multiple entities
   */
  async restoreMultiple(ids) {
    try {
      const response = await this.api.restoreMultiple(ids);
      toast.success(`${ids.length} ${this.entityNamePlural} restaurados exitosamente`);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return this.handleError(error, `Error al restaurar múltiples ${this.entityNamePlural}`);
    }
  }

  // =======================================
  // ERROR HANDLING
  // =======================================

  /**
   * Standardized error handling
   */
  handleError(error, defaultMessage) {
    console.error(`${this.entityName} Service Error:`, error);

    let errorMessage = defaultMessage;
    let validationErrors = null;

    if (error.response) {
      const { status, data } = error.response;

      // Handle validation errors (400)
      if (status === 400 && data) {
        if (typeof data === 'object' && !data.detail && !data.error) {
          // Field validation errors
          validationErrors = data;
          errorMessage = 'Por favor corrige los errores en el formulario';
        } else {
          errorMessage = data.detail || data.error || data.message || defaultMessage;
        }
      }
      // Handle authentication errors (401)
      else if (status === 401) {
        errorMessage = 'No tienes permisos para realizar esta acción';
      }
      // Handle forbidden errors (403)
      else if (status === 403) {
        errorMessage = 'Acceso denegado';
      }
      // Handle not found errors (404)
      else if (status === 404) {
        errorMessage = `${this.entityName} no encontrado`;
      }
      // Handle conflict errors (409)
      else if (status === 409) {
        errorMessage = data.detail || data.error || 'Conflicto de datos';
      }
      // Handle server errors (500+)
      else if (status >= 500) {
        errorMessage = 'Error interno del servidor. Intenta nuevamente.';
      }
      // Other HTTP errors
      else {
        errorMessage = data.detail || data.error || data.message || defaultMessage;
      }
    }
    // Network or other errors
    else if (error.request) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
    }
    // Other errors
    else {
      errorMessage = error.message || defaultMessage;
    }

    // Show toast notification for non-validation errors
    if (!validationErrors) {
      toast.error(errorMessage);
    }

    return {
      success: false,
      error: errorMessage,
      validationErrors,
      status: error.response?.status,
      originalError: error
    };
  }

  // =======================================
  // UTILITY METHODS
  // =======================================

  /**
   * Check if API method exists
   */
  hasMethod(methodName) {
    return typeof this.api[methodName] === 'function';
  }

  /**
   * Execute method if it exists
   */
  async executeIfExists(methodName, ...args) {
    if (this.hasMethod(methodName)) {
      return await this.api[methodName](...args);
    }
    throw new Error(`Method ${methodName} not implemented for ${this.entityName}`);
  }
}

export default BaseCrudService;
