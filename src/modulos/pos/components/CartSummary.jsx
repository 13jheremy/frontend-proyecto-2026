// src/modulos/pos/components/CartSummary.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faTrash, 
  faMinus, 
  faPlus, 
  faPercent,
  faCreditCard,
  faMoneyBill,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const CartSummary = ({ 
  items, 
  totales, 
  cliente, 
  metodoPago, 
  descuento,
  onUpdateQuantity, 
  onRemoveItem, 
  onSetMetodoPago,
  onSetDescuento,
  onClearCart 
}) => {
  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo', icon: faMoneyBill },
    { value: 'tarjeta', label: 'Tarjeta', icon: faCreditCard },
    { value: 'transferencia', label: 'Transferencia', icon: faCreditCard }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faShoppingCart} className="mr-2 text-blue-600" />
          Carrito ({totales.cantidadItems} items)
        </h3>
        {items.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Limpiar carrito"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>

      {/* Cliente seleccionado */}
      {cliente && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center text-blue-700 dark:text-blue-300">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            <div>
              <div className="font-medium">{cliente.nombre_completo}</div>
              <div className="text-sm">CI: {cliente.cedula}</div>
            </div>
          </div>
        </div>
      )}

      {/* Items del carrito */}
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FontAwesomeIcon icon={faShoppingCart} className="text-4xl mb-2" />
            <p>El carrito está vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.producto.nombre}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ${parseFloat(item.precio_unitario).toLocaleString()} c/u
                </div>
              </div>
              
              {/* Quantity controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
                  className="w-6 h-6 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/40"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                  disabled={item.cantidad >= item.producto.stock_actual}
                  className="w-6 h-6 flex items-center justify-center bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                ${parseFloat(item.subtotal).toLocaleString()}
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
              </button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <>
          {/* Descuento */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FontAwesomeIcon icon={faPercent} className="mr-1" />
              Descuento (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={descuento}
              onChange={(e) => onSetDescuento(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Método de pago */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Método de pago
            </label>
            <div className="grid grid-cols-1 gap-2">
              {metodosPago.map((metodo) => (
                <button
                  key={metodo.value}
                  onClick={() => onSetMetodoPago(metodo.value)}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md border transition-colors
                            ${metodoPago === metodo.value
                              ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                >
                  <FontAwesomeIcon icon={metodo.icon} />
                  <span className="text-sm font-medium">{metodo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal:</span>
              <span>${parseFloat(totales.subtotal).toLocaleString()}</span>
            </div>
            
            {parseFloat(totales.descuento) > 0 && (
              <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                <span>Descuento ({descuento}%):</span>
                <span>-${parseFloat(totales.descuento).toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Impuesto (19%):</span>
              <span>${parseFloat(totales.impuesto).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
              <span>Total:</span>
              <span>${parseFloat(totales.total).toLocaleString()}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSummary;
