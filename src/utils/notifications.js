// src/utils/notifications.js (VERSIÓN COMPLETA CORREGIDA)
import { toast } from 'react-toastify';

export const showNotification = {
  success: (message) => {
    return toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  error: (message) => {
    return toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  warning: (message) => {
    return toast.warn(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  info: (message) => {
    return toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  loading: (message) => {
    return toast.loading(message, {
      position: "top-right",
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      autoClose: false,
    });
  },

  updateToSuccess: (toastId, message) => {
    toast.update(toastId, {
      render: message,
      type: "success",
      isLoading: false,
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  updateToError: (toastId, message) => {
    toast.update(toastId, {
      render: message,
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  updateToWarning: (toastId, message) => {
    toast.update(toastId, {
      render: message,
      type: "warning",
      isLoading: false,
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};

// Mensajes específicos para el CRUD de usuarios
export const userMessages = {
  // Éxito
  userCreated: "Usuario creado exitosamente",
  userCreatedComplete: "Usuario completo creado exitosamente",
  userUpdated: "Usuario actualizado exitosamente",
  userDeleted: "Usuario eliminado exitosamente",
  userSoftDeleted: "Usuario eliminado temporalmente",
  userHardDeleted: "Usuario eliminado permanentemente",
  userRestored: "Usuario restaurado exitosamente",
  passwordReset: "Contraseña actualizada exitosamente",
  statusChanged: (isActive) => `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,

  // Errores específicos de campo
  userExists: "Ya existe un usuario con ese nombre de usuario",
  emailExists: "Ya existe un usuario con ese correo electrónico",
  personExists: "Ya existe una persona con esa cédula",
  
  // Errores generales
  invalidData: "Los datos proporcionados no son válidos",
  serverError: "Error del servidor. Intente nuevamente",
  networkError: "Error de conexión. Verifique su internet",
  unauthorized: "No tiene permisos para realizar esta acción",
  notFound: "Usuario no encontrado",

  // Validación
  requiredFields: "Todos los campos marcados con * son obligatorios",
  invalidEmail: "El formato del correo electrónico es inválido",
  weakPassword: "La contraseña debe tener al menos 8 caracteres",
  noRolesSelected: "Debe seleccionar al menos un rol",

  // Confirmaciones
  confirmDelete: (username) => `¿Está seguro de eliminar al usuario "${username}"?`,
  confirmRestore: (username) => `¿Está seguro de restaurar al usuario "${username}"?`,
  confirmStatusChange: (username, action) => `¿Está seguro de ${action} al usuario "${username}"?`,
};

/**
 * Función mejorada para manejar errores de API
 * @param {Object} error - Error de axios
 * @returns {Object} - Objeto con message y fieldErrors
 */
export const handleApiError = (error) => {
  // Estructura base del resultado
  const result = {
    message: userMessages.serverError,
    fieldErrors: {}
  };

  // Caso 1: Error de red/conexión
  if (!error.response) {
    result.message = userMessages.networkError;
    showNotification.error(result.message);
    return result;
  }

  const { status, data } = error.response;

  // Caso 2: Errores HTTP específicos
  switch (status) {
    case 400: // Bad Request - Errores de validación
      result.message = userMessages.invalidData;
      
      if (data && typeof data === 'object') {
        const fieldMessages = [];
        
        // Mapear errores específicos de campo
        if (data.username) {
          const usernameError = Array.isArray(data.username) ? data.username[0] : data.username;
          if (usernameError.includes('ya está en uso') || usernameError.includes('already exists')) {
            result.fieldErrors.username = userMessages.userExists;
            fieldMessages.push(userMessages.userExists);
          } else {
            result.fieldErrors.username = usernameError;
            fieldMessages.push(`Usuario: ${usernameError}`);
          }
        }

        if (data.correo_electronico) {
          const emailError = Array.isArray(data.correo_electronico) ? data.correo_electronico[0] : data.correo_electronico;
          if (emailError.includes('ya está registrado') || emailError.includes('already exists')) {
            result.fieldErrors.correo_electronico = userMessages.emailExists;
            fieldMessages.push(userMessages.emailExists);
          } else {
            result.fieldErrors.correo_electronico = emailError;
            fieldMessages.push(`Email: ${emailError}`);
          }
        }

        if (data.persona_cedula) {
          const cedulaError = Array.isArray(data.persona_cedula) ? data.persona_cedula[0] : data.persona_cedula;
          if (cedulaError.includes('ya existe') || cedulaError.includes('already exists')) {
            result.fieldErrors.persona_cedula = userMessages.personExists;
            fieldMessages.push(userMessages.personExists);
          } else {
            result.fieldErrors.persona_cedula = cedulaError;
            fieldMessages.push(`Cédula: ${cedulaError}`);
          }
        }

        // Mapear otros campos comunes
        if (data.password) {
          const passwordError = Array.isArray(data.password) ? data.password[0] : data.password;
          result.fieldErrors.password = passwordError;
          fieldMessages.push(`Contraseña: ${passwordError}`);
        }

        if (data.roles) {
          const rolesError = Array.isArray(data.roles) ? data.roles[0] : data.roles;
          result.fieldErrors.roles = rolesError;
          fieldMessages.push(`Roles: ${rolesError}`);
        }

        // Campos específicos de productos
        if (data.codigo) {
          const codigoError = Array.isArray(data.codigo) ? data.codigo[0] : data.codigo;
          result.fieldErrors.codigo = codigoError;
          fieldMessages.push(`Código: ${codigoError}`);
        }

        if (data.nombre) {
          const nombreError = Array.isArray(data.nombre) ? data.nombre[0] : data.nombre;
          result.fieldErrors.nombre = nombreError;
          fieldMessages.push(`Nombre: ${nombreError}`);
        }

        if (data.precio_venta) {
          const precioError = Array.isArray(data.precio_venta) ? data.precio_venta[0] : data.precio_venta;
          result.fieldErrors.precio_venta = precioError;
          fieldMessages.push(`Precio de venta: ${precioError}`);
        }

        if (data.precio_compra) {
          const precioError = Array.isArray(data.precio_compra) ? data.precio_compra[0] : data.precio_compra;
          result.fieldErrors.precio_compra = precioError;
          fieldMessages.push(`Precio de compra: ${precioError}`);
        }

        if (data.stock_inicial) {
          const stockError = Array.isArray(data.stock_inicial) ? data.stock_inicial[0] : data.stock_inicial;
          result.fieldErrors.stock_inicial = stockError;
          fieldMessages.push(`Stock inicial: ${stockError}`);
        }

        if (data.stock_minimo) {
          const stockError = Array.isArray(data.stock_minimo) ? data.stock_minimo[0] : data.stock_minimo;
          result.fieldErrors.stock_minimo = stockError;
          fieldMessages.push(`Stock mínimo: ${stockError}`);
        }

        // Campos de persona
        const personaFields = ['persona_nombre', 'persona_apellido', 'persona_telefono', 'persona_direccion'];
        personaFields.forEach(field => {
          if (data[field]) {
            const fieldError = Array.isArray(data[field]) ? data[field][0] : data[field];
            result.fieldErrors[field] = fieldError;
            const fieldName = field.replace('persona_', '').charAt(0).toUpperCase() + field.replace('persona_', '').slice(1);
            fieldMessages.push(`${fieldName}: ${fieldError}`);
          }
        });

        // Si hay errores de campo específicos, usarlos como mensaje principal
        if (fieldMessages.length > 0) {
          result.message = fieldMessages.join(' | ');
        } else if (data.message) {
          // Si no hay errores de campo pero hay un mensaje general
          result.message = data.message;
        } else if (data.detail) {
          result.message = data.detail;
        } else if (typeof data === 'string') {
          result.message = data;
        }
      } else if (typeof data === 'string') {
        result.message = data;
      }
      break;

    case 401: // Unauthorized
      result.message = userMessages.unauthorized;
      break;

    case 403: // Forbidden
      result.message = "No tiene permisos para realizar esta operación";
      break;

    case 404: // Not Found
      result.message = userMessages.notFound;
      break;

    case 409: // Conflict - Datos duplicados
      result.message = "Ya existe un registro con estos datos";
      if (data && data.message) {
        result.message = data.message;
      }
      break;

    case 422: // Unprocessable Entity - Error de validación semántica
      result.message = "Los datos no pueden ser procesados";
      if (data && data.message) {
        result.message = data.message;
      }
      break;

    case 500: // Internal Server Error
      result.message = userMessages.serverError;
      break;

    default:
      result.message = data?.message || data?.detail || `Error ${status}: ${userMessages.serverError}`;
  }

  // Solo mostrar notificación si no hay errores de campo específicos
  if (Object.keys(result.fieldErrors).length === 0) {
    showNotification.error(result.message);
  }

  return result;
};

/**
 * Función auxiliar para extraer mensajes de error de arrays o strings
 * @param {string|Array} errorData - Datos de error del backend
 * @returns {string} - Mensaje de error formateado
 */
const extractErrorMessage = (errorData) => {
  if (Array.isArray(errorData)) {
    return errorData[0]; // Tomar el primer error
  }
  return errorData;
};

/**
 * Función específica para manejar errores de creación de usuarios
 * @param {Object} error - Error de axios
 * @returns {Object} - Objeto con message y fieldErrors
 */
export const handleUserCreationError = (error) => {
  const result = handleApiError(error);
  
  // Personalizar mensaje para creación de usuarios
  if (result.message === userMessages.invalidData && Object.keys(result.fieldErrors).length > 0) {
    result.message = "Por favor, corrija los siguientes errores:";
  }
  
  return result;
};

/**
 * Función para mostrar errores de validación de formulario
 * @param {Object} fieldErrors - Objeto con errores por campo
 */
export const showFieldErrors = (fieldErrors) => {
  const errorMessages = Object.values(fieldErrors).filter(Boolean);
  if (errorMessages.length > 0) {
    showNotification.error(`Errores de validación: ${errorMessages.join(', ')}`);
  }
};

export const supplierMessages = {
  // Éxito
  supplierCreated: "Proveedor creado exitosamente",
  supplierUpdated: "Proveedor actualizado exitosamente",
  supplierDeleted: "Proveedor eliminado exitosamente",
  supplierSoftDeleted: "Proveedor eliminado temporalmente",
  supplierHardDeleted: "Proveedor eliminado permanentemente",
  supplierRestored: "Proveedor restaurado exitosamente",
  statusChanged: (isActive) => `Proveedor ${isActive ? 'activado' : 'desactivado'} exitosamente`,

  // Errores específicos de campo
  supplierExists: "Ya existe un proveedor con ese nombre o identificación",
  emailExists: "Ya existe un proveedor con ese correo electrónico",
  invalidData: "Los datos del proveedor no son válidos",

  // Errores generales
  serverError: "Error del servidor. Intente nuevamente",
  networkError: "Error de conexión. Verifique su internet",
  unauthorized: "No tiene permisos para realizar esta acción",
  notFound: "Proveedor no encontrado",

  // Validación
  requiredFields: "Todos los campos marcados con * son obligatorios",
  invalidEmail: "El formato del correo electrónico es inválido",

  // Confirmaciones
  confirmDelete: (name) => `¿Está seguro de eliminar al proveedor "${name}"?`,
  confirmRestore: (name) => `¿Está seguro de restaurar al proveedor "${name}"?`,
  confirmStatusChange: (name, action) => `¿Está seguro de ${action} al proveedor "${name}"?`,
};

export const serviceMessages = {
  serviceCreated: 'Servicio creado exitosamente',
  serviceUpdated: 'Servicio actualizado exitosamente',
  serviceSoftDeleted: 'Servicio eliminado temporalmente',
  serviceHardDeleted: 'Servicio eliminado permanentemente',
  serviceRestored: 'Servicio restaurado exitosamente',
  statusChanged: (activo) => `Servicio ${activo ? 'activado' : 'desactivado'} exitosamente`,
  createError: 'Error al crear el servicio',
  updateError: 'Error al actualizar el servicio',
  deleteError: 'Error al eliminar el servicio',
  fetchError: 'Error al obtener los servicios',
  validationError: 'Por favor, corrige los errores en el formulario',
  networkError: 'Error de conexión. Verifica tu conexión a internet',
  serverError: 'Error del servidor. Intenta más tarde',
  notFound: 'Servicio no encontrado',
  duplicateError: 'Ya existe un servicio con ese nombre',
  unauthorized: 'No tienes permisos para realizar esta acción'
};

export const productMessages = {
  // Éxito
  productCreated: "Producto creado exitosamente",
  productUpdated: "Producto actualizado exitosamente",
  productDeleted: "Producto eliminado exitosamente",
  productSoftDeleted: "Producto eliminado temporalmente",
  productHardDeleted: "Producto eliminado permanentemente",
  productRestored: "Producto restaurado exitosamente",
  statusChanged: (isActive) => `Producto ${isActive ? 'activado' : 'desactivado'} exitosamente`,
  featuredChanged: (isFeatured) => `Producto ${isFeatured ? 'marcado como destacado' : 'removido de destacados'} exitosamente`,
  stockUpdated: "Stock actualizado exitosamente",

  // Errores específicos de campo
  productExists: "Ya existe un producto con ese código",
  categoryRequired: "La categoría es requerida",
  invalidPrice: "Los precios deben ser válidos y mayores a cero",
  priceComparisonError: "El precio de venta debe ser mayor al precio de compra",
  invalidStock: "El stock debe ser un número válido",
  imageUploadError: "Error al subir la imagen del producto",
  
  // Errores generales
  invalidData: "Los datos del producto no son válidos",
  serverError: "Error del servidor. Intente nuevamente",
  networkError: "Error de conexión. Verifique su internet",
  unauthorized: "No tiene permisos para realizar esta acción",
  notFound: "Producto no encontrado",
  lowStock: "Producto con stock bajo",
  outOfStock: "Producto sin stock",

  // Validación
  requiredFields: "Todos los campos marcados con * son obligatorios",
  invalidCode: "El código del producto debe ser único",
  negativeStock: "El stock no puede ser negativo",
  negativePrice: "Los precios no pueden ser negativos",
  invalidImage: "El archivo de imagen no es válido",

  // Confirmaciones
  confirmDelete: (nombre) => `¿Está seguro de eliminar el producto "${nombre}"?`,
  confirmRestore: (nombre) => `¿Está seguro de restaurar el producto "${nombre}"?`,
  confirmStatusChange: (nombre, action) => `¿Está seguro de ${action} el producto "${nombre}"?`,
  confirmStockUpdate: (nombre) => `¿Está seguro de actualizar el stock de "${nombre}"?`,
};

/**
 * Función específica para manejar errores de productos
 * @param {Object} error - Error de axios
 * @returns {Object} - Objeto con message y fieldErrors
 */
export const handleProductApiError = (error) => {

  const result = {
    message: productMessages.serverError,
    fieldErrors: {}
  };

  if (!error.response) {
    result.message = productMessages.networkError;
    showNotification.error(result.message);
    return result;
  }

  const { status, data } = error.response;

  switch (status) {
    case 400: // Bad Request - Errores de validación
      result.message = productMessages.invalidData;
      
      if (data && typeof data === 'object') {
        const fieldMessages = [];
        
        // Mapear errores específicos de campo para productos
        if (data.codigo) {
          const codigoError = Array.isArray(data.codigo) ? data.codigo[0] : data.codigo;
          if (codigoError.includes('ya existe') || codigoError.includes('already exists')) {
            result.fieldErrors.codigo = productMessages.productExists;
            fieldMessages.push(productMessages.productExists);
          } else {
            result.fieldErrors.codigo = codigoError;
            fieldMessages.push(`Código: ${codigoError}`);
          }
        }

        if (data.nombre) {
          const nombreError = Array.isArray(data.nombre) ? data.nombre[0] : data.nombre;
          result.fieldErrors.nombre = nombreError;
          fieldMessages.push(`Nombre: ${nombreError}`);
        }

        if (data.categoria) {
          const categoriaError = Array.isArray(data.categoria) ? data.categoria[0] : data.categoria;
          result.fieldErrors.categoria = categoriaError;
          fieldMessages.push(`Categoría: ${categoriaError}`);
        }

        if (data.precio_venta) {
          const precioVentaError = Array.isArray(data.precio_venta) ? data.precio_venta[0] : data.precio_venta;
          result.fieldErrors.precio_venta = precioVentaError;
          fieldMessages.push(`Precio de venta: ${precioVentaError}`);
        }

        if (data.precio_compra) {
          const precioCompraError = Array.isArray(data.precio_compra) ? data.precio_compra[0] : data.precio_compra;
          result.fieldErrors.precio_compra = precioCompraError;
          fieldMessages.push(`Precio de compra: ${precioCompraError}`);
        }

        if (data.stock_actual) {
          const stockError = Array.isArray(data.stock_actual) ? data.stock_actual[0] : data.stock_actual;
          result.fieldErrors.stock_actual = stockError;
          fieldMessages.push(`Stock: ${stockError}`);
        }

        if (data.imagen) {
          const imagenError = Array.isArray(data.imagen) ? data.imagen[0] : data.imagen;
          result.fieldErrors.imagen = imagenError;
          fieldMessages.push(`Imagen: ${imagenError}`);
        }

        // Otros campos comunes
        const commonFields = ['descripcion', 'proveedor', 'stock_minimo'];
        commonFields.forEach(field => {
          if (data[field]) {
            const fieldError = Array.isArray(data[field]) ? data[field][0] : data[field];
            result.fieldErrors[field] = fieldError;
            const fieldName = field.replace('_', ' ').charAt(0).toUpperCase() + field.replace('_', ' ').slice(1);
            fieldMessages.push(`${fieldName}: ${fieldError}`);
          }
        });

        if (fieldMessages.length > 0) {
          result.message = fieldMessages.join(' | ');
        } else if (data.message) {
          result.message = data.message;
        } else if (data.detail) {
          result.message = data.detail;
        } else if (typeof data === 'string') {
          result.message = data;
        }
      }
      break;

    case 401:
      result.message = productMessages.unauthorized;
      break;

    case 403:
      result.message = "No tiene permisos para realizar esta operación";
      break;

    case 404:
      result.message = productMessages.notFound;
      break;

    case 409:
      result.message = "Ya existe un producto con estos datos";
      if (data && data.message) {
        result.message = data.message;
      }
      break;

    case 422:
      result.message = "Los datos del producto no pueden ser procesados";
      if (data && data.message) {
        result.message = data.message;
      }
      break;

    case 500:
      result.message = productMessages.serverError;
      break;

    default:
      result.message = data?.message || data?.detail || `Error ${status}: ${productMessages.serverError}`;
  }

  showNotification.error(result.message);
  return result;
};

// Mensajes específicos para el módulo de recordatorios
export const recordatorioMessages = {
  // Éxito
  recordatorioCreated: "Recordatorio creado exitosamente",
  recordatorioUpdated: "Recordatorio actualizado exitosamente",
  recordatorioDeleted: "Recordatorio eliminado exitosamente",
  recordatorioSoftDeleted: "Recordatorio eliminado temporalmente",
  recordatorioHardDeleted: "Recordatorio eliminado permanentemente",
  recordatorioRestored: "Recordatorio restaurado exitosamente",
  recordatorioCompletado: "Recordatorio marcado como completado",
  recordatorioPendiente: "Recordatorio marcado como pendiente",
  statusChanged: (activo) => `Recordatorio ${activo ? 'activado' : 'desactivado'} exitosamente`,

  // Errores específicos de campo
  tituloRequired: "El título del recordatorio es requerido",
  descripcionRequired: "La descripción del recordatorio es requerida",
  fechaRequired: "La fecha programada es requerida",
  fechaInvalida: "La fecha programada no puede ser anterior a hoy",
  motoRequired: "La moto es requerida",
  tipoRequired: "El tipo de recordatorio es requerido",
  recordatorioExists: "Ya existe un recordatorio similar para esta moto",

  // Errores generales
  invalidData: "Los datos del recordatorio no son válidos",
  serverError: "Error del servidor. Intente nuevamente",
  networkError: "Error de conexión. Verifique su internet",
  unauthorized: "No tiene permisos para realizar esta acción",
  notFound: "Recordatorio no encontrado",

  // Validación
  requiredFields: "Todos los campos marcados con * son obligatorios",
  invalidDate: "La fecha debe tener un formato válido",

  // Estados
  completado: "Recordatorio completado",
  pendiente: "Recordatorio pendiente",
  vencido: "Recordatorio vencido",
  urgente: "Recordatorio urgente",

  // Confirmaciones
  confirmDelete: (titulo) => `¿Está seguro de eliminar el recordatorio "${titulo}"?`,
  confirmRestore: (titulo) => `¿Está seguro de restaurar el recordatorio "${titulo}"?`,
  confirmStatusChange: (titulo, action) => `¿Está seguro de ${action} el recordatorio "${titulo}"?`,
  confirmCompletar: (titulo) => `¿Marcar como completado el recordatorio "${titulo}"?`,
  confirmPendiente: (titulo) => `¿Marcar como pendiente el recordatorio "${titulo}"?`,

  // Información
  noRecordatorios: "No hay recordatorios registrados",
  recordatoriosVencidos: "Hay recordatorios vencidos",
  recordatoriosHoy: "Recordatorios para hoy",
  recordatoriosSemana: "Recordatorios para esta semana",
};

/**
 * Función específica para manejar errores de creación de productos
 */
export const handleProductCreationError = (error) => {
  const result = handleProductApiError(error);
  
  if (result.message === productMessages.invalidData && Object.keys(result.fieldErrors).length > 0) {
    result.message = "Por favor, corrija los siguientes errores en el producto:";
  }
  
  return result;
};

/**
 * Función para validar datos de producto antes del envío
 */
export const validateProductData = (productData) => {
  const errors = {};

  // Validaciones básicas
  if (!productData.nombre?.trim()) {
    errors.nombre = 'El nombre del producto es requerido';
  }

  if (!productData.codigo?.trim()) {
    errors.codigo = 'El código del producto es requerido';
  }

  if (!productData.categoria) {
    errors.categoria = 'La categoría es requerida';
  }

  // Validaciones de precios
  if (!productData.precio_venta || parseFloat(productData.precio_venta) <= 0) {
    errors.precio_venta = 'El precio de venta debe ser mayor a 0';
  }

  if (!productData.precio_compra || parseFloat(productData.precio_compra) <= 0) {
    errors.precio_compra = 'El precio de compra debe ser mayor a 0';
  }

  if (parseFloat(productData.precio_venta) <= parseFloat(productData.precio_compra)) {
    errors.precio_venta = 'El precio de venta debe ser mayor al precio de compra';
  }

  // Validaciones de stock
  if (parseInt(productData.stock_actual) < 0) {
    errors.stock_actual = 'El stock actual no puede ser negativo';
  }

  if (parseInt(productData.stock_minimo) < 0) {
    errors.stock_minimo = 'El stock mínimo no puede ser negativo';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Función para mostrar notificaciones específicas de stock
 */
export const showStockNotification = (producto) => {
  if (producto.stock_actual === 0) {
    showNotification.error(`¡ALERTA! Producto "${producto.nombre}" sin stock`);
  } else if (producto.stock_actual <= producto.stock_minimo) {
    showNotification.warning(`Stock bajo: Producto "${producto.nombre}" tiene ${producto.stock_actual} unidades`);
  }
};

/**
 * Función para mostrar notificaciones de estado de producto
 */
export const showProductStatusNotification = (producto, action) => {
  const messages = {
    activated: `Producto "${producto.nombre}" activado correctamente`,
    deactivated: `Producto "${producto.nombre}" desactivado correctamente`,
    featured: `Producto "${producto.nombre}" marcado como destacado`,
    unfeatured: `Producto "${producto.nombre}" removido de destacados`,
    deleted: `Producto "${producto.nombre}" eliminado correctamente`,
    restored: `Producto "${producto.nombre}" restaurado correctamente`
  };

  const message = messages[action];
  if (message) {
    if (action === 'deleted') {
      showNotification.success(message);
    } else if (action === 'deactivated') {
      showNotification.warning(message);
    } else {
      showNotification.success(message);
    }
  }
};

export const motoMessages = {
  // Éxito
  motoCreated: "Moto registrada exitosamente",
  motoUpdated: "Moto actualizada exitosamente",
  motoDeleted: "Moto eliminada exitosamente",
  motoSoftDeleted: "Moto eliminada temporalmente",
  motoHardDeleted: "Moto eliminada permanentemente",
  motoRestored: "Moto restaurada exitosamente",
  statusChanged: (isActive) => `Moto ${isActive ? 'activada' : 'desactivada'} exitosamente`,

  // Errores específicos de campo
  motoExists: "Ya existe una moto con esa placa",
  chassisExists: "Ya existe una moto con ese número de chasis",
  motorExists: "Ya existe una moto con ese número de motor",
  ownerRequired: "El propietario es requerido",
  invalidYear: "El año debe estar entre 1900 y el año actual + 1",
  
  // Errores generales
  invalidData: "Los datos de la moto no son válidos",
  serverError: "Error del servidor. Intente nuevamente",
  networkError: "Error de conexión. Verifique su internet",
  unauthorized: "No tiene permisos para realizar esta acción",
  notFound: "Moto no encontrada",

  // Validación
  requiredFields: "Todos los campos marcados con * son obligatorios",
  invalidPlate: "El formato de la placa no es válido",
  invalidMileage: "El kilometraje debe ser un número positivo",
  invalidDisplacement: "La cilindrada debe ser mayor a 0",

  // Confirmaciones
  confirmDelete: (marca, modelo, placa) => `¿Está seguro de eliminar la moto "${marca} ${modelo}" con placa ${placa}?`,
  confirmRestore: (marca, modelo, placa) => `¿Está seguro de restaurar la moto "${marca} ${modelo}" con placa ${placa}?`,
  confirmStatusChange: (marca, modelo, placa, action) => `¿Está seguro de ${action} la moto "${marca} ${modelo}" con placa ${placa}?`,
};

/**
 * Función específica para manejar errores de motos
 * @param {Object} error - Error de axios
 * @returns {Object} - Objeto con message y fieldErrors
 */
export const handleMotoApiError = (error) => {

  const result = {
    message: motoMessages.serverError,
    fieldErrors: {}
  };

  if (!error.response) {
    result.message = motoMessages.networkError;
    showNotification.error(result.message);
    return result;
  }

  const { status, data } = error.response;

  switch (status) {
    case 400: // Bad Request - Errores de validación
      result.message = motoMessages.invalidData;
      
      if (data && typeof data === 'object') {
        const fieldMessages = [];
        
        // Mapear errores específicos de campo para motos
        if (data.placa) {
          const placaError = Array.isArray(data.placa) ? data.placa[0] : data.placa;
          if (placaError.includes('ya existe') || placaError.includes('already exists')) {
            result.fieldErrors.placa = motoMessages.motoExists;
            fieldMessages.push(motoMessages.motoExists);
          } else {
            result.fieldErrors.placa = placaError;
            fieldMessages.push(`Placa: ${placaError}`);
          }
        }

        if (data.numero_chasis) {
          const chasisError = Array.isArray(data.numero_chasis) ? data.numero_chasis[0] : data.numero_chasis;
          if (chasisError.includes('ya existe') || chasisError.includes('already exists')) {
            result.fieldErrors.numero_chasis = motoMessages.chassisExists;
            fieldMessages.push(motoMessages.chassisExists);
          } else {
            result.fieldErrors.numero_chasis = chasisError;
            fieldMessages.push(`Número de chasis: ${chasisError}`);
          }
        }

        if (data.numero_motor) {
          const motorError = Array.isArray(data.numero_motor) ? data.numero_motor[0] : data.numero_motor;
          if (motorError.includes('ya existe') || motorError.includes('already exists')) {
            result.fieldErrors.numero_motor = motoMessages.motorExists;
            fieldMessages.push(motoMessages.motorExists);
          } else {
            result.fieldErrors.numero_motor = motorError;
            fieldMessages.push(`Número de motor: ${motorError}`);
          }
        }

        if (data.propietario) {
          const propietarioError = Array.isArray(data.propietario) ? data.propietario[0] : data.propietario;
          result.fieldErrors.propietario = propietarioError;
          fieldMessages.push(`Propietario: ${propietarioError}`);
        }

        if (data.año) {
          const añoError = Array.isArray(data.año) ? data.año[0] : data.año;
          result.fieldErrors.año = añoError;
          fieldMessages.push(`Año: ${añoError}`);
        }

        // Otros campos comunes
        const commonFields = ['marca', 'modelo', 'color', 'cilindrada', 'kilometraje'];
        commonFields.forEach(field => {
          if (data[field]) {
            const fieldError = Array.isArray(data[field]) ? data[field][0] : data[field];
            result.fieldErrors[field] = fieldError;
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
            fieldMessages.push(`${fieldName}: ${fieldError}`);
          }
        });

        if (fieldMessages.length > 0) {
          result.message = fieldMessages.join(' | ');
        } else if (data.message) {
          result.message = data.message;
        } else if (data.detail) {
          result.message = data.detail;
        } else if (typeof data === 'string') {
          result.message = data;
        }
      }
      break;

    case 401:
      result.message = motoMessages.unauthorized;
      break;

    case 403:
      result.message = "No tiene permisos para realizar esta operación";
      break;

    case 404:
      result.message = motoMessages.notFound;
      break;

    case 409:
      result.message = "Ya existe una moto con estos datos";
      if (data && data.message) {
        result.message = data.message;
      }
      break;

    case 422:
      result.message = "Los datos de la moto no pueden ser procesados";
      if (data && data.message) {
        result.message = data.message;
      }
      break;

    case 500:
      result.message = motoMessages.serverError;
      break;

    default:
      result.message = data?.message || data?.detail || `Error ${status}: ${motoMessages.serverError}`;
  }

  showNotification.error(result.message);
  return result;
};

/**
 * Función específica para manejar errores de creación de motos
 */
export const handleMotoCreationError = (error) => {
  const result = handleMotoApiError(error);
  
  if (result.message === motoMessages.invalidData && Object.keys(result.fieldErrors).length > 0) {
    result.message = "Por favor, corrija los siguientes errores en la moto:";
  }
  
  return result;
};

/**
 * Función para validar datos de moto antes del envío
 */
export const validateMotoData = (motoData) => {
  const errors = {};
  const currentYear = new Date().getFullYear();

  // Validaciones básicas
  if (!motoData.propietario) {
    errors.propietario = 'El propietario es requerido';
  }

  if (!motoData.marca?.trim()) {
    errors.marca = 'La marca es requerida';
  }

  if (!motoData.modelo?.trim()) {
    errors.modelo = 'El modelo es requerido';
  }

  if (!motoData.placa?.trim()) {
    errors.placa = 'La placa es requerida';
  }

  if (!motoData.numero_chasis?.trim()) {
    errors.numero_chasis = 'El número de chasis es requerido';
  }

  if (!motoData.numero_motor?.trim()) {
    errors.numero_motor = 'El número de motor es requerido';
  }

  if (!motoData.color?.trim()) {
    errors.color = 'El color es requerido';
  }

  // Validaciones de año
  if (!motoData.año) {
    errors.año = 'El año es requerido';
  } else {
    const año = parseInt(motoData.año);
    if (año < 1900 || año > currentYear + 1) {
      errors.año = `El año debe estar entre 1900 y ${currentYear + 1}`;
    }
  }

  // Validaciones de cilindrada
  if (!motoData.cilindrada) {
    errors.cilindrada = 'La cilindrada es requerida';
  } else if (parseInt(motoData.cilindrada) <= 0) {
    errors.cilindrada = 'La cilindrada debe ser mayor a 0';
  }

  // Validaciones de kilometraje
  if (motoData.kilometraje && parseInt(motoData.kilometraje) < 0) {
    errors.kilometraje = 'El kilometraje no puede ser negativo';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Función para mostrar notificaciones específicas de estado de moto
 */
export const showMotoStatusNotification = (moto, action) => {
  const messages = {
    activated: `Moto "${moto.marca} ${moto.modelo}" (${moto.placa}) activada correctamente`,
    deactivated: `Moto "${moto.marca} ${moto.modelo}" (${moto.placa}) desactivada correctamente`,
    deleted: `Moto "${moto.marca} ${moto.modelo}" (${moto.placa}) eliminada correctamente`,
    restored: `Moto "${moto.marca} ${moto.modelo}" (${moto.placa}) restaurada correctamente`
  };

  const message = messages[action];
  if (message) {
    if (action === 'deleted') {
      showNotification.success(message);
    } else if (action === 'deactivated') {
      showNotification.warning(message);
    } else {
      showNotification.success(message);
    }
  }
};

// Mensajes específicos para el módulo de inventario
export const inventoryMessages = {
  // Éxito - Inventario
  inventoryCreated: "Registro de inventario creado exitosamente",
  inventoryUpdated: "Inventario actualizado exitosamente",
  inventoryDeleted: "Inventario eliminado exitosamente",
  inventorySoftDeleted: "Inventario eliminado temporalmente",
  inventoryHardDeleted: "Inventario eliminado permanentemente",
  inventoryRestored: "Inventario restaurado exitosamente",
  statusChanged: (isActive) => `Inventario ${isActive ? 'activado' : 'desactivado'} exitosamente`,

  // Éxito - Movimientos
  movementCreated: "Movimiento de inventario registrado exitosamente",
  movementUpdated: "Movimiento actualizado exitosamente",
  movementDeleted: "Movimiento eliminado exitosamente",
  stockUpdated: "Stock actualizado correctamente",

  // Errores específicos de campo - Inventario
  productRequired: "El producto es requerido",
  stockRequired: "El stock actual es requerido",
  minStockRequired: "El stock mínimo es requerido",
  invalidStock: "El stock debe ser un número válido",
  negativeStock: "El stock no puede ser negativo",
  productExists: "Ya existe un registro de inventario para este producto",
  
  // Errores específicos de campo - Movimientos
  inventoryRequired: "El inventario es requerido",
  movementTypeRequired: "El tipo de movimiento es requerido",
  quantityRequired: "La cantidad es requerida",
  reasonRequired: "La razón del movimiento es requerida",
  invalidQuantity: "La cantidad debe ser un número válido mayor a 0",
  insufficientStock: "Stock insuficiente para realizar el movimiento",
  
  // Errores generales
  invalidData: "Los datos del inventario no son válidos",
  serverError: "Error del servidor. Intente nuevamente",
  networkError: "Error de conexión. Verifique su internet",
  unauthorized: "No tiene permisos para realizar esta acción",
  notFound: "Registro no encontrado",
  loadError: "Error al cargar los datos",

  // Validación
  requiredFields: "Todos los campos marcados con * son obligatorios",
  invalidMovementType: "Tipo de movimiento no válido",
  
  // Alertas de stock
  lowStock: (producto, stock) => `¡ALERTA! Stock bajo: "${producto}" tiene ${stock} unidades`,
  outOfStock: (producto) => `¡CRÍTICO! Producto "${producto}" sin stock`,
  stockWarning: "Algunos productos tienen stock bajo",

  // Confirmaciones - Inventario
  confirmDelete: (producto) => `¿Está seguro de eliminar el inventario de "${producto}"?`,
  confirmHardDelete: (producto) => `¿Está seguro de eliminar PERMANENTEMENTE el inventario de "${producto}"? Esta acción no se puede deshacer.`,
  confirmRestore: (producto) => `¿Está seguro de restaurar el inventario de "${producto}"?`,
  confirmStatusChange: (producto, action) => `¿Está seguro de ${action} el inventario de "${producto}"?`,
  
  // Confirmaciones - Movimientos
  confirmDeleteMovement: (tipo, cantidad, producto) => `¿Está seguro de eliminar el movimiento de ${tipo} de ${cantidad} unidades de "${producto}"?`,
  confirmCreateMovement: (tipo, cantidad, producto) => `¿Confirma el movimiento de ${tipo} de ${cantidad} unidades de "${producto}"?`,

  // Información
  noMovements: "No hay movimientos registrados",
  noInventory: "No hay productos en inventario",
  filterActive: "Filtros aplicados",
  searchActive: "Búsqueda activa",
};

/**
 * Función específica para manejar errores de inventario
 * @param {Object} error - Error de axios
 * @returns {Object} - Objeto con message y fieldErrors
 */
export const handleInventoryApiError = (error) => {

  const result = {
    message: inventoryMessages.serverError,
    fieldErrors: {}
  };

  if (!error.response) {
    result.message = inventoryMessages.networkError;
    showNotification.error(result.message);
    return result;
  }

  const { status, data } = error.response;

  switch (status) {
    case 400: // Bad Request - Errores de validación
      result.message = inventoryMessages.invalidData;
      
      if (data && typeof data === 'object') {
        const fieldMessages = [];
        
        // Mapear errores específicos de campo para inventario
        if (data.producto) {
          const productoError = Array.isArray(data.producto) ? data.producto[0] : data.producto;
          if (productoError.includes('ya existe') || productoError.includes('already exists')) {
            result.fieldErrors.producto = inventoryMessages.productExists;
            fieldMessages.push(inventoryMessages.productExists);
          } else {
            result.fieldErrors.producto = productoError;
            fieldMessages.push(`Producto: ${productoError}`);
          }
        }

        if (data.stock_actual) {
          const stockError = Array.isArray(data.stock_actual) ? data.stock_actual[0] : data.stock_actual;
          result.fieldErrors.stock_actual = stockError;
          fieldMessages.push(`Stock actual: ${stockError}`);
        }

        if (data.stock_minimo) {
          const stockMinimoError = Array.isArray(data.stock_minimo) ? data.stock_minimo[0] : data.stock_minimo;
          result.fieldErrors.stock_minimo = stockMinimoError;
          fieldMessages.push(`Stock mínimo: ${stockMinimoError}`);
        }

        // Errores de movimientos
        if (data.inventario) {
          const inventarioError = Array.isArray(data.inventario) ? data.inventario[0] : data.inventario;
          result.fieldErrors.inventario = inventarioError;
          fieldMessages.push(`Inventario: ${inventarioError}`);
        }

        if (data.tipo_movimiento) {
          const tipoError = Array.isArray(data.tipo_movimiento) ? data.tipo_movimiento[0] : data.tipo_movimiento;
          result.fieldErrors.tipo_movimiento = tipoError;
          fieldMessages.push(`Tipo de movimiento: ${tipoError}`);
        }

        if (data.cantidad) {
          const cantidadError = Array.isArray(data.cantidad) ? data.cantidad[0] : data.cantidad;
          result.fieldErrors.cantidad = cantidadError;
          fieldMessages.push(`Cantidad: ${cantidadError}`);
        }

        if (data.razon) {
          const razonError = Array.isArray(data.razon) ? data.razon[0] : data.razon;
          result.fieldErrors.razon = razonError;
          fieldMessages.push(`Razón: ${razonError}`);
        }

        if (fieldMessages.length > 0) {
          result.message = fieldMessages.join(' | ');
        } else if (data.message) {
          result.message = data.message;
        } else if (data.detail) {
          result.message = data.detail;
        } else if (typeof data === 'string') {
          result.message = data;
        }
      }
      break;

    case 401:
      result.message = inventoryMessages.unauthorized;
      break;

    case 403:
      result.message = "No tiene permisos para realizar esta operación";
      break;

    case 404:
      result.message = inventoryMessages.notFound;
      break;

    case 409:
      result.message = "Ya existe un registro con estos datos";
      if (data && data.message) {
        result.message = data.message;
      }
      break;

    case 422:
      result.message = "Los datos no pueden ser procesados";
      if (data && data.message) {
        result.message = data.message;
      }
      break;

    case 500:
      result.message = inventoryMessages.serverError;
      break;

    default:
      result.message = data?.message || data?.detail || `Error ${status}: ${inventoryMessages.serverError}`;
  }

  showNotification.error(result.message);
  return result;
};
