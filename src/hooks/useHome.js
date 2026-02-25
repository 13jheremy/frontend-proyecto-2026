import { useState, useEffect, useRef } from "react";
import { productsAPI } from "../services/api";
import { retryWithBackoff } from "../utils/apiErrorHandlers";

export const useHome = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const hasLoadedRef = useRef(false);

  // Cargar productos destacados
  useEffect(() => {
    // Prevent duplicate requests
    if (hasLoadedRef.current) return;
    
    const loadFeaturedProducts = async () => {
      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await retryWithBackoff(() => productsAPI.getDestacados({ signal }), 2, 3000);
        
        if (signal.aborted) return;
        
        if (response.success) {
          const productos = response.data.results || response.data || [];
          
          // Transform products to slides format
          const slidesData = productos.map(producto => ({
            id: producto.id,
            title: producto.nombre,
            description: producto.descripcion || `Producto de alta calidad en categoría ${producto.categoria_nombre}`,
            price: `${parseFloat(producto.precio_venta || 0).toFixed(2)} BS`,
            image: producto.imagen_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
            category: producto.categoria_nombre,
            stock: producto.stock_actual || 0,
            destacado: producto.destacado
          }));
          
          setSlides(slidesData);
          hasLoadedRef.current = true;
        } else {
          throw new Error(response.error || "Error al cargar productos");
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || "Error al cargar productos destacados");
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadFeaturedProducts();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const goToPrevious = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    if (index >= 0 && index < slides.length) setCurrent(index);
  };

  return {
    slides,
    current,
    loading,
    error,
    goToPrevious,
    goToNext,
    goToSlide,
  };
};
