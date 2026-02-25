// src/modules/productos/hooks/useProductos.js
import { useState, useEffect, useCallback } from 'react';
import { productoApi } from '../api/producto';
import { handleApiError, showNotification, productMessages } from '../../../utils/notifications';
import { useCategorias } from './useCategorias'; // Importar hook de categorías
import { useProveedores } from './useProveedores'; // Importar hook de proveedores

export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const { categorias, loading: loadingCategorias, error: errorCategorias } = useCategorias(); // Usar hook
  const { proveedores, loading: loadingProveedores, error: errorProveedores } = useProveedores(); // Usar hook
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Almacena el objeto de error completo
  const [pagination, setPagination] = useState({
    page: 1,
    
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Procesar filtros para la API
  const processFilters = (filters) => {
    const params = { ...filters };

    if (params.activo !== undefined && params.activo !== '') {
      params.activo = String(params.activo);
    }

    if (params.destacado !== undefined && params.destacado !== '') {
      params.destacado = String(params.destacado);
    }

    if (params.eliminado !== undefined && params.eliminado !== '') {
      params.eliminado = String(params.eliminado);
    }

    if (Array.isArray(params.categorias) && params.categorias.length > 0) {
      params.categorias = params.categorias.join(',');
    } else if (Array.isArray(params.categorias) && params.categorias.length === 0) {
      delete params.categorias;
    }

    if (Array.isArray(params.proveedores) && params.proveedores.length > 0) {
      params.proveedores = params.proveedores.join(',');
    } else if (Array.isArray(params.proveedores) && params.proveedores.length === 0) {
      delete params.proveedores;
    }

    return params;
  };

  // Obtener productos
  const fetchProductos = useCallback(async (filters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const processedFilters = processFilters(filters);
      const params = {
        ...processedFilters,
        page,
        page_size: pageSize,
      };

      const data = await productoApi.getProductos(params);

      if (data && data.results) {
        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        setProductos(data.results);
        setPagination({
          page,
          pageSize,
          totalItems,
          totalPages,
          next: data.next,
          previous: data.previous,
        });
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError); // Almacenar el objeto de error completo
      setProductos([]);
      setPagination({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear producto
  const createProducto = useCallback(async (productoData) => {
    setLoading(true);
    setError(null);

    try {
      // Preparar los datos para envío
      let dataToSend = productoData;

      // Si hay una imagen (File object), convertir a FormData
      if (productoData.imagen && productoData.imagen instanceof File) {
        const formData = new FormData();
        
        // Agregar todos los campos excepto la imagen
        Object.keys(productoData).forEach(key => {
          if (key !== 'imagen') {
            formData.append(key, productoData[key]);
          }
        });
        
        // Agregar la imagen
        formData.append('imagen', productoData.imagen);
        
        dataToSend = formData;
      } else {
        // Para datos sin imagen, mantener valores exactos
        dataToSend = productoData;
      }

      const data = await productoApi.createProducto(dataToSend);
      showNotification.success(productMessages.productCreated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError); // Almacenar el objeto de error completo

      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar producto
  const updateProducto = useCallback(async (id, productoData) => {
    setLoading(true);
    setError(null);

    try {
      // Preparar los datos para envío
      let dataToSend = productoData;

      // Si hay una imagen (File object), convertir a FormData
      if (productoData.imagen && productoData.imagen instanceof File) {
        const formData = new FormData();
        
        // Agregar todos los campos excepto la imagen
        Object.keys(productoData).forEach(key => {
          if (key !== 'imagen') {
            formData.append(key, productoData[key]);
          }
        });
        
        // Agregar la imagen
        formData.append('imagen', productoData.imagen);
        
        dataToSend = formData;
      } else {
        // Para datos sin imagen, mantener valores exactos
        dataToSend = productoData;
      }

      const data = await productoApi.updateProducto(id, dataToSend);
      showNotification.success(productMessages.productUpdated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError); // Almacenar el objeto de error completo

      if (Object.keys(apiError.fieldErrors).length === 0) {
        showNotification.error(apiError.message);
      }

      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminación temporal
  const softDeleteProducto = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await productoApi.softDeleteProducto(id);
      showNotification.success(productMessages.productSoftDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminación permanente
  const hardDeleteProducto = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await productoApi.hardDeleteProducto(id);
      showNotification.success(productMessages.productHardDeleted);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restaurar producto
  const restoreProducto = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await productoApi.restoreProducto(id);
      showNotification.success(productMessages.productRestored);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle estado activo
  const toggleProductoActivo = useCallback(async (id, activo) => {
    setLoading(true);
    setError(null);

    try {
      await productoApi.toggleActivoProducto(id, activo);
      showNotification.success(productMessages.statusChanged(activo));
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle destacado
  const toggleDestacado = useCallback(async (id, destacado) => {
    setLoading(true);
    setError(null);

    try {
      await productoApi.toggleDestacado(id, destacado);
      showNotification.success(productMessages.featuredChanged(destacado));
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar stock
  const updateStock = useCallback(async (id, stockActual, motivo) => {
    setLoading(true);
    setError(null);

    try {
      const data = await productoApi.updateStock(id, stockActual, motivo);
      showNotification.success(productMessages.stockUpdated);
      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función unificada para manejar acciones de producto
  const handleProductAction = useCallback(async (productoId, actionType, additionalData = null) => {
    try {
      switch (actionType) {
        case 'softDelete':
          await softDeleteProducto(productoId);
          break;
        case 'hardDelete':
          await hardDeleteProducto(productoId);
          break;
        case 'restore':
          await restoreProducto(productoId);
          break;
        case 'toggleActivo':
          const producto = productos.find(p => p.id === productoId);
          if (producto) {
            // Pasa el nuevo estado deseado al API
            await toggleProductoActivo(productoId, !producto.activo);
          }
          break;
        case 'toggleDestacado':
          const productoDestacado = productos.find(p => p.id === productoId);
          if (productoDestacado) {
            await toggleDestacado(productoId, !productoDestacado.destacado);
          }
          break;
        case 'updateStock':
          if (additionalData) {
            await updateStock(productoId, additionalData.stockActual, additionalData.motivo);
          }
          break;
        default:
          throw new Error(`Acción no reconocida: ${actionType}`);
      }
    } catch (err) {
      console.error(`Error en acción ${actionType}:`, err);
      throw err;
    }
  }, [productos, softDeleteProducto, hardDeleteProducto, restoreProducto, toggleProductoActivo, toggleDestacado, updateStock]);

  // Inicialización de productos
  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  return {
    // Estados
    productos,
    categorias, // Ahora vienen del hook useCategorias
    proveedores, // Ahora vienen del hook useProveedores
    loading: loading || loadingCategorias || loadingProveedores, // Combinar estados de carga
    error, // Objeto de error completo
    pagination,

    // Funciones principales
    fetchProductos,
    createProducto,
    updateProducto,
    
    // Funciones de gestión de estado
    softDeleteProducto,
    hardDeleteProducto,
    restoreProducto,
    toggleProductoActivo,
    toggleDestacado,
    updateStock,
    handleProductAction,

    // Utilidades
    clearError,
  };
};
