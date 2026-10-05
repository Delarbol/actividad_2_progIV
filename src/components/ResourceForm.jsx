import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../services/api';
import { resources, payloadFor } from '../config/resources';
import { useLoad } from '../hooks/useLoad';
import { Feedback, Field, Modal } from './UI';

// Usamos el mismo formulario para crear y editar los cuatro recursos principales.
// Los campos y sus validaciones salen de la configuración de cada recurso.
export default function ResourceForm({ resource, id, onClose, onSaved }) {
  const config = resources[resource];
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const state = useLoad(
    async (signal) => {
      // Con Set evitamos consultar dos veces una lista si varios campos usan la misma fuente.
      const sources = [
        ...new Set(config.fields.filter((field) => field.source).map((field) => field.source)),
      ];
      // Cargamos al mismo tiempo el registro a editar y las opciones de los campos relacionados.
      // Para crear empezamos con un objeto vacío porque todavía no existe un registro.
      const [record, ...lists] = await Promise.all([
        id ? api.get(resource, id, signal) : Promise.resolve({}),
        ...sources.map((source) => api.list(source, signal)),
      ]);
      return {
        record,
        options: Object.fromEntries(sources.map((source, index) => [source, lists[index]])),
      };
    },
    [resource, id],
  );
  // Al principio mostramos lo que llegó de la API; luego usamos los cambios del usuario.
  const current = values ?? state.data?.record ?? {};
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const record = await api.save(resource, payloadFor(resource, current), id);
      onSaved();
      // Una venta nueva empieza sin productos. Abrimos su detalle para poder agregarlos.
      if (resource === 'sales' && !id) navigate(`/sales/${record.id}`);
    } catch (failure) {
      // Dejamos el formulario abierto y conservamos los datos para que se puedan corregir.
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={`${id ? 'Editar' : 'Crear'} ${config.singular}`} onClose={onClose} busy={busy}>
      <Feedback {...state} retry={state.reload} />
      {state.data && (
        <form onSubmit={submit}>
          {/* Bloqueamos los campos mientras se guarda para evitar envíos repetidos. */}
          <fieldset disabled={busy}>
            {config.fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={current[field.key]}
                options={state.data.options[field.source]}
                onChange={(value) => setValues({ ...current, [field.key]: value })}
              />
            ))}
            {config.fields
              .filter((field) => field.source && !state.data.options[field.source]?.length)
              .map((field) => (
                <div className="alert alert-warning" key={field.key}>
                  Primero debes registrar {resources[field.source].title.toLowerCase()}.
                </div>
              ))}
            {resource === 'sales' && !id && (
              <p className="form-text">
                Crea la venta y luego agrega sus productos. El total se actualizará automáticamente.
              </p>
            )}
            <Feedback error={error} />
            <div className="dialog-actions">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                disabled={config.fields.some(
                  (field) => field.source && !state.data.options[field.source]?.length,
                )}
              >
                {busy ? 'Guardando…' : 'Guardar ' + config.singular}
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </Modal>
  );
}
