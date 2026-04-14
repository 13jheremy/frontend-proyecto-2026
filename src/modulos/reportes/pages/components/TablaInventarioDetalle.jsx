// src/modulos/reportes/pages/components/TablaInventarioDetalle.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faBox, faExclamationTriangle, faWarehouse } from '@fortawesome/free-solid-svg-icons';

const TablaInventarioDetalle = ({ productos = [] }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (productoId) => {
    setExpandedRows(prev => ({
      ...prev,
      [productoId]: !prev[productoId]
    }));
  };

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

  if (productos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FontAwesomeIcon icon={faBox} className="text-4xl mb-2 opacity-50" />
        <p>No hay productos en el inventario</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          <tr>
            <th className="px-2 py-2 text-left w-8"></th>
            <th className="px-2 py-2 text-left">Producto</th>
            <th className="px-2 py-2 text-left">Categoría</th>
            <th className="px-2 py-2 text-center">Proveedor</th>
            <th className="px-2 py-2 text-right">Stock</th>
            <th className="px-2 py-2 text-right">Mín.</th>
            <th className="px-2 py-2 text-right">P. Compra</th>
            <th className="px-2 py-2 text-right">P. Venta</th>
            <th className="px-2 py-2 text-right">Valor</th>
            <th className="px-2 py-2 text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <React.Fragment key={producto.producto_id}>
              <tr className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${producto.stock_bajo ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                <td className="px-2 py-2 text-center">
                  {producto.lotes && producto.lotes.length > 0 && (
                    <button 
                      onClick={() => toggleRow(producto.producto_id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FontAwesomeIcon 
                        icon={expandedRows[producto.producto_id] ? faChevronUp : faChevronDown} 
                      />
                    </button>
                  )}
                </td>
                <td className="px-2 py-2 font-medium">{producto.nombre}</td>
                <td className="px-2 py-2">{producto.categoria || '-'}</td>
                <td className="px-2 py-2 text-center">{producto.proveedor || '-'}</td>
                <td className="px-2 py-2 text-right font-medium">{formatNumber(producto.stock_actual)}</td>
                <td className="px-2 py-2 text-right text-gray-500">{producto.stock_minimo}</td>
                <td className="px-2 py-2 text-right">{formatCurrency(producto.precio_compra)}</td>
                <td className="px-2 py-2 text-right">{formatCurrency(producto.precio_venta)}</td>
                <td className="px-2 py-2 text-right font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(producto.valor_total)}
                </td>
                <td className="px-2 py-2 text-center">
                  {producto.stock_bajo ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                      Bajo
                    </span>
                  ) : producto.stock_actual === 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Sin Stock
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      OK
                    </span>
                  )}
                </td>
              </tr>
              
              {expandedRows[producto.producto_id] && producto.lotes && producto.lotes.length > 0 && (
                <tr className="bg-blue-50 dark:bg-blue-900/20">
                  <td colSpan={10} className="px-4 py-3">
                    <div className="text-xs">
                      <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
                        <FontAwesomeIcon icon={faWarehouse} />
                        <span className="font-medium">Lotes del producto:</span>
                      </div>
                      <table className="w-full">
                        <thead className="bg-blue-100 dark:bg-blue-800/30">
                          <tr>
                            <th className="px-2 py-1 text-left">Lote #</th>
                            <th className="px-2 py-1 text-center">Cantidad</th>
                            <th className="px-2 py-1 text-right">P. Compra</th>
                            <th className="px-2 py-1 text-left">Fecha Ingreso</th>
                            <th className="px-2 py-1 text-right">Valor Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {producto.lotes.map((lote) => (
                            <tr key={lote.lote_id} className="border-b border-blue-100 dark:border-blue-800/30">
                              <td className="px-2 py-1 font-medium">{lote.lote_id}</td>
                              <td className="px-2 py-1 text-center">{lote.cantidad_disponible}</td>
                              <td className="px-2 py-1 text-right">{formatCurrency(lote.precio_compra)}</td>
                              <td className="px-2 py-1 text-left">
                                {new Date(lote.fecha_ingreso).toLocaleDateString('es-CO')}
                              </td>
                              <td className="px-2 py-1 text-right font-medium">{formatCurrency(lote.valor_total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaInventarioDetalle;