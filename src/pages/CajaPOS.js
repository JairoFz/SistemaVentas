import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingCart, X, Plus, Minus, Printer, Pencil } from 'lucide-react';
import BoletaModal from '../components/BoletaModal';
import fercordLogo from '../assets/fercord_logo.jpg';

function ImporteModal({ producto, onClose, onAdd }) {
  const [monto, setMonto] = useState('');

  const agregar = () => {
    const m = parseFloat(monto);
    if (!m || m <= 0) return;
    onAdd(producto, 'importe', m);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h2>Venta por importe</h2>
          <button style={{background:'none',border:'none',cursor:'pointer'}} onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <div style={{background:'var(--green-light)',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:13}}>
            <strong>{producto.nombre}</strong>
            <div style={{color:'var(--text-light)',fontSize:11,marginTop:4}}>
              Precio por kilo: S/ {producto.pKilo.toFixed(2)}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Monto a vender (S/)</label>
            <input
              className="form-input"
              type="number"
              step="0.50"
              min="0.50"
              value={monto}
              onChange={e=>setMonto(e.target.value)}
              placeholder="10.00"
              autoFocus
            />
            {parseFloat(monto) > 0 && (
              <div style={{marginTop:8,fontSize:12,color:'var(--text-light)'}}>
                Equivale a <strong>{(parseFloat(monto) / producto.pKilo).toFixed(2)} kg</strong>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={agregar}>Agregar al carrito</button>
        </div>
      </div>
    </div>
  );
}

export default function CajaPOS() {
  const { products, clients, cajaAbierta, abrirCaja, registrarVenta, currentUser, addClient } = useApp();
  const todasCategorias = [...new Set(products.map(p=>p.categoria))];
  const [categoria, setCategoria] = useState(todasCategorias[0] || 'Aves');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [clienteId, setClienteId] = useState(1);
  const [tipoBoleta, setTipoBoleta] = useState('boleta');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [boletaVenta, setBoletaVenta] = useState(null);
  const [montoApertura, setMontoApertura] = useState('');
  const [esCredito, setEsCredito] = useState(false);
  const [pagoACuenta, setPagoACuenta] = useState('');
  const [showApertura, setShowApertura] = useState(false);
  const [showNuevoCliente, setShowNuevoCliente] = useState(false);
  const [editandoPrecio, setEditandoPrecio] = useState(null);
  const [modalImporte, setModalImporte] = useState(null);

  const cats = [...new Set(products.map(p=>p.categoria))];
  const filtered = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          (p.etapa||'').toLowerCase().includes(busqueda.toLowerCase()) ||
                          (p.categoria||'').toLowerCase().includes(busqueda.toLowerCase());
    if (busqueda) return matchesSearch;
    return p.categoria === categoria;
  });

  const getDelta = (presentacion) =>
    (presentacion === 'arroba' || presentacion === 'kilo') ? 0.5 : 1;

  // Convierte una presentación + cantidad a kg de granel equivalente
  const kgDeItem = (p, presentacion, cantidad, kgPorSaco) => {
    if (presentacion === 'medio') return (kgPorSaco/2) * cantidad;
    if (presentacion === 'arroba') return 11.5 * cantidad;
    if (presentacion === 'kilo') return 1 * cantidad;
    if (presentacion === 'importe') return (p.pKilo > 0 ? cantidad / p.pKilo : 0); // cantidad = monto en este caso
    return 0;
  };

  // Calcula cuánto stock queda disponible, descontando lo que ya está en el carrito
  // (excluye el propio item si se pasa excludeKey, para recalcular su propio máximo)
  const stockDisponible = (productoId, presentacion, kgPorSaco, excludeKey = null) => {
    const p = products.find(x => x.id === productoId);
    if (!p) return Infinity;

    if (presentacion === 'unidad') {
      const usados = carrito.filter(x => x.productoId === productoId && x.presentacion === 'unidad' && x.key !== excludeKey)
        .reduce((s,x) => s + x.cantidad, 0);
      return (p.unidades || 0) - usados;
    }
    if (presentacion === 'saco') {
      const usados = carrito.filter(x => x.productoId === productoId && x.presentacion === 'saco' && x.key !== excludeKey)
        .reduce((s,x) => s + x.cantidad, 0);
      return (p.sacos || 0) - usados;
    }

    // medio, arroba, kilo e importe -> todos consumen granel
    const usadosKg = carrito
      .filter(x => x.productoId === productoId && ['medio','arroba','kilo','importe'].includes(x.presentacion) && x.key !== excludeKey)
      .reduce((s,x) => s + kgDeItem(p, x.presentacion, x.cantidad, kgPorSaco), 0);

    const granelRestante = (p.granel || 0) - usadosKg;

    if (presentacion === 'importe') return granelRestante;
    const kgNecesarioPorUnidad = kgDeItem(p, presentacion, 1, kgPorSaco);
    return granelRestante / kgNecesarioPorUnidad;
  };

  const addItem = (producto, presentacion, precio) => {
    const kgPorSaco = producto.kgPorSaco || 40;

    // "importe" siempre se agrega como item nuevo (cada monto es distinto)
    const existente = presentacion !== 'importe'
      ? carrito.find(x => x.productoId === producto.id && x.presentacion === presentacion)
      : null;

    if (existente) {
      // Ya hay un item igual: solo le sumamos, no se crea otro
      const delta = getDelta(presentacion);
      const max = stockDisponible(producto.id, presentacion, kgPorSaco, existente.key) + existente.cantidad;
      const nueva = Math.min(max, existente.cantidad + delta);
      if (nueva <= existente.cantidad) {
        alert(`Sin stock suficiente de "${producto.nombre}" para esta presentación.`);
        return;
      }
      setCarrito(prev => prev.map(x => x.key === existente.key
        ? { ...x, cantidad: nueva, subtotal: nueva * x.precioUnitario }
        : x
      ));
      return;
    }

    // Item nuevo
    if (presentacion === 'importe') {
      const kgNecesario = producto.pKilo > 0 ? precio / producto.pKilo : 0;
      const granelDisponible = stockDisponible(producto.id, 'importe', kgPorSaco);
      if (granelDisponible < kgNecesario) {
        alert(`Granel insuficiente de "${producto.nombre}" para ese importe.`);
        return;
      }
    } else {
      const disponible = stockDisponible(producto.id, presentacion, kgPorSaco);
      if (disponible < 1) {
        alert(`Sin stock suficiente de "${producto.nombre}" para esta presentación.`);
        return;
      }
    }

    const key = `${producto.id}-${presentacion}-${Date.now()}`;
    setCarrito(prev => [...prev, {
      key,
      productoId: producto.id,
      nombre: producto.nombre,
      presentacion,
      precioUnitario: presentacion === 'importe' ? 1 : precio,
      precioOriginal: presentacion === 'importe' ? 1 : precio,
      cantidad: presentacion === 'importe' ? precio : 1,
      subtotal: precio,
      tipoVenta: producto.tipoVenta || 'sacos',
      kgPorSaco,
    }]);
  };

  const updateQty = (key, delta) => {
    setCarrito(prev => prev.map(x => {
      if (x.key !== key) return x;
      const max = stockDisponible(x.productoId, x.presentacion, x.kgPorSaco, x.key) + x.cantidad;
      const nueva = Math.min(max, Math.max(0.5, parseFloat((x.cantidad + delta).toFixed(2))));
      return {...x, cantidad: nueva, subtotal: nueva * x.precioUnitario};
    }));
  };

  const updateCantidad = (key, valor) => {
    const nueva = parseFloat(valor) || 0;
    if (nueva <= 0) return;
    setCarrito(prev => prev.map(x => {
      if (x.key !== key) return x;
      const max = stockDisponible(x.productoId, x.presentacion, x.kgPorSaco, x.key) + x.cantidad;
      const cant = Math.min(nueva, max);
      return {...x, cantidad: cant, subtotal: cant * x.precioUnitario};
    }));
  };

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

    if (tipoBoleta === 'factura') {
      const ruc = (cliente?.dni || '').trim();
      const direccion = (cliente?.direccion || '').trim();
      
      if (clienteId === 1) {
        alert("No se puede emitir una Factura a 'Cliente General'. Seleccione o registre un cliente con RUC de 11 dígitos.");
        return;
      }
      if (ruc.length !== 11) {
        alert(`El cliente seleccionado tiene un documento inválido (${ruc || 'Sin documento'}). Las facturas requieren un RUC de 11 dígitos.`);
        return;
      }
      if (!direccion) {
        alert("El cliente seleccionado no tiene dirección fiscal. Las facturas requieren dirección registrada.");
        return;
      }
    }

    if (tipoBoleta === 'boleta' && total >= 700 && clienteId === 1) {
      if (!window.confirm("Las ventas en Boleta mayores o iguales a S/ 700.00 requieren identificar al cliente por ley (DNI/RUC). ¿Desea continuar de todos modos?")) {
        return;
      }
    }

    if (esCredito && clienteId === 1) {
      alert("Debe seleccionar un cliente registrado para realizar una venta al crédito.");
      return;
    }

    const cuenta = esCredito ? (parseFloat(pagoACuenta) || 0) : total;
    const deuda = esCredito ? Math.max(0, total - cuenta) : 0;
    const estadoPago = esCredito ? (cuenta > 0 ? 'parcial' : 'pendiente') : 'pagado';
    const metodoPagoFinal = esCredito 
      ? (cuenta > 0 ? `${metodoPago} + Crédito` : 'Crédito / Fiado') 
      : metodoPago;

    const venta = {
      items: carrito,
      total,
      clienteId,
      clienteNombre: cliente?.nombre || 'Cliente Varios',
      clienteDocumento: cliente?.dni || '',
      clienteDireccion: cliente?.direccion || '',
      vendedor: currentUser?.nombre,
      metodoPago: metodoPagoFinal,
      tipo: tipoBoleta,
      montoPagado: cuenta,
      montoDeuda: deuda,
      estadoPago
    };
    
    const v = registrarVenta(venta);
    setBoletaVenta(v);
    setCarrito([]);
    setEsCredito(false);
    setPagoACuenta('');
  };

  const searchInputRef = useRef(null);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0) {
        const p = filtered[0];
        if (p.tipoVenta === 'unidad') {
          addItem(p, 'unidad', p.pUnidad || 0);
        } else {
          addItem(p, 'saco', p.pSaco || 0);
        }
        setBusqueda('');
      }
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' && document.activeElement !== searchInputRef.current) {
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'F2') {
        e.preventDefault();
        cobrar();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setTipoBoleta(prev => prev === 'boleta' ? 'factura' : 'boleta');
      } else if (e.key === 'F4') {
        e.preventDefault();
        const metodos = ['Efectivo', 'Yape', 'Transferencia', 'Tarjeta'];
        setMetodoPago(prev => {
          const idx = metodos.indexOf(prev);
          return metodos[(idx + 1) % metodos.length];
        });
      } else if (e.key === 'F8') {
        e.preventDefault();
        setShowNuevoCliente(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [filtered, carrito, total, clienteId, metodoPago, tipoBoleta, clients]);

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
            {cats.map(cat => (
              <button key={cat} className={`tab-btn ${categoria===cat?'active':''}`} onClick={()=>setCategoria(cat)}>{cat}</button>
            ))}
          </div>
          <div className="pos-search">
            <Search/>
            <input 
              ref={searchInputRef}
              value={busqueda} 
              onChange={e=>setBusqueda(e.target.value)} 
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar producto... (F1 para enfocar)" 
            />
          </div>
          <div className="products-grid">
            {filtered.map(p => {
              const kgPorSaco = p.kgPorSaco || 40;
              const kgMedio = kgPorSaco / 2;
              const kgArroba = 11.5;

              return (
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
                          <div className="pres">Saco {kgPorSaco}KG</div>
                          <div className="precio">S/ {p.pSaco.toFixed(2)}</div>
                        </button>
                        <button className="price-btn" onClick={()=>addItem(p,'medio',p.pMedio)}>
                          <div className="pres">Medio {kgMedio.toFixed(1)}KG</div>
                          <div className="precio">S/ {p.pMedio.toFixed(2)}</div>
                        </button>
                        <button className="price-btn" onClick={()=>addItem(p,'arroba',p.pArroba)}>
                          <div className="pres">Arroba {kgArroba.toFixed(1)}KG</div>
                          <div className="precio">S/ {p.pArroba.toFixed(2)}</div>
                        </button>
                        <button className="price-btn" onClick={()=>addItem(p,'kilo',p.pKilo)}>
                          <div className="pres">Kilo</div>
                          <div className="precio">S/ {p.pKilo.toFixed(2)}</div>
                        </button>
                        <button className="price-btn" style={{background:'linear-gradient(135deg, #10b981 0%, #059669 100%)',color:'white'}} onClick={()=>setModalImporte(p)}>
                          <div className="pres">
                           <span style={{fontWeight:700,marginRight:4}}>S/</span>Por importe
                          </div>
                           <div className="precio" style={{fontSize:11}}>Ingresa monto</div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
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
                : carrito.map(item => {
                    const kgPorSaco = item.kgPorSaco || 40;
                    let descripcion = '';
                    if (item.presentacion === 'saco') descripcion = `Saco ${kgPorSaco}kg`;
                    else if (item.presentacion === 'medio') descripcion = `Medio ${(kgPorSaco/2).toFixed(1)}kg`;
                    else if (item.presentacion === 'arroba') descripcion = `Arroba ${(11.5).toFixed(1)}kg`;
                    else if (item.presentacion === 'kilo') descripcion = 'Kilo';
                    else if (item.presentacion === 'importe') descripcion = 'Por importe';
                    else descripcion = 'Unidad';

                    return (
                      <div key={item.key} className="cart-item" style={{flexDirection:'column',alignItems:'stretch',gap:6}}>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <div className="cart-item-info" style={{flex:1}}>
                            <div className="cart-item-name">{item.nombre}</div>
                            <div className="cart-item-sub" style={{textTransform:'capitalize'}}>{descripcion}</div>
                          </div>
                          {item.presentacion !== 'importe' && (
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
                          )}
                          <button className="cart-remove" onClick={()=>removeItem(item.key)}><X size={14}/></button>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg)',borderRadius:6,padding:'4px 8px'}}>
                          {item.presentacion === 'importe' ? (
                            <>
                              <span style={{fontSize:11,color:'var(--text-light)',flex:1}}>Importe</span>
                              <span style={{fontSize:13,fontWeight:700,color:'var(--green)'}}>S/ {item.subtotal.toFixed(2)}</span>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
            <div className="cart-footer">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>Cliente</label>
                  <button 
                    type="button"
                    onClick={() => setShowNuevoCliente(true)} 
                    style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={12} /> Registrar Rápido
                  </button>
                </div>
                <select className="form-select" value={clienteId} onChange={e=>setClienteId(Number(e.target.value))}>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.nombre} {c.dni ? `(${c.dni})` : ''}</option>)}
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
              {clienteId !== 1 ? (
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, marginBottom: 12, border: '1px solid var(--border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={esCredito} 
                      onChange={e => {
                        setEsCredito(e.target.checked);
                        if (!e.target.checked) setPagoACuenta('');
                      }} 
                    />
                    ¿Venta a Crédito (Fiado)?
                  </label>
                  {esCredito && (
                    <div style={{ marginTop: 8 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>A cuenta (S/)</label>
                        <input 
                          className="form-input" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          max={total}
                          placeholder="S/ 0.00"
                          value={pagoACuenta} 
                          onChange={e => setPagoACuenta(e.target.value)} 
                        />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
                        Saldo restante: <strong>S/ {Math.max(0, total - (parseFloat(pagoACuenta) || 0)).toFixed(2)}</strong>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--text-light)', background: '#fcfcfc', padding: 8, borderRadius: 6, marginBottom: 12, textAlign: 'center' }}>
                  El crédito/fiado requiere identificar al cliente.
                </div>
              )}
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
      {modalImporte && <ImporteModal producto={modalImporte} onClose={()=>setModalImporte(null)} onAdd={addItem} />}
      {showNuevoCliente && (
        <NuevoClienteModal 
          onClose={() => setShowNuevoCliente(false)} 
          onSave={(nuevoC) => {
            const id = Date.now();
            addClient({ ...nuevoC, id });
            setClienteId(id);
            setShowNuevoCliente(false);
          }} 
        />
      )}
    </div>
  );
}

function NuevoClienteModal({ onClose, onSave }) {
  const [doc, setDoc] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const consultar = async () => {
    if (!window.api) {
      alert("Consulta SUNAT/RENIEC solo disponible en app de escritorio.");
      return;
    }
    const cleanDoc = doc.trim();
    if (cleanDoc.length !== 8 && cleanDoc.length !== 11) return;
    
    setLoading(true);
    const token = localStorage.getItem('sunat_api_token') || '';
    
    try {
      if (cleanDoc.length === 8) {
        const res = await window.api.consultarDni(cleanDoc, token);
        if (res.success && res.data) {
          const nombreCompleto = `${res.data.nombres || ''} ${res.data.apellidoPaterno || ''} ${res.data.apellidoMaterno || ''}`.replace(/\s+/g, ' ').trim();
          setNombre(nombreCompleto);
        } else {
          alert(`Error: ${res.error || 'DNI no encontrado.'}`);
        }
      } else {
        const res = await window.api.consultarRuc(cleanDoc, token);
        if (res.success && res.data) {
          setNombre(res.data.razonSocial || res.data.nombre || res.data.razon_social || '');
          setDireccion(res.data.direccion || '');
        } else {
          alert(`Error: ${res.error || 'RUC no encontrado.'}`);
        }
      }
    } catch (e) {
      alert("Error al conectar con la API.");
    } finally {
      setLoading(false);
    }
  };

  const guardar = () => {
    if (!nombre.trim()) return;
    onSave({
      nombre,
      dni: doc,
      telefono,
      direccion,
      email
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2>Registrar Cliente Rápido</h2>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">DNI / RUC (RENIEC/SUNAT)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                className="form-input" 
                value={doc} 
                onChange={e => setDoc(e.target.value.replace(/\D/g, ''))} 
                placeholder="8 o 11 dígitos"
                maxLength={11}
              />
              <button 
                type="button" 
                className="btn btn-outline"
                style={{ padding: '0 12px', whiteSpace: 'nowrap' }}
                onClick={consultar}
                disabled={loading || (doc.length !== 8 && doc.length !== 11)}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Nombre / Razón Social *</label>
            <input className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre o Razón Social" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-input" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="999..." />
          </div>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Dirección Fiscal / Habitación</label>
            <input className="form-input" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Dirección completa" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={guardar} disabled={!nombre.trim()}>Guardar y Seleccionar</button>
        </div>
      </div>
    </div>
  );
}