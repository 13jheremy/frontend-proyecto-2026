// src/components/ui/DataManager.jsx
// Comprehensive data management component that integrates ViewModeSelector, DataTable, and ActionButtons

import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faPlus, 
  faRefresh,
  faFilter,
  faDownload,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import ViewModeSelector from './ViewModeSelector';
import DataTable from './DataTable';
import ActionButtons, { ActionButtonsPresets } from './ActionButtons';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import BulkActions from './BulkActions';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

const DataManager = ({
  // Data
  data = [],
  loading = false,
  error = null,
  stats = null,
  
  // Service integration
  service,
  
  // Table configuration
  columns = [],
  
  // Actions configuration
  actions = {
    view: true,
    edit: true,
    delete: true,
    activate: true,
    restore: true,
    hardDelete: false
  },
  
  // Permissions
  permissions = ActionButtonsPresets.basic.permissions,
  
  // View modes
  viewModes = ['active', 'inactive', 'deleted', 'all'],
  defaultViewMode = 'active',
  
  // Search and filters
  searchable = true,
  searchPlaceholder = 'Buscar...',
  filters = [],
  
  // Bulk operations
  bulkActions = [],
  selectable = false,
  
  // Callbacks
  onAdd,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onRestore,
  onHardDelete,
  onRefresh,
  onExport,
  onImport,
  
  // Styling
  className = '',
  title = '',
  
  // Additional features
  showStats = true,
  showSearch = true,
  showFilters = true,
  showBulkActions = true,
  showAddButton = true,
  showRefreshButton = true,
  showExportButton = false,
  showImportButton = false
}) => {
  // State management
  const [currentViewMode, setCurrentViewMode] = useState(defaultViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter data based on view mode, search, and filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply view mode filter
    switch (currentViewMode) {
      case 'active':
        filtered = filtered.filter(item => item.activo === true && !item.eliminado && !item.deleted_at);
        break;
      case 'inactive':
        filtered = filtered.filter(item => item.activo === false && !item.eliminado && !item.deleted_at);
        break;
      case 'deleted':
        filtered = filtered.filter(item => item.eliminado === true || item.deleted_at);
        break;
      case 'all':
        // Show all items
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchQuery && searchable) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        return columns.some(column => {
          if (!column.searchable) return false;
          const value = column.accessor ? item[column.accessor] : '';
          return String(value).toLowerCase().includes(query);
        });
      });
    }

    // Apply custom filters
    Object.entries(selectedFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        const filter = filters.find(f => f.key === filterKey);
        if (filter && filter.apply) {
          filtered = filtered.filter(item => filter.apply(item, filterValue));
        }
      }
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        if (aValue < bValue) comparison = -1;
        
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [data, currentViewMode, searchQuery, selectedFilters, sortField, sortDirection, columns, filters]);

  // Enhanced columns with action buttons
  const enhancedColumns = useMemo(() => {
    const baseColumns = [...columns];
    
    // Add actions column if any actions are enabled
    const hasActions = Object.values(actions).some(action => action === true);
    if (hasActions) {
      baseColumns.push({
        header: 'Acciones',
        accessor: 'actions',
        sortable: false,
        className: 'text-right',
        render: (value, item) => (
          <ActionButtons
            item={item}
            onView={actions.view && onView ? () => onView(item) : null}
            onEdit={actions.edit && onEdit ? () => onEdit(item) : null}
            onDelete={actions.delete && onDelete ? () => onDelete(item.id) : null}
            onActivate={actions.activate && onActivate ? onActivate : null}
            onDeactivate={actions.activate && onDeactivate ? onDeactivate : null}
            onRestore={actions.restore && onRestore ? onRestore : null}
            onHardDelete={actions.hardDelete && onHardDelete ? onHardDelete : null}
            permissions={permissions}
            size="sm"
            variant="horizontal"
            showLabels={false}
          />
        )
      });
    }
    
    return baseColumns;
  }, [columns, actions, permissions, onView, onEdit, onDelete, onActivate, onDeactivate, onRestore, onHardDelete]);

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setCurrentViewMode(mode);
    setSelectedItems([]); // Clear selection when changing view mode
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // Handle sorting
  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Handle item selection
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map(item => item.id));
    }
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  // Handle bulk actions
  const handleBulkAction = async (actionType) => {
    if (selectedItems.length === 0) return;
    
    try {
      switch (actionType) {
        case 'activate':
          if (service && service.activateMultiple) {
            await service.activateMultiple(selectedItems);
          }
          break;
        case 'deactivate':
          if (service && service.deactivateMultiple) {
            await service.deactivateMultiple(selectedItems);
          }
          break;
        case 'delete':
          if (service && service.softDeleteMultiple) {
            await service.softDeleteMultiple(selectedItems);
          }
          break;
        case 'restore':
          if (service && service.restoreMultiple) {
            await service.restoreMultiple(selectedItems);
          }
          break;
        default:
          break;
      }
      
      setSelectedItems([]);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setSelectedItems([]);
    if (onRefresh) onRefresh();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Controls */}
      <div className="space-y-4">
        {/* View Mode Selector */}
        {showStats && viewModes.length > 1 && (
          <ViewModeSelector
            currentMode={currentViewMode}
            onModeChange={handleViewModeChange}
            stats={stats}
            className="mb-4"
          />
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Left side - Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            {showSearch && searchable && (
              <div className="relative flex-1 max-w-md">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            )}

            {/* Filters */}
            {showFilters && filters.length > 0 && (
              <div className="flex gap-2">
                {filters.map(filter => (
                  <Select
                    key={filter.key}
                    value={selectedFilters[filter.key] || 'all'}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="min-w-32"
                  >
                    <option value="all">Todos {filter.label}</option>
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex gap-2">
            {showRefreshButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                Actualizar
              </Button>
            )}

            {showExportButton && onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Exportar
              </Button>
            )}

            {showImportButton && onImport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onImport}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                Importar
              </Button>
            )}

            {showAddButton && onAdd && (
              <Button
                variant="primary"
                size="sm"
                onClick={onAdd}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Agregar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={enhancedColumns}
        loading={loading}
        error={error}
        selectable={selectable && showBulkActions}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelect}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        sortable={true}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        emptyMessage={`No hay ${title.toLowerCase() || 'elementos'} disponibles`}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default DataManager;
