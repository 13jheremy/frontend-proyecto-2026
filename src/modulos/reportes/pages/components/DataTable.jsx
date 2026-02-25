// src/modulos/reportes/pages/components/DataTable.jsx
import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const DataTable = ({ 
  columns, 
  rows, 
  searchable = true, 
  pageSize = 10, 
  className = "",
  title = "",
  showPagination = true 
}) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query) return rows || [];
    const q = query.toLowerCase();
    return (rows || []).filter((r) =>
      Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil((filtered.length || 0) / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {/* Header */}
      {(title || searchable) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {searchable && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="h-4 w-4 text-gray-400" 
                  />
                </div>
                <input
                  value={query}
                  onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                  placeholder="Buscar en la tabla..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {columns.map((c) => (
                <th 
                  key={c.key} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {pageRows.map((r, idx) => (
              <tr 
                key={idx} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                {columns.map((c) => (
                  <td 
                    key={c.key} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {c.render ? c.render(r[c.key], r) : String(r[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">No hay datos disponibles</p>
                    <p className="text-sm">No se encontraron registros para mostrar</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && filtered.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                Mostrando <span className="font-bold">{((page - 1) * pageSize) + 1}</span> a{' '}
                <span className="font-bold">{Math.min(page * pageSize, filtered.length)}</span> de{' '}
                <span className="font-bold">{filtered.length}</span> resultados
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="relative inline-flex items-center px-4 py-2 border-2 border-blue-300 dark:border-blue-600 text-sm font-semibold rounded-lg text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-400 dark:hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 transition-all duration-200 shadow-sm"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4 mr-2" />
                Anterior
              </button>
              <div className="flex items-center bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md">
                <span className="text-sm font-bold">
                  Página <span className="text-lg">{page}</span> de{' '}
                  <span className="text-lg">{totalPages}</span>
                </span>
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="relative inline-flex items-center px-4 py-2 border-2 border-blue-300 dark:border-blue-600 text-sm font-semibold rounded-lg text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-400 dark:hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 transition-all duration-200 shadow-sm"
              >
                Siguiente
                <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;


