// src/modulos/servicios/utils/servicioUtils.js

/**
 * @module ServicioUtils
 * @description Funciones de utilidad para el módulo de servicios.
 */

/**
 * Formatea el precio de un servicio.
 * @param {number} precio - Precio del servicio.
 * @returns {string} Precio formateado.
 */
export const formatPrecioServicio = (precio) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(precio || 0);
};

/**
 * Obtiene el nombre de una categoría por su ID.
 * @param {Array} categorias - Lista de categorías disponibles.
 * @param {number} categoriaId - ID de la categoría a buscar.
 * @returns {string} Nombre de la categoría o 'Desconocida'.
 */
export const getCategoriaNombre = (categorias, categoriaId) => {
  const categoria = categorias.find(cat => cat.id === categoriaId);
  return categoria ? categoria.nombre : 'Desconocida';
};

// Puedes añadir más funciones de utilidad aquí según sea necesario.
