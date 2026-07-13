const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

// Inicializa la base de datos y carga el servicio
require('../database/database');
const dbService = require('../database/dbService');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, '../public/logo192.png'),

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },

    autoHideMenuBar: true
  });

  // Desarrollo
  if (!app.isPackaged) {
    win.loadURL('http://localhost:3000');
  }
  // Producción
  else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle('saludar', async () => {
    return "Hola desde Electron 🚀";
});

// Registrar manejadores IPC de SQLite para FERCORD POS
ipcMain.handle('db:get-initial-data', async () => {
  return dbService.getInitialData();
});
ipcMain.handle('db:add-product', async (e, p) => {
  return dbService.addProduct(p);
});
ipcMain.handle('db:update-product', async (e, p) => {
  return dbService.updateProduct(p);
});
ipcMain.handle('db:delete-product', async (e, id) => {
  return dbService.deleteProduct(id);
});
ipcMain.handle('db:add-client', async (e, c) => {
  return dbService.addClient(c);
});
ipcMain.handle('db:update-client', async (e, c) => {
  return dbService.updateClient(c);
});
ipcMain.handle('db:delete-client', async (e, id) => {
  return dbService.deleteClient(id);
});
ipcMain.handle('db:add-user', async (e, u) => {
  return dbService.addUser(u);
});
ipcMain.handle('db:delete-user', async (e, id) => {
  return dbService.deleteUser(id);
});
ipcMain.handle('db:update-user', async (e, u) => {
  return dbService.updateUser(u);
});
ipcMain.handle('db:registrar-venta', async (e, venta) => {
  return dbService.registrarVenta(venta);
});
ipcMain.handle('db:abrir-caja', async (e, caja) => {
  return dbService.abrirCaja(caja);
});
ipcMain.handle('db:cerrar-caja', async (e, resumen) => {
  return dbService.cerrarCaja(resumen);
});
ipcMain.handle('db:agregar-movimiento-caja', async (e, mov) => {
  return dbService.agregarMovimientoCaja(mov);
});
ipcMain.handle('db:ingresar-stock', async (e, op) => {
  return dbService.ingresarStock(op);
});
ipcMain.handle('db:add-proveedor', async (e, p) => {
  return dbService.addProveedor(p);
});
ipcMain.handle('db:update-proveedor', async (e, p) => {
  return dbService.updateProveedor(p);
});
ipcMain.handle('db:delete-proveedor', async (e, id) => {
  return dbService.deleteProveedor(id);
});
ipcMain.handle('db:registrar-compra', async (e, c) => {
  return dbService.registrarCompra(c);
});
ipcMain.handle('db:registrar-abono', async (e, abono) => {
  return dbService.registrarAbonoCliente(abono);
});
ipcMain.handle('db:registrar-abono-proveedor', async (e, abono) => {
  return dbService.registrarAbonoProveedor(abono);
});
ipcMain.handle('db:update-empresa-config', async (e, config) => {
  return dbService.updateEmpresaConfig(config);
});
ipcMain.handle('print:export-pdf', async (e, { html, filename }) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Guardar Comprobante PDF',
    defaultPath: path.join(app.getPath('documents'), `${filename}.pdf`),
    filters: [{ name: 'Documento PDF', extensions: ['pdf'] }]
  });

  if (!filePath) return { success: false, error: 'Guardado cancelado' };

  try {
    const pdfWin = new BrowserWindow({ show: false });
    await pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    
    const data = await pdfWin.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A6',
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    fs.writeFileSync(filePath, data);
    pdfWin.close();

    shell.showItemInFolder(filePath);

    return { success: true, filePath };
  } catch (err) {
    console.error("Error al exportar PDF:", err);
    return { success: false, error: err.message };
  }
});

// Autenticación de Usuarios
ipcMain.handle('auth:login', async (e, email, password) => {
  return dbService.login(email, password);
});
ipcMain.handle('auth:change-password', async (e, userId, actual, nueva) => {
  return dbService.changePassword(userId, actual, nueva);
});

// Copias de Seguridad
ipcMain.handle('backup:export', async () => {
  const defaultPath = `fercord_backup_${new Date().toISOString().split('T')[0]}.db`;
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Guardar copia de seguridad',
    defaultPath: defaultPath,
    filters: [{ name: 'SQLite Database', extensions: ['db'] }]
  });

  if (canceled || !filePath) return false;

  try {
    const currentDbPath = path.join(app.getPath('userData'), 'fercord.db');
    fs.copyFileSync(currentDbPath, filePath);
    return true;
  } catch (err) {
    console.error("Error al exportar backup:", err);
    return false;
  }
});

ipcMain.handle('backup:import', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Restaurar copia de seguridad',
    filters: [{ name: 'SQLite Database', extensions: ['db'] }],
    properties: ['openFile']
  });

  if (canceled || filePaths.length === 0) return { success: false, msg: 'Cancelado' };

  const filePath = filePaths[0];
  const currentDbPath = path.join(app.getPath('userData'), 'fercord.db');

  try {
    const Database = require('better-sqlite3');
    const tempDb = new Database(filePath, { readonly: true });
    const check = tempDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'").get();
    tempDb.close();
    if (!check) {
      return { success: false, msg: 'El archivo seleccionado no es una copia de seguridad válida de FERCORD.' };
    }
  } catch (e) {
    return { success: false, msg: 'El archivo de base de datos está corrupto o es inválido.' };
  }

  try {
    const db = require('../database/database');
    db.close();

    fs.copyFileSync(filePath, currentDbPath);

    app.relaunch();
    app.exit(0);
    return { success: true };
  } catch (err) {
    console.error("Error al restaurar backup:", err);
    return { success: false, msg: 'Error al reemplazar base de datos: ' + err.message };
  }
});

// Consulta DNI (RENIEC) y RUC (SUNAT)
ipcMain.handle('api:consultar-dni', async (e, { dni, token }) => {
  try {
    const apiToken = token || 'apis-token-1.autenticado';
    const isDecolecta = apiToken.startsWith('sk_');
    const url = isDecolecta
      ? `https://api.decolecta.com/v1/reniec/dni?numero=${dni}`
      : `https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      }
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Error del servidor de API (${response.status})`);
    }
    const data = await response.json();
    if (isDecolecta && data) {
      return {
        success: true,
        data: {
          ...data,
          nombres: data.nombres || '',
          apellidoPaterno: data.apellido_paterno || '',
          apellidoMaterno: data.apellido_materno || ''
        }
      };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Error consultando DNI:", err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('api:consultar-ruc', async (e, { ruc, token }) => {
  try {
    const apiToken = token || 'apis-token-1.autenticado';
    const isDecolecta = apiToken.startsWith('sk_');
    const url = isDecolecta
      ? `https://api.decolecta.com/v1/sunat/ruc?numero=${ruc}`
      : `https://api.apis.net.pe/v2/sunat/ruc?numero=${ruc}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      }
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Error del servidor de API (${response.status})`);
    }
    const data = await response.json();
    if (isDecolecta && data) {
      return {
        success: true,
        data: {
          ...data,
          razonSocial: data.razon_social || '',
          direccion: data.direccion || ''
        }
      };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Error consultando RUC:", err.message);
    return { success: false, error: err.message };
  }
});

// Impresión Silenciosa de Tickets POS
ipcMain.handle('print:get-printers', async () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (!win) return [];
  return win.webContents.getPrintersAsync();
});

ipcMain.handle('print:ticket', async (e, { html, printerName, silent = true }) => {
  let printWin = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  return new Promise((resolve) => {
    printWin.webContents.on('did-finish-load', () => {
      const options = {
        silent: silent,
        printBackground: true,
        margins: { marginType: 'none' }
      };
      if (printerName) {
        options.deviceName = printerName;
      }
      printWin.webContents.print(options, (success, failureReason) => {
        printWin.close();
        if (success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: failureReason });
        }
      });
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});