import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X } from 'lucide-react';

export default function CajaDiaria() {
  const { cajaAbierta, abrirCaja, cerrarCaja, movimientosCaja, agregarMovimientoCaja, historialCajas } = useApp();
  const [showMov, setShowMov] = useState(false);
  const [showApertura, setShowApertura] = useState(false);
  const [showCierre, setShowCierre] = useState(false);
  const [montoInicial, setMontoInicial] = useState('');
  const [movForm, setMovForm] = useState({ tipo:'Gasto / Salida', concepto:'', monto:'' });
  const [montoReal, setMontoReal] = useState('');
  const [notaCierre, setNotaCierre] = useState('');

  const esperado = cajaAbierta
    ? (cajaAbierta.montoInicial||0) + (cajaAbierta.ingresos||0) - (cajaAbierta.egresos||0)
    : 0;

  const ingresosEfectivo = movimientosCaja
    .filter(m => m.tipo === 'Ingreso' && (m.metodoPago === 'Efectivo' || !m.metodoPago))
    .reduce((s, m) => s + parseFloat(m.monto || 0), 0);

  const egresosEfectivo = movimientosCaja
    .filter(m => (m.tipo === 'Gasto / Salida' || m.tipo === 'Egreso') && (m.metodoPago === 'Efectivo' || !m.metodoPago))
    .reduce((s, m) => s + parseFloat(m.monto || 0), 0);

  const esperadoEfectivo = cajaAbierta
    ? (cajaAbierta.montoInicial || 0) + ingresosEfectivo - egresosEfectivo
    : 0;

  const ejecutarCierre = () => {
    const realVal = parseFloat(montoReal) || 0;
    const diferencia = realVal - esperadoEfectivo;
    cerrarCaja({
      montoReal: realVal,
      diferencia: diferencia,
      notaCierre: notaCierre
    });
    setShowCierre(false);
    setMontoReal('');
    setNotaCierre('');
  };

  const registrarMov = () => {
    if (!movForm.monto || !movForm.concepto) return;
    agregarMovimientoCaja(movForm);
    setMovForm({ tipo:'Gasto / Salida', concepto:'', monto:'' });
    setShowMov(false);
  };

  return (
    <div>
      <div className="header-row page-header">
        <div><h1>Caja diaria</h1><p>Apertura, cierre, ingresos por venta y salidas por gastos</p></div>
        <div style={{display:'flex',gap:10}}>
          {cajaAbierta && <button className="btn btn-outline" onClick={()=>setShowMov(true)}><Plus size={15}/>Movimiento</button>}
          {cajaAbierta
            ? <button className="btn btn-danger" onClick={()=>setShowCierre(true)}>Cerrar caja</button>
            : <button className="btn btn-primary" onClick={()=>setShowApertura(true)}>Abrir caja</button>
          }
        </div>
      </div>

      {!cajaAbierta ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{maxWidth:400,textAlign:'center',padding:40,alignSelf:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>💰</div>
            <h3 style={{marginBottom:8}}>No hay caja abierta</h3>
            <p style={{color:'var(--text-light)',fontSize:14,marginBottom:0}}>Abre la caja para registrar movimientos del día.</p>
          </div>

          {historialCajas && historialCajas.length > 0 && (
            <div className="card">
              <h3 style={{marginBottom:16,fontSize:16}}>Historial de Cajas Diarias</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Apertura</th>
                      <th>Cierre</th>
                      <th>Monto Inicial</th>
                      <th>Ingresos</th>
                      <th>Egresos</th>
                      <th>Saldo Real</th>
                      <th>Diferencia</th>
                      <th>Nota / Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialCajas.map(c => {
                      const diff = c.diferencia || 0;
                      let badgeClass = 'badge-gray';
                      let diffText = `S/ ${diff.toFixed(2)}`;
                      if (diff < 0) {
                        badgeClass = 'badge-red';
                      } else if (diff > 0) {
                        badgeClass = 'badge-green';
                        diffText = `+S/ ${diff.toFixed(2)}`;
                      }
                      return (
                        <tr key={c.id}>
                          <td>{new Date(c.id).toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'})}</td>
                          <td>{c.fechaCierre ? new Date(c.fechaCierre).toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                          <td>S/ {(c.montoInicial||0).toFixed(2)}</td>
                          <td>S/ {(c.ingresos||0).toFixed(2)}</td>
                          <td>S/ {(c.egresos||0).toFixed(2)}</td>
                          <td style={{fontWeight:600}}>S/ {(c.montoReal||0).toFixed(2)}</td>
                          <td>
                            <span className={`badge ${badgeClass}`}>{diffText}</span>
                          </td>
                          <td style={{fontSize:12,color:'var(--text-mid)'}}>{c.notaCierre || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
            <div className="stat-card">
              <div className="stat-label">Monto inicial</div>
              <div className="stat-value">S/ {(cajaAbierta.montoInicial||0).toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ingresos</div>
              <div className="stat-value" style={{color:'var(--green)'}}>S/ {(cajaAbierta.ingresos||0).toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Egresos</div>
              <div className="stat-value" style={{color:'var(--red)'}}>S/ {(cajaAbierta.egresos||0).toFixed(2)}</div>
            </div>
            <div className="stat-card" style={{background:'var(--green)',border:'none'}}>
              <div className="stat-label" style={{color:'rgba(255,255,255,0.7)'}}>Esperado en caja</div>
              <div className="stat-value" style={{color:'white'}}>S/ {esperado.toFixed(2)}</div>
            </div>
          </div>

          <h3 style={{marginBottom:12,fontSize:16}}>Movimientos de caja</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Usuario</th><th className="text-right">Monto</th></tr>
              </thead>
              <tbody>
                {movimientosCaja.length===0
                  ? <tr><td colSpan={5} className="text-center" style={{padding:32,color:'var(--text-light)'}}>Sin movimientos</td></tr>
                  : movimientosCaja.map(m=>(
                    <tr key={m.id}>
                      <td style={{fontSize:12.5,color:'var(--text-light)'}}>{new Date(m.fecha).toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'})}</td>
                      <td><span className={`badge ${m.tipo==='Ingreso'?'badge-green':'badge-red'}`}>{m.tipo}</span></td>
                      <td>{m.concepto}</td>
                      <td style={{fontSize:12.5}}>{m.usuario}</td>
                      <td className="text-right" style={{fontWeight:600,color:m.tipo==='Ingreso'?'var(--green)':'var(--red)'}}>
                        {m.tipo==='Ingreso'?'+':'-'}S/ {parseFloat(m.monto).toFixed(2)}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </>
      )}

      {showApertura && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h2>Apertura de caja</h2><button style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>setShowApertura(false)}><X size={18}/></button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Monto inicial (S/)</label>
                <input className="form-input" type="number" value={montoInicial} onChange={e=>setMontoInicial(e.target.value)} placeholder="0.00"/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowApertura(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={()=>{abrirCaja(montoInicial||0);setShowApertura(false);}}>Abrir caja</button>
            </div>
          </div>
        </div>
      )}

      {showMov && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h2>Movimiento de caja</h2><button style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>setShowMov(false)}><X size={18}/></button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Tipo</label>
                <select className="form-select" value={movForm.tipo} onChange={e=>setMovForm({...movForm,tipo:e.target.value})}>
                  <option>Gasto / Salida</option><option>Ingreso</option>
                </select></div>
              <div className="form-group"><label className="form-label">Concepto (ej. almuerzo, bebidas)</label>
                <input className="form-input" value={movForm.concepto} onChange={e=>setMovForm({...movForm,concepto:e.target.value})} placeholder="Descripción del movimiento"/></div>
              <div className="form-group"><label className="form-label">Monto (S/)</label>
                <input className="form-input" type="number" step="0.01" value={movForm.monto} onChange={e=>setMovForm({...movForm,monto:e.target.value})} placeholder="0.00"/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowMov(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={registrarMov}>Registrar</button>
            </div>
          </div>
        </div>
      )}

      {showCierre && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2>Cierre de Caja y Arqueo</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowCierre(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f4f7f3', padding: 14, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>Efectivo Inicial:</span>
                  <strong>S/ {(cajaAbierta?.montoInicial || 0).toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>Ingresos en Efectivo (+):</span>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>S/ {ingresosEfectivo.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>Egresos/Gastos en Efectivo (-):</span>
                  <span style={{ color: 'var(--red)', fontWeight: 600 }}>S/ {egresosEfectivo.toFixed(2)}</span>
                </div>
                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>Efectivo Físico Esperado:</span>
                  <strong style={{ color: 'var(--green)' }}>S/ {esperadoEfectivo.toFixed(2)}</strong>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Efectivo Real Contado (S/) *</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  value={montoReal}
                  onChange={e => setMontoReal(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nota o Comentarios de Cierre</label>
                <input
                  className="form-input"
                  value={notaCierre}
                  onChange={e => setNotaCierre(e.target.value)}
                  placeholder="Ej: Faltó sencillo, cuadre exacto..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowCierre(false)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={ejecutarCierre} disabled={montoReal === ''}>
                Finalizar Cierre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
