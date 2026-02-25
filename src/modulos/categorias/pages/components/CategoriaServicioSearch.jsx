// src/modulos/servicios/pages/components/CategoriaServicioSearch.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes, faCheckCircle, faBan } from '@fortawesome/free-solid-svg-icons';

/**
 * Componente de búsqueda y filtros para servicios de categoría.
 */
const CategoriaServicioSearch = ({ onSearch, initialFilters = {}, categoriasDisponibles }) => {
  const [filters, setFilters] = useState({
    search: '', // Búsqueda por nombre_servicio, descripcion_servicio
    categoria_id: '', // Filtrar por categoría
    activo: '', // 'true', 'false', '' (todos)
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearch = useCallback(
    debounce((searchFilters) => {
      onSearch(searchFilters);
    }, 300),
    [onSearch]
  );

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  useEffect(() => {
    const searchFilters = Object.keys(filters).reduce((acc, key) => {
      const value = filters[key];
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    debouncedSearch(searchFilters);
  }, [filters, debouncedSearch]);

  const handleInputChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', categoria_id: '', activo: '' });
    setShowAdvanced(false);
  };

  const hasActiveFilters = filters.search || filters.categoria_id || filters.activo;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o descripción del servicio..."
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`inline-flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            showAdvanced || hasActiveFilters
              ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-600'
              : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <FontAwesomeIcon icon={faFilter} className="mr-2 h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">
              {[filters.search, filters.categoria_id, filters.activo].filter(f => f && f !== '').length}
            </span>
          )}
        </button>
      </div>

      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={filters.categoria_id}
                onChange={(e) => handleInputChange('categoria_id', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todas las categorías</option>
                {categoriasDisponibles.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={filters.activo}
                onChange={(e) => handleInputChange('activo', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {hasActiveFilters && !showAdvanced && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
              <FontAwesomeIcon icon={faSearch} className="mr-1 h-3 w-3" />
              "{filters.search}"
              <button
                onClick={() => handleInputChange('search', '')}
                className="ml-2 h-4 w-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.categoria_id && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
              Categoría: {categoriasDisponibles.find(cat => cat.id === parseInt(filters.categoria_id))?.nombre || 'N/A'}
              <button
                onClick={() => handleInputChange('categoria_id', '')}
                className="ml-2 h-4 w-4 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.activo === 'true' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1 h-3 w-3" />
              Activos
              <button
                onClick={() => handleInputChange('activo', '')}
                className="ml-2 h-4 w-4 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.activo === 'false' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
              <FontAwesomeIcon icon={faBan} className="mr-1 h-3 w-3" />
              Inactivos
              <button
                onClick={() => handleInputChange('activo', '')}
                className="ml-2 h-4 w-4 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
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

export default CategoriaServicioSearch;
