import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CajaPOS from './pages/CajaPOS';
import VentasBoletas from './pages/VentasBoletas';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Kardex from './pages/Kardex';
import CajaDiaria from './pages/CajaDiaria';
import { Reportes, Usuarios } from './pages/OtherPages';
import { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, Receipt, Users, Package,
  BookOpen, Wallet, BarChart2, UserCog, LogOut
} from 'lucide-react';

const NAV = [
  { id:'dashboard', label:'Dashboard', icon:LayoutDashboard },
  { id:'pos', label:'Caja / POS', icon:ShoppingCart },
  { id:'ventas', label:'Ventas / Boletas', icon:Receipt },
  { id:'clientes', label:'Clientes', icon:Users },
  { id:'productos', label:'Productos', icon:Package },
  { id:'kardex', label:'Kárdex / Almacén', icon:BookOpen },
  { id:'caja', label:'Caja diaria', icon:Wallet },
  { id:'reportes', label:'Reportes', icon:BarChart2 },
  { id:'usuarios', label:'Usuarios', icon:UserCog },
];

function MainApp() {
  const { currentUser, logout } = useApp();
  const [page, setPage] = useState('dashboard');

  if (!currentUser) return <Login />;

  const renderPage = () => {
    switch(page) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <CajaPOS />;
      case 'ventas': return <VentasBoletas />;
      case 'clientes': return <Clientes />;
      case 'productos': return <Productos />;
      case 'kardex': return <Kardex />;
      case 'caja': return <CajaDiaria />;
      case 'reportes': return <Reportes />;
      case 'usuarios': return <Usuarios />;
      default: return <Dashboard />;
    }
  };

  const navItems = currentUser.rol === 'admin' ? NAV : NAV.filter(n => n.id !== 'usuarios');

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">🌾</div>
          <div>
            <div className="brand-name">FERCORD</div>
            <div className="brand-sub">Nutrición Balanceada</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${page===item.id?'active':''}`}
                onClick={() => setPage(item.id)}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{currentUser.nombre[0]}</div>
          <div className="user-info">
            <div className="user-name">{currentUser.nombre}</div>
            <div className="user-rol">{currentUser.rol}</div>
          </div>
          <button
            style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-light)',padding:4}}
            title="Cerrar sesión"
            onClick={logout}
          >
            <LogOut size={16}/>
          </button>
        </div>
      </aside>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
