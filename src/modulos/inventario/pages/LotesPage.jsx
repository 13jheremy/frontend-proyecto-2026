// src/modulos/inventario/pages/LotesPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLotes } from '../hooks/useLotes';
import { useAuth } from '../../../context/AuthContext';
import { PERMISSIONS } from '../../../utils/constants';
import { normalizeRoles } from '../../../utils/rolePermissions';
import { posAPI } from '../../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faLayerGroup, 
  faBoxOpen, 
  faWarehouse, 
  faExclamationTriangle,
  faEdit,
  faTrash,
  faEye,
  faSearch,
  faCubes
} from '@fortawesome/free-solid-svg-icons';

const LotesPage = () => {
  const { user, roles } = useAuth();
  
  if (!user || !roles) {
    return (
      <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">⏳ Esperando usuario...</div>
        </div>
      </div>
    );
  }

  const normalizedR = normalizeRoles(roles).map(r => r.toLowerCase());
  const isAdmin = normalizedR.includes('administrador');
  
  // Solo administradores pueden acceder a gestión de lotes
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 dark:text-red-400 font-semibold">Acceso Restringido</div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Solo el administrador puede gestionar lotes.</p>
        </div>
      </div>
    );
  }
  
  const canCreate = PERMISSIONS.INVENTORY.CREATE.some(p => normalizedR.includes(p.toLowerCase()));
  const canEdit = PERMISSIONS.INVENTORY.EDIT.some(p => normalizedR.includes(p.toLowerCase()));
  const canDelete = PERMISSIONS.INVENTORY.DELETE.some(p => normalizedR.includes(p.toLowerCase()));

  const {
    lotes,
    loading,
    error,
    pagination,
    fetchLotes,
    createLote,
    updateLote,
    deleteLote,
    fetchEstadisticas,
    clearError,
    buscarProductos,
    fetchProductosActivos
  } = useLotes();

  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
    info: false
  });

  const [selectedLote, setSelectedLote] = useState(null);
  const [filters, setFilters] = useState({ search: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    fetchEstadisticas().then(setEstadisticas).catch(console.error);
  }, [fetchEstadisticas]);

  const handleSearch = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchLotes(newFilters, 1, pageSize);
  }, [fetchLotes, pageSize]);

  const handleClearFilters = useCallback(() => {
    setFilters({ search: '' });
    setPage(1);
    fetchLotes({}, 1, pageSize);
  }, [fetchLotes, pageSize]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    fetchLotes(filters, newPage, pageSize);
  }, [fetchLotes, filters, pageSize]);

  const openCreateModal = () => {
    setSelectedLote(null);
    setModals(prev => ({ ...prev, create: true }));
  };

  const openEditModal = (lote) => {
    setSelectedLote(lote);
    setModals(prev => ({ ...prev, edit: true }));
  };

  const openInfoModal = (lote) => {
    setSelectedLote(lote);
    setModals(prev => ({ ...prev, info: true }));
  };

  const openDeleteModal = (lote) => {
    setSelectedLote(lote);
    setModals(prev => ({ ...prev, delete: true }));
  };

  const closeModal = (modal) => {
    setModals(prev => ({ ...prev, [modal]: false }));
    setSelectedLote(null);
    clearError();
  };

  const handleCreate = async (data) => {
    try {
      await createLote(data);
      closeModal('create');
      fetchLotes(filters, page, pageSize);
      const stats = await fetchEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error creating lote:', error);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateLote(selectedLote.id, data);
      closeModal('edit');
      fetchLotes(filters, page, pageSize);
    } catch (error) {
      console.error('Error updating lote:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLote(selectedLote.id);
      closeModal('delete');
      fetchLotes(filters, page, pageSize);
      const stats = await fetchEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error deleting lote:', error);
    }
  };

  const getEstadisticasLocales = () => {
    const total = pagination.totalItems || 0;
    const activos = lotes.filter(l => l.activo).length;
    const conStock = lotes.filter(l => l.cantidad_disponible > 0).length;
    const sinStock = lotes.filter(l => l.cantidad_disponible === 0).length;
    
    return { total, activos, conStock, sinStock };
  };

  const stats = getEstadisticasLocales();

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      {/* HEADER CON ESTADÍSTICAS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faLayerGroup} className="mr-3 text-purple-600" />
          Gestión de Lotes (FIFO)
        </h1>

        <div className="hidden md:flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Lotes
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {estadisticas?.total_stock || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Unidades
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.conStock}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Con Stock
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.sinStock}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Vacíos
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por producto..."
              value={filters.search}
              onChange={(e) => handleSearch({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {filters.search && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-wrap gap-4 mb-6">
        {canCreate && (
          <button
            onClick={openCreateModal}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Nuevo Lote
          </button>
        )}

        {stats.conStock > 0 && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
            {stats.conStock} lote{stats.conStock !== 1 ? 's' : ''} con stock
          </div>
        )}

        {stats.sinStock > 0 && (
          <div className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-md">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {stats.sinStock} vacío{stats.sinStock !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* SELECTOR DE PAGINACIÓN */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-700 dark:text-gray-300">Lotes por página:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setPage(1);
            fetchLotes(filters, 1, parseInt(e.target.value));
          }}
          className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* TABLA DE LOTES */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Precio Compra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha Ingreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <FontAwesomeIcon icon={faBoxOpen} className="animate-spin mr-2" />
                      Cargando...
                    </div>
                  </td>
                </tr>
              ) : lotes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center py-8">
                      <FontAwesomeIcon icon={faWarehouse} className="text-4xl text-gray-300 dark:text-gray-600 mb-2" />
                      <p>No hay lotes registrados</p>
                      <p className="text-sm text-gray-400">Crea un nuevo lote para agregar inventario</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lotes.map((lote, index) => (
                  <tr key={lote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {lote.producto_nombre || `Producto #${lote.producto}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lote.cantidad_disponible > 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                          <FontAwesomeIcon 
                            icon={lote.cantidad_disponible > 0 ? faBoxOpen : faExclamationTriangle} 
                            className="mr-1" 
                          />
                        {lote.cantidad_disponible}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(lote.precio_compra)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(lote.fecha_ingreso)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lote.activo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {lote.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openInfoModal(lote)}
                          className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                          title="Ver detalles"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => openEditModal(lote)}
                            className="p-2 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900 transition-colors"
                            title="Editar"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                        {canDelete && lote.cantidad_disponible === 0 && (
                          <button
                            onClick={() => openDeleteModal(lote)}
                            className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                            title="Eliminar"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <button
            disabled={!pagination.previous}
            onClick={() => handlePageChange(page - 1)}
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <span className="px-3 py-1">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.next}
            onClick={() => handlePageChange(page + 1)}
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* MODALES */}
      
      {/* Modal Crear Lote */}
      {modals.create && (
        <LoteCreateModal
          isOpen={modals.create}
          onClose={() => closeModal('create')}
          onCreate={handleCreate}
          loading={loading}
        />
      )}

      {/* Modal Editar Lote */}
      {modals.edit && selectedLote && (
        <LoteEditModal
          isOpen={modals.edit}
          onClose={() => closeModal('edit')}
          onUpdate={handleUpdate}
          lote={selectedLote}
          loading={loading}
        />
      )}

      {/* Modal Eliminar Lote */}
      {modals.delete && selectedLote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900">
              <FontAwesomeIcon icon={faTrash} className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              ¿Estás seguro de eliminar el lote #{selectedLote.id} de <strong>{selectedLote.producto_nombre}</strong>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => closeModal('delete')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Info Lote */}
      {modals.info && selectedLote && (
        <LoteInfoModal
          isOpen={modals.info}
          onClose={() => closeModal('info')}
          lote={selectedLote}
        />
      )}
    </div>
  );
};

// =======================================
// COMPONENTES DE MODALES
// =======================================

const LoteCreateModal = ({ isOpen, onClose, onCreate, loading }) => {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [productos, setProductos] = useState([]);
  const [productoSearch, setProductoSearch] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const dropdownRef = useRef(null);
  const selectedProductRef = useRef(null); // Track selected product for effect

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setProductoId('');
      setCantidad('');
      setPrecioCompra('');
      setProductoSearch('');
      setProductoSeleccionado(null);
      setProductos([]);
      setShowDropdown(false);
      selectedProductRef.current = null;
    }
  }, [isOpen]);

  // Solo buscar cuando NO hay producto seleccionado Y hay texto para buscar
  useEffect(() => {
    const selectedProduct = selectedProductRef.current;
    const hasValidSearch = productoSearch.length >= 1;
    const isSelectedMatch = selectedProduct && productoSearch === selectedProduct.nombre;
    
    if (hasValidSearch && !isSelectedMatch) {
      const timer = setTimeout(() => {
        buscarProductos(productoSearch);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!hasValidSearch || isSelectedMatch) {
      setProductos([]);
      setShowDropdown(false);
    }
  }, [productoSearch]);

  const buscarProductos = async (query) => {
    setLoadingProductos(true);
    try {
      const response = await posAPI.buscarProductos(query);
      let productosData = [];
      if (response && response.success && response.data) {
        if (response.data.success && response.data.data) {
          productosData = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response.data)) {
          productosData = response.data;
        }
      }
      setProductos(productosData);
      if (productosData.length > 0) {
        setShowDropdown(true);
      }
    } catch (err) {
      console.error('Error buscando productos:', err);
      setProductos([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  const seleccionarProducto = (producto) => {
    selectedProductRef.current = producto;
    setProductoId(producto.id);
    setProductoSeleccionado(producto);
    setProductoSearch(producto.nombre);
    setShowDropdown(false);
    setProductos([]);
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productoId) return;
    onCreate({
      producto: parseInt(productoId),
      cantidad_disponible: parseInt(cantidad),
      precio_compra: parseFloat(precioCompra),
      activo: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 mr-3">
              <FontAwesomeIcon icon={faPlus} className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nuevo Lote
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
            Cada nueva compra = nuevo lote. El sistema usa FIFO.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Producto *
            </label>
            <div className="relative">
              <input
                type="text"
                value={productoSearch}
                onChange={(e) => {
                  setProductoSearch(e.target.value);
                  if (productoSeleccionado && e.target.value !== productoSeleccionado.nombre) {
                    setProductoId('');
                    setProductoSeleccionado(null);
                  }
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Buscar por nombre o ID..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                autoComplete="off"
              />
              <FontAwesomeIcon 
                icon={loadingProductos ? faBoxOpen : faSearch} 
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${loadingProductos ? 'animate-spin' : ''}`}
              />
            </div>
            
            {/* Dropdown de productos */}
            {showDropdown && productos.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {productos.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => seleccionarProducto(prod)}
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900 text-sm border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{prod.nombre}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Stock: {prod.stock_actual || 0} | Precio: ${prod.precio_venta}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {productoSeleccionado && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/30 rounded border border-green-200 dark:border-green-700">
                <div className="text-sm text-green-800 dark:text-green-200 flex items-center">
                  <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
                  Seleccionado: {productoSeleccionado.nombre}
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cantidad *
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              min="1"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precio de Compra *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !productoId}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              {loading ? 'Creando...' : 'Crear Lote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoteEditModal = ({ isOpen, onClose, onUpdate, lote, loading }) => {
  const [cantidad, setCantidad] = useState(lote?.cantidad_disponible || 0);
  const [precioCompra, setPrecioCompra] = useState(lote?.precio_compra || 0);
  const [activo, setActivo] = useState(lote?.activo ?? true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      cantidad_disponible: parseInt(cantidad),
      precio_compra: parseFloat(precioCompra),
      activo
    });
  };

  const isReducingStock = parseInt(cantidad || 0) <= (lote?.cantidad_disponible || 0);
  const isSamePrice = parseFloat(precioCompra || 0) === parseFloat(lote?.precio_compra || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-3">
              <FontAwesomeIcon icon={faEdit} className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Editar Lote #{lote?.id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        {!isReducingStock && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-400">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              Solo corregir errores de digitación. Para nuevas compras, CREA un nuevo lote.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cantidad
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
              min="0"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precio de Compra
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Lote activo</span>
            </label>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoteInfoModal = ({ isOpen, onClose, lote }) => {
  if (!isOpen || !lote) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-CO');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mr-3">
              <FontAwesomeIcon icon={faCubes} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detalles del Lote
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Producto</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{lote.producto_nombre}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Cantidad</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              lote.cantidad_disponible > 0 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {lote.cantidad_disponible} unidades
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Precio Compra</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(lote.precio_compra)}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Fecha Ingreso</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(lote.fecha_ingreso)}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Estado</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              lote.activo 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {lote.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          
          {lote.producto_categoria && (
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Categoría</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{lote.producto_categoria}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FontAwesomeIcon icon={faEye} className="mr-2" />
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LotesPage;