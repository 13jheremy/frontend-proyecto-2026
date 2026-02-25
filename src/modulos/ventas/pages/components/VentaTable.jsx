// src/modulos/ventas/pages/components/VentaTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faEye, 
  faUndo, 
  faTrashAlt, 
  faToggleOn, 
  faToggleOff,
  faCheckCircle,
  faClock,
  faTimes,
  faArchive,
  faInfoCircle,
  faSpinner,
  faReceipt,
  faUser,
  faDollarSign,
  faCalendarAlt,
  faFileInvoiceDollar,
  faTrashRestore,
  faBan,
  faRecycle,
  faMoneyBillWave,
  faExclamationTriangle,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS, PAYMENT_STATUS_COLORS, SALE_STATES } from '../../../../utils/constants';
import { hasPermission } from '../../../../utils/rolePermissions';
import { useAuth } from '../../../../context/AuthContext';

const VentaTable = ({ 
  ventas,
  permissions, // Recibir permisos como prop
  onInfo, 
  onSoftDelete, 
  onRestore, 
  onCambiarEstado, 
  onDetalle, 
  onRegistrarPago,
  onEditarEstado,
  loading 
}) => {
  // Usar permisos pasados como props
  const { canEdit, canDelete, canChangeStatus, canRestore, canManagePayments } = permissions || {};
  const formatearPrecio = (precio) => {
    return `Bs. ${parseFloat(precio).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'completada': {
        color: 'bg-green-100 text-green-800',
        icon: faCheckCircle
      },
      'pendiente': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: faClock
      },
      'cancelada': {
        color: 'bg-red-100 text-red-800',
        icon: faTimes
      }
    };

    const badge = badges[estado] || badges['pendiente'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <FontAwesomeIcon icon={badge.icon} className="mr-1" />
        {estado?.toUpperCase()}
      </span>
    );
  };

  const getMetodoPagoDisplay = (venta) => {
    // Si no hay pagos, mostrar "Sin pagos"
    if (!venta.pagos || venta.pagos.length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
          Sin pagos
        </span>
      );
    }

    // Obtener métodos únicos de pago
    const metodosUnicos = [...new Set(venta.pagos.map(pago => pago.metodo))];
    
    // Mapear métodos a iconos y colores
    const getMetodoInfo = (metodo) => {
      switch (metodo) {
        case 'EFECTIVO':
          return { 
            label: 'Efectivo', 
            icon: faMoneyBillWave, 
            color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
          };
        case 'TARJETA':
          return { 
            label: 'Tarjeta', 
            icon: faFileInvoiceDollar, 
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
          };
        case 'TRANSFERENCIA':
          return { 
            label: 'Transferencia', 
            icon: faRecycle, 
            color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
          };
        case 'OTRO':
          return { 
            label: 'Otro', 
            icon: faInfoCircle, 
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
          };
        default:
          return { 
            label: metodo, 
            icon: faInfoCircle, 
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
          };
      }
    };

    // Si solo hay un método, mostrar un badge
    if (metodosUnicos.length === 1) {
      const metodoInfo = getMetodoInfo(metodosUnicos[0]);
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${metodoInfo.color}`}>
          <FontAwesomeIcon icon={metodoInfo.icon} className="mr-1" />
          {metodoInfo.label}
        </span>
      );
    }

    // Si hay múltiples métodos, mostrar "Mixto"
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
        <FontAwesomeIcon icon={faRecycle} className="mr-1" />
        Mixto
      </span>
    );
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando ventas...</span>
      </div>
    );
  }

  if (!ventas || ventas.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
          No se encontraron ventas
        </div>
        <div className="text-gray-400 dark:text-gray-500 text-sm">
          Intenta ajustar los filtros de búsqueda
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              ID / Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Total / Pagos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Método de Pago
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Estado Venta
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {ventas.map((venta) => (
            <tr 
              key={venta.id} 
              className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                venta.eliminado ? 'bg-red-50 dark:bg-red-900/20' : ''
              }`}
            >
              {/* ID / Fecha */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  #{venta.id}
                  {venta.eliminado && (
                    <FontAwesomeIcon icon={faArchive} className="ml-2 text-red-500" />
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatearFecha(venta.fecha_venta)}
                </div>
              </td>

              {/* Cliente */}
              <td className="px-6 py-4 whitespace-nowrap">
                {venta.cliente ? (
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {venta.cliente.nombre} {venta.cliente.apellido}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      CC: {venta.cliente.cedula}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Sin cliente
                  </span>
                )}
              </td>

              {/* Total / Pagos */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatearPrecio(venta.total)}
                </div>
                {venta.pagado !== undefined && (
                  <div className="text-xs space-y-1">
                    <div className="text-green-600 dark:text-green-400">
                      Pagado: {formatearPrecio(venta.pagado || 0)}
                    </div>
                    {parseFloat(venta.saldo || 0) > 0 && (
                      <div className="text-red-600 dark:text-red-400">
                        Saldo: {formatearPrecio(venta.saldo || 0)}
                      </div>
                    )}
                  </div>
                )}
              </td>

              {/* Método de Pago */}
              <td className="px-6 py-4 whitespace-nowrap">
                {getMetodoPagoDisplay(venta)}
              </td>

              {/* Estado de Venta */}
              <td className="px-6 py-4 whitespace-nowrap">
                {getEstadoBadge(venta.estado)}
              </td>

              {/* Acciones */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  {/* Ver Detalle */}
                  <div className="flex items-center space-x-2">
                    {/* Botón INFORMACIÓN */}
                    <button
                      onClick={() => onDetalle(venta)}
                      className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                      title="Información de la venta"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
                    </button>

                    {/* Botón REGISTRAR PAGO */}
                    {!venta.eliminado && canManagePayments && parseFloat(venta.saldo || 0) > 0 && (
                      <button
                        onClick={() => onRegistrarPago(venta)}
                        className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                        title="Registrar pago"
                      >
                        <FontAwesomeIcon icon={faMoneyBillWave} className="h-4 w-4" />
                      </button>
                    )}

                    {/* Botón EDITAR ESTADO Y MÉTODO DE PAGO */}
                    {!venta.eliminado && canEdit && (
                      <button
                        onClick={() => onEditarEstado(venta)}
                        className="p-2 rounded-full text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-200"
                        title="Editar estado y método de pago"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                      </button>
                    )}

                    {/* Lógica de eliminación */}
                    {venta.eliminado ? (
                      <>
                        {/* Botón RESTAURAR */}
                        {canRestore && (
                          <button
                            onClick={() => onRestore(venta.id)}
                            className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                            title="Restaurar venta"
                          >
                            <FontAwesomeIcon icon={faTrashRestore} className="h-4 w-4" />
                          </button>
                        )}
                        {/* Botón ELIMINAR PERMANENTEMENTE */}
                        {canDelete && (
                          <button
                            onClick={() => onHardDelete && onHardDelete(venta.id)}
                            className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                            title="Eliminar permanentemente"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      /* Botón ELIMINAR TEMPORALMENTE */
                      canDelete && (
                        <button
                          onClick={() => onSoftDelete(venta.id)}
                          className="p-2 rounded-full text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors duration-200"
                          title="Eliminar temporalmente"
                        >
                          <FontAwesomeIcon icon={faRecycle} className="h-4 w-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

VentaTable.propTypes = {
  ventas: PropTypes.array.isRequired,
  permissions: PropTypes.object,
  onInfo: PropTypes.func,
  onSoftDelete: PropTypes.func,
  onRestore: PropTypes.func,
  onCambiarEstado: PropTypes.func,
  onDetalle: PropTypes.func,
  onRegistrarPago: PropTypes.func,
  onEditarEstado: PropTypes.func,
  loading: PropTypes.bool
};

export default VentaTable;
