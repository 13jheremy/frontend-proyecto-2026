// src/utils/printReceipt.js

/**
 * Función para generar e imprimir un recibo de venta
 * @param {Object} venta - Objeto con los datos de la venta
 */
export const printReceipt = (venta) => {
  if (!venta) return;

  const formatPrice = (price) => {
    return `Bs. ${parseFloat(price || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener nombre del cliente
  const clienteNombre = venta.cliente_nombre || 
    (venta.cliente ? `${venta.cliente.nombre || ''} ${venta.cliente.apellido || ''}`.trim() : '') || 
    'Cliente General';
  
  // Dependiendo de dónde venga, la cédula/teléfono pueden estar en diferentes campos
  const clienteCedula = venta.cliente_cedula || venta.cliente?.cedula || 'N/A';
  const clienteTelefono = venta.cliente?.telefono || 'N/A';

  // Obtener método de pago
  const metodoPago = venta.metodo_pago || 
    (venta.pagos && venta.pagos.length > 0 ? venta.pagos[0].metodo : 'No especificado');

  // Construir los productos
  let productosHTML = '';
  if (venta.detalles && venta.detalles.length > 0) {
    venta.detalles.forEach(detalle => {
      const nombreProd = detalle.producto_nombre || detalle.producto?.nombre || detalle.nombre || 'Producto';
      const cantidad = detalle.cantidad || 0;
      const precio = detalle.precio_unitario || 0;
      const subtotal = detalle.subtotal || (cantidad * precio);

      productosHTML += `
        <tr>
          <td style="padding: 6px 0; border-bottom: 1px dashed #ccc;">${nombreProd}</td>
          <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: center;">${cantidad}</td>
          <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: right;">${formatPrice(precio)}</td>
          <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: right;">${formatPrice(subtotal)}</td>
        </tr>
      `;
    });
  } else if (venta.productos && venta.productos.length > 0) { // para el formato de pdfData
    venta.productos.forEach(prod => {
      const nombreProd = prod.nombre || 'Producto';
      const cantidad = prod.cantidad || 0;
      const precio = prod.precio_unitario || 0;
      const subtotal = prod.subtotal || (cantidad * precio);

      productosHTML += `
        <tr>
          <td style="padding: 6px 0; border-bottom: 1px dashed #ccc;">${nombreProd}</td>
          <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: center;">${cantidad}</td>
          <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: right;">${formatPrice(precio)}</td>
          <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: right;">${formatPrice(subtotal)}</td>
        </tr>
      `;
    });
  }

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo de Venta #${venta.id || venta.venta_id}</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          @page { margin: 0; size: auto; }
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          max-width: 300px;
          margin: 0 auto;
          padding: 15px 10px;
          color: #000;
          line-height: 1.2;
        }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .header h1 { font-size: 16px; margin: 0 0 5px 0; }
        .header p { margin: 2px 0; font-size: 11px; }
        .info-section { margin-bottom: 10px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th { text-align: left; padding: 4px 0; border-bottom: 1px solid #000; border-top: 1px solid #000; font-size: 11px; }
        .totals { margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px; }
        .total-row { display: flex; justify-content: space-between; margin: 3px 0; }
        .grand-total { font-size: 14px; font-weight: bold; padding: 5px 0; border-bottom: 1px dashed #000; border-top: 1px dashed #000; margin-top: 5px;}
        .footer { text-align: center; margin-top: 15px; font-size: 11px; }
        .no-print { text-align: center; margin-top: 20px; }
        .btn { padding: 8px 15px; background: #000; color: white; border: none; cursor: pointer; border-radius: 4px; font-family: inherit; font-size: 14px; font-weight: bold;}
      </style>
    </head>
    <body onload="window.print()">
      <div class="header">
        <h1>Taller Especializado JIC</h1>
        <p><strong>Mantenimiento y Repuestos, TALLER DE MOTOS</strong></p>
        <p>Servicio Técnico y Venta de Repuestos</p>
        <p>Tel: 123-456-7890</p>
      </div>

      <div style="text-align: center; margin: 10px 0;">
        <strong>TICKET DE VENTA</strong><br>
        <span style="font-size: 14px;">#${venta.id || venta.venta_id}</span>
      </div>

      <div class="info-section">
        <div class="info-row">
          <span>Fecha:</span>
          <span>${formatDate(venta.fecha_venta || new Date())}</span>
        </div>
        <div class="info-row">
          <span>Cajero:</span>
          <span>ADMIN</span>
        </div>
      </div>

      <div class="info-section" style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0;">
        <div class="info-row">
          <span>Cliente:</span>
          <span>${clienteNombre}</span>
        </div>
        <div class="info-row">
          <span>C.C./NIT:</span>
          <span>${clienteCedula}</span>
        </div>
      </div>

      <div class="info-section">
        <table>
          <thead>
            <tr>
              <th>CANT</th>
              <th style="width: 100%;">DESCRIPCIÓN</th>
              <th style="text-align: right;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${venta.detalles ? venta.detalles.map(d => {
              const nombre = d.producto_nombre || d.producto?.nombre || d.nombre || 'Producto';
              const cant = d.cantidad || 0;
              const sub = d.subtotal || (cant * (d.precio_unitario || 0));
              return `
              <tr>
                <td style="padding: 4px 0; vertical-align: top;">${cant}</td>
                <td style="padding: 4px 5px; vertical-align: top;">${nombre}</td>
                <td style="padding: 4px 0; text-align: right; vertical-align: top;">${formatPrice(sub)}</td>
              </tr>
              `;
            }).join('') : (venta.productos ? venta.productos.map(p => {
              const nombre = p.nombre || 'Producto';
              const cant = p.cantidad || 0;
              const sub = p.subtotal || (cant * (p.precio_unitario || 0));
              return `
              <tr>
                <td style="padding: 4px 0; vertical-align: top;">${cant}</td>
                <td style="padding: 4px 5px; vertical-align: top;">${nombre}</td>
                <td style="padding: 4px 0; text-align: right; vertical-align: top;">${formatPrice(sub)}</td>
              </tr>
              `;
            }).join('') : '')}
          </tbody>
        </table>
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatPrice(venta.subtotal)}</span>
        </div>
        ${(venta.descuento || 0) > 0 ? `
        <div class="total-row">
          <span>Descuento:</span>
          <span>-${formatPrice(venta.descuento)}</span>
        </div>
        ` : ''}
        <div class="total-row">
          <span>Impuestos:</span>
          <span>${formatPrice(venta.impuesto)}</span>
        </div>
        <div class="total-row grand-total">
          <span>TOTAL A PAGAR:</span>
          <span>${formatPrice(venta.total)}</span>
        </div>
      </div>

      <div class="info-section" style="margin-top: 10px;">
        <div class="info-row">
          <span>Método Pago:</span>
          <span>${(metodoPago || 'Efectivo').toUpperCase()}</span>
        </div>
        ${venta.pagado !== undefined ? `
        <div class="info-row">
          <span>Abonado:</span>
          <span>${formatPrice(venta.pagado || venta.total || 0)}</span>
        </div>
        ` : ''}
      </div>

      <div class="footer">
        <p>¡Gracias por su preferencia!</p>
        <p>Vuelva pronto a Taller de Motos</p>
      </div>

      <div class="no-print">
        <button class="btn" onclick="window.print()">IMPRIMIR TICKET</button>
        <button class="btn" style="background:#555; margin-top:5px;" onclick="window.close()">CERRAR</button>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=350,height=600');
  if (printWindow) {
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    // No llamamos print() aquí, pusimos onload="window.print()" en el body
  } else {
    alert('Por favor permita ventanas emergentes para imprimir el recibo (Popup Blocker)');
  }
};
