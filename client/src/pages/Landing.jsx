import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const features = [
  {
    title: 'Track your health',
    desc: 'Every lab report in one place — hemoglobin, glucose, lipids, and more, always up to date.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19h16M6 16l3-5 4 3 5-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'See trends over time',
    desc: 'Spot patterns across visits. Understand whether your numbers are improving, stable, or drifting.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 18V6M20 18V10M12 18V4" strokeLinecap="round" />
        <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="20" cy="10" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Plain-language insights',
    desc: 'Turn complex lab values into clear summaries you can actually act on — without a medical degree.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3c-2 4-6 5-6 10a6 6 0 1 0 12 0c0-5-4-6-6-10z" strokeLinejoin="round" />
        <path d="M12 11v4M12 8h.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Landing() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true" />
          <div>
            <span className="brand__name">Wellpath</span>
            <span className="brand__tag">Health intelligence</span>
          </div>
        </div>
        <div className="landing__nav-actions">
          <Link to="/login?portal=patient" className="btn btn--text">Patient sign in</Link>
          <Link to="/login?portal=admin" className="btn btn--primary btn--sm">Admin portal</Link>
        </div>
      </header>

      <section className="landing__hero">
        <div className="landing__hero-copy">
          <p className="landing__eyebrow">Health · Lifestyle · Wellness</p>
          <h1 className="landing__title">
            A unified health record and insight platform for patients and care teams
          </h1>
          <p className="landing__lead">
            Wellpath brings lab history, trend analysis, and plain-language interpretation
            into one calm, readable experience — built for real people, not data scientists.
          </p>
          <div className="landing__cta">
            <Link to="/login?portal=patient" className="btn btn--primary btn--lg">
              Patient login
            </Link>
            <Link to="/login?portal=admin" className="btn btn--outline btn--lg">
              Admin login
            </Link>
          </div>
        </div>

        <div className="landing__hero-visual" aria-hidden="true">
          <div className="landing__preview">
            <div className="landing__preview-bar">
              <span /><span /><span />
            </div>
            <div className="landing__preview-body">
              <div className="landing__preview-score">82</div>
              <div className="landing__preview-lines">
                <span /><span /><span />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__features">
        {features.map((f) => (
          <article key={f.title} className="landing__feature">
            <div className="landing__feature-icon">{f.icon}</div>
            <h2>{f.title}</h2>
            <p>{f.desc}</p>
          </article>
        ))}
      </section>

      <footer className="landing__footer">
        <p>Wellpath · Healthcare dashboard assessment · Built with care for clarity</p>
      </footer>
    </div>
  );
}
