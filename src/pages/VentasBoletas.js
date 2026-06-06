import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, Printer } from 'lucide-react';

function BoletaModal({ venta, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal boleta-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-body">
          <div className="boleta-header">
            <div className="logo">🌾</div>
            <h3>FERCORD</h3>
            <p>Nutrición Balanceada · Aves y Cerdos</p>
            <hr style={{border:'none',borderTop:'1px dashed #ccc',margin:'12px 0 8px'}}/>
            <div style={{fontWeight:700,fontSize:14}}>
              {venta.tipo==='factura'?'FACTURA DE VENTA':'BOLETA DE VENTA'}
            </div>
            <div style={{fontSize:13}}>{venta.codigo}</div>
            <div style={{fontSize:11,color:'#999',marginTop:2}}>{new Date(venta.fecha).toLocaleString('es-PE')}</div>
          </div>
          <div className="boleta-info">
            <p><strong>Cliente:</strong> {venta.clienteNombre}</p>
            <p><strong>Vendedor:</strong> {venta.vendedor}</p>
            <p><strong>Pago:</strong> {venta.metodoPago}</p>
          </div>
          <table className="boleta-table">
            <thead>
              <tr><th>Item</th><th>Cant</th><th>P.U.</th><th>Total</th></tr>
            </thead>
            <tbody>
              {venta.items.map((item,i)=>(
                <tr key={i}>
                  <td>
                    <div style={{fontWeight:500}}>{item.nombre}</div>
                    <div style={{fontSize:10,color:'#999',textTransform:'capitalize'}}>{item.presentacion} {item.presentacion==='saco'?'40kg':item.presentacion==='medio'?'20kg':item.presentacion==='arroba'?'11.5kg':''}</div>
                  </td>
                  <td style={{textAlign:'center'}}>{item.cantidad}</td>
                  <td>S/ {item.precioUnitario.toFixed(2)}</td>
                  <td style={{fontWeight:600}}>S/ {item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="boleta-total"><span>TOTAL</span><span>S/ {venta.total.toFixed(2)}</span></div>
          <div className="boleta-gracias">¡Gracias por su compra!</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={()=>window.print()}><Printer size={14}/>Imprimir</button>
        </div>
      </div>
    </div>
  );
}

export default function VentasBoletas() {
  const { ventas } = useApp();
  const [selected, setSelected] = useState(null);
  const [filtro, setFiltro] = useState('');

  const filtered = ventas.filter(v =>
    v.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
    v.clienteNombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    v.vendedor?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Ventas / Boletas</h1>
        <p>Historial de comprobantes emitidos</p>
      </div>
      <div className="mb-4">
        <input className="form-input" style={{maxWidth:320}} placeholder="Buscar por código, cliente, vendedor..." value={filtro} onChange={e=>setFiltro(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th><th>Fecha</th><th>Cliente</th><th>Método pago</th><th>Vendedor</th><th className="text-right">Total</th><th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="text-center" style={{padding:40,color:'var(--text-light)'}}>No hay ventas registradas</td></tr>
              : filtered.map(v=>(
                <tr key={v.id}>
                  <td><strong>{v.codigo}</strong></td>
                  <td style={{color:'var(--text-light)',fontSize:13}}>{new Date(v.fecha).toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'})}</td>
                  <td>{v.clienteNombre}</td>
                  <td><span className={`badge ${v.metodoPago==='Efectivo'?'badge-green':v.metodoPago==='Yape'?'badge-orange':'badge-gray'}`}>{v.metodoPago}</span></td>
                  <td>{v.vendedor}</td>
                  <td className="text-right"><strong>S/ {v.total.toFixed(2)}</strong></td>
                  <td className="text-right">
                    <button className="action-btn view" onClick={()=>setSelected(v)}><Eye size={14}/></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {selected && <BoletaModal venta={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}
