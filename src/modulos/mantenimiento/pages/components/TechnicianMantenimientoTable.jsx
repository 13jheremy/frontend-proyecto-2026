// src/modulos/mantenimiento/pages/components/TechnicianMantenimientoTable.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faInfoCircle, 
  faSpinner,
  faMotorcycle,
  faUser,
  faTools,
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faSearch,
  faFileText,
  faWrench,
  faPlay,
  faStop,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente tabla especializado para técnicos - muestra solo mantenimientos asignados
 * con acciones específicas para técnicos (cambiar estado, agregar observaciones)
 */
const TechnicianMantenimientoTable = ({
  mantenimientos = [],
  permissions = {},
  onChangeStatus,
  onAddObservations,
  onInfo,
  loading = false,
  className = ''
}) => {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  // Extraer permisos específicos para técnicos
  const { canChangeStatus = false, canAddObservations = false } = permissions || {};

  // Filtrar mantenimientos según búsqueda y filtros
  const filteredMantenimientos = mantenimientos.filter(mantenimiento => {
    const matchesSearch = !searchTerm || 
      mantenimiento.moto_info?.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mantenimiento.cliente_info?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mantenimiento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = !filterEstado || mantenimiento.estado === filterEstado;
    
    return matchesSearch && matchesEstado && !mantenimiento.eliminado;
  });

  // Mostrar loading
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Cargando mis mantenimientos...
      </div>
    );
  }

  // Obtener el badge del estado
  const getStatusBadge = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'completado':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1 h-3 w-3" />
            Completado
          </span>
        );
      case 'en_proceso':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <FontAwesomeIcon icon={faWrench} className="mr-1 h-3 w-3" />
            En Proceso
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <FontAwesomeIcon icon={faClock} className="mr-1 h-3 w-3" />
            Pendiente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 h-3 w-3" />
            {estado}
          </span>
        );
    }
  };

  // Obtener botones de acción para cambiar estado
  const getStatusActionButtons = (mantenimiento) => {
    const buttons = [];
    
    if (canChangeStatus) {
      switch(mantenimiento.estado?.toLowerCase()) {
        case 'pendiente':
          buttons.push(
            <button
              key="iniciar"
              onClick={() => onChangeStatus(mantenimiento.id, 'en_proceso')}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
              title="Iniciar mantenimiento"
            >
              <FontAwesomeIcon icon={faPlay} className="h-4 w-4" />
            </button>
          );
          break;
        case 'en_proceso':
          buttons.push(
            <button
              key="completar"
              onClick={() => onChangeStatus(mantenimiento.id, 'completado')}
              className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
              title="Completar mantenimiento"
            >
              <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
            </button>
          );
          break;
      }
    }
    
    return buttons;
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header con búsqueda y filtros */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              <FontAwesomeIcon icon={faTools} className="mr-2 text-blue-600" />
              Mis Mantenimientos Asignados
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Gestiona los mantenimientos que tienes asignados
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Búsqueda */}
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" 
              />
              <input
                type="text"
                placeholder="Buscar por placa, cliente o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            {/* Filtro por estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {filteredMantenimientos.length === 0 ? (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            <FontAwesomeIcon icon={faTools} className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              {searchTerm || filterEstado ? 'No se encontraron mantenimientos' : 'No tienes mantenimientos asignados'}
            </h3>
            <p className="text-sm">
              {searchTerm || filterEstado ? 'Intenta ajustar los filtros de búsqueda' : 'Los mantenimientos aparecerán aquí cuando te sean asignados'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <FontAwesomeIcon icon={faMotorcycle} className="mr-2" />
                  Moto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <FontAwesomeIcon icon={faFileText} className="mr-2" />
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  Fecha Ingreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredMantenimientos.map((mantenimiento) => (
                <tr key={mantenimiento.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <FontAwesomeIcon icon={faMotorcycle} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {mantenimiento.moto_info?.placa || 'N/A'}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {mantenimiento.moto_info?.marca} {mantenimiento.moto_info?.modelo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {mantenimiento.cliente_info?.nombre || 'N/A'}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {mantenimiento.cliente_info?.telefono}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 dark:text-slate-100 max-w-xs truncate" title={mantenimiento.descripcion}>
                      {mantenimiento.descripcion || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {mantenimiento.fecha_ingreso ? 
                      format(parseISO(mantenimiento.fecha_ingreso), 'dd/MM/yyyy', { locale: es }) : 
                      'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(mantenimiento.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {/* Botón de información */}
                      <button
                        onClick={() => onInfo(mantenimiento)}
                        className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                        title="Ver detalles"
                      >
                        <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
                      </button>
                      
                      {/* Botones de cambio de estado */}
                      {getStatusActionButtons(mantenimiento)}
                      
                      {/* Botón de agregar observaciones */}
                      {canAddObservations && (
                        <button
                          onClick={() => onAddObservations(mantenimiento)}
                          className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                          title="Agregar observaciones"
                        >
                          <FontAwesomeIcon icon={faFileText} className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer con información */}
      {filteredMantenimientos.length > 0 && (
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>
              Mostrando {filteredMantenimientos.length} de {mantenimientos.length} mantenimientos
            </span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                Pendiente
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                En Proceso
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                Completado
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

TechnicianMantenimientoTable.propTypes = {
  mantenimientos: PropTypes.array,
  permissions: PropTypes.object,
  onChangeStatus: PropTypes.func,
  onAddObservations: PropTypes.func,
  onInfo: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default TechnicianMantenimientoTable;
