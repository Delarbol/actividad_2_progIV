import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { api, errorMessage, http } from '../src/services/api';
import { payloadFor } from '../src/config/resources';
import ResourcePage from '../src/pages/ResourcePage';
import App from '../src/App';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe('Contrato de API', () => {
  it('envía únicamente campos editables con números normalizados', () => {
    expect(
      payloadFor('products', {
        name: ' Arroz ',
        description: ' Bolsa ',
        price: '4500.25',
        stock: '3',
        providerId: '2',
        id: 99,
        provider: {},
        createdAt: 'fecha',
      }),
    ).toEqual({ name: 'Arroz', description: 'Bolsa', price: 4500.25, stock: 3, providerId: 2 });
    expect(payloadFor('sales', { userId: '1', total: 123, details: [] })).toEqual({ userId: 1 });
  });
  it('desenvuelve data y utiliza los verbos y rutas del backend', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const post = vi.spyOn(http, 'post').mockResolvedValue({ data: { data: { id: 2 } } });
    const put = vi.spyOn(http, 'put').mockResolvedValue({ data: { data: { id: 2 } } });
    const del = vi.spyOn(http, 'delete').mockResolvedValue({ data: { data: {} } });
    expect(await api.list('users')).toEqual([{ id: 1 }]);
    await api.get('users', 1);
    await api.save('users', { name: 'Ana' });
    await api.save('users', { name: 'Ana' }, 2);
    await api.remove('users', 2);
    expect(get).toHaveBeenCalledWith('/users/1', { signal: undefined });
    expect(post).toHaveBeenCalledWith('/users', { name: 'Ana' });
    expect(put).toHaveBeenCalledWith('/users/2', { name: 'Ana' });
    expect(del).toHaveBeenCalledWith('/users/2');
  });
  it('presenta los errores de negocio y de conexión', () => {
    expect(
      errorMessage({ response: { data: { error: { message: 'Stock insuficiente.' } } } }),
    ).toBe('Stock insuficiente.');
    expect(errorMessage({})).toContain('conectar con la API');
  });
});
describe('Interacciones de la SPA', () => {
  it('busca registros y muestra resultados vacíos', async () => {
    vi.spyOn(api, 'list').mockResolvedValue([
      { id: 1, name: 'Ana', email: 'ana@example.com', role: 'cajero' },
    ]);
    render(
      <MemoryRouter>
        <ResourcePage resource="users" />
      </MemoryRouter>,
    );
    await screen.findByText('Ana');
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar usuarios' }), 'desconocido');
    expect(screen.getByText('No encontramos coincidencias')).toBeTruthy();
  });
  it('conserva el formulario ante conflictos y permite corregir y guardar', async () => {
    vi.spyOn(api, 'list').mockResolvedValue([]);
    const save = vi
      .spyOn(api, 'save')
      .mockRejectedValueOnce({ response: { data: { error: { message: 'El correo ya existe.' } } } })
      .mockResolvedValue({ id: 1 });
    render(
      <MemoryRouter>
        <ResourcePage resource="users" />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getAllByRole('button', { name: 'Crear usuario' })[0]);
    await userEvent.type(await screen.findByLabelText('Nombre'), 'Ana');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.type(screen.getByLabelText('Rol'), 'cajero');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }));
    await screen.findByText('El correo ya existe.');
    expect(screen.getByLabelText('Nombre').value).toBe('Ana');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }));
    await screen.findByText('Registro guardado correctamente.');
    expect(save).toHaveBeenLastCalledWith(
      'users',
      { name: 'Ana', email: 'ana@example.com', role: 'cajero' },
      undefined,
    );
  });
  it('requiere confirmación antes de eliminar', async () => {
    vi.spyOn(api, 'list').mockResolvedValue([
      { id: 2, name: 'Ana', email: 'ana@example.com', role: 'cajero' },
    ]);
    const remove = vi.spyOn(api, 'remove').mockResolvedValue({});
    render(
      <MemoryRouter>
        <ResourcePage resource="users" />
      </MemoryRouter>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar usuario Ana' }));
    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith('users', 2));
  });
  it('muestra errores de conexión y permite reintentar', async () => {
    vi.spyOn(api, 'list').mockRejectedValueOnce({}).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <ResourcePage resource="products" />
      </MemoryRouter>,
    );
    await screen.findByRole('alert');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await screen.findByText('Aún no hay productos');
  });
  it('muestra una página útil para rutas inexistentes', () => {
    render(
      <MemoryRouter initialEntries={['/no-existe']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeTruthy();
  });
});
