import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setLastPortal } from '../../utils/portal';
import Modal from '../ui/Modal';
import ProfileSettingsModal from '../ui/ProfileSettingsModal';
import { IconGear, IconImport, IconOverview, IconPatients, IconReports } from '../icons/NavIcons';

const userNav = [
  { to: '/dashboard', label: 'Overview', icon: IconOverview },
  { to: '/reports', label: 'Report history', icon: IconReports },
];

const adminNav = [
  { to: '/admin', label: 'Overview', end: true, icon: IconOverview },
  { to: '/admin/users', label: 'Patients', icon: IconPatients },
  { to: '/admin/upload', label: 'Import data', icon: IconImport },
];

const SIDEBAR_KEY = 'wellpath_sidebar_collapsed';

export default function AppShell({ variant = 'user', children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === '1');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const nav = variant === 'admin' ? adminNav : userNav;
  const portal = variant === 'admin' ? 'admin' : 'patient';

  const displayName = user?.displayName || user?.fullName || user?.email;

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    setLastPortal(portal);
  }, [portal]);

  const confirmLogout = () => {
    setLogoutOpen(false);
    setLastPortal(portal);
    logout();
    navigate(`/login?portal=${portal}`);
  };

  const shellClass = [
    'shell',
    `shell--${variant}`,
    menuOpen ? 'shell--menu-open' : '',
    collapsed ? 'shell--collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass}>
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
        <div className="shell__sidebar-top">
          <Link to="/" className="brand brand--link" onClick={() => setMenuOpen(false)} title="Wellpath">
            <span className="brand__mark" aria-hidden="true" />
            <div className="brand__text">
              <span className="brand__name">Wellpath</span>
              <span className="brand__tag">Health intelligence</span>
            </div>
          </Link>
          <button
            type="button"
            className="shell__collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {collapsed ? (
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>

        <nav className="shell__nav">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
              >
                <span className="nav-link__icon">
                  <Icon />
                </span>
                <span className="nav-link__label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="shell__footer">
          <div className="user-chip">
            {collapsed ? (
              <button
                type="button"
                className="user-chip__avatar"
                onClick={() => setSettingsOpen(true)}
                aria-label="Account settings"
              >
                {displayName.charAt(0).toUpperCase()}
              </button>
            ) : (
              <span className="user-chip__avatar">{displayName.charAt(0).toUpperCase()}</span>
            )}
            <div className="user-chip__meta">
              <span className="user-chip__name" title={displayName}>{displayName}</span>
              <span className="user-chip__role">{user?.role === 'ADMIN' ? 'Administrator' : 'Member'}</span>
            </div>
            {!collapsed && (
              <button
                type="button"
                className="user-chip__settings"
                onClick={() => setSettingsOpen(true)}
                aria-label="Account settings"
                title="Settings"
              >
                <IconGear />
              </button>
            )}
          </div>
          <button type="button" className="btn btn--ghost btn--sm shell__signout" onClick={() => setLogoutOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Sign out</span>
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

      <ProfileSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Sign out?"
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setLogoutOpen(false)}>
              Stay signed in
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={confirmLogout}>
              Sign out
            </button>
          </>
        }
      >
        <p className="modal__text">
          {variant === 'admin'
            ? "You'll return to the admin sign-in screen. Your session will end immediately."
            : "You'll return to the patient sign-in screen. Your session will end immediately."}
        </p>
      </Modal>
    </div>
  );
}
