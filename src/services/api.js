import axios from 'axios';

// Dejamos la conexión en un solo lugar para reutilizarla desde todos los módulos.
// Si no configuramos otra dirección, usamos la API local de la actividad anterior.
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
});
// El primer data es la respuesta de Axios y el segundo es el contenido que devuelve nuestra API.
export const api = {
  async list(resource, signal) {
    return (await http.get(`/${resource}`, { signal })).data.data;
  },
  async get(resource, id, signal) {
    return (await http.get(`/${resource}/${id}`, { signal })).data.data;
  },
  async save(resource, values, id) {
    // Si recibimos un id, editamos con PUT; si no, creamos el registro con POST.
    return (await (id ? http.put(`/${resource}/${id}`, values) : http.post(`/${resource}`, values)))
      .data.data;
  },
  async remove(resource, id) {
    return (await http.delete(`/${resource}/${id}`)).data.data;
  },
};
// Primero mostramos la explicación del backend, por ejemplo si no hay suficientes existencias.
// Si no viene ese mensaje, revisamos si se agotó el tiempo o si hubo un problema de conexión.
export function errorMessage(error) {
  if (error.response?.data?.error?.message) return error.response.data.error.message;
  if (error.code === 'ECONNABORTED')
    return 'La API tardó demasiado en responder. Intenta nuevamente.';
  return 'No pudimos conectar con la API. Comprueba que el backend esté encendido y revisa la configuración de conexión.';
}
