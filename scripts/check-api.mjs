// Integración optativa: crea registros propios y los elimina en orden inverso.
// Nunca trunca tablas ni modifica registros preexistentes.
import assert from 'node:assert/strict';
const base = process.env.API_URL || 'http://localhost:3000/api';
const tag = `frontend-test-${Date.now()}`;
// Guardamos los identificadores creados para poder eliminarlos al terminar, incluso si algo falla.
const owned = [];
async function request(path, method = 'GET', body) {
  const response = await fetch(`${base}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15000),
  });
  const json = await response.json();
  assert.ok(response.ok, `${method} ${path}: ${JSON.stringify(json)}`);
  return json.data;
}
async function create(resource, body) {
  const record = await request(resource, 'POST', body);
  owned.push([resource, record.id]);
  return record;
}
try {
  // Primero creamos el proveedor y el usuario porque el producto y la venta los necesitan.
  const providerBody = {
    name: tag,
    phone: '3001234567',
    email: `${tag}@example.com`,
    city: 'Manizales',
  };
  const provider = await create('providers', providerBody);
  await request(`providers/${provider.id}`, 'PUT', { ...providerBody, city: 'Pereira' });
  assert.equal((await request(`providers/${provider.id}`)).city, 'Pereira');
  const userBody = { name: tag, email: `${tag}@example.com`, role: 'cajero' };
  const user = await create('users', userBody);
  await request(`users/${user.id}`, 'PUT', { ...userBody, role: 'supervisor' });
  const productBody = {
    name: tag,
    description: 'Registro temporal de integración',
    price: 4500,
    stock: 10,
    providerId: provider.id,
  };
  const product = await create('products', productBody);
  await request(`products/${product.id}`, 'PUT', {
    ...productBody,
    description: 'Editado desde prueba de frontend',
  });
  const sale = await create('sales', { userId: user.id });
  await request(`sales/${sale.id}`, 'PUT', { userId: user.id });
  const detail = await create('sale-details', {
    saleId: sale.id,
    productId: product.id,
    quantity: 2,
  });
  // Verificamos que vender dos unidades de 4500 dé un total de 9000 y descuente las existencias.
  assert.equal(Number((await request(`sales/${sale.id}`)).total), 9000);
  assert.equal((await request(`products/${product.id}`)).stock, 8);
  await request(`sale-details/${detail.id}`, 'PUT', { productId: product.id, quantity: 3 });
  assert.equal(Number((await request(`sales/${sale.id}`)).total), 13500);
  assert.equal((await request(`products/${product.id}`)).stock, 7);
  for (const resource of ['products', 'providers', 'users', 'sales'])
    assert.ok(Array.isArray(await request(resource)));
  // Al quitar el detalle, comprobamos que se devuelvan las unidades y el total quede en cero.
  await request(`sale-details/${detail.id}`, 'DELETE');
  owned.pop();
  assert.equal(Number((await request(`sales/${sale.id}`)).total), 0);
  assert.equal((await request(`products/${product.id}`)).stock, 10);
  console.log('Integración real OK: CRUD de cuatro módulos, detalles, total e inventario.');
} finally {
  // Limpiamos en orden inverso para eliminar primero los registros que dependen de otros.
  for (const [resource, id] of owned.reverse()) {
    try {
      await request(`${resource}/${id}`, 'DELETE');
    } catch (error) {
      process.exitCode = 1;
      console.error(`No se pudo limpiar ${resource}/${id}:`, error.message);
    }
  }
}
