// src/modulos/reportes/pages/components/TablaMantenimientosDetalle.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCalendar, faUser, faMotorcycle, faWrench, faDollarSign, faBox } from '@fortawesome/free-solid-svg-icons';

const TablaMantenimientosDetalle = ({ mantenimientos = [] }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'en_proceso': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'baja': return 'text-gray-500';
      case 'media': return 'text-yellow-600';
      case 'alta': return 'text-orange-600';
      case 'urgente': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const filteredMantenimientos = mantenimientos.filter(m => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      m.moto?.placa?.toLowerCase().includes(search) ||
      m.propietario?.nombre?.toLowerCase().includes(search) ||
      m.tecnico?.nombre?.toLowerCase().includes(search) ||
      m.descripcion_problema?.toLowerCase().includes(search)
    );
  });

  if (mantenimientos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No hay mantenimientos para mostrar
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {filteredMantenimientos.length} resultado(s)
        </span>
      </div>

      <div className="space-y-2">
        {filteredMantenimientos.map((mantenimiento) => (
          <div
            key={mantenimiento.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <div 
              className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => toggleRow(mantenimiento.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FontAwesomeIcon 
                    icon={expandedRows[mantenimiento.id] ? faChevronUp : faChevronDown} 
                    className="text-gray-400 text-xs"
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <FontAwesomeIcon icon={faMotorcycle} className="text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {mantenimiento.moto?.placa} - {mantenimiento.moto?.marca} {mantenimiento.moto?.modelo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {mantenimiento.propietario?.nombre}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getEstadoColor(mantenimiento.estado)}`}>
                    {mantenimiento.estado}
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ${parseFloat(mantenimiento.total || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>

            {expandedRows[mantenimiento.id] && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Información</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-900 dark:text-white">
                        <span className="font-medium">Tipo:</span> {mantenimiento.tipo}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        <span className="font-medium">Prioridad:</span>{' '}
                        <span className={getPrioridadColor(mantenimiento.prioridad)}>{mantenimiento.prioridad}</span>
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        <span className="font-medium">Kilometraje:</span> {mantenimiento.kilometraje_ingreso} km → {mantenimiento.kilometraje_salida} km
                      </p>
                      {mantenimiento.diagnostico && (
                        <p className="text-gray-900 dark:text-white">
                          <span className="font-medium">Diagnóstico:</span> {mantenimiento.diagnostico}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fechas</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-900 dark:text-white">
                        <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                        Ingreso: {mantenimiento.fecha_ingreso ? new Date(mantenimiento.fecha_ingreso).toLocaleDateString('es-CO') : 'N/A'}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                        Entrega: {mantenimiento.fecha_entrega ? new Date(mantenimiento.fecha_entrega).toLocaleDateString('es-CO') : 'Pendiente'}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        <span className="font-medium">Técnico:</span> {mantenimiento.tecnico?.nombre || 'Sin asignar'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Costos</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-900 dark:text-white">
                        <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                        Servicios: ${parseFloat(mantenimiento.servicios?.reduce((sum, s) => sum + parseFloat(s.precio || 0), 0) || 0).toLocaleString('es-CO')}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                        Repuestos: ${parseFloat(mantenimiento.repuestos?.reduce((sum, r) => sum + parseFloat(r.subtotal || 0), 0) || 0).toLocaleString('es-CO')}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                        Adicional: ${parseFloat(mantenimiento.costo_adicional || 0).toLocaleString('es-CO')}
                      </p>
                      <p className="font-bold text-green-600 dark:text-green-400">
                        Total: ${parseFloat(mantenimiento.total || 0).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>

                {mantenimiento.servicios?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <FontAwesomeIcon icon={faWrench} className="mr-1" />
                      Servicios realizados
                    </h4>
                    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Servicio</th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Precio</th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Observaciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {mantenimiento.servicios.map((servicio, idx) => (
                            <tr key={idx} className="bg-white dark:bg-gray-800">
                              <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-white">{servicio.servicio}</td>
                              <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-white">${parseFloat(servicio.precio).toLocaleString('es-CO')}</td>
                              <td className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400">{servicio.observaciones || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {mantenimiento.repuestos?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <FontAwesomeIcon icon={faBox} className="mr-1" />
                      Repuestos utilizados
                    </h4>
                    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Producto</th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Cantidad</th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">P. Unitario</th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {mantenimiento.repuestos.map((repuesto, idx) => (
                            <tr key={idx} className="bg-white dark:bg-gray-800">
                              <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-white">{repuesto.producto}</td>
                              <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-white">{repuesto.cantidad}</td>
                              <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-white">${parseFloat(repuesto.precio_unitario).toLocaleString('es-CO')}</td>
                              <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-white">${parseFloat(repuesto.subtotal).toLocaleString('es-CO')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TablaMantenimientosDetalle;