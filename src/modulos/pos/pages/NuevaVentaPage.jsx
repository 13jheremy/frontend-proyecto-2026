// src/modulos/pos/pages/NuevaVentaPage.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faArrowLeft,
  faPlus,
  faMinus,
  faTrash,
  faUser,
  faSearch,
  faCreditCard,
  faMoneyBillWave,
  faPercent,
  faReceipt,
  faCalculator,
  faSpinner,
  faCube
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useCarrito } from '../hooks/useCarrito';
import { usePOS } from '../hooks/usePOS';

// Components
import ProductSearchInput from '../components/ProductSearchInput';
import ClientSearchInput from '../components/ClientSearchInput';
import ProductImage from '../components/ProductImage';
import CreateClientModal from '../components/CreateClientModal';

const NuevaVentaPage = () => {
  console.log('🔄 NuevaVentaPage - RENDERIZANDO COMPONENTE');
  const navigate = useNavigate();
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [createClientName, setCreateClientName] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Hooks
  const {
    items,
    cliente,
    metodoPago,
    descuento,
    impuestoManual,
    totales,
    agregarProducto,
    actualizarCantidad,
    eliminarItem,
    limpiarCarrito,
    seleccionarCliente,
    aplicarDescuento,
    aplicarImpuestoManual,
    setMetodoPago,
    validarCarrito,
    prepararDatosVenta,
    estaVacio
  } = useCarrito();

  const { loading, error, procesarVenta, clearError } = usePOS();

  // Limpiar errores al montar el componente
  useEffect(() => {
    clearError();
  }, [clearError]);


  // Handlers
  const handleProductSelect = (producto) => {
    agregarProducto(producto);
    // La notificación ya se maneja en useCarrito
  };

  const handleClientSelect = (clienteSeleccionado) => {
    seleccionarCliente(clienteSeleccionado);
    // La notificación ya se maneja en useCarrito
  };

  const handleCreateClient = (nombre) => {
    setCreateClientName(nombre);
    setShowCreateClientModal(true);
  };

  const handleClientCreated = (nuevoCliente) => {
    seleccionarCliente(nuevoCliente);
    setShowCreateClientModal(false);
    setCreateClientName('');
    // La notificación ya se maneja en useCarrito
  };

  const handleProcessPayment = async () => {
    console.log('🚀 handleProcessPayment - INICIADO');
    
    try {
      setProcessingPayment(true);
      console.log('⏳ Processing payment estado: true');
      
      console.log('🔍 Validando carrito...');
      const validacion = validarCarrito();
      console.log('📋 Resultado validación:', validacion);
      
      if (!validacion) {
        console.log('❌ Validación falló');
        return;
      }

      console.log('📦 Preparando datos de venta...');
      const datosVenta = prepararDatosVenta();
      console.log('📊 Datos preparados:', datosVenta);
      
      console.log('🔄 Procesando venta...');
      const resultado = await procesarVenta(datosVenta);
      console.log('✅ Resultado procesarVenta:', resultado);
      console.log('🔍 Tipo de resultado:', typeof resultado);
      console.log('🔍 Propiedades del resultado:', Object.keys(resultado || {}));
      console.log('🔍 resultado.success:', resultado?.success);
      console.log('🔍 resultado.venta_id:', resultado?.venta_id);

      if (resultado && (resultado.success || resultado.venta_id)) {
        console.log('✅ Venta exitosa');
        toast.success('Venta procesada exitosamente');
        limpiarCarrito();
        navigate('/');
      } else {
        console.log('❌ Venta falló:', resultado?.message || 'Sin mensaje de error');
        console.log('❌ Resultado completo:', JSON.stringify(resultado, null, 2));
        toast.error(resultado?.message || 'Error al procesar la venta');
      }
    } catch (error) {
      console.error('❌ Error procesando venta:', error);
      console.error('❌ Error stack:', error.stack);
      toast.error('Error inesperado al procesar la venta');
    } finally {
      setProcessingPayment(false);
      console.log('🏁 handleProcessPayment - FINALIZADO');
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Nueva Venta</h1>
                  <p className="text-blue-100">Procesar nueva venta en el punto de venta</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Búsqueda de Productos y Cliente */}
          <div className="lg:col-span-2 space-y-6">
            {/* Búsqueda de Productos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faSearch} className="mr-2 text-blue-600" />
                Buscar Productos
              </h3>
              <ProductSearchInput onProductSelect={handleProductSelect} />
            </div>

            {/* Selección de Cliente */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-green-600" />
                Cliente
              </h3>
              
              {cliente ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">{cliente.nombre}</p>
                    <p className="text-sm text-green-600 dark:text-green-300">{cliente.email || cliente.telefono}</p>
                  </div>
                  <button
                    onClick={() => seleccionarCliente(null)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ) : (
                <ClientSearchInput 
                  onClientSelect={handleClientSelect}
                  onCreateClient={handleCreateClient}
                />
              )}
            </div>

            {/* Carrito de Compras */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faShoppingCart} className="mr-2 text-purple-600" />
                Carrito de Compras ({items.length} items)
              </h3>
              
              {estaVacio ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-4xl mb-2 opacity-50" />
                  <p>El carrito está vacío</p>
                  <p className="text-sm">Busca y agrega productos para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center flex-1">
                        {/* Imagen del producto */}
                        <ProductImage
                          imageUrl={item.producto?.imagen_url || item.producto?.imagen}
                          productName={item.producto?.nombre}
                          size="medium"
                          className="mr-3"
                        />
                        
                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {item.producto?.nombre || 'Producto sin nombre'}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Bs. {item.producto?.precio_venta || '0.00'} c/u
                          </p>
                          {item.producto?.codigo && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Código: {item.producto.codigo}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                          >
                            <FontAwesomeIcon icon={faMinus} className="text-xs" />
                          </button>
                          
                          <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                            {item.cantidad}
                          </span>
                          
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition-colors"
                          >
                            <FontAwesomeIcon icon={faPlus} className="text-xs" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Bs. {((item.producto?.precio_venta || 0) * item.cantidad).toFixed(2)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => eliminarItem(item.id)}
                          className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel de Pago */}
          <div className="space-y-6">
            {/* Método de Pago */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-blue-600" />
                Método de Pago
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="EFECTIVO"
                    checked={metodoPago === 'EFECTIVO'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="mr-3"
                  />
                  <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-green-600" />
                  <span className="text-gray-900 dark:text-white">Efectivo</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="TARJETA"
                    checked={metodoPago === 'TARJETA'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="mr-3"
                  />
                  <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">Tarjeta</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="TRANSFERENCIA"
                    checked={metodoPago === 'TRANSFERENCIA'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="mr-3"
                  />
                  <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-purple-600" />
                  <span className="text-gray-900 dark:text-white">Transferencia</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="OTRO"
                    checked={metodoPago === 'OTRO'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="mr-3"
                  />
                  <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-gray-600" />
                  <span className="text-gray-900 dark:text-white">Otro</span>
                </label>
              </div>
            </div>

            {/* Descuento */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <FontAwesomeIcon icon={faPercent} className="mr-2 text-orange-600 text-sm sm:text-base" />
                <span className="truncate">Descuento</span>
              </h3>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={descuento}
                  onChange={(e) => aplicarDescuento(parseFloat(e.target.value) || 0)}
                  className="flex-1 min-w-0 px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
                <span className="flex-shrink-0 flex items-center px-2 sm:px-3 text-sm sm:text-base text-gray-500 dark:text-gray-400">Bs.</span>
              </div>
            </div>

            {/* Impuesto Manual */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <FontAwesomeIcon icon={faCalculator} className="mr-2 text-green-600 text-sm sm:text-base" />
                <span className="truncate">Impuesto Manual</span>
              </h3>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={impuestoManual || ''}
                  onChange={(e) => aplicarImpuestoManual(parseFloat(e.target.value) || null)}
                  className="flex-1 min-w-0 px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Automático"
                />
                <span className="flex-shrink-0 flex items-center px-2 sm:px-3 text-sm sm:text-base text-gray-500 dark:text-gray-400">Bs.</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 break-words">
                {totales.impuestoEsManual ? 'Impuesto manual aplicado' : 'Cálculo automático (19%)'}
              </p>
            </div>

            {/* Resumen de Totales */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resumen de Venta
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Bs. {totales.subtotal}
                  </span>
                </div>
                
                {descuento > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Descuento ({descuento}%):</span>
                    <span>-Bs. {totales.descuento}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Impuesto:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Bs. {totales.impuesto}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      Bs. {totales.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de Procesar Pago */}
            <button
              onClick={(e) => {
                console.log('🖱️ CLICK EN BOTÓN PROCESAR VENTA DETECTADO!');
                console.log('📍 Event:', e);
                console.log('🔍 Estado del botón:', {
                  estaVacio,
                  processingPayment,
                  loading,
                  disabled: estaVacio || processingPayment || loading
                });
                console.log('🎯 Llamando handleProcessPayment...');
                handleProcessPayment();
              }}
              onMouseEnter={() => console.log('🖱️ MOUSE ENTER en botón procesar venta')}
              disabled={estaVacio || processingPayment || loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {processingPayment || loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faReceipt} />
                  <span>Procesar Venta</span>
                </>
              )}
            </button>

            {/* Botón Limpiar Carrito */}
            {!estaVacio && (
              <button
                onClick={limpiarCarrito}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Limpiar Carrito</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Crear Cliente */}
      <CreateClientModal
        isOpen={showCreateClientModal}
        onClose={() => {
          setShowCreateClientModal(false);
          setCreateClientName('');
        }}
        onClientCreated={handleClientCreated}
        initialName={createClientName}
      />
    </div>
  );
};

export default NuevaVentaPage;
