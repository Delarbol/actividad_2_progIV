import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { api, errorMessage } from '../services/api';
import { date, money } from '../config/resources';
import { useLoad } from '../hooks/useLoad';
import { Feedback, Field, Modal } from '../components/UI';
import DeleteDialog from '../components/DeleteDialog';
import ResourceForm from '../components/ResourceForm';

// Acá manejamos los productos de una venta. Si recibimos un detalle, cargamos sus datos para editarlo.
function DetailForm({ sale, detail, onClose, onSaved }) {
  const [values, setValues] = useState(detail || { productId: '', quantity: 1 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const state = useLoad((signal) => api.list('products', signal), []);
  // Quitamos los productos que ya están en otros detalles de esta venta para no repetirlos.
  // Al editar, conservamos como opción el producto del detalle actual.
  const options = (state.data || []).filter(
    (product) =>
      !sale.details.some((item) => item.productId === product.id && item.id !== detail?.id),
  );
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      // Enviamos producto y cantidad; saleId solo hace falta al crear el detalle.
      // El backend se encarga del precio, las existencias y el total de la venta.
      const body = {
        productId: Number(values.productId),
        quantity: Number(values.quantity),
        ...(!detail && { saleId: sale.id }),
      };
      await api.save('sale-details', body, detail?.id);
      onSaved();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={detail ? 'Editar detalle' : 'Agregar producto'} onClose={onClose} busy={busy}>
      <Feedback {...state} retry={state.reload} />
      {state.data && (
        <form onSubmit={submit}>
          <fieldset disabled={busy}>
            <Field
              field={{ key: 'productId', label: 'Producto', source: 'products' }}
              value={values.productId}
              options={options.map((product) => ({
                ...product,
                name: `${product.name} · ${product.stock} disponibles`,
              }))}
              onChange={(productId) => setValues({ ...values, productId })}
            />
            <Field
              field={{ key: 'quantity', label: 'Cantidad', type: 'number', min: 1 }}
              value={values.quantity}
              onChange={(quantity) => setValues({ ...values, quantity })}
            />
            <p className="form-text">
              El servidor valida las existencias y conserva el precio histórico al cambiar la
              cantidad.
            </p>
            {!options.length && (
              <div className="alert alert-warning">
                No hay otros productos disponibles. Crea un producto o edita un detalle existente.
              </div>
            )}
            <Feedback error={error} />
            <div className="dialog-actions">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn btn-primary" disabled={!options.length}>
                {busy ? 'Guardando…' : 'Guardar detalle'}
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </Modal>
  );
}
export default function SalePage() {
  // Tomamos el id de la dirección para consultar esta venta y sus detalles.
  const { id } = useParams();
  const state = useLoad((signal) => api.get('sales', id, signal), [id]);
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editUser, setEditUser] = useState(false);
  const [notice, setNotice] = useState('');
  const sale = state.data;
  // Volvemos a consultar después de cada cambio para mostrar el total calculado por el servidor.
  function saved() {
    setEditor(null);
    setDeleting(null);
    setEditUser(false);
    setNotice('Venta actualizada correctamente.');
    state.reload();
  }
  return (
    <>
      <Link className="back-link" to="/sales">
        <ArrowLeft size={16} /> Volver a ventas
      </Link>
      <header className="page-heading">
        <div>
          <div className="eyebrow">DETALLE DE VENTA</div>
          <h1>Venta #{id}</h1>
          <p>Consulta los productos y administra las cantidades.</p>
        </div>
      </header>
      <Feedback {...state} retry={state.reload} />
      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}
      {sale && (
        <>
          <div className="sale-summary panel">
            <div>
              <span>Responsable</span>
              <h2>{sale.user?.name}</h2>
              <button className="btn btn-light btn-sm" onClick={() => setEditUser(true)}>
                Cambiar responsable
              </button>
            </div>
            <div>
              <span>Fecha de registro</span>
              <p>{date(sale.date)}</p>
            </div>
            <div>
              <span>Total de la venta</span>
              <strong className="sale-total">{money(sale.total)}</strong>
            </div>
          </div>
          <section className="panel">
            <div className="table-toolbar">
              <h2>Productos de la venta</h2>
              <button className="btn btn-primary" onClick={() => setEditor({})}>
                <Plus size={18} /> Agregar producto
              </button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio registrado</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.details.map((detail) => (
                    <tr key={detail.id}>
                      <td>
                        <strong>{detail.product?.name || `Producto #${detail.productId}`}</strong>
                      </td>
                      <td>{money(detail.price)}</td>
                      <td>{detail.quantity}</td>
                      <td>
                        {/* Calculamos en centavos el subtotal que mostramos, usando el precio registrado. */}
                        {money((Math.round(Number(detail.price) * 100) * detail.quantity) / 100)}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            aria-label={`Editar detalle ${detail.id}`}
                            onClick={() => setEditor({ detail })}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button delete"
                            aria-label={`Eliminar detalle ${detail.id}`}
                            onClick={() => setDeleting(detail)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!sale.details.length && (
              <div className="empty-state">
                <h3>Esta venta aún no tiene productos</h3>
                <p>Agrega el primer producto para comenzar.</p>
              </div>
            )}
          </section>
          {editor && (
            <DetailForm
              sale={sale}
              detail={editor.detail}
              onClose={() => setEditor(null)}
              onSaved={saved}
            />
          )}{' '}
          {editUser && (
            <ResourceForm
              resource="sales"
              id={sale.id}
              onClose={() => setEditUser(false)}
              onSaved={saved}
            />
          )}{' '}
          {deleting && (
            <DeleteDialog
              resource="sale-details"
              record={deleting}
              onClose={() => setDeleting(null)}
              onDeleted={saved}
            />
          )}
        </>
      )}
    </>
  );
}
