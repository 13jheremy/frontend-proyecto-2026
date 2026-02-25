import React, { useState } from "react";
import { Search, X, Info, Star, Heart, ShoppingCart, Package, Filter, Grid, List } from "lucide-react";
import { useCatalog } from "../hooks/useCatalog";
import "../styles/animations.css";


const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
    <div className="max-w-6xl mx-auto px-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-red-500">JIC</span>
        <span className="ml-2 text-lg">Taller Especializado</span>
      </div>
      <p className="text-sm mb-4">Mantenimiento & Repuestos | Más de 10 años de experiencia</p>
      <div className="flex justify-center space-x-6 text-sm">
        <span>📞 +591 123-4567</span>
        <span>📍 Rurrenabaque, Beni</span>
        <span>🕐 Lun-Sáb 8:00-18:00</span>
      </div>
    </div>
  </footer>
);

// Skeleton Components
const ProductSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const ProductSkeletonList = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="flex gap-6 p-4">
      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>
  </div>
);

const LoadingState = ({ viewMode }) => (
  <div className="space-y-6">
    <div className={`transition-all duration-300 opacity-50 ${
      viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
        : 'space-y-4'
    }`}>
      {viewMode === 'grid' ? (
        Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
      ) : (
        <div className="col-span-full space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <ProductSkeletonList key={i} />)}
        </div>
      )}
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-screen py-16">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <Info className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-xl font-semibold text-red-700 mb-2">Error al cargar el catálogo</h3>
    <p className="text-red-600 mb-4">{message}</p>
    <button 
      onClick={onRetry}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
    >
      Reintentar
    </button>
  </div>
);

export default function Catalogo() {
  const { 
    productos, 
    categorias, 
    loading, 
    error, 
    filtros, 
    updateFiltros, 
    clearFiltros, 
    catalogStats, 
    refetch 
  } = useCatalog();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [imageErrors, setImageErrors] = useState(new Set());

  const handleImageError = (productId) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };

  if (loading && productos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          </div>
          <LoadingState viewMode={viewMode} />
        </div>
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section 
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1920&h=1080&fit=crop)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="text-center text-white max-w-4xl px-6">
          <div className="mb-6">
            <h2 className="text-lg font-light text-gray-300 mb-2 tracking-wide">
              Taller Especializado
            </h2>
            <h1 className="text-7xl font-black mb-4 tracking-tight">
              <span className="text-white">C</span>
              <span className="text-red-500">A</span>
              <span className="text-white">TÁLOGO</span>
            </h1>
            <h3 className="text-2xl font-semibold text-red-400 mb-6 uppercase tracking-wider">
              Productos & Repuestos
            </h3>
          </div>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Descubre nuestra <strong>amplia gama</strong> de productos y repuestos de calidad. 
            Encuentra todo lo que necesitas para tu motocicleta.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Explorar Productos
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
              Filtrar por Categoría
            </button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Búsqueda */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={filtros.search}
                onChange={(e) => updateFiltros({ search: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 ${loading ? 'opacity-50 cursor-wait' : ''}`}
                disabled={loading}
              />
            </div>
          </div>

          {/* Filtros principales */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Categorías */}
            <select
              value={filtros.categoria}
              onChange={(e) => updateFiltros({ categoria: e.target.value })}
              className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 ${loading ? 'opacity-50 cursor-wait' : ''}`}
              disabled={loading}
            >
              <option value="all">Todas las categorías ({catalogStats.totalProductos})</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>

            {/* Ordenamiento */}
            <select
              value={filtros.ordering}
              onChange={(e) => updateFiltros({ ordering: e.target.value })}
              className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 ${loading ? 'opacity-50 cursor-wait' : ''}`}
              disabled={loading}
            >
              <option value="nombre">Nombre (A-Z)</option>
              <option value="-nombre">Nombre (Z-A)</option>
              <option value="precio_venta">Precio (menor a mayor)</option>
              <option value="-precio_venta">Precio (mayor a menor)</option>
              <option value="-destacado">Destacados primero</option>
            </select>

            {/* Vista */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 transition-all duration-300 ${loading ? 'opacity-50 cursor-wait' : ''} ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                disabled={loading}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 transition-all duration-300 ${loading ? 'opacity-50 cursor-wait' : ''} ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                disabled={loading}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => updateFiltros({ destacado: 'all' })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${loading ? 'opacity-50 cursor-wait' : ''} ${
                filtros.destacado === 'all'
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
              disabled={loading}
            >
              Todos
            </button>
            <button
              onClick={() => updateFiltros({ destacado: 'true' })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${loading ? 'opacity-50 cursor-wait' : ''} ${
                filtros.destacado === 'true'
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
              disabled={loading}
            >
              ⭐ Destacados ({catalogStats.productosDestacados})
            </button>
            <button
              onClick={() => updateFiltros({ stock: 'true' })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${loading ? 'opacity-50 cursor-wait' : ''} ${
                filtros.stock === 'true'
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
              disabled={loading}
            >
              ✅ Con stock ({catalogStats.productosConStock})
            </button>
            <button
              onClick={clearFiltros}
              className={`px-4 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-full text-sm font-medium transition-all duration-300 ${loading ? 'opacity-50 cursor-wait' : ''}`}
              disabled={loading}
            >
              Limpiar filtros
            </button>
          </div>

          {/* Resultados */}
          <div className={`text-sm text-gray-600 dark:text-gray-400 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                Cargando productos...
              </div>
            ) : (
              `Mostrando ${productos.length} de ${catalogStats.totalProductos} productos`
            )}
          </div>
        </div>
      </section>

      {/* Productos */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading && productos.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Actualizando resultados...</span>
            </div>
          </div>
        )}
        {!loading && productos.length === 0 ? (
          <div className="col-span-full text-center py-16 animate-fadeIn">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500 dark:text-gray-400">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className={`transition-all duration-500 ease-in-out ${loading && productos.length > 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'} ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          }`}>
            {productos.map((product, index) => (
              <div 
                key={product.id}
                className={`transform transition-all duration-300 hover:scale-[1.02] ${loading && productos.length > 0 ? 'animate-pulse' : ''}`}
                style={{ 
                  animationDelay: loading ? '0ms' : `${index * 50}ms`,
                  animation: loading ? 'none' : 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <ProductCard
                  product={product}
                  viewMode={viewMode}
                  imageErrors={imageErrors}
                  onImageError={handleImageError}
                  onClick={() => setSelectedProduct(product)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de producto */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          imageErrors={imageErrors}
          onImageError={handleImageError}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <Footer />
    </div>
  );
}

const ProductCard = ({ product, viewMode, imageErrors, onImageError, onClick }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg product-card-hover overflow-hidden group cursor-pointer"
           onClick={onClick}>
        <div className="flex gap-6">
          {/* Imagen */}
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
            {imageErrors.has(product.id) || !product.imagen_url ? (
              <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            ) : (
              <img
                src={product.imagen_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'}
                alt={product.nombre}
                className="w-full h-full object-contain transition-transform duration-300 hover:scale-105 bg-gray-100 dark:bg-gray-700"
                onError={(e) => {
                  handleImageError(product.id);
                }}
              />
            )}
          </div>
          
          {/* Información */}
          <div className="flex-1 flex justify-between items-center">
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                  {product.nombre}
                </h3>
                {product.destacado && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{product.categoria_nombre}</p>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-red-600 mb-4">{Number(product.precio_venta || product.price || 0).toFixed(2)} BS</div>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  product.stock_actual > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock_actual > 0 ? `Stock: ${product.stock_actual}` : 'Sin stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer product-card-hover overflow-hidden"
      onClick={onClick}
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {product.destacado && (
          <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Star className="w-3 h-3 mr-1" /> Destacado
          </div>
        )}
        {product.stock_actual === 0 && (
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Sin stock
          </div>
        )}
      </div>

      {/* Imagen */}
      <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageErrors.has(product.id) || !product.imagen_url ? (
          <Package className="w-12 h-12 text-gray-400" />
        ) : (
          <img
            src={product.imagen_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'}
            alt={product.nombre}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-gray-100 dark:bg-gray-700"
            onError={() => onImageError(product.id)}
          />
        )}
      </div>

      {/* Información */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{product.nombre}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 capitalize">{product.categoria_nombre}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
{Number(product.precio_venta || product.price || 0).toFixed(2)} BS
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            product.stock_actual > 0 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {product.stock_actual > 0 ? `Stock disponible: ${product.stock_actual}` : 'Sin stock'}
          </span>
        </div>
      </div>
    </div>
  );
};
