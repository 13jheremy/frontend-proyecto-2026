// src/modulos/mantenimiento/pages/components/MantenimientoInfoModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal'; // Ajusta la ruta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faCalendarAlt, 
  faUser, 
  faMotorcycle, 
  faFileAlt, 
  faStethoscope, 
  faDollarSign,
  faIdCard,
  faTachometerAlt,
  faWrench,
  faCheckCircle,
  faTimesCircle,
  faUserCog,
  faUserEdit,
  faUserSlash,
  faClock,
  faFlag,
  faBox
} from '@fortawesome/free-solid-svg-icons';
import {
  formatFechaMantenimiento,
  formatFechaHoraMantenimiento,
  getEstadoMantenimientoNombre,
  getEstadoMantenimientoClass,
  getMotoNombre,
  getPropietarioNombre,
  formatPrecioMantenimiento
} from '../../utils/mantenimientoUtils';

/**
 * Modal para mostrar información detallada de un mantenimiento.
 * Versión mejorada con más detalles y secciones similares a InfoMotoModal.
 */
export default function MantenimientoInfoModal({ isOpen, onClose, mantenimiento = null }) {
  if (!mantenimiento) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Mantenimiento #${mantenimiento.id}`}>
      <div className="flex flex-col space-y-4 text-gray-700 dark:text-gray-300">
        
        {/* Sección principal - Estado y resumen */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900 rounded-full text-yellow-600 dark:text-yellow-400">
              <FontAwesomeIcon icon={faWrench} size="2x" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Mantenimiento #{mantenimiento.id}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <FontAwesomeIcon icon={faMotorcycle} className="mr-1" />
              Moto: {getMotoNombre(mantenimiento.moto) || `${mantenimiento.moto_marca || ''} ${mantenimiento.moto_modelo || ''}`.trim() || 'N/A'}
            </p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoMantenimientoClass(mantenimiento.estado)}`}>
                {getEstadoMantenimientoNombre(mantenimiento.estado)}
              </span>
            </div>
          </div>
        </div>

        {/* Información de la moto y propietario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Información de la Moto */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faMotorcycle} className="mr-2 text-green-500" />
              Información de la Moto
            </p>
            <div className="ml-6 mt-2 space-y-1">
              <p className="text-sm font-medium">
                {mantenimiento.moto_marca || mantenimiento.moto?.marca || 'N/A'} 
                {mantenimiento.moto_modelo || mantenimiento.moto?.modelo || ''}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Placa: {mantenimiento.moto_placa || mantenimiento.moto?.placa || 'N/A'}
              </p>
              {(mantenimiento.moto_año || mantenimiento.moto?.año) && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Año: {mantenimiento.moto_año || mantenimiento.moto?.año || 'N/A'}
                </p>
              )}
              {(mantenimiento.moto_color || mantenimiento.moto?.color) && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Color: {mantenimiento.moto_color || mantenimiento.moto?.color || 'N/A'}
                </p>
              )}
              {(mantenimiento.moto_cilindrada || mantenimiento.moto?.cilindrada) && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cilindrada: {mantenimiento.moto_cilindrada || mantenimiento.moto?.cilindrada || 'N/A'}cc
                </p>
              )}
            </div>
          </div>

          {/* Propietario */}
          {(mantenimiento.propietario_nombre || mantenimiento.moto?.propietario) && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
                Propietario
              </p>
              <div className="ml-6 mt-2">
                <p className="text-sm font-medium">
                  {mantenimiento.propietario_nombre || getPropietarioNombre(mantenimiento.moto?.propietario) || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CI: {mantenimiento.propietario_cedula || mantenimiento.moto?.propietario?.cedula || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Kilometraje */}
          {mantenimiento.kilometraje_ingreso && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-2 text-purple-500" />
                Kilometraje de Ingreso
              </p>
              <p className="ml-6 text-lg font-mono">{mantenimiento.kilometraje_ingreso} km</p>
            </div>
          )}

          {/* Total */}
          {mantenimiento.total && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-500" />
                Total del Mantenimiento
              </p>
              <p className="ml-6 text-2xl font-bold text-green-600 dark:text-green-400">
                {formatPrecioMantenimiento(mantenimiento.total)}
              </p>
            </div>
          )}
        </div>

        {/* Desglose de costos */}
        {(mantenimiento.detalles?.length > 0 || mantenimiento.repuestos?.length > 0 || mantenimiento.costo_adicional > 0) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-blue-500" />
              Desglose de Costos
            </h4>
            <div className="space-y-2 text-sm">
              {mantenimiento.detalles?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Servicios:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPrecioMantenimiento(mantenimiento.detalles.reduce((sum, d) => sum + (parseFloat(d.precio) || 0), 0))}
                  </span>
                </div>
              )}
              {mantenimiento.repuestos?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Repuestos:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPrecioMantenimiento(mantenimiento.repuestos.reduce((sum, r) => sum + (parseFloat(r.subtotal) || 0), 0))}
                  </span>
                </div>
              )}
              {mantenimiento.costo_adicional > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Costo Adicional:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPrecioMantenimiento(mantenimiento.costo_adicional)}
                  </span>
                </div>
              )}
              {mantenimiento.total > 0 && (
                <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {formatPrecioMantenimiento(mantenimiento.total)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fechas */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-500" />
            Fechas del Mantenimiento
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Ingreso:</span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {formatFechaMantenimiento(mantenimiento.fecha_ingreso)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFechaHoraMantenimiento(mantenimiento.fecha_ingreso)}
              </p>
            </div>
            {mantenimiento.fecha_entrega && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Entrega:</span>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {formatFechaMantenimiento(mantenimiento.fecha_entrega)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFechaHoraMantenimiento(mantenimiento.fecha_entrega)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Problema Reportado */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FontAwesomeIcon icon={faFileAlt} className="text-orange-600 mr-2" />
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Problema Reportado</h4>
          </div>
          <div className="text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 p-3 rounded border">
            {mantenimiento.descripcion_problema || 'No especificado'}
          </div>
        </div>

        {/* Diagnóstico */}
        {mantenimiento.diagnostico && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <FontAwesomeIcon icon={faStethoscope} className="text-red-600 mr-2" />
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Diagnóstico</h4>
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 p-3 rounded border">
              {mantenimiento.diagnostico}
            </div>
          </div>
        )}

        {/* Servicios Realizados */}
        {mantenimiento.detalles && mantenimiento.detalles.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <FontAwesomeIcon icon={faWrench} className="text-blue-600 mr-2" />
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Servicios Realizados</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Servicio</th>
                    <th className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">Precio</th>
                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700">
                  {mantenimiento.detalles.map((detalle, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{detalle.servicio?.nombre || detalle.servicio_nombre || 'N/A'}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100">{formatPrecioMantenimiento(detalle.precio)}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{detalle.observaciones || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Repuestos Utilizados */}
        {mantenimiento.repuestos && mantenimiento.repuestos.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <FontAwesomeIcon icon={faBox} className="text-green-600 mr-2" />
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Repuestos Utilizados</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Producto</th>
                    <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">Cantidad</th>
                    <th className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">Precio Unit.</th>
                    <th className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700">
                  {mantenimiento.repuestos.map((repuesto, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                        {repuesto.producto?.nombre || repuesto.producto_nombre || 'N/A'}
                        {(repuesto.producto?.codigo || repuesto.producto_codigo) && <span className="text-xs text-gray-500 ml-1">({repuesto.producto?.codigo || repuesto.producto_codigo})</span>}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-900 dark:text-gray-100">{repuesto.cantidad}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100">{formatPrecioMantenimiento(repuesto.precio_unitario)}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100 font-medium">{formatPrecioMantenimiento(repuesto.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Técnico Asignado */}
        {(mantenimiento.tecnico_asignado_nombre || mantenimiento.tecnico_asignado) && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              <FontAwesomeIcon icon={faUserCog} className="mr-2 text-indigo-500" />
              Técnico Asignado
            </p>
            <div className="ml-6">
              <p className="text-sm font-medium">{mantenimiento.tecnico_asignado_persona_nombre || mantenimiento.tecnico_asignado_nombre || 'No asignado'}</p>
              {mantenimiento.tecnico_asignado_cedula && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CI: {mantenimiento.tecnico_asignado_cedula}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Estados y metadatos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Estado activo */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {mantenimiento.activo !== false ? 
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" /> : 
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" />
              }
              Estado Activo
            </p>
            <p className="ml-6">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                mantenimiento.activo !== false
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {mantenimiento.activo !== false ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>
          
          {/* Estado de eliminación */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold flex items-center">
              {mantenimiento.eliminado ? 
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" /> : 
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />
              }
              Eliminado
            </p>
            <p className="ml-6">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                mantenimiento.eliminado
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {mantenimiento.eliminado ? 'Sí' : 'No'}
              </span>
            </p>
          </div>

          {/* Fecha de registro */}
          {mantenimiento.fecha_registro && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                Fecha de Registro
              </p>
              <p className="ml-6 text-sm">{formatDate(mantenimiento.fecha_registro)}</p>
            </div>
          )}
          
          {/* Última actualización */}
          {mantenimiento.fecha_actualizacion && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faFlag} className="mr-2" />
                Última Actualización
              </p>
              <p className="ml-6 text-sm">{formatDate(mantenimiento.fecha_actualizacion)}</p>
            </div>
          )}
          
          {/* Fecha de eliminación */}
          {mantenimiento.eliminado && mantenimiento.fecha_eliminacion && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-red-500" />
                Fecha de Eliminación
              </p>
              <p className="ml-6 text-sm">{formatDate(mantenimiento.fecha_eliminacion)}</p>
            </div>
          )}
        </div>

        {/* Trazabilidad - Información de auditoría */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
            Trazabilidad
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Creado por */}
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold flex items-center text-green-700 dark:text-green-400 text-sm">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Creado por
              </p>
              <p className="ml-6 text-gray-900 dark:text-gray-100">
                {mantenimiento.creado_por_nombre || mantenimiento.registrado_por_nombre || 'No disponible'}
              </p>
              {mantenimiento.fecha_registro && (
                <p className="ml-6 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                  {formatDate(mantenimiento.fecha_registro)}
                </p>
              )}
            </div>

            {/* Actualizado por */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
              <p className="font-semibold flex items-center text-blue-700 dark:text-blue-400 text-sm">
                <FontAwesomeIcon icon={faUserEdit} className="mr-2" />
                Actualizado por
              </p>
              <p className="ml-6 text-gray-900 dark:text-gray-100">
                {mantenimiento.actualizado_por_nombre || 'No disponible'}
              </p>
              {mantenimiento.fecha_actualizacion && (
                <p className="ml-6 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                  {formatDate(mantenimiento.fecha_actualizacion)}
                </p>
              )}
            </div>

            {/* Eliminado por - solo mostrar si el mantenimiento está eliminado */}
            {mantenimiento.eliminado && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-500 md:col-span-2">
                <p className="font-semibold flex items-center text-red-700 dark:text-red-400 text-sm">
                  <FontAwesomeIcon icon={faUserSlash} className="mr-2" />
                  Eliminado por
                </p>
                <p className="ml-6 text-gray-900 dark:text-gray-100">
                  {mantenimiento.eliminado_por_nombre || 'No disponible'}
                </p>
                {mantenimiento.fecha_eliminacion && (
                  <p className="ml-6 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                    {formatDate(mantenimiento.fecha_eliminacion)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Información adicional si está disponible */}
        {(mantenimiento.observaciones || mantenimiento.tipo_problema) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Información Adicional
            </h4>
            {mantenimiento.tipo_problema && (
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                <strong>Tipo de Problema:</strong> {mantenimiento.tipo_problema}
              </p>
            )}
            {mantenimiento.observaciones && (
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Observaciones:</strong> {mantenimiento.observaciones}
              </p>
            )}
          </div>
        )}

        {/* Botón de cerrar */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

MantenimientoInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mantenimiento: PropTypes.object,
};
