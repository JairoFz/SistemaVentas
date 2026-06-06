import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const INITIAL_PRODUCTS = [
  { id: 1, nombre: 'Aves Crecimiento', categoria: 'Aves', etapa: 'Crecimiento', pSaco: 125, pMedio: 65, pArroba: 38, pKilo: 3.40, sacos: 19, granel: 15 },
  { id: 2, nombre: 'Aves Engorde', categoria: 'Aves', etapa: 'Engorde', pSaco: 128, pMedio: 67, pArroba: 39, pKilo: 3.50, sacos: 21, granel: 0 },
  { id: 3, nombre: 'Aves Inicio', categoria: 'Aves', etapa: 'Inicio', pSaco: 130, pMedio: 68, pArroba: 40, pKilo: 3.60, sacos: 24, granel: 7.5 },
  { id: 4, nombre: 'Aves Postura', categoria: 'Aves', etapa: 'Postura', pSaco: 122, pMedio: 63, pArroba: 37, pKilo: 3.30, sacos: 24, granel: 0 },
  { id: 5, nombre: 'Cerdos Crecimiento', categoria: 'Cerdos', etapa: 'Crecimiento', pSaco: 138, pMedio: 72, pArroba: 43, pKilo: 3.80, sacos: 15, granel: 0 },
  { id: 6, nombre: 'Cerdos Engorde', categoria: 'Cerdos', etapa: 'Engorde', pSaco: 140, pMedio: 73, pArroba: 44, pKilo: 3.85, sacos: 18, granel: 0 },
  { id: 7, nombre: 'Cerdos Gestación', categoria: 'Cerdos', etapa: 'Gestación', pSaco: 142, pMedio: 74, pArroba: 45, pKilo: 3.90, sacos: 12, granel: 0 },
  { id: 8, nombre: 'Cerdos Lactación', categoria: 'Cerdos', etapa: 'Lactación', pSaco: 145, pMedio: 75, pArroba: 46, pKilo: 3.95, sacos: 10, granel: 0 },
  { id: 9, nombre: 'Cerdos Inicio', categoria: 'Cerdos', etapa: 'Inicio', pSaco: 150, pMedio: 78, pArroba: 47, pKilo: 4.10, sacos: 8, granel: 0 },
];

const INITIAL_USERS = [
  { id: 1, nombre: 'Administrador', email: 'admin@fercord.com', password: 'admin123', rol: 'admin' },
  { id: 2, nombre: 'Vendedor', email: 'vendedor@fercord.com', password: 'vendedor123', rol: 'vendedor' },
];

const INITIAL_CLIENTS = [
  { id: 1, nombre: 'Cliente Varios', dni: '', telefono: '', direccion: '' },
];

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => load('fercord_user', null));
  const [products, setProducts] = useState(() => load('fercord_products', INITIAL_PRODUCTS));
  const [clients, setClients] = useState(() => load('fercord_clients', INITIAL_CLIENTS));
  const [ventas, setVentas] = useState(() => load('fercord_ventas', []));
  const [kardex, setKardex] = useState(() => load('fercord_kardex', []));
  const [users, setUsers] = useState(() => load('fercord_users', INITIAL_USERS));
  const [cajaAbierta, setCajaAbierta] = useState(() => load('fercord_caja', null));
  const [movimientosCaja, setMovimientosCaja] = useState(() => load('fercord_movimientos', []));

  useEffect(() => { save('fercord_products', products); }, [products]);
  useEffect(() => { save('fercord_clients', clients); }, [clients]);
  useEffect(() => { save('fercord_ventas', ventas); }, [ventas]);
  useEffect(() => { save('fercord_kardex', kardex); }, [kardex]);
  useEffect(() => { save('fercord_users', users); }, [users]);
  useEffect(() => { save('fercord_caja', cajaAbierta); }, [cajaAbierta]);
  useEffect(() => { save('fercord_movimientos', movimientosCaja); }, [movimientosCaja]);

  const login = (email, password) => {
    const u = users.find(u => u.email === email && u.password === password);
    if (u) { setCurrentUser(u); save('fercord_user', u); return true; }
    return false;
  };
  const logout = () => { setCurrentUser(null); localStorage.removeItem('fercord_user'); };

  const addProduct = (p) => setProducts(prev => [...prev, { ...p, id: Date.now() }]);
  const updateProduct = (p) => setProducts(prev => prev.map(x => x.id === p.id ? p : x));
  const deleteProduct = (id) => setProducts(prev => prev.filter(x => x.id !== id));

  const addClient = (c) => setClients(prev => [...prev, { ...c, id: Date.now() }]);
  const updateClient = (c) => setClients(prev => prev.map(x => x.id === c.id ? c : x));
  const deleteClient = (id) => setClients(prev => prev.filter(x => x.id !== id));

  const addUser = (u) => setUsers(prev => [...prev, { ...u, id: Date.now() }]);
  const deleteUser = (id) => setUsers(prev => prev.filter(x => x.id !== id));

  const registrarVenta = (venta) => {
    const codigo = venta.tipo === 'factura'
      ? `F001-${String(ventas.filter(v => v.tipo === 'factura').length + 1).padStart(6, '0')}`
      : `B001-${String(ventas.filter(v => v.tipo !== 'factura').length + 1).padStart(6, '0')}`;
    const nuevaVenta = { ...venta, id: Date.now(), codigo, fecha: new Date().toISOString() };
    setVentas(prev => [nuevaVenta, ...prev]);

    // Descontar stock
    const nuevosMovimientos = [];
    venta.items.forEach(item => {
      setProducts(prev => prev.map(p => {
        if (p.id !== item.productoId) return p;
        let nuevosSacos = p.sacos;
        let nuevosGranel = p.granel;
        let nota = '';
        if (item.presentacion === 'saco') { nuevosSacos -= item.cantidad; nota = `Venta saco x${item.cantidad}`; }
        else if (item.presentacion === 'medio') { nuevosGranel -= item.cantidad * 20; nota = `Venta medio x${item.cantidad}`; }
        else if (item.presentacion === 'arroba') { nuevosGranel -= item.cantidad * 11.5; nota = `Venta arroba x${item.cantidad}`; }
        else if (item.presentacion === 'kilo') { nuevosGranel -= item.cantidad; nota = `Venta kilo x${item.cantidad}`; }
        nuevosMovimientos.push({
          id: Date.now() + Math.random(),
          fecha: new Date().toISOString(),
          producto: p.nombre,
          productoId: p.id,
          tipo: 'Venta',
          deltaSacos: nuevosSacos - p.sacos,
          deltaKg: nuevosGranel - p.granel,
          nota,
          usuario: currentUser?.nombre,
        });
        return { ...p, sacos: Math.max(0, nuevosSacos), granel: Math.max(0, nuevosGranel) };
      }));
    });
    setKardex(prev => [...nuevosMovimientos.reverse(), ...prev]);

    // Registrar en caja
    if (cajaAbierta && venta.metodoPago === 'Efectivo') {
      const mov = { id: Date.now(), tipo: 'Ingreso', concepto: `Venta ${codigo}`, monto: venta.total, usuario: currentUser?.nombre, fecha: new Date().toISOString() };
      setMovimientosCaja(prev => [mov, ...prev]);
      setCajaAbierta(prev => ({ ...prev, ingresos: (prev.ingresos || 0) + venta.total }));
    }
    return nuevaVenta;
  };

  const abrirCaja = (montoInicial) => {
    setCajaAbierta({ fechaApertura: new Date().toISOString(), montoInicial: parseFloat(montoInicial), ingresos: 0, egresos: 0 });
    setMovimientosCaja([]);
  };
  const cerrarCaja = () => { setCajaAbierta(null); setMovimientosCaja([]); };
  const agregarMovimientoCaja = (mov) => {
    const m = { ...mov, id: Date.now(), fecha: new Date().toISOString(), usuario: currentUser?.nombre };
    setMovimientosCaja(prev => [m, ...prev]);
    setCajaAbierta(prev => ({
      ...prev,
      ingresos: mov.tipo === 'Ingreso' ? (prev.ingresos || 0) + parseFloat(mov.monto) : prev.ingresos,
      egresos: mov.tipo === 'Gasto / Salida' ? (prev.egresos || 0) + parseFloat(mov.monto) : prev.egresos,
    }));
  };

  const ingresarStock = (productoId, sacos, kg, nota) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productoId) return p;
      const nuevosSacos = Math.max(0, p.sacos + sacos);
      const nuevosKg = Math.max(0, p.granel + kg);
      const esApertura = sacos < 0;
      setKardex(k => [{
        id: Date.now(), fecha: new Date().toISOString(), producto: p.nombre, productoId,
        tipo: esApertura ? 'Apertura' : 'Ingreso',
        deltaSacos: sacos, deltaKg: kg,
        nota: nota || (esApertura ? 'Apertura de saco' : 'Ingreso de stock'),
        usuario: currentUser?.nombre
      }, ...k]);
      return { ...p, sacos: nuevosSacos, granel: nuevosKg };
    }));
  };

  const today = new Date().toDateString();
  const ventasHoy = ventas.filter(v => new Date(v.fecha).toDateString() === today);
  const ventasSemana = ventas.filter(v => (Date.now() - new Date(v.fecha)) < 7 * 24 * 3600 * 1000);
  const stockBajo = products.filter(p => p.sacos < 5).length;

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      products, addProduct, updateProduct, deleteProduct,
      clients, addClient, updateClient, deleteClient,
      ventas, registrarVenta,
      kardex, ingresarStock,
      users, addUser, deleteUser,
      cajaAbierta, abrirCaja, cerrarCaja, movimientosCaja, agregarMovimientoCaja,
      ventasHoy, ventasSemana, stockBajo,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
