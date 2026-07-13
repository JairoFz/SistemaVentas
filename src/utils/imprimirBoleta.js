export function generarHtmlBoleta(venta, config = {}) {
  const items = venta.items.map(item => {
    let descripcion = '';
    const kgPorSaco = item.kgPorSaco || 40;

    if (item.presentacion === 'saco') descripcion = `Saco ${kgPorSaco}kg`;
    else if (item.presentacion === 'medio') descripcion = `Medio ${(kgPorSaco/2).toFixed(1)}kg`;
    else if (item.presentacion === 'arroba') descripcion = `Arroba ${(11.5)}kg`;
    else if (item.presentacion === 'kilo') descripcion = `${item.cantidad} kg`;
    else if (item.presentacion === 'importe') descripcion = `Por importe`;
    else descripcion = 'Unidad';

    return `
    <tr>
      <td>
        <div style="font-weight:500">${item.nombre}</div>
        <div style="font-size:10px;color:#999;text-transform:capitalize">${descripcion}</div>
      </td>
      <td style="text-align:center">${item.presentacion === 'importe' ? '—' : item.cantidad}</td>
      <td>${item.presentacion === 'importe' ? '—' : 'S/ ' + item.precioUnitario.toFixed(2)}</td>
      <td style="font-weight:600;text-align:right">S/ ${item.subtotal.toFixed(2)}</td>
    </tr>
  `}).join('');

  // Cargar logotipo en base64 o emoji por defecto
  const logoHtml = config.logo
    ? `<img src="${config.logo}" alt="Logo" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin: 0 auto 6px; display: block;" />`
    : `<div class="logo" style="font-size: 24px; margin-bottom: 4px; text-align: center;">🌾</div>`;

  const nombreEmpresa = config.nombre || "FERCORD";
  const sloganEmpresa = config.slogan || "Comercialización de Alimentos Balanceados";
  
  // Construir línea de RUC y dirección
  let rucLine = '';
  if (config.ruc) rucLine += `RUC: ${config.ruc}`;
  if (config.direccion) {
    if (rucLine) rucLine += ` · `;
    rucLine += config.direccion;
  }
  if (config.telefono) {
    if (rucLine) rucLine += ` · `;
    rucLine += `Telf: ${config.telefono}`;
  }
  if (!rucLine) {
    rucLine = "RUC: 10452389712 · San Vicente de Cañete"; // fallback por defecto si todo está vacío
  }

  return `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8"/>
    <title>${venta.codigo}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Arial, sans-serif; font-size: 11px; padding: 10px; width: 280px; margin: 0 auto; color: #000; }
      .header { text-align:center; padding-bottom: 8px; border-bottom: 1px dashed #000; margin-bottom: 8px; }
      .header h2 { font-size: 15px; font-weight: 700; margin: 2px 0; text-transform: uppercase; }
      .header p { font-size: 10px; line-height: 1.3; }
      .tipo { font-weight: 700; font-size: 12px; margin-top: 6px; text-transform: uppercase; }
      .codigo { font-size: 12px; font-weight: 700; margin-top: 2px; }
      .fecha { font-size: 10px; color: #333; margin-top: 2px; }
      .info { font-size: 10.5px; margin: 8px 0; line-height: 1.4; border-bottom: 1px dashed #000; padding-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10.5px; }
      th { text-align: left; border-bottom: 1px solid #000; padding: 3px 1px; font-size: 10px; font-weight: 700; }
      td { padding: 4px 1px; border-bottom: 1px dotted #ccc; vertical-align: top; }
      .total-row td { border-top: 1.5px solid #000; border-bottom: none; font-weight: 700; font-size: 13px; padding-top: 6px; }
      .gracias { text-align: center; font-size: 10.5px; margin-top: 12px; padding-top: 8px; border-top: 1px dashed #000; }
      @media print { body { padding: 0; width: 100%; } }
    </style>
  </head><body>
    <div class="header">
      ${logoHtml}
      <h2>${nombreEmpresa}</h2>
      <p>${sloganEmpresa}</p>
      <p>${rucLine}</p>
      <hr style="border:none;border-top:1px dashed #000;margin:6px 0 4px"/>
      <div class="tipo">${venta.tipo === 'factura' ? 'FACTURA DE VENTA' : 'BOLETA DE VENTA'}</div>
      <div class="codigo">${venta.codigo}</div>
      <div class="fecha">${new Date(venta.fecha).toLocaleString('es-PE')}</div>
    </div>
    <div class="info">
      <strong>Cliente:</strong> ${venta.clienteNombre}<br/>
      ${venta.clienteDocumento ? `<strong>Doc. Identidad:</strong> ${venta.clienteDocumento}<br/>` : ''}
      ${venta.clienteDireccion ? `<strong>Dirección:</strong> ${venta.clienteDireccion}<br/>` : ''}
      <strong>Vendedor:</strong> ${venta.vendedor}<br/>
      <strong>Método Pago:</strong> ${venta.metodoPago}
    </div>
    <table>
      <thead><tr><th>Descripción</th><th>Cant</th><th>P.U.</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3">TOTAL GENERAL</td>
          <td style="text-align:right">S/ ${venta.total.toFixed(2)}</td>
        </tr>
        ${venta.estadoPago && venta.estadoPago !== 'pagado' ? `
        <tr style="font-size: 11px;">
          <td colspan="3" style="border:none;padding-top:4px;">A cuenta:</td>
          <td style="text-align:right;border:none;padding-top:4px;">S/ ${(venta.montoPagado || 0).toFixed(2)}</td>
        </tr>
        <tr style="font-size: 11.5px;font-weight:700;color:#000;">
          <td colspan="3" style="border:none;padding-top:2px;">Saldo Pendiente:</td>
          <td style="text-align:right;border:none;padding-top:2px;">S/ ${(venta.montoDeuda || 0).toFixed(2)}</td>
        </tr>
        ` : ''}
      </tfoot>
    </table>
    <div class="gracias">¡Muchas gracias por su preferencia!</div>
  </body></html>`;
}

export function imprimirBoleta(venta, config = {}) {
  const html = generarHtmlBoleta(venta, config);

  const useSilent = localStorage.getItem('use_silent_print') === 'true';
  const preferredPrinter = localStorage.getItem('preferred_printer') || '';

  if (useSilent && window.api && window.api.printTicket) {
    window.api.printTicket(html, preferredPrinter, true)
      .then(res => {
        if (!res.success) {
          console.error("Error en impresión silenciosa:", res.error);
          abrirVentanaImpresion(html);
        }
      })
      .catch(err => {
        console.error("Fallo al invocar impresión silenciosa:", err);
        abrirVentanaImpresion(html);
      });
  } else {
    abrirVentanaImpresion(html);
  }
}

function abrirVentanaImpresion(html) {
  const win = window.open('', '_blank', 'width=420,height=650');
  if (!win) return;
  win.document.write(html);
  win.document.write('<script>window.onload = () => { window.print(); window.close(); }</script>');
  win.document.close();
}