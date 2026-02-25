// src/modulos/reportes/pages/components/ReportCard.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faDownload, faFileExport } from '@fortawesome/free-solid-svg-icons';

const ReportCard = ({ 
  title, 
  icon, 
  iconColor, 
  iconBgColor, 
  onRefresh, 
  onExportJSON, 
  onExportCSV, 
  loading = false, 
  canExport = false, 
  children,
  className = ""
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-[500px] ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 ${iconBgColor} rounded-lg`}>
              <FontAwesomeIcon 
                icon={icon} 
                className={`text-lg ${iconColor}`} 
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={onRefresh} 
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon 
                icon={faSync} 
                className={`mr-2 ${loading ? 'animate-spin' : ''}`} 
              />
              Actualizar
            </button>
            
            {canExport && onExportJSON && (
              <button 
                onClick={onExportJSON} 
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200" 
                title="Descargar JSON"
              >
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                JSON
              </button>
            )}
            
            {canExport && onExportCSV && (
              <button 
                onClick={onExportCSV} 
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200" 
                title="Descargar CSV"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                CSV
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default ReportCard;
