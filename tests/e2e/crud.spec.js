import { test, expect } from '@playwright/test';

test('CRUD real, detalles de venta y navegación móvil', async ({ page, request }) => {
  // Marcamos los registros de esta ejecución para encontrarlos y limpiarlos al finalizar.
  const tag = `ui-${Date.now()}`;
  const base = process.env.API_URL || 'http://localhost:3000/api';
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const read = async (resource) => {
    const response = await request.get(`${base}/${resource}`);
    expect(response.ok()).toBeTruthy();
    return (await response.json()).data;
  };
  const save = async (name) => {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  };
  try {
    await page.goto('/providers');
    await page.getByRole('button', { name: 'Crear proveedor', exact: true }).first().click();
    await page.getByLabel('Nombre', { exact: true }).fill(tag);
    await page.getByLabel('Teléfono').fill('3001234567');
    await page.getByLabel('Correo electrónico').fill(`${tag}@example.com`);
    await page.getByLabel('Ciudad').fill('Manizales');
    await save('Guardar proveedor');
    await page.getByRole('button', { name: `Editar proveedor ${tag}` }).click();
    await page.getByLabel('Ciudad').fill('Pereira');
    await save('Guardar proveedor');
    await expect(page.getByText('Pereira', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Usuarios', exact: true }).click();
    await page.getByRole('button', { name: 'Crear usuario', exact: true }).first().click();
    await page.getByLabel('Nombre', { exact: true }).fill(tag);
    await page.getByLabel('Correo electrónico').fill(`${tag}@example.com`);
    await page.getByLabel('Rol', { exact: true }).fill('cajero');
    await save('Guardar usuario');
    await page.getByRole('button', { name: `Editar usuario ${tag}` }).click();
    await page.getByLabel('Rol', { exact: true }).fill('supervisor');
    await save('Guardar usuario');

    await page.getByRole('link', { name: 'Productos', exact: true }).click();
    await page.getByRole('button', { name: 'Crear producto', exact: true }).first().click();
    await page.getByLabel('Nombre', { exact: true }).fill(tag);
    await page.getByLabel('Descripción').fill('Producto de prueba de interfaz');
    await page.getByLabel('Precio (COP)').fill('4500');
    await page.getByLabel('Existencias', { exact: true }).fill('10');
    await page.getByLabel('Proveedor', { exact: true }).selectOption({ label: tag });
    await save('Guardar producto');
    await page.getByRole('button', { name: `Editar producto ${tag}` }).click();
    await page.getByLabel('Descripción').fill('Descripción actualizada');
    await save('Guardar producto');

    await page.getByRole('link', { name: 'Ventas', exact: true }).click();
    await page.getByRole('button', { name: 'Crear venta', exact: true }).first().click();
    await page.getByLabel('Usuario responsable').selectOption({ label: tag });
    await save('Guardar venta');
    await expect(page).toHaveURL(/\/sales\/\d+$/);
    const saleId = page.url().split('/').pop();
    await page.getByRole('button', { name: 'Cambiar responsable' }).click();
    await save('Guardar venta');
    await page.getByRole('button', { name: 'Agregar producto', exact: true }).click();
    await page
      .getByLabel('Producto', { exact: true })
      .selectOption({ label: `${tag} · 10 disponibles` });
    await page.getByLabel('Cantidad', { exact: true }).fill('2');
    await save('Guardar detalle');
    await expect(page.getByRole('cell', { name: tag, exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Editar detalle/ }).click();
    await page.getByLabel('Cantidad', { exact: true }).fill('3');
    await save('Guardar detalle');
    // Contrastamos lo que hicimos en la interfaz con el total y las existencias de la API.
    expect(Number((await read(`sales/${saleId}`)).total)).toBe(13500);
    expect((await read('products')).find((item) => item.name === tag).stock).toBe(7);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Resumen general.' })).toBeVisible();
    await expect(page.getByText(tag).first()).toBeVisible();
    await page.screenshot({
      path: 'test-results/dashboard-desktop.png',
      fullPage: true,
      animations: 'disabled',
    });
    // También revisamos la navegación móvil y que el contenido no se salga del ancho de la pantalla.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: 'test-results/dashboard-mobile.png',
      fullPage: true,
      animations: 'disabled',
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('link', { name: 'Ventas', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Ventas', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/sales/${saleId}`);
    await page.getByRole('button', { name: /Eliminar detalle/ }).click();
    await save('Sí, eliminar');
    await expect(page.getByText('Esta venta aún no tiene productos')).toBeVisible();
    expect((await read('products')).find((item) => item.name === tag).stock).toBe(10);
    for (const [resource, singular, label] of [
      ['sales', 'venta', saleId],
      ['products', 'producto', tag],
      ['users', 'usuario', tag],
      ['providers', 'proveedor', tag],
    ]) {
      await page.goto(`/${resource}`);
      await page
        .getByRole('button', { name: `Eliminar ${singular} ${label}`, exact: true })
        .click();
      await save('Sí, eliminar');
      await expect(page.getByText('Registro eliminado correctamente.')).toBeVisible();
    }
    expect(errors).toEqual([]);
  } finally {
    // Si falla algún paso, buscamos los datos de esta ejecución y los eliminamos según sus relaciones.
    const users = (await read('users')).filter((item) => item.name === tag);
    const sales = (await read('sales')).filter((item) =>
      users.some((user) => user.id === item.userId),
    );
    const products = (await read('products')).filter((item) => item.name === tag);
    const providers = (await read('providers')).filter((item) => item.name === tag);
    for (const [resource, records] of [
      ['sales', sales],
      ['products', products],
      ['users', users],
      ['providers', providers],
    ]) {
      for (const record of records)
        expect((await request.delete(`${base}/${resource}/${record.id}`)).ok()).toBeTruthy();
    }
  }
});
