import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../services/api';
// Reunimos acá la carga, los errores y los reintentos para no repetirlos en cada pantalla.
export function useLoad(loader, dependencies = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [version, setVersion] = useState(0);
  // Conservamos la función más reciente sin repetir la consulta cada vez que se dibuja el componente.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  useEffect(() => {
    // Cada consulta tiene su propia señal de cancelación y empieza sin los datos anteriores.
    const controller = new AbortController();
    setState({ data: null, loading: true, error: '' });
    loaderRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: '' });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ data: null, loading: false, error: errorMessage(error) });
      });
    // Al salir de la pantalla o cambiar la consulta, cancelamos la anterior.
    // Arriba también revisamos la señal para no aplicar una respuesta que ya no corresponde.
    return () => controller.abort();
  }, [...dependencies, version]);
  // Al cambiar version hacemos que el efecto vuelva a consultar, incluso con los mismos filtros.
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { ...state, reload };
}
