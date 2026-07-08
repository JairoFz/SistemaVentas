const Database = require("better-sqlite3");
const path = require("path");
const { hashPassword } = require("./hashHelper");

let dbFolder = __dirname;
try {
  const { app } = require("electron");
  if (app) {
    dbFolder = app.getPath("userData");
  }
} catch (e) {
  console.log("No se pudo obtener la ruta userData de Electron. Usando local:", e.message);
}

const dbPath = path.join(dbFolder, "fercord.db");
const db = new Database(dbPath);

// Activar claves foráneas
db.pragma("foreign_keys = ON");

// Crear tabla usuarios
db.prepare(`
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL
)
`).run();

// Crear tabla clientes
db.prepare(`
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    dni TEXT,
    telefono TEXT,
    direccion TEXT
)
`).run();

// Crear tabla productos
db.prepare(`
CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    etapa TEXT,
    kgPorSaco REAL DEFAULT 40,
    pSaco REAL DEFAULT 0,
    pMedio REAL DEFAULT 0,
    pArroba REAL DEFAULT 0,
    pKilo REAL DEFAULT 0,
    pUnidad REAL DEFAULT 0,
    sacos INTEGER DEFAULT 0,
    granel REAL DEFAULT 0,
    unidades INTEGER DEFAULT 0,
    tipoVenta TEXT NOT NULL DEFAULT 'sacos',
    precioCosto REAL DEFAULT 0,
    stockMinimo INTEGER DEFAULT 5,
    lote TEXT,
    fechaVencimiento TEXT
)
`).run();

// Crear tabla ventas
db.prepare(`
CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    fecha TEXT NOT NULL,
    clienteId INTEGER,
    clienteNombre TEXT,
    vendedor TEXT,
    metodoPago TEXT,
    tipo TEXT,
    total REAL
)
`).run();

// Crear tabla venta_items
db.prepare(`
CREATE TABLE IF NOT EXISTS venta_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ventaId INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    productoId INTEGER,
    nombre TEXT,
    presentacion TEXT,
    precioUnitario REAL,
    precioOriginal REAL,
    cantidad REAL,
    subtotal REAL,
    tipoVenta TEXT,
    kgPorSaco REAL,
    costoTotal REAL DEFAULT 0
)
`).run();

// Crear tabla kardex
db.prepare(`
CREATE TABLE IF NOT EXISTS kardex (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    producto TEXT,
    productoId INTEGER,
    tipo TEXT,
    deltaSacos INTEGER,
    deltaKg REAL,
    deltaUnidades INTEGER,
    nota TEXT,
    usuario TEXT
)
`).run();

// Crear tabla caja_diaria
db.prepare(`
CREATE TABLE IF NOT EXISTS caja_diaria (
    id INTEGER PRIMARY KEY,
    fechaApertura TEXT NOT NULL,
    fechaCierre TEXT,
    montoInicial REAL NOT NULL,
    ingresos REAL DEFAULT 0,
    egresos REAL DEFAULT 0,
    montoReal REAL DEFAULT 0,
    diferencia REAL DEFAULT 0,
    notaCierre TEXT
)
`).run();

// Migraciones de columnas adicionales (si la base de datos ya existía)
try { db.prepare("ALTER TABLE productos ADD COLUMN precioCosto REAL DEFAULT 0").run(); } catch(e) {}
try { db.prepare("ALTER TABLE venta_items ADD COLUMN costoTotal REAL DEFAULT 0").run(); } catch(e) {}
try { db.prepare("ALTER TABLE caja_diaria ADD COLUMN montoReal REAL DEFAULT 0").run(); } catch(e) {}
try { db.prepare("ALTER TABLE caja_diaria ADD COLUMN diferencia REAL DEFAULT 0").run(); } catch(e) {}
try { db.prepare("ALTER TABLE caja_diaria ADD COLUMN notaCierre TEXT").run(); } catch(e) {}
try { db.prepare("ALTER TABLE productos ADD COLUMN stockMinimo INTEGER DEFAULT 5").run(); } catch(e) {}
try { db.prepare("ALTER TABLE productos ADD COLUMN lote TEXT").run(); } catch(e) {}
try { db.prepare("ALTER TABLE productos ADD COLUMN fechaVencimiento TEXT").run(); } catch(e) {}

// Crear tabla caja_movimientos
db.prepare(`
CREATE TABLE IF NOT EXISTS caja_movimientos (
    id INTEGER PRIMARY KEY,
    cajaDiariaId INTEGER NOT NULL REFERENCES caja_diaria(id) ON DELETE CASCADE,
    tipo TEXT,
    concepto TEXT,
    monto REAL,
    metodoPago TEXT,
    usuario TEXT,
    fecha TEXT NOT NULL
)
`).run();

// Crear tabla correlativos
db.prepare(`
CREATE TABLE IF NOT EXISTS correlativos (
    tipo TEXT PRIMARY KEY,
    siguiente INTEGER DEFAULT 0
)
`).run();

// Semillado inicial de usuarios si no existen (con contraseñas encriptadas)
const userCount = db.prepare("SELECT COUNT(*) as count FROM usuarios").get();
if (userCount.count === 0) {
  db.prepare("INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)").run('Administrador', 'admin@fercord.com', hashPassword('admin123'), 'admin');
  db.prepare("INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)").run('Vendedor', 'vendedor@fercord.com', hashPassword('vendedor123'), 'vendedor');
} else {
  // Migración: Si la base de datos ya existía y tiene contraseñas antiguas en texto plano, las encriptamos automáticamente.
  const usuariosExistentes = db.prepare("SELECT * FROM usuarios").all();
  usuariosExistentes.forEach(u => {
    if (u.password && u.password.length < 128) {
      const hashed = hashPassword(u.password);
      db.prepare("UPDATE usuarios SET password = ? WHERE id = ?").run(hashed, u.id);
    }
  });
}

// Semillado inicial de clientes si no existen
const clientCount = db.prepare("SELECT COUNT(*) as count FROM clientes").get();
if (clientCount.count === 0) {
  db.prepare("INSERT INTO clientes (id, nombre, dni, telefono, direccion) VALUES (1, 'Cliente Varios', '', '', '')").run();
}

// Semillado inicial de productos si no existen
const productCount = db.prepare("SELECT COUNT(*) as count FROM productos").get();
if (productCount.count === 0) {
  const initialProducts = [
    { nombre: 'Aves Crecimiento', categoria: 'Aves', etapa: 'Crecimiento', kgPorSaco: 40, pSaco: 109, pMedio: 54.5, pArroba: 33, pKilo: 3, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
    { nombre: 'Aves Engorde', categoria: 'Aves', etapa: 'Engorde', kgPorSaco: 40, pSaco: 108, pMedio: 54, pArroba: 33, pKilo: 3, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
    { nombre: 'Aves Inicio', categoria: 'Aves', etapa: 'Inicio', kgPorSaco: 40, pSaco: 110, pMedio: 55, pArroba: 33, pKilo: 3, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
    { nombre: 'Aves Postura', categoria: 'Aves', etapa: 'Postura', kgPorSaco: 40, pSaco: 100, pMedio: 50, pArroba: 31, pKilo: 2.80, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
    { nombre: 'Cerdos Crecimiento', categoria: 'Cerdos', etapa: 'Crecimiento', kgPorSaco: 40, pSaco: 109, pMedio: 54.5, pArroba: 33, pKilo: 3, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
    { nombre: 'Cerdos Engorde', categoria: 'Cerdos', etapa: 'Engorde', kgPorSaco: 40, pSaco: 107, pMedio: 53.5, pArroba: 33, pKilo: 3, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
    { nombre: 'Cerdos Gestación', categoria: 'Cerdos', etapa: 'Gestación', kgPorSaco: 40, pSaco: 142, pMedio: 74, pArroba: 45, pKilo: 3.90, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
    { nombre: 'Cerdos Lactación', categoria: 'Cerdos', etapa: 'Lactación', kgPorSaco: 40, pSaco: 145, pMedio: 75, pArroba: 46, pKilo: 3.95, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
    { nombre: 'Cerdos Inicio', categoria: 'Cerdos', etapa: 'Inicio', kgPorSaco: 40, pSaco: 118, pMedio: 59, pArroba: 35, pKilo: 3.20, sacos: 0, granel: 0, unidades: 0, tipoVenta: 'sacos' },
  ];
  const insertProd = db.prepare(`
    INSERT INTO productos (nombre, categoria, etapa, kgPorSaco, pSaco, pMedio, pArroba, pKilo, sacos, granel, unidades, tipoVenta)
    VALUES (@nombre, @categoria, @etapa, @kgPorSaco, @pSaco, @pMedio, @pArroba, @pKilo, @sacos, @granel, @unidades, @tipoVenta)
  `);
  for (const prod of initialProducts) {
    insertProd.run(prod);
  }
}

// Inicializar correlativos si no existen
const bCount = db.prepare("SELECT COUNT(*) as count FROM correlativos WHERE tipo = 'boleta'").get();
if (bCount.count === 0) {
  db.prepare("INSERT INTO correlativos (tipo, siguiente) VALUES ('boleta', 0)").run();
}
const fCount = db.prepare("SELECT COUNT(*) as count FROM correlativos WHERE tipo = 'factura'").get();
if (fCount.count === 0) {
  db.prepare("INSERT INTO correlativos (tipo, siguiente) VALUES ('factura', 0)").run();
}

console.log("✅ Base de datos conectada.");
console.log("📁 Path de Base de Datos:", dbPath);

module.exports = db;