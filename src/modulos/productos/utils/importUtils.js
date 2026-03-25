// src/modulos/productos/utils/importUtils.js
/**
 * Utilidades para importación de productos desde CSV
 */

/**
 * Lee un archivo CSV y lo convierte en array de objetos
 * @param {File} file - Archivo CSV
 * @returns {Promise<Array>} - Array de objetos
 */
export const leerArchivoCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('El archivo CSV está vacío o no tiene datos'));
          return;
        }
        
        // Parsear encabezados
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Parsear filas
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index];
            });
            data.push(row);
          }
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
};

/**
 * Parsea una línea CSV manejando comillas
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim().replace(/^"|"$/g, ''));
  return values;
};

/**
 * Valida los datos de productos importados
 * @param {Array} productos - Array de productos a validar
 * @returns {Object} - { validos: Array, errores: Array }
 */
export const validarProductosImportacion = (productos) => {
  const validos = [];
  const errores = [];
  
  productos.forEach((producto, index) => {
    const errors = [];
    
    // Validar campos requeridos
    if (!producto.codigo || producto.codigo.trim() === '') {
      errors.push('Código es requerido');
    }
    
    if (!producto.nombre || producto.nombre.trim() === '') {
      errors.push('Nombre es requerido');
    }
    
    if (!producto.categoria || producto.categoria.trim() === '') {
      errors.push('Categoría es requerida');
    }
    
    // Validar precios
    const precioCompra = parseFloat(producto.precio_compra);
    const precioVenta = parseFloat(producto.precio_venta);
    
    if (isNaN(precioCompra) || precioCompra < 0) {
      errors.push('Precio de compra inválido');
    }
    
    if (isNaN(precioVenta) || precioVenta < 0) {
      errors.push('Precio de venta inválido');
    }
    
    if (!isNaN(precioCompra) && !isNaN(precioVenta) && precioVenta <= precioCompra) {
      errors.push('Precio de venta debe ser mayor al precio de compra');
    }
    
    if (errors.length > 0) {
      errores.push({ fila: index + 2, producto, errors });
    } else {
      validos.push({
        ...producto,
        precio_compra: precioCompra,
        precio_venta: precioVenta,
        stock_inicial: parseInt(producto.stock_inicial) || 0,
        stock_minimo: parseInt(producto.stock_minimo) || 0
      });
    }
  });
  
  return { validos, errores };
};

/**
 * Convierte datos importados al formato requerido por la API
 * @param {Array} productos - Array de productos validados
 * @returns {Array} - Array en formato para API
 */
export const convertirParaAPI = (productos) => {
  return productos.map(p => ({
    nombre: p.nombre,
    codigo: p.codigo,
    descripcion: p.descripcion || '',
    categoria: p.categoria, // Puede ser nombre o ID
    proveedor: p.proveedor || null, // Puede ser nombre o ID
    precio_compra: p.precio_compra,
    precio_venta: p.precio_venta,
    stock_inicial: p.stock_inicial || 0,
    stock_minimo: p.stock_minimo || 0,
    activo: p.activo?.toLowerCase() === 'si' || p.activo === 'true' || true,
    destacado: p.destacado?.toLowerCase() === 'si' || p.destacado === 'true' || false
  }));
};

/**
 * Genera una plantilla CSV para importación
 * @returns {string} - Contenido CSV de la plantilla
 */
export const generarPlantillaCSV = () => {
  const headers = [
    'codigo',
    'nombre',
    'descripcion',
    'categoria',
    'proveedor',
    'precio_compra',
    'precio_venta',
    'stock_inicial',
    'stock_minimo',
    'activo',
    'destacado'
  ];
  
  const exampleRow = [
    'PROD-001',
    'Nombre del producto',
    'Descripción del producto',
    'Motor y componentes',
    'Nombre del proveedor',
    '100.00',
    '150.00',
    '10',
    '5',
    'si',
    'no'
  ];
  
  return [headers.join(','), exampleRow.join(',')].join('\n');
};

/**
 * Descarga la plantilla CSV
 */
export const descargarPlantillaCSV = () => {
  const content = generarPlantillaCSV();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'plantilla_productos.csv';
  link.click();
};
