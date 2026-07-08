const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    saludar: () => ipcRenderer.invoke('saludar'),
    
    // Operaciones de base de datos SQLite
    dbGetInitialData: () => ipcRenderer.invoke('db:get-initial-data'),
    dbAddProduct: (p) => ipcRenderer.invoke('db:add-product', p),
    dbUpdateProduct: (p) => ipcRenderer.invoke('db:update-product', p),
    dbDeleteProduct: (id) => ipcRenderer.invoke('db:delete-product', id),
    dbAddClient: (c) => ipcRenderer.invoke('db:add-client', c),
    dbUpdateClient: (c) => ipcRenderer.invoke('db:update-client', c),
    dbDeleteClient: (id) => ipcRenderer.invoke('db:delete-client', id),
    dbAddUser: (u) => ipcRenderer.invoke('db:add-user', u),
    dbDeleteUser: (id) => ipcRenderer.invoke('db:delete-user', id),
    dbUpdateUser: (u) => ipcRenderer.invoke('db:update-user', u),
    dbRegistrarVenta: (venta) => ipcRenderer.invoke('db:registrar-venta', venta),
    dbAbrirCaja: (caja) => ipcRenderer.invoke('db:abrir-caja', caja),
    dbCerrarCaja: (resumen) => ipcRenderer.invoke('db:cerrar-caja', resumen),
    dbAgregarMovimientoCaja: (mov) => ipcRenderer.invoke('db:agregar-movimiento-caja', mov),
    dbIngresarStock: (op) => ipcRenderer.invoke('db:ingresar-stock', op),

    // Autenticación y Backups
    authLogin: (email, password) => ipcRenderer.invoke('auth:login', email, password),
    authChangePassword: (userId, actual, nueva) => ipcRenderer.invoke('auth:change-password', userId, actual, nueva),
    backupExport: () => ipcRenderer.invoke('backup:export'),
    backupImport: () => ipcRenderer.invoke('backup:import'),

    // Impresión Silenciosa y SUNAT API
    printGetPrinters: () => ipcRenderer.invoke('print:get-printers'),
    printTicket: (html, printerName, silent) => ipcRenderer.invoke('print:ticket', { html, printerName, silent }),
    consultarDni: (dni, token) => ipcRenderer.invoke('api:consultar-dni', { dni, token }),
    consultarRuc: (ruc, token) => ipcRenderer.invoke('api:consultar-ruc', { ruc, token }),
});