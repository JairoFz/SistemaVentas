import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Pencil, Trash2, X, Coins } from 'lucide-react';

const EMPTY = { nombre:'', dni:'', telefono:'', direccion:'', email:'' };

export default function Clientes() {
  const { 
    clients, addClient, updateClient, deleteClient, 
    ventas, pagosDeuda, registrarAbonoCliente, currentUser 
  } = useApp();

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loadingQuery, setLoadingQuery] = useState(false);

  // Estados para gestión de Deudas / Abonos
  const [deudaCliente, setDeudaCliente] = useState(null); // null | cliente object
  const [montoAbono, setMontoAbono] = useState('');
  const [metodoAbono, setMetodoAbono] = useState('Efectivo');
  const [errorAbono, setErrorAbono] = useState('');

  const consultarDoc = async () => {
    if (!window.api) {
      alert("La consulta SUNAT/RENIEC solo está disponible en la aplicación de escritorio.");
      return;
    }
    const doc = form.dni.trim();
    if (doc.length !== 8 && doc.length !== 11) return;
    
    setLoadingQuery(true);
    const token = localStorage.getItem('sunat_api_token') || '';
    
    try {
      if (doc.length === 8) {
        const res = await window.api.consultarDni(doc, token);
        if (res.success && res.data) {
          const nombreCompleto = `${res.data.nombres || ''} ${res.data.apellidoPaterno || ''} ${res.data.apellidoMaterno || ''}`.replace(/\s+/g, ' ').trim();
          setForm(prev => ({
            ...prev,
            nombre: nombreCompleto
          }));
        } else {
          alert(`Error: ${res.error || 'No se encontraron datos para este DNI.'}`);
        }
      } else {
        const res = await window.api.consultarRuc(doc, token);
        if (res.success && res.data) {
          setForm(prev => ({
            ...prev,
            nombre: res.data.razonSocial || res.data.nombre || res.data.razon_social || '',
            direccion: res.data.direccion || ''
          }));
        } else {
          alert(`Error: ${res.error || 'No se encontraron datos para este RUC.'}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error inesperado al conectar con el servidor.");
    } finally {
      setLoadingQuery(false);
    }
  };

  const open = (c=null) => { setForm(c ? {...c} : EMPTY); setEditId(c?.id||null); setModal(true); };
  const close = () => { setModal(false); setForm(EMPTY); setEditId(null); };
  const save = () => {
    if (!form.nombre.trim()) return;
    if (editId) updateClient({...form, id:editId});
    else addClient(form);
    close();
  };

  const handleAbonar = (e) => {
    e.preventDefault();
    const monto = parseFloat(montoAbono);
    
    // Obtener deuda total del cliente
    const deudasCliente = ventas.filter(v => v.clienteId === deudaCliente.id && v.montoDeuda > 0);
    const totalDeuda = deudasCliente.reduce((sum, v) => sum + v.montoDeuda, 0);

    if (isNaN(monto) || monto <= 0) {
      setErrorAbono('El monto del abono debe ser mayor a 0');
      return;
    }
    if (monto > totalDeuda) {
      setErrorAbono(`El abono no puede superar la deuda total (S/ ${totalDeuda.toFixed(2)})`);
      return;
    }

    const abonoData = {
      fecha: new Date().toISOString(),
      clienteId: deudaCliente.id,
      clienteNombre: deudaCliente.nombre,
      monto,
      metodoPago: metodoAbono,
      usuario: currentUser?.nombre || 'Administrador'
    };

    registrarAbonoCliente(abonoData);
    setMontoAbono('');
    setErrorAbono('');
    setDeudaCliente(null);
  };

  return (
    <div>
      <div className="header-row page-header">
        <div><h1>Clientes</h1><p>Cartera de compradores y registro para boletas/facturas</p></div>
        <button className="btn btn-primary" onClick={()=>open()}><Plus size={15}/>Nuevo cliente</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI / RUC</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Dirección</th>
              <th>Saldo Deudor</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c=>{
              const deudasCliente = ventas.filter(v => v.clienteId === c.id && v.montoDeuda > 0);
              const totalDeuda = deudasCliente.reduce((sum, v) => sum + v.montoDeuda, 0);
              
              return (
                <tr key={c.id}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>{c.dni||<span style={{color:'var(--text-light)'}}>—</span>}</td>
                  <td>{c.telefono||<span style={{color:'var(--text-light)'}}>—</span>}</td>
                  <td>{c.email||<span style={{color:'var(--text-light)'}}>—</span>}</td>
                  <td>{c.direccion||<span style={{color:'var(--text-light)'}}>—</span>}</td>
                  <td>
                    {totalDeuda > 0 ? (
                      <span className="badge badge-red" style={{ fontWeight: 600 }}>S/ {totalDeuda.toFixed(2)}</span>
                    ) : (
                      <span className="badge badge-green" style={{ opacity: 0.8 }}>S/ 0.00</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                      {c.id !== 1 && (
                        <>
                          <button 
                            className="action-btn" 
                            style={{ 
                              background: totalDeuda > 0 ? '#fffbeb' : '#f0fdf4', 
                              color: totalDeuda > 0 ? '#d97706' : '#16a34a', 
                              borderColor: totalDeuda > 0 ? '#fef3c7' : '#dcfce7' 
                            }} 
                            title="Cobrar / Abonos" 
                            onClick={() => setDeudaCliente(c)}
                          >
                            <Coins size={13}/>
                          </button>
                          <button className="action-btn edit" onClick={()=>open(c)}><Pencil size={13}/></button>
                          <button className="action-btn del" onClick={()=>{ if(window.confirm('¿Seguro que deseas eliminar este cliente?')) deleteClient(c.id); }}><Trash2 size={13}/></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo/Editar Cliente */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editId?'Editar cliente':'Nuevo cliente'}</h2>
              <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-light)'}} onClick={close}><X size={18}/></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">DNI / RUC (RENIEC/SUNAT)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    className="form-input" 
                    value={form.dni} 
                    onChange={e=>setForm({...form,dni:e.target.value.replace(/\D/g, '')})} 
                    placeholder="Número de documento (8 o 11 dígitos)"
                    maxLength={11}
                  />
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0 14px', whiteSpace: 'nowrap', minHeight: 38 }}
                    onClick={consultarDoc}
                    disabled={loadingQuery || (form.dni.length !== 8 && form.dni.length !== 11)}
                  >
                    {loadingQuery ? 'Buscando...' : 'Consultar'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nombre / Razón social *</label>
                <input className="form-input" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Nombre completo o razón social"/>
              </div>
              <div className="form-group"><label className="form-label">Teléfono</label>
                <input className="form-input" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} placeholder="999 999 999"/></div>
              <div className="form-group"><label className="form-label">Correo electrónico</label>
                <input className="form-input" type="email" value={form.email || ''} onChange={e=>setForm({...form,email:e.target.value})} placeholder="correo@ejemplo.com"/></div>
              <div className="form-group"><label className="form-label">Dirección</label>
                <input className="form-input" value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})} placeholder="Dirección completa"/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={close}>Cancelar</button>
              <button className="btn btn-primary" onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cuentas y Abonos de Deuda */}
      {deudaCliente && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 680, width: '90%' }}>
            <div className="modal-header">
              <h2>Cuenta Corriente: {deudaCliente.nombre}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }} onClick={() => setDeudaCliente(null)}><X size={18}/></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              
              {/* Resumen Deuda */}
              {(() => {
                const deudas = ventas.filter(v => v.clienteId === deudaCliente.id && v.montoDeuda > 0);
                const totalD = deudas.reduce((sum, v) => sum + v.montoDeuda, 0);
                const abonos = pagosDeuda.filter(p => p.clienteId === deudaCliente.id);

                return (
                  <>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      <div className="stat-card" style={{ flex: 1, padding: 12 }}>
                        <div className="stat-title" style={{ fontSize: 10 }}>DEUDA TOTAL PENDIENTE</div>
                        <div className="stat-val" style={{ fontSize: 20, color: 'var(--red)' }}>S/ {totalD.toFixed(2)}</div>
                      </div>
                      <div className="stat-card" style={{ flex: 1, padding: 12 }}>
                        <div className="stat-title" style={{ fontSize: 10 }}>PAGOS / ABONOS REALIZADOS</div>
                        <div className="stat-val" style={{ fontSize: 20, color: 'var(--green)' }}>S/ {abonos.reduce((sum, a) => sum + a.monto, 0).toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Formulario de Cobranza (solo si hay deuda) */}
                    {totalD > 0 && (
                      <form onSubmit={handleAbonar} style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 16 }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>REGISTRAR ABONO / PAGO DE DEUDA</h4>
                        
                        {errorAbono && (
                          <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>
                            ⚠️ {errorAbono}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, alignItems: 'end' }}>
                          <div className="form-group" style={{ margin: 0, flex: 1 }}>
                            <label className="form-label" style={{ fontSize: 11 }}>Monto a recibir (S/) *</label>
                            <input 
                              className="form-input" 
                              style={{ padding: '6px 10px', fontSize: 13 }}
                              type="number" 
                              step="0.01" 
                              min="0.01"
                              max={totalD}
                              placeholder={`Max S/ ${totalD.toFixed(2)}`}
                              value={montoAbono}
                              onChange={e => setMontoAbono(e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{ margin: 0, width: 140 }}>
                            <label className="form-label" style={{ fontSize: 11 }}>Método de pago *</label>
                            <select 
                              className="form-select"
                              style={{ padding: '6px 10px', fontSize: 13 }}
                              value={metodoAbono}
                              onChange={e => setMetodoAbono(e.target.value)}
                            >
                              <option>Efectivo</option>
                              <option>Yape</option>
                              <option>Transferencia</option>
                              <option>Tarjeta</option>
                            </select>
                          </div>
                          <button type="submit" className="btn btn-primary" style={{ height: 'fit-content', padding: '8px 16px', fontSize: 13 }}>
                            Registrar Abono
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Ventas con Deuda */}
                    <h3 style={{ fontSize: 13, marginBottom: 8, fontWeight: 600, color: 'var(--text-mid)' }}>Ventas Pendientes / Fiados</h3>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                      <table style={{ margin: 0, fontSize: 12 }}>
                        <thead style={{ background: '#f4f5f7' }}>
                          <tr>
                            <th>Documento</th>
                            <th>Fecha</th>
                            <th>Total Venta</th>
                            <th>Monto Pagado</th>
                            <th className="text-right">Saldo Deudor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deudas.length === 0 ? (
                            <tr><td colSpan={5} className="text-center" style={{ padding: 12, color: 'var(--text-light)' }}>Sin ventas pendientes de pago</td></tr>
                          ) : (
                            deudas.map(v => (
                              <tr key={v.id}>
                                <td><strong>{v.codigo}</strong></td>
                                <td>{new Date(v.fecha).toLocaleDateString('es-PE')}</td>
                                <td>S/ {v.total.toFixed(2)}</td>
                                <td>S/ {(v.montoPagado || 0).toFixed(2)}</td>
                                <td className="text-right" style={{ fontWeight: 600, color: 'var(--red)' }}>S/ {v.montoDeuda.toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Historial de Abonos */}
                    <h3 style={{ fontSize: 13, marginBottom: 8, fontWeight: 600, color: 'var(--text-mid)' }}>Historial de Abonos</h3>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                      <table style={{ margin: 0, fontSize: 12 }}>
                        <thead style={{ background: '#f4f5f7' }}>
                          <tr>
                            <th>Fecha y Hora</th>
                            <th>Monto Cobrado</th>
                            <th>Método Pago</th>
                            <th>Recibido por</th>
                          </tr>
                        </thead>
                        <tbody>
                          {abonos.length === 0 ? (
                            <tr><td colSpan={4} className="text-center" style={{ padding: 12, color: 'var(--text-light)' }}>No se han registrado abonos aún</td></tr>
                          ) : (
                            abonos.map(a => (
                              <tr key={a.id}>
                                <td>{new Date(a.fecha).toLocaleString('es-PE')}</td>
                                <td style={{ fontWeight: 600, color: 'var(--green)' }}>S/ {a.monto.toFixed(2)}</td>
                                <td><span className="badge badge-gray">{a.metodoPago}</span></td>
                                <td>{a.usuario || '—'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeudaCliente(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
