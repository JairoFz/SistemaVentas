import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingCart, X, Plus, Minus, Printer } from 'lucide-react';

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
                    <div style={{fontSize:10,color:'#999',textTransform:'capitalize'}}>{item.presentacion} {item.presentacion==='saco'?'40kg':item.presentacion==='medio'?'20kg':item.presentacion==='arroba'?'11.5kg':''}</div>
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
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={14}/> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CajaPOS() {
  const { products, clients, cajaAbierta, abrirCaja, registrarVenta, currentUser } = useApp();
  const [categoria, setCategoria] = useState('Aves');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [clienteId, setClienteId] = useState(1);
  const [tipoBoleta, setTipoBoleta] = useState('boleta');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [boletaVenta, setBoletaVenta] = useState(null);
  const [montoApertura, setMontoApertura] = useState('');
  const [showApertura, setShowApertura] = useState(false);

  const filtered = products.filter(p =>
    p.categoria === categoria &&
    (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.etapa.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const addItem = (producto, presentacion, precio) => {
    const key = `${producto.id}-${presentacion}`;
    setCarrito(prev => {
      const ex = prev.find(x => x.key === key);
      if (ex) return prev.map(x => x.key === key ? {...x, cantidad: x.cantidad+1, subtotal:(x.cantidad+1)*x.precioUnitario} : x);
      return [...prev, {
        key, productoId: producto.id, nombre: producto.nombre,
        presentacion, precioUnitario: precio,
        cantidad: 1, subtotal: precio,
      }];
    });
  };

  const updateQty = (key, delta) => {
    setCarrito(prev => prev.map(x => x.key===key
      ? {...x, cantidad: Math.max(1,x.cantidad+delta), subtotal: Math.max(1,x.cantidad+delta)*x.precioUnitario}
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
          <div className="category-tabs">
            {['Aves','Cerdos'].map(cat => (
              <button key={cat} className={`tab-btn ${categoria===cat?'active':''}`} onClick={()=>setCategoria(cat)}>{cat}</button>
            ))}
          </div>
          <div className="pos-search">
            <Search/>
            <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar producto o etapa..." />
          </div>
          <div className="products-grid">
            {filtered.map(p => (
              <div key={p.id} className="product-card">
                <h3>{p.nombre}</h3>
                <div className="etapa">{p.etapa}</div>
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
                  <div key={item.key} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.nombre}</div>
                      <div className="cart-item-sub" style={{textTransform:'capitalize'}}>{item.presentacion} · S/ {item.precioUnitario.toFixed(2)}</div>
                    </div>
                    <div className="cart-qty">
                      <button className="qty-btn" onClick={()=>updateQty(item.key,-1)}><Minus size={10}/></button>
                      <span className="qty-val">{item.cantidad}</span>
                      <button className="qty-btn" onClick={()=>updateQty(item.key,1)}><Plus size={10}/></button>
                    </div>
                    <div className="cart-item-price">S/ {item.subtotal.toFixed(2)}</div>
                    <button className="cart-remove" onClick={()=>removeItem(item.key)}><X size={14}/></button>
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
                style={{width:'100%',justifyContent:'center',padding:'12px',fontSize:14,opacity: carrito.length===0?0.5:1}}
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
