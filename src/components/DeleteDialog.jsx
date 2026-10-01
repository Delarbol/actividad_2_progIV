import { useState } from 'react';
import { api, errorMessage } from '../services/api';
import { Feedback, Modal } from './UI';
export default function DeleteDialog({ resource, record, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function remove() {
    setBusy(true);
    setError('');
    try {
      await api.remove(resource, record.id);
      onDeleted();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Eliminar registro" onClose={onClose} busy={busy}>
      <p>
        Vas a eliminar <strong>{record.name || `el registro #${record.id}`}</strong>. Esta acción no
        se puede deshacer.
      </p>
      {['sales', 'sale-details'].includes(resource) && (
        <p>Las unidades se devolverán al inventario y los totales se actualizarán.</p>
      )}
      <Feedback error={error} />
      <div className="dialog-actions">
        <button className="btn btn-light" disabled={busy} onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-danger" disabled={busy} onClick={remove}>
          {busy ? 'Eliminando…' : 'Sí, eliminar'}
        </button>
      </div>
    </Modal>
  );
}
