import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  // Fijamos el puerto para coincidir con el origen que permite el backend.
  // Si está ocupado, Vite avisa en lugar de abrir el frontend en otro puerto.
  server: { port: 5173, strictPort: true },
  // Usamos un entorno que simula el DOM para probar los componentes sin abrir un navegador.
  test: { environment: 'jsdom', globals: true, include: ['tests/**/*.test.jsx'] },
});
