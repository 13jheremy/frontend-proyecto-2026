// src/modulos/cliente/pages/components/ClienteDetalleMantenimientoModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMotorcycle, 
  faUser, 
  faCalendarAlt, 
  faTools, 
  faDollarSign,
  faWrench,
  faBox,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Modal para mostrar los detalles completos de un mantenimiento al cliente.
 * Este modal es de solo lectura - el cliente solo puede visualizar la información.
 */
const ClienteDetalleMantenimientoModal = ({
  isOpen,
  onClose,
  mantenimiento
}) => {
  // Función para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return format(parseISO(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return fecha;
    }
  };

  // Función para formatear precio
  const formatPrecio = (precio) => {
    if (!precio && precio !== 0) return '-';
    return `Bs${Number(precio).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
  };

  // Función para obtener el badge del estado
  const getEstadoBadge = (estado) => {
    const baseClasses = 'px-3 py-1 text-sm font-medium rounded-full';
    switch (estado?.toLowerCase()) {
      case 'completado':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'en_proceso':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'pendiente':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      case 'cancelado':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  if (!mantenimiento) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Mantenimiento"
      size="large"
    >
      <div className="space-y-6">
        {/* Estado del mantenimiento */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Mantenimiento #{mantenimiento.id}
          </h3>
          <span className={getEstadoBadge(mantenimiento.estado)}>
            {mantenimiento.estado?.toUpperCase() || 'SIN ESTADO'}
          </span>
        </div>

        {/* Información de la moto */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
            <FontAwesomeIcon icon={faMotorcycle} className="mr-2" />
            Información de la Moto
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Marca:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {mantenimiento.moto_marca || '-'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Modelo:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {mantenimiento.moto_modelo || '-'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Placa:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {mantenimiento.moto_placa || '-'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Año:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {mantenimiento.moto_año || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              Fechas
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fecha de Ingreso:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatFecha(mantenimiento.fecha_ingreso)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fecha de Entrega:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatFecha(mantenimiento.fecha_entrega) || 'Pendiente'}
                </span>
              </div>
              {mantenimiento.fecha_completado && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Fecha de Completado:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatFecha(mantenimiento.fecha_completado)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Técnico asignado */}
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Técnico Asignado
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Nombre:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {mantenimiento.tecnico_asignado_persona_nombre || mantenimiento.tecnico_asignado_nombre || 'No asignado'}
                </span>
              </div>
              {mantenimiento.tecnico_asignado_cedula && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">C.I.:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {mantenimiento.tecnico_asignado_cedula}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descripción del problema */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
            <FontAwesomeIcon icon={faTools} className="mr-2" />
            Descripción del Problema
          </h4>
          <p className="text-sm text-slate-900 dark:text-slate-100">
            {mantenimiento.descripcion_problema || 'Sin descripción'}
          </p>
        </div>

        {/* Diagnóstico */}
        {mantenimiento.diagnostico && (
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              Diagnóstico
            </h4>
            <p className="text-sm text-slate-900 dark:text-slate-100">
              {mantenimiento.diagnostico}
            </p>
          </div>
        )}

        {/* Servicios realizados */}
        {mantenimiento.detalles && mantenimiento.detalles.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-md font-medium text-slate-900 dark:text-slate-100 flex items-center">
                <FontAwesomeIcon icon={faWrench} className="mr-2 text-blue-600" />
                Servicios Realizados
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {mantenimiento.detalles.map((detalle, index) => (
                    <tr key={detalle.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {detalle.servicio?.nombre || detalle.nombre_servicio || 'Servicio'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-slate-100">
                          {formatPrecio(detalle.precio)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {detalle.observaciones || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Repuestos utilizados */}
        {mantenimiento.repuestos && mantenimiento.repuestos.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-md font-medium text-slate-900 dark:text-slate-100 flex items-center">
                <FontAwesomeIcon icon={faBox} className="mr-2 text-green-600" />
                Repuestos Utilizados
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Repuesto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {mantenimiento.repuestos.map((repuesto, index) => (
                    <tr key={repuesto.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {(repuesto.producto?.imagen || repuesto.producto_imagen || repuesto.repuesto?.imagen) ? (
                          <img 
                            src={repuesto.producto?.imagen || repuesto.producto_imagen || repuesto.repuesto?.imagen} 
                            alt="Producto" 
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faBox} className="text-slate-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {repuesto.producto_nombre || repuesto.producto?.nombre || repuesto.repuesto?.nombre || repuesto.nombre || 'Repuesto'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-slate-100">
                          {repuesto.cantidad || 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-slate-100">
                          {formatPrecio(repuesto.precio_unitario || repuesto.precio)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {formatPrecio((repuesto.cantidad || 1) * (repuesto.precio_unitario || repuesto.precio || 0))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Costos totales */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
            <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
            Resumen de Costos
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Costo de Servicios:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {formatPrecio(mantenimiento.total)}
              </span>
            </div>
            {mantenimiento.costo_adicional > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Costo Adicional:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatPrecio(mantenimiento.costo_adicional)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
              <span className="font-medium text-slate-700 dark:text-slate-300">Total:</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatPrecio(Number(mantenimiento.total || 0) + Number(mantenimiento.costo_adicional || 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {mantenimiento.observaciones && (
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Observaciones
            </h4>
            <p className="text-sm text-slate-900 dark:text-slate-100">
              {mantenimiento.observaciones}
            </p>
          </div>
        )}

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

ClienteDetalleMantenimientoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mantenimiento: PropTypes.object
};

ClienteDetalleMantenimientoModal.defaultProps = {
  mantenimiento: null
};

export default ClienteDetalleMantenimientoModal;