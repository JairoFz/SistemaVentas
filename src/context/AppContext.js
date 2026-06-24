import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const INITIAL_PRODUCTS = [
  { id: 1, nombre: 'Aves Crecimiento', categoria: 'Aves', etapa: 'Crecimiento', kgPorSaco: 40, pSaco: 109, pMedio: 54.5, pArroba: 33, pKilo: 3, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
  { id: 2, nombre: 'Aves Engorde', categoria: 'Aves', etapa: 'Engorde', kgPorSaco: 40, pSaco: 108, pMedio: 54, pArroba: 33, pKilo: 3, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
  { id: 3, nombre: 'Aves Inicio', categoria: 'Aves', etapa: 'Inicio', kgPorSaco: 40, pSaco: 110, pMedio: 55, pArroba: 33, pKilo: 3, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
  { id: 4, nombre: 'Aves Postura', categoria: 'Aves', etapa: 'Postura', kgPorSaco: 40, pSaco: 100, pMedio: 50, pArroba: 31, pKilo: 2.80, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
  { id: 5, nombre: 'Cerdos Crecimiento', categoria: 'Cerdos', etapa: 'Crecimiento', kgPorSaco: 40, pSaco: 109, pMedio: 54.5, pArroba: 33, pKilo: 3, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
  { id: 6, nombre: 'Cerdos Engorde', categoria: 'Cerdos', etapa: 'Engorde', kgPorSaco: 40, pSaco: 107, pMedio: 53.5, pArroba: 33, pKilo: 3, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
  { id: 7, nombre: 'Cerdos Gestación', categoria: 'Cerdos', etapa: 'Gestación', kgPorSaco: 40, pSaco: 142, pMedio: 74, pArroba: 45, pKilo: 3.90, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
  { id: 8, nombre: 'Cerdos Lactación', categoria: 'Cerdos', etapa: 'Lactación', kgPorSaco: 40, pSaco: 145, pMedio: 75, pArroba: 46, pKilo: 3.95, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
  { id: 9, nombre: 'Cerdos Inicio', categoria: 'Cerdos', etapa: 'Inicio', kgPorSaco: 40, pSaco: 118, pMedio: 59, pArroba: 35, pKilo: 3.20, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
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
  const [historialCajas, setHistorialCajas] = useState(() => load('fercord_historial_cajas', []));

  useEffect(() => { save('fercord_products', products); }, [products]);
  useEffect(() => { save('fercord_clients', clients); }, [clients]);
  useEffect(() => { save('fercord_ventas', ventas); }, [ventas]);
  useEffect(() => { save('fercord_kardex', kardex); }, [kardex]);
  useEffect(() => { save('fercord_users', users); }, [users]);
  useEffect(() => { save('fercord_caja', cajaAbierta); }, [cajaAbierta]);
  useEffect(() => { save('fercord_movimientos', movimientosCaja); }, [movimientosCaja]);
  useEffect(() => { save('fercord_historial_cajas', historialCajas); }, [historialCajas]);

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

  // Actualizar usuario (nombre, email) — también actualiza currentUser si es el mismo
  const updateUser = (u) => {
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...u } : x));
    if (currentUser?.id === u.id) {
      const updated = { ...currentUser, ...u };
      setCurrentUser(updated);
      save('fercord_user', updated);
    }
  };

  // Cambiar contraseña — verifica la actual antes
  const changePassword = (userId, actual, nueva) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.password !== actual) return false;
    updateUser({ id: userId, password: nueva });
    return true;
  };

  const registrarVenta = (venta) => {
    const codigo = venta.tipo === 'factura'
      ? `F001-${String(ventas.filter(v => v.tipo === 'factura').length + 1).padStart(6, '0')}`
      : `B001-${String(ventas.filter(v => v.tipo !== 'factura').length + 1).padStart(6, '0')}`;
    const nuevaVenta = { ...venta, id: Date.now(), codigo, fecha: new Date().toISOString() };
    setVentas(prev => [nuevaVenta, ...prev]);

    const nuevosMovimientos = [];

    venta.items.forEach(item => {
      setProducts(prev => prev.map(p => {
        if (p.id !== item.productoId) return p;

        const kgPorSaco = p.kgPorSaco || 40;
        let nuevosSacos = p.sacos || 0;
        let nuevosGranel = p.granel || 0;
        let nuevasUnidades = p.unidades || 0;
        let nota = '';

        // ── Productos por UNIDAD ──
        if (p.tipoVenta === 'unidad' || item.presentacion === 'unidad') {
          nuevasUnidades = Math.max(0, nuevasUnidades - item.cantidad);
          nota = `Venta unidad x${item.cantidad}`;
          nuevosMovimientos.push({
            id: Date.now() + Math.random(),
            fecha: new Date().toISOString(),
            producto: p.nombre, productoId: p.id,
            tipo: 'Venta', deltaSacos: 0, deltaKg: 0,
            deltaUnidades: -item.cantidad, nota,
            usuario: currentUser?.nombre,
          });
          return { ...p, unidades: nuevasUnidades };
        }

        // ── Productos por SACOS / GRANEL ──
        if (item.presentacion === 'saco') {
          nuevosSacos -= item.cantidad;
          nota = `Venta saco x${item.cantidad}`;
        } else if (item.presentacion === 'medio') {
          const kgMedio = kgPorSaco / 2;
          nuevosGranel -= item.cantidad * kgMedio;
          nota = `Venta medio (${kgMedio}kg) x${item.cantidad}`;
        } else if (item.presentacion === 'arroba') {
          const kgArroba = (kgPorSaco * 11.5) / 40;
          nuevosGranel -= item.cantidad * kgArroba;
          nota = `Venta arroba (${kgArroba.toFixed(1)}kg) x${item.cantidad}`;
        } else if (item.presentacion === 'kilo') {
          nuevosGranel -= item.cantidad;
          nota = `Venta ${item.cantidad} kg`;
        }

        nuevosSacos = Math.max(0, nuevosSacos);
        nuevosGranel = Math.max(0, nuevosGranel);

        nuevosMovimientos.push({
          id: Date.now() + Math.random(),
          fecha: new Date().toISOString(),
          producto: p.nombre, productoId: p.id,
          tipo: 'Venta',
          deltaSacos: nuevosSacos - (p.sacos || 0),
          deltaKg: Number((nuevosGranel - (p.granel || 0)).toFixed(2)),
          nota, usuario: currentUser?.nombre,
        });

        return { ...p, sacos: nuevosSacos, granel: nuevosGranel };
      }));
    });

    setKardex(prev => [...nuevosMovimientos.reverse(), ...prev]);

    // Registrar ingreso en caja (todos los métodos de pago)
    if (cajaAbierta) {
      const mov = {
        id: Date.now(), tipo: 'Ingreso',
        concepto: `Venta ${codigo}`,
        monto: venta.total,
        metodoPago: venta.metodoPago,
        usuario: currentUser?.nombre,
        fecha: new Date().toISOString()
      };
      setMovimientosCaja(prev => [mov, ...prev]);
      setCajaAbierta(prev => ({ ...prev, ingresos: (prev.ingresos || 0) + venta.total }));
    }

    return nuevaVenta;
  };

  const abrirCaja = (montoInicial) => {
    setCajaAbierta({
      id: Date.now(),
      fechaApertura: new Date().toISOString(),
      montoInicial: parseFloat(montoInicial) || 0,
      ingresos: 0, egresos: 0
    });
    setMovimientosCaja([]);
  };

  // Al cerrar caja, guardar en historial con sus movimientos
  const cerrarCaja = () => {
    if (cajaAbierta) {
      const resumen = {
        ...cajaAbierta,
        fechaCierre: new Date().toISOString(),
        movimientos: movimientosCaja,
      };
      setHistorialCajas(prev => [resumen, ...prev]);
    }
    setCajaAbierta(null);
    setMovimientosCaja([]);
  };

  const agregarMovimientoCaja = (mov) => {
    const m = { ...mov, id: Date.now(), fecha: new Date().toISOString(), usuario: currentUser?.nombre };
    setMovimientosCaja(prev => [m, ...prev]);
    setCajaAbierta(prev => ({
      ...prev,
      ingresos: mov.tipo === 'Ingreso' ? (prev.ingresos || 0) + parseFloat(mov.monto) : prev.ingresos,
      egresos: mov.tipo === 'Gasto / Salida' ? (prev.egresos || 0) + parseFloat(mov.monto) : prev.egresos,
    }));
  };

  const ingresarStock = (productoId, sacos, kg, nota, unidades = 0) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productoId) return p;
      const nuevosSacos = Math.max(0, (p.sacos || 0) + sacos);
      const nuevosKg = Math.max(0, (p.granel || 0) + kg);
      const nuevasUnidades = Math.max(0, (p.unidades || 0) + unidades);
      const esApertura = sacos < 0;
      setKardex(k => [{
        id: Date.now(), fecha: new Date().toISOString(),
        producto: p.nombre, productoId,
        tipo: esApertura ? 'Apertura' : 'Ingreso',
        deltaSacos: sacos, deltaKg: kg,
        nota: nota || (esApertura ? 'Apertura de saco' : 'Ingreso de stock'),
        usuario: currentUser?.nombre
      }, ...k]);
      return { ...p, sacos: nuevosSacos, granel: nuevosKg, unidades: nuevasUnidades };
    }));
  };

  const today = new Date().toDateString();
  const ventasHoy = ventas.filter(v => new Date(v.fecha).toDateString() === today);
  const ventasSemana = ventas.filter(v => (Date.now() - new Date(v.fecha)) < 7 * 24 * 3600 * 1000);
  const stockBajo = products.filter(p =>
    p.tipoVenta === 'unidad' ? (p.unidades || 0) < 3 : (p.sacos || 0) < 5
  ).length;

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      products, addProduct, updateProduct, deleteProduct,
      clients, addClient, updateClient, deleteClient,
      ventas, registrarVenta,
      kardex, ingresarStock,
      users, addUser, deleteUser, updateUser, changePassword,
      cajaAbierta, abrirCaja, cerrarCaja, movimientosCaja, agregarMovimientoCaja,
      historialCajas,
      ventasHoy, ventasSemana, stockBajo,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
