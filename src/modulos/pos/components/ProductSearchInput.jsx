// src/modulos/pos/components/ProductSearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faSpinner, 
  faExclamationTriangle, 
  faCheckCircle, 
  faTimesCircle,
  faCube
} from '@fortawesome/free-solid-svg-icons';
import { usePOS } from '../hooks/usePOS';
import ProductImage from './ProductImage';

const ProductSearchInput = ({ onProductSelect, placeholder = "Buscar productos por código, nombre..." }) => {
  const [query, setQuery] = useState('');
  const [productos, setProductos] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { buscarProductos, loading } = usePOS();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length >= 2) {
        try {
          const response = await buscarProductos(query);
          console.log('Product search response:', response);
          // Handle different response structures
          let productosData = [];
          if (response.success && response.data) {
            // Handle nested response structure: {success: true, data: {success: true, data: Array}}
            if (response.data.success && response.data.data) {
              productosData = Array.isArray(response.data.data) ? response.data.data : [];
            } else if (Array.isArray(response.data)) {
              productosData = response.data;
            } else if (response.data.results) {
              productosData = response.data.results;
            }
          } else if (response.results) {
            productosData = response.results;
          } else if (Array.isArray(response)) {
            productosData = response;
          }
          setProductos(productosData);
          setIsOpen(true);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Error searching products:', error);
          setProductos([]);
        }
      } else {
        setProductos([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, buscarProductos]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || productos.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < productos.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < productos.length) {
          handleProductSelect(productos[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle product selection
  const handleProductSelect = (producto) => {
    if (!producto.disponible) {
      return; // No permitir seleccionar productos sin stock
    }
    
    onProductSelect(producto);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get stock status color
  const getStockStatusColor = (producto) => {
    if (!producto.disponible) return 'text-red-500';
    if (producto.stock_status === 'stock_bajo') return 'text-yellow-500';
    return 'text-green-500';
  };

  // Get stock status icon
  const getStockStatusIcon = (producto) => {
    if (!producto.disponible) return faExclamationTriangle;
    if (producto.stock_status === 'stock_bajo') return faExclamationTriangle;
    return faCheckCircle;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-500 dark:placeholder-gray-400"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} className="text-gray-400 animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {productos.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {loading ? (
                <div className="flex items-center justify-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Buscando productos...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FontAwesomeIcon icon={faCube} className="mr-2" />
                  No se encontraron productos
                </div>
              )}
            </div>
          ) : (
            productos.map((producto, index) => (
              <div
                key={producto.id}
                className={`p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0
                          ${selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                          ${!producto.disponible ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => handleProductSelect(producto)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <ProductImage
                      imageUrl={producto.imagen_url || producto.imagen}
                      productName={producto.nombre}
                      size="small"
                      showExpandIcon={true}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {producto.codigo}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {producto.nombre}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${parseFloat(producto.precio_venta || 0).toLocaleString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <FontAwesomeIcon 
                            icon={getStockStatusIcon(producto)} 
                            className={`text-sm ${getStockStatusColor(producto)}`}
                          />
                          <span className={`text-sm font-medium ${getStockStatusColor(producto)}`}>
                            Stock: {producto.stock_actual || 0}
                          </span>
                        </div>
                      </div>
                      {producto.categoria && (
                        <span className="inline-block px-2 py-1 mt-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          {producto.categoria.nombre}
                        </span>
                      )}
                    </div>
                </div>
                </div>
                {!producto.disponible && (
                  <div className="mt-2 text-xs text-red-500 font-medium">
                    Sin stock disponible
                  </div>
                )}
                {producto.stock_status === 'stock_bajo' && producto.disponible && (
                  <div className="mt-2 text-xs text-yellow-600 font-medium">
                    Stock bajo
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchInput;
