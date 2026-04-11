// src/modulos/categorias-servicios/pages/CategoriaServicioPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useCategorias } from '../hooks/useCategorias';
import CategoriaTable from './components/CategoriaTable';
import CategoriaSearch from './components/CategoriaSearch';
import CategoriaCreateModal from './components/CategoriaCreateModal';
import CategoriaEditModal from './components/CategoriaEditModal';
import InfoCategoriaModal from './components/InfoCategoriaModal';
import CategoriaActionModal from './components/CategoriaActionModal';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faListAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const CategoriaServicioPage = () => {
  const {
    categorias,
    loading,
    error,
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleActiveCategoria,
    softDeleteCategoria,
    restoreCategoria,
    hardDeleteCategoria,
    getCategoriaStats,
    clearError,
    pagination,
  } = useCategorias();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInfoCategoria, setSelectedInfoCategoria] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedActionCategoria, setSelectedActionCategoria] = useState(null);
  const [actionType, setActionType] = useState(null);
  
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Carga inicial y cambios de página - solo primitivos estables
  useEffect(() => {
    fetchCategorias(filters, page, pageSize);
  }, [page, pageSize]);

  // Cuando cambian filtros, resetear a página 1 y buscar
  // ✅ useCallback para estabilizar la función
  const handleSearch = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchCategorias(newFilters, 1, pageSize);
  }, [pageSize, fetchCategorias]);

  // Error toast
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleCreate = async (categoriaData) => {
    try {
      await createCategoria(categoriaData);
      setIsCreateModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleEdit = (categoria) => {
    setCurrentCategoria(categoria);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (id, categoriaData) => {
    try {
      await updateCategoria(id, categoriaData);
      setIsEditModalOpen(false);
      setCurrentCategoria(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (categoria) => {
    if (window.confirm(`¿Eliminar categoría "${categoria.nombre}"?`)) {
      try {
        await deleteCategoria(categoria.id);
      } catch (err) {
        // error already handled by hook
      }
    }
  };

  const openActionModal = (categoria, type) => {
    setSelectedActionCategoria(categoria);
    setActionType(type);
    setActionModalOpen(true);
  };

  const handleAction = async (categoriaId, type) => {
    try {
      switch (type) {
        case 'softDelete':
          await softDeleteCategoria(categoriaId);
          break;
        case 'hardDelete':
          await hardDeleteCategoria(categoriaId);
          break;
        case 'restore':
          await restoreCategoria(categoriaId);
          break;
        case 'toggleActivo':
          await toggleActiveCategoria(categoriaId);
          break;
      }
      fetchCategorias(filters, page, pageSize);
    } catch (err) {
      // errors logged in hook
    }
  };

  const handleInfo = (categoria) => {
    setSelectedInfoCategoria(categoria);
    setIsInfoModalOpen(true);
  };

  const totalPages = pagination.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {!loading && categorias.length === 0 && !error && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  No hay categorías de servicios para mostrar
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FontAwesomeIcon icon={faListAlt} className="mr-3 text-green-600" />
            Categorías de Servicios
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Registrar Categoría
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <CategoriaSearch onSearch={handleSearch} initialFilters={filters} />
            </div>
            <CategoriaTable
              categorias={categorias}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={(id) => openActionModal(categorias.find(c => c.id === id), 'toggleActivo')}
              onInfo={handleInfo}
              onSoftDelete={(id) => openActionModal(categorias.find(c => c.id === id), 'softDelete')}
              onRestore={(id) => openActionModal(categorias.find(c => c.id === id), 'restore')}
              loading={loading}
            />
          </div>
        </div>

        {pagination.totalItems > pageSize && (
          <div className="mt-4 flex justify-center items-center gap-2 text-sm text-gray-500">
            <button
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="px-3 py-1 rounded-md border bg-white disabled:opacity-50"
            >
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="px-3 py-1 rounded-md border bg-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}

        <CategoriaCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
          loading={loading}
        />

        <CategoriaEditModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setCurrentCategoria(null); }}
          onUpdate={handleUpdate}
          currentCategoria={currentCategoria}
          loading={loading}
        />

        <InfoCategoriaModal
          isOpen={isInfoModalOpen}
          onClose={() => { setIsInfoModalOpen(false); setSelectedInfoCategoria(null); }}
          categoria={selectedInfoCategoria}
        />

        <CategoriaActionModal
          isOpen={actionModalOpen}
          onClose={() => { setActionModalOpen(false); setSelectedActionCategoria(null); setActionType(null); }}
          categoria={selectedActionCategoria}
          actionType={actionType}
          onConfirm={handleAction}
        />
      </div>
    </div>
  );
};

export default CategoriaServicioPage;