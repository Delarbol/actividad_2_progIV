import { useEffect, useRef } from 'react';
import { AlertCircle, LoaderCircle, X } from 'lucide-react';
export function Feedback({ loading, error, retry }) {
  if (loading)
    return (
      <div className="loading" role="status">
        <LoaderCircle className="spin" size={24} /> Cargando información…
      </div>
    );
  if (error)
    return (
      <div className="alert alert-danger d-flex gap-3 align-items-center" role="alert">
        <AlertCircle size={22} />
        <div className="flex-grow-1">{error}</div>
        {retry && (
          <button className="btn btn-outline-danger btn-sm" onClick={retry}>
            Reintentar
          </button>
        )}
      </div>
    );
  return null;
}
export function Modal({ title, children, onClose, busy = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="app-dialog"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="dialog-heading">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-button" aria-label="Cerrar" disabled={busy} onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({ field, value, onChange, options = [] }) {
  const props = {
    id: field.key,
    name: field.key,
    value: value ?? '',
    onChange: (event) => onChange(event.target.value),
    required: field.required !== false,
    className: field.source ? 'form-select' : 'form-control',
  };
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={field.key}>
        {field.label}
        {field.required === false && <span className="text-secondary"> · opcional</span>}
      </label>
      {field.source ? (
        <select {...props}>
          <option value="">Selecciona una opción</option>
          {options.map((option) => (
            <option value={option.id} key={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea {...props} rows={3} maxLength={field.maxLength} />
      ) : (
        <input
          {...props}
          type={field.type || 'text'}
          min={field.min}
          max={field.max ?? (field.type === 'number' ? 2147483647 : undefined)}
          step={field.step || (field.type === 'number' ? '1' : undefined)}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}
