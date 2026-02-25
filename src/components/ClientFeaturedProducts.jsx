import React, { useState, useEffect } from 'react';
import { Package, Star, ShoppingCart } from 'lucide-react';
import { productsAPI } from '../services/api';

const ClientFeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar el endpoint público de productos destacados
      const response = await fetch('http://localhost:8000/api/publico/productos/destacados/?page_size=6');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Featured products response:', data);
      setProducts(data.results || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setError('Error al cargar productos destacados');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No hay productos destacados disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
        >
          {/* Imagen del producto */}
          <div className="relative h-24 bg-white dark:bg-gray-600 rounded-md mb-3 flex items-center justify-center overflow-hidden">
            {product.imagen_url ? (
              <img
                src={product.imagen_url}
                alt={product.nombre}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center" style={{ display: product.imagen_url ? 'none' : 'flex' }}>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            
            {/* Badge destacado */}
            <div className="absolute top-2 right-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          </div>

          {/* Información del producto */}
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-1 truncate">
              {product.nombre}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 capitalize">
              {product.categoria_nombre || 'Sin categoría'}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {Number(product.precio_venta || 0).toFixed(2)} Bs
              </span>
              
              <span className={`text-xs px-2 py-1 rounded-full ${
                product.stock_actual > 0 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {product.stock_actual > 0 ? `Stock: ${product.stock_actual}` : 'Sin stock'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientFeaturedProducts;
