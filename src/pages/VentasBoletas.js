import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, Printer } from 'lucide-react';
import BoletaModal from '../components/BoletaModal';

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