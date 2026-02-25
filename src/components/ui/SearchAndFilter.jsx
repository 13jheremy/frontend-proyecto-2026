// src/components/ui/SearchAndFilter.jsx
// Standardized search and filter component for CRUD operations

import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faTimes,
  faChevronDown,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash';

const SearchAndFilter = ({
  // Search
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  searchFields = [],
  
  // Filters
  filters = {},
  onFiltersChange,
  filterOptions = [],
  
  // Date filters
  dateFilters = [],
  
  // Quick filters
  quickFilters = [],
  
  // UI
  className = '',
  showAdvancedFilters = false,
  onToggleAdvancedFilters,
  
  // Reset
  onReset
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearchChange?.(value);
    }, 300),
    [onSearchChange]
  );

  useEffect(() => {
    debouncedSearch(localSearch);
    return () => {
      debouncedSearch.cancel();
    };
  }, [localSearch, debouncedSearch]);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    }
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleQuickFilter = (filter) => {
    const newFilters = { ...localFilters, ...filter.filters };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleReset = () => {
    setLocalSearch('');
    setLocalFilters({});
    onSearchChange?.('');
    onFiltersChange?.({});
    onReset?.();
  };

  const hasActiveFilters = Object.keys(localFilters).length > 0 || localSearch;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FontAwesomeIcon icon={faTimes} className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      {quickFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter, index) => (
            <button
              key={index}
              onClick={() => handleQuickFilter(filter)}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {filter.icon && (
                <FontAwesomeIcon icon={filter.icon} className="mr-1.5 h-3 w-3" />
              )}
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FontAwesomeIcon icon={faFilter} className="mr-2 h-4 w-4" />
          Filtros
          <FontAwesomeIcon 
            icon={faChevronDown} 
            className={`ml-2 h-3 w-3 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} 
          />
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {Object.keys(localFilters).length + (localSearch ? 1 : 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Select Filters */}
          {filterOptions.map((option, index) => (
            <div key={index} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {option.label}
              </label>
              <select
                value={localFilters[option.key] || ''}
                onChange={(e) => handleFilterChange(option.key, e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                {option.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Date Filters */}
          {dateFilters.map((dateFilter, index) => (
            <div key={index} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {dateFilter.label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={dateFilter.type || 'date'}
                  value={localFilters[dateFilter.key] || ''}
                  onChange={(e) => handleFilterChange(dateFilter.key, e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}

          {/* Boolean Filters */}
          {filterOptions.filter(opt => opt.type === 'boolean').map((option, index) => (
            <div key={index} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {option.label}
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={option.key}
                    value=""
                    checked={!localFilters[option.key]}
                    onChange={(e) => handleFilterChange(option.key, '')}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Todos</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={option.key}
                    value="true"
                    checked={localFilters[option.key] === 'true'}
                    onChange={(e) => handleFilterChange(option.key, 'true')}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={option.key}
                    value="false"
                    checked={localFilters[option.key] === 'false'}
                    onChange={(e) => handleFilterChange(option.key, 'false')}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">No</span>
                </label>
              </div>
            </div>
          ))}

          {/* Range Filters */}
          {filterOptions.filter(opt => opt.type === 'range').map((option, index) => (
            <div key={index} className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {option.label}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={localFilters[`${option.key}_min`] || ''}
                  onChange={(e) => handleFilterChange(`${option.key}_min`, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Máximo"
                  value={localFilters[`${option.key}_max`] || ''}
                  onChange={(e) => handleFilterChange(`${option.key}_max`, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
