// src/modulos/mantenimiento/pages/components/MantenimientoSearch.jsx
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faTimes,
  faCheckCircle,
  faBan,
  faWrench,
  faCalendarAlt,
  faClock,
  faPlay,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const MantenimientoSearch = ({ filters = {}, setFilters, onSearch, motosDisponibles = [] }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedSearch = useCallback(
    debounce((searchFilters) => {
      onSearch(searchFilters);
    }, 300),
    [onSearch]
  );

  const handleInputChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    if (name === 'search') {
      debouncedSearch(newFilters);
    } else {
      onSearch(newFilters);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key] !== '' && filters[key] !== null && filters[key] !== undefined
  );

  // Obtener placas de motos disponibles para el filtro
  const placasDisponibles = motosDisponibles.map(moto => moto.placa).filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Campo de búsqueda principal */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por problema, diagnóstico, placa, propietario..."
              value={filters?.search || ''}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Botón para mostrar/ocultar filtros avanzados */}
        <div className="col-span-1">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              showAdvanced || hasActiveFilters
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            {showAdvanced ? 'Ocultar' : 'Filtros'}
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">
                {Object.keys(filters).filter(key => filters[key] && filters[key] !== '').length}
              </span>
            )}
          </button>
        </div>

        {/* Botón para limpiar todos los filtros */}
        <div className="col-span-1">
          <button
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Sección de filtros avanzados */}
      {showAdvanced && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Filtro por Estado del mantenimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faWrench} className="mr-2" />
                Estado del Mantenimiento
              </label>
              <select
                value={filters?.estado || ''}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Filtro por Estado de Eliminación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado de Eliminación
              </label>
              <select
                value={filters?.eliminado !== undefined ? String(filters.eliminado) : ''}
                onChange={(e) => handleInputChange('eliminado', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todos</option>
                <option value="false">No Eliminados</option>
                <option value="true">Eliminados Temporalmente</option>
                <option value="all">Incluir Eliminados</option>
              </select>
            </div>

            {/* Filtro por Placa de Moto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Placa de Moto
              </label>
              <select
                value={filters?.placa || ''}
                onChange={(e) => handleInputChange('placa', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todas las placas</option>
                {placasDisponibles.map(placa => (
                  <option key={placa} value={placa}>{placa}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Rango de Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Fecha de Mantenimiento
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  placeholder="Desde"
                  value={filters?.fecha_desde || ''}
                  onChange={(e) => handleInputChange('fecha_desde', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                <input
                  type="date"
                  placeholder="Hasta"
                  value={filters?.fecha_hasta || ''}
                  onChange={(e) => handleInputChange('fecha_hasta', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Filtro por Tipo de Problema */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                Tipo de Problema
              </label>
              <select
                value={filters?.tipo_problema || ''}
                onChange={(e) => handleInputChange('tipo_problema', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todos los tipos</option>
                <option value="mecanico">Mecánico</option>
                <option value="electrico">Eléctrico</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="emergencia">Emergencia</option>
              </select>
            </div>

            {/* Filtro por Propietario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Propietario
              </label>
              <input
                type="text"
                placeholder="Nombre del propietario"
                value={filters?.propietario_nombre || ''}
                onChange={(e) => handleInputChange('propietario_nombre', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            {/* Filtro por Costo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rango de Costo
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters?.costo_min || ''}
                  onChange={(e) => handleInputChange('costo_min', e.target.value)}
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters?.costo_max || ''}
                  onChange={(e) => handleInputChange('costo_max', e.target.value)}
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de filtros activos */}
      {hasActiveFilters && !showAdvanced && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
              <FontAwesomeIcon icon={faSearch} className="mr-1 h-3 w-3" />
              "{filters.search}"
              <button
                type="button"
                onClick={() => handleInputChange('search', '')}
                className="ml-2 h-4 w-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.estado === 'pendiente' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              <FontAwesomeIcon icon={faClock} className="mr-1 h-3 w-3" />
              Pendiente
              <button
                type="button"
                onClick={() => handleInputChange('estado', '')}
                className="ml-2 h-4 w-4 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.estado === 'en_progreso' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
              <FontAwesomeIcon icon={faPlay} className="mr-1 h-3 w-3" />
              En Progreso
              <button
                type="button"
                onClick={() => handleInputChange('estado', '')}
                className="ml-2 h-4 w-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.estado === 'completado' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1 h-3 w-3" />
              Completado
              <button
                type="button"
                onClick={() => handleInputChange('estado', '')}
                className="ml-2 h-4 w-4 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.estado === 'cancelado' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
              <FontAwesomeIcon icon={faBan} className="mr-1 h-3 w-3" />
              Cancelado
              <button
                type="button"
                onClick={() => handleInputChange('estado', '')}
                className="ml-2 h-4 w-4 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.placa && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
              Placa: {filters.placa}
              <button
                type="button"
                onClick={() => handleInputChange('placa', '')}
                className="ml-2 h-4 w-4 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.eliminado === 'true' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200">
              Eliminados
              <button
                type="button"
                onClick={() => handleInputChange('eliminado', '')}
                className="ml-2 h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

MantenimientoSearch.propTypes = {
  filters: PropTypes.object,
  setFilters: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  motosDisponibles: PropTypes.array
};

export default MantenimientoSearch;