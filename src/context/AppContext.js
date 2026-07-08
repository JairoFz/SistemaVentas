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
  const [correlativos, setCorrelativos] = useState(() => load('fercord_correlativos', { boleta: 0, factura: 0 }));

  // Carga asíncrona inicial desde SQLite al arrancar en Electron
  useEffect(() => {
    async function loadSQLiteData() {
      if (window.api && window.api.dbGetInitialData) {
        try {
          const data = await window.api.dbGetInitialData();
          setProducts(data.products);
          setClients(data.clients);
          setVentas(data.ventas);
          setKardex(data.kardex);
          setUsers(data.users);
          setCajaAbierta(data.cajaAbierta);
          setMovimientosCaja(data.movimientosCaja);
          setHistorialCajas(data.historialCajas);
          setCorrelativos(data.correlativos);
        } catch (e) {
          console.error("Error al cargar datos desde SQLite:", e);
        }
      }
    }
    loadSQLiteData();
  }, []);

  // Autosaves en LocalStorage condicionados solo si no estamos en Electron
  useEffect(() => { if (!window.api) save('fercord_products', products); }, [products]);
  useEffect(() => { if (!window.api) save('fercord_clients', clients); }, [clients]);
  useEffect(() => { if (!window.api) save('fercord_ventas', ventas); }, [ventas]);
  useEffect(() => { if (!window.api) save('fercord_kardex', kardex); }, [kardex]);
  useEffect(() => { if (!window.api) save('fercord_users', users); }, [users]);
  useEffect(() => { if (!window.api) save('fercord_caja', cajaAbierta); }, [cajaAbierta]);
  useEffect(() => { if (!window.api) save('fercord_movimientos', movimientosCaja); }, [movimientosCaja]);
  useEffect(() => { if (!window.api) save('fercord_historial_cajas', historialCajas); }, [historialCajas]);
  useEffect(() => { if (!window.api) save('fercord_correlativos', correlativos); }, [correlativos]);

  const login = async (email, password) => {
    if (window.api && window.api.authLogin) {
      try {
        const u = await window.api.authLogin(email, password);
        if (u) {
          setCurrentUser(u);
          save('fercord_user', u);
          return true;
        }
      } catch (err) {
        console.error("Error en login SQLite:", err);
      }
      return false;
    } else {
      const u = users.find(u => u.email === email && u.password === password);
      if (u) { setCurrentUser(u); save('fercord_user', u); return true; }
      return false;
    }
  };
  const logout = () => { setCurrentUser(null); localStorage.removeItem('fercord_user'); };

  const addProduct = (p) => {
    const newP = { ...p, id: Date.now() };
    setProducts(prev => [...prev, newP]);
    if (window.api && window.api.dbAddProduct) {
      window.api.dbAddProduct(newP).catch(console.error);
    }
  };
  const updateProduct = (p) => {
    setProducts(prev => prev.map(x => x.id === p.id ? p : x));
    if (window.api && window.api.dbUpdateProduct) {
      window.api.dbUpdateProduct(p).catch(console.error);
    }
  };
  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(x => x.id !== id));
    if (window.api && window.api.dbDeleteProduct) {
      window.api.dbDeleteProduct(id).catch(console.error);
    }
  };

  const addClient = (c) => {
    const newC = { ...c, id: c.id || Date.now() };
    setClients(prev => [...prev, newC]);
    if (window.api && window.api.dbAddClient) {
      window.api.dbAddClient(newC).catch(console.error);
    }
  };
  const updateClient = (c) => {
    setClients(prev => prev.map(x => x.id === c.id ? c : x));
    if (window.api && window.api.dbUpdateClient) {
      window.api.dbUpdateClient(c).catch(console.error);
    }
  };
  const deleteClient = (id) => {
    setClients(prev => prev.filter(x => x.id !== id));
    if (window.api && window.api.dbDeleteClient) {
      window.api.dbDeleteClient(id).catch(console.error);
    }
  };

  const addUser = (u) => {
    const newU = { ...u, id: Date.now() };
    setUsers(prev => [...prev, newU]);
    if (window.api && window.api.dbAddUser) {
      window.api.dbAddUser(newU).catch(console.error);
    }
  };
  const deleteUser = (id) => {
    setUsers(prev => prev.filter(x => x.id !== id));
    if (window.api && window.api.dbDeleteUser) {
      window.api.dbDeleteUser(id).catch(console.error);
    }
  };

  const updateUser = (u) => {
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...u } : x));
    const updated = { ...(users.find(x => x.id === u.id) || {}), ...u };
    if (currentUser?.id === u.id) {
      const fullUpdated = { ...currentUser, ...u };
      setCurrentUser(fullUpdated);
      save('fercord_user', fullUpdated);
    }
    if (window.api && window.api.dbUpdateUser) {
      window.api.dbUpdateUser(updated).catch(console.error);
    }
  };

  const changePassword = async (userId, actual, nueva) => {
    if (window.api && window.api.authChangePassword) {
      try {
        const ok = await window.api.authChangePassword(userId, actual, nueva);
        if (ok) {
          // Actualiza localmente el estado de usuarios
          setUsers(prev => prev.map(x => x.id === userId ? { ...x, password: 'hashed' } : x));
          if (currentUser?.id === userId) {
            const fullUpdated = { ...currentUser, password: 'hashed' };
            setCurrentUser(fullUpdated);
            save('fercord_user', fullUpdated);
          }
          return true;
        }
      } catch (err) {
        console.error("Error al cambiar contraseña en SQLite:", err);
      }
      return false;
    } else {
      const user = users.find(u => u.id === userId);
      if (!user || user.password !== actual) return false;
      updateUser({ id: userId, password: nueva });
      return true;
    }
  };

  const registrarVenta = (venta) => {
    const tipoKey = venta.tipo === 'factura' ? 'factura' : 'boleta';
    const siguiente = (correlativos[tipoKey] || 0) + 1;
    const codigo = tipoKey === 'factura'
      ? `F001-${String(siguiente).padStart(6, '0')}`
      : `B001-${String(siguiente).padStart(6, '0')}`;
    
    setCorrelativos(prev => ({ ...prev, [tipoKey]: siguiente }));

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
        let deltaSacos = 0;
        let deltaKg = 0;
        let deltaUnidades = 0;
        let nota = '';

        // ── Productos por UNIDAD ──
        if (p.tipoVenta === 'unidad' || item.presentacion === 'unidad') {
          nuevasUnidades = Math.max(0, nuevasUnidades - item.cantidad);
          deltaUnidades = -item.cantidad;
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

        // ── Productos por SACOS / GRANEL / IMPORTE ──
        if (item.presentacion === 'saco') {
          nuevosSacos -= item.cantidad;
          deltaSacos = -item.cantidad;
          nota = `Venta saco x${item.cantidad}`;
        } else if (item.presentacion === 'medio') {
          const kgMedio = kgPorSaco / 2;
          nuevosGranel -= item.cantidad * kgMedio;
          deltaKg = -item.cantidad * kgMedio;
          nota = `Venta medio (${kgMedio}kg) x${item.cantidad}`;
        } else if (item.presentacion === 'arroba') {
          const kgArroba = 11.5;
          nuevosGranel -= item.cantidad * kgArroba;
          deltaKg = -item.cantidad * kgArroba;
          nota = `Venta arroba (${kgArroba.toFixed(1)}kg) x${item.cantidad}`;
        } else if (item.presentacion === 'kilo') {
          nuevosGranel -= item.cantidad;
          deltaKg = -item.cantidad;
          nota = `Venta ${item.cantidad} kg`;
        } else if (item.presentacion === 'importe') {
          const kgEquivalente = p.pKilo > 0 ? item.subtotal / p.pKilo : 0;
          nuevosGranel -= kgEquivalente;
          deltaKg = -kgEquivalente;
          nota = `Venta por importe S/ ${item.subtotal.toFixed(2)} (${kgEquivalente.toFixed(2)}kg)`;
        }

        nuevosSacos = Math.max(0, nuevosSacos);
        nuevosGranel = Math.max(0, nuevosGranel);

        nuevosMovimientos.push({
          id: Date.now() + Math.random(),
          fecha: new Date().toISOString(),
          producto: p.nombre, productoId: p.id,
          tipo: 'Venta',
          deltaSacos: deltaSacos,
          deltaKg: Number(deltaKg.toFixed(2)),
          deltaUnidades: 0,
          nota, usuario: currentUser?.nombre,
        });

        return { ...p, sacos: nuevosSacos, granel: nuevosGranel };
      }));
    });

    setKardex(prev => [...nuevosMovimientos.reverse(), ...prev]);

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

    if (window.api && window.api.dbRegistrarVenta) {
      const dbV = {
        ...nuevaVenta,
        correlativoSiguiente: siguiente
      };
      window.api.dbRegistrarVenta(dbV).catch(console.error);
    }

    return nuevaVenta;
  };

  const abrirCaja = (montoInicial) => {
    const nuevaCaja = {
      id: Date.now(),
      fechaApertura: new Date().toISOString(),
      montoInicial: parseFloat(montoInicial) || 0,
      ingresos: 0, egresos: 0
    };
    setCajaAbierta(nuevaCaja);
    setMovimientosCaja([]);
    if (window.api && window.api.dbAbrirCaja) {
      window.api.dbAbrirCaja(nuevaCaja).catch(console.error);
    }
  };

  const cerrarCaja = (resumenParams = {}) => {
    if (cajaAbierta) {
      const resumen = {
        ...cajaAbierta,
        fechaCierre: new Date().toISOString(),
        movimientos: movimientosCaja,
        montoReal: resumenParams.montoReal || 0,
        diferencia: resumenParams.diferencia || 0,
        notaCierre: resumenParams.notaCierre || '',
      };
      setHistorialCajas(prev => [resumen, ...prev]);
      if (window.api && window.api.dbCerrarCaja) {
        window.api.dbCerrarCaja(resumen).catch(console.error);
      }
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
    if (window.api && window.api.dbAgregarMovimientoCaja && cajaAbierta) {
      const dbM = {
        ...m,
        cajaDiariaId: cajaAbierta.id
      };
      window.api.dbAgregarMovimientoCaja(dbM).catch(console.error);
    }
  };

  const ingresarStock = (productoId, sacos, kg, nota, unidades = 0, lote = '', fechaVencimiento = '') => {
    const esApertura = sacos < 0;
    const kardexId = Date.now();
    const fecha = new Date().toISOString();

    setProducts(prev => prev.map(p => {
      if (p.id !== productoId) return p;
      const nuevosSacos = Math.max(0, (p.sacos || 0) + sacos);
      const nuevosKg = Math.max(0, (p.granel || 0) + kg);
      const nuevasUnidades = Math.max(0, (p.unidades || 0) + unidades);
      
      setKardex(k => [{
        id: kardexId, fecha: fecha,
        producto: p.nombre, productoId,
        tipo: esApertura ? 'Apertura' : 'Ingreso',
        deltaSacos: sacos, deltaKg: kg, deltaUnidades: unidades,
        nota: nota || (esApertura ? 'Apertura de saco' : 'Ingreso de stock'),
        usuario: currentUser?.nombre
      }, ...k]);
      
      const updatedProd = { ...p, sacos: nuevosSacos, granel: nuevosKg, unidades: nuevasUnidades };
      if (lote !== '') updatedProd.lote = lote;
      if (fechaVencimiento !== '') updatedProd.fechaVencimiento = fechaVencimiento;
      return updatedProd;
    }));

    if (window.api && window.api.dbIngresarStock) {
      const op = {
        kardexId,
        fecha,
        productoId,
        tipo: esApertura ? 'Apertura' : 'Ingreso',
        sacos,
        kg,
        unidades,
        nota: nota || (esApertura ? 'Apertura de saco' : 'Ingreso de stock'),
        usuario: currentUser?.nombre,
        lote,
        fechaVencimiento
      };
      window.api.dbIngresarStock(op).catch(console.error);
    }
  };

  const today = new Date().toDateString();
  const ventasHoy = ventas.filter(v => new Date(v.fecha).toDateString() === today);
  const ventasSemana = ventas.filter(v => (Date.now() - new Date(v.fecha)) < 7 * 24 * 3600 * 1000);
  const stockBajo = products.filter(p => {
    const minStock = p.stockMinimo !== undefined ? p.stockMinimo : 5;
    return p.tipoVenta === 'unidad' ? (p.unidades || 0) < minStock : (p.sacos || 0) < minStock;
  }).length;

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