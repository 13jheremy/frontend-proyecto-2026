// src/modules/servicios/components/ServicioSearch.jsx
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes, faCog } from '@fortawesome/free-solid-svg-icons';

const ServicioSearch = ({ filters, setFilters, onSearch, categorias }) => {
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

  const handleCategoriaChange = (categoriaId) => {
    const currentCategorias = filters.categorias || [];
    let newCategorias;

    if (currentCategorias.includes(Number(categoriaId))) {
      newCategorias = currentCategorias.filter(id => id !== Number(categoriaId));
    } else {
      newCategorias = [...currentCategorias, Number(categoriaId)];
    }

    const newFilters = { ...filters, categorias: newCategorias };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Campo de búsqueda principal */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
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
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            {showAdvanced ? 'Ocultar' : 'Filtros'}
          </button>
        </div>

        {/* Botón para limpiar todos los filtros */}
        <div className="col-span-1">
          <button
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Sección de filtros avanzados */}
      {showAdvanced && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Filtro por Estado del servicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado del Servicio
              </label>
              <select
                value={filters?.activo !== undefined ? String(filters.activo) : ''}
                onChange={(e) => handleInputChange('activo', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
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
              </select>
            </div>

            {/* Filtro por Precio (Desde) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio Desde (Bs)
              </label>
              <input
                type="number"
                value={filters?.precio_desde || ''}
                onChange={(e) => handleInputChange('precio_desde', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Filtro por Precio (Hasta) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio Hasta (Bs)
              </label>
              <input
                type="number"
                value={filters?.precio_hasta || ''}
                onChange={(e) => handleInputChange('precio_hasta', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Filtro por Duración (Desde) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duración Desde (min)
              </label>
              <input
                type="number"
                value={filters?.duracion_desde || ''}
                onChange={(e) => handleInputChange('duracion_desde', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Filtro por Duración (Hasta) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duración Hasta (min)
              </label>
              <input
                type="number"
                value={filters?.duracion_hasta || ''}
                onChange={(e) => handleInputChange('duracion_hasta', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Filtro por categorías (checkboxes) */}
          {categorias && categorias.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <FontAwesomeIcon icon={faCog} className="mr-2" />
                Filtrar por Categorías
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categorias.map((categoria) => (
                  <div key={categoria.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`categoria-filter-${categoria.id}`}
                      checked={filters?.categorias?.includes(categoria.id) || false}
                      onChange={() => handleCategoriaChange(categoria.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:bg-gray-600"
                    />
                    <label
                      htmlFor={`categoria-filter-${categoria.id}`}
                      className="ml-2 text-sm text-gray-900 dark:text-gray-300 cursor-pointer"
                    >
                      {categoria.nombre}
                    </label>
                  </div>
                ))}
              </div>
              {filters?.categorias && filters.categorias.length > 0 && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  {filters.categorias.length} categoría(s) seleccionada(s)
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ServicioSearch.propTypes = {
  filters: PropTypes.object,
  setFilters: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  categorias: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ),
};

ServicioSearch.defaultProps = {
  categorias: [],
};

export default ServicioSearch;