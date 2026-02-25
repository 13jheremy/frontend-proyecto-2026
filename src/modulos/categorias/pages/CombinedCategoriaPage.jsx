// src/modulos/servicios/pages/CombinedCategoriaPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useCategorias } from '../hooks/useCategorias';
import { useCategoriaServicios } from '../hooks/useCategoriaServicios';
import CategoriaTable from './components/CategoriaTable';
import CategoriaServicioTable from './components/CategoriaServicioTable';
import CategoriaCreateModal from './components/CategoriaCreateModal';
import CategoriaEditModal from './components/CategoriaEditModal';
import CategoriaServicioCreateModal from './components/CategoriaServicioCreateModal';
import CategoriaServicioEditModal from './components/CategoriaServicioEditModal';
import CategoriaSearch from './components/CategoriaSearch';
import CategoriaServicioSearch from './components/CategoriaServicioSearch';
import InfoCategoriaModal from './components/InfoCategoriaModal';
import InfoCategoriaServicioModal from './components/InfoCategoriaServicioModal';
import CategoriaActionModal from './components/CategoriaActionModal';
import CategoriaServicioActionModal from './components/CategoriaServicioActionModal';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faListAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

/**
 * Página combinada para la gestión de categorías y servicios de categoría.
 */
const CombinedCategoriaPage = () => {
  // Hooks para categorías
  const {
    categorias,
    loading: loadingCategorias,
    error: errorCategorias,
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleActiveCategoria,
    softDeleteCategoria,
    restoreCategoria,
    hardDeleteCategoria,
    getCategoriaStats,
    clearError: clearErrorCategorias,
    pagination: categoriaPagination,
  } = useCategorias();

  // Hooks para servicios de categoría
  const {
    categoriaServicios,
    loading: loadingServicios,
    error: errorServicios,
    fetchCategoriaServicios,
    createCategoriaServicio,
    updateCategoriaServicio,
    deleteCategoriaServicio,
    toggleActiveCategoriaServicio,
    softDeleteCategoriaServicio,
    restoreCategoriaServicio,
    hardDeleteCategoriaServicio,
    getCategoriaServicioStats,
    clearError: clearErrorServicios,
    pagination: servicioPagination,
  } = useCategoriaServicios();

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState(null);
  const [isServicioCreateModalOpen, setIsServicioCreateModalOpen] = useState(false);
  const [isServicioEditModalOpen, setIsServicioEditModalOpen] = useState(false);
  const [currentCategoriaServicio, setCurrentCategoriaServicio] = useState(null);

  // Estados para modales de información
  const [isInfoCategoriaModalOpen, setIsInfoCategoriaModalOpen] = useState(false);
  const [selectedInfoCategoria, setSelectedInfoCategoria] = useState(null);
  const [isInfoCategoriaServicioModalOpen, setIsInfoCategoriaServicioModalOpen] = useState(false);
  const [selectedInfoCategoriaServicio, setSelectedInfoCategoriaServicio] = useState(null);

  // Estados para modales de acción
  const [categoriaActionModalOpen, setCategoriaActionModalOpen] = useState(false);
  const [selectedCategoriaAction, setSelectedCategoriaAction] = useState(null);
  const [categoriaActionType, setCategoriaActionType] = useState(null);
  const [categoriaServicioActionModalOpen, setCategoriaServicioActionModalOpen] = useState(false);
  const [selectedCategoriaServicioAction, setSelectedCategoriaServicioAction] = useState(null);
  const [categoriaServicioActionType, setCategoriaServicioActionType] = useState(null);

  const loading = loadingCategorias || loadingServicios;

  // Estados para filtros y búsqueda
  const [filters, setFilters] = useState({
    search: '',
    activo: '',
  });
  const [servicioFilters, setServicioFilters] = useState({
    search: '',
    categoria_id: '',
    activo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const memoizedFetchCategorias = useCallback(() => {
    const searchParams = {
      ...filters,
      page: currentPage,
      page_size: 10
    };
    fetchCategorias(searchParams);
  }, [filters, currentPage, fetchCategorias]);

  const memoizedFetchCategoriaServicios = useCallback(() => {
    const searchParams = {
      ...servicioFilters,
      page: currentPage,
      page_size: 10
    };
    fetchCategoriaServicios(searchParams);
  }, [servicioFilters, currentPage, fetchCategoriaServicios]);

  useEffect(() => {
    memoizedFetchCategorias();
    memoizedFetchCategoriaServicios();
  }, [memoizedFetchCategorias, memoizedFetchCategoriaServicios]);

  useEffect(() => {
    if (errorCategorias) {
      toast.error(`Error: ${errorCategorias}`);
      const timeout = setTimeout(() => {
        clearErrorCategorias();
      }, 5000);
      return () => clearTimeout(timeout);
    }
    if (errorServicios) {
      toast.error(`Error: ${errorServicios}`);
      const timeout = setTimeout(() => {
        clearErrorServicios();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [errorCategorias, errorServicios, clearErrorCategorias, clearErrorServicios]);

  const handleSearch = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleServicioSearch = useCallback((newFilters) => {
    setServicioFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleCreateCategoria = async (categoriaData) => {
    try {
      await createCategoria(categoriaData);
      toast.success('Categoría registrada exitosamente!');
      setIsCreateModalOpen(false);
      setCurrentPage(1);
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al registrar categoría';
      toast.error(`Error al registrar categoría: ${errorMessage}`);
    }
  };

  const handleEditCategoria = (categoria) => {
    setCurrentCategoria(categoria);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategoria = async (id, categoriaData) => {
    try {
      await updateCategoria(id, categoriaData);
      toast.success('Categoría actualizada exitosamente!');
      setIsEditModalOpen(false);
      setCurrentCategoria(null);
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al actualizar categoría';
      toast.error(`Error al actualizar categoría: ${errorMessage}`);
    }
  };

  // Handlers para modales de información
  const handleInfoCategoria = useCallback((categoria) => {
    setSelectedInfoCategoria(categoria);
    setIsInfoCategoriaModalOpen(true);
  }, []);

  const handleInfoCategoriaServicio = useCallback((servicio) => {
    setSelectedInfoCategoriaServicio(servicio);
    setIsInfoCategoriaServicioModalOpen(true);
  }, []);

  // Handlers para modales de acción
  const openCategoriaActionModal = (categoria, type) => {
    setSelectedCategoriaAction(categoria);
    setCategoriaActionType(type);
    setCategoriaActionModalOpen(true);
  };

  const openCategoriaServicioActionModal = (servicio, type) => {
    setSelectedCategoriaServicioAction(servicio);
    setCategoriaServicioActionType(type);
    setCategoriaServicioActionModalOpen(true);
  };

  // Handlers para acciones de categoría
  const handleCategoriaAction = async (categoriaId, actionType) => {
    try {
      switch (actionType) {
        case 'softDelete':
          await softDeleteCategoria(categoriaId);
          toast.success('Categoría eliminada temporalmente exitosamente!');
          break;
        case 'hardDelete':
          await hardDeleteCategoria(categoriaId);
          toast.success('Categoría eliminada permanentemente exitosamente!');
          break;
        case 'restore':
          await restoreCategoria(categoriaId);
          toast.success('Categoría restaurada exitosamente!');
          break;
        case 'toggleActivo':
          await toggleActiveCategoria(categoriaId);
          toast.success('Estado de la categoría actualizado exitosamente!');
          break;
        default:
          break;
      }
      memoizedFetchCategorias();
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido en la acción';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleCategoriaServicioAction = async (servicioId, actionType) => {
    try {
      switch (actionType) {
        case 'softDelete':
          await softDeleteCategoriaServicio(servicioId);
          toast.success('Servicio eliminado temporalmente exitosamente!');
          break;
        case 'hardDelete':
          await hardDeleteCategoriaServicio(servicioId);
          toast.success('Servicio eliminado permanentemente exitosamente!');
          break;
        case 'restore':
          await restoreCategoriaServicio(servicioId);
          toast.success('Servicio restaurado exitosamente!');
          break;
        case 'toggleActivo':
          await toggleActiveCategoriaServicio(servicioId);
          toast.success('Estado del servicio actualizado exitosamente!');
          break;
        default:
          break;
      }
      memoizedFetchCategoriaServicios();
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido en la acción';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteCategoria = async (categoria) => {
    const confirmMessage = `¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?\n\nEsta acción es irreversible.`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteCategoria(categoria.id);
        toast.success(`Categoría "${categoria.nombre}" eliminada exitosamente!`);
        if (categorias.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          memoizedFetchCategorias();
        }
      } catch (err) {
        const errorMessage = err.message || 'Error desconocido al eliminar categoría';
        toast.error(`Error al eliminar categoría: ${errorMessage}`);
      }
    }
  };

  const handleCreateCategoriaServicio = async (servicioData) => {
    try {
      await createCategoriaServicio(servicioData);
      toast.success('Servicio registrado exitosamente!');
      setIsServicioCreateModalOpen(false);
      setCurrentPage(1);
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al registrar servicio';
      toast.error(`Error al registrar servicio: ${errorMessage}`);
    }
  };

  const handleEditCategoriaServicio = (servicio) => {
    setCurrentCategoriaServicio(servicio);
    setIsServicioEditModalOpen(true);
  };

  const handleUpdateCategoriaServicio = async (id, servicioData) => {
    try {
      await updateCategoriaServicio(id, servicioData);
      toast.success('Servicio actualizado exitosamente!');
      setIsServicioEditModalOpen(false);
      setCurrentCategoriaServicio(null);
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al actualizar servicio';
      toast.error(`Error al actualizar servicio: ${errorMessage}`);
    }
  };

  const handleDeleteCategoriaServicio = async (servicio) => {
    const confirmMessage = `¿Estás seguro de que quieres eliminar el servicio "${servicio.nombre_servicio}"?\n\nEsta acción es irreversible.`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteCategoriaServicio(servicio.id);
        toast.success(`Servicio "${servicio.nombre_servicio}" eliminado exitosamente!`);
        if (categoriaServicios.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          memoizedFetchCategoriaServicios();
        }
      } catch (err) {
        const errorMessage = err.message || 'Error desconocido al eliminar servicio';
        toast.error(`Error al eliminar servicio: ${errorMessage}`);
      }
    }
  };

  // Función para obtener estadísticas
  const getEstadisticas = () => {
    const totalCategorias = categoriaPagination.count || 0;
    const categoriasActivas = categorias.filter(c => c.activo && !c.eliminado).length;
    const categoriasInactivas = categorias.filter(c => !c.activo && !c.eliminado).length;
    const categoriasEliminadas = categorias.filter(c => c.eliminado).length;

    const totalServicios = servicioPagination.count || 0;
    const serviciosActivos = categoriaServicios.filter(s => s.activo && !s.eliminado).length;
    const serviciosInactivos = categoriaServicios.filter(s => !s.activo && !s.eliminado).length;
    const serviciosEliminados = categoriaServicios.filter(s => s.eliminado).length;

    return {
      totalCategorias,
      categoriasActivas,
      categoriasInactivas,
      categoriasEliminadas,
      totalServicios,
      serviciosActivos,
      serviciosInactivos,
      serviciosEliminados
    };
  };

  const estadisticas = getEstadisticas();

  const renderPagination = () => {
    const totalPages = Math.max(categoriaPagination.total_pages || 1, servicioPagination.total_pages || 1);
    if (totalPages <= 1) return null;

    return (
      <div className="mt-4 flex justify-center items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <button
          disabled={!categoriaPagination.previous && !servicioPagination.previous}
          onClick={() => setCurrentPage(prev => prev - 1)}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        <span className="px-3 py-1">
          Página {currentPage} de {totalPages}
        </span>

        <button
          disabled={!categoriaPagination.next && !servicioPagination.next}
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Principal con Estadísticas */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FontAwesomeIcon icon={faListAlt} className="mr-3 text-blue-600" />
            Gestión de Categorías
          </h1>

          {/* ESTADÍSTICAS */}
          <div className="hidden md:flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            {/* Categorías */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {estadisticas.totalCategorias}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categorías
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {estadisticas.categoriasActivas}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Activas
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {estadisticas.categoriasInactivas}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Inactivas
              </div>
            </div>

            {estadisticas.categoriasEliminadas > 0 && (
              <>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center">
                    {estadisticas.categoriasEliminadas}
                    <FontAwesomeIcon icon={faExclamationTriangle} className="ml-1 text-sm" />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Eliminadas
                  </div>
                </div>
              </>
            )}

            {/* Servicios */}
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {estadisticas.totalServicios}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Servicios
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {estadisticas.serviciosActivos}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Activos
              </div>
            </div>
          </div>
        </div>

        {/* Sección Categorías */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <FontAwesomeIcon icon={faListAlt} className="mr-3 text-blue-600" />
                Categorías de Productos
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                disabled={loadingCategorias}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Registrar Categoría de Producto
              </button>
            </div>

            {/* Filtro de Categorías */}
            <div className="mb-6">
              <CategoriaSearch onSearch={handleSearch} initialFilters={filters} />
            </div>

            {/* Tabla de Categorías */}
            <CategoriaTable
              categorias={categorias}
              onEdit={handleEditCategoria}
              onDelete={handleDeleteCategoria}
              onToggleActive={(id) => openCategoriaActionModal(categorias.find(c => c.id === id), 'toggleActivo')}
              onInfo={handleInfoCategoria}
              onSoftDelete={(id) => openCategoriaActionModal(categorias.find(c => c.id === id), 'softDelete')}
              onRestore={(id) => openCategoriaActionModal(categorias.find(c => c.id === id), 'restore')}
              onHardDelete={(id) => openCategoriaActionModal(categorias.find(c => c.id === id), 'hardDelete')}
              loading={loadingCategorias}
            />
          </div>
        </div>

        {/* Sección Servicios de Categoría */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <FontAwesomeIcon icon={faListAlt} className="mr-3 text-green-600" />
                Categorías de Servicios
              </h2>
              <button
                onClick={() => setIsServicioCreateModalOpen(true)}
                disabled={loadingServicios}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Registrar Categoria de Servicio
              </button>
            </div>

            {/* Filtro de Servicios */}
            <div className="mb-6">
              <CategoriaServicioSearch 
                onSearch={handleServicioSearch} 
                initialFilters={servicioFilters} 
                categoriasDisponibles={categorias} 
              />
            </div>

            {/* Tabla de Servicios */}
            <CategoriaServicioTable
              categoriaServicios={categoriaServicios}
              onEdit={handleEditCategoriaServicio}
              onDelete={handleDeleteCategoriaServicio}
              onToggleActive={(id) => openCategoriaServicioActionModal(categoriaServicios.find(s => s.id === id), 'toggleActivo')}
              onInfo={handleInfoCategoriaServicio}
              onSoftDelete={(id) => openCategoriaServicioActionModal(categoriaServicios.find(s => s.id === id), 'softDelete')}
              onRestore={(id) => openCategoriaServicioActionModal(categoriaServicios.find(s => s.id === id), 'restore')}
              onHardDelete={(id) => openCategoriaServicioActionModal(categoriaServicios.find(s => s.id === id), 'hardDelete')}
              loading={loadingServicios}
            />
          </div>

          {/* Paginación */}
          {renderPagination()}
        </div>

        {/* Modales */}
        <CategoriaCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCategoria}
          loading={loadingCategorias}
          error={errorCategorias}
        />

        <CategoriaEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentCategoria(null);
          }}
          onUpdate={handleUpdateCategoria}
          currentCategoria={currentCategoria}
          loading={loadingCategorias}
          error={errorCategorias}
        />

        <CategoriaServicioCreateModal
          isOpen={isServicioCreateModalOpen}
          onClose={() => setIsServicioCreateModalOpen(false)}
          onCreate={handleCreateCategoriaServicio}
          loading={loadingServicios}
          error={errorServicios}
        />

        <CategoriaServicioEditModal
          isOpen={isServicioEditModalOpen}
          onClose={() => {
            setIsServicioEditModalOpen(false);
            setCurrentCategoriaServicio(null);
          }}
          onUpdate={handleUpdateCategoriaServicio}
          currentCategoriaServicio={currentCategoriaServicio}
          loading={loadingServicios}
          error={errorServicios}
        />

        {/* Modal de información de categoría */}
        <InfoCategoriaModal
          isOpen={isInfoCategoriaModalOpen}
          onClose={() => {
            setIsInfoCategoriaModalOpen(false);
            setSelectedInfoCategoria(null);
          }}
          categoria={selectedInfoCategoria}
        />

        {/* Modal de información de servicio de categoría */}
        <InfoCategoriaServicioModal
          isOpen={isInfoCategoriaServicioModalOpen}
          onClose={() => {
            setIsInfoCategoriaServicioModalOpen(false);
            setSelectedInfoCategoriaServicio(null);
          }}
          servicio={selectedInfoCategoriaServicio}
          categoriasDisponibles={categorias}
        />

        {/* Modal de acción de categoría */}
        <CategoriaActionModal
          isOpen={categoriaActionModalOpen}
          onClose={() => {
            setCategoriaActionModalOpen(false);
            setSelectedCategoriaAction(null);
            setCategoriaActionType(null);
          }}
          categoria={selectedCategoriaAction}
          actionType={categoriaActionType}
          onConfirm={handleCategoriaAction}
        />

        {/* Modal de acción de servicio de categoría */}
        <CategoriaServicioActionModal
          isOpen={categoriaServicioActionModalOpen}
          onClose={() => {
            setCategoriaServicioActionModalOpen(false);
            setSelectedCategoriaServicioAction(null);
            setCategoriaServicioActionType(null);
          }}
          servicio={selectedCategoriaServicioAction}
          actionType={categoriaServicioActionType}
          onConfirm={handleCategoriaServicioAction}
          categoriasDisponibles={categorias}
        />
      </div>
    </div>
  );
};

export default CombinedCategoriaPage;