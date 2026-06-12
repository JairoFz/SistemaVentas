FERCORD POS - Sistema de Punto de Venta
Sistema de gestión y punto de venta para empresas de nutrición balanceada (alimentos para aves y cerdos).

📋 Características
Punto de Venta (POS) - Registro de ventas con múltiples presentaciones (saco, medio, arroba, kilo)
Gestión de Clientes - CRUD completo de clientes
Gestión de Productos - Control de inventario con sacos y granel
Kárdex/Almacén - Historial de movimientos de stock
Caja Diaria - Control de apertura/cierre de caja e ingresos/egresos
Reportes - Visualización de ventas y estadísticas
Usuarios - Gestión de usuarios con roles (admin/vendedor)
Perfil - Actualización de datos personales y contraseña
🛠️ Tecnologías
React 18 - Framework principal
Lucide React - Iconos
Recharts - Gráficos y estadísticas
Electron - Aplicación de escritorio
LocalStorage - Persistencia de datos
📦 Requisitos Previos
Node.js 16 o superior
npm 8 o superior
🚀 Instalación
1. Clonar el repositorio
git clone <url-del-repositorio>
cd fercord

Copy

Insert

2. Instalar dependencias
npm install

Copy

Insert

💻 Desarrollo
Ejecutar en navegador (desarrollo web)
npm start

Copy

Insert

Abre http://localhost:3000 en tu navegador.

Ejecutar como aplicación de escritorio (desarrollo)
npm run electron-dev

Copy

Insert

Esto abrirá la aplicación en una ventana de Electron con hot-reload.

📦 Generar Ejecutable (.exe)
Para Windows
npm run dist

Copy

Insert

El instalador se generará en:

dist/FERCORD POS Setup 1.0.0.exe

Copy

Insert

Distribución
Comparte el archivo .exe generado. Los usuarios solo necesitan:

Ejecutar el instalador
Seguir el asistente de instalación
La aplicación quedará instalada y lista para usar
🔐 Usuarios por Defecto
Al iniciar la aplicación por primera vez, se crean estos usuarios:

Administradoradmin@fercord.comadmin123adminVendedorvendedor@fercord.comvendedor123vendedor
📁 Estructura del Proyecto
fercord/
├── public/
│   ├── electron.js          # Configuración de Electron
│   └── logo192.png          # Icono de la aplicación
├── src/
│   ├── context/
│   │   └── AppContext.js    # Estado global de la aplicación
│   ├── pages/
│   │   ├── Login.js         # Página de inicio de sesión
│   │   ├── Dashboard.js     # Panel principal
│   │   ├── CajaPOS.js       # Punto de venta
│   │   ├── VentasBoletas.js # Historial de ventas
│   │   ├── Clientes.js      # Gestión de clientes
│   │   ├── Productos.js     # Gestión de productos
│   │   ├── Kardex.js        # Kárdex/Almacén
│   │   ├── CajaDiaria.js    # Caja diaria
│   │   ├── Perfil.js        # Perfil de usuario
│   │   └── OtherPages.js    # Reportes y Usuarios
│   ├── App.js               # Componente principal
│   └── index.css            # Estilos globales
├── package.json             # Dependencias y scripts
└── README.md                # Este archivo

Copy

Insert

🔄 Actualización de la Aplicación
Para desarrolladores:
Realiza los cambios en el código
Incrementa la versión en package.json:
"version": "1.1.0"

Copy

Insert

Genera el nuevo ejecutable:
npm run dist

Copy

Insert

Distribuye el nuevo .exe
Para usuarios finales:
Ejecutar el nuevo instalador .exe
La aplicación se actualizará automáticamente
Los datos se mantienen intactos
💾 Almacenamiento de Datos
Los datos se guardan en localStorage del navegador/Electron:

Ubicación en Windows:
C:\Users\[Usuario]\AppData\Roaming\FERCORD POS\

Copy

Insert

Datos almacenados:
Productos
Clientes
Ventas
Kárdex
Usuarios
Caja diaria
Movimientos de caja
🔧 Scripts Disponibles
npm startInicia el servidor de desarrollo (navegador)npm run buildGenera build de producciónnpm run electronEjecuta Electron (requiere build previo)npm run electron-devDesarrollo con Electron y hot-reloadnpm run distGenera instalador .exe para Windows
🗑️ Resetear Datos
Desde la aplicación (navegador):
Abre la consola del navegador (F12) y ejecuta:

localStorage.clear();
location.reload();

Copy

Insert

Desde la aplicación de escritorio:
Elimina la carpeta:

C:\Users\[Usuario]\AppData\Roaming\FERCORD POS\

Copy

Insert

🐛 Solución de Problemas
Error al generar el .exe
Si aparece EBUSY: resource busy or locked:

Cierra todas las instancias de la aplicación
Elimina la carpeta dist
Ejecuta npm run dist nuevamente
La aplicación no abre después de instalar
Verifica que el archivo public/electron.js esté correctamente configurado y que no dependa de módulos de desarrollo.

📝 Notas Importantes
Cada instalación es independiente - los datos no se comparten entre PCs
La aplicación funciona 100% offline una vez instalada
El límite de localStorage es aproximadamente 5-10 MB
Para grandes volúmenes de datos, considera migrar a SQLite o backend
📄 Licencia
Proyecto privado - Todos los derechos reservados

👤 Autor
Jairo Daniel Fernandez Fernandez

Versión: 1.0.0
Última actualización: Junio 2026
