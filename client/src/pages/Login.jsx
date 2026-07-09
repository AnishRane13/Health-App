import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      navigate(u.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@healthapp.com');
      setPassword('admin123');
    } else {
      setEmail('user1@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__hero">
        <div className="login-hero__content">
          <span className="brand__mark brand__mark--lg" aria-hidden="true" />
          <h1 className="login-hero__title">Wellpath</h1>
          <p className="login-hero__lead">
            Your health data, interpreted clearly. Track lab results over time and understand what
            they mean for your wellbeing.
          </p>
          <ul className="login-hero__points">
            <li>Personalised report history</li>
            <li>Trend tracking across key metrics</li>
            <li>Plain-language health insights</li>
          </ul>
        </div>
        <div className="login-hero__pattern" aria-hidden="true" />
      </div>

      <div className="login-page__form">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-form__title">Sign in</h2>
          <p className="login-form__sub">Enter your credentials to access your portal</p>

          {error && <div className="alert alert--error">{error}</div>}

          <label className="field">
            <span className="field__label">Email</span>
            <input
              type="email"
              className="field__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              type="password"
              className="field__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Continue'}
          </button>

          <div className="login-form__demo">
            <span className="login-form__demo-label">Demo accounts</span>
            <div className="login-form__demo-btns">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => fillDemo('user')}>
                Patient
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => fillDemo('admin')}>
                Admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
