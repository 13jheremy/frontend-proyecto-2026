// src/modules/productos/pages/ProductosPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useProductos } from '../hooks/useProductos';
import ProductoTable from './components/productoTable';
import ProductoCreateModal from './components/ProductoCreateModal';
import ProductoEditModal from './components/ProductoEditModal';
import ProductoSearch from './components/ProductoSearch';
import ProductActionModal from './components/ProductActionModal';
import ProductoImageModal from './components/ProductoImageModal';
import InfoProductModal from './components/InfoProductModal'; // ADDED
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBoxes, faStar, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { PERMISSIONS } from '../../../utils/constants';
import { hasPermission } from '../../../utils/rolePermissions';
import { useAuth } from '../../../context/AuthContext';

const ProductosPage = () => {
  const { user, roleNames } = useAuth();
  
  // Validar que el usuario y roles estén cargados antes de calcular permisos
  if (!user || !roleNames) {
    return (
      <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">⏳ Esperando usuario...</div>
        </div>
      </div>
    );
  }

  // Logs para debugging
  console.log("RoleNames:", roleNames);
  console.log("CREATE_PERMS:", PERMISSIONS.PRODUCTS.CREATE);
  console.log("EDIT_PERMS:", PERMISSIONS.PRODUCTS.EDIT);
  console.log("DELETE_PERMS:", PERMISSIONS.PRODUCTS.DELETE);
  
  // Función para verificar permisos con normalización
  const canPerformAction = (requiredPerms) => {
    const normalizedRoles = roleNames.map(r => r.toLowerCase());
    const normalizedPerms = requiredPerms.map(p => p.toLowerCase());
    const canDo = normalizedRoles.some(r => normalizedPerms.includes(r));
    return canDo;
  };
  
  // Calcular permisos
  const canCreate = canPerformAction(PERMISSIONS.PRODUCTS.CREATE);
  const canEdit = canPerformAction(PERMISSIONS.PRODUCTS.EDIT);
  const canDelete = canPerformAction(PERMISSIONS.PRODUCTS.DELETE);
  
  // Logs después de calcular
  console.log("canCreate:", canCreate, "canEdit:", canEdit, "canDelete:", canDelete);
  
  // Objeto de permisos para pasar a la tabla
  const tablePermissions = {
    canEdit,
    canDelete,
    canToggleActive: canEdit,
    canToggleDestacado: canEdit,
    canRestore: canEdit
  };
  
  // Hook principal de productos
  const {
    productos,
    categorias,
    proveedores,
    loading,
    error: apiError, // Renombrado a apiError para evitar conflicto con 'error' en modales
    fetchProductos,
    createProducto,
    updateProducto,
    handleProductAction,
    clearError,
    pagination
  } = useProductos();

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProducto, setCurrentProducto] = useState(null);

  // Estados para modal de acción (borrar/activar/etc.)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionProducto, setSelectedActionProducto] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Estados para modal de imagen
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', title: '' });

  // Estados para modal de información (ADDED)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInfoProducto, setSelectedInfoProducto] = useState(null);

  // Estados para búsqueda y paginación
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Función para abrir modal de acción
  const openActionModal = (producto, type) => {
    setSelectedActionProducto(producto);
    setActionType(type);
    setActionModalOpen(true);
  };

  // Función para confirmar acciones
  const handleConfirmAction = async (productoId, type) => {
    try {
      await handleProductAction(productoId, type);
      fetchProductos(filters, page, pageSize); // Refrescar la lista después de la acción
      setActionModalOpen(false);
      setSelectedActionProducto(null);
      setActionType(null);
    } catch (err) {
      console.error(`Error en acción ${type}:`, err);
      // El error ya se maneja en useProductos y se propaga, aquí solo logueamos
    }
  };

  // Función para abrir modal de imagen
  const handleViewImage = (imageUrl, productName) => {
    setSelectedImage({ url: imageUrl, title: productName });
    setImageModalOpen(true);
  };

  // Handlers para información (ADDED)
  const handleInfoProduct = useCallback((producto) => {
    setSelectedInfoProducto(producto);
    setIsInfoModalOpen(true);
  }, []);

  // Handlers para acciones de producto
  const handleSoftDeleteProducto = useCallback((productoId) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    openActionModal(producto, 'softDelete');
  }, [productos]);

  const handleHardDeleteProducto = useCallback((productoId) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    openActionModal(producto, 'hardDelete');
  }, [productos]);

  const handleRestoreProducto = useCallback((productoId) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    openActionModal(producto, 'restore');
  }, [productos]);

  const handleToggleActivoProducto = useCallback((id) => { // Ya no necesita newStatus aquí
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    openActionModal(producto, 'toggleActivo');
  }, [productos]);

  const handleToggleDestacado = useCallback(async (id, destacado) => {
    try {
      // handleProductAction ya contiene la lógica para encontrar el producto y togglear
      await handleProductAction(id, 'toggleDestacado');
      fetchProductos(filters, page, pageSize); // Refrescar la lista después de la acción
    } catch (err) {
      console.error('Error en toggle destacado:', err);
      // El error ya se maneja en useProductos y se propaga
    }
  }, [handleProductAction, fetchProductos, filters, page, pageSize]);

  // Handlers para creación y edición
  const handleCreateProduct = useCallback(async (productoData) => {
    try {
      await createProducto(productoData);
      setIsCreateModalOpen(false); // Cerrar modal solo si la creación es exitosa
      fetchProductos(filters, page, pageSize); // Refrescar la lista
    } catch (err) {
      console.error("Error en handleCreateProduct en página:", err);
      // El error ya se propaga y se establece en apiError por useProductos
    }
  }, [createProducto, fetchProductos, filters, page, pageSize]);

  const handleEditProduct = (producto) => {
    setCurrentProducto(producto);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = useCallback(async (id, productoData) => {
    try {
      await updateProducto(id, productoData);
      setIsEditModalOpen(false); // Cerrar modal solo si la actualización es exitosa
      setCurrentProducto(null);
      fetchProductos(filters, page, pageSize); // Refrescar la lista
    } catch (err) {
      console.error("Error en handleUpdateProduct en página:", err);
      // El error ya se propaga y se establece en apiError por useProductos
    }
  }, [updateProducto, fetchProductos, filters, page, pageSize]);

  // Handler para búsqueda
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Resetear a la primera página en cada nueva búsqueda
  };

  // Handler para cerrar modales y limpiar errores
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentProducto(null);
    clearError(); // Limpiar cualquier error de API
  };

  // Efecto para recargar datos cuando cambien filtros o paginación
  useEffect(() => {
    fetchProductos(filters, page, pageSize);
  }, [filters, page, pageSize, fetchProductos]);

  // Función para obtener estadísticas
  const getEstadisticas = () => {
    const total = pagination.totalItems || 0;
    // Estas estadísticas se basan en los productos actualmente cargados en el estado `productos`
    // Si la paginación está activa, solo reflejarán los productos de la página actual.
    // Para estadísticas globales, se necesitaría una llamada API separada o que el backend las provea.
    const activos = productos.filter(p => p.activo && !p.eliminado).length;
    const inactivos = productos.filter(p => !p.activo && !p.eliminado).length;
    const eliminados = productos.filter(p => p.eliminado).length;
    const destacados = productos.filter(p => p.destacado && !p.eliminado).length;
    const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo && !p.eliminado).length;
    const sinStock = productos.filter(p => p.stock_actual === 0 && !p.eliminado).length;

    return { total, activos, inactivos, eliminados, destacados, stockBajo, sinStock };
  };

  const estadisticas = getEstadisticas();

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faBoxes} className="mr-3 text-blue-600" />
          Gestión de Productos
        </h1>

        {/* ESTADÍSTICAS MEJORADAS */}
        <div className="hidden md:flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estadisticas.total}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {estadisticas.activos}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Activos
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {estadisticas.destacados}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Destacados
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {estadisticas.sinStock}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Sin Stock
            </div>
          </div>

          {estadisticas.stockBajo > 0 && (
            <>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center">
                  {estadisticas.stockBajo}
                  <FontAwesomeIcon icon={faExclamationTriangle} className="ml-1 text-sm" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock Bajo
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="mb-6">
        <ProductoSearch
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          categorias={categorias}
          proveedores={proveedores}
        />
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-wrap gap-4 mb-6">
        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Crear Producto
          </button>
        )}

        {estadisticas.destacados > 0 && (
          <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md">
            <FontAwesomeIcon icon={faStar} className="mr-2" />
            {estadisticas.destacados} producto{estadisticas.destacados !== 1 ? 's' : ''} destacado{estadisticas.destacados !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Productos por página:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setPage(1);
          }}
          className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <ProductoTable
          productos={productos}
          categorias={categorias}
          proveedores={proveedores}
          permissions={tablePermissions}
          onEdit={handleEditProduct}
          onSoftDelete={handleSoftDeleteProducto}
          onHardDelete={handleHardDeleteProducto}
          onRestore={handleRestoreProducto}
          onToggleActivo={handleToggleActivoProducto}
          onToggleDestacado={handleToggleDestacado}
          onViewImage={handleViewImage}
          onInfo={handleInfoProduct} // ADDED
          loading={loading}
        />
      </div>

      {/* PAGINACIÓN */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <button
            disabled={!pagination.previous}
            onClick={() => setPage(prev => prev - 1)}
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <span className="px-3 py-1">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.next}
            onClick={() => setPage(prev => prev + 1)}
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* MODALES */}

      {/* Modal para crear producto */}
      <ProductoCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onCreate={handleCreateProduct}
        loading={loading}
        apiError={apiError} // Pasar el objeto de error completo
        categorias={categorias}
        proveedores={proveedores}
      />

      {/* Modal para editar producto */}
      <ProductoEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onUpdate={handleUpdateProduct}
        currentProducto={currentProducto}
        loading={loading}
        apiError={apiError} // Pasar el objeto de error completo
        categorias={categorias}
        proveedores={proveedores}
      />

      {/* Modal para confirmar acciones */}
      <ProductActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedActionProducto(null);
          setActionType(null);
        }}
        producto={selectedActionProducto}
        actionType={actionType}
        onConfirm={handleConfirmAction}
      />

      {/* Modal para ver imagen ampliada */}
      <ProductoImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={selectedImage.url}
        productName={selectedImage.title}
      />

      {/* Modal para ver información detallada del producto (ADDED) */}
      <InfoProductModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedInfoProducto(null);
        }}
        producto={selectedInfoProducto}
      />
    </div>
  );
};

export default ProductosPage;
