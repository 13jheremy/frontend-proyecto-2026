// src/modulos/reportes/pages/components/ReporteVentasForm.jsx
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faChartLine, faFilePdf, faFileExport, faDownload, faSearch } from '@fortawesome/free-solid-svg-icons';

const ReporteVentasForm = ({ onGenerate, loading = false }) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [error, setError] = useState('');

  useEffect(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const toISO = (d) => d.toISOString().slice(0, 10);
    setFechaInicio((prev) => prev || toISO(start));
    setFechaFin((prev) => prev || toISO(today));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!fechaInicio || !fechaFin) {
      setError('Selecciona ambas fechas');
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('Fecha inicio no puede ser mayor que fin');
      return;
    }
    onGenerate({ fecha_inicio: fechaInicio, fecha_fin: fechaFin, formato: 'json', group_by: groupBy });
  };

  const generateFormat = (formato) => {
    if (!fechaInicio || !fechaFin) {
      setError('Selecciona ambas fechas');
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('Fecha inicio no puede ser mayor que fin');
      return;
    }
    onGenerate({ fecha_inicio: fechaInicio, fecha_fin: fechaFin, formato, group_by: groupBy });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-end gap-4">
          {/* Fecha inicio */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
              Inicio
            </label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Fecha fin */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
              Fin
            </label>
            <input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)} 
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Agrupar por */}
          <div className="min-w-[100px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              <FontAwesomeIcon icon={faChartLine} className="mr-1" />
              Agrupar
            </label>
            <select 
              value={groupBy} 
              onChange={(e) => setGroupBy(e.target.value)} 
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="day">Día</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
            </select>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => generateFormat('pdf')}
              disabled={loading}
              className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
            >
              <FontAwesomeIcon icon={faFilePdf} className="mr-1" />
              PDF
            </button>
            <button 
              type="button"
              onClick={() => generateFormat('json')}
              disabled={loading}
              className="px-3 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-lg focus:ring-2 focus:ring-slate-500 disabled:opacity-50 transition-colors"
            >
              <FontAwesomeIcon icon={faFileExport} className="mr-1" />
              JSON
            </button>
            <button 
              type="button"
              onClick={() => generateFormat('csv')}
              disabled={loading}
              className="px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-1" />
              CSV
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              <FontAwesomeIcon icon={faSearch} className={`mr-1 ${loading ? 'animate-pulse' : ''}`} />
              Ver
            </button>
          </div>
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
};

export default ReporteVentasForm;
