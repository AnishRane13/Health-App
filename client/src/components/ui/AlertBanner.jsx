export default function AlertBanner({ variant = 'info', children, action }) {
  return (
    <div className={`alert-banner alert-banner--${variant}`} role="status">
      <span className="alert-banner__icon" aria-hidden="true" />
      <p className="alert-banner__text">{children}</p>
      {action && <div className="alert-banner__action">{action}</div>}
    </div>
  );
}
