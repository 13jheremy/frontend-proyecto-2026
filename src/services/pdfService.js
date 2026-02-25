// src/services/pdfService.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  // Agregar encabezado del taller
  addHeader(doc, title = 'COMPROBANTE') {
    // Logo placeholder (puedes reemplazar con imagen real)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TALLER DE MOTOS', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Dirección del Taller', 105, 28, { align: 'center' });
    doc.text('Teléfono: (123) 456-7890', 105, 35, { align: 'center' });
    doc.text('Email: info@tallermotos.com', 105, 42, { align: 'center' });
    
    // Línea separadora
    doc.line(20, 50, 190, 50);
    
    // Título del documento
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 60, { align: 'center' });
    
    return 70; // Retorna la posición Y donde continuar
  }

  // Generar comprobante de venta
  generarComprobanteVenta(ventaData) {
    const doc = this.initDocument();
    let yPos = this.addHeader(doc, 'COMPROBANTE DE VENTA');
    
    // Información de la venta
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Datos del cliente y venta
    doc.text(`Número de Venta: ${ventaData.venta_id}`, 20, yPos);
    doc.text(`Fecha: ${new Date(ventaData.fecha_venta).toLocaleDateString('es-ES')}`, 140, yPos);
    
    yPos += 8;
    doc.text(`Cliente: ${ventaData.cliente.nombre_completo}`, 20, yPos);
    doc.text(`Cédula: ${ventaData.cliente.cedula}`, 140, yPos);
    
    yPos += 8;
    doc.text(`Teléfono: ${ventaData.cliente.telefono}`, 20, yPos);
    
    // Tabla de productos
    yPos += 15;
    const tableColumns = ['Código', 'Producto', 'Cant.', 'P. Unit.', 'Subtotal'];
    const tableRows = ventaData.productos.map(producto => [
      producto.codigo,
      producto.nombre,
      producto.cantidad.toString(),
      `Bs. ${parseFloat(producto.precio_unitario).toFixed(2)}`,
      `Bs. ${parseFloat(producto.subtotal).toFixed(2)}`
    ]);

    doc.autoTable({
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
    
    const totalsX = 140;
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, totalsX, yPos);
    doc.text(`Bs. ${parseFloat(ventaData.subtotal).toFixed(2)}`, 170, yPos);
    
    yPos += 8;
    doc.text(`Impuesto:`, totalsX, yPos);
    doc.text(`Bs. ${parseFloat(ventaData.impuesto).toFixed(2)}`, 170, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL:`, totalsX, yPos);
    doc.text(`Bs. ${parseFloat(ventaData.total).toFixed(2)}`, 170, yPos);

    // Pie de página
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('¡Gracias por su compra!', 105, yPos, { align: 'center' });
    doc.text('Conserve este comprobante para garantías', 105, yPos + 8, { align: 'center' });

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

      doc.autoTable({
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

      doc.autoTable({
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
}

// Exportar instancia singleton
export default new PDFService();
