    // src/modules/productos/api/index.js
    import { productsAPI, categoriesAPI, suppliersAPI } from '../../../services/api'; // ADDED categoriesAPI and suppliersAPI

    export const productoApi = {
      // PRODUCTOS BÁSICOS
      getProductos: async (params = {}) => {
        const response = await productsAPI.getAll(params);
        return response.data;
      },

      getProductoById: async (id) => {
        const response = await productsAPI.getById(id);
        return response.data;
      },

      createProducto: async (data) => {
        const response = await productsAPI.create(data);
        return response.data;
      },

      updateProducto: async (id, data) => {
        const response = await productsAPI.update(id, data);
        return response.data;
      },

      // ELIMINACIÓN TEMPORAL Y PERMANENTE
      softDeleteProducto: async (id) => {
        const response = await productsAPI.patch(id, { eliminado: true });
        return response.data;
      },

      hardDeleteProducto: async (id) => {
        const response = await productsAPI.hardDelete(id);
        return response.status;
      },

      // RESTAURAR PRODUCTO
      restoreProducto: async (id) => {
        const response = await productsAPI.restoreProduct(id, { eliminado: false });
        return response.data;
      },

      // TOGGLE ESTADO ACTIVO/INACTIVO
      toggleActivoProducto: async (id, activo) => {
        const response = await productsAPI.toggleActive(id, activo);
        return response.data;
      },

      // TOGGLE DESTACADO
      toggleDestacado: async (id, destacado) => {
        const response = await productsAPI.toggleFeatured(id, destacado);
        return response.data;
      },

      // STOCK Y GESTIÓN ESPECIAL
      getProductosStockBajo: async () => {
        const response = await productsAPI.getLowStock();
        return response.data;
      },

      updateStock: async (id, stockActual, motivo = 'Actualización manual') => {
        const response = await productsAPI.updateStock(id, stockActual, motivo);
        return response.data;
      },

      // CATEGORÍAS
      getCategorias: async (params = {}) => {
        const response = await categoriesAPI.getAll(params);
        return response.data;
      },

      // PROVEEDORES
      getProveedores: async (params = {}) => {
        const response = await suppliersAPI.getAll(params);
        return response.data;
      }
    };
