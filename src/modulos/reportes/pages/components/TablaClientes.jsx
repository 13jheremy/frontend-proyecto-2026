// src/modulos/reportes/pages/components/TablaClientes.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faUser, faCalendar, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const TablaClientes = ({ clientes = [] }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (clienteId) => {
    setExpandedRows(prev => ({
      ...prev,
      [clienteId]: !prev[clienteId]
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (clientes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FontAwesomeIcon icon={faUser} className="text-4xl mb-2 opacity-50" />
        <p>No hay clientes con compras en el período seleccionado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          <tr>
            <th className="px-2 py-2 text-left w-8"></th>
            <th className="px-2 py-2 text-left">Cliente</th>
            <th className="px-2 py-2 text-center">Cédula</th>
            <th className="px-2 py-2 text-center">Ventas</th>
            <th className="px-2 py-2 text-right">Total Comprado</th>
            <th className="px-2 py-2 text-right">Promedio/Venta</th>
            <th className="px-2 py-2 text-center">Productos</th>
            <th className="px-2 py-2 text-center">Última Compra</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <React.Fragment key={cliente.cliente_id}>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-2 py-2 text-center">
                  <button 
                    onClick={() => toggleRow(cliente.cliente_id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon 
                      icon={expandedRows[cliente.cliente_id] ? faChevronUp : faChevronDown} 
                    />
                  </button>
                </td>
                <td className="px-2 py-2 font-medium">{cliente.nombre}</td>
                <td className="px-2 py-2 text-center text-gray-500">{cliente.cedula || '-'}</td>
                <td className="px-2 py-2 text-center">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {cliente.cantidad_ventas}
                  </span>
                </td>
                <td className="px-2 py-2 text-right font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(cliente.total_compras)}
                </td>
                <td className="px-2 py-2 text-right text-gray-500">
                  {formatCurrency(cliente.promedio_por_venta)}
                </td>
                <td className="px-2 py-2 text-center">{cliente.total_productos}</td>
                <td className="px-2 py-2 text-center text-gray-500">
                  {formatDate(cliente.ultima_compra)}
                </td>
              </tr>
              
              {expandedRows[cliente.cliente_id] && (
                <tr className="bg-blue-50 dark:bg-blue-900/20">
                  <td colSpan={8} className="px-4 py-3">
                    <div className="text-xs">
                      <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
                        <FontAwesomeIcon icon={faShoppingCart} />
                        <span className="font-medium">Detalle de compras:</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <div className="bg-white dark:bg-gray-800 rounded p-2">
                          <p className="text-gray-500 text-[10px]">Teléfono</p>
                          <p className="font-medium">{cliente.telefono || 'No registrado'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded p-2">
                          <p className="text-gray-500 text-[10px]">Dirección</p>
                          <p className="font-medium">{cliente.direccion || 'No registrada'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded p-2">
                          <p className="text-gray-500 text-[10px]">Primera compra</p>
                          <p className="font-medium">{formatDate(cliente.primera_compra)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded p-2">
                          <p className="text-gray-500 text-[10px]">Última compra</p>
                          <p className="font-medium">{formatDate(cliente.ultima_compra)}</p>
                        </div>
                      </div>
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

export default TablaClientes;