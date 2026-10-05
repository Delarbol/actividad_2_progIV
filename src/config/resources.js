// Acá dejamos los formatos y la configuración que comparten las tablas y los formularios.
// Mostramos los valores en pesos colombianos; esto solo cambia cómo se ven en pantalla.
export const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
// Si no tenemos fecha, mostramos un guion para que la celda no quede vacía.
export const date = (value) =>
  value
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value),
      )
    : '—';
// Reutilizamos estos campos porque se repiten en varios módulos.
const name = { key: 'name', label: 'Nombre', maxLength: 120 };
const email = { key: 'email', label: 'Correo electrónico', type: 'email', maxLength: 254 };
// Cada recurso define sus campos editables y las columnas que vamos a mostrar.
// Con source indicamos de dónde salen las opciones, por ejemplo los proveedores de un producto.
// En columns usamos la clave del dato, el título y, si hace falta, una función para darle formato.
export const resources = {
  products: {
    title: 'Productos',
    singular: 'producto',
    description: 'Un inventario organizado, una operación más simple.',
    fields: [
      name,
      {
        key: 'description',
        label: 'Descripción',
        type: 'textarea',
        required: false,
        maxLength: 5000,
      },
      {
        key: 'price',
        label: 'Precio (COP)',
        type: 'number',
        min: 0.01,
        max: 9999999999.99,
        step: '0.01',
      },
      { key: 'stock', label: 'Existencias', type: 'number', min: 0 },
      { key: 'providerId', label: 'Proveedor', source: 'providers' },
    ],
    columns: [
      ['name', 'Producto'],
      ['provider.name', 'Proveedor'],
      ['price', 'Precio', money],
      ['stock', 'Existencias'],
    ],
  },
  users: {
    title: 'Usuarios',
    singular: 'usuario',
    description: 'Las personas que hacen posible tu operación.',
    fields: [
      name,
      email,
      { key: 'role', label: 'Rol', maxLength: 50, placeholder: 'Ej. cajero, administrador' },
    ],
    columns: [
      ['name', 'Nombre'],
      ['email', 'Correo electrónico'],
      ['role', 'Rol'],
    ],
  },
  providers: {
    title: 'Proveedores',
    singular: 'proveedor',
    description: 'Conecta tu inventario con quienes lo abastecen.',
    fields: [
      name,
      { key: 'phone', label: 'Teléfono', type: 'tel', maxLength: 30 },
      email,
      { key: 'city', label: 'Ciudad', maxLength: 100 },
    ],
    columns: [
      ['name', 'Proveedor'],
      ['phone', 'Teléfono'],
      ['email', 'Correo electrónico'],
      ['city', 'Ciudad'],
    ],
  },
  sales: {
    title: 'Ventas',
    singular: 'venta',
    description: 'Cada venta, sus productos y sus detalles en un solo lugar.',
    fields: [{ key: 'userId', label: 'Usuario responsable', source: 'users' }],
    columns: [
      ['date', 'Fecha', date],
      ['user.name', 'Responsable'],
      ['total', 'Total', money],
    ],
  },
};
// Ahora armamos los datos que se van a enviar usando solo los campos del formulario.
// Así dejamos por fuera el id del registro, los objetos relacionados, las fechas y los totales.
// Los campos numéricos y las referencias (como providerId) se convierten a número;
// a los textos les quitamos los espacios del inicio y del final.
export function payloadFor(resource, values) {
  return Object.fromEntries(
    resources[resource].fields.map((field) => [
      field.key,
      field.type === 'number' || field.source
        ? Number(values[field.key])
        : String(values[field.key] ?? '').trim(),
    ]),
  );
}
