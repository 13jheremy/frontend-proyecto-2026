// src/modulos/productos/utils/exportUtils.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Genera un reporte PDF de productos
 * @param {Array} productos - Array de productos
 * @param {string} titulo - Título del reporte
 */
export const generarPDFProductos = (productos, titulo = 'Reporte de Productos') => {
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TALLER DE MOTOS', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de Productos', 105, 30, { align: 'center' });
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 38, { align: 'center' });
  
  // Línea separadora
  doc.line(20, 45, 190, 45);
  
  // Preparar datos para la tabla
  const tableColumns = [
    { header: 'Producto', dataKey: 'nombre' },
    { header: 'Categoría', dataKey: 'categoria_nombre' },
    { header: 'Proveedor', dataKey: 'proveedor_nombre' },
    { header: 'Precio Compra', dataKey: 'precio_compra' },
    { header: 'Precio Venta', dataKey: 'precio_venta' },
    { header: 'Stock', dataKey: 'inventario_stock' },
    { header: 'Estado', dataKey: 'estado' }
  ];
  
  const tableRows = productos.map(p => ({
    nombre: p.nombre || 'N/A',
    categoria_nombre: p.categoria_nombre || 'N/A',
    proveedor_nombre: p.proveedor_nombre || 'N/A',
    precio_compra: `Bs. ${parseFloat(p.precio_compra || 0).toFixed(2)}`,
    precio_venta: `Bs. ${parseFloat(p.precio_venta || 0).toFixed(2)}`,
    inventario_stock: p.inventario_stock || 0,
    estado: getEstadoProducto(p)
  }));
  
  doc.autoTable({
    startY: 50,
    columns: tableColumns,
    body: tableRows,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      // Colorear celdas según estado
      if (data.section === 'body' && data.column.dataKey === 'estado') {
        const estado = data.cell.raw;
        if (estado === 'Inactivo') {
          data.cell.styles.textColor = [220, 53, 69];
        } else if (estado === 'Destacado') {
          data.cell.styles.textColor = [255, 193, 7];
        }
      }
    }
  });
  
  // Pie de página
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Total: ${productos.length} productos`, 105, finalY, { align: 'center' });
  
  return doc;
};

/**
 * Genera un reporte Excel (CSV) de productos
 * @param {Array} productos - Array de productos
 * @param {string} filename - Nombre del archivo
 */
export const exportarCSVProductos = (productos, filename = 'productos.csv') => {
  const headers = [
    'Producto',
    'Descripción',
    'Categoría',
    'Proveedor',
    'Precio Compra',
    'Precio Venta',
    'Stock Actual',
    'Stock Mínimo',
    'Activo',
    'Destacado'
  ];
  
  const rows = productos.map(p => [
    p.nombre || '',
    p.descripcion || '',
    p.categoria_nombre || '',
    p.proveedor_nombre || '',
    p.precio_compra || 0,
    p.precio_venta || 0,
    p.inventario_stock || 0,
    p.inventario_stock_minimo || 0,
    p.activo ? 'Sí' : 'No',
    p.destacado ? 'Sí' : 'No'
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

/**
 * Genera reporte PDF de inventario con alertas
 * @param {Array} inventario - Array de items de inventario
 */
export const generarPDFInventario = (inventario, titulo = 'Reporte de Inventario') => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TALLER DE MOTOS', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de Inventario', 105, 30, { align: 'center' });
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 38, { align: 'center' });
  
  // Contar alertas
  const sinStock = inventario.filter(i => i.stock_actual === 0).length;
  const stockBajo = inventario.filter(i => i.stock_actual > 0 && i.stock_actual <= i.stock_minimo).length;
  const normal = inventario.length - sinStock - stockBajo;
  
  doc.setFontSize(10);
  doc.text(`Sin Stock: ${sinStock} | Stock Bajo: ${stockBajo} | Normal: ${normal}`, 105, 46, { align: 'center' });
  
  doc.line(20, 50, 190, 50);
  
  const tableColumns = [
    { header: 'Producto', dataKey: 'nombre' },
    { header: 'Categoría', dataKey: 'categoria' },
    { header: 'Stock', dataKey: 'stock_actual' },
    { header: 'Stock Mín', dataKey: 'stock_minimo' },
    { header: 'Estado', dataKey: 'estado' }
  ];
  
  const tableRows = inventario.map(item => ({
    nombre: item.producto_nombre || 'N/A',
    categoria: item.categoria_nombre || 'N/A',
    stock_actual: item.stock_actual || 0,
    stock_minimo: item.stock_minimo || 0,
    estado: getEstadoStock(item.stock_actual, item.stock_minimo)
  }));
  
  doc.autoTable({
    startY: 55,
    columns: tableColumns,
    body: tableRows,
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.dataKey === 'estado') {
        const estado = data.cell.raw;
        if (estado === 'Sin Stock') {
          data.cell.styles.textColor = [220, 53, 69];
          data.cell.styles.fontStyle = 'bold';
        } else if (estado === 'Stock Bajo') {
          data.cell.styles.textColor = [255, 193, 7];
        } else {
          data.cell.styles.textColor = [40, 167, 69];
        }
      }
    }
  });
  
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Total items: ${inventario.length}`, 105, finalY, { align: 'center' });
  
  return doc;
};

/**
 * Obtiene el estado de un producto
 */
const getEstadoProducto = (producto) => {
  if (!producto.activo) return 'Inactivo';
  if (producto.destacado) return 'Destacado';
  return 'Activo';
};

/**
 * Obtiene el estado del stock
 */
const getEstadoStock = (stock, stockMinimo) => {
  if (stock === 0) return 'Sin Stock';
  if (stock <= stockMinimo) return 'Stock Bajo';
  return 'Normal';
};

/**
 * Descarga un PDF
 */
export const descargarPDF = (doc, filename) => {
  doc.save(filename);
};

/**
 * Exportar productos a Excel usando una biblioteca externa
 * Esta función crea un Excel real (no CSV)
 */
export const exportarExcelProductos = (productos, filename = 'productos') => {
  // Intentar usar xlsx si está disponible, si no usar CSV
  try {
    // Intentar importar xlsx dinámicamente
    const XLSX = require('xlsx');
    
    const ws = XLSX.utils.json_to_sheet(productos.map(p => ({
      Código: p.codigo || '',
      Nombre: p.nombre || '',
      Descripción: p.descripcion || '',
      Categoría: p.categoria_nombre || '',
      Proveedor: p.proveedor_nombre || '',
      'Precio Compra': parseFloat(p.precio_compra || 0),
      'Precio Venta': parseFloat(p.precio_venta || 0),
      Stock: p.inventario_stock || 0,
      'Stock Mínimo': p.inventario_stock_minimo || 0,
      Activo: p.activo ? 'Sí' : 'No',
      Destacado: p.destacado ? 'Sí' : 'No'
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (e) {
    // Si no hay xlsx, usar CSV
    console.warn('xlsx no disponible, usando CSV');
    exportarCSVProductos(productos, `${filename}.csv`);
  }
};
