import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Pencil, Trash2, X, PackagePlus, Scissors } from 'lucide-react';

const EMPTY = {
  nombre:'', categoria:'Aves', etapa:'', tipoVenta:'sacos',
  kgPorSaco: 40,
  pSaco:0, pMedio:0, pArroba:0, pKilo:0, pUnidad:0,
  sacos:0, granel:0, unidades:0, precioCosto:0,
  stockMinimo:5, lote:'', fechaVencimiento:''
};
const CATEGORIAS_DEFAULT = ['Aves','Cerdos','Medicinas','Equipos Avícolas','Otros'];

function ProductModal({ producto, onClose, onSave, todasCategorias }) {
  const [form, setForm] = useState(producto || EMPTY);
  const [catPersonalizada, setCatPersonalizada] = useState('');
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const categorias = [...new Set([...CATEGORIAS_DEFAULT, ...todasCategorias])];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{maxWidth:560}}>
        <div className="modal-header">
          <h2>{producto?'Editar producto':'Nuevo producto'}</h2>
          <button style={{background:'none',border:'none',cursor:'pointer'}} onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.nombre} onChange={e=>f('nombre',e.target.value)} placeholder="Nombre del producto"/>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de venta</label>
              <select className="form-select" value={form.tipoVenta||'sacos'} onChange={e=>f('tipoVenta',e.target.value)}>
                <option value="sacos">Por sacos / granel</option>
                <option value="unidad">Por unidad</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-select" value={form.categoria} onChange={e=>{ if(e.target.value!=='__nueva__') f('categoria',e.target.value); }}>
                {categorias.map(c=><option key={c} value={c}>{c}</option>)}
                <option value="__nueva__">+ Agregar nueva...</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nueva categoría (opcional)</label>
              <input className="form-input" value={catPersonalizada}
                onChange={e=>{ setCatPersonalizada(e.target.value); if(e.target.value) f('categoria',e.target.value); }}
                placeholder="Ej: Vacunas, Herramientas..."/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción / Etapa</label>
            <input className="form-input" value={form.etapa} onChange={e=>f('etapa',e.target.value)} placeholder="Crecimiento, Vitamina, 5ml..."/>
          </div>

          {(form.tipoVenta==='sacos'||!form.tipoVenta) ? (
            <>
              <div className="form-group">
                <label className="form-label">Kilogramos por saco</label>
                <input className="form-input" type="number" step="0.1" value={form.kgPorSaco||40} onChange={e=>f('kgPorSaco',parseFloat(e.target.value)||40)} placeholder="40"/>
                <div style={{fontSize:11,color:'var(--text-light)',marginTop:4}}>Ej: 40, 25, 50, etc.</div>
              </div>
              <div style={{fontWeight:600,fontSize:13,color:'var(--text-mid)',margin:'12px 0 8px'}}>Precios (S/)</div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Saco ({form.kgPorSaco||40}KG)</label>
                  <input className="form-input" type="number" step="0.01" value={form.pSaco} onChange={e=>f('pSaco',parseFloat(e.target.value)||0)}/></div>
                <div className="form-group"><label className="form-label">Medio ({((form.kgPorSaco||40)/2).toFixed(1)}KG)</label>
                  <input className="form-input" type="number" step="0.01" value={form.pMedio} onChange={e=>f('pMedio',parseFloat(e.target.value)||0)}/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Arroba (11.5KG)</label>
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
            </>
          ) : (
            <>
              <div style={{fontWeight:600,fontSize:13,color:'var(--text-mid)',margin:'12px 0 8px'}}>Precio por unidad (S/)</div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Precio unitario</label>
                  <input className="form-input" type="number" step="0.01" value={form.pUnidad||0} onChange={e=>f('pUnidad',parseFloat(e.target.value)||0)}/></div>
                <div className="form-group"><label className="form-label">Stock inicial (unidades)</label>
                  <input className="form-input" type="number" value={form.unidades||0} onChange={e=>f('unidades',parseInt(e.target.value)||0)}/></div>
              </div>
            </>
          )}
          <div className="form-group" style={{marginTop:12}}>
            <label className="form-label">Precio de Costo (Proveedor S/)</label>
            <input className="form-input" type="number" step="0.01" value={form.precioCosto||0} onChange={e=>f('precioCosto',parseFloat(e.target.value)||0)} placeholder="Precio de compra al proveedor"/>
          </div>
          <div className="form-row" style={{marginTop:12}}>
            <div className="form-group">
              <label className="form-label">Alerta Stock Mínimo</label>
              <input className="form-input" type="number" value={form.stockMinimo!==undefined?form.stockMinimo:5} onChange={e=>f('stockMinimo',parseInt(e.target.value)||0)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Código de Lote</label>
              <input className="form-input" value={form.lote||''} onChange={e=>f('lote',e.target.value)} placeholder="Ej: LOTE-A12"/>
            </div>
          </div>
          <div className="form-group" style={{marginTop:12}}>
            <label className="form-label">Fecha de Vencimiento</label>
            <input className="form-input" type="date" value={form.fechaVencimiento||''} onChange={e=>f('fechaVencimiento',e.target.value)}/>
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
  const [cantidad, setCantidad] = useState(0);
  const [nota, setNota] = useState('');
  const [lote, setLote] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const kgPorSaco = producto.kgPorSaco || 40;
  const esUnidad = producto.tipoVenta === 'unidad';

  const registrar = () => {
    const cant = parseInt(cantidad) || 0;
    if (cant <= 0) return;

    let notaFinal = nota;
    if (!notaFinal) {
      const loteText = lote ? ` (Lote: ${lote})` : '';
      notaFinal = esUnidad 
        ? `Ingreso ${cant} unidad(es)${loteText}` 
        : tipo === 'ingreso' 
          ? `Ingreso ${cant} saco(s)${loteText}` 
          : `Apertura ${cant} saco(s) → ${cant * kgPorSaco} kg granel`;
    }

    if (tipo === 'ingreso') {
      onSave(producto.id, esUnidad ? 0 : cant, 0, notaFinal, esUnidad ? cant : 0, lote, fechaVencimiento);
    } else {
      onSave(producto.id, -cant, cant * kgPorSaco, notaFinal, 0);
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
            <span style={{color:'var(--text-light)',marginLeft:12}}>
              {esUnidad ? `${producto.unidades||0} unidades` : `${producto.sacos} sacos · ${(producto.granel||0).toFixed(1)} kg granel`}
            </span>
          </div>
          <div className="form-group">
            <label className="form-label">
              {esUnidad ? 'Unidades a ingresar' : tipo==='ingreso' ? 'Sacos a ingresar' : 'Sacos a abrir (pasan a granel)'}
            </label>
            <input className="form-input" type="number" min="1" value={cantidad} onChange={e=>setCantidad(e.target.value)} placeholder="0"/>
            {!esUnidad && tipo==='apertura' && parseInt(cantidad) > 0 && (
              <div style={{marginTop:6,fontSize:12,color:'var(--text-light)'}}>
                Se descontarán <strong>{cantidad} saco(s)</strong> y se agregarán <strong>{parseInt(cantidad)*kgPorSaco} kg</strong> al granel
              </div>
            )}
          </div>
          
          {tipo === 'ingreso' && (
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Lote (Opcional)</label>
                <input className="form-input" value={lote} onChange={e => setLote(e.target.value)} placeholder="Ej: L-409" />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha Vencimiento (Opcional)</label>
                <input className="form-input" type="date" value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nota (opcional)</label>
            <input className="form-input" value={nota} onChange={e=>setNota(e.target.value)} placeholder="Ej: Compra proveedor..."/>
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
  const [modal, setModal] = useState(null);

  const todasCategorias = [...new Set(products.map(p=>p.categoria))];
  const cats = [...new Set(['Aves','Cerdos',...todasCategorias])];
  const filtered = products.filter(p=>p.categoria===categoria);

  return (
    <div>
      <div className="header-row page-header">
        <div><h1>Productos / Almacén</h1><p>Catálogo de productos: concentrados, medicinas, equipos y más</p></div>
        <button className="btn btn-primary" onClick={()=>setModal({type:'add'})}><Plus size={15}/>Nuevo producto</button>
      </div>
      <div className="category-tabs mb-4" style={{flexWrap:'wrap'}}>
        {cats.map(cat=>(
          <button key={cat} className={`tab-btn ${categoria===cat?'active':''}`} onClick={()=>setCategoria(cat)}>{cat}</button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th><th>Etapa / Desc.</th><th>Tipo venta</th><th>Kg/Saco</th>
              <th>P. Costo</th><th>P. Saco</th><th>P. Medio</th><th>P. Arroba</th><th>P. Kilo / Unid.</th>
              <th>Stock</th><th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={10} className="text-center" style={{padding:32,color:'var(--text-light)'}}>No hay productos en esta categoría</td></tr>
              : filtered.map(p=>(
              <tr key={p.id}>
                <td><strong>{p.nombre}</strong></td>
                <td>{p.etapa ? <span className="badge badge-green">{p.etapa}</span> : <span style={{color:'var(--text-light)'}}>—</span>}</td>
                <td><span className={`badge ${p.tipoVenta==='unidad'?'badge-orange':'badge-gray'}`}>{p.tipoVenta==='unidad'?'Unidad':'Sacos/kg'}</span></td>
                <td>{p.tipoVenta==='unidad' ? <span style={{color:'var(--text-light)'}}>—</span> : <strong>{p.kgPorSaco||40} kg</strong>}</td>
                <td><strong>S/ {(p.precioCosto||0).toFixed(2)}</strong></td>
                {p.tipoVenta==='unidad' ? (
                  <><td colSpan={3} style={{color:'var(--text-light)'}}>—</td><td style={{fontWeight:600}}>S/ {(p.pUnidad||0).toFixed(2)}</td></>
                ) : (
                  <><td>S/ {p.pSaco.toFixed(2)}</td><td>S/ {p.pMedio.toFixed(2)}</td>
                  <td>S/ {p.pArroba.toFixed(2)}</td><td>S/ {p.pKilo.toFixed(2)}</td></>
                )}
                <td>
                  {p.tipoVenta==='unidad'
                    ? <strong style={{color: (p.unidades||0)<3?'var(--red)':'inherit'}}>{p.unidades||0} und.</strong>
                    : <><strong style={{color:p.sacos<5?'var(--red)':'inherit'}}>{p.sacos} sacos</strong><br/><span style={{fontSize:11,color:'var(--text-light)'}}>{(p.granel||0).toFixed(1)} kg</span></>
                  }
                </td>
                <td className="text-right">
                  <div style={{display:'flex',gap:5,justifyContent:'flex-end'}}>
                    <button className="action-btn stock" title="Ingreso de stock" onClick={()=>setModal({type:'stock',producto:p})}><PackagePlus size={13}/></button>
                    {p.tipoVenta!=='unidad' && <button className="action-btn" style={{background:'#f0f0f0',color:'#666'}} title="Apertura de saco" onClick={()=>setModal({type:'apertura',producto:p})}><Scissors size={13}/></button>}
                    <button className="action-btn edit" onClick={()=>setModal({type:'edit',producto:p})}><Pencil size={13}/></button>
                    <button className="action-btn del" onClick={()=>deleteProduct(p.id)}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type==='add' && <ProductModal todasCategorias={todasCategorias} onClose={()=>setModal(null)} onSave={addProduct}/>}
      {modal?.type==='edit' && <ProductModal producto={modal.producto} todasCategorias={todasCategorias} onClose={()=>setModal(null)} onSave={updateProduct}/>}
      {(modal?.type==='stock'||modal?.type==='apertura') && (
        <StockModal producto={modal.producto} tipo={modal.type==='stock'?'ingreso':'apertura'} onClose={()=>setModal(null)} onSave={ingresarStock}/>
      )}
    </div>
  );
}