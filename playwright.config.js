import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90000,
  // Ejecutamos las pruebas una a una porque trabajan con registros en la API real.
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
    channel: process.env.BROWSER_CHANNEL || 'msedge',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
  },
  // Playwright inicia el frontend para la prueba; la API debe estar encendida previamente.
  webServer: {
    command: 'npm start',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
