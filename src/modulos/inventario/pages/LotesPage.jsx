// src/modulos/inventario/pages/LotesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLotes } from '../hooks/useLotes';
import { useAuth } from '../../../context/AuthContext';
import { PERMISSIONS } from '../../../utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBoxes, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

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

  const normalizedRoles = roles.map(r => r.toLowerCase());
  const canCreate = PERMISSIONS.INVENTORY.CREATE.some(p => normalizedRoles.includes(p.toLowerCase()));
  const canEdit = PERMISSIONS.INVENTORY.EDIT.some(p => normalizedRoles.includes(p.toLowerCase()));
  const canDelete = PERMISSIONS.INVENTORY.DELETE.some(p => normalizedRoles.includes(p.toLowerCase()));

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
    clearError
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <FontAwesomeIcon icon={faLayerGroup} className="mr-3 text-purple-600" />
          Gestión de Lotes (FIFO)
        </h1>

        <div className="hidden md:flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {estadisticas?.total_lotes || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              Total Lotes
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {estadisticas?.total_stock || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              Unidades
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estadisticas?.productos_con_lotes || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              Productos
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por producto..."
            value={filters.search}
            onChange={(e) => handleSearch({ ...filters, search: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {canCreate && (
          <button
            onClick={openCreateModal}
            disabled={loading}
            className="ml-4 flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Nuevo Lote
          </button>
        )}
      </div>

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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
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
                    Cargando...
                  </td>
                </tr>
              ) : lotes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No hay lotes registrados
                  </td>
                </tr>
              ) : (
                lotes.map((lote) => (
                  <tr key={lote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {lote.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {lote.producto_nombre || lote.producto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className={`px-2 py-1 rounded ${lote.cantidad_disponible > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                      <span className={`px-2 py-1 text-xs rounded-full ${lote.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {lote.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openInfoModal(lote)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        Ver
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => openEditModal(lote)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-3"
                        >
                          Editar
                        </button>
                      )}
                      {canDelete && lote.cantidad_disponible === 0 && (
                        <button
                          onClick={() => openDeleteModal(lote)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2">
          <button
            disabled={!pagination.previous}
            onClick={() => handlePageChange(page - 1)}
            className="px-3 py-1 rounded border dark:bg-gray-700 dark:text-white disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.next}
            onClick={() => handlePageChange(page + 1)}
            className="px-3 py-1 rounded border dark:bg-gray-700 dark:text-white disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {modals.create && (
        <LoteCreateModal
          isOpen={modals.create}
          onClose={() => closeModal('create')}
          onCreate={handleCreate}
          loading={loading}
        />
      )}

      {modals.edit && selectedLote && (
        <LoteEditModal
          isOpen={modals.edit}
          onClose={() => closeModal('edit')}
          onUpdate={handleUpdate}
          lote={selectedLote}
          loading={loading}
        />
      )}

      {modals.delete && selectedLote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ¿Está seguro de eliminar el lote #{selectedLote.id}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => closeModal('delete')}
                className="px-4 py-2 border rounded dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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

// Modal Components (inline for simplicity)
const LoteCreateModal = ({ isOpen, onClose, onCreate, loading }) => {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      producto: parseInt(productoId),
      cantidad_disponible: parseInt(cantidad),
      precio_compra: parseFloat(precioCompra),
      activo: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Nuevo Lote (Entrada de Inventario)
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID Producto
            </label>
            <input
              type="number"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cantidad
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
              required
              min="1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precio de Compra
            </label>
            <input
              type="number"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Crear Lote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoteEditModal = ({ isOpen, onClose, onUpdate, lote, loading }) => {
  const [cantidad, setCantidad] = useState(lote?.cantidad_disponible || '');
  const [precioCompra, setPrecioCompra] = useState(lote?.precio_compra || '');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Editar Lote #{lote?.id}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cantidad
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
              required
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precio de Compra
            </label>
            <input
              type="number"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Activo</span>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              Guardar
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detalles del Lote #{lote.id}
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Producto:</span>
            <span className="font-medium text-gray-900 dark:text-white">{lote.producto_nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Cantidad:</span>
            <span className="font-medium text-gray-900 dark:text-white">{lote.cantidad_disponible}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Precio Compra:</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(lote.precio_compra)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Fecha Ingreso:</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatDate(lote.fecha_ingreso)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Estado:</span>
            <span className={`px-2 py-1 text-xs rounded ${lote.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {lote.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          {lote.producto_categoria && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Categoría:</span>
              <span className="font-medium text-gray-900 dark:text-white">{lote.producto_categoria}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LotesPage;