import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download } from 'lucide-react';

export function Reportes() {
  const { ventas } = useApp();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const descargarCSV = () => {
    let filtered = ventas;
    if (desde) filtered = filtered.filter(v => new Date(v.fecha) >= new Date(desde));
    if (hasta) filtered = filtered.filter(v => new Date(v.fecha) <= new Date(hasta + 'T23:59:59'));

    const rows = [['Código','Fecha','Cliente','Vendedor','Método Pago','Tipo','Total']];
    filtered.forEach(v => {
      rows.push([v.codigo, new Date(v.fecha).toLocaleString('es-PE'), v.clienteNombre, v.vendedor, v.metodoPago, v.tipo, v.total.toFixed(2)]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reporte_ventas_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const totalFiltrado = ventas
    .filter(v => (!desde || new Date(v.fecha) >= new Date(desde)) && (!hasta || new Date(v.fecha) <= new Date(hasta + 'T23:59:59')))
    .reduce((s, v) => s + v.total, 0);

  return (
    <div>
      <div className="page-header"><h1>Reportes</h1><p>Descarga reportes de ventas en formato CSV</p></div>
      <div className="card" style={{maxWidth:600}}>
        <h3 style={{marginBottom:20,fontSize:16}}>Reporte de ventas</h3>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Desde</label>
            <input className="form-input" type="date" value={desde} onChange={e=>setDesde(e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Hasta</label>
            <input className="form-input" type="date" value={hasta} onChange={e=>setHasta(e.target.value)}/></div>
        </div>
        {(desde||hasta) && (
          <div style={{background:'var(--green-light)',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:13}}>
            Total del período: <strong>S/ {totalFiltrado.toFixed(2)}</strong>
          </div>
        )}
        <button className="btn btn-primary" onClick={descargarCSV}><Download size={15}/>Descargar CSV</button>
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
            <div className="modal-header"><h2>Nuevo usuario</h2></div>
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
