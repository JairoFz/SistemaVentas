import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Pencil, Trash2, X, PackagePlus, Scissors } from 'lucide-react';

const EMPTY = { nombre:'', categoria:'Aves', etapa:'', pSaco:0, pMedio:0, pArroba:0, pKilo:0, sacos:0, granel:0 };

function ProductModal({ producto, onClose, onSave }) {
  const [form, setForm] = useState(producto || EMPTY);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div className="modal-overlay">
      <div className="modal" style={{maxWidth:560}}>
        <div className="modal-header">
          <h2>{producto?'Editar producto':'Nuevo producto'}</h2>
          <button style={{background:'none',border:'none',cursor:'pointer'}} onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nombre *</label>
              <input className="form-input" value={form.nombre} onChange={e=>f('nombre',e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Categoría</label>
              <select className="form-select" value={form.categoria} onChange={e=>f('categoria',e.target.value)}>
                <option>Aves</option><option>Cerdos</option>
              </select></div>
          </div>
          <div className="form-group"><label className="form-label">Etapa</label>
            <input className="form-input" value={form.etapa} onChange={e=>f('etapa',e.target.value)} placeholder="Crecimiento, Engorde, Postura..."/></div>
          <div style={{fontWeight:600,fontSize:13,color:'var(--text-mid)',margin:'12px 0 8px'}}>Precios (S/)</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Saco 40KG</label>
              <input className="form-input" type="number" step="0.01" value={form.pSaco} onChange={e=>f('pSaco',parseFloat(e.target.value)||0)}/></div>
            <div className="form-group"><label className="form-label">Medio 20KG</label>
              <input className="form-input" type="number" step="0.01" value={form.pMedio} onChange={e=>f('pMedio',parseFloat(e.target.value)||0)}/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Arroba 11.5KG</label>
              <input className="form-input" type="number" step="0.01" value={form.pArroba} onChange={e=>f('pArroba',parseFloat(e.target.value)||0)}/></div>
            <div className="form-group"><label className="form-label">Kilo</label>
              <input className="form-input" type="number" step="0.01" value={form.pKilo} onChange={e=>f('pKilo',parseFloat(e.target.value)||0)}/></div>
          </div>
          <div style={{fontWeight:600,fontSize:13,color:'var(--text-mid)',margin:'12px 0 8px'}}>Stock inicial</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Sacos</label>
              <input className="form-input" type="number" value={form.sacos} onChange={e=>f('sacos',parseInt(e.target.value)||0)}/></div>
            <div className="form-group"><label className="form-label">Granel (kg)</label>
              <input className="form-input" type="number" step="0.1" value={form.granel} onChange={e=>f('granel',parseFloat(e.target.value)||0)}/></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>{ if(!form.nombre.trim()) return; onSave(form); onClose(); }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function StockModal({ producto, tipo, onClose, onSave }) {
  const [sacos, setSacos] = useState(0);
  const [nota, setNota] = useState('');

  const kgPorSaco = 40;

  const registrar = () => {
    const cantidad = parseInt(sacos) || 0;
    if (cantidad <= 0) return;
    if (tipo === 'ingreso') {
      // Ingreso: suma sacos al stock
      onSave(producto.id, cantidad, 0, nota || `Ingreso ${cantidad} saco(s)`);
    } else {
      // Apertura: descuenta sacos y suma kg al granel
      onSave(producto.id, -cantidad, cantidad * kgPorSaco, nota || `Apertura ${cantidad} saco(s) → ${cantidad * kgPorSaco} kg granel`);
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{tipo==='ingreso'?'Ingreso de stock':'Apertura de saco'}</h2>
          <button style={{background:'none',border:'none',cursor:'pointer'}} onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <div style={{background:'var(--green-light)',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:13}}>
            <strong>{producto.nombre}</strong>
            <span style={{color:'var(--text-light)',marginLeft:12}}>Stock actual: {producto.sacos} sacos · {producto.granel.toFixed(1)} kg granel</span>
          </div>
          <div className="form-group">
            <label className="form-label">
              {tipo==='ingreso' ? 'Sacos a ingresar' : 'Sacos a abrir (pasan a granel)'}
            </label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={sacos}
              onChange={e=>setSacos(e.target.value)}
              placeholder="0"
            />
            {tipo==='apertura' && parseInt(sacos) > 0 && (
              <div style={{marginTop:6,fontSize:12,color:'var(--text-light)'}}>
                Se descontarán <strong>{sacos} saco(s)</strong> y se agregarán <strong>{parseInt(sacos)*kgPorSaco} kg</strong> al granel
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Nota (opcional)</label>
            <input className="form-input" value={nota} onChange={e=>setNota(e.target.value)} placeholder="Ej: Compra proveedor, Apertura para granel..."/>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={registrar}>Registrar</button>
        </div>
      </div>
    </div>
  );
}

export default function Productos() {
  const { products, addProduct, updateProduct, deleteProduct, ingresarStock } = useApp();
  const [categoria, setCategoria] = useState('Aves');
  const [modal, setModal] = useState(null); // null | {type:'add'|'edit'|'stock'|'apertura', producto?}

  const filtered = products.filter(p=>p.categoria===categoria);

  return (
    <div>
      <div className="header-row page-header">
        <div><h1>Productos / Almacén</h1><p>Catálogo de alimentos balanceados, sacos sellados y a granel</p></div>
        <button className="btn btn-primary" onClick={()=>setModal({type:'add'})}><Plus size={15}/>Nuevo producto</button>
      </div>
      <div className="category-tabs mb-4">
        {['Aves','Cerdos'].map(cat=>(
          <button key={cat} className={`tab-btn ${categoria===cat?'active':''}`} onClick={()=>setCategoria(cat)}>{cat}</button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Producto</th><th>Etapa</th><th>P. Saco</th><th>P. Medio</th><th>P. Arroba</th><th>P. Kilo</th><th>Sacos</th><th>Granel (kg)</th><th className="text-right">Acciones</th></tr>
          </thead>
          <tbody>
            {filtered.map(p=>(
              <tr key={p.id}>
                <td><strong>{p.nombre}</strong></td>
                <td><span className="badge badge-green">{p.etapa}</span></td>
                <td>S/ {p.pSaco.toFixed(2)}</td>
                <td>S/ {p.pMedio.toFixed(2)}</td>
                <td>S/ {p.pArroba.toFixed(2)}</td>
                <td>S/ {p.pKilo.toFixed(2)}</td>
                <td><strong style={{color: p.sacos<5?'var(--red)':'inherit'}}>{p.sacos}</strong></td>
                <td><strong>{p.granel.toFixed(2)}</strong></td>
                <td className="text-right">
                  <div style={{display:'flex',gap:5,justifyContent:'flex-end'}}>
                    <button className="action-btn stock" title="Ingreso de stock" onClick={()=>setModal({type:'stock',producto:p})}><PackagePlus size={13}/></button>
                    <button className="action-btn" style={{background:'#f0f0f0',color:'#666'}} title="Apertura de saco" onClick={()=>setModal({type:'apertura',producto:p})}><Scissors size={13}/></button>
                    <button className="action-btn edit" onClick={()=>setModal({type:'edit',producto:p})}><Pencil size={13}/></button>
                    <button className="action-btn del" onClick={()=>deleteProduct(p.id)}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type==='add' && (
        <ProductModal onClose={()=>setModal(null)} onSave={addProduct}/>
      )}
      {modal?.type==='edit' && (
        <ProductModal producto={modal.producto} onClose={()=>setModal(null)} onSave={updateProduct}/>
      )}
      {(modal?.type==='stock'||modal?.type==='apertura') && (
        <StockModal producto={modal.producto} tipo={modal.type==='stock'?'ingreso':'apertura'} onClose={()=>setModal(null)} onSave={ingresarStock}/>
      )}
    </div>
  );
}
