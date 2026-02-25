// src/modulos/pos/hooks/useCarrito.js
import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

export const useCarrito = () => {
  const [items, setItems] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [descuento, setDescuento] = useState(0); // Descuento en dinero
  const [impuestoManual, setImpuestoManual] = useState(null); // Impuesto manual
  const [impuestoTasa, setImpuestoTasa] = useState(0.19); // 19% IVA por defecto

  // Agregar producto al carrito
  const agregarProducto = useCallback((producto, cantidad = 1) => {
    if (!producto || cantidad <= 0) {
      toast.error('Datos de producto inválidos');
      return false;
    }

    if (producto.stock_actual < cantidad) {
      toast.error(`Stock insuficiente. Disponible: ${producto.stock_actual}`);
      return false;
    }

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.producto.id === producto.id);
      
      if (existingIndex >= 0) {
        const updatedItems = [...prevItems];
        const newCantidad = updatedItems[existingIndex].cantidad + cantidad;
        
        if (newCantidad > producto.stock_actual) {
          toast.error(`Stock insuficiente. Disponible: ${producto.stock_actual}`);
          return prevItems;
        }
        
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          cantidad: newCantidad,
          subtotal: newCantidad * parseFloat(producto.precio_venta)
        };
        
        toast.success(`${producto.nombre} - Cantidad actualizada`);
        return updatedItems;
      } else {
        const nuevoItem = {
          id: Date.now(),
          producto,
          cantidad,
          precio_unitario: parseFloat(producto.precio_venta),
          subtotal: cantidad * parseFloat(producto.precio_venta)
        };
        
        toast.success(`${producto.nombre} agregado al carrito`);
        return [...prevItems, nuevoItem];
      }
    });
    
    return true;
  }, []);

  // Actualizar cantidad de un item
  const actualizarCantidad = useCallback((itemId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarItem(itemId);
      return;
    }

    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          if (nuevaCantidad > item.producto.stock_actual) {
            toast.error(`Stock insuficiente. Disponible: ${item.producto.stock_actual}`);
            return item;
          }
          
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * item.precio_unitario
          };
        }
        return item;
      });
    });
  }, []);

  // Eliminar item del carrito
  const eliminarItem = useCallback((itemId) => {
    setItems(prevItems => {
      const item = prevItems.find(i => i.id === itemId);
      if (item) {
        toast.info(`Producto removido: ${item.producto.nombre}`);
      }
      return prevItems.filter(item => item.id !== itemId);
    });
  }, []);

  // Limpiar carrito
  const limpiarCarrito = useCallback(() => {
    setItems([]);
    setCliente(null);
    setDescuento(0);
    setImpuestoManual(null);
    setMetodoPago('EFECTIVO');
    toast.info('Carrito limpiado');
  }, []);

  // Seleccionar cliente
  const seleccionarCliente = useCallback((clienteSeleccionado) => {
    setCliente(clienteSeleccionado);
    if (clienteSeleccionado) {
      toast.success(`Cliente: ${clienteSeleccionado.nombre_completo}`);
    }
  }, []);

  // Aplicar descuento en dinero
  const aplicarDescuento = useCallback((monto) => {
    if (monto < 0) {
      toast.error('El descuento no puede ser negativo');
      return;
    }
    setDescuento(monto);
    if (monto > 0) {
      toast.success(`Descuento aplicado: $${monto.toFixed(2)}`);
    }
  }, []);

  // Aplicar impuesto manual
  const aplicarImpuestoManual = useCallback((monto) => {
    if (monto < 0) {
      toast.error('El impuesto no puede ser negativo');
      return;
    }
    setImpuestoManual(monto);
    if (monto > 0) {
      toast.success(`Impuesto manual aplicado: $${monto.toFixed(2)}`);
    } else if (monto === 0) {
      toast.info('Impuesto manual removido');
    }
  }, []);

  // Cálculos del carrito
  const totales = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const montoDescuento = descuento; // Descuento directo en dinero
    const subtotalConDescuento = Math.max(0, subtotal - montoDescuento);
    
    // Usar solo impuesto manual si está definido, sino 0
    const impuesto = impuestoManual !== null ? impuestoManual : 0;
    const total = subtotalConDescuento + impuesto;
    
    return {
      subtotal: subtotal.toFixed(2),
      descuento: montoDescuento.toFixed(2),
      subtotalConDescuento: subtotalConDescuento.toFixed(2),
      impuesto: impuesto.toFixed(2),
      total: total.toFixed(2),
      cantidadItems: items.reduce((sum, item) => sum + item.cantidad, 0),
      impuestoEsManual: impuestoManual !== null
    };
  }, [items, descuento, impuestoManual, impuestoTasa]);

  // Validar carrito antes de procesar venta
  const validarCarrito = useCallback(() => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return false;
    }

    if (!cliente) {
      toast.error('Debe seleccionar un cliente');
      return false;
    }

    // Validar stock de todos los productos
    for (const item of items) {
      if (item.cantidad > item.producto.stock_actual) {
        toast.error(`Stock insuficiente para ${item.producto.nombre}. Disponible: ${item.producto.stock_actual}`);
        return false;
      }
    }

    return true;
  }, [items, cliente]);

  // Preparar datos para enviar al backend
  const prepararDatosVenta = useCallback(() => {
    console.log('🔧 useCarrito.prepararDatosVenta - INICIADO');
    
    if (!validarCarrito()) {
      console.log('❌ Validación falló en prepararDatosVenta');
      return null;
    }

    // Calcular porcentaje de impuesto basado en subtotal
    const subtotalSinDescuento = parseFloat(totales.subtotal);
    const impuestoMonto = parseFloat(totales.impuesto);
    const impuestoPorcentaje = subtotalSinDescuento > 0 ? (impuestoMonto / subtotalSinDescuento) * 100 : 0;

    const datosVenta = {
      cliente_id: cliente.id,
      impuesto_porcentaje: impuestoPorcentaje, // Backend espera este campo
      productos: items.map(item => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))
    };
    
    // Solo agregar método de pago si está seleccionado
    if (metodoPago && metodoPago !== '') {
      datosVenta.metodo_pago = metodoPago;
    }

    console.log('📦 Datos de venta preparados:', datosVenta);
    console.log('📊 Detalles del carrito:', {
      cantidadItems: items.length,
      cliente: cliente.nombre_completo,
      metodoPago,
      descuento: `${descuento}`,
      impuestoPorcentaje: `${impuestoPorcentaje.toFixed(2)}%`,
      totales
    });

    return datosVenta;
  }, [items, cliente, totales, metodoPago, descuento, validarCarrito]);

  return {
    // Estado
    items,
    cliente,
    metodoPago,
    descuento,
    impuestoManual,
    impuestoTasa,
    totales,
    
    // Acciones
    agregarProducto,
    actualizarCantidad,
    eliminarItem,
    limpiarCarrito,
    seleccionarCliente,
    aplicarDescuento,
    aplicarImpuestoManual,
    setMetodoPago,
    setImpuestoTasa,
    
    // Utilidades
    validarCarrito,
    prepararDatosVenta,
    
    // Estado computado
    estaVacio: items.length === 0,
    tieneCliente: cliente !== null
  };
};
