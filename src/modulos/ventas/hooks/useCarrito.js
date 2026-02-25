import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCashRegister, faShoppingCart, faPlus, faMinus, faTrash, faSearch, 
  faTags, faUser, faReceipt, faCreditCard, faMoneyBill, faSave, 
  faTimes, faCheck, faSpinner, faBarcode, faCalculator, faPercent,
  faExclamationTriangle, faInfoCircle, faStore, faUsers, faBoxes
} from '@fortawesome/free-solid-svg-icons';

// Hook personalizado para manejar el carrito
const useCarrito = () => {
  const [items, setItems] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [metodoPago, setMetodoPago] = useState('efectivo');

  const agregarItem = useCallback((producto) => {
    setItems(prev => {
      const existente = prev.find(item => item.id === producto.id);
      if (existente) {
        if (existente.cantidad < producto.stock_actual) {
          return prev.map(item =>
            item.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          );
        }
        return prev;
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }, []);

  const removerItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const actualizarCantidad = useCallback((id, cantidad) => {
    if (cantidad <= 0) {
      removerItem(id);
      return;
    }
    setItems(prev => 
      prev.map(item =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  }, [removerItem]);

  const limpiarCarrito = useCallback(() => {
    setItems([]);
    setCliente(null);
    setDescuento(0);
    setMetodoPago('efectivo');
  }, []);

  const calculos = useMemo(() => {
    const subtotal = items.reduce((sum, item) => 
      sum + (parseFloat(item.precio_venta) * item.cantidad), 0
    );
    const montoDescuento = (subtotal * descuento) / 100;
    const total = subtotal - montoDescuento;
    const impuesto = total * 0.13; // 13% IVA por defecto
    const totalConImpuesto = total + impuesto;

    return {
      subtotal: subtotal.toFixed(2),
      montoDescuento: montoDescuento.toFixed(2),
      total: total.toFixed(2),
      impuesto: impuesto.toFixed(2),
      totalConImpuesto: totalConImpuesto.toFixed(2),
      cantidadItems: items.reduce((sum, item) => sum + item.cantidad, 0)
    };
  }, [items, descuento]);

  return {
    items,
    cliente,
    setCliente,
    descuento,
    setDescuento,
    metodoPago,
    setMetodoPago,
    agregarItem,
    removerItem,
    actualizarCantidad,
    limpiarCarrito,
    calculos
  };
};

// Componente para buscar productos
const BuscadorProductos = ({ onProductSelect, loading }) => {
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  const buscarProductos = useCallback(async (query) => {
    if (!query.trim()) {
      setProductos([]);
      return;
    }

    setBuscando(true);
    try {
      // Simular búsqueda de productos
      const productosEjemplo = [
        {
          id: 1,
          codigo: 'ACEI001',
          nombre: 'Aceite de Motor 20W-50',
          precio_venta: '45.00',
          stock_actual: 15,
          categoria_nombre: 'Aceites'
        },
        {
          id: 2,
          codigo: 'FILT001',
          nombre: 'Filtro de Aire Honda',
          precio_venta: '25.00',
          stock_actual: 8,
          categoria_nombre: 'Filtros'
        },
        {
          id: 3,
          codigo: 'BUJIA001',
          nombre: 'Bujía NGK Standard',
          precio_venta: '12.50',
          stock_actual: 25,
          categoria_nombre: 'Bujías'
        }
      ];
      
      const filtrados = productosEjemplo.filter(p =>
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        p.codigo.toLowerCase().includes(query.toLowerCase())
      );
      
      setProductos(filtrados);
    } catch (error) {
      console.error('Error buscando productos:', error);
    } finally {
      setBuscando(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarProductos(busqueda);
    }, 300);

    return () => clearTimeout(timer);
  }, [busqueda, buscarProductos]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center mb-4">
        <FontAwesomeIcon icon={faSearch} className="text-gray-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Buscar Productos
        </h3>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o escanear código de barras..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todas las categorías</option>
          <option value="aceites">Aceites</option>
          <option value="filtros">Filtros</option>
          <option value="bujias">Bujías</option>
        </select>
      </div>

      {buscando && (
        <div className="text-center py-4">
          <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-400">Buscando productos...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
        {productos.map((producto) => (
          <div
            key={producto.id}
            onClick={() => onProductSelect(producto)}
            className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                  {producto.nombre}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {producto.codigo} • {producto.categoria_nombre}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                  Bs. {producto.precio_venta}
                </div>
                <div className={`text-xs ${
                  producto.stock_actual > 10 
                    ? 'text-green-500' 
                    : producto.stock_actual > 0 
                    ? 'text-yellow-500' 
                    : 'text-red-500'
                }`}>
                  Stock: {producto.stock_actual}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {busqueda && productos.length === 0 && !buscando && (
        <div className="text-center py-4">
          <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 mb-2" size="2x" />
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron productos con "{busqueda}"
          </p>
        </div>
      )}
    </div>
  );
};

// Componente del carrito de compras
const CarritoCompras = ({ 
  items, 
  onUpdateCantidad, 
  onRemoveItem, 
  calculos,
  cliente,
  setCliente,
  descuento,
  setDescuento,
  metodoPago,
  setMetodoPago,
  onProcesarVenta,
  loading 
}) => {
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [clientesEncontrados, setClientesEncontrados] = useState([]);

  const buscarClientes = useCallback(async (query) => {
    if (!query.trim()) {
      setClientesEncontrados([]);
      return;
    }

    // Simular búsqueda de clientes
    const clientesEjemplo = [
      { id: 1, nombre_completo: 'Juan Pérez', cedula: '12345678', telefono: '70123456' },
      { id: 2, nombre_completo: 'María García', cedula: '87654321', telefono: '71234567' },
      { id: 3, nombre_completo: 'Carlos López', cedula: '11223344', telefono: '72345678' }
    ];

    const filtrados = clientesEjemplo.filter(c =>
      c.nombre_completo.toLowerCase().includes(query.toLowerCase()) ||
      c.cedula.includes(query)
    );

    setClientesEncontrados(filtrados);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarClientes(clienteBusqueda);
    }, 300);
    return () => clearTimeout(timer);
  }, [clienteBusqueda, buscarClientes]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faShoppingCart} className="mr-2 text-blue-500" />
          Carrito ({calculos.cantidadItems} items)
        </h3>
        {items.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total: Bs. {calculos.totalConImpuesto}
          </span>
        )}
      </div>

      {/* Lista de productos en el carrito */}
      <div className="max-h-96 overflow-y-auto mb-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faShoppingCart} className="text-gray-300 dark:text-gray-600 mb-3" size="3x" />
            <p className="text-gray-500 dark:text-gray-400">El carrito está vacío</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Busca productos arriba para agregar al carrito
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {item.nombre}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.codigo} • Bs. {item.precio_venta} c/u
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  Subtotal: Bs. {(parseFloat(item.precio_venta) * item.cantidad).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onUpdateCantidad(item.id, item.cantidad - 1)}
                  disabled={loading}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-gray-800 dark:text-white">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => onUpdateCantidad(item.id, item.cantidad + 1)}
                  disabled={loading || item.cantidad >= item.stock_actual}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  disabled={loading}
                  className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-full disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <>
          {/* Selección de cliente */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Cliente
            </label>
            {cliente ? (
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {cliente.nombre_completo}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    CI: {cliente.cedula} • Tel: {cliente.telefono}
                  </p>
                </div>
                <button
                  onClick={() => setCliente(null)}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={clienteBusqueda}
                  onChange={(e) => setClienteBusqueda(e.target.value)}
                  placeholder="Buscar cliente por nombre o CI..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                {clientesEncontrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                    {clientesEncontrados.map((clienteOption) => (
                      <button
                        key={clienteOption.id}
                        onClick={() => {
                          setCliente(clienteOption);
                          setClienteBusqueda('');
                          setClientesEncontrados([]);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {clienteOption.nombre_completo}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          CI: {clienteOption.cedula}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Descuento */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FontAwesomeIcon icon={faPercent} className="mr-2" />
              Descuento (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={descuento}
              onChange={(e) => setDescuento(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Método de pago */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
              Método de Pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="qr">QR</option>
            </select>
          </div>

          {/* Resumen de totales */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-800 dark:text-white">Bs. {calculos.subtotal}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-red-600 dark:text-red-400">Descuento ({descuento}%):</span>
                <span className="text-red-600 dark:text-red-400">-Bs. {calculos.montoDescuento}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">IVA (13%):</span>
              <span className="text-gray-800 dark:text-white">Bs. {calculos.impuesto}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-gray-800 dark:text-white">Total:</span>
              <span className="text-green-600 dark:text-green-400">Bs. {calculos.totalConImpuesto}</span>
            </div>
          </div>

          {/* Botón de procesar venta */}
          <button
            onClick={onProcesarVenta}
            disabled={loading || items.length === 0}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faReceipt} className="mr-2" />
                Procesar Venta
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

// Componente principal del POS
const PuntoVentaPage = () => {
  const {
    items,
    cliente,
    setCliente,
    descuento,
    setDescuento,
    metodoPago,
    setMetodoPago,
    agregarItem,
    removerItem,
    actualizarCantidad,
    limpiarCarrito,
    calculos
  } = useCarrito();

  const [loading, setLoading] = useState(false);
  const [ventaProcesada, setVentaProcesada] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState(null);

  // Estadísticas del día (simuladas)
  const [estadisticas, setEstadisticas] = useState({
    ventasHoy: 12,
    ingresosDia: '2,450.00',
    clientesAtendidos: 8,
    productosVendidos: 34
  });

  const procesarVenta = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      // Simular procesamiento de venta
      await new Promise(resolve => setTimeout(resolve, 2000));

      const ventaData = {
        id: Date.now(),
        items: items.map(item => ({
          producto_id: item.id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta,
          subtotal: (parseFloat(item.precio_venta) * item.cantidad).toFixed(2)
        })),
        cliente,
        subtotal: calculos.subtotal,
        descuento: calculos.montoDescuento,
        impuesto: calculos.impuesto,
        total: calculos.totalConImpuesto,
        metodo_pago: metodoPago,
        fecha: new Date().toISOString()
      };

      setUltimaVenta(ventaData);
      setVentaProcesada(true);
      
      // Actualizar estadísticas
      setEstadisticas(prev => ({
        ...prev,
        ventasHoy: prev.ventasHoy + 1,
        ingresosDia: (parseFloat(prev.ingresosDia.replace(',', '')) + parseFloat(calculos.totalConImpuesto)).toFixed(2),
        clientesAtendidos: cliente ? prev.clientesAtendidos + 1 : prev.clientesAtendidos,
        productosVendidos: prev.productosVendidos + calculos.cantidadItems
      }));

      // Limpiar carrito después de 3 segundos
      setTimeout(() => {
        limpiarCarrito();
        setVentaProcesada(false);
        setUltimaVenta(null);
      }, 3000);

    } catch (error) {
      console.error('Error procesando venta:', error);
      alert('Error al procesar la venta. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FontAwesomeIcon icon={faCashRegister} className="mr-3 text-green-600" />
            Punto de Venta
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Procesa ventas de manera rápida y eficiente
          </p>
        </div>

        {/* Estadísticas del día */}
        <div className="hidden lg:grid grid-cols-2 gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estadisticas.ventasHoy}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-center">
              <FontAwesomeIcon icon={faReceipt} className="mr-1" />
              Ventas Hoy
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              Bs. {estadisticas.ingresosDia}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-center">
              <FontAwesomeIcon icon={faMoneyBill} className="mr-1" />
              Ingresos
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {estadisticas.clientesAtendidos}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-center">
              <FontAwesomeIcon icon={faUsers} className="mr-1" />
              Clientes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {estadisticas.productosVendidos}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-center">
              <FontAwesomeIcon icon={faBoxes} className="mr-1" />
              Productos
            </div>
          </div>
        </div>
      </div>

      {/* Notificación de venta procesada */}
      {ventaProcesada && ultimaVenta && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faCheck} className="text-green-600 dark:text-green-400 mr-3" size="2x" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                ¡Venta procesada exitosamente!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                Venta #{ultimaVenta.id} • Total: Bs. {ultimaVenta.total}
                {ultimaVenta.cliente && ` • Cliente: ${ultimaVenta.cliente.nombre_completo}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Layout principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Columna izquierda - Búsqueda de productos */}
        <div className="xl:col-span-2">
          <BuscadorProductos
            onProductSelect={agregarItem}
            loading={loading}
          />
        </div>

        {/* Columna derecha - Carrito */}
        <div className="xl:col-span-1">
          <CarritoCompras
            items={items}
            onUpdateCantidad={actualizarCantidad}
            onRemoveItem={removerItem}
            calculos={calculos}
            cliente={cliente}
            setCliente={setCliente}
            descuento={descuento}
            setDescuento={setDescuento}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            onProcesarVenta={procesarVenta}
            loading={loading}
          />
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={limpiarCarrito}
          disabled={loading || items.length === 0}
          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faTrash} className="mr-2" />
          Limpiar Carrito
        </button>
        
        <button
          onClick={() => window.print()}
          disabled={!ultimaVenta}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faReceipt} className="mr-2" />
          Reimprimir Última Venta
        </button>
      </div>

      {/* Footer con información adicional */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
        <p>Sistema POS - Taller de Motos • Presiona F1 para ayuda • ESC para limpiar carrito</p>
      </div>
    </div>
  );
};

export default PuntoVentaPage;