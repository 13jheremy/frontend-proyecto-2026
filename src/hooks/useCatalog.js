// src/hooks/useCatalog.js
import { useState, useEffect, useCallback, useRef } from "react";
import { productsAPI, categoriesPublic } from "../services/api";
import { handleApiError, retryWithBackoff } from "../utils/apiErrorHandlers";
import { requestCache } from "../utils/requestCache";

export const useCatalog = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [catalogStats, setCatalogStats] = useState({
    totalProductos: 0,
    totalCategorias: 0,
    productosDestacados: 0,
    productosConStock: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState({
    search: "",
    categoria: "all",
    ordering: "nombre",
    destacado: "all",
  });

  const abortControllerRef = useRef(null);
  const filtrosRef = useRef(filtros);
  const timeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    filtrosRef.current = filtros;
  }, [filtros]);

  const updateFiltros = useCallback((newFiltros) => {
    setFiltros((prev) => ({ ...prev, ...newFiltros }));
  }, []);

  const clearFiltros = useCallback(() => {
    setFiltros({ 
      search: "", 
      categoria: "all", 
      ordering: "nombre",
      destacado: "all"
    });
  }, []);

  const fetchCatalogo = useCallback(async () => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const currentFiltros = filtrosRef.current;
    const params = {};
    
    if (currentFiltros.search) params.search = currentFiltros.search;
    if (currentFiltros.categoria !== "all") params.categoria = currentFiltros.categoria;
    if (currentFiltros.destacado === "true") params.destacado = true;
    if (currentFiltros.destacado === "false") params.destacado = false;
    params.ordering = currentFiltros.ordering;

    // Check cache and throttling
    const cacheKey = requestCache.getCacheKey('/api/publico/productos/', params);
    const categoriasCacheKey = requestCache.getCacheKey('/api/publico/categorias/', {});
    
    // For initial load, always try cache first without throttling check
    if (isInitialMount.current || requestCache.shouldThrottle(cacheKey)) {
      console.log('Request throttled or initial load, checking cache');
      const cachedProducts = requestCache.getCached(cacheKey);
      const cachedCategories = requestCache.getCached(categoriasCacheKey);
      
      if (cachedProducts && cachedCategories) {
        const productosData = cachedProducts.results || cachedProducts || [];
        const categoriasData = cachedCategories.results || cachedCategories || [];
        
        const productosFormateados = productosData.map(producto => ({
          id: producto.id,
          nombre: producto.nombre,
          precio_venta: producto.precio_venta,
          imagen_url: producto.imagen_url,
          descripcion: producto.descripcion,
          stock_actual: producto.stock_actual,
          destacado: producto.destacado,
          categoria_nombre: producto.categoria_nombre,
          categoria_id: producto.categoria,
          fecha_registro: producto.fecha_registro,
        }));
        
        setProductos(productosFormateados);
        setCategorias(categoriasData);
        setCatalogStats({
          totalProductos: productosFormateados.length,
          totalCategorias: categoriasData.length,
          productosDestacados: productosFormateados.filter((p) => p.destacado).length,
          productosConStock: productosFormateados.filter((p) => p.stock_actual > 0).length,
        });
        
        if (isInitialMount.current) {
          isInitialMount.current = false;
        }
        
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const [productosResp, categoriasResp] = await Promise.all([
        retryWithBackoff(() => productsAPI.getCatalog({ ...params, signal }), 2, 2000),
        retryWithBackoff(() => categoriesPublic.getAll({ signal }), 2, 2000)
      ]);

      if (signal.aborted) {
        return;
      }
      
      if (!categoriasResp.success) {
        throw new Error(categoriasResp.error);
      }
      
      if (!productosResp.success) {
        throw new Error(productosResp.error);
      }

      const productosData = productosResp.data.results || productosResp.data || [];
      const categoriasData = categoriasResp.data.results || categoriasResp.data || [];
      
      const productosFormateados = productosData.map(producto => {
        return {
          id: producto.id,
          nombre: producto.nombre,
          precio_venta: producto.precio_venta,
          imagen_url: producto.imagen_url,
          descripcion: producto.descripcion,
          stock_actual: producto.stock_actual,
          destacado: producto.destacado,
          categoria_nombre: producto.categoria_nombre,
          categoria_id: producto.categoria,
          fecha_registro: producto.fecha_registro,
        };
      });
      
      // Cache the responses
      requestCache.setCache(cacheKey, productosData);
      requestCache.setCache(categoriasCacheKey, categoriasData);
      
      setProductos(productosFormateados);
      setCategorias(categoriasData);

      setCatalogStats({
        totalProductos: productosFormateados.length,
        totalCategorias: categoriasData.length,
        productosDestacados: productosFormateados.filter((p) => p.destacado).length,
        productosConStock: productosFormateados.filter((p) => p.stock_actual > 0).length,
      });

      if (isInitialMount.current) {
        isInitialMount.current = false;
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch on mount
  useEffect(() => {
    fetchCatalogo();
  }, [fetchCatalogo]);

  // Debounced fetch when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      return; // Skip on initial mount since we already fetch above
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchCatalogo();
    }, 800);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filtros, fetchCatalogo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    productos,
    categorias,
    catalogStats,
    loading,
    error,
    filtros,
    updateFiltros,
    clearFiltros,
    refetch: fetchCatalogo,
  };
};