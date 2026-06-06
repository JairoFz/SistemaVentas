import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X } from 'lucide-react';

export default function CajaDiaria() {
  const { cajaAbierta, abrirCaja, cerrarCaja, movimientosCaja, agregarMovimientoCaja } = useApp();
  const [showMov, setShowMov] = useState(false);
  const [showApertura, setShowApertura] = useState(false);
  const [montoInicial, setMontoInicial] = useState('');
  const [movForm, setMovForm] = useState({ tipo:'Gasto / Salida', concepto:'', monto:'' });

  const esperado = cajaAbierta
    ? (cajaAbierta.montoInicial||0) + (cajaAbierta.ingresos||0) - (cajaAbierta.egresos||0)
    : 0;

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
            ? <button className="btn btn-danger" onClick={()=>{ if(window.confirm('¿Cerrar caja?')) cerrarCaja(); }}>Cerrar caja</button>
            : <button className="btn btn-primary" onClick={()=>setShowApertura(true)}>Abrir caja</button>
          }
        </div>
      </div>

      {!cajaAbierta ? (
        <div className="card" style={{maxWidth:400,textAlign:'center',padding:40}}>
          <div style={{fontSize:48,marginBottom:16}}>💰</div>
          <h3 style={{marginBottom:8}}>No hay caja abierta</h3>
          <p style={{color:'var(--text-light)',fontSize:14}}>Abre la caja para registrar movimientos del día.</p>
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
    </div>
  );
}
