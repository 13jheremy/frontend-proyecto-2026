// src/modulos/categorias-productos/utils/servicioUtils.js

/**
 * @module ProductoUtils
 * @description Funciones de utilidad para el módulo de productos.
 */

/**
 * Formatea el precio de un producto.
 * @param {number} precio - Precio del producto.
 * @returns {string} Precio formateado.
 */
export const formatPrecioProducto = (precio) => {
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
