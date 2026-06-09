import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingCart, X, Plus, Minus, Printer, Pencil } from 'lucide-react';

function imprimirBoleta(venta) {
  const win = window.open('', '_blank', 'width=420,height=650');
  const items = venta.items.map(item => `
    <tr>
      <td>
        <div style="font-weight:500">${item.nombre}</div>
        <div style="font-size:10px;color:#999;text-transform:capitalize">
          ${item.presentacion !== 'unidad'
            ? item.presentacion + ' ' + (item.presentacion==='saco'?'40kg':item.presentacion==='medio'?'20kg':item.presentacion==='arroba'?'11.5kg':'')
            : 'Unidad'}
        </div>
      </td>
      <td style="text-align:center">${item.cantidad}</td>
      <td>S/ ${item.precioUnitario.toFixed(2)}</td>
      <td style="font-weight:600;text-align:right">S/ ${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join('');

  win.document.write(`<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8"/>
    <title>${venta.codigo}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; width: 300px; margin: 0 auto; }
      .header { text-align:center; padding-bottom: 10px; border-bottom: 1px dashed #ccc; margin-bottom: 10px; }
      .header .logo { font-size: 26px; }
      .header h2 { font-size: 15px; font-weight: 700; margin: 4px 0 2px; }
      .header p { font-size: 10px; color: #666; }
      .tipo { font-weight: 700; font-size: 13px; margin-top: 8px; }
      .codigo { font-size: 12px; margin-top: 2px; }
      .fecha { font-size: 10px; color: #999; margin-top: 2px; }
      .info { font-size: 11px; margin: 10px 0; line-height: 1.9; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; }
      th { text-align: left; border-bottom: 1px solid #333; padding: 4px 2px; font-size: 10px; font-weight: 700; }
      td { padding: 5px 2px; border-bottom: 1px dotted #eee; vertical-align: top; }
      .total-row td { border-top: 2px solid #000; border-bottom: none; font-weight: 700; font-size: 14px; padding-top: 8px; }
      .gracias { text-align: center; font-size: 11px; color: #666; margin-top: 14px; padding-top: 10px; border-top: 1px dashed #ccc; }
      @media print { body { padding: 0; } }
    </style>
  </head><body>
    <div class="header">
      <div class="logo">🌾</div>
      <h2>FERCORD</h2>
      <p>Nutrición Balanceada · Aves y Cerdos</p>
      <hr style="border:none;border-top:1px dashed #ccc;margin:8px 0 6px"/>
      <div class="tipo">${venta.tipo === 'factura' ? 'FACTURA DE VENTA' : 'BOLETA DE VENTA'}</div>
      <div class="codigo">${venta.codigo}</div>
      <div class="fecha">${new Date(venta.fecha).toLocaleString('es-PE')}</div>
    </div>
    <div class="info">
      <strong>Cliente:</strong> ${venta.clienteNombre}<br/>
      <strong>Vendedor:</strong> ${venta.vendedor}<br/>
      <strong>Pago:</strong> ${venta.metodoPago}
    </div>
    <table>
      <thead><tr><th>Item</th><th>Cant</th><th>P.U.</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3">TOTAL</td>
          <td style="text-align:right">S/ ${venta.total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <div class="gracias">¡Gracias por su compra!</div>
    <script>window.onload = () => { window.print(); }<\/script>
  </body></html>`);
  win.document.close();
}

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
              {venta.tipo === 'factura' ? 'FACTURA DE VENTA' : 'BOLETA DE VENTA'}
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
              {venta.items.map((item,i) => (
                <tr key={i}>
                  <td>
                    <div style={{fontWeight:500}}>{item.nombre}</div>
                    <div style={{fontSize:10,color:'#999',textTransform:'capitalize'}}>
                      {item.presentacion !== 'unidad' ? `${item.presentacion} ${item.presentacion==='saco'?'40kg':item.presentacion==='medio'?'20kg':item.presentacion==='arroba'?'11.5kg':''}` : 'Unidad'}
                    </div>
                  </td>
                  <td style={{textAlign:'center'}}>{item.cantidad}</td>
                  <td>S/ {item.precioUnitario.toFixed(2)}</td>
                  <td style={{fontWeight:600}}>S/ {item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="boleta-total">
            <span>TOTAL</span>
            <span>S/ {venta.total.toFixed(2)}</span>
          </div>
          <div className="boleta-gracias">¡Gracias por su compra!</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => imprimirBoleta(venta)}>
            <Printer size={14}/> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CajaPOS() {
  const { products, clients, cajaAbierta, abrirCaja, registrarVenta, currentUser } = useApp();
  const todasCategorias = [...new Set(products.map(p=>p.categoria))];
  const [categoria, setCategoria] = useState(todasCategorias[0] || 'Aves');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [clienteId, setClienteId] = useState(1);
  const [tipoBoleta, setTipoBoleta] = useState('boleta');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [boletaVenta, setBoletaVenta] = useState(null);
  const [montoApertura, setMontoApertura] = useState('');
  const [showApertura, setShowApertura] = useState(false);
  const [editandoPrecio, setEditandoPrecio] = useState(null); // key del item editando

  const cats = [...new Set(products.map(p=>p.categoria))];
  const filtered = products.filter(p =>
    p.categoria === categoria &&
    (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
     (p.etapa||'').toLowerCase().includes(busqueda.toLowerCase()))
  );

  const addItem = (producto, presentacion, precio) => {
    const key = `${producto.id}-${presentacion}`;
    setCarrito(prev => {
      const ex = prev.find(x => x.key === key);
      if (ex) return prev.map(x => x.key === key
        ? {...x, cantidad: x.cantidad+1, subtotal:(x.cantidad+1)*x.precioUnitario}
        : x);
      return [...prev, {
        key, productoId: producto.id, nombre: producto.nombre,
        presentacion, precioUnitario: precio, precioOriginal: precio,
        cantidad: 1, subtotal: precio,
        tipoVenta: producto.tipoVenta || 'sacos',
      }];
    });
  };

  const updateQty = (key, delta) => {
    setCarrito(prev => prev.map(x => {
      if (x.key !== key) return x;
      const nueva = Math.max(0.5, parseFloat((x.cantidad + delta).toFixed(2)));
      return {...x, cantidad: nueva, subtotal: nueva * x.precioUnitario};
    }));
  };

  const updateCantidad = (key, valor) => {
    const nueva = parseFloat(valor) || 0;
    if (nueva <= 0) return;
    setCarrito(prev => prev.map(x =>
      x.key === key ? {...x, cantidad: nueva, subtotal: nueva * x.precioUnitario} : x
    ));
  };

  // Delta según presentación: arroba y kilo permiten 0.5, el resto 1
  const getDelta = (presentacion) =>
    (presentacion === 'arroba' || presentacion === 'kilo') ? 0.5 : 1;

  const updatePrecio = (key, nuevoPrecio) => {
    const p = parseFloat(nuevoPrecio) || 0;
    setCarrito(prev => prev.map(x => x.key===key
      ? {...x, precioUnitario: p, subtotal: x.cantidad * p}
      : x
    ));
  };

  const removeItem = (key) => setCarrito(prev => prev.filter(x=>x.key!==key));

  const total = carrito.reduce((s,x)=>s+x.subtotal, 0);
  const cliente = clients.find(c=>c.id===clienteId) || clients[0];

  const cobrar = () => {
    if (carrito.length === 0) return;
    const venta = {
      items: carrito,
      total,
      clienteId,
      clienteNombre: cliente?.nombre || 'Cliente Varios',
      vendedor: currentUser?.nombre,
      metodoPago,
      tipo: tipoBoleta,
    };
    const v = registrarVenta(venta);
    setBoletaVenta(v);
    setCarrito([]);
  };

  if (!cajaAbierta) {
    return (
      <div>
        <div className="page-header">
          <h1>Caja / Punto de Venta</h1>
          <p>La caja está cerrada</p>
        </div>
        <div className="card" style={{maxWidth:400,textAlign:'center',padding:40}}>
          <div style={{fontSize:48,marginBottom:16}}>🏪</div>
          <h3 style={{marginBottom:8,fontSize:18}}>Caja cerrada</h3>
          <p style={{color:'var(--text-light)',marginBottom:24,fontSize:14}}>Debes abrir la caja para comenzar a vender.</p>
          <button className="btn btn-primary" onClick={()=>setShowApertura(true)}>Abrir caja</button>
        </div>
        {showApertura && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header"><h2>Apertura de caja</h2></div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Monto inicial (S/)</label>
                  <input className="form-input" type="number" value={montoApertura} onChange={e=>setMontoApertura(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={()=>setShowApertura(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={()=>{abrirCaja(montoApertura||0);setShowApertura(false);}}>Abrir caja</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="header-row page-header">
        <div><h1>Caja / Punto de Venta</h1><p>Caja abierta · listo para vender</p></div>
        <span className="badge badge-green" style={{padding:'6px 14px',fontSize:13}}>● CAJA ABIERTA</span>
      </div>
      <div className="pos-layout">
        <div className="pos-products">
          {/* Tabs de categorías dinámicas */}
          <div className="category-tabs">
            {cats.map(cat => (
              <button key={cat} className={`tab-btn ${categoria===cat?'active':''}`} onClick={()=>setCategoria(cat)}>{cat}</button>
            ))}
          </div>
          <div className="pos-search">
            <Search/>
            <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar producto..." />
          </div>
          <div className="products-grid">
            {filtered.map(p => (
              <div key={p.id} className="product-card">
                <h3>{p.nombre}</h3>
                <div className="etapa">{p.etapa || p.categoria}</div>
                {p.tipoVenta === 'unidad' ? (
                  <>
                    <div className="stock-info">{p.unidades||0} unidades en stock</div>
                    <div className="price-grid" style={{gridTemplateColumns:'1fr'}}>
                      <button className="price-btn" onClick={()=>addItem(p,'unidad',p.pUnidad||0)}>
                        <div className="pres">Por unidad</div>
                        <div className="precio">S/ {(p.pUnidad||0).toFixed(2)}</div>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stock-info">{p.sacos} sacos · {p.granel.toFixed(1)} kg granel</div>
                    <div className="price-grid">
                      <button className="price-btn" onClick={()=>addItem(p,'saco',p.pSaco)}>
                        <div className="pres">Saco 40KG</div>
                        <div className="precio">S/ {p.pSaco.toFixed(2)}</div>
                      </button>
                      <button className="price-btn" onClick={()=>addItem(p,'medio',p.pMedio)}>
                        <div className="pres">Medio 20KG</div>
                        <div className="precio">S/ {p.pMedio.toFixed(2)}</div>
                      </button>
                      <button className="price-btn" onClick={()=>addItem(p,'arroba',p.pArroba)}>
                        <div className="pres">Arroba 11.5KG</div>
                        <div className="precio">S/ {p.pArroba.toFixed(2)}</div>
                      </button>
                      <button className="price-btn" onClick={()=>addItem(p,'kilo',p.pKilo)}>
                        <div className="pres">Kilo</div>
                        <div className="precio">S/ {p.pKilo.toFixed(2)}</div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pos-cart">
          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
              <ShoppingCart size={18} color="var(--green)"/>
              <span style={{fontWeight:600,fontSize:15}}>Carrito</span>
              <span className="badge badge-green" style={{marginLeft:'auto'}}>{carrito.length}</span>
            </div>
            <div className="cart-items">
              {carrito.length === 0
                ? <div className="cart-empty">Selecciona productos para empezar</div>
                : carrito.map(item => (
                  <div key={item.key} className="cart-item" style={{flexDirection:'column',alignItems:'stretch',gap:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div className="cart-item-info" style={{flex:1}}>
                        <div className="cart-item-name">{item.nombre}</div>
                        <div className="cart-item-sub" style={{textTransform:'capitalize'}}>
                          {item.presentacion}
                          {item.presentacion==='arroba' && ' (11.5kg)'}
                          {item.presentacion==='kilo' && ' (kg)'}
                        </div>
                      </div>
                      <div className="cart-qty">
                        <button className="qty-btn" onClick={()=>updateQty(item.key, -getDelta(item.presentacion))}><Minus size={10}/></button>
                        <input
                          type="number"
                          step={getDelta(item.presentacion)}
                          min="0.5"
                          value={item.cantidad}
                          onChange={e => updateCantidad(item.key, e.target.value)}
                          style={{width:44, textAlign:'center', border:'1px solid var(--border)', borderRadius:4, padding:'2px 4px', fontSize:13, fontWeight:600, fontFamily:'DM Sans, sans-serif'}}
                        />
                        <button className="qty-btn" onClick={()=>updateQty(item.key, getDelta(item.presentacion))}><Plus size={10}/></button>
                      </div>
                      <button className="cart-remove" onClick={()=>removeItem(item.key)}><X size={14}/></button>
                    </div>
                    {/* Precio editable */}
                    <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg)',borderRadius:6,padding:'4px 8px'}}>
                      <span style={{fontSize:11,color:'var(--text-light)',flex:1}}>P.U.</span>
                      {editandoPrecio === item.key ? (
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={item.precioUnitario}
                          style={{width:70,border:'1px solid var(--green)',borderRadius:4,padding:'2px 6px',fontSize:13,fontWeight:600,textAlign:'right'}}
                          autoFocus
                          onBlur={e=>{updatePrecio(item.key, e.target.value); setEditandoPrecio(null);}}
                          onKeyDown={e=>{ if(e.key==='Enter'){updatePrecio(item.key,e.target.value);setEditandoPrecio(null);}}}
                        />
                      ) : (
                        <span
                          style={{fontSize:13,fontWeight:600,cursor:'pointer',borderBottom:'1px dashed var(--text-light)',paddingBottom:1}}
                          onClick={()=>setEditandoPrecio(item.key)}
                          title="Clic para editar precio"
                        >
                          S/ {item.precioUnitario.toFixed(2)}
                        </span>
                      )}
                      <button
                        style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-light)',padding:2}}
                        title="Editar precio"
                        onClick={()=>setEditandoPrecio(editandoPrecio===item.key?null:item.key)}
                      ><Pencil size={12}/></button>
                      {item.precioUnitario !== item.precioOriginal && (
                        <span style={{fontSize:10,color:'var(--orange)',fontWeight:600}}>mod.</span>
                      )}
                      <span style={{fontSize:13,fontWeight:700,color:'var(--green)',marginLeft:4}}>= S/ {item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="cart-footer">
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <select className="form-select" value={clienteId} onChange={e=>setClienteId(Number(e.target.value))}>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="cart-select-row">
                <select className="form-select" value={tipoBoleta} onChange={e=>setTipoBoleta(e.target.value)}>
                  <option value="boleta">Boleta</option>
                  <option value="factura">Factura</option>
                </select>
                <select className="form-select" value={metodoPago} onChange={e=>setMetodoPago(e.target.value)}>
                  <option>Efectivo</option>
                  <option>Yape</option>
                  <option>Transferencia</option>
                  <option>Tarjeta</option>
                </select>
              </div>
              <div className="cart-total">
                <span>Total</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
              <button
                className="btn btn-primary"
                style={{width:'100%',justifyContent:'center',padding:'12px',fontSize:14,opacity:carrito.length===0?0.5:1}}
                onClick={cobrar} disabled={carrito.length===0}
              >
                Cobrar y emitir {tipoBoleta}
              </button>
            </div>
          </div>
        </div>
      </div>

      {boletaVenta && <BoletaModal venta={boletaVenta} onClose={()=>setBoletaVenta(null)} />}
    </div>
  );
}
