import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ArrowUpRight, PackageOpen, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { resources } from '../config/resources';
import { useLoad } from '../hooks/useLoad';
import { Feedback } from '../components/UI';
import ResourceForm from '../components/ResourceForm';
import DeleteDialog from '../components/DeleteDialog';

export default function ResourcePage({ resource }) {
  const config = resources[resource];
  const state = useLoad((signal) => api.list(resource, signal), [resource]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const valueAt = (row, key) => key.split('.').reduce((value, part) => value?.[part], row);
  const filtered = (state.data || []).filter((row) =>
    [row.id, ...config.columns.map(([key]) => valueAt(row, key))].some((value) =>
      String(value ?? '')
        .toLocaleLowerCase('es')
        .includes(query.toLocaleLowerCase('es')),
    ),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, pages);
  function done(message) {
    setEditor(null);
    setDeleting(null);
    setNotice(message);
    state.reload();
  }
  return (
    <>
      <header className="page-heading">
        <div>
          <div className="eyebrow">GESTIÓN DEL SUPERMERCADO</div>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditor({})}>
          <Plus size={18} /> Crear {config.singular}
        </button>
      </header>
      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
          <button
            className="btn-close float-end"
            aria-label="Cerrar aviso"
            onClick={() => setNotice('')}
          />
        </div>
      )}
      <section className="panel">
        <div className="table-toolbar">
          <div>
            <h2>Todos los {config.title.toLowerCase()}</h2>
            <span className="text-secondary small">
              {state.data ? `${state.data.length} registros en total` : 'Información del sistema'}
            </span>
          </div>
          <div className="d-flex gap-2">
            <div className="search-input">
              <Search size={18} />
              <input
                aria-label={`Buscar ${config.title.toLowerCase()}`}
                placeholder="Buscar por nombre, ID…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button
              className="icon-button"
              title="Actualizar"
              aria-label="Actualizar registros"
              onClick={state.reload}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
        <Feedback {...state} retry={state.reload} />
        {state.data && (
          <>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    {config.columns.map(([key, label]) => (
                      <th scope="col" key={key}>
                        {label}
                      </th>
                    ))}
                    <th scope="col" className="text-end">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice((currentPage - 1) * 8, currentPage * 8).map((row) => (
                    <tr key={row.id}>
                      <td className="text-secondary">#{String(row.id).padStart(3, '0')}</td>
                      {config.columns.map(([key, , format]) => (
                        <td key={key}>
                          {key === 'stock' ? (
                            <span className={`stock-badge ${row.stock <= 5 ? 'low' : ''}`}>
                              {row.stock} unidades
                            </span>
                          ) : key === 'name' ? (
                            <strong>{row.name}</strong>
                          ) : format ? (
                            format(valueAt(row, key))
                          ) : (
                            (valueAt(row, key) ?? '—')
                          )}
                        </td>
                      ))}
                      <td>
                        <div className="row-actions">
                          {resource === 'sales' && (
                            <Link
                              className="icon-button"
                              aria-label={`Ver venta ${row.id}`}
                              to={`/sales/${row.id}`}
                            >
                              <ArrowUpRight size={17} />
                            </Link>
                          )}
                          <button
                            className="icon-button"
                            aria-label={`Editar ${config.singular} ${row.name || row.id}`}
                            onClick={() => setEditor({ id: row.id })}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button delete"
                            aria-label={`Eliminar ${config.singular} ${row.name || row.id}`}
                            onClick={() => setDeleting(row)}
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
            {!filtered.length && (
              <div className="empty-state">
                <PackageOpen size={40} />
                <h3>
                  {query
                    ? 'No encontramos coincidencias'
                    : `Aún no hay ${config.title.toLowerCase()}`}
                </h3>
                <p>
                  {query
                    ? 'Prueba con otro término de búsqueda.'
                    : 'Crea tu primer registro para comenzar.'}
                </p>
                {!query && (
                  <button className="btn btn-outline-success" onClick={() => setEditor({})}>
                    Crear {config.singular}
                  </button>
                )}
              </div>
            )}
            <div className="pagination-bar">
              <span>
                {filtered.length
                  ? `${(currentPage - 1) * 8 + 1}–${Math.min(currentPage * 8, filtered.length)} de ${filtered.length}`
                  : '0 registros'}
              </span>
              <div className="d-flex gap-2 align-items-center">
                <button
                  className="btn btn-light btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Anterior
                </button>
                <span>
                  {currentPage} / {pages}
                </span>
                <button
                  className="btn btn-light btn-sm"
                  disabled={currentPage === pages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      {resource === 'products' && (
        <p className="table-note">
          <span className="status-dot" /> Las existencias se actualizan automáticamente al registrar
          una venta.
        </p>
      )}
      {editor && (
        <ResourceForm
          resource={resource}
          id={editor.id}
          onClose={() => setEditor(null)}
          onSaved={() => done('Registro guardado correctamente.')}
        />
      )}
      {deleting && (
        <DeleteDialog
          resource={resource}
          record={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => done('Registro eliminado correctamente.')}
        />
      )}
    </>
  );
}
