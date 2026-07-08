const db = require("./database");
const { hashPassword } = require("./hashHelper");

class DbService {
  getInitialData() {
    // 1. Obtener productos
    const products = db.prepare("SELECT * FROM productos ORDER BY id").all();

    // 2. Obtener clientes
    const clients = db.prepare("SELECT * FROM clientes ORDER BY id").all();

    // 3. Obtener usuarios
    const users = db.prepare("SELECT * FROM usuarios ORDER BY id").all();

    // 4. Obtener ventas con sus items correspondientes
    const dbVentas = db.prepare("SELECT * FROM ventas ORDER BY id DESC").all();
    const getItems = db.prepare("SELECT * FROM venta_items WHERE ventaId = ?");
    const ventas = dbVentas.map(v => {
      return {
        ...v,
        items: getItems.all(v.id)
      };
    });

    // 5. Obtener kárdex
    const kardex = db.prepare("SELECT * FROM kardex ORDER BY id DESC").all();

    // 6. Obtener caja abierta si la hubiera
    const cajaAbiertaRow = db.prepare("SELECT * FROM caja_diaria WHERE fechaCierre IS NULL").get();
    let cajaAbierta = null;
    let movimientosCaja = [];
    if (cajaAbiertaRow) {
      cajaAbierta = cajaAbiertaRow;
      movimientosCaja = db.prepare("SELECT * FROM caja_movimientos WHERE cajaDiariaId = ? ORDER BY id DESC").all(cajaAbierta.id);
    }

    // 7. Obtener historial de cajas cerradas
    const dbHistorial = db.prepare("SELECT * FROM caja_diaria WHERE fechaCierre IS NOT NULL ORDER BY id DESC").all();
    const getMovs = db.prepare("SELECT * FROM caja_movimientos WHERE cajaDiariaId = ? ORDER BY id DESC");
    const historialCajas = dbHistorial.map(c => {
      return {
        ...c,
        movimientos: getMovs.all(c.id)
      };
    });

    // 8. Obtener correlativos
    const correlativosRows = db.prepare("SELECT * FROM correlativos").all();
    const correlativos = { boleta: 0, factura: 0 };
    correlativosRows.forEach(row => {
      correlativos[row.tipo] = row.siguiente;
    });

    return {
      products,
      clients,
      ventas,
      kardex,
      users,
      cajaAbierta,
      movimientosCaja,
      historialCajas,
      correlativos
    };
  }

  addProduct(p) {
    const stmt = db.prepare(`
      INSERT INTO productos (id, nombre, categoria, etapa, tipoVenta, kgPorSaco, pSaco, pMedio, pArroba, pKilo, pUnidad, sacos, granel, unidades, precioCosto, stockMinimo, lote, fechaVencimiento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      p.id,
      p.nombre,
      p.categoria,
      p.etapa || '',
      p.tipoVenta || 'sacos',
      p.kgPorSaco !== undefined ? p.kgPorSaco : 40,
      p.pSaco || 0,
      p.pMedio || 0,
      p.pArroba || 0,
      p.pKilo || 0,
      p.pUnidad || 0,
      p.sacos || 0,
      p.granel || 0,
      p.unidades || 0,
      p.precioCosto || 0,
      p.stockMinimo !== undefined ? p.stockMinimo : 5,
      p.lote || '',
      p.fechaVencimiento || ''
    );
  }

  updateProduct(p) {
    const stmt = db.prepare(`
      UPDATE productos SET
        nombre = ?, categoria = ?, etapa = ?, tipoVenta = ?, kgPorSaco = ?,
        pSaco = ?, pMedio = ?, pArroba = ?, pKilo = ?, pUnidad = ?,
        sacos = ?, granel = ?, unidades = ?, precioCosto = ?,
        stockMinimo = ?, lote = ?, fechaVencimiento = ?
      WHERE id = ?
    `);
    stmt.run(
      p.nombre,
      p.categoria,
      p.etapa || '',
      p.tipoVenta || 'sacos',
      p.kgPorSaco !== undefined ? p.kgPorSaco : 40,
      p.pSaco || 0,
      p.pMedio || 0,
      p.pArroba || 0,
      p.pKilo || 0,
      p.pUnidad || 0,
      p.sacos || 0,
      p.granel || 0,
      p.unidades || 0,
      p.precioCosto || 0,
      p.stockMinimo !== undefined ? p.stockMinimo : 5,
      p.lote || '',
      p.fechaVencimiento || '',
      p.id
    );
  }

  deleteProduct(id) {
    db.prepare("DELETE FROM productos WHERE id = ?").run(id);
  }

  addClient(c) {
    const stmt = db.prepare(`
      INSERT INTO clientes (id, nombre, dni, telefono, direccion)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(c.id, c.nombre, c.dni || '', c.telefono || '', c.direccion || '');
  }

  updateClient(c) {
    const stmt = db.prepare(`
      UPDATE clientes SET nombre = ?, dni = ?, telefono = ?, direccion = ?
      WHERE id = ?
    `);
    stmt.run(c.nombre, c.dni || '', c.telefono || '', c.direccion || '', c.id);
  }

  deleteClient(id) {
    db.prepare("DELETE FROM clientes WHERE id = ?").run(id);
  }

  login(email, password) {
    const hashed = hashPassword(password);
    const user = db.prepare("SELECT * FROM usuarios WHERE email = ? AND password = ?").get(email, hashed);
    return user || null;
  }

  addUser(u) {
    const stmt = db.prepare(`
      INSERT INTO usuarios (id, nombre, email, password, rol)
      VALUES (?, ?, ?, ?, ?)
    `);
    const hashed = hashPassword(u.password);
    stmt.run(u.id, u.nombre, u.email, hashed, u.rol || 'vendedor');
  }

  deleteUser(id) {
    db.prepare("DELETE FROM usuarios WHERE id = ?").run(id);
  }

  updateUser(u) {
    const existing = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(u.id);
    if (existing) {
      let password = existing.password;
      if (u.password && u.password !== existing.password && u.password !== 'hashed') {
        password = hashPassword(u.password);
      }
      const merged = { ...existing, ...u, password };
      db.prepare(`
        UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol = ?
        WHERE id = ?
      `).run(merged.nombre, merged.email, merged.password, merged.rol, u.id);
    }
  }

  changePassword(userId, actual, nueva) {
    const user = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(userId);
    if (!user) return false;

    const hashedActual = hashPassword(actual);
    if (user.password !== hashedActual) return false;

    const hashedNueva = hashPassword(nueva);
    db.prepare("UPDATE usuarios SET password = ? WHERE id = ?").run(hashedNueva, userId);
    return true;
  }

  registrarVenta(venta) {
    const transaction = db.transaction(() => {
      // 1. Registrar cabecera de la venta
      const insertVenta = db.prepare(`
        INSERT INTO ventas (id, codigo, fecha, clienteId, clienteNombre, vendedor, metodoPago, tipo, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertVenta.run(
        venta.id,
        venta.codigo,
        venta.fecha,
        venta.clienteId,
        venta.clienteNombre,
        venta.vendedor,
        venta.metodoPago,
        venta.tipo,
        venta.total
      );

      // 2. Registrar los items de la venta y descontar stock correspondientemente
      const insertItem = db.prepare(`
        INSERT INTO venta_items (ventaId, productoId, nombre, presentacion, precioUnitario, precioOriginal, cantidad, subtotal, tipoVenta, kgPorSaco, costoTotal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const updateStockProd = db.prepare(`
        UPDATE productos SET sacos = ?, granel = ?, unidades = ? WHERE id = ?
      `);

      const insertKardex = db.prepare(`
        INSERT INTO kardex (fecha, producto, productoId, tipo, deltaSacos, deltaKg, deltaUnidades, nota, usuario)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      venta.items.forEach(item => {
        const p = db.prepare("SELECT * FROM productos WHERE id = ?").get(item.productoId);
        
        let costoTotal = 0;
        if (p) {
          const cost = p.precioCosto || 0;
          const kg = p.kgPorSaco || 40;
          if (p.tipoVenta === 'unidad' || item.presentacion === 'unidad') {
            costoTotal = cost * item.cantidad;
          } else {
            if (item.presentacion === 'saco') {
              costoTotal = cost * item.cantidad;
            } else if (item.presentacion === 'medio') {
              costoTotal = (cost / 2) * item.cantidad;
            } else if (item.presentacion === 'arroba') {
              costoTotal = ((11.5 / kg) * cost) * item.cantidad;
            } else if (item.presentacion === 'kilo') {
              costoTotal = ((1 / kg) * cost) * item.cantidad;
            } else if (item.presentacion === 'importe') {
              const kgEquivalente = p.pKilo > 0 ? item.subtotal / p.pKilo : 0;
              costoTotal = (kgEquivalente / kg) * cost;
            }
          }
        }
        costoTotal = Number(costoTotal.toFixed(2));

        insertItem.run(
          venta.id,
          item.productoId,
          item.nombre,
          item.presentacion,
          item.precioUnitario,
          item.precioOriginal,
          item.cantidad,
          item.subtotal,
          item.tipoVenta,
          item.kgPorSaco,
          costoTotal
        );

        // Actualizar el stock del producto
        if (p) {
          const kgPorSaco = p.kgPorSaco || 40;
          let nuevosSacos = p.sacos || 0;
          let nuevosGranel = p.granel || 0;
          let nuevasUnidades = p.unidades || 0;
          let deltaSacos = 0;
          let deltaKg = 0;
          let deltaUnidades = 0;
          let nota = '';

          // Venta de unidades
          if (p.tipoVenta === 'unidad' || item.presentacion === 'unidad') {
            nuevasUnidades = Math.max(0, nuevasUnidades - item.cantidad);
            deltaUnidades = -item.cantidad;
            nota = `Venta unidad x${item.cantidad}`;
            updateStockProd.run(nuevosSacos, nuevosGranel, nuevasUnidades, p.id);
          } else {
            // Venta de sacos / granel
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
            updateStockProd.run(nuevosSacos, nuevosGranel, nuevasUnidades, p.id);
          }

          // Registrar en el Kárdex de almacén
          insertKardex.run(
            venta.fecha,
            p.nombre,
            p.id,
            'Venta',
            deltaSacos,
            Number(deltaKg.toFixed(2)),
            deltaUnidades,
            nota,
            venta.vendedor
          );
        }
      });

      // 3. Incrementar el correlativo correspondiente
      const tipoKey = venta.tipo === 'factura' ? 'factura' : 'boleta';
      db.prepare(`
        INSERT INTO correlativos (tipo, siguiente)
        VALUES (?, 1)
        ON CONFLICT(tipo) DO UPDATE SET siguiente = correlativos.siguiente + 1
      `).run(tipoKey);

      // 4. Si la caja diaria está abierta, registrar el ingreso correspondiente
      const cajaAbierta = db.prepare("SELECT * FROM caja_diaria WHERE fechaCierre IS NULL").get();
      if (cajaAbierta) {
        const insertMov = db.prepare(`
          INSERT INTO caja_movimientos (cajaDiariaId, tipo, concepto, monto, metodoPago, usuario, fecha)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        insertMov.run(
          cajaAbierta.id,
          'Ingreso',
          `Venta ${venta.codigo}`,
          venta.total,
          venta.metodoPago,
          venta.vendedor,
          venta.fecha
        );

        db.prepare("UPDATE caja_diaria SET ingresos = ingresos + ? WHERE id = ?")
          .run(venta.total, cajaAbierta.id);
      }
    });
    transaction();
  }

  abrirCaja(caja) {
    const stmt = db.prepare(`
      INSERT INTO caja_diaria (id, fechaApertura, montoInicial, ingresos, egresos)
      VALUES (?, ?, ?, 0, 0)
    `);
    stmt.run(caja.id, caja.fechaApertura, caja.montoInicial);
  }

  cerrarCaja(resumen) {
    const stmt = db.prepare(`
      UPDATE caja_diaria
      SET fechaCierre = ?, ingresos = ?, egresos = ?, montoReal = ?, diferencia = ?, notaCierre = ?
      WHERE id = ?
    `);
    stmt.run(
      resumen.fechaCierre,
      resumen.ingresos,
      resumen.egresos,
      resumen.montoReal || 0,
      resumen.diferencia || 0,
      resumen.notaCierre || '',
      resumen.id
    );
  }

  agregarMovimientoCaja(mov) {
    const transaction = db.transaction(() => {
      const insertMov = db.prepare(`
        INSERT INTO caja_movimientos (id, cajaDiariaId, tipo, concepto, monto, metodoPago, usuario, fecha)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertMov.run(
        mov.id,
        mov.cajaDiariaId,
        mov.tipo,
        mov.concepto,
        mov.monto,
        mov.metodoPago || 'Efectivo',
        mov.usuario,
        mov.fecha
      );

      if (mov.tipo === 'Ingreso') {
        db.prepare("UPDATE caja_diaria SET ingresos = ingresos + ? WHERE id = ?")
          .run(mov.monto, mov.cajaDiariaId);
      } else {
        db.prepare("UPDATE caja_diaria SET egresos = egresos + ? WHERE id = ?")
          .run(mov.monto, mov.cajaDiariaId);
      }
    });
    transaction();
  }

  ingresarStock(op) {
    const transaction = db.transaction(() => {
      // 1. Obtener producto actual
      const p = db.prepare("SELECT * FROM productos WHERE id = ?").get(op.productoId);
      if (p) {
        const nuevosSacos = Math.max(0, (p.sacos || 0) + op.sacos);
        const nuevosKg = Math.max(0, (p.granel || 0) + op.kg);
        const nuevasUnidades = Math.max(0, (p.unidades || 0) + op.unidades);

        // 2. Actualizar el stock del producto y opcionalmente su lote/vencimiento
        db.prepare(`
          UPDATE productos 
          SET sacos = ?, granel = ?, unidades = ?, 
              lote = CASE WHEN ? != '' THEN ? ELSE lote END, 
              fechaVencimiento = CASE WHEN ? != '' THEN ? ELSE fechaVencimiento END
          WHERE id = ?
        `).run(
          nuevosSacos, 
          nuevosKg, 
          nuevasUnidades, 
          op.lote || '', 
          op.lote || '', 
          op.fechaVencimiento || '', 
          op.fechaVencimiento || '', 
          op.productoId
        );

        // 3. Registrar en el Kárdex de almacén
        db.prepare(`
          INSERT INTO kardex (id, fecha, producto, productoId, tipo, deltaSacos, deltaKg, deltaUnidades, nota, usuario)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          op.kardexId,
          op.fecha,
          p.nombre,
          op.productoId,
          op.tipo,
          op.sacos,
          op.kg,
          op.unidades,
          op.nota,
          op.usuario
        );
      }
    });
    transaction();
  }
}

module.exports = new DbService();
