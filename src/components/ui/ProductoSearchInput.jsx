import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, AlertTriangle } from 'lucide-react';
import { buscarProductos } from '../../services/busqueda';

const ProductoSearchInput = ({ 
  onSelect, 
  value = null, 
  placeholder = "Buscar producto por código, nombre o categoría...",
  className = "",
  disabled = false,
  required = false,
  error = null,
  showStock = true
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(value);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedProducto(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProductos = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await buscarProductos(searchQuery);
      setResults(response.results || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Error buscando productos:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (selectedProducto) {
      setSelectedProducto(null);
      onSelect(null);
    }

    // Debounce search
    clearTimeout(window.productoSearchTimeout);
    window.productoSearchTimeout = setTimeout(() => {
      searchProductos(newQuery);
    }, 300);
  };

  const handleSelectProducto = (producto) => {
    setSelectedProducto(producto);
    setQuery(producto.display_text);
    setIsOpen(false);
    setResults([]);
    onSelect(producto);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedProducto(null);
    setResults([]);
    setIsOpen(false);
    onSelect(null);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (query && results.length > 0) {
      setIsOpen(true);
    }
  };

  const getStockBadge = (producto) => {
    if (!showStock) return null;

    if (!producto.stock_disponible) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          Sin stock
        </span>
      );
    }

    if (producto.stock_bajo) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Stock bajo
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        Disponible
      </span>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Package className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={selectedProducto ? selectedProducto.display_text : query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm
            focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            sm:text-sm
          `}
        />
        
        {(query || selectedProducto) && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        
        {loading && (
          <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {results.map((producto) => (
            <div
              key={producto.id}
              onClick={() => handleSelectProducto(producto)}
              className={`
                cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50
                ${!producto.stock_disponible ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {producto.codigo} - {producto.nombre}
                    </div>
                    <div className="text-sm text-gray-500">
                      {producto.categoria.nombre} | ${producto.precio_venta}
                    </div>
                    {showStock && (
                      <div className="text-xs text-gray-400">
                        Stock: {producto.stock_actual} unidades
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-2">
                  {getStockBadge(producto)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-2 text-base ring-1 ring-black ring-opacity-5">
          <div className="px-3 py-2 text-sm text-gray-500">
            No se encontraron productos
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoSearchInput;
