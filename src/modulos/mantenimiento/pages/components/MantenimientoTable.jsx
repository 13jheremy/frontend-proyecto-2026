// src/modulos/mantenimiento/pages/components/MantenimientoTable.jsx
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faInfoCircle, 
  faTrash, 
  faTrashRestore, 
  faSpinner,
  faMotorcycle,
  faUser,
  faTools,
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faBan,
  faExclamationTriangle,
  faSyncAlt,
  faSearch,
  faFilter,
  faFileExport,
  faEllipsisV,
  faSort,
  faSortUp,
  faSortDown,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import debounce from 'lodash/debounce';

/**
 * Componente tabla para mostrar mantenimientos con funcionalidades completas.
 */
const MantenimientoTable = ({
  mantenimientos = [],
  permissions = {},
  onEdit,
  onSoftDelete,
  onHardDelete,
  onRestore,
  onToggleActivo,
  onInfo,
  onChangeStatus,
  loading = false,
  motosDisponibles = [],
  className = ''
}) => {
  // Extraer permisos con valores por defecto
  const { canEdit = false, canDelete = false, canRestore = false, canChangeStatus = false, canAddObservations = false } = permissions || {};
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_ingreso', direction: 'desc' });
  const [filters, setFilters] = useState({
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    eliminados: false,
  });

  // Mostrar loading
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Cargando mantenimientos...
      </div>
    );
  }

  // Mostrar mensaje si no hay datos
  if (!mantenimientos || mantenimientos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <FontAwesomeIcon icon={faTools} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron mantenimientos.
        </h3>
      </div>
    );
  }

  // Obtener el estado del mantenimiento
  const getStatusBadge = (mantenimiento) => {
    if (mantenimiento.eliminado) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
          Eliminado
        </span>
      );
    }

    switch(mantenimiento.estado.toLowerCase()) {
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
            <FontAwesomeIcon icon={faTools} className="mr-1 h-3 w-3" />
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
      case 'cancelado':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <FontAwesomeIcon icon={faBan} className="mr-1 h-3 w-3" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 h-3 w-3" />
            Desconocido
          </span>
        );
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PPp', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };
  

  // Filtrar y ordenar mantenimientos
  const filteredMantenimientos = useMemo(() => {
    if (!mantenimientos) return [];
    
    let result = [...mantenimientos];
    
    // Aplicar filtros
    if (filters.estado) {
      result = result.filter(m => m.estado === filters.estado);
    }
    
    if (filters.fecha_desde) {
      const fechaDesde = new Date(filters.fecha_desde);
      result = result.filter(m => new Date(m.fecha_ingreso) >= fechaDesde);
    }
    
    if (filters.fecha_hasta) {
      const fechaHasta = new Date(filters.fecha_hasta);
      fechaHasta.setHours(23, 59, 59, 999); // Fin del día
      result = result.filter(m => new Date(m.fecha_ingreso) <= fechaHasta);
    }
    
    if (filters.eliminados !== undefined) {
      result = result.filter(m => m.eliminado === filters.eliminados);
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m => 
        (m.moto?.marca?.toLowerCase().includes(term)) ||
        (m.moto?.modelo?.toLowerCase().includes(term)) ||
        (m.moto?.placa?.toLowerCase().includes(term)) ||
        (m.descripcion_problema?.toLowerCase().includes(term)) ||
        (m.diagnostico?.toLowerCase().includes(term)) ||
        (m.moto?.propietario?.nombre?.toLowerCase().includes(term)) ||
        (m.moto?.propietario?.apellido?.toLowerCase().includes(term))
      );
    }
    
    // Aplicar ordenación
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Manejar ordenación de objetos anidados
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aValue = keys.reduce((obj, key) => obj?.[key], a);
          bValue = keys.reduce((obj, key) => obj?.[key], b);
        }
        
        // Manejar fechas
        if (sortConfig.key.includes('fecha') || sortConfig.key.includes('created') || sortConfig.key.includes('updated')) {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        // Comparar valores
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [mantenimientos, filters, searchTerm, sortConfig]);
  
  // Manejar cambio de ordenación
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Renderizar ícono de ordenación
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} className="ml-1 text-blue-500" /> 
      : <FontAwesomeIcon icon={faSortDown} className="ml-1 text-blue-500" />;
  };
  
  // Manejar búsqueda con debounce
  const handleSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);
  
  // Manejar cambio de filtros
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      estado: '',
      fecha_desde: '',
      fecha_hasta: '',
      eliminados: false,
    });
    setSearchTerm('');
  };
  // Helper functions
  const getMotoNombre = (moto) => {
    if (!moto) return 'Sin moto';
    return `${moto.marca || ''} ${moto.modelo || ''} ${moto.placa ? `(${moto.placa})` : ''}`.trim();
  };

  const getPropietarioNombre = (propietario) => {
    if (!propietario) return 'Sin propietario';
    return `${propietario.nombre || ''} ${propietario.apellido || ''}`.trim() || 'Sin nombre';
  };

  const formatPrecioMantenimiento = (precio) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(precio || 0);
  };

  const getEstadoMantenimientoNombre = (estado) => {
    if (!estado) return 'Desconocido';
    return estado
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const getEstadoMantenimientoIcon = (estado) => {
    switch (estado) {
      case 'completado':
        return <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />;
      case 'cancelado':
        return <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />;
      case 'en_proceso':
        return <FontAwesomeIcon icon={faSyncAlt} className="mr-1 animate-spin" />;
      case 'pendiente':
        return <FontAwesomeIcon icon={faClock} className="mr-1" />;
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />;
    }
  };

  // Permisos ya extraídos al inicio del componente
  
  // Verificar si hay mantenimientos eliminados para mostrar la pestaña de eliminados
  const hasEliminados = mantenimientos.some(m => m.eliminado);
  
  // Mostrar loading state
  if (loading && mantenimientos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Cargando mantenimientos</h3>
          <p className="text-gray-500 dark:text-gray-400">Por favor, espera un momento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
      {/* Header con búsqueda y acciones */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Mantenimientos</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filteredMantenimientos.length} {filteredMantenimientos.length === 1 ? 'registro' : 'registros'} encontrados
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar mantenimientos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            title="Actualizar"
            disabled={loading}
          >
            <FontAwesomeIcon 
              icon={loading ? faSpinner : faSyncAlt} 
              className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} 
            />
          </button>
          
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className="inline-flex justify-center items-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                id="export-menu"
                aria-expanded="true"
                aria-haspopup="true"
                disabled={loading || filteredMantenimientos.length === 0}
              >
                <FontAwesomeIcon icon={faFileExport} className="h-4 w-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabla de mantenimientos */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Fecha Ingreso
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Moto
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Propietario
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Problema
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Estado
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredMantenimientos.map((mantenimiento) => (
              <tr 
                key={mantenimiento.id}
                className={`${mantenimiento.eliminado ? 'bg-gray-50 dark:bg-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200">
                      <FontAwesomeIcon icon={faCalendarAlt} className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(mantenimiento.fecha_ingreso)}
                      </div>
                      {mantenimiento.fecha_salida && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Salida: {formatDate(mantenimiento.fecha_salida)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200">
                      <FontAwesomeIcon icon={faMotorcycle} className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {mantenimiento.moto?.marca} {mantenimiento.moto?.modelo}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Placa: {mantenimiento.moto?.placa || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {mantenimiento.moto?.propietario?.nombre || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {mantenimiento.moto?.propietario?.telefono || ''}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white font-medium line-clamp-2">
                    {mantenimiento.descripcion_problema || 'Sin descripción'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getEstadoMantenimientoIcon(mantenimiento.estado)}
                  <span className={`ml-2 text-sm font-medium ${mantenimiento.estado === 'completado' ? 'text-green-600 dark:text-green-400' : mantenimiento.estado === 'cancelado' ? 'text-red-600 dark:text-red-400' : mantenimiento.estado === 'pendiente' ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {getEstadoMantenimientoNombre(mantenimiento.estado)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => onInfo && onInfo(mantenimiento)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-full"
                      title="Ver detalles"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
                    </button>

                    {!mantenimiento.eliminado && onChangeStatus && canChangeStatus && (
                      <button
                        onClick={() => onChangeStatus(mantenimiento)}
                        className="p-2 text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/50 rounded-full"
                        title="Cambiar estado"
                      >
                        <FontAwesomeIcon icon={faSyncAlt} className="h-4 w-4" />
                      </button>
                    )}

                    {!mantenimiento.eliminado && (
                      <>
                        {onEdit && canEdit && (
                          <button
                            onClick={() => onEdit(mantenimiento)}
                            className="p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50 rounded-full"
                            title="Editar mantenimiento"
                          >
                            <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                          </button>
                        )}
                        
                        {onSoftDelete && canDelete && (
                          <button
                            onClick={() => onSoftDelete(mantenimiento.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full"
                            title="Eliminar mantenimiento"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                    
                    {mantenimiento.eliminado && onRestore && canRestore && (
                      <button
                        onClick={() => onRestore(mantenimiento.id)}
                        className="p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50 rounded-full"
                        title="Restaurar mantenimiento"
                      >
                        <FontAwesomeIcon icon={faTrashRestore} className="h-4 w-4" />
                      </button>
                    )}
                    
                    {mantenimiento.eliminado && onHardDelete && canDelete && (
                      <button
                        onClick={() => onHardDelete(mantenimiento.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full"
                        title="Eliminar permanentemente"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginación simplificada */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div className="flex-1 flex justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando <span className="font-medium">{filteredMantenimientos.length}</span> registros
          </p>
        </div>
      </div>
      
      {/* Loading overlay */}
      {loading && mantenimientos.length > 0 && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-b-lg">
          <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-3"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Actualizando mantenimientos...</span>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Por favor, espera un momento</p>
          </div>
        </div>
      )}
    </div>
  );
};

MantenimientoTable.propTypes = {
  // Array de mantenimientos a mostrar en la tabla
  mantenimientos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      fecha_ingreso: PropTypes.string.isRequired,
      fecha_salida: PropTypes.string,
      descripcion_problema: PropTypes.string,
      diagnostico: PropTypes.string,
      estado: PropTypes.string.isRequired,
      eliminado: PropTypes.bool,
      moto: PropTypes.shape({
        id: PropTypes.number.isRequired,
        marca: PropTypes.string.isRequired,
        modelo: PropTypes.string.isRequired,
        placa: PropTypes.string,
        propietario: PropTypes.shape({
          id: PropTypes.number.isRequired,
          nombre: PropTypes.string.isRequired,
          telefono: PropTypes.string,
          email: PropTypes.string,
        }),
      }),
      creado_por: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
      }),
      actualizado_por: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
      }),
      created_at: PropTypes.string.isRequired,
      updated_at: PropTypes.string.isRequired,
      kilometraje_ingreso: PropTypes.number,
      kilometraje_salida: PropTypes.number,
      costo_estimado: PropTypes.number,
      costo_real: PropTypes.number,
      observaciones: PropTypes.string,
    })
  ),
  
  // Permisos del usuario actual
  permissions: PropTypes.shape({
    canEdit: PropTypes.bool,
    canDelete: PropTypes.bool,
    canRestore: PropTypes.bool,
  }),
  
  // Handlers de eventos
  onEdit: PropTypes.func,
  onSoftDelete: PropTypes.func,
  onHardDelete: PropTypes.func,
  onRestore: PropTypes.func,
  onToggleActivo: PropTypes.func,
  onInfo: PropTypes.func,
  onChangeStatus: PropTypes.func,
  
  // Estados y configuraciones
  loading: PropTypes.bool,
  motosDisponibles: PropTypes.array,
  className: PropTypes.string,
};

MantenimientoTable.defaultProps = {
  mantenimientos: [],
  loading: false,
  permissions: {
    canEdit: false,
    canDelete: false,
    canRestore: false,
  },
  motosDisponibles: [],
  onEdit: undefined,
  onDelete: undefined,
  onRestore: undefined,
  onInfo: undefined,
  onHardDelete: undefined,
  onCrearRecordatorio: undefined,
  onRefresh: undefined,
  onExport: undefined,
};

// Componente de carga para el botón de exportación diferida
const ExportButton = React.lazy(() => 
  import('./ExportButton').catch(() => ({ default: () => 'Error al cargar' }))
);

export default MantenimientoTable;

// Exportar con memo para optimización de rendimiento
export const MemoizedMantenimientoTable = React.memo(MantenimientoTable);