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
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import { PAYMENT_METHODS, PAYMENT_METHOD_COLORS } from '../../../../utils/constants';
import { pagosAPI } from '../../api/ventasAPI';

const VentaDetalleModal = ({ isOpen, onClose, venta }) => {
  const [pagos, setPagos] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <FontAwesomeIcon icon={faReceipt} className="mr-2 text-blue-600" />
            Detalle de Venta #{venta.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
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
                    venta.detalles.map((detalle, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {detalle.producto_nombre || detalle.producto?.nombre || 'Producto no disponible'}
                          </div>
                          {detalle.producto?.codigo && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Código: {detalle.producto.codigo}
                            </div>
                          )}
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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

          {/* Información de Auditoría */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
              {venta.fecha_registro && (
                <div>
                  <span className="font-medium">Fecha de Registro:</span>
                  <span className="ml-2">{formatearFecha(venta.fecha_registro)}</span>
                </div>
              )}
              
              {(venta.registrado_por || venta.registrado_por_nombre) && (
                <div>
                  <span className="font-medium">Registrado por:</span>
                  <span className="ml-2">
                    {venta.registrado_por_nombre || 
                     (venta.registrado_por?.persona_asociada ? 
                       `${venta.registrado_por.persona_asociada.nombre} ${venta.registrado_por.persona_asociada.apellido}` : 
                       venta.registrado_por?.username
                     )
                    }
                  </span>
                </div>
              )}
              
              {venta.fecha_actualizacion && (
                <div>
                  <span className="font-medium">Última Actualización:</span>
                  <span className="ml-2">{formatearFecha(venta.fecha_actualizacion)}</span>
                </div>
              )}
              
              {venta.actualizado_por && (
                <div>
                  <span className="font-medium">Actualizado por:</span>
                  <span className="ml-2">
                    {venta.actualizado_por.persona_asociada ? 
                      `${venta.actualizado_por.persona_asociada.nombre} ${venta.actualizado_por.persona_asociada.apellido}` : 
                      venta.actualizado_por.username
                    }
                  </span>
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
    fecha_actualizacion: PropTypes.string,
    actualizado_por: PropTypes.object
  })
};

export default VentaDetalleModal;
