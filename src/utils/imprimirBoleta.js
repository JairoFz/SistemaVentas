export function imprimirBoleta(venta) {
  const win = window.open('', '_blank', 'width=420,height=650');
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

  win.document.write(`<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8"/>
    <title>${venta.codigo}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; width: 300px; margin: 0 auto; }
      .header { text-align:center; padding-bottom: 10px; border-bottom: 1px dashed #ccc; margin-bottom: 10px; }
      .header .logo { font-size: 26px; }
      .header h2 { font-size: 15px; font-weight: 700; margin: 4px 0 2px; }
      .header p { font-size: 10px; color: #666; }
      .tipo { font-weight: 700; font-size: 13px; margin-top: 8px; }
      .codigo { font-size: 12px; margin-top: 2px; }
      .fecha { font-size: 10px; color: #999; margin-top: 2px; }
      .info { font-size: 11px; margin: 10px 0; line-height: 1.9; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; }
      th { text-align: left; border-bottom: 1px solid #333; padding: 4px 2px; font-size: 10px; font-weight: 700; }
      td { padding: 5px 2px; border-bottom: 1px dotted #eee; vertical-align: top; }
      .total-row td { border-top: 2px solid #000; border-bottom: none; font-weight: 700; font-size: 14px; padding-top: 8px; }
      .gracias { text-align: center; font-size: 11px; color: #666; margin-top: 14px; padding-top: 10px; border-top: 1px dashed #ccc; }
      @media print { body { padding: 0; } }
    </style>
  </head><body>
    <div class="header">
      <div class="logo">🌾</div>
      <h2>FERCORD</h2>
      <p>Nutrición Balanceada · Aves y Cerdos</p>
      <hr style="border:none;border-top:1px dashed #ccc;margin:8px 0 6px"/>
      <div class="tipo">${venta.tipo === 'factura' ? 'FACTURA DE VENTA' : 'BOLETA DE VENTA'}</div>
      <div class="codigo">${venta.codigo}</div>
      <div class="fecha">${new Date(venta.fecha).toLocaleString('es-PE')}</div>
    </div>
    <div class="info">
      <strong>Cliente:</strong> ${venta.clienteNombre}<br/>
      <strong>Vendedor:</strong> ${venta.vendedor}<br/>
      <strong>Pago:</strong> ${venta.metodoPago}
    </div>
    <table>
      <thead><tr><th>Item</th><th>Cant</th><th>P.U.</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3">TOTAL</td>
          <td style="text-align:right">S/ ${venta.total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <div class="gracias">¡Gracias por su compra!</div>
    <script>window.onload = () => { window.print(); }<\/script>
  </body></html>`);
  win.document.close();
}