// src/services/pdfService.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Registrar el plugin
class PDFService {
  constructor() {
    this.doc = null;
  }

  // Configuración base del documento
  initDocument() {
    this.doc = new jsPDF();
    this.doc.setFont('helvetica');
    return this.doc;
  }

  // Método para usar autoTable (compatible con jspdf v3+)
  createTable(doc, options) {
    autoTable(doc, options);
  }

  // Agregar encabezado del taller
  addHeader(doc, title = 'RECIBO') {
    // Encabezado del taller
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Taller Especializado JIC', 105, 15, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Mantenimiento y Repuestos, TALLER DE MOTOS', 105, 22, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Servicio Técnico y Venta de Repuestos', 105, 29, { align: 'center' });
    doc.text('Tel: 123-456-7890', 105, 35, { align: 'center' });
    
    // Línea separadora
    doc.line(20, 42, 190, 42);
    
    // Título del documento
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 50, { align: 'center' });
    
    return 58; // Retorna la posición Y donde continuar
  }

  // Generar comprobante de venta
  generarComprobanteVenta(ventaData) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'RECIBO DE VENTA');
    
    // Información de la venta
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Número de venta y fecha
    doc.text(`#${ventaData.venta_id}`, 20, yPos);
    doc.text(`Fecha: ${new Date(ventaData.fecha_venta).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 80, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Estado:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(ventaData.estado || 'PAGADA', 50, yPos);
    
    // Datos del cliente
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', 20, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    doc.text('Nombre:', 20, yPos);
    doc.text(ventaData.cliente?.nombre_completo || 'Cliente General', 50, yPos);
    
    yPos += 8;
    doc.text('C.C./RUC:', 20, yPos);
    doc.text(ventaData.cliente?.cedula || 'N/A', 50, yPos);
    
    yPos += 8;
    doc.text('Teléfono:', 20, yPos);
    doc.text(ventaData.cliente?.telefono || 'N/A', 50, yPos);
    
    // Tabla de productos
    yPos += 15;
    const tableColumns = ['Producto', 'Cant', 'Precio', 'Subtotal'];
    const tableRows = ventaData.productos.map(producto => [
      producto.nombre,
      producto.cantidad.toString(),
      `Bs. ${parseFloat(producto.precio_unitario).toFixed(2)}`,
      `Bs. ${parseFloat(producto.subtotal).toFixed(2)}`
    ]);

    this.createTable(doc, {
      startY: yPos,
      head: [tableColumns],
      body: tableRows,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 }
    });

    // Totales
    yPos = doc.lastAutoTable.finalY + 15;
    
    const totalsX = 130;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(`Bs. ${parseFloat(ventaData.subtotal || 0).toFixed(2)}`, 175, yPos);
    
    yPos += 8;
    doc.text('Descuento:', totalsX, yPos);
    doc.text(`Bs. ${parseFloat(ventaData.descuento || 0).toFixed(2)}`, 175, yPos);
    
    yPos += 8;
    doc.text('IVA (19%):', totalsX, yPos);
    doc.text(`Bs. ${parseFloat(ventaData.impuesto || 0).toFixed(2)}`, 175, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX, yPos);
    doc.text(`Bs. ${parseFloat(ventaData.total || 0).toFixed(2)}`, 175, yPos);
    
    // Método de Pago
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.text('Método de Pago:', 20, yPos);
    doc.text(ventaData.metodo_pago || 'No especificado', 60, yPos);
    
    yPos += 8;
    doc.text('Pagado:', 20, yPos);
    doc.text(`Bs. ${parseFloat(ventaData.total || 0).toFixed(2)}`, 60, yPos);

    // Pie de página
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('¡Gracias por su preferencia!', 105, yPos, { align: 'center' });
    doc.text('Vuelva pronto a Taller de Motos', 105, yPos + 8, { align: 'center' });

    return doc;
  }

  // Generar comprobante de mantenimiento
  generarComprobanteMantenimiento(mantenimientoData) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'COMPROBANTE DE MANTENIMIENTO');
    
    // Información del mantenimiento
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Datos de la moto y mantenimiento
    doc.text(`Número de Mantenimiento: ${mantenimientoData.mantenimiento_id}`, 20, yPos);
    doc.text(`Fecha: ${new Date(mantenimientoData.fecha_ingreso).toLocaleDateString('es-ES')}`, 140, yPos);
    
    yPos += 8;
    doc.text(`Moto: ${mantenimientoData.moto.placa} - ${mantenimientoData.moto.marca} ${mantenimientoData.moto.modelo}`, 20, yPos);
    
    yPos += 8;
    doc.text(`Propietario: ${mantenimientoData.moto.propietario}`, 20, yPos);
    
    yPos += 8;
    doc.text(`Estado: ${mantenimientoData.estado.toUpperCase()}`, 20, yPos);

    // Descripción del problema
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPCIÓN DEL PROBLEMA:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    
    const problemaLines = doc.splitTextToSize(mantenimientoData.descripcion_problema, 170);
    doc.text(problemaLines, 20, yPos);
    yPos += problemaLines.length * 6;

    // Diagnóstico (si existe)
    if (mantenimientoData.diagnostico) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('DIAGNÓSTICO:', 20, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      
      const diagnosticoLines = doc.splitTextToSize(mantenimientoData.diagnostico, 170);
      doc.text(diagnosticoLines, 20, yPos);
      yPos += diagnosticoLines.length * 6;
    }

    // Servicios realizados
    if (mantenimientoData.servicios && mantenimientoData.servicios.length > 0) {
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('SERVICIOS REALIZADOS:', 20, yPos);
      yPos += 10;

      const serviciosColumns = ['Servicio', 'Precio', 'Observaciones'];
      const serviciosRows = mantenimientoData.servicios.map(servicio => [
        servicio.nombre,
        `Bs. ${parseFloat(servicio.precio).toFixed(2)}`,
        servicio.observaciones || '-'
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [serviciosColumns],
        body: serviciosRows,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [255, 152, 0] },
        margin: { left: 20, right: 20 }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Repuestos utilizados
    if (mantenimientoData.repuestos && mantenimientoData.repuestos.length > 0) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('REPUESTOS UTILIZADOS:', 20, yPos);
      yPos += 10;

      const repuestosColumns = ['Código', 'Repuesto', 'Cant.', 'P. Unit.', 'Subtotal'];
      const repuestosRows = mantenimientoData.repuestos.map(repuesto => [
        repuesto.codigo,
        repuesto.nombre,
        repuesto.cantidad.toString(),
        `Bs. ${parseFloat(repuesto.precio_unitario).toFixed(2)}`,
        `Bs. ${parseFloat(repuesto.subtotal).toFixed(2)}`
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [repuestosColumns],
        body: repuestosRows,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [156, 39, 176] },
        margin: { left: 20, right: 20 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Total
    const totalsX = 140;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`TOTAL DEL MANTENIMIENTO:`, totalsX - 20, yPos);
    doc.text(`Bs. ${parseFloat(mantenimientoData.total).toFixed(2)}`, 170, yPos);

    // Pie de página
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Garantía de 30 días en mano de obra', 105, yPos, { align: 'center' });
    doc.text('Garantía de repuestos según fabricante', 105, yPos + 8, { align: 'center' });

    return doc;
  }

  // Descargar PDF
  downloadPDF(doc, filename) {
    doc.save(filename);
  }

  // Previsualizar PDF (abrir en nueva ventana)
  previewPDF(doc) {
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  }

  // Generar y descargar comprobante de venta
  generarYDescargarComprobanteVenta(ventaData) {
    const doc = this.generarComprobanteVenta(ventaData);
    const filename = `comprobante_venta_${ventaData.venta_id}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.downloadPDF(doc, filename);
  }

  // Generar y descargar comprobante de mantenimiento
  generarYDescargarComprobanteMantenimiento(mantenimientoData) {
    const doc = this.generarComprobanteMantenimiento(mantenimientoData);
    const filename = `comprobante_mantenimiento_${mantenimientoData.mantenimiento_id}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.downloadPDF(doc, filename);
  }

  // Generar reporte de inventario
  generarReporteInventario(inventarioData) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'REPORTE DE INVENTARIO');
    
    // Fecha del reporte
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    
    // Resumen
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Total productos: ${inventarioData.total_productos || 0}`, 25, yPos);
    yPos += 6;
    doc.text(`Productos con stock bajo: ${inventarioData.productos_stock_bajo || 0}`, 25, yPos);
    yPos += 6;
    doc.text(`Productos sin stock: ${inventarioData.productos_sin_stock || 0}`, 25, yPos);
    yPos += 6;
    doc.text(`Valor total del inventario: Bs. ${inventarioData.valor_total_inventario || '0.00'}`, 25, yPos);
    
    // Tabla de productos
    yPos += 20;
    const tableColumns = ['Código', 'Producto', 'Categoría', 'Stock', 'Stock Mín', 'Estado'];
    const tableRows = (inventarioData.productos || []).map(item => [
      item.codigo || 'N/A',
      item.nombre || 'N/A',
      item.categoria || 'N/A',
      item.stock_actual?.toString() || '0',
      item.stock_minimo?.toString() || '0',
      this.getEstadoStock(item.stock_actual, item.stock_minimo)
    ]);

    this.createTable(doc, {
      startY: yPos,
      head: [tableColumns],
      body: tableRows,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const estado = data.cell.raw;
          if (estado === 'Sin Stock') {
            data.cell.styles.textColor = [220, 53, 69];
          } else if (estado === 'Stock Bajo') {
            data.cell.styles.textColor = [255, 193, 7];
          } else {
            data.cell.styles.textColor = [40, 167, 69];
          }
        }
      }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Reporte generado por Taller Especializado JIC', 105, yPos, { align: 'center' });
    
    return doc;
  }

  getEstadoStock(stock, stockMinimo) {
    if (stock === 0) return 'Sin Stock';
    if (stock <= stockMinimo) return 'Stock Bajo';
    return 'Normal';
  }

  // Generar reporte de productos por categoría
  generarReporteProductosPorCategoria(data) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'REPORTE DE PRODUCTOS POR CATEGORÍA');
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Total productos: ${data.total_productos || 0}`, 25, yPos);
    yPos += 6;
    doc.text(`Total stock: ${data.stock_total || 0}`, 25, yPos);
    
    yPos += 20;
    const tableColumns = ['Categoría', 'Productos', 'Stock Total', 'Valor'];
    const tableRows = (data.por_categoria || []).map(item => [
      item.categoria || 'N/A',
      item.cantidad_productos?.toString() || '0',
      item.stock_total?.toString() || '0',
      `Bs. ${item.valor_total?.toFixed(2) || '0.00'}`
    ]);

    this.createTable(doc, {
      startY: yPos,
      head: [tableColumns],
      body: tableRows,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 }
    });
    
    return doc;
  }

  // Guardar PDF
  savePDF(doc, filename) {
    doc.save(filename);
  }

  // =======================================
  // REPORTES GENERALES
  // =======================================

  // Generar reporte completo de ventas
  generarReporteVentas(data) {
    console.log('Generando PDF con datos:', data);
    
    if (!data) {
      console.error('No hay datos para generar el PDF');
      return null;
    }
    
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'REPORTE DE VENTAS');
    
    // Período
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${data.periodo?.inicio || 'N/A'} al ${data.periodo?.fin || 'N/A'}`, 20, yPos);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos + 6);
    
    // Resumen
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de ventas: ${data.resumen?.total_ventas || 0}`, 25, yPos);
    yPos += 6;
    doc.text(`Total de ingresos: Bs. ${(data.resumen?.total_ingresos || 0).toFixed(2)}`, 25, yPos);
    
    // Serie de ventas por período
    if (data.serie && data.serie.length > 0) {
      yPos += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ventas por período:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Período', 'Cantidad', 'Total'];
      const tableRows = data.serie.map(item => [
        item.periodo || 'N/A',
        item.cantidad?.toString() || '0',
        `Bs. ${(item.total || 0).toFixed(2)}`
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [40, 167, 69] },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Productos más vendidos
    if (data.productos_mas_vendidos && data.productos_mas_vendidos.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Productos más vendidos:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Producto', 'Cantidad', 'Ingresos'];
      const tableRows = data.productos_mas_vendidos.map(item => [
        item.producto__nombre || 'N/A',
        item.cantidad_total?.toString() || '0',
        `Bs. ${(item.ingresos_total || 0).toFixed(2)}`
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Reporte generado por Taller Especializado JIC', 105, yPos, { align: 'center' });
    
    return doc;
  }

  // Generar reporte de inventario (versión actualizada)
  generarReporteInventarioCompleto(data) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'REPORTE DE INVENTARIO');
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    
    // Productos con stock bajo
    if (data.stock_bajo && data.stock_bajo.length > 0) {
      yPos += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Productos con stock bajo:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Producto', 'Stock Actual', 'Stock Mínimo'];
      const tableRows = data.stock_bajo.map(item => [
        item.nombre || 'N/A',
        item.stock_actual?.toString() || '0',
        item.stock_minimo?.toString() || '0'
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 53, 69] },
        margin: { left: 20, right: 20 },
        didParseCell: (hookData) => {
          if (hookData.section === 'body' && hookData.column.index === 1) {
            const stock = parseInt(hookData.cell.raw);
            if (stock === 0) {
              hookData.cell.styles.textColor = [220, 53, 69];
            } else {
              hookData.cell.styles.textColor = [255, 193, 7];
            }
          }
        }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    } else {
      yPos += 20;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('No hay productos con stock bajo', 20, yPos);
      yPos += 15;
    }
    
    // Movimientos recientes
    if (data.movimientos_recientes && data.movimientos_recientes.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Movimientos recientes:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Fecha', 'Tipo', 'Cantidad', 'Producto', 'Motivo'];
      const tableRows = data.movimientos_recientes.slice(0, 20).map(item => [
        item.fecha_registro?.substring(0, 10) || 'N/A',
        item.tipo || 'N/A',
        item.cantidad?.toString() || '0',
        item.producto || 'N/A',
        item.motivo || 'N/A'
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Reporte generado por Taller Especializado JIC', 105, yPos, { align: 'center' });
    
    return doc;
  }

  // Generar reporte de productos
  generarReporteProductos(data) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'REPORTE DE PRODUCTOS');
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    
    // Resumen
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Total productos: ${data.resumen?.total_productos || 0}`, 25, yPos);
    yPos += 6;
    doc.text(`Stock total: ${data.resumen?.stock_total || 0}`, 25, yPos);
    
    // Por categoría
    if (data.por_categoria && data.por_categoria.length > 0) {
      yPos += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Productos por categoría:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Categoría', 'Cantidad'];
      const tableRows = data.por_categoria.map(item => [
        item.categoria__nombre || 'N/A',
        item.total?.toString() || '0'
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [102, 126, 234] },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Reporte generado por Taller Especializado JIC', 105, yPos, { align: 'center' });
    
    return doc;
  }

  // Generar reporte de mantenimientos
  generarReporteMantenimientos(data) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'REPORTE DE MANTENIMIENTOS');
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    
    // Por estado
    if (data.por_estado && data.por_estado.length > 0) {
      yPos += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Mantenimientos por estado:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Estado', 'Cantidad'];
      const tableRows = data.por_estado.map(item => [
        item.estado || 'N/A',
        item.total?.toString() || '0'
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [255, 193, 7] },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Servicios más usados
    if (data.servicios_mas_usados && data.servicios_mas_usados.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Servicios más utilizados:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Servicio', 'Cantidad'];
      const tableRows = data.servicios_mas_usados.map(item => [
        item.servicio__nombre || 'N/A',
        item.total?.toString() || '0'
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Reporte generado por Taller Especializado JIC', 105, yPos, { align: 'center' });
    
    return doc;
  }

  // Generar reporte de motos
  generarReporteMotos(data) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'REPORTE DE MOTOS');
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    
    // Por marca
    if (data.por_marca && data.por_marca.length > 0) {
      yPos += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Motos por marca:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Marca', 'Cantidad'];
      const tableRows = data.por_marca.map(item => [
        item.marca || 'N/A',
        item.total?.toString() || '0'
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [40, 167, 69] },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Por año
    if (data.por_ano && data.por_ano.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Motos por año:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Año', 'Cantidad'];
      const tableRows = data.por_ano.map(item => [
        item.año?.toString() || 'N/A',
        item.total?.toString() || '0'
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [102, 126, 234] },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Reporte generado por Taller Especializado JIC', 105, yPos, { align: 'center' });
    
    return doc;
  }

  // Generar reporte de proveedores
  generarReporteProveedores(data) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'REPORTE DE PROVEEDORES');
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    
    // Resumen
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Proveedores activos: ${data.activos || 0}`, 25, yPos);
    
    // Por productos
    if (data.por_productos && data.por_productos.length > 0) {
      yPos += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Proveedores por cantidad de productos:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Proveedor', 'Productos'];
      const tableRows = data.por_productos.map(item => [
        item.nombre || 'N/A',
        item.total_productos?.toString() || '0'
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [23, 162, 184] },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Reporte generado por Taller Especializado JIC', 105, yPos, { align: 'center' });
    
    return doc;
  }

  // Generar reporte de usuarios
  generarReporteUsuarios(data) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'REPORTE DE USUARIOS');
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos);
    
    // Resumen
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Usuarios activos: ${data.activos || 0}`, 25, yPos);
    yPos += 6;
    doc.text(`Usuarios inactivos: ${data.inactivos || 0}`, 25, yPos);
    
    // Por rol
    if (data.por_rol && data.por_rol.length > 0) {
      yPos += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Usuarios por rol:', 20, yPos);
      yPos += 10;
      
      const tableColumns = ['Rol', 'Usuarios'];
      const tableRows = data.por_rol.map(item => [
        item.rol__nombre || 'N/A',
        item.total?.toString() || '0'
      ]);

      this.createTable(doc, {
        startY: yPos,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [233, 30, 99] },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Reporte generado por Taller Especializado JIC', 105, yPos, { align: 'center' });
    
    return doc;
  }

  // Método para descargar PDF
  descargarPDF(doc, filename) {
    console.log('Intentando descargar PDF:', filename);
    console.log('Doc es válido:', doc !== null, doc !== undefined);
    if (!doc) {
      console.error('Documento PDF es null o undefined');
      return;
    }
    try {
      doc.save(filename);
      console.log('PDF guardado exitosamente');
    } catch (e) {
      console.error('Error al guardar PDF:', e);
    }
  }
}

// Exportar una instancia
const pdfService = new PDFService();
export default pdfService;
