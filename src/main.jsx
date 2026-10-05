import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
// Cargamos nuestros estilos después de Bootstrap para aplicar los ajustes de la interfaz.
import './styles.css';
import App from './App';
// Acá iniciamos React dentro del elemento root del HTML.
// BrowserRouter permite cambiar de pantalla usando las rutas de la aplicación.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
