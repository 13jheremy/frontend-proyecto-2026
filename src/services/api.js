// src/services/api.js - VERSIÓN CORREGIDA

import axios from 'axios';
import { API_CONFIG, MESSAGES } from '../utils/constants';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
  },
});

// Interceptor para requests - agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejar refresh token automáticamente
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refresh ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`,
            { refresh: refreshToken }
          );
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Reintentar la request original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          // Si el refresh token también falló, limpiar localStorage y redirigir
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No hay refresh token, redirigir al login
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// =======================================
// FUNCIÓN APIQUEST CORREGIDA
// =======================================
/**
 * Función genérica para hacer requests
 * CORREGIDA: Ahora lanza errores de Axios directamente para preservar error.response
 */
const apiRequest = async (method, endpoint, data = null, config = {}) => {
  try {
    const headers = { ...config.headers }; // Copia los headers existentes

    // Si los datos son FormData, no establezcas Content-Type, el navegador lo hará
    if (data instanceof FormData) {
      delete headers['Content-Type']; // Elimina el Content-Type si ya está establecido a application/json
    } else if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'; // Por defecto para JSON
    }

    const response = await api({
      method,
      url: endpoint,
      data,
      headers, // Usa los headers modificados
      timeout: 10000, // 10 second timeout
      ...config // Otros configs pueden sobrescribir headers si es necesario
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
    
  } catch (error) {
    
    // CAMBIO CRÍTICO: Lanzar el error original de Axios para preservar error.response
    throw error;
  }
};

// =======================================
// NUEVA FUNCIÓN WRAPPER PARA MANTENER COMPATIBILIDAD
// =======================================
/**
 * Wrapper para funciones que esperan el formato {success, error}
 * Solo usar donde sea absolutamente necesario para compatibilidad
 */
const apiRequestSafe = async (method, endpoint, data = null, config = {}) => {
  try {
    const response = await apiRequest(method, endpoint, data, config);
    return response; // Ya tiene formato {success: true, data, status}
  } catch (error) {
    // Solo aquí convertimos a formato legacy si es necesario
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.error || 
                        error.message || 
                        MESSAGES.API.ERROR;
    
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      // Preservar información adicional del error
      originalError: error
    };
  }
};

// Autenticación - usando apiRequestSafe porque maneja respuestas {success, error}
export const authAPI = {
  login: async (correo_electronico, password) => {
    return await apiRequestSafe('POST', API_CONFIG.ENDPOINTS.LOGIN, {
      correo_electronico,
      password
    });
  },

  refresh: async (refresh_token) => {
    return await apiRequestSafe('POST', API_CONFIG.ENDPOINTS.REFRESH, {
      refresh: refresh_token
    });
  },

  getMe: async () => {
    return await apiRequestSafe('GET', API_CONFIG.ENDPOINTS.ME);
  },

  changePassword: async (oldPassword, newPassword) => {
    return await apiRequestSafe('PUT', API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword
    });
  },

  resetPassword: (id, newPassword) => 
    apiRequestSafe(
      'POST', 
      `${API_CONFIG.ENDPOINTS.USERS}${id}/cambiar_password/`, 
      { new_password: newPassword }
    ),

  logout: async (refresh_token) => {
    return await apiRequestSafe('POST', API_CONFIG.ENDPOINTS.LOGOUT, {
      refresh_token
    });
  }
};

// =======================================
// USUARIOS API - VERSIÓN CORREGIDA
// =======================================
export const usersAPI = {
  // Usar apiRequest (que lanza errores) para preservar error.response
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.USERS, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.USERS}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.USERS, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.USERS}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.USERS}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.USERS}${id}/`),

  createComplete: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.CREATECOMPLETE, data),
  getComplete: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.GETCOMPLETE}${id}/`),
  updateComplete: (id, data) => 
    apiRequest('PUT', `${API_CONFIG.ENDPOINTS.USERS}${id}/update_complete/`, data),
  softDelete: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.USERS}${id}/soft_delete/`),
  hardDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.USERS}${id}/hard_delete/`),
  restoreUser: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.USERS}${id}/restore/`),


  resetPassword: (id, newPassword) => 
    apiRequest('POST', `${API_CONFIG.ENDPOINTS.USERS}${id}/cambiar_password/`, { new_password: newPassword }),
  
  assignRoles: (id, roles) => apiRequest('POST', `${API_CONFIG.ENDPOINTS.USERS}${id}/assign_roles/`, { roles }),
  removeRoles: (id, roles) => apiRequest('POST', `${API_CONFIG.ENDPOINTS.USERS}${id}/remove_roles/`, { roles }),
  toggleStatus: (id, isActive) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.USERS}${id}/toggle_user_status/`, { is_active: isActive })
};

// ROLES API - Corregida
export const rolesAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.ROLES, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.ROLES}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.ROLES, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.ROLES}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.ROLES}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.ROLES}${id}/`),

  activate: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.ROLES}${id}/activar/`),
  deactivate: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.ROLES}${id}/desactivar/`),
  toggleActive: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.ROLES}${id}/toggle_activo/`),
  softDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.ROLES}${id}/borrar_temporal/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.ROLES}${id}/restaurar/`),
  deletePermanent: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.ROLES}${id}/eliminar-permanente/`),
  
  getActive: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.ROLES}activos/`, null, { params }),
  getInactive: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.ROLES}inactivos/`, null, { params }),
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.ROLES}eliminados/`, null, { params }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.ROLES}estadisticas/`)
};

// Para el resto de las APIs, simplemente reemplaza apiRequestSafe con apiRequest 
// donde necesites preservar errores de validación (como en usersAPI)
// y deja apiRequestSafe donde necesites el formato {success, error}

// PERSONAS API - Corregida
export const personsAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.PERSONS, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PERSONS}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.PERSONS, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.PERSONS}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.PERSONS}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.PERSONS}${id}/`),

  softDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.PERSONS}${id}/borrar_temporal/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.PERSONS}${id}/restaurar/`),
  deletePermanent: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.PERSONS}${id}/eliminar-permanente/`),
  
  associateUser: (id, userId) => apiRequest('POST', `${API_CONFIG.ENDPOINTS.PERSONS}${id}/asociar_usuario/`, { usuario_id: userId }),
  disassociateUser: (id) => apiRequest('POST', `${API_CONFIG.ENDPOINTS.PERSONS}${id}/desasociar_usuario/`),
  
  getWithoutUser: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PERSONS}sin_usuario/`, null, { params }),
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PERSONS}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.PERSONS, null, { params: { search: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PERSONS}estadisticas/`)
};

// =======================================
// PRODUCTOS - COMPLETAR FUNCIONALIDADES
// =======================================
export const productsAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.PRODUCTS, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PRODUCTS}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.PRODUCTS, data),
  update: (id, data, config = {}) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.PRODUCTS}${id}/`, data, config),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.PRODUCTS}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.PRODUCTS}${id}/`),

  // FUNCIONALIDADES EXISTENTES
  getLowStock: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PRODUCTS}stock_bajo/`),
  toggleFeatured: (id, destacado) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.PRODUCTS}${id}/toggle_destacado/`, { destacado }),
  getFeatured: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PRODUCTS}destacados/`, null, { params }),
  toggleActive: (id, activo) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.PRODUCTS}${id}/toggle_activo/`, { activo }),

  // NUEVAS FUNCIONALIDADES FALTANTES
  softDelete: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.PRODUCTS}${id}/soft_delete/`),
  hardDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.PRODUCTS}${id}/hard_delete/`),
  restoreProduct: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.PRODUCTS}${id}/restore/`),

  
  // Gestión de stock
  updateStock: (id, stockActual, motivo = 'Actualización manual') => 
    apiRequest('POST', `${API_CONFIG.ENDPOINTS.PRODUCTS}${id}/actualizar_stock/`, { stock_actual: stockActual, motivo }),
  
  // Consultas específicas
  getActive: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PRODUCTS}activos/`, null, { params }),
  getInactive: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PRODUCTS}inactivos/`, null, { params }),
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PRODUCTS}eliminados/`, null, { params }),

  getByCategory: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PRODUCTS}por_categoria/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', '/buscar/productos/', null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.PRODUCTS}estadisticas/`),
  
  // API pública
  // Catálogo general con filtros (categoría, precio, búsqueda, etc.)
  getCatalog: (params = {}) =>
    apiRequest('GET', `${API_CONFIG.ENDPOINTS.PUBLIC_PRODUCTS}productos/`, null, { params }),

  getDestacados: () =>
    apiRequest('GET', `${API_CONFIG.ENDPOINTS.PUBLIC_PRODUCTS}destacados/`),


};

// =======================================
// SERVICIOS - COMPLETAR FUNCIONALIDADES
// =======================================
export const servicesAPI = {
  getAll: (params = {}) => apiRequest("GET", API_CONFIG.ENDPOINTS.SERVICES, null, { params }),
  getById: (id) => apiRequest("GET", `${API_CONFIG.ENDPOINTS.SERVICES}${id}/`),
  create: (data) => apiRequest("POST", API_CONFIG.ENDPOINTS.SERVICES, data),
  update: (id, data) => apiRequest("PUT", `${API_CONFIG.ENDPOINTS.SERVICES}${id}/`, data),
  patch: (id, data) => apiRequest("PATCH", `${API_CONFIG.ENDPOINTS.SERVICES}${id}/`, data),
  delete: (id) => apiRequest("DELETE", `${API_CONFIG.ENDPOINTS.SERVICES}${id}/`),

  // FUNCIONALIDADES EXISTENTES
  toggleActivo: (id) => apiRequest("PATCH", `${API_CONFIG.ENDPOINTS.SERVICES}${id}/toggle_activo/`),
  softDelete: (id) => apiRequest("PATCH", `${API_CONFIG.ENDPOINTS.SERVICES}${id}/soft_delete/`),
  restore: (id) => apiRequest("PATCH", `${API_CONFIG.ENDPOINTS.SERVICES}${id}/restore/`),
  hardDelete: (id) => apiRequest("DELETE", `${API_CONFIG.ENDPOINTS.SERVICES}${id}/hard_delete/`),



  // Consultas específicas
  getActive: (params = {}) => apiRequest("GET", `${API_CONFIG.ENDPOINTS.SERVICES}activos/`, null, { params }),
  getInactive: (params = {}) => apiRequest("GET", `${API_CONFIG.ENDPOINTS.SERVICES}inactivos/`, null, { params }),
  getDeleted: (params = {}) => apiRequest("GET", `${API_CONFIG.ENDPOINTS.SERVICES}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest("GET", API_CONFIG.ENDPOINTS.POS_BUSCAR_SERVICIOS, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest("GET", `${API_CONFIG.ENDPOINTS.SERVICES}estadisticas/`),

  // Acciones múltiples
  activateMultiple: (ids) => apiRequest("POST", `${API_CONFIG.ENDPOINTS.SERVICES}activar_multiples/`, { ids }),
  deactivateMultiple: (ids) => apiRequest("POST", `${API_CONFIG.ENDPOINTS.SERVICES}desactivar_multiples/`, { ids }),
  softDeleteMultiple: (ids) => apiRequest("DELETE", `${API_CONFIG.ENDPOINTS.SERVICES}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest("PATCH", `${API_CONFIG.ENDPOINTS.SERVICES}restaurar_multiples/`, { ids })
};

// =======================================
// PROVEEDORES - YA COMPLETO
// =======================================
export const suppliersAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.SUPPLIERS, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SUPPLIERS}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.SUPPLIERS, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.SUPPLIERS}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SUPPLIERS}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.SUPPLIERS}${id}/`),

  toggleActive: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SUPPLIERS}${id}/toggle_activo/`),
  softDelete: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SUPPLIERS}${id}/soft_delete/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SUPPLIERS}${id}/restore/`),
  hardDelete: (id) => apiRequest("DELETE", `${API_CONFIG.ENDPOINTS.SUPPLIERS}${id}/hard_delete/`),
  // Consultas específicas
  getActive: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SUPPLIERS}activos/`, null, { params }),
  getInactive: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SUPPLIERS}inactivos/`, null, { params }),
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SUPPLIERS}eliminados/`, null, { params }),
  getWithProducts: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SUPPLIERS}con_productos/`, null, { params }),
  getProducts: (id, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SUPPLIERS}${id}/productos/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SUPPLIERS}buscar/`, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SUPPLIERS}estadisticas/`)
};

// =======================================
// CATEGORÍAS - AGREGAR FUNCIONALIDADES FALTANTES
// =======================================
export const categoriesAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.CATEGORIES, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.CATEGORIES, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/`),

  // NUEVAS FUNCIONALIDADES
  activate: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/activar/`),
  deactivate: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/desactivar/`),
  toggleActive: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/toggle_activo/`),
  softDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/borrar_temporal/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/restaurar/`),
  deletePermanent: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/eliminar-permanente/`),

  // Consultas específicas
  getActive: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.CATEGORIES}activos/`, null, { params }),
  getInactive: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.CATEGORIES}inactivos/`, null, { params }),
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.CATEGORIES}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.CATEGORIES}buscar/`, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.CATEGORIES}estadisticas/`),

  // Acciones múltiples
  activateMultiple: (ids) => apiRequest('POST', `${API_CONFIG.ENDPOINTS.CATEGORIES}activar_multiples/`, { ids }),
  deactivateMultiple: (ids) => apiRequest('POST', `${API_CONFIG.ENDPOINTS.CATEGORIES}desactivar_multiples/`, { ids }),
  softDeleteMultiple: (ids) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.CATEGORIES}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.CATEGORIES}restaurar_multiples/`, { ids })
};

// =======================================
// CATEGORÍAS PÚBLICAS - YA COMPLETAS
// =======================================
export const categoriesPublic = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.CATEGORIESPUBLIC, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.CATEGORIESPUBLIC}${id}/`)
};

// =======================================
// CATEGORÍAS DE SERVICIOS - AGREGAR FUNCIONALIDADES FALTANTES
// =======================================
export const serviceCategoriesAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}${id}/`),

  // NUEVAS FUNCIONALIDADES
  toggleActive: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}${id}/toggle_activo/`),
  softDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}${id}/soft_delete/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}${id}/restore/`),
  hardDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}${id}/hard_delete/`),

  // Consultas específicas
  getActive: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}activos/`, null, { params }),
  getInactive: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}inactivos/`, null, { params }),
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}buscar/`, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}estadisticas/`),

  // Acciones múltiples
  activateMultiple: (ids) => apiRequest('POST', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}activar_multiples/`, { ids }),
  deactivateMultiple: (ids) => apiRequest('POST', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}desactivar_multiples/`, { ids }),
  softDeleteMultiple: (ids) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}restaurar_multiples/`, { ids })
};

// =======================================
// MOTOCICLETAS - COMPLETAR FUNCIONALIDADES
// =======================================
export const motorcyclesAPI = {
  getAll: (params = {}) => apiRequest("GET", API_CONFIG.ENDPOINTS.MOTORCYCLES, null, { params }),
  getById: (id) => apiRequest("GET", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}${id}/`),
  create: (data) => apiRequest("POST", API_CONFIG.ENDPOINTS.MOTORCYCLES, data),
  update: (id, data) => apiRequest("PUT", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}${id}/`, data),
  patch: (id, data) => apiRequest("PATCH", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}${id}/`, data),
  delete: (id) => apiRequest("DELETE", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}${id}/`),

  // FUNCIONALIDADES EXISTENTES
  toggleActive: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MOTORCYCLES}${id}/toggle_activo/`),
  softDelete: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MOTORCYCLES}${id}/soft_delete/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MOTORCYCLES}${id}/restore/`),
  hardDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MOTORCYCLES}${id}/hard_delete/`),

  // Consultas específicas
  getActive: (params = {}) => apiRequest("GET", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}activos/`, null, { params }),
  getInactive: (params = {}) => apiRequest("GET", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}inactivos/`, null, { params }),
  getDeleted: (params = {}) => apiRequest("GET", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest("GET", `pos/motos/buscar/`, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest("GET", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}estadisticas/`),

  // Acciones múltiples
  activateMultiple: (ids) => apiRequest("POST", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}activar_multiples/`, { ids }),
  deactivateMultiple: (ids) => apiRequest("POST", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}desactivar_multiples/`, { ids }),
  softDeleteMultiple: (ids) => apiRequest("DELETE", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest("PATCH", `${API_CONFIG.ENDPOINTS.MOTORCYCLES}restaurar_multiples/`, { ids })
};

// =======================================
// MANTENIMIENTOS - AGREGAR FUNCIONALIDADES FALTANTES
// =======================================
export const maintenanceAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.MAINTENANCE, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCE}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.MAINTENANCE, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.MAINTENANCE}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MAINTENANCE}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCE}${id}/`),

  // NUEVAS FUNCIONALIDADES
  softDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCE}${id}/borrar_temporal/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MAINTENANCE}${id}/restaurar/`),
  deletePermanent: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCE}${id}/eliminar-permanente/`),

  // Consultas específicas
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCE}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCE}buscar/`, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCE}estadisticas/`),

  // Acciones múltiples
  softDeleteMultiple: (ids) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCE}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MAINTENANCE}restaurar_multiples/`, { ids })
};

// =======================================
// VENTAS - AGREGAR FUNCIONALIDADES FALTANTES
// =======================================
export const salesAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.SALES, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SALES}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.SALES, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.SALES}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SALES}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.SALES}${id}/`),

  // NUEVAS FUNCIONALIDADES
  softDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.SALES}${id}/borrar_temporal/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SALES}${id}/restaurar/`),
  deletePermanent: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.SALES}${id}/eliminar-permanente/`),

  // Consultas específicas
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SALES}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', '/buscar/productos/', null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.SALES}estadisticas/`),

  // Acciones múltiples
  softDeleteMultiple: (ids) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.SALES}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.SALES}restaurar_multiples/`, { ids })
};

// =======================================
// DETALLES DE VENTA - AGREGAR FUNCIONALIDADES FALTANTES
// =======================================
export const detailSalesAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.DETAILSALES, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.DETAILSALES}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.DETAILSALES, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.DETAILSALES}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.DETAILSALES}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.DETAILSALES}${id}/`),

  // NUEVAS FUNCIONALIDADES
  softDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.DETAILSALES}${id}/borrar_temporal/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.DETAILSALES}${id}/restaurar/`),
  deletePermanent: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.DETAILSALES}${id}/eliminar-permanente/`),

  // Consultas específicas
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.DETAILSALES}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.DETAILSALES}buscar/`, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.DETAILSALES}estadisticas/`),

  // Acciones múltiples
  softDeleteMultiple: (ids) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.DETAILSALES}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.DETAILSALES}restaurar_multiples/`, { ids })
};

// =======================================
// INVENTARIO - AGREGAR FUNCIONALIDADES FALTANTES
// =======================================
export const inventoryAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.INVENTORY, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.INVENTORY}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.INVENTORY, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.INVENTORY}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.INVENTORY}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.INVENTORY}${id}/`),

  // NUEVAS FUNCIONALIDADES
  softDelete: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.INVENTORY}${id}/soft_delete/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.INVENTORY}${id}/restore/`),
  deletePermanent: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.INVENTORY}${id}/hard_delete/`),

  // Consultas específicas
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.INVENTORY}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.INVENTORY}buscar/`, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.INVENTORY}estadisticas/`),

  // Toggle activo/inactivo
  toggleActive: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.INVENTORY}${id}/toggle_activo/`),

  // Acciones múltiples
  softDeleteMultiple: (ids) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.INVENTORY}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.INVENTORY}restaurar_multiples/`, { ids })
};

// =======================================
// MOVIMIENTOS DE INVENTARIO - AGREGAR FUNCIONALIDADES FALTANTES
// =======================================
export const inventoryMovementAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}${id}/`),

  // NUEVAS FUNCIONALIDADES
  softDelete: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}${id}/soft_delete/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}${id}/restore/`),
  deletePermanent: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}${id}/hard_delete/`),

  // Consultas específicas
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}buscar/`, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}estadisticas/`),

  // Acciones múltiples
  softDeleteMultiple: (ids) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.INVENTORYMOVEMENT}restaurar_multiples/`, { ids })
};

// =======================================
// RECORDATORIOS DE MANTENIMIENTO - AGREGAR FUNCIONALIDADES FALTANTES
// =======================================
export const maintenanceReminderAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}${id}/`),

  // NUEVAS FUNCIONALIDADES
  softDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}${id}/borrar_temporal/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}${id}/restaurar/`),
  deletePermanent: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}${id}/eliminar-permanente/`),

  // Consultas específicas
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}eliminados/`, null, { params }),
  getUpcoming: (days = 7, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}proximos/`, null, { params: { dias: days, ...params } }),
  search: (query, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}buscar/`, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}estadisticas/`),

  // Acciones múltiples
  softDeleteMultiple: (ids) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MAINTENANCEREMINDER}restaurar_multiples/`, { ids })
};

// =======================================
// DETALLES DE MANTENIMIENTO - AGREGAR FUNCIONALIDADES FALTANTES
// =======================================
export const maintenanceDetailsAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/', null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/', data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}${id}/`),

  // NUEVAS FUNCIONALIDADES
  softDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}${id}/borrar_temporal/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}${id}/restaurar/`),
  deletePermanent: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}${id}/eliminar-permanente/`),

  // Consultas específicas
  getDeleted: (params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}eliminados/`, null, { params }),
  search: (query, params = {}) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}buscar/`, null, { params: { q: query, ...params } }),
  getStats: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}estadisticas/`),

  // Acciones múltiples
  softDeleteMultiple: (ids) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}eliminar_multiples_temporal/`, { ids }),
  restoreMultiple: (ids) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.MAINTENANCEDETAILS || '/api/detalle-mantenimientos/'}restaurar_multiples/`, { ids })
};

// =======================================
// DASHBOARD - MANTENER COMO ESTABA
// =======================================
export const dashboardAPI = {
  getStats: (params = {}) => 
    apiRequest('GET', API_CONFIG.ENDPOINTS.DASHBOARD_STATS, null, { params }),
  
  getClientStats: () =>
    apiRequest('GET', API_CONFIG.ENDPOINTS.CLIENT_DASHBOARD_STATS),

  getTechnicianStats: () =>
    apiRequest('GET', API_CONFIG.ENDPOINTS.TECHNICIAN_DASHBOARD_STATS),

  getSalesReport: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.SALES_REPORT, null, { params }),
  healthCheck: () => apiRequest('GET', API_CONFIG.ENDPOINTS.HEALTH_CHECK)
};

// API específica para clientes
export const clientAPI = {
  getMotos: () =>
    apiRequest('GET', API_CONFIG.ENDPOINTS.CLIENT_MOTOS),
  
  getVentas: () =>
    apiRequest('GET', API_CONFIG.ENDPOINTS.CLIENT_VENTAS),
  
  getMantenimientos: () =>
    apiRequest('GET', API_CONFIG.ENDPOINTS.CLIENT_MANTENIMIENTOS)
};

// =======================================
// FUNCIONES AUXILIARES PARA ACCIONES MASIVAS
// =======================================

/**
 * Función auxiliar para ejecutar acciones masivas en cualquier endpoint
 */
export const bulkActions = {
  // Activar múltiples elementos
  activateMultiple: (endpoint, ids) => 
    apiRequest('POST', `${endpoint}activar_multiples/`, { ids }),
  
  // Desactivar múltiples elementos
  deactivateMultiple: (endpoint, ids) => 
    apiRequest('POST', `${endpoint}desactivar_multiples/`, { ids }),
  
  // Eliminar temporalmente múltiples elementos
  softDeleteMultiple: (endpoint, ids) => 
    apiRequest('DELETE', `${endpoint}eliminar_multiples_temporal/`, { ids }),
  
  // Restaurar múltiples elementos
  restoreMultiple: (endpoint, ids) => 
    apiRequest('PATCH', `${endpoint}restaurar_multiples/`, { ids })
};

/**
 * Función auxiliar para obtener estadísticas de cualquier modelo
 */
export const getModelStats = (endpoint) => 
  apiRequest('GET', `${endpoint}estadisticas/`);

/**
 * Función auxiliar para búsqueda en cualquier modelo
 */
export const searchInModel = (endpoint, query, params = {}) => 
  apiRequest('GET', `${endpoint}buscar/`, null, { params: { q: query, ...params } });

/**
 * Función auxiliar para obtener elementos eliminados de cualquier modelo
 */
export const getDeletedItems = (endpoint, params = {}) => 
  apiRequest('GET', `${endpoint}eliminados/`, null, { params });

/**
 * Función auxiliar para obtener elementos activos de cualquier modelo
 */
export const getActiveItems = (endpoint, params = {}) => 
  apiRequest('GET', `${endpoint}activos/`, null, { params });

/**
 * Función auxiliar para obtener elementos inactivos de cualquier modelo
 */
export const getInactiveItems = (endpoint, params = {}) => 
  apiRequest('GET', `${endpoint}inactivos/`, null, { params });

// =======================================
// RECORDATORIOS API
// =======================================
export const recordatoriosAPI = {
  getAll: (params = {}) => apiRequest('GET', API_CONFIG.ENDPOINTS.RECORDATORIOS, null, { params }),
  getById: (id) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}${id}/`),
  create: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.RECORDATORIOS, data),
  update: (id, data) => apiRequest('PUT', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}${id}/`, data),
  patch: (id, data) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}${id}/`, data),
  delete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}${id}/`),

  // Funcionalidades específicas
  softDelete: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}${id}/soft_delete/`),
  hardDelete: (id) => apiRequest('DELETE', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}${id}/hard_delete/`),
  restore: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}${id}/restore/`),
  toggleActivo: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}${id}/toggle_activo/`),

  // Acciones personalizadas
  completar: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}${id}/completar/`),
  marcarEnviado: (id) => apiRequest('PATCH', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}${id}/marcar_enviado/`),
  proximos: (dias = 7) => apiRequest('GET', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}proximos/`, null, { params: { dias } }),
  vencidos: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}vencidos/`),
  estadisticas: () => apiRequest('GET', `${API_CONFIG.ENDPOINTS.RECORDATORIOS}estadisticas/`),
};

// =======================================
// POS API
// =======================================
export const posAPI = {
  // Procesar venta
  procesarVenta: (ventaData) => {
    console.log('🔧 posAPI.procesarVenta - INICIADO');
    console.log('📋 Datos enviados:', ventaData);
    console.log('🔗 Endpoint:', API_CONFIG.ENDPOINTS.POS_PROCESAR_VENTA);
    
    return apiRequest('POST', API_CONFIG.ENDPOINTS.POS_PROCESAR_VENTA, ventaData)
      .then(response => {
        console.log('✅ Respuesta de apiRequest:', response);
        console.log('🔍 Tipo de respuesta:', typeof response);
        console.log('🔍 Propiedades de respuesta:', Object.keys(response || {}));
        console.log('🔍 response.data:', response?.data);
        console.log('🔍 response.status:', response?.status);
        return response;
      })
      .catch(error => {
        console.error('❌ Error en posAPI.procesarVenta:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        throw error;
      });
  },
  
  // Búsquedas
  buscarProductos: (query) => apiRequest('GET', API_CONFIG.ENDPOINTS.POS_BUSCAR_PRODUCTOS, null, { params: { q: query } }),
  buscarClientes: (query) => apiRequest('GET', API_CONFIG.ENDPOINTS.POS_BUSCAR_CLIENTES, null, { params: { q: query } }),
  buscarTecnicos: () => apiRequest('GET', API_CONFIG.ENDPOINTS.POS_BUSCAR_TECNICOS),
  buscarMotos: (query) => apiRequest('GET', API_CONFIG.ENDPOINTS.POS_BUSCAR_MOTOS, null, { params: { q: query } }),
  buscarServicios: (query) => apiRequest('GET', API_CONFIG.ENDPOINTS.POS_BUSCAR_SERVICIOS, null, { params: { q: query } }),
  
  // Mantenimiento
  crearMantenimiento: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.POS_CREAR_MANTENIMIENTO, data),
  
  // Estadísticas
  getStats: () => apiRequest('GET', API_CONFIG.ENDPOINTS.POS_DASHBOARD_STATS),
  
  // Inventario
  getAlertas: () => apiRequest('GET', API_CONFIG.ENDPOINTS.POS_ALERTAS_INVENTARIO),
  ajustarInventario: (data) => apiRequest('POST', API_CONFIG.ENDPOINTS.POS_AJUSTAR_INVENTARIO, data),
};

// =======================================
// EXPORTAR TODAS LAS APIs
// =======================================

// Export the main api instance as default
export default api;
