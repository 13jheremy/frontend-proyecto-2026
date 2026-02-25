// src/modulos/mantenimiento/utils/mantenimientoUtils.js

/**
 * @module MantenimientoUtils
 * @description Utilidades para el módulo de mantenimientos
 */

/**
 * Formatea el precio de un mantenimiento
 * @param {number} precio - Precio a formatear
 * @returns {string} Precio formateado
 */
export const formatPrecioMantenimiento = (precio) => {
  if (precio === null || precio === undefined) return 'N/A';
  return `Bs ${parseFloat(precio).toFixed(2)}`;
};

/**
 * Formatea la fecha de mantenimiento
 * @param {string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatFechaMantenimiento = (fecha) => {
  if (!fecha) return 'N/A';
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea la fecha y hora de mantenimiento
 * @param {string} fechaHora - Fecha y hora a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatFechaHoraMantenimiento = (fechaHora) => {
  if (!fechaHora) return 'N/A';
  try {
    const date = new Date(fechaHora);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Obtiene el nombre del estado de mantenimiento
 * @param {string} estado - Estado del mantenimiento
 * @returns {string} Nombre del estado
 */
export const getEstadoMantenimientoNombre = (estado) => {
  const estados = {
    'pendiente': 'Pendiente',
    'en_proceso': 'En Proceso',
    'completado': 'Completado',
    'cancelado': 'Cancelado'
  };
  return estados[estado] || 'Desconocido';
};

/**
 * Obtiene la clase CSS para el estado de mantenimiento
 * @param {string} estado - Estado del mantenimiento
 * @returns {string} Clase CSS
 */
export const getEstadoMantenimientoClass = (estado) => {
  const classes = {
    'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'en_proceso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'completado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  return classes[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

/**
 * Obtiene el nombre de la moto
 * @param {object} moto - Objeto moto
 * @returns {string} Nombre formateado de la moto
 */
export const getMotoNombre = (moto) => {
  if (!moto) return 'N/A';
  return `${moto.marca || ''} ${moto.modelo || ''} (${moto.placa || ''})`.trim() || 'Moto sin información';
};

/**
 * Obtiene el nombre del propietario
 * @param {object} propietario - Objeto propietario
 * @returns {string} Nombre del propietario
 */
export const getPropietarioNombre = (propietario) => {
  if (!propietario) return 'N/A';
  return propietario.nombre_completo || `${propietario.nombre || ''} ${propietario.apellido || ''}`.trim() || 'Propietario desconocido';
};

/**
 * Obtiene el nombre del servicio
 * @param {object} servicio - Objeto servicio
 * @returns {string} Nombre del servicio
 */
export const getServicioNombre = (servicio) => {
  if (!servicio) return 'N/A';
  return servicio.nombre || 'Servicio desconocido';
};

/**
 * Calcula el total de un mantenimiento basado en sus detalles
 * @param {Array} detalles - Array de detalles del mantenimiento
 * @returns {number} Total calculado
 */
export const calcularTotalMantenimiento = (detalles) => {
  if (!detalles || !Array.isArray(detalles)) return 0;
  return detalles.reduce((total, detalle) => {
    return total + (parseFloat(detalle.precio) || 0);
  }, 0);
};

/**
 * Verifica si un mantenimiento está próximo (dentro de X días)
 * @param {string} fechaProgramada - Fecha programada
 * @param {number} diasAnticipacion - Días de anticipación
 * @returns {boolean} True si está próximo
 */
export const esMantenimientoProximo = (fechaProgramada, diasAnticipacion = 7) => {
  if (!fechaProgramada) return false;

  try {
    const hoy = new Date();
    const fecha = new Date(fechaProgramada);
    const diferenciaDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));

    return diferenciaDias >= 0 && diferenciaDias <= diasAnticipacion;
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene el color para el estado de proximidad
 * @param {string} fechaProgramada - Fecha programada
 * @returns {string} Clase CSS para el color
 */
export const getProximidadColor = (fechaProgramada) => {
  if (!fechaProgramada) return 'text-gray-500';

  try {
    const hoy = new Date();
    const fecha = new Date(fechaProgramada);
    const diferenciaDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) return 'text-red-600'; // Vencido
    if (diferenciaDias === 0) return 'text-orange-600'; // Hoy
    if (diferenciaDias <= 3) return 'text-yellow-600'; // Próximos 3 días
    if (diferenciaDias <= 7) return 'text-blue-600'; // Próximos 7 días
    return 'text-gray-500'; // Futuro lejano
  } catch (error) {
    return 'text-gray-500';
  }
};

/**
 * Valida los datos de un mantenimiento
 * @param {object} data - Datos a validar
 * @returns {object} Objeto con errores
 */
export const validarMantenimiento = (data) => {
  const errores = {};

  if (!data.moto) {
    errores.moto = 'La moto es requerida';
  }

  if (!data.fecha_ingreso) {
    errores.fecha_ingreso = 'La fecha de ingreso es requerida';
  }

  if (!data.descripcion_problema || data.descripcion_problema.trim().length === 0) {
    errores.descripcion_problema = 'La descripción del problema es requerida';
  }

  if (data.kilometraje_ingreso && data.kilometraje_ingreso < 0) {
    errores.kilometraje_ingreso = 'El kilometraje no puede ser negativo';
  }

  return errores;
};

/**
 * Valida los datos de un detalle de mantenimiento
 * @param {object} data - Datos a validar
 * @returns {object} Objeto con errores
 */
export const validarDetalleMantenimiento = (data) => {
  const errores = {};

  if (!data.servicio) {
    errores.servicio = 'El servicio es requerido';
  }

  if (!data.precio || parseFloat(data.precio) <= 0) {
    errores.precio = 'El precio debe ser mayor a 0';
  }

  return errores;
};