import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Receipt,
  Leaf,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ResourcePage from './pages/ResourcePage';
import SalePage from './pages/SalePage';
// Dejamos juntas la ruta, el nombre y el icono de cada opción del menú.
const navigation = [
  ['/', 'Resumen', LayoutDashboard],
  ['/products', 'Productos', Package],
  ['/users', 'Usuarios', Users],
  ['/providers', 'Proveedores', Truck],
  ['/sales', 'Ventas', Receipt],
];
export default function App() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title =
    navigation.find(([path]) =>
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path),
    )?.[1] || 'Página no encontrada';
  useEffect(() => {
    // Al cambiar de pantalla cerramos el menú móvil y actualizamos el título de la pestaña.
    setOpen(false);
    document.title = `${title} · MarketSoft`;
  }, [location.pathname, title]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Cerrar navegación"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Leaf size={25} />
          </span>
          <span>
            Market<span className="brand-green">Soft</span>
            <small>ADMINISTRACIÓN DEL SUPERMERCADO</small>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <div className="nav-label">ESPACIO DE TRABAJO</div>
        <nav aria-label="Navegación principal">
          {navigation.map(([path, label, Icon]) => (
            <NavLink
              end={path === '/'}
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
              {path === '/sales' && <ArrowUpRight size={15} className="ms-auto" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-badge">
            <span className="workspace-avatar">M</span>
            <div>
              <strong>MarketSoft</strong>
              <small>Gestión de supermercado</small>
            </div>
            <span className="status-dot" />
          </div>
          <small>Programación IV · Actividad II</small>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="mobile-menu icon-button"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <span className="breadcrumb-label">
              Espacio de trabajo <span>/</span> <strong>{title}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="edition">Supermercado</span>
            <span className="avatar" aria-label="MarketSoft">
              MS
            </span>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Reutilizamos la página de gestión. La key reinicia su estado al cambiar de recurso. */}
            {['products', 'users', 'providers', 'sales'].map((resource) => (
              <Route
                key={resource}
                path={`/${resource}`}
                element={<ResourcePage key={resource} resource={resource} />}
              />
            ))}
            <Route path="/sales/:id" element={<SalePage />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h1>Página no encontrada</h1>
                  <p>Esta dirección no existe en MarketSoft.</p>
                  <Link className="btn btn-primary" to="/">
                    Volver al resumen
                  </Link>
                </div>
              }
            />
          </Routes>
          <footer className="app-footer">
            <span>
              MarketSoft <span>© {new Date().getFullYear()}</span>
            </span>
            <span>Hecho para una gestión más simple.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
