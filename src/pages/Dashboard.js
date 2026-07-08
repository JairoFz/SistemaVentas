import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, Package, AlertTriangle } from 'lucide-react';

function getLast7Days(ventas) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('es-PE', { month:'short', day:'numeric' });
    const key = d.toDateString();
    const total = ventas.filter(v => new Date(v.fecha).toDateString() === key).reduce((s, v) => s + v.total, 0);
    days.push({ label, total });
  }
  return days;
}

export default function Dashboard() {
  const { ventasHoy, ventasSemana, products, stockBajo, ventas } = useApp();
  const totalHoy = ventasHoy.reduce((s, v) => s + v.total, 0);
  const totalSemana = ventasSemana.reduce((s, v) => s + v.total, 0);
  const chartData = getLast7Days(ventas);

  const topProductos = Object.entries(
    ventas.flatMap(v => v.items).reduce((acc, item) => {
      acc[item.nombre] = (acc[item.nombre] || 0) + item.subtotal;
      return acc;
    }, {})
  ).sort((a,b) => b[1]-a[1]).slice(0,5);

  const vencimientos = products
    .filter(p => p.fechaVencimiento && p.fechaVencimiento.trim() !== '')
    .map(p => {
      const parts = p.fechaVencimiento.split('-');
      const expDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      const diffTime = expDate - todayDate;
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...p, diasRestantes };
    })
    .filter(p => p.diasRestantes <= 30)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Resumen de operaciones de FERCORD</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            Ventas hoy
            <span className="stat-icon green"><TrendingUp size={16}/></span>
          </div>
          <div className="stat-value">S/ {totalHoy.toFixed(2)}</div>
          <div className="stat-sub">{ventasHoy.length} transacciones</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            Ventas 7 días
            <span className="stat-icon green"><ShoppingCart size={16}/></span>
          </div>
          <div className="stat-value">S/ {totalSemana.toFixed(2)}</div>
          <div className="stat-sub">últimos 7 días</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            Productos
            <span className="stat-icon green"><Package size={16}/></span>
          </div>
          <div className="stat-value">{products.length}</div>
          <div className="stat-sub">en catálogo</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            Stock bajo
            <span className="stat-icon red"><AlertTriangle size={16}/></span>
          </div>
          <div className="stat-value">{stockBajo}</div>
          <div className="stat-sub">requiere reposición</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h3 style={{fontSize:16}}>Ventas últimos 7 días</h3>
            <span style={{fontSize:12,color:'var(--text-light)'}}>S/</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="label" tick={{fontSize:11}} />
              <YAxis tick={{fontSize:11}} />
              <Tooltip formatter={(v) => [`S/ ${v.toFixed(2)}`, 'Ventas']} />
              <Line type="monotone" dataKey="total" stroke="#2d5a27" strokeWidth={2} dot={{r:4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{fontSize:16,marginBottom:16}}>Top productos (semana)</h3>
          {topProductos.length === 0
            ? <p style={{color:'var(--text-light)',fontSize:13}}>Aún no hay ventas.</p>
            : topProductos.map(([nombre, total], i) => (
              <div key={nombre} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{width:22,height:22,borderRadius:'50%',background:'var(--green-light)',color:'var(--green)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700}}>{i+1}</span>
                  <span style={{fontSize:13}}>{nombre}</span>
                </div>
                <span style={{fontSize:13,fontWeight:600}}>S/ {total.toFixed(2)}</span>
              </div>
            ))
          }

          <hr className="divider"/>
          <h3 style={{fontSize:16,marginBottom:12}}>Stock por producto</h3>
          {products.slice(0,5).map(p => {
            const minStock = p.stockMinimo !== undefined ? p.stockMinimo : 5;
            const esBajo = p.tipoVenta === 'unidad' ? (p.unidades || 0) < minStock : (p.sacos || 0) < minStock;
            return (
              <div key={p.id} style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:12,color:'var(--text-mid)'}}>{p.nombre}</span>
                <span style={{fontSize:12,fontWeight:600,color: esBajo ? 'var(--red)' : 'var(--green)'}}>
                  {p.tipoVenta==='unidad' ? `${p.unidades||0} und.` : `${p.sacos||0} sacos`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {vencimientos.length > 0 && (
        <div className="card" style={{ marginTop: 24, borderLeft: '4px solid var(--red)' }}>
          <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--red)' }}>⚠️</span> Alertas de Vencimiento / Lotes Próximos a Caducar
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Lote</th>
                  <th>Fecha de Vencimiento</th>
                  <th>Estado / Alerta</th>
                  <th className="text-right">Stock Disponible</th>
                </tr>
              </thead>
              <tbody>
                {vencimientos.map(v => {
                  const isExpired = v.diasRestantes < 0;
                  const statusColor = isExpired ? 'var(--red)' : '#d4762a';
                  const statusBg = isExpired ? '#fdf2f2' : '#fffaf0';
                  const statusText = isExpired 
                    ? 'VENCIDO' 
                    : v.diasRestantes === 0 
                      ? 'Vence hoy' 
                      : `Vence en ${v.diasRestantes} días`;
                  
                  const parts = v.fechaVencimiento.split('-');
                  const cleanDateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
                  
                  return (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.nombre}</td>
                      <td><span className="badge badge-gray">{v.lote || 'Sin Lote'}</span></td>
                      <td style={{ fontSize: 13 }}>{cleanDateStr}</td>
                      <td>
                        <span style={{ 
                          color: statusColor, 
                          background: statusBg, 
                          padding: '4px 8px', 
                          borderRadius: 4, 
                          fontWeight: 600, 
                          fontSize: 12 
                        }}>
                          {statusText}
                        </span>
                      </td>
                      <td className="text-right" style={{ fontWeight: 600 }}>
                        {v.tipoVenta === 'unidad' ? `${v.unidades||0} und.` : `${v.sacos||0} sacos`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
