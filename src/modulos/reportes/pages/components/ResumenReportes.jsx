// src/modulos/reportes/pages/components/ResumenReportes.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faShoppingCart, faReceipt, faChartLine } from '@fortawesome/free-solid-svg-icons';

const ResumenReportes = ({ resumen, titulo = 'Resumen del Reporte' }) => {
  if (!resumen) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value || 0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
        <FontAwesomeIcon icon={faChartLine} className="mr-2 text-blue-600" />
        {titulo}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {resumen.total_ventas !== undefined && (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
            <FontAwesomeIcon icon={faReceipt} className="text-blue-600 dark:text-blue-400 text-lg mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Ventas</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(resumen.total_ventas)}
            </p>
          </div>
        )}

        {resumen.total_ingresos !== undefined && (
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 dark:text-green-400 text-lg mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(resumen.total_ingresos)}
            </p>
          </div>
        )}

        {resumen.total_productos !== undefined && (
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
            <FontAwesomeIcon icon={faShoppingCart} className="text-purple-600 dark:text-purple-400 text-lg mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Productos</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatNumber(resumen.total_productos)}
            </p>
          </div>
        )}

        {resumen.total_clientes !== undefined && (
          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 text-center">
            <FontAwesomeIcon icon={faShoppingCart} className="text-orange-600 dark:text-orange-400 text-lg mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Clientes</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {formatNumber(resumen.total_clientes)}
            </p>
          </div>
        )}

        {resumen.total_stock !== undefined && (
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 text-center">
            <FontAwesomeIcon icon={faShoppingCart} className="text-amber-600 dark:text-amber-400 text-lg mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Stock Total</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatNumber(resumen.total_stock)}
            </p>
          </div>
        )}

        {resumen.valor_total_inventario !== undefined && (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3 text-center">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-emerald-600 dark:text-emerald-400 text-lg mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Valor Inventario</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(resumen.valor_total_inventario)}
            </p>
          </div>
        )}

        {resumen.promedio_por_cliente !== undefined && (
          <div className="bg-cyan-50 dark:bg-cyan-900/30 rounded-lg p-3 text-center">
            <FontAwesomeIcon icon={faChartLine} className="text-cyan-600 dark:text-cyan-400 text-lg mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Promedio/Cliente</p>
            <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
              {formatCurrency(resumen.promedio_por_cliente)}
            </p>
          </div>
        )}

        {resumen.productos_stock_bajo !== undefined && (
          <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 text-center">
            <FontAwesomeIcon icon={faShoppingCart} className="text-red-600 dark:text-red-400 text-lg mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Stock Bajo</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatNumber(resumen.productos_stock_bajo)}
            </p>
          </div>
        )}

        {resumen.total_mantenimientos !== undefined && (
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 text-center">
            <FontAwesomeIcon icon={faChartLine} className="text-amber-600 dark:text-amber-400 text-lg mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Mantenimientos</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatNumber(resumen.total_mantenimientos)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumenReportes;