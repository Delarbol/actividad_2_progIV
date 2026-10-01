export const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
export const date = (value) =>
  value
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value),
      )
    : '—';
const name = { key: 'name', label: 'Nombre', maxLength: 120 };
const email = { key: 'email', label: 'Correo electrónico', type: 'email', maxLength: 254 };
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
// Whitelist explícita: nunca enviar asociaciones, ids, fechas ni totales al backend.
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
