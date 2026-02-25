// src/utils/formatters.js

/**
 * Formatea un número como moneda en pesos colombianos
 * @param {number|string} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como moneda
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount);
};

/**
 * Formatea un número con separadores de miles
 * @param {number|string} number - Número a formatear
 * @returns {string} - Número formateado
 */
export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';
  
  const numericValue = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(numericValue)) return '0';
  
  return new Intl.NumberFormat('es-CO').format(numericValue);
};

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {string} format - Formato deseado ('short', 'long', 'datetime')
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Fecha inválida';
  
  const options = {
    short: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    },
    long: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    },
    datetime: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  return dateObj.toLocaleDateString('es-CO', options[format] || options.short);
};

/**
 * Formatea un porcentaje
 * @param {number|string} value - Valor a formatear como porcentaje
 * @param {number} decimals - Número de decimales (por defecto 1)
 * @returns {string} - Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 1) => {
  if (!value && value !== 0) return '0%';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return '0%';
  
  return `${numericValue.toFixed(decimals)}%`;
};

/**
 * Trunca un texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} - Texto capitalizado
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Formatea un número de teléfono colombiano
 * @param {string} phone - Número de teléfono
 * @returns {string} - Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remover todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según la longitud
  if (cleaned.length === 10) {
    // Celular: 300 123 4567
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  } else if (cleaned.length === 7) {
    // Fijo: 123 4567
    return cleaned.replace(/(\d{3})(\d{4})/, '$1 $2');
  }
  
  return phone; // Retornar original si no coincide con formatos esperados
};

/**
 * Formatea un documento de identidad (cédula)
 * @param {string} document - Documento a formatear
 * @returns {string} - Documento formateado
 */
export const formatDocument = (document) => {
  if (!document) return '';
  
  // Remover todos los caracteres no numéricos
  const cleaned = document.replace(/\D/g, '');
  
  // Formatear con puntos cada 3 dígitos
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
