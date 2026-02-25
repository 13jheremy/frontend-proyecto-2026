// src/utils/ventaHelpers.js
export const formatearMoneda = (cantidad) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(cantidad);
};

export const calcularTotales = (items, descuentoPorcentaje = 0, ivaPorcentaje = 13) => {
  const subtotal = items.reduce((sum, item) => 
    sum + (parseFloat(item.precio_venta) * item.cantidad), 0
  );
  
  const montoDescuento = (subtotal * descuentoPorcentaje) / 100;
  const subtotalConDescuento = subtotal - montoDescuento;
  const iva = (subtotalConDescuento * ivaPorcentaje) / 100;
  const total = subtotalConDescuento + iva;

  return {
    subtotal: subtotal.toFixed(2),
    montoDescuento: montoDescuento.toFixed(2),
    subtotalConDescuento: subtotalConDescuento.toFixed(2),
    iva: iva.toFixed(2),
    total: total.toFixed(2)
  };
};

export const validarStock = (producto, cantidadSolicitada) => {
  if (!producto.stock_actual || producto.stock_actual < cantidadSolicitada) {
    return {
      valido: false,
      mensaje: `Stock insuficiente. Disponible: ${producto.stock_actual || 0}`
    };
  }
  return { valido: true };
};

export const generarNumeroVenta = () => {
  const fecha = new Date();
  const timestamp = fecha.getTime();
  return `V${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}-${timestamp.toString().slice(-6)}`;
};