// src/utils/notifications.js - VERSIÓN PARA PRODUCCIÓN
import { toast } from 'react-toastify';

// Variable para rastrear la última notificación mostrada
let lastNotification = null;
let lastNotificationTime = 0;
const DUPLICATE_THRESHOLD = 1000; // 1 segundo entre notificaciones similares

// Función helper para evitar duplicados
const shouldShowNotification = (message, type) => {
  const now = Date.now();
  if (lastNotification === message && (now - lastNotificationTime) < DUPLICATE_THRESHOLD) {
    return false;
  }
  lastNotification = message;
  lastNotificationTime = now;
  return true;
};

export const showNotification = {
  success: (message) => {
    if (!shouldShowNotification(message, 'success')) return;
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
    if (!shouldShowNotification(message, 'error')) return;
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
    if (!shouldShowNotification(message, 'warning')) return;
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
    if (!shouldShowNotification(message, 'info')) return;
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
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  },
};

// Messages para cada módulo
export const userMessages = {
  created: 'Usuario creado exitosamente',
  userCreated: 'Usuario creado exitosamente',
  userCreatedComplete: 'Usuario creado exitosamente',
  updated: 'Usuario actualizado exitosamente',
  deleted: 'Usuario eliminado exitosamente',
  error: 'Error al procesar usuario',
  duplicate: 'El usuario ya existe',
  notFound: 'Usuario no encontrado',
  userCreated: 'Usuario creado exitosamente',
  userCreatedComplete: 'Usuario completo creado exitosamente',
  userUpdated: 'Usuario actualizado exitosamente',
  userSoftDeleted: 'Usuario eliminado exitosamente',
  userRestored: 'Usuario restaurado exitosamente',
  statusChanged: (isActive) => isActive ? 'Usuario activado exitosamente' : 'Usuario desactivado exitosamente',
  passwordReset: 'Contraseña actualizada exitosamente',
};

export const productMessages = {
  created: 'Producto creado exitosamente',
  updated: 'Producto actualizado exitosamente',
  deleted: 'Producto eliminado exitosamente',
  error: 'Error al procesar producto',
  outOfStock: 'Producto sin stock',
  lowStock: 'Stock bajo',
  statusChanged: (estado) => estado ? 'Producto activado exitosamente' : 'Producto desactivado exitosamente',
  productCreated: 'Producto creado exitosamente',
  productUpdated: 'Producto actualizado exitosamente',
  productSoftDeleted: 'Producto eliminado exitosamente',
  productRestored: 'Producto restaurado exitosamente',
  featuredChanged: (destacado) => destacado ? 'Producto marcado como destacado' : 'Producto desmarcado como destacado',
  stockUpdated: 'Stock actualizado exitosamente',
};

export const inventoryMessages = {
  created: 'Movimiento registrado exitosamente',
  updated: 'Movimiento actualizado exitosamente',
  deleted: 'Movimiento eliminado exitosamente',
  error: 'Error al procesar movimiento',
  insufficient: 'Stock insuficiente',
  inventoryCreated: 'Inventario creado exitosamente',
  inventoryUpdated: 'Inventario actualizado exitosamente',
  inventoryDeleted: 'Inventario eliminado exitosamente',
  inventoryRestored: 'Inventario restaurado exitosamente',
  movementCreated: 'Movimiento registrado exitosamente',
  movementUpdated: 'Movimiento actualizado exitosamente',
  movementDeleted: 'Movimiento eliminado exitosamente',
  movementRestored: 'Movimiento restaurado exitosamente',
  statusChanged: (estado) => estado ? 'Inventario activado exitosamente' : 'Inventario desactivado exitosamente',
};

export const supplierMessages = {
  created: 'Proveedor creado exitosamente',
  updated: 'Proveedor actualizado exitosamente',
  deleted: 'Proveedor eliminado exitosamente',
  error: 'Error al procesar proveedor',
  notFound: 'Proveedor no encontrado',
  statusChanged: (estado) => estado ? 'Proveedor activado exitosamente' : 'Proveedor desactivado exitosamente',
  supplierRestored: 'Proveedor restaurado exitosamente',
  supplierSoftDeleted: 'Proveedor eliminado exitosamente',
};

export const serviceMessages = {
  created: 'Servicio creado exitosamente',
  updated: 'Servicio actualizado exitosamente',
  deleted: 'Servicio eliminado exitosamente',
  error: 'Error al procesar servicio',
  notFound: 'Servicio no encontrado',
};

export const recordatorioMessages = {
  created: 'Recordatorio creado exitosamente',
  updated: 'Recordatorio actualizado exitosamente',
  deleted: 'Recordatorio eliminado exitosamente',
  error: 'Error al procesar recordatorio',
  completed: 'Recordatorio completado',
};

export const mantenimientoMessages = {
  created: 'Mantenimiento creado exitosamente',
  updated: 'Mantenimiento actualizado exitosamente',
  deleted: 'Mantenimiento eliminado exitosamente',
  error: 'Error al procesar mantenimiento',
  notFound: 'Mantenimiento no encontrado',
  completed: 'Mantenimiento completado exitosamente',
  restored: 'Mantenimiento restaurado exitosamente',
};

export const motoMessages = {
  created: 'Motocicleta registrada exitosamente',
  updated: 'Motocicleta actualizada exitosamente',
  deleted: 'Motocicleta eliminada exitosamente',
  error: 'Error al procesar motorcycle',
  notFound: 'Motocicleta no encontrada',
  ownerNotFound: 'Propietario no encontrado',
};

// Función para manejar errores de creación de usuario
export const handleUserCreationError = (error) => {
  let message = 'Error al crear usuario';
  const fieldErrors = {};

  if (error.response) {
    const { data } = error.response;

    if (data) {
      if (data.email) {
        fieldErrors.correo_electronico = Array.isArray(data.email) ? data.email[0] : data.email;
      }
      if (data.username) {
        fieldErrors.username = Array.isArray(data.username) ? data.username[0] : data.username;
      }
      if (data.persona) {
        fieldErrors.persona = Array.isArray(data.persona) ? data.persona[0] : data.persona;
      }
      if (typeof data === 'string') {
        message = data;
      } else if (data.detail) {
        message = data.detail;
      } else if (Object.keys(fieldErrors).length > 0) {
        message = Object.values(fieldErrors)[0];
      } else if (typeof data === 'object') {
        // Include all field errors from the response
        Object.keys(data).forEach(key => {
          if (!fieldErrors[key]) {
            fieldErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          message = Object.values(fieldErrors)[0];
        }
      }
    }
  } else if (error.request) {
    message = 'Error de conexión. Verifique su conexión a internet';
  } else {
    message = 'Error inesperado al crear usuario';
  }

  return {
    message,
    fieldErrors,
  };
};
