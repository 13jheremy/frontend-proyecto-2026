// src/hooks/useCatalog.js
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const ITEMS_POR_PAGINA = 20;

  const abortControllerRef = useRef(null);
  const filtrosRef = useRef(filtros);
  const timeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const categoriasLoaded = useRef(false);

  useEffect(() => {
    filtrosRef.current = filtros;
  }, [filtros]);

  const updateFiltros = useCallback((newFiltros) => {
    setFiltros((prev) => ({ ...prev, ...newFiltros }));
    setPagina(1); // Resetear a primera página al cambiar filtros
  }, []);

  const clearFiltros = useCallback(() => {
    setFiltros({
      search: "",
      categoria: "all",
      ordering: "nombre",
      destacado: "all"
    });
    setPagina(1);
  }, []);

  const cambiarPagina = useCallback((nuevaPagina) => {
    setPagina(nuevaPagina);
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
    params.page = pagina;
    params.page_size = ITEMS_POR_PAGINA;

    // Check cache and throttling
    const cacheKey = requestCache.getCacheKey('/api/publico/productos/', params);
    
    // For initial load, always try cache first without throttling check
    if (isInitialMount.current || requestCache.shouldThrottle(cacheKey)) {
      console.log('Request throttled or initial load, checking cache');
      const cachedProducts = requestCache.getCached(cacheKey);
      
      if (cachedProducts) {
        const productosData = cachedProducts.results || cachedProducts || [];
        const totalCount = cachedProducts.count || productosData.length;
        
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
        setTotalPaginas(Math.ceil(totalCount / ITEMS_POR_PAGINA));
        
        if (isInitialMount.current) {
          isInitialMount.current = false;
        }
        
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Cargar categorías solo una vez
      if (!categoriasLoaded.current) {
        const categoriasCacheKey = requestCache.getCacheKey('/api/publico/categorias/', {});
        const cachedCategories = requestCache.getCached(categoriasCacheKey);
        
        if (cachedCategories) {
          const categoriasData = cachedCategories.results || cachedCategories || [];
          setCategorias(categoriasData);
          categoriasLoaded.current = true;
        } else {
          const categoriasResp = await retryWithBackoff(() => categoriesPublic.getAll({ signal }), 2, 2000);
          if (!signal.aborted && categoriasResp.success) {
            const categoriasData = categoriasResp.data.results || categoriasResp.data || [];
            setCategorias(categoriasData);
            requestCache.setCache(categoriasCacheKey, categoriasData);
            categoriasLoaded.current = true;
          }
        }
      }

      const productosResp = await retryWithBackoff(() => productsAPI.getCatalog({ ...params, signal }), 2, 2000);

      if (signal.aborted) {
        return;
      }
      
      if (!productosResp.success) {
        throw new Error(productosResp.error);
      }

      const productosData = productosResp.data.results || productosResp.data || [];
      const totalCount = productosResp.data.count || productosData.length;
      
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
      
      // Cache the response
      requestCache.setCache(cacheKey, productosResp.data);
      
      setProductos(productosFormateados);
      setTotalPaginas(Math.ceil(totalCount / ITEMS_POR_PAGINA));

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
  }, [pagina]);

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
    }, 300); // Reducido de 800ms a 300ms

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filtros, fetchCatalogo]);

  // Fetch when page changes
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchCatalogo();
    }
  }, [pagina, fetchCatalogo]);

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

  // Memoizar estadísticas
  const statsMemoizadas = useMemo(() => ({
    totalProductos: productos.length,
    totalCategorias: categorias.length,
    productosDestacados: productos.filter((p) => p.destacado).length,
    productosConStock: productos.filter((p) => p.stock_actual > 0).length,
  }), [productos, categorias]);

  return {
    productos,
    categorias,
    catalogStats: statsMemoizadas,
    loading,
    error,
    filtros,
    updateFiltros,
    clearFiltros,
    refetch: fetchCatalogo,
    pagina,
    totalPaginas,
    cambiarPagina,
    ITEMS_POR_PAGINA,
  };
};