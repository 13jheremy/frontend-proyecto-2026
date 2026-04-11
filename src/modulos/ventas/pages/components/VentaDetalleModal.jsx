// src/modulos/ventas/pages/components/VentaDetalleModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faShoppingCart, 
  faUser, 
  faCalendar, 
  faDollarSign, 
  faReceipt, 
  faBox,
  faMoneyBillWave,
  faCreditCard,
  faExchangeAlt,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faHistory,
  faImage,
  faPrint,
  faUserEdit,
  faUserMinus
} from '@fortawesome/free-solid-svg-icons';
import { PAYMENT_METHODS, PAYMENT_METHOD_COLORS } from '../../../../utils/constants';
import { pagosAPI } from '../../api/ventasAPI';
import ProductoImageModal from '../../../productos/pages/components/ProductoImageModal';

const VentaDetalleModal = ({ isOpen, onClose, venta }) => {
  const [pagos, setPagos] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  
  // Estado para el modal de imagen de producto
  const [productImageModal, setProductImageModal] = useState({
    isOpen: false,
    imageUrl: null,
    productName: ''
  });

  // Cargar pagos cuando se abre el modal
  useEffect(() => {
    if (isOpen && venta?.id) {
      loadPagos();
    }
  }, [isOpen, venta?.id]);

  const loadPagos = async () => {
    setLoadingPagos(true);
    try {
      const response = await pagosAPI.getByVenta(venta.id);
      setPagos(response.results || []);
    } catch (error) {
      console.error('Error cargando pagos:', error);
      setPagos([]);
    } finally {
      setLoadingPagos(false);
    }
  };

  if (!isOpen || !venta) return null;

  const formatearPrecio = (precio) => {
    return `Bs. ${parseFloat(precio).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completada':
        return 'text-green-600 bg-green-100';
      case 'pendiente':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelada':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetodoPagoIcon = (metodo) => {
    switch (metodo?.toLowerCase()) {
      case 'efectivo':
        return faMoneyBillWave;
      case 'tarjeta':
        return faCreditCard;
      case 'transferencia':
        return faExchangeAlt;
      default:
        return faDollarSign;
    }
  };

  const getEstadoPagoBadge = (venta) => {
    const total = parseFloat(venta.total || 0);
    const pagado = parseFloat(venta.pagado || 0);
    const saldo = parseFloat(venta.saldo || 0);

    let estadoPago, color, icon;

    if (pagado === 0) {
      estadoPago = 'PENDIENTE';
      color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      icon = faExclamationTriangle;
    } else if (saldo > 0) {
      estadoPago = 'PARCIAL';
      color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      icon = faClock;
    } else {
      estadoPago = 'PAGADA';
      color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      icon = faCheckCircle;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <FontAwesomeIcon icon={icon} className="mr-1" />
        {estadoPago}
      </span>
    );
  };

  // Función para abrir el modal de imagen del producto
  const handleProductImageClick = (producto) => {
    const imagenUrl = producto?.producto_imagen || producto?.imagen;
    const nombre = producto?.producto_nombre || producto?.producto?.nombre || producto?.nombre || 'Producto';
    
    if (imagenUrl) {
      setProductImageModal({
        isOpen: true,
        imageUrl: imagenUrl,
        productName: nombre
      });
    }
  };

  // Función para generar e imprimir el recibo
  const handlePrintReceipt = () => {
    import('../../../../utils/printReceipt').then(({ printReceipt }) => {
      printReceipt(venta);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <FontAwesomeIcon icon={faReceipt} className="mr-2 text-blue-600" />
            Detalle de Venta #{venta.id}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintReceipt}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              title="Imprimir Recibo"
            >
              <FontAwesomeIcon icon={faPrint} className="mr-2" />
              Imprimir Recibo
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Información de la Venta */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faShoppingCart} className="mr-2 text-blue-600" />
                Información de la Venta
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID:</span>
                  <span className="font-medium text-gray-900 dark:text-white">#{venta.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                    {formatearFecha(venta.fecha_venta)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(venta.estado)}`}>
                    {venta.estado?.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estado de Pago:</span>
                  {getEstadoPagoBadge(venta)}
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-green-600" />
                Información del Cliente
              </h3>
              
              {(venta.cliente || venta.cliente_nombre) ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {venta.cliente_nombre || 
                       (venta.cliente ? `${venta.cliente.nombre || ''} ${venta.cliente.apellido || ''}`.trim() : '') ||
                       'Cliente sin nombre'
                      }
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      CC: {venta.cliente_cedula || venta.cliente?.cedula || 'Sin cédula'}
                    </div>
                  </div>
                  
                  {venta.cliente?.telefono && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Teléfono:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {venta.cliente.telefono}
                      </span>
                    </div>
                  )}
                  
                  {venta.cliente?.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {venta.cliente.email}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Venta sin cliente registrado
                </p>
              )}
            </div>
          </div>

          {/* Productos de la Venta */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faBox} className="mr-2 text-purple-600" />
              Productos Vendidos
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {venta.detalles && venta.detalles.length > 0 ? (
                    venta.detalles.map((detalle, index) => {
                      const productoImagen = detalle.producto_imagen || detalle.producto?.imagen;
                      const productoNombre = detalle.producto_nombre || detalle.producto?.nombre || 'Producto no disponible';
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {productoImagen ? (
                              <button
                                onClick={() => handleProductImageClick(detalle)}
                                className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:ring-2 hover:ring-blue-300 transition-all duration-200 cursor-pointer group"
                                title="Ver imagen del producto"
                              >
                                <img
                                  src={productoImagen}
                                  alt={productoNombre}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                  <FontAwesomeIcon icon={faImage} className="text-white opacity-0 group-hover:opacity-100" />
                                </div>
                              </button>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <FontAwesomeIcon icon={faImage} className="text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {productoNombre}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {detalle.cantidad}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatearPrecio(detalle.precio_unitario)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatearPrecio(detalle.subtotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No hay productos registrados para esta venta
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Información de Pagos */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-green-600" />
              Historial de Pagos
            </h3>
            
            {loadingPagos ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando pagos...</span>
              </div>
            ) : (venta.pagos && venta.pagos.length > 0) || pagos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Registrado por
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(venta.pagos || pagos).map((pago, index) => (
                      <tr key={pago.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <FontAwesomeIcon icon={faCalendar} className="mr-2 text-gray-400" />
                          {formatearFecha(pago.fecha_pago)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            PAYMENT_METHOD_COLORS[pago.metodo] || 'bg-gray-100 text-gray-800'
                          }`}>
                            <FontAwesomeIcon icon={getMetodoPagoIcon(pago.metodo)} className="mr-1" />
                            {pago.metodo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                          {formatearPrecio(pago.monto)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {pago.registrado_por_nombre || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FontAwesomeIcon icon={faHistory} className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No hay pagos registrados para esta venta</p>
              </div>
            )}
          </div>

          {/* Totales */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-600" />
              Resumen de Totales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatearPrecio(venta.subtotal)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Subtotal
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatearPrecio(venta.impuesto)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  IVA (19%)
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatearPrecio(venta.total)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatearPrecio(venta.pagado || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pagado
                </div>
                {parseFloat(venta.saldo || 0) > 0 && (
                  <div className="mt-2">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatearPrecio(venta.saldo)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Saldo Pendiente
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {venta.observaciones && (
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                Observaciones
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {venta.observaciones}
              </p>
            </div>
          )}

          {/* Trazabilidad - Información de auditoría */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
              Trazabilidad
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Creado por / Vendido por */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                <p className="font-semibold flex items-center text-green-700 dark:text-green-400 text-sm mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Vendido por:
                </p>
                <p className="text-gray-900 dark:text-gray-100 ml-6">
                  {venta.registrado_por_nombre || 
                   (venta.registrado_por?.persona_asociada ? 
                     `${venta.registrado_por.persona_asociada.nombre} ${venta.registrado_por.persona_asociada.apellido}` : 
                     venta.registrado_por?.username ||
                     'No disponible')
                  }
                </p>
                {venta.fecha_registro && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 flex items-center mt-1">
                    <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                    {formatearFecha(venta.fecha_registro)}
                  </p>
                )}
              </div>

              {/* Actualizado por */}
              {(venta.actualizado_por || venta.actualizado_por_nombre) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold flex items-center text-blue-700 dark:text-blue-400 text-sm mb-2">
                    <FontAwesomeIcon icon={faUserEdit} className="mr-2" />
                    Última modificación por:
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 ml-6">
                    {venta.actualizado_por_nombre || 
                     (venta.actualizado_por?.persona_asociada ? 
                       `${venta.actualizado_por.persona_asociada.nombre} ${venta.actualizado_por.persona_asociada.apellido}` : 
                       venta.actualizado_por?.username || 'No disponible')
                    }
                  </p>
                  {venta.fecha_actualizacion && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 flex items-center mt-1">
                      <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                      {formatearFecha(venta.fecha_actualizacion)}
                    </p>
                  )}
                </div>
              )}

              {/* Eliminado por - solo mostrar si la venta está eliminada */}
              {venta.eliminado && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500 md:col-span-2">
                  <p className="font-semibold flex items-center text-red-700 dark:text-red-400 text-sm mb-2">
                    <FontAwesomeIcon icon={faUserMinus} className="mr-2" />
                    Eliminado por:
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 ml-6">
                    {venta.eliminado_por_nombre ||
                     (venta.eliminado_por?.persona_asociada ? 
                       `${venta.eliminado_por.persona_asociada.nombre} ${venta.eliminado_por.persona_asociada.apellido}` : 
                       venta.eliminado_por?.username || 'No disponible')
                    }
                  </p>
                  {venta.fecha_eliminacion && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 flex items-center mt-1">
                      <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                      {formatearFecha(venta.fecha_eliminacion)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cerrar
          </button>
        </div>
      </div>
      
      {/* Modal para ver imagen del producto */}
      <ProductoImageModal
        isOpen={productImageModal.isOpen}
        onClose={() => setProductImageModal({ isOpen: false, imageUrl: null, productName: '' })}
        imageUrl={productImageModal.imageUrl}
        productName={productImageModal.productName}
      />
    </div>
  );
};

VentaDetalleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  venta: PropTypes.shape({
    id: PropTypes.number,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pagado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    saldo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subtotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    impuesto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fecha_venta: PropTypes.string,
    estado: PropTypes.string,
    cliente: PropTypes.object,
    detalles: PropTypes.array,
    observaciones: PropTypes.string,
    fecha_registro: PropTypes.string,
    registrado_por: PropTypes.object,
    registrado_por_nombre: PropTypes.string,
    fecha_actualizacion: PropTypes.string,
    actualizado_por: PropTypes.object,
    actualizado_por_nombre: PropTypes.string,
    eliminado: PropTypes.bool,
    eliminado_por: PropTypes.object,
    eliminado_por_nombre: PropTypes.string,
    fecha_eliminacion: PropTypes.string
  })
};

export default VentaDetalleModal;
