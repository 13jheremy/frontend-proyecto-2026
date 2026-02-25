// src/components/ui/DataTable.jsx
// Standardized data table component for CRUD operations

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSort, 
  faSortUp, 
  faSortDown,
  faCheckSquare,
  faSquare,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';
import StatusBadge from './StatusBadge';
import BulkActions from './BulkActions';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  // Selection
  selectable = false,
  selectedItems = [],
  onItemSelect,
  onSelectAll,
  onClearSelection,
  // Sorting
  sortable = true,
  sortField = null,
  sortDirection = 'asc',
  onSort,
  // Actions
  actions = [],
  onAction,
  // Bulk actions
  bulkActions = [],
  onBulkAction,
  // Styling
  className = '',
  rowClassName = '',
  // Empty state
  emptyMessage = 'No hay datos disponibles',
  // Loading
  loadingRows = 5
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (field) => {
    if (!sortable || !onSort) return;
    
    let direction = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    onSort(field, direction);
  };

  const handleRowSelect = (item) => {
    if (!selectable || !onItemSelect) return;
    onItemSelect(item.id);
  };

  const handleSelectAll = () => {
    if (!selectable || !onSelectAll) return;
    onSelectAll();
  };

  const isSelected = (itemId) => {
    return selectedItems.includes(itemId);
  };

  const allSelected = data.length > 0 && selectedItems.length === data.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < data.length;

  // Render sort icon
  const renderSortIcon = (field) => {
    if (!sortable) return null;
    
    if (sortField === field) {
      return (
        <FontAwesomeIcon 
          icon={sortDirection === 'asc' ? faSortUp : faSortDown}
          className="ml-1 text-gray-400"
        />
      );
    }
    return (
      <FontAwesomeIcon 
        icon={faSort}
        className="ml-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    );
  };

  // Render cell content
  const renderCell = (item, column) => {
    const value = column.accessor ? item[column.accessor] : null;

    // Custom render function
    if (column.render) {
      return column.render(value, item);
    }

    // Status badge
    if (column.type === 'status') {
      return (
        <StatusBadge 
          status={value} 
          type={column.statusType || 'active'}
          size="sm"
        />
      );
    }

    // Boolean values
    if (column.type === 'boolean') {
      return (
        <StatusBadge 
          status={value} 
          type="active"
          size="sm"
        />
      );
    }

    // Date values
    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString() : '-';
    }

    // DateTime values
    if (column.type === 'datetime') {
      return value ? new Date(value).toLocaleString() : '-';
    }

    // Currency values
    if (column.type === 'currency') {
      return value ? `Bs. ${parseFloat(value).toFixed(2)}` : '-';
    }

    // Number values
    if (column.type === 'number') {
      return value !== null && value !== undefined ? value.toLocaleString() : '-';
    }

    // Default string value
    return value || '-';
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => {
    return Array.from({ length: loadingRows }).map((_, index) => (
      <tr key={`loading-${index}`} className="animate-pulse">
        {selectable && (
          <td className="px-6 py-4">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </td>
        )}
        {columns.map((column, colIndex) => (
          <td key={colIndex} className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </td>
        ))}
        {actions.length > 0 && (
          <td className="px-6 py-4">
            <div className="flex space-x-2">
              {actions.map((_, actionIndex) => (
                <div key={actionIndex} className="h-8 w-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </td>
        )}
      </tr>
    ));
  };

  // Empty state
  const renderEmptyState = () => {
    return (
      <tr>
        <td 
          colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
          className="px-6 py-12 text-center"
        >
          <div className="text-gray-500 dark:text-gray-400">
            {error ? (
              <div className="text-red-500">
                <p className="font-medium">Error al cargar los datos</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : (
              <p>{emptyMessage}</p>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden ${className}`}>
      {/* Bulk Actions */}
      {selectable && bulkActions.length > 0 && (
        <BulkActions
          selectedItems={selectedItems}
          totalItems={data.length}
          onSelectAll={handleSelectAll}
          onClearSelection={onClearSelection}
          onBulkAction={onBulkAction}
          availableActions={bulkActions}
          loading={loading}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {/* Select All Checkbox */}
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FontAwesomeIcon 
                      icon={allSelected ? faCheckSquare : someSelected ? faCheckSquare : faSquare}
                      className={someSelected ? 'text-blue-600' : ''}
                    />
                  </button>
                </th>
              )}

              {/* Column Headers */}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    sortable && column.sortable !== false ? 'cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-600' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.accessor)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable !== false && renderSortIcon(column.accessor)}
                  </div>
                </th>
              ))}

              {/* Actions Header */}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              renderLoadingSkeleton()
            ) : data.length === 0 ? (
              renderEmptyState()
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isSelected(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${rowClassName}`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Selection Checkbox */}
                  {selectable && (
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleRowSelect(item)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <FontAwesomeIcon 
                          icon={isSelected(item.id) ? faCheckSquare : faSquare}
                          className={isSelected(item.id) ? 'text-blue-600' : ''}
                        />
                      </button>
                    </td>
                  )}

                  {/* Data Cells */}
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        column.className || 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}

                  {/* Action Buttons */}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {actions.map((action, actionIndex) => (
                          <ActionButton
                            key={actionIndex}
                            action={action.type || action}
                            onClick={() => onAction(action.type || action, item)}
                            disabled={loading || (action.disabled && action.disabled(item))}
                            tooltip={action.tooltip}
                            size="sm"
                          />
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
