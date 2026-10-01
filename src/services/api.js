import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
});
export const api = {
  async list(resource, signal) {
    return (await http.get(`/${resource}`, { signal })).data.data;
  },
  async get(resource, id, signal) {
    return (await http.get(`/${resource}/${id}`, { signal })).data.data;
  },
  async save(resource, values, id) {
    return (await (id ? http.put(`/${resource}/${id}`, values) : http.post(`/${resource}`, values)))
      .data.data;
  },
  async remove(resource, id) {
    return (await http.delete(`/${resource}/${id}`)).data.data;
  },
};
export function errorMessage(error) {
  if (error.response?.data?.error?.message) return error.response.data.error.message;
  if (error.code === 'ECONNABORTED')
    return 'La API tardó demasiado en responder. Intenta nuevamente.';
  return 'No pudimos conectar con la API. Comprueba que el backend esté encendido y revisa la configuración de conexión.';
}
