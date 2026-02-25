// src/modulos/motos/utils/motoUtils.js

/**
 * @module MotoUtils
 * @description Funciones de utilidad para el módulo de motos.
 */

/**
 * Formatea el precio de una moto.
 * @param {number} precio - Precio de la moto.
 * @returns {string} Precio formateado.
 */
export const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(precio || 0);
};

// Puedes añadir más funciones de utilidad aquí según sea necesario.
