import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

const links = [
  ['about', 'About'],
  ['menu', 'Menu'],
  ['inspiration', 'Inspiration'],
  ['reserve', 'Reserve'],
  ['contact', 'Contact'],
];

export default function Navbar({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const { count, setOpen: openCart } = useCart();

  return (
    <header className="site-header" id="top">
      <nav className="nav container" aria-label="Main">
        <a href="#top" className="brand">Bella<span>Vista</span></a>
        <div className="nav-actions">
          <button className="cart-btn" onClick={() => openCart(true)} aria-label={`Open cart, ${count} items`}>
            🛒{count > 0 && <span className="badge">{count}</span>}
          </button>
          <button
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="navLinks"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
        <ul className={`nav-links${open ? ' open' : ''}`} id="navLinks">
          {links.map(([id, label]) => (
            <li key={id}><a href={`#${id}`} onClick={() => setOpen(false)}>{label}</a></li>
          ))}
          <li>
            <button className="theme-btn" onClick={onToggleTheme} aria-label="Switch colour theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
