// src/modulos/cliente/pages/components/ClienteMantenimientoTable.jsx
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faSpinner,
  faMotorcycle,
  faTools,
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faBan,
  faExclamationTriangle,
  faSyncAlt,
  faSearch,
  faSort,
  faSortUp,
  faSortDown
} from '@fortawesome/free-solid-svg-icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente tabla simplificado para mostrar mantenimientos de clientes.
 */
const ClienteMantenimientoTable = ({
  mantenimientos = [],
  onView,
  onRefresh,
  loading = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_ingreso', direction: 'desc' });

  // Función para obtener el ícono del estado
  const getEstadoIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
        return { icon: faCheckCircle, color: 'text-green-600 dark:text-green-400' };
      case 'en_proceso':
        return { icon: faClock, color: 'text-yellow-600 dark:text-yellow-400' };
      case 'pendiente':
        return { icon: faExclamationTriangle, color: 'text-orange-600 dark:text-orange-400' };
      case 'cancelado':
        return { icon: faBan, color: 'text-red-600 dark:text-red-400' };
      default:
        return { icon: faClock, color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  // Función para obtener el badge del estado
  const getEstadoBadge = (estado) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
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

  // Filtrar y ordenar mantenimientos
  const filteredAndSortedMantenimientos = useMemo(() => {
    let filtered = mantenimientos.filter(mantenimiento => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        mantenimiento.descripcion_problema?.toLowerCase().includes(searchLower) ||
        mantenimiento.diagnostico?.toLowerCase().includes(searchLower) ||
        mantenimiento.estado?.toLowerCase().includes(searchLower) ||
        mantenimiento.observaciones?.toLowerCase().includes(searchLower)
      );
    });

    // Ordenar
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Manejar fechas
        if (sortConfig.key.includes('fecha')) {
          aValue = aValue ? new Date(aValue) : new Date(0);
          bValue = bValue ? new Date(bValue) : new Date(0);
        }

        // Manejar números
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Manejar strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Manejar fechas
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [mantenimientos, searchTerm, sortConfig]);

  // Función para manejar ordenamiento
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return faSort;
    }
    return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
  };

  // Función para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return format(parseISO(fecha), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return fecha;
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm ${className}`}>
      {/* Header con búsqueda y refresh */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" 
            />
            <input
              type="text"
              placeholder="Buscar mantenimientos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            title="Actualizar"
            disabled={loading}
          >
            <FontAwesomeIcon 
              icon={loading ? faSpinner : faSyncAlt} 
              className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                onClick={() => handleSort('fecha_ingreso')}
              >
                <div className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faCalendarAlt} className="h-3 w-3" />
                  <span>Fecha Ingreso</span>
                  <FontAwesomeIcon icon={getSortIcon('fecha_ingreso')} className="h-3 w-3" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                onClick={() => handleSort('descripcion_problema')}
              >
                <div className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faTools} className="h-3 w-3" />
                  <span>Problema</span>
                  <FontAwesomeIcon icon={getSortIcon('descripcion_problema')} className="h-3 w-3" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                onClick={() => handleSort('estado')}
              >
                <div className="flex items-center space-x-1">
                  <span>Estado</span>
                  <FontAwesomeIcon icon={getSortIcon('estado')} className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                Fecha Salida
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                Costo
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center">
                  <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Cargando mantenimientos...</p>
                </td>
              </tr>
            ) : filteredAndSortedMantenimientos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center">
                  <FontAwesomeIcon icon={faMotorcycle} className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No se encontraron mantenimientos que coincidan con la búsqueda.' : 'No tienes mantenimientos registrados.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredAndSortedMantenimientos.map((mantenimiento) => {
                const estadoInfo = getEstadoIcon(mantenimiento.estado);
                return (
                  <tr key={mantenimiento.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatFecha(mantenimiento.fecha_ingreso)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        {mantenimiento.descripcion_problema || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={estadoInfo.icon} className={`h-4 w-4 ${estadoInfo.color}`} />
                        <span className={getEstadoBadge(mantenimiento.estado)}>
                          {mantenimiento.estado || 'Sin estado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-slate-100">
                        {formatFecha(mantenimiento.fecha_salida)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-slate-100">
                        {mantenimiento.costo_real 
                          ? `$${Number(mantenimiento.costo_real).toLocaleString()}`
                          : mantenimiento.costo_estimado 
                            ? `~$${Number(mantenimiento.costo_estimado).toLocaleString()}`
                            : '-'
                        }
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onView && onView(mantenimiento)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 
                                 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Ver detalles"
                      >
                        <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer con información */}
      {!loading && filteredAndSortedMantenimientos.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            Mostrando {filteredAndSortedMantenimientos.length} de {mantenimientos.length} mantenimientos
          </div>
        </div>
      )}
    </div>
  );
};

ClienteMantenimientoTable.propTypes = {
  mantenimientos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      fecha_ingreso: PropTypes.string.isRequired,
      fecha_salida: PropTypes.string,
      descripcion_problema: PropTypes.string,
      diagnostico: PropTypes.string,
      estado: PropTypes.string.isRequired,
      costo_estimado: PropTypes.number,
      costo_real: PropTypes.number,
      observaciones: PropTypes.string,
    })
  ).isRequired,
  onView: PropTypes.func,
  onRefresh: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

ClienteMantenimientoTable.defaultProps = {
  onView: null,
  onRefresh: null,
  loading: false,
  className: '',
};

export default ClienteMantenimientoTable;
