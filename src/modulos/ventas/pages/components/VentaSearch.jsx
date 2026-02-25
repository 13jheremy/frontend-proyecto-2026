// src/modulos/ventas/pages/components/VentaSearch.jsx
import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faFilter, faTimes, faCalendar, faDollarSign, faReceipt, faFileInvoiceDollar 
} from '@fortawesome/free-solid-svg-icons';

const VentaSearch = ({ onSearch, loading }) => {
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    metodo_pago: '',
    fecha_inicio: '',
    fecha_fin: '',
    monto_min: '',
    monto_max: '',
    eliminado: 'false'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedSearch = useCallback(
    debounce((searchFilters) => onSearch(searchFilters), 300),
    [onSearch]
  );

  const handleInputChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    debouncedSearch(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      estado: '',
      metodo_pago: '',
      fecha_inicio: '',
      fecha_fin: '',
      monto_min: '',
      monto_max: '',
      eliminado: 'false'
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const activeFilterCount = Object.keys(filters).filter(
    key => key !== 'eliminado' && filters[key] && filters[key] !== ''
  ).length + (filters.eliminado && filters.eliminado !== 'false' ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Main search input */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por ID, cliente, cédula..."
              value={filters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              disabled={loading}
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
          </div>
        </div>

        {/* Toggle advanced filters button */}
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
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Clear filters button */}
        <div className="col-span-1">
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faReceipt} className="mr-2" />
                Estado
              </label>
              <select
                value={filters.estado || ''}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todos los estados</option>
                <option value="completada">Completada</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                Método de Pago
              </label>
              <select
                value={filters.metodo_pago || ''}
                onChange={(e) => handleInputChange('metodo_pago', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Todos los métodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="credito">Crédito</option>
              </select>
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                Fecha Desde
              </label>
              <input
                type="date"
                value={filters.fecha_inicio || ''}
                onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.fecha_fin || ''}
                onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            {/* Monto Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                Monto Mínimo
              </label>
              <input
                type="number"
                placeholder="Mínimo"
                value={filters.monto_min || ''}
                onChange={(e) => handleInputChange('monto_min', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                min="0"
                step="0.01"
              />
            </div>

            {/* Monto Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                Monto Máximo
              </label>
              <input
                type="number"
                placeholder="Máximo"
                value={filters.monto_max || ''}
                onChange={(e) => handleInputChange('monto_max', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                min="0"
                step="0.01"
              />
            </div>

            {/* Estado de Eliminación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" />
                Mostrar
              </label>
              <select
                value={filters.eliminado || 'false'}
                onChange={(e) => handleInputChange('eliminado', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="false">Solo activos</option>
                <option value="true">Solo eliminados</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

VentaSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default VentaSearch;
