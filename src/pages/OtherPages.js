import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, FileText, X } from 'lucide-react';

export function Reportes() {
  const { ventas, products } = useApp();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [preview, setPreview] = useState(false);

  const filtradas = ventas.filter(v =>
    (!desde || new Date(v.fecha) >= new Date(desde)) &&
    (!hasta || new Date(v.fecha) <= new Date(hasta + 'T23:59:59'))
  );
  const totalFiltrado = filtradas.reduce((s,v)=>s+v.total, 0);

  const descargarCSV = () => {
    const rows = [['Código','Fecha','Cliente','Vendedor','Método Pago','Tipo','Total']];
    filtradas.forEach(v => {
      rows.push([v.codigo, new Date(v.fecha).toLocaleString('es-PE'), v.clienteNombre, v.vendedor, v.metodoPago, v.tipo, v.total.toFixed(2)]);
    });
    const csv = '\uFEFF' + rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download=`reporte_fercord_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const imprimirPDF = () => {
    const win = window.open('','_blank','width=800,height=600');
    const fechaDesde = desde ? new Date(desde).toLocaleDateString('es-PE') : 'Inicio';
    const fechaHasta = hasta ? new Date(hasta).toLocaleDateString('es-PE') : 'Hoy';

    // Agrupar ventas por producto
    const porProducto = {};
    filtradas.forEach(v => {
      v.items.forEach(item => {
        const k = item.nombre;
        if (!porProducto[k]) porProducto[k] = { nombre:k, cantidad:0, total:0 };
        porProducto[k].cantidad += item.cantidad;
        porProducto[k].total += item.subtotal;
      });
    });
    const rankingProductos = Object.values(porProducto).sort((a,b)=>b.total-a.total);

    win.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <title>Reporte FERCORD</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: 'DM Sans', sans-serif; font-size:12px; color:#1a1a1a; padding:32px; background:#fff; }
          .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #2d5a27; padding-bottom:16px; margin-bottom:24px; }
          .brand h1 { font-size:22px; color:#2d5a27; font-weight:700; }
          .brand p { color:#666; font-size:11px; }
          .reporte-info { text-align:right; }
          .reporte-info h2 { font-size:16px; font-weight:700; color:#2d5a27; }
          .reporte-info p { color:#666; font-size:11px; margin-top:3px; }
          .resumen { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
          .stat { background:#f4f7f3; border:1px solid #e2e8df; border-radius:8px; padding:12px 16px; }
          .stat-label { font-size:10px; font-weight:600; color:#718096; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
          .stat-value { font-size:20px; font-weight:700; color:#1a1a1a; }
          .stat-value.green { color:#2d5a27; }
          h3 { font-size:13px; font-weight:700; margin-bottom:10px; color:#2d5a27; border-left:3px solid #2d5a27; padding-left:8px; }
          table { width:100%; border-collapse:collapse; margin-bottom:24px; font-size:11px; }
          thead { background:#2d5a27; }
          th { padding:7px 10px; text-align:left; color:white; font-weight:600; font-size:10px; text-transform:uppercase; }
          td { padding:7px 10px; border-bottom:1px solid #e2e8df; }
          tr:nth-child(even) td { background:#f9fafb; }
          .total-row td { font-weight:700; background:#e8f0e6 !important; }
          .badge { display:inline-block; padding:2px 7px; border-radius:12px; font-size:10px; font-weight:600; }
          .badge-green { background:#e8f0e6; color:#2d5a27; }
          .badge-orange { background:#fdf0e6; color:#d4762a; }
          .badge-gray { background:#f1f1f1; color:#666; }
          .footer { margin-top:32px; border-top:1px solid #e2e8df; padding-top:12px; display:flex; justify-content:space-between; color:#999; font-size:10px; }
          @media print { body { padding:16px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <h1>🌾 FERCORD</h1>
            <p>Nutrición Balanceada · Aves y Cerdos</p>
          </div>
          <div class="reporte-info">
            <h2>REPORTE DE VENTAS</h2>
            <p>Período: ${fechaDesde} — ${fechaHasta}</p>
            <p>Generado: ${new Date().toLocaleString('es-PE')}</p>
          </div>
        </div>

        <div class="resumen">
          <div class="stat">
            <div class="stat-label">Total ventas</div>
            <div class="stat-value green">S/ ${totalFiltrado.toFixed(2)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Transacciones</div>
            <div class="stat-value">${filtradas.length}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Ticket promedio</div>
            <div class="stat-value">S/ ${filtradas.length ? (totalFiltrado/filtradas.length).toFixed(2) : '0.00'}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Efectivo / Yape</div>
            <div class="stat-value">${filtradas.filter(v=>v.metodoPago==='Efectivo').length} / ${filtradas.filter(v=>v.metodoPago==='Yape').length}</div>
          </div>
        </div>

        <h3>Detalle de ventas</h3>
        <table>
          <thead>
            <tr><th>Código</th><th>Fecha</th><th>Cliente</th><th>Vendedor</th><th>Método pago</th><th>Tipo</th><th style="text-align:right">Total</th></tr>
          </thead>
          <tbody>
            ${filtradas.map(v=>`
              <tr>
                <td><strong>${v.codigo}</strong></td>
                <td>${new Date(v.fecha).toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'})}</td>
                <td>${v.clienteNombre}</td>
                <td>${v.vendedor}</td>
                <td><span class="badge ${v.metodoPago==='Efectivo'?'badge-green':v.metodoPago==='Yape'?'badge-orange':'badge-gray'}">${v.metodoPago}</span></td>
                <td>${v.tipo==='factura'?'Factura':'Boleta'}</td>
                <td style="text-align:right;font-weight:600">S/ ${v.total.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="6">TOTAL</td>
              <td style="text-align:right">S/ ${totalFiltrado.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>


        <div class="footer">
          <span>FERCORD - Nutrición Balanceada</span>
          <span>Reporte generado automáticamente por el sistema POS</span>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div>
      <div className="page-header"><h1>Reportes</h1><p>Exporta y genera reportes de ventas</p></div>
      <div className="card" style={{maxWidth:600}}>
        <h3 style={{marginBottom:20,fontSize:16}}>Reporte de ventas</h3>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Desde</label>
            <input className="form-input" type="date" value={desde} onChange={e=>setDesde(e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Hasta</label>
            <input className="form-input" type="date" value={hasta} onChange={e=>setHasta(e.target.value)}/></div>
        </div>
        {filtradas.length > 0 && (
          <div style={{background:'var(--green-light)',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:13,display:'flex',justifyContent:'space-between'}}>
            <span><strong>{filtradas.length}</strong> ventas en el período</span>
            <span>Total: <strong>S/ {totalFiltrado.toFixed(2)}</strong></span>
          </div>
        )}
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-primary" onClick={imprimirPDF}>
            <FileText size={15}/>Generar PDF
          </button>
          <button className="btn btn-outline" onClick={descargarCSV}>
            <Download size={15}/>Descargar CSV
          </button>
        </div>
        <p style={{marginTop:12,fontSize:12,color:'var(--text-light)'}}>
          El PDF incluye resumen, detalle de ventas y ranking de productos más vendidos.
        </p>
      </div>
    </div>
  );
}

export function Usuarios() {
  const { users, addUser, deleteUser, currentUser } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre:'', email:'', password:'', rol:'vendedor' });

  const save = () => {
    if (!form.nombre || !form.email || !form.password) return;
    addUser(form);
    setForm({ nombre:'', email:'', password:'', rol:'vendedor' });
    setModal(false);
  };

  return (
    <div>
      <div className="header-row page-header">
        <div><h1>Usuarios del sistema</h1><p>Gestiona accesos: administrador (full) y vendedor (limitado)</p></div>
        {currentUser?.rol==='admin' && (
          <button className="btn btn-primary" onClick={()=>setModal(true)}>+ Nuevo usuario</button>
        )}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th className="text-right">Acciones</th></tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id}>
                <td><strong>{u.nombre}</strong></td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.rol==='admin'?'badge-green':'badge-orange'}`}>{u.rol}</span></td>
                <td className="text-right">
                  {currentUser?.rol==='admin' && u.id!==1 && (
                    <button className="action-btn del" onClick={()=>deleteUser(u.id)}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h2>Nuevo usuario</h2><button style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>setModal(false)}><X size={18}/></button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Nombre</label>
                <input className="form-input" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Contraseña</label>
                <input className="form-input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Rol</label>
                <select className="form-select" value={form.rol} onChange={e=>setForm({...form,rol:e.target.value})}>
                  <option value="vendedor">Vendedor</option><option value="admin">Administrador</option>
                </select></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
