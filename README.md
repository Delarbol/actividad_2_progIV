# MarketSoft Frontend
Repositorio público: https://github.com/usuario/marketsoft-frontend

SPA para administrar el supermercado de la Actividad Colaborativa II de Programación IV, Universidad de Manizales. Consume la API REST de [la actividad anterior](https://github.com/Delarbol/actividad_1_progIV) mediante Axios. Usa React, React Router y Bootstrap con la paleta Sintaxis & Tierra.

## Integrantes

El grupo contiene los mismos integrantes documentados en el proyecto anterior:

| Nombre completo                   |
| --------------------------------- |
| Camilo Andrés De la Cruz Arboleda |
| Andrés Felipe Peña Cruz           |

## Ejecución

Requisitos: Node.js 22.12 o superior y el backend de la actividad anterior con PostgreSQL en funcionamiento.

1. En la carpeta del **backend**, inicia la base y la API siguiendo su README:

   ```sh
   docker compose up -d db
   npm install
   npm start
   ```

2. En otra terminal, dentro de **este repositorio**:

   ```sh
   npm install
   npm start
   ```

3. Abre **http://localhost:5173**. La API se consulta por defecto en `http://localhost:3000/api`. El frontend no incluye registros ficticios ni reemplaza el backend cuando la conexión falla.

En PowerShell puedes usar `npm.cmd` si la política de ejecución bloquea `npm.ps1`. El puerto 5173 es fijo para coincidir con el origen CORS permitido por el backend.

### Configuración

Copia `.env.example` como `.env` si necesitas cambiar `VITE_API_URL`. Incluye `/api` al final y reinicia Vite después de modificarla. El backend debe permitir el origen del frontend con `CORS_ORIGIN`.

```env
VITE_API_URL=http://localhost:3000/api
```

Las variables `VITE_*` se incluyen en el navegador: no deben contener secretos.

## Funciones

- Resumen con cantidades reales, últimas ventas y alerta visual de productos con cinco unidades o menos.
- Productos, usuarios y proveedores: consulta, búsqueda local, paginación, creación, edición y eliminación con confirmación.
- Ventas: creación con responsable, edición de responsable, listado, consulta individual y eliminación.
- Detalles de venta: agregar, modificar y eliminar productos usando `/api/sale-details`. Al crear una venta se abre su detalle para agregar productos; también puede permanecer vacía.
- Estados de carga, tablas vacías, recuperación ante errores y mensajes de conflictos recibidos de la API.
- Formularios con etiquetas, validación nativa, botones bloqueados durante guardado, diálogos con foco y navegación móvil.

Flujo inicial recomendado: registrar un proveedor y un usuario, crear productos asociados al proveedor, crear una venta y agregar sus productos.

El rol es una etiqueta, igual que en la API anterior; no implementa autenticación ni permisos. El frontend no envía fechas, totales ni precios de detalle. Los cálculos de inventario, precios históricos y totales persistidos permanecen en el backend. La interfaz solamente formatea importes COP y presenta subtotales informativos. Los conflictos de stock, correo duplicado o registros relacionados se muestran sin descartar el formulario.

Cada módulo principal presenta una tabla de registros con acciones para crear, editar y eliminar. Los formularios de creación y edición consumen directamente los endpoints del backend.
## Arquitectura

```text
src/
  main.jsx                   Inicio de React y estilos de Bootstrap
  App.jsx                    Layout, navegación y rutas de la SPA
  config/resources.js        Campos, columnas y transformación de payloads
  services/api.js            Cliente Axios y tratamiento de errores
  hooks/useLoad.js            Carga, cancelación y reintentos de consultas
  components/                Formularios, diálogos y controles compartidos
  pages/                     Resumen, CRUD genérico y detalle de venta
  styles.css                 Paleta, componentes visuales y adaptación móvil
tests/frontend.test.jsx      Pruebas de contratos e interacciones
scripts/check-api.mjs         Integración optativa con la API real
```

Las páginas coordinan la interfaz; el servicio concentra HTTP; la configuración comparte formularios y tablas sin duplicar los CRUD. `useLoad` cancela solicitudes al cambiar de ruta y evita aplicar respuestas de pantallas anteriores. Las operaciones de negocio y las transacciones siguen en la API.

| Ruta SPA     | Recurso REST                                    |
| ------------ | ----------------------------------------------- |
| `/`          | Consulta de los cuatro recursos para el resumen |
| `/products`  | `/api/products`                                 |
| `/users`     | `/api/users`                                    |
| `/providers` | `/api/providers`                                |
| `/sales`     | `/api/sales`                                    |
| `/sales/:id` | `/api/sales/:id` y `/api/sale-details`          |

El servicio utiliza `GET`, `POST`, `PUT` y `DELETE` y extrae el envoltorio `{ "data": ... }` del backend.

## Diseño

Fondo `#F8FAFC`, texto y estructura `#0F172A`, marca verde `#15803D`, acción principal terracota `#EA580C` y divisiones `#E2E8F0`. Predominan superficies claras; el verde identifica navegación y resumen, y el naranja concentra las acciones principales. Bootstrap aporta la base responsiva y los controles; CSS propio define la identidad visual. Los iconos son de Lucide.

## Verificación

```sh
npm test
npm run build
npm run preview
```

`npm test` verifica contratos HTTP, filtrado, formularios ante errores, confirmaciones de eliminación y reintentos con respuestas controladas. Las pruebas no sustituyen la API en la aplicación.

Con el backend encendido, la siguiente comprobación crea registros temporales, comprueba los CRUD, totales y devolución de stock, y elimina solamente sus propios registros en orden inverso:

```sh
node scripts/check-api.mjs
```

Usa `API_URL` para apuntar esta prueba a otra instancia. Se recomienda una base de desarrollo. Si la API se interrumpe durante la limpieza, el script informa los identificadores pendientes.

### Verificación funcional local

Se realizó una verificación funcional local del frontend MarketSoft. El proyecto fue clonado desde el repositorio de GitHub, se instalaron las dependencias con `npm.cmd install` y se ejecutó correctamente con `npm.cmd start` en `http://localhost:5173`.

Durante la prueba, la interfaz cargó correctamente en el navegador, presentó el resumen general del sistema y se conectó con el backend disponible en `http://localhost:3000/api`. La aplicación consumió datos reales de la API, mostrando registros existentes de proveedores.

Además, se ejecutó la compilación de producción con:

```sh
npm.cmd run build

### Prueba en navegador

Con la API encendida y Microsoft Edge instalado:

```sh
npm run test:e2e
```

Playwright inicia el frontend, recorre los cuatro CRUD desde la interfaz, comprueba cantidades y totales contra la API y revisa la navegación a 390 px de ancho. Crea datos temporales y los elimina al finalizar. Las capturas quedan en `test-results/` (excluido de Git). Por defecto usa Edge; configura `BROWSER_CHANNEL=chrome` si deseas usar Chrome instalado. Para otra API, configura tanto `VITE_API_URL` como `API_URL` con la misma URL.

`npm run format:check` verifica el formato; `npm run format` lo aplica.

## Compilación y entrega

`npm run build` genera `dist/`. En alojamiento estático se necesita redirigir las rutas de la SPA a `index.html`. Configura `VITE_API_URL` antes de compilar y habilita el origen del sitio en el backend. `npm run preview` sirve para revisar localmente la compilación.



Referencias: [Vite](https://vite.dev/guide/), [rutas declarativas de React Router](https://reactrouter.com/start/declarative/routing), [Bootstrap](https://getbootstrap.com/docs/5.3/) y [Axios](https://axios-http.com/docs/intro).
