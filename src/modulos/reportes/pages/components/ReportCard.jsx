// src/modulos/reportes/pages/components/ReportCard.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faDownload, faFileExport, faFilePdf } from '@fortawesome/free-solid-svg-icons';

const ReportCard = ({ 
  title, 
  icon, 
  iconColor, 
  iconBgColor, 
  onRefresh, 
  onExportPDF,
  onExportJSON, 
  onExportCSV, 
  loading = false, 
  canExport = false, 
  children,
  className = ""
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${iconBgColor} rounded-lg`}>
              <FontAwesomeIcon 
                icon={icon} 
                className={`text-lg ${iconColor}`} 
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onRefresh} 
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <FontAwesomeIcon 
                icon={faSync} 
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              />
            </button>
            
            {canExport && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 dark:border-gray-600">
                {onExportPDF && (
                  <button 
                    onClick={onExportPDF} 
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Exportar PDF"
                  >
                    <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4" />
                  </button>
                )}
                {onExportJSON && (
                  <button 
                    onClick={onExportJSON} 
                    className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/20 rounded-lg transition-colors"
                    title="Exportar JSON"
                  >
                    <FontAwesomeIcon icon={faFileExport} className="w-4 h-4" />
                  </button>
                )}
                {onExportCSV && (
                  <button 
                    onClick={onExportCSV} 
                    className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                    title="Exportar CSV"
                  >
                    <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default ReportCard;
