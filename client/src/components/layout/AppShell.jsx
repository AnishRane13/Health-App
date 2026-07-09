import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const userNav = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/reports', label: 'Report history' },
];

const adminNav = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Patients' },
  { to: '/admin/upload', label: 'Import data' },
];

export default function AppShell({ variant = 'user', children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = variant === 'admin' ? adminNav : userNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`shell shell--${variant}${menuOpen ? ' shell--menu-open' : ''}`}>
      <button
        type="button"
        className="shell__menu-btn"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>

      {menuOpen && (
        <button
          type="button"
          className="shell__backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className="shell__sidebar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true" />
          <div>
            <span className="brand__name">Wellpath</span>
            <span className="brand__tag">Health intelligence</span>
          </div>
        </div>

        <nav className="shell__nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="shell__footer">
          <div className="user-chip">
            <span className="user-chip__avatar">
              {(user?.fullName || user?.email || '?').charAt(0).toUpperCase()}
            </span>
            <div className="user-chip__meta">
              <span className="user-chip__name">{user?.fullName || user?.email}</span>
              <span className="user-chip__role">{user?.role === 'ADMIN' ? 'Administrator' : 'Member'}</span>
            </div>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="shell__main">
        <header className="shell__header">
          <div>
            {variant === 'admin' ? (
              <Link to="/admin" className="header-eyebrow">Administration</Link>
            ) : (
              <span className="header-eyebrow">Your health</span>
            )}
          </div>
        </header>
        <main className="shell__content">{children}</main>
      </div>
    </div>
  );
}
