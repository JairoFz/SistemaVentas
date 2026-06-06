import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Kardex() {
  const { kardex, products } = useApp();
  const [filtroProducto, setFiltroProducto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const filtered = kardex.filter(k =>
    (!filtroProducto || k.productoId === Number(filtroProducto)) &&
    (!filtroTipo || k.tipo === filtroTipo)
  );

  return (
    <div>
      <div className="page-header">
        <h1>Kárdex / Almacén</h1>
        <p>Movimientos de stock: ingresos, aperturas de saco y ventas</p>
      </div>
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        <select className="form-select" style={{maxWidth:240}} value={filtroProducto} onChange={e=>setFiltroProducto(e.target.value)}>
          <option value="">Todos los productos</option>
          {products.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select className="form-select" style={{maxWidth:180}} value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option>Venta</option>
          <option>Ingreso</option>
          <option>Apertura</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th className="text-right">Δ Sacos</th><th className="text-right">Δ Kg</th><th>Nota</th><th>Usuario</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="text-center" style={{padding:40,color:'var(--text-light)'}}>Sin movimientos</td></tr>
              : filtered.map(k=>(
                <tr key={k.id}>
                  <td style={{color:'var(--text-light)',fontSize:12.5}}>{new Date(k.fecha).toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'})}</td>
                  <td><strong>{k.producto}</strong></td>
                  <td>
                    <span className={`badge ${k.tipo==='Venta'?'badge-red':k.tipo==='Ingreso'?'badge-green':'badge-orange'}`}>
                      {k.tipo}
                    </span>
                  </td>
                  <td className="text-right" style={{fontWeight:600,color:k.deltaSacos>=0?'var(--green)':'var(--red)'}}>
                    {k.deltaSacos>0?'+':''}{k.deltaSacos}
                  </td>
                  <td className="text-right" style={{fontWeight:600,color:k.deltaKg>=0?'var(--green)':'var(--red)'}}>
                    {k.deltaKg>0?'+':''}{k.deltaKg?.toFixed(2)}
                  </td>
                  <td style={{fontSize:12.5,color:'var(--text-light)'}}>{k.nota}</td>
                  <td style={{fontSize:12.5}}>{k.usuario}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
