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
          {products.slice(0,5).map(p => (
            <div key={p.id} style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:12,color:'var(--text-mid)'}}>{p.nombre}</span>
              <span style={{fontSize:12,fontWeight:600,color: p.sacos < 5 ? 'var(--red)' : 'var(--green)'}}>{p.tipoVenta==='unidad' ? `${p.unidades||0} und.` : `${p.sacos||0} sacos`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
