import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Package,
  Users,
  Truck,
  Receipt,
  Leaf,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { money, date } from '../config/resources';
import { useLoad } from '../hooks/useLoad';
import { Feedback } from '../components/UI';
export default function Dashboard() {
  const state = useLoad(async (signal) => {
    // Consultamos los cuatro recursos al mismo tiempo y los agrupamos por nombre para el resumen.
    const keys = ['products', 'users', 'providers', 'sales'];
    const data = await Promise.all(keys.map((key) => api.list(key, signal)));
    return Object.fromEntries(keys.map((key, index) => [key, data[index]]));
  }, []);
  const data = state.data;
  // Para esta alerta tomamos como existencias bajas cinco unidades o menos.
  const low = data?.products.filter((product) => product.stock <= 5) || [];
  return (
    <>
      <header className="page-heading">
        <div>
          <div className="eyebrow">TU OPERACIÓN, EN UN SOLO LUGAR</div>
          <h1>
            Resumen general<span className="heading-dot">.</span>
          </h1>
          <p>Una mirada clara a lo que sucede en tu supermercado.</p>
        </div>
        <button className="btn btn-light border" onClick={state.reload}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </header>
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="banner-label">
            <span className="status-dot" /> MARKETSOFT · GESTIÓN INTELIGENTE
          </span>
          <h2>
            Todo en orden.
            <br />
            Listo para crecer.
          </h2>
          <p>
            Cuida tu inventario, conecta con tus proveedores
            <br className="d-none d-md-block" /> y lleva el control de cada venta.
          </p>
          <Link className="btn btn-white" to="/sales">
            <Plus size={18} /> Gestionar ventas <ArrowRight size={18} />
          </Link>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-tile tile-back">
            <Leaf size={48} />
          </div>
          <div className="art-tile tile-front">
            <Package size={78} strokeWidth={1.2} />
            <div className="art-bars">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="art-label">
            <span className="status-dot" /> Cada detalle cuenta
          </div>
        </div>
      </section>
      <Feedback {...state} retry={state.reload} />
      <div className="stats-grid">
        {[
          ['products', 'Productos', Package, 'Referencias en inventario'],
          ['sales', 'Ventas', Receipt, 'Transacciones registradas'],
          ['providers', 'Proveedores', Truck, 'Aliados comerciales'],
          ['users', 'Usuarios', Users, 'Personas en el equipo'],
        ].map(([key, label, Icon, hint]) => (
          <Link className="stat-card" key={key} to={`/${key}`}>
            <div className="stat-top">
              <span className={`stat-icon ${key === 'sales' ? 'orange' : ''}`}>
                <Icon size={21} />
              </span>
              <ArrowUpRight size={17} />
            </div>
            <div className="stat-value">
              {data ? data[key].length : '—'}
              <span>{label}</span>
            </div>
            <p>{hint}</p>
          </Link>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="table-toolbar">
            <div>
              <h2>Últimas ventas</h2>
              <span className="text-secondary small">La actividad más reciente de tu negocio</span>
            </div>
            <Link className="text-link" to="/sales">
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Venta / fecha</th>
                  <th>Responsable</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {data?.sales
                  // Copiamos la lista antes de ordenar para no modificar los datos recibidos.
                  // Luego tomamos las cinco ventas más recientes.
                  .slice()
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5)
                  .map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <Link className="record-link" to={`/sales/${sale.id}`}>
                          Venta #{String(sale.id).padStart(3, '0')}
                        </Link>
                        <small className="d-block text-secondary">{date(sale.date)}</small>
                      </td>
                      <td>{sale.user?.name}</td>
                      <td className="text-end fw-semibold">{money(sale.total)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!data?.sales.length && (
            <div className="empty-state compact">
              <Receipt size={30} />
              <p>
                {data ? 'Tus próximas ventas aparecerán aquí.' : 'Esperando información de la API.'}
              </p>
            </div>
          )}
        </section>
        <section className="panel inventory-panel">
          <div className="table-toolbar">
            <div>
              <h2>Atención al inventario</h2>
              <span className="text-secondary small">Productos con 5 unidades o menos</span>
            </div>
            <span className="count-badge">{data ? low.length : '—'}</span>
          </div>
          {low.slice(0, 4).map((product) => (
            <div className="stock-row" key={product.id}>
              <span className="product-icon">
                <Package size={19} />
              </span>
              <div>
                <strong>{product.name}</strong>
                <small>{product.provider?.name}</small>
              </div>
              <span className="stock-badge low">{product.stock} uds.</span>
            </div>
          ))}
          {!low.length && (
            <div className="empty-state compact">
              <Package size={30} />
              <p>{data ? 'No hay alertas de existencias.' : 'Esperando información de la API.'}</p>
            </div>
          )}
          <Link className="inventory-link" to="/products">
            Revisar inventario <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <div className="tip">
        <span className="tip-icon">
          <Leaf size={21} />
        </span>
        <p>
          <strong>Un buen control empieza con pequeños detalles.</strong>
          <br />
          Mantén actualizados tus productos y proveedores para agilizar cada venta.
        </p>
        <span className="tip-tag">SINTAXIS & TIERRA</span>
      </div>
    </>
  );
}
