// src/modulos/categorias-productos/pages/CategoriaProductoPage.jsx
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

const CategoriaProductoPage = () => {
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
  
  const [filters, setFilters] = useState({ search: '', activo: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const memoizedFetchCategorias = useCallback(() => {
    const searchParams = { ...filters, page: currentPage, page_size: 10 };
    fetchCategorias(searchParams);
  }, [filters, currentPage, fetchCategorias]);

  useEffect(() => {
    memoizedFetchCategorias();
  }, [memoizedFetchCategorias]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
      const timeout = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error, clearError]);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCreate = async (categoriaData) => {
    try {
      await createCategoria(categoriaData);
      toast.success('Categoría registrada exitosamente!');
      setIsCreateModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Error al registrar categoría');
    }
  };

  const handleEdit = (categoria) => {
    setCurrentCategoria(categoria);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (id, categoriaData) => {
    try {
      await updateCategoria(id, categoriaData);
      toast.success('Categoría actualizada exitosamente!');
      setIsEditModalOpen(false);
      setCurrentCategoria(null);
    } catch (err) {
      toast.error(err.message || 'Error al actualizar categoría');
    }
  };

  const handleDelete = async (categoria) => {
    if (window.confirm(`¿Eliminar categoría "${categoria.nombre}"?`)) {
      try {
        await deleteCategoria(categoria);
        toast.success(`Categoría "${categoria.nombre}" eliminada!`);
      } catch (err) {
        toast.error(err.message || 'Error al eliminar categoría');
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
          toast.success('Categoría eliminada temporalmente!');
          break;
        case 'hardDelete':
          await hardDeleteCategoria(categoriaId);
          toast.success('Categoría eliminada permanentemente!');
          break;
        case 'restore':
          await restoreCategoria(categoriaId);
          toast.success('Categoría restaurada!');
          break;
        case 'toggleActivo':
          await toggleActiveCategoria(categoriaId);
          toast.success('Estado actualizado!');
          break;
      }
      memoizedFetchCategorias();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Error en la acción');
    }
  };

  const handleInfo = (categoria) => {
    setSelectedInfoCategoria(categoria);
    setIsInfoModalOpen(true);
  };

  const totalPages = pagination.total_pages || 1;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {!loading && categorias.length === 0 && !error && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  No hay categorías de productos para mostrar
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FontAwesomeIcon icon={faListAlt} className="mr-3 text-blue-600" />
            Categorías de Productos
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center items-center gap-2 text-sm text-gray-500">
            <button
              disabled={!pagination.previous}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 rounded-md border bg-white disabled:opacity-50"
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              disabled={!pagination.next}
              onClick={() => handlePageChange(currentPage + 1)}
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

export default CategoriaProductoPage;