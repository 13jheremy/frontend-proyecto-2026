// src/modulos/reportes/pages/components/TablaVentasDetalle.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCalendar, faUser, faMoneyBill, faBox } from '@fortawesome/free-solid-svg-icons';

const TablaVentasDetalle = ({ ventas = [] }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [sortField, setSortField] = useState('fecha');
  const [sortDirection, setSortDirection] = useState('desc');

  const toggleRow = (ventaId) => {
    setExpandedRows(prev => ({
      ...prev,
      [ventaId]: !prev[ventaId]
    }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedVentas = [...ventas].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'fecha') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getEstadoColor = (estado) => {
    const colors = {
      'PAGADA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'PENDIENTE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'ANULADA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  if (ventas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FontAwesomeIcon icon={faBox} className="text-4xl mb-2 opacity-50" />
        <p>No hay ventas en el período seleccionado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          <tr>
            <th className="px-3 py-2 text-left w-8"></th>
            <th className="px-3 py-2 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleSort('id')}>
              # 
            </th>
            <th className="px-3 py-2 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleSort('fecha')}>
              <FontAwesomeIcon icon={faCalendar} className="mr-1" />
              Fecha
            </th>
            <th className="px-3 py-2 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleSort('cliente')}>
              <FontAwesomeIcon icon={faUser} className="mr-1" />
              Cliente
            </th>
            <th className="px-3 py-2 text-center">Estado</th>
            <th className="px-3 py-2 text-right cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleSort('total')}>
              <FontAwesomeIcon icon={faMoneyBill} className="mr-1" />
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedVentas.map((venta) => (
            <React.Fragment key={venta.venta_id}>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-2 py-2 text-center">
                  <button 
                    onClick={() => toggleRow(venta.venta_id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon 
                      icon={expandedRows[venta.venta_id] ? faChevronUp : faChevronDown} 
                    />
                  </button>
                </td>
                <td className="px-3 py-2 font-medium">{venta.venta_id}</td>
                <td className="px-3 py-2">{formatDate(venta.fecha)}</td>
                <td className="px-3 py-2">
                  <div>
                    <span className="font-medium">{venta.cliente?.nombre}</span>
                    {venta.cliente?.cedula && (
                      <span className="text-gray-500 ml-1">({venta.cliente.cedula})</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(venta.estado)}`}>
                    {venta.estado}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(venta.total)}
                </td>
              </tr>
              
              {expandedRows[venta.venta_id] && (
                <tr className="bg-blue-50 dark:bg-blue-900/20">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="text-xs">
                      <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
                        <FontAwesomeIcon icon={faBox} />
                        <span className="font-medium">Detalles de la venta:</span>
                        {venta.usuario && (
                          <span className="text-gray-500">
                            Registrada por: {venta.usuario.nombre}
                          </span>
                        )}
                      </div>
                      <table className="w-full">
                        <thead className="bg-blue-100 dark:bg-blue-800/30">
                          <tr>
                            <th className="px-2 py-1 text-left">Producto</th>
                            <th className="px-2 py-1 text-center">Categoría</th>
                            <th className="px-2 py-1 text-right">Cantidad</th>
                            <th className="px-2 py-1 text-right">Precio Unit.</th>
                            <th className="px-2 py-1 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {venta.detalles?.map((detalle, idx) => (
                            <tr key={idx} className="border-b border-blue-100 dark:border-blue-800/30">
                              <td className="px-2 py-1">{detalle.producto_nombre}</td>
                              <td className="px-2 py-1 text-center">{detalle.categoria || '-'}</td>
                              <td className="px-2 py-1 text-center">{detalle.cantidad}</td>
                              <td className="px-2 py-1 text-right">{formatCurrency(detalle.precio_unitario)}</td>
                              <td className="px-2 py-1 text-right font-medium">{formatCurrency(detalle.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {venta.notas && (
                        <div className="mt-2 text-gray-500 italic">
                          Nota: {venta.notas}
                        </div>
                      )}
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

export default TablaVentasDetalle;