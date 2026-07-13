import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  ShoppingBag, 
  Truck, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Trash,
  CreditCard,
  Wallet,
  TrendingDown
} from 'lucide-react';

const EMPTY_PROVEEDOR = {
  nombre: '',
  ruc: '',
  telefono: '',
  direccion: ''
};

export default function Compras() {
  const { 
    products, 
    proveedores, addProveedor, updateProveedor, deleteProveedor,
    compras, registrarCompra, 
    pagosProveedores, registrarAbonoProveedor,
    currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState('compras'); // 'compras' | 'proveedores' | 'deudas'
  const [modalCompra, setModalCompra] = useState(false);
  const [modalProveedor, setModalProveedor] = useState(null); // null | { type: 'add' | 'edit', data: ... }
  
  // Expandir compras
  const [expandedCompraId, setExpandedCompraId] = useState(null);

  // Fechas filtros
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Gestión de Deuda seleccionada
  const [deudaProveedor, setDeudaProveedor] = useState(null); // null | proveedor
  const [montoAbono, setMontoAbono] = useState('');
  const [metodoAbono, setMetodoAbono] = useState('Efectivo');
  const [errorAbono, setErrorAbono] = useState('');

  // Filtrado de compras
  const comprasFiltradas = compras.filter(c => {
    const f = new Date(c.fecha);
    if (desde && f < new Date(desde)) return false;
    if (hasta && f > new Date(hasta + 'T23:59:59')) return false;
    return true;
  });

  const totalInvertido = comprasFiltradas.reduce((sum, c) => sum + (c.total || 0), 0);
  const totalCuentasPorPagar = proveedores.reduce((sum, p) => {
    const deudasProv = compras.filter(c => c.proveedorId === p.id && c.montoDeuda > 0);
    return sum + deudasProv.reduce((s, c) => s + c.montoDeuda, 0);
  }, 0);

  const guardarProveedor = (e, form, id) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;

    if (id) {
      updateProveedor({ ...form, id });
    } else {
      addProveedor(form);
    }
    setModalProveedor(null);
  };

  const handleAbonarProveedor = (e) => {
    e.preventDefault();
    const monto = parseFloat(montoAbono);
    const deudasProv = compras.filter(c => c.proveedorId === deudaProveedor.id && c.montoDeuda > 0);
    const totalDeudaProv = deudasProv.reduce((s, c) => s + c.montoDeuda, 0);

    if (isNaN(monto) || monto <= 0) {
      setErrorAbono('El monto del abono debe ser mayor a 0');
      return;
    }
    if (monto > totalDeudaProv) {
      setErrorAbono(`El abono no puede superar la deuda total (S/ ${totalDeudaProv.toFixed(2)})`);
      return;
    }

    const abonoData = {
      fecha: new Date().toISOString(),
      proveedorId: deudaProveedor.id,
      proveedorNombre: deudaProveedor.nombre,
      monto,
      metodoPago: metodoAbono,
      usuario: currentUser?.nombre || 'Administrador'
    };

    registrarAbonoProveedor(abonoData);
    setMontoAbono('');
    setErrorAbono('');
    
    // Mantener actualizado el total en el modal recalculando
    const nuevaDeuda = totalDeudaProv - monto;
    if (nuevaDeuda <= 0) {
      setDeudaProveedor(null);
    }
  };

  return (
    <div>
      <div className="header-row page-header">
        <div>
          <h1>Compras y Proveedores</h1>
          <p>Registra facturas o comprobantes de mercadería de proveedores y mantén actualizado tu almacén</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className={`btn ${activeTab === 'compras' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('compras')}
          >
            <ShoppingBag size={15} style={{ marginRight: 6 }} />
            Compras
          </button>
          <button 
            className={`btn ${activeTab === 'proveedores' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('proveedores')}
          >
            <Truck size={15} style={{ marginRight: 6 }} />
            Proveedores
          </button>
          <button 
            className={`btn ${activeTab === 'deudas' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('deudas')}
            style={{ color: totalCuentasPorPagar > 0 ? 'var(--orange)' : 'inherit', fontWeight: totalCuentasPorPagar > 0 ? '600' : 'normal' }}
          >
            <CreditCard size={15} style={{ marginRight: 6 }} />
            Cuentas por Pagar {totalCuentasPorPagar > 0 && `(S/ ${totalCuentasPorPagar.toFixed(0)})`}
          </button>
        </div>
      </div>

      {activeTab === 'compras' && (
        <>
          {/* Métricas de Compras */}
          <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-title">INVERSIÓN TOTAL</div>
              <div className="stat-val" style={{ color: 'var(--orange)' }}>
                S/ {totalInvertido.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="stat-sub">En el período seleccionado</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">COMPRAS REGISTRADAS</div>
              <div className="stat-val">{comprasFiltradas.length}</div>
              <div className="stat-sub">Transacciones con proveedores</div>
            </div>
          </div>

          {/* Filtros e Historial */}
          <div className="card">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} color="var(--text-light)" />
                <input type="date" className="form-input" style={{ width: 140, padding: '6px 10px', fontSize: 13 }} value={desde} onChange={e=>setDesde(e.target.value)} />
                <span style={{ fontSize: 13, color: 'var(--text-light)' }}>al</span>
                <input type="date" className="form-input" style={{ width: 140, padding: '6px 10px', fontSize: 13 }} value={hasta} onChange={e=>setHasta(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={() => setModalCompra(true)}>
                <Plus size={15} /> Registrar Compra (Lote/Factura)
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th>Fecha</th>
                    <th>N° Documento</th>
                    <th>Proveedor</th>
                    <th>Estado Pago</th>
                    <th>Deuda Pendiente</th>
                    <th>Total Factura</th>
                    <th>Registrado por</th>
                  </tr>
                </thead>
                <tbody>
                  {comprasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center" style={{ padding: 24, color: 'var(--text-light)' }}>
                        No hay compras registradas en este período
                      </td>
                    </tr>
                  ) : (
                    comprasFiltradas.map(c => {
                      const isExpanded = expandedCompraId === c.id;
                      const numItems = c.items?.length || 0;
                      
                      const estadoLabel = c.estadoPago === 'pagado' ? 'Pagado' : c.estadoPago === 'parcial' ? 'Parcial' : 'Pendiente';
                      const estadoClass = c.estadoPago === 'pagado' ? 'badge-green' : c.estadoPago === 'parcial' ? 'badge-orange' : 'badge-red';

                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ verticalAlign: 'middle', padding: '12px 8px' }} onClick={(e) => { e.stopPropagation(); setExpandedCompraId(isExpanded ? null : c.id); }}>
                            {isExpanded ? <ChevronUp size={16} color="var(--text-light)" /> : <ChevronDown size={16} color="var(--text-light)" />}
                          </td>
                          <td style={{ verticalAlign: 'middle' }} onClick={() => setExpandedCompraId(isExpanded ? null : c.id)}>{new Date(c.fecha).toLocaleDateString('es-PE')}</td>
                          <td style={{ verticalAlign: 'middle' }} onClick={() => setExpandedCompraId(isExpanded ? null : c.id)}>{c.documento ? <span className="badge badge-gray">{c.documento}</span> : <em style={{ color: 'var(--text-light)' }}>Sin Doc.</em>}</td>
                          <td style={{ verticalAlign: 'middle' }} onClick={() => setExpandedCompraId(isExpanded ? null : c.id)}><strong>{c.proveedorNombre || 'Sin Proveedor'}</strong></td>
                          <td style={{ verticalAlign: 'middle' }} onClick={() => setExpandedCompraId(isExpanded ? null : c.id)}><span className={`badge ${estadoClass}`}>{estadoLabel}</span></td>
                          <td style={{ verticalAlign: 'middle', fontWeight: 600, color: (c.montoDeuda || 0) > 0 ? 'var(--red)' : 'var(--text-light)' }} onClick={() => setExpandedCompraId(isExpanded ? null : c.id)}>
                            {(c.montoDeuda || 0) > 0 ? `S/ ${(c.montoDeuda || 0).toFixed(2)}` : '—'}
                          </td>
                          <td style={{ verticalAlign: 'middle', fontWeight: 600, color: 'var(--orange)' }} onClick={() => setExpandedCompraId(isExpanded ? null : c.id)}>S/ {Number(c.total || 0).toFixed(2)}</td>
                          <td style={{ verticalAlign: 'middle' }} onClick={() => setExpandedCompraId(isExpanded ? null : c.id)}>{c.usuario || '—'}</td>
                        </tr>
                      );
                    }).reduce((acc, row, idx) => {
                      // Estructura de filas intercaladas con sus detalles
                      const originalRow = row;
                      const c = comprasFiltradas[idx];
                      const isExpanded = expandedCompraId === c.id;
                      
                      acc.push(originalRow);
                      if (isExpanded) {
                        acc.push(
                          <tr key={`expanded-${c.id}`} style={{ background: '#f8fafc' }}>
                            <td colSpan={8} style={{ padding: '12px 24px' }}>
                              <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                                <table style={{ margin: 0 }}>
                                  <thead style={{ background: '#f4f5f7' }}>
                                    <tr>
                                      <th>Producto</th>
                                      <th>Cantidad</th>
                                      <th>Costo Unit.</th>
                                      <th>Lote</th>
                                      <th>Vencimiento</th>
                                      <th className="text-right">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {c.items?.map(it => (
                                      <tr key={it.id}>
                                        <td><strong>{it.productoNombre}</strong></td>
                                        <td>{it.cantidad}</td>
                                        <td>S/ {Number(it.precioCosto).toFixed(2)}</td>
                                        <td>{it.lote ? <span className="badge badge-gray">{it.lote}</span> : '—'}</td>
                                        <td>{it.fechaVencimiento ? new Date(it.fechaVencimiento + 'T00:00:00').toLocaleDateString('es-PE') : '—'}</td>
                                        <td className="text-right" style={{ fontWeight: 600 }}>S/ {Number(it.total || (it.cantidad * it.precioCosto)).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      return acc;
                    }, [])
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'proveedores' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Directorio de Proveedores</h3>
            <button className="btn btn-primary" onClick={() => setModalProveedor({ type: 'add' })}>
              <Plus size={15} /> Registrar Proveedor
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Proveedor / Razón Social</th>
                  <th>RUC</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center" style={{ padding: 24, color: 'var(--text-light)' }}>
                      Aún no hay proveedores registrados
                    </td>
                  </tr>
                ) : (
                  proveedores.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.nombre}</strong></td>
                      <td>{p.ruc || '—'}</td>
                      <td>{p.telefono || '—'}</td>
                      <td>{p.direccion || '—'}</td>
                      <td className="text-right">
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                          <button className="action-btn edit" onClick={() => setModalProveedor({ type: 'edit', data: p })}>
                            <Pencil size={13} />
                          </button>
                          <button className="action-btn del" onClick={() => { if(window.confirm('¿Seguro que deseas eliminar este proveedor?')) deleteProveedor(p.id); }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'deudas' && (
        <>
          {/* Cuentas por Pagar Dashboard */}
          <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: 20 }}>
            <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: 'var(--red-light)', color: 'var(--red)', padding: 12, borderRadius: '50%' }}>
                <TrendingDown size={28} />
              </div>
              <div>
                <div className="stat-title">DEUDA TOTAL POR PAGAR</div>
                <div className="stat-val" style={{ color: 'var(--red)' }}>
                  S/ {totalCuentasPorPagar.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="stat-sub">Suma adeudada a todos los proveedores</div>
              </div>
            </div>
          </div>

          {/* Listado de Proveedores con Deuda */}
          <div className="card">
            <div style={{ marginBottom: 16 }}>
              <h3>Cuentas Pendientes con Proveedores</h3>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Proveedor / Razón Social</th>
                    <th>RUC</th>
                    <th className="text-center">Compras Pendientes</th>
                    <th>Monto Adeudado</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const proveedoresConDeuda = proveedores.map(p => {
                      const deudas = compras.filter(c => c.proveedorId === p.id && c.montoDeuda > 0);
                      const totalD = deudas.reduce((s, c) => s + c.montoDeuda, 0);
                      return { ...p, comprasPendientes: deudas.length, totalDeuda: totalD };
                    }).filter(p => p.totalDeuda > 0);

                    if (proveedoresConDeuda.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="text-center" style={{ padding: 24, color: 'var(--text-light)' }}>
                            🎉 ¡Excelente! No tienes cuentas por pagar pendientes.
                          </td>
                        </tr>
                      );
                    }

                    return proveedoresConDeuda.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.nombre}</strong></td>
                        <td>{p.ruc || '—'}</td>
                        <td className="text-center"><span className="badge badge-orange">{p.comprasPendientes} factura(s)</span></td>
                        <td style={{ fontWeight: 600, color: 'var(--red)' }}>S/ {p.totalDeuda.toFixed(2)}</td>
                        <td className="text-right">
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '6px 12px', fontSize: 12 }}
                            onClick={() => setDeudaProveedor(p)}
                          >
                            <Wallet size={12} style={{ marginRight: 6 }} />
                            Administrar Deuda
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Cuentas y Abonos de Deuda del Proveedor */}
      {deudaProveedor && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 700, width: '90%' }}>
            <div className="modal-header">
              <h2>Amortización de Deuda: {deudaProveedor.nombre}</h2>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }} 
                onClick={() => { setDeudaProveedor(null); setErrorAbono(''); setMontoAbono(''); }}
              >
                <X size={18}/>
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {(() => {
                const deudas = compras.filter(c => c.proveedorId === deudaProveedor.id && c.montoDeuda > 0);
                const totalD = deudas.reduce((sum, v) => sum + v.montoDeuda, 0);
                const abonos = pagosProveedores.filter(p => p.proveedorId === deudaProveedor.id);

                return (
                  <>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      <div className="stat-card" style={{ flex: 1, padding: 12 }}>
                        <div className="stat-title" style={{ fontSize: 10 }}>DEUDA TOTAL POR PAGAR</div>
                        <div className="stat-val" style={{ fontSize: 20, color: 'var(--red)' }}>S/ {totalD.toFixed(2)}</div>
                      </div>
                      <div className="stat-card" style={{ flex: 1, padding: 12 }}>
                        <div className="stat-title" style={{ fontSize: 10 }}>PAGOS / ABONOS REALIZADOS</div>
                        <div className="stat-val" style={{ fontSize: 20, color: 'var(--green)' }}>S/ {abonos.reduce((sum, a) => sum + a.monto, 0).toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Formulario de Amortización */}
                    {totalD > 0 && (
                      <form onSubmit={handleAbonarProveedor} style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 16 }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>REGISTRAR PAGO A CUENTA</h4>
                        
                        {errorAbono && (
                          <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>
                            ⚠️ {errorAbono}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, alignItems: 'end' }}>
                          <div className="form-group" style={{ margin: 0, flex: 1 }}>
                            <label className="form-label" style={{ fontSize: 11 }}>Monto a pagar (S/) *</label>
                            <input 
                              className="form-input" 
                              style={{ padding: '6px 10px', fontSize: 13 }}
                              type="number" 
                              step="0.01" 
                              min="0.01"
                              max={totalD}
                              placeholder={`Max S/ ${totalD.toFixed(2)}`}
                              value={montoAbono}
                              onChange={e => setMontoAbono(e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{ margin: 0, width: 140 }}>
                            <label className="form-label" style={{ fontSize: 11 }}>Método de pago *</label>
                            <select 
                              className="form-select"
                              style={{ padding: '6px 10px', fontSize: 13 }}
                              value={metodoAbono}
                              onChange={e => setMetodoAbono(e.target.value)}
                            >
                              <option>Efectivo</option>
                              <option>Yape</option>
                              <option>Transferencia</option>
                              <option>Tarjeta</option>
                            </select>
                          </div>
                          <button type="submit" className="btn btn-primary" style={{ height: 'fit-content', padding: '8px 16px', fontSize: 13 }}>
                            Registrar Pago
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Tabla Compras con saldo */}
                    <h3 style={{ fontSize: 13, marginBottom: 8, fontWeight: 600, color: 'var(--text-mid)' }}>Facturas de Compras Pendientes</h3>
                    <div className="table-wrap" style={{ marginBottom: 20 }}>
                      <table style={{ fontSize: 12 }}>
                        <thead style={{ background: '#f4f5f7' }}>
                          <tr>
                            <th>Fecha</th>
                            <th>N° Documento</th>
                            <th>Total Compra</th>
                            <th>Monto Pagado</th>
                            <th>Saldo Deuda</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deudas.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center" style={{ color: 'var(--text-light)' }}>Sin facturas pendientes</td>
                            </tr>
                          ) : (
                            deudas.map(v => (
                              <tr key={v.id}>
                                <td>{new Date(v.fecha).toLocaleDateString('es-PE')}</td>
                                <td><span className="badge badge-gray">{v.documento || 'Sin Doc.'}</span></td>
                                <td style={{ fontWeight: 600 }}>S/ {v.total.toFixed(2)}</td>
                                <td style={{ color: 'var(--green)', fontWeight: 500 }}>S/ {(v.montoPagado || 0).toFixed(2)}</td>
                                <td style={{ color: 'var(--red)', fontWeight: 600 }}>S/ {v.montoDeuda.toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Historial de Pagos */}
                    <h3 style={{ fontSize: 13, marginBottom: 8, fontWeight: 600, color: 'var(--text-mid)' }}>Historial de Amortizaciones</h3>
                    <div className="table-wrap">
                      <table style={{ fontSize: 12 }}>
                        <thead style={{ background: '#f4f5f7' }}>
                          <tr>
                            <th>Fecha / Hora</th>
                            <th>Monto Pagado</th>
                            <th>Método de Pago</th>
                            <th>Registrado por</th>
                          </tr>
                        </thead>
                        <tbody>
                          {abonos.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center" style={{ color: 'var(--text-light)' }}>Aún no se han registrado abonos</td>
                            </tr>
                          ) : (
                            abonos.map(a => (
                              <tr key={a.id}>
                                <td>{new Date(a.fecha).toLocaleString('es-PE', { dateStyle:'medium', timeStyle:'short' })}</td>
                                <td style={{ color: 'var(--green)', fontWeight: 600 }}>S/ {a.monto.toFixed(2)}</td>
                                <td><span className="badge badge-gray">{a.metodoPago}</span></td>
                                <td>{a.usuario || '—'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Compra (Factura con Múltiples Productos) */}
      {modalCompra && (
        <CompraModal 
          products={products}
          proveedores={proveedores}
          currentUser={currentUser}
          onClose={() => setModalCompra(false)}
          onSave={registrarCompra}
        />
      )}

      {/* Modal Proveedor (Crear/Editar) */}
      {modalProveedor && (
        <ProveedorModal 
          mode={modalProveedor.type}
          data={modalProveedor.data}
          onClose={() => setModalProveedor(null)}
          onSave={guardarProveedor}
        />
      )}
    </div>
  );
}

function CompraModal({ products, proveedores, currentUser, onClose, onSave }) {
  const [selectedProveedorId, setSelectedProveedorId] = useState('');
  const [documento, setDocumento] = useState('');
  const [itemsCart, setItemsCart] = useState([]);
  
  // Agregar Producto form state
  const [addProductoId, setAddProductoId] = useState('');
  const [addCantidad, setAddCantidad] = useState('');
  const [addPrecioCosto, setAddPrecioCosto] = useState('');
  const [addLote, setAddLote] = useState('');
  const [addFechaVencimiento, setAddFechaVencimiento] = useState('');

  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [montoAdelantado, setMontoAdelantado] = useState('');

  const [errorItem, setErrorItem] = useState('');
  const [errorModal, setErrorModal] = useState('');

  const handleAddProduct = () => {
    const prodId = Number(addProductoId);
    const cant = parseInt(addCantidad);
    const costo = parseFloat(addPrecioCosto);

    if (!prodId) {
      setErrorItem('Seleccione un producto');
      return;
    }
    if (!cant || cant <= 0) {
      setErrorItem('Cantidad no válida');
      return;
    }
    if (isNaN(costo) || costo <= 0) {
      setErrorItem('Costo no válido');
      return;
    }

    const prod = products.find(p => p.id === prodId);

    // Agregar al carrito temporal
    const newItem = {
      productoId: prodId,
      productoNombre: prod.nombre + (prod.etapa ? ` (${prod.etapa})` : ''),
      tipoVenta: prod.tipoVenta || 'sacos',
      cantidad: cant,
      precioCosto: costo,
      lote: addLote || '',
      fechaVencimiento: addFechaVencimiento || '',
      total: cant * costo
    };

    setItemsCart([...itemsCart, newItem]);
    
    // Resetear formulario de item
    setAddProductoId('');
    setAddCantidad('');
    setAddPrecioCosto('');
    setAddLote('');
    setAddFechaVencimiento('');
    setErrorItem('');
  };

  const removeItem = (index) => {
    setItemsCart(itemsCart.filter((_, i) => i !== index));
  };

  const totalFactura = itemsCart.reduce((sum, it) => sum + it.total, 0);

  const handleSaveCompra = (e) => {
    e.preventDefault();
    if (itemsCart.length === 0) {
      setErrorModal('Debe agregar al menos un producto a la compra');
      return;
    }

    const prov = proveedores.find(p => p.id === Number(selectedProveedorId));
    
    let pagado = totalFactura;
    let deuda = 0;
    let estado = 'pagado';

    if (metodoPago === 'Crédito') {
      if (!prov) {
        setErrorModal('Debe seleccionar un proveedor válido para compras al crédito');
        return;
      }
      pagado = parseFloat(montoAdelantado) || 0;
      if (pagado < 0 || pagado > totalFactura) {
        setErrorModal('El monto pagado es inválido');
        return;
      }
      deuda = totalFactura - pagado;
      estado = deuda <= 0 ? 'pagado' : (pagado > 0 ? 'parcial' : 'pendiente');
    }

    const compraData = {
      fecha: new Date().toISOString(),
      total: totalFactura,
      proveedorId: prov ? prov.id : null,
      proveedorNombre: prov ? prov.nombre : 'Sin Proveedor',
      documento: documento || '',
      usuario: currentUser?.nombre || 'Administrador',
      montoPagado: pagado,
      montoDeuda: deuda,
      estadoPago: estado,
      items: itemsCart
    };

    onSave(compraData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 760, width: '90%' }}>
        <div className="modal-header">
          <h2>Registrar Factura de Compra</h2>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {errorModal && (
            <div style={{ color: 'var(--red)', background: 'var(--red-light)', padding: 8, borderRadius: 6, marginBottom: 12, fontSize: 13, fontWeight: 500 }}>
              {errorModal}
            </div>
          )}

          {/* Cabecera del Comprobante */}
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Proveedor</label>
              <select 
                className="form-select"
                value={selectedProveedorId}
                onChange={e => setSelectedProveedorId(e.target.value)}
              >
                <option value="">Ninguno / Sin Proveedor</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">N° Factura / Documento</label>
              <input 
                className="form-input"
                placeholder="Ej: F001-002342"
                value={documento}
                onChange={e => setDocumento(e.target.value)}
              />
            </div>
          </div>

          {/* Agregar Item Form */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px dashed var(--border)', marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 13, color: 'var(--text-mid)', fontWeight: 600 }}>AÑADIR PRODUCTO A LA FACTURA</h4>
            
            {errorItem && (
              <div style={{ color: 'var(--red)', fontSize: 11, marginBottom: 8, fontWeight: 500 }}>
                ⚠️ {errorItem}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Producto *</label>
                <select 
                  className="form-select"
                  style={{ fontSize: 12, padding: '4px 8px' }}
                  value={addProductoId}
                  onChange={e => {
                    const id = Number(e.target.value);
                    const prod = products.find(p => p.id === id);
                    setAddProductoId(e.target.value);
                    setAddPrecioCosto(prod ? (prod.precioCosto || '') : '');
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} {p.etapa ? `(${p.etapa})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Cantidad *</label>
                <input 
                  className="form-input"
                  style={{ fontSize: 12, padding: '4px 8px' }}
                  type="number"
                  min="1"
                  placeholder="Cant"
                  value={addCantidad}
                  onChange={e => setAddCantidad(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Costo Unit. (S/) *</label>
                <input 
                  className="form-input"
                  style={{ fontSize: 12, padding: '4px 8px' }}
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="S/ 0.00"
                  value={addPrecioCosto}
                  onChange={e => setAddPrecioCosto(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Lote</label>
                <input 
                  className="form-input"
                  style={{ fontSize: 12, padding: '4px 8px' }}
                  placeholder="Ej: L-1"
                  value={addLote}
                  onChange={e => setAddLote(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Vencimiento</label>
                <input 
                  className="form-input"
                  style={{ fontSize: 12, padding: '4px 8px' }}
                  type="date"
                  value={addFechaVencimiento}
                  onChange={e => setAddFechaVencimiento(e.target.value)}
                />
              </div>

              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ height: 'fit-content', padding: '6px 12px', fontSize: 12 }}
                onClick={handleAddProduct}
              >
                + Agregar
              </button>
            </div>
          </div>

          {/* Tabla de Items Agregados */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            <table style={{ margin: 0, fontSize: 13 }}>
              <thead style={{ background: '#f4f5f7' }}>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Costo Unit.</th>
                  <th>Lote / Venc.</th>
                  <th className="text-right">Subtotal</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {itemsCart.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center" style={{ padding: 16, color: 'var(--text-light)' }}>
                      Ningún producto agregado aún
                    </td>
                  </tr>
                ) : (
                  itemsCart.map((it, idx) => (
                    <tr key={idx}>
                      <td><strong>{it.productoNombre}</strong></td>
                      <td>{it.cantidad} {it.tipoVenta === 'unidad' ? 'und.' : 'sacos'}</td>
                      <td>S/ {it.precioCosto.toFixed(2)}</td>
                      <td>
                        {it.lote ? <span className="badge badge-gray" style={{ fontSize: 10 }}>{it.lote}</span> : ''}
                        {it.fechaVencimiento ? <div style={{ fontSize: 10, color: 'var(--text-light)' }}>Vence: {it.fechaVencimiento}</div> : ''}
                        {!it.lote && !it.fechaVencimiento && '—'}
                      </td>
                      <td className="text-right" style={{ fontWeight: 600 }}>S/ {it.total.toFixed(2)}</td>
                      <td>
                        <button 
                          type="button" 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}
                          onClick={() => removeItem(idx)}
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Configuración del Pago */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Forma de Pago de la Factura</label>
              <select 
                className="form-select"
                value={metodoPago}
                onChange={e => {
                  setMetodoPago(e.target.value);
                  if (e.target.value !== 'Crédito') setMontoAdelantado('');
                }}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Yape/Plin">Yape/Plin</option>
                <option value="Crédito">Crédito (Por Pagar)</option>
              </select>
            </div>

            {metodoPago === 'Crédito' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Monto Pagado a Cuenta (Adelanto S/)</label>
                <input 
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalFactura}
                  placeholder={`Max S/ ${totalFactura.toFixed(2)}`}
                  value={montoAdelantado}
                  onChange={e => setMontoAdelantado(e.target.value)}
                />
                <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 500, marginTop: 4, display: 'block' }}>
                  Deuda Pendiente: S/ {(totalFactura - (parseFloat(montoAdelantado) || 0)).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 15, fontWeight: 600, color: 'var(--orange)', marginBottom: 8 }}>
            Total Factura: S/ {totalFactura.toFixed(2)}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={handleSaveCompra} disabled={itemsCart.length === 0}>
            Registrar Factura Completa
          </button>
        </div>
      </div>
    </div>
  );
}

function ProveedorModal({ mode, data, onClose, onSave }) {
  const [form, setForm] = useState(data || EMPTY_PROVEEDOR);

  return (
    <div className="modal-overlay">
      <form className="modal" style={{ maxWidth: 420 }} onSubmit={(e) => onSave(e, form, data?.id)}>
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Editar Proveedor' : 'Registrar Proveedor'}</h2>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Nombre / Razón Social *</label>
            <input 
              className="form-input"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre comercial o razón social"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">RUC / Documento</label>
            <input 
              className="form-input"
              value={form.ruc}
              onChange={e => setForm({ ...form, ruc: e.target.value })}
              placeholder="Número de RUC"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono de Contacto</label>
            <input 
              className="form-input"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              placeholder="Celular o teléfono fijo"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Dirección Comercial</label>
            <input 
              className="form-input"
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              placeholder="Dirección fiscal o local"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={!form.nombre.trim()}>
            {mode === 'edit' ? 'Guardar Cambios' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
