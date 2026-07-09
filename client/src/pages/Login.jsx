import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';

const PORTAL_META = {
  patient: { title: 'Patient portal', sub: 'View your reports, trends, and wellness score' },
  admin: { title: 'Admin portal', sub: 'Manage patients, imports, and platform operations' },
};

export default function Login() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const portal = params.get('portal') === 'admin' ? 'admin' : 'patient';
  const meta = PORTAL_META[portal];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (portal === 'admin') {
      setEmail('admin@healthapp.com');
      setPassword('admin123');
    } else {
      setEmail('user1@example.com');
      setPassword('password123');
    }
  }, [portal]);

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast(`Welcome back, ${u.fullName || u.email}`, 'success');
      navigate(u.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast(err.message || 'Sign in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page login-page--compact">
      <div className="login-page__form login-page__form--solo">
        <Link to="/" className="login-form__back">← Back to home</Link>
        <form className="login-form" onSubmit={handleSubmit}>
          <p className="login-form__portal">{meta.title}</p>
          <h2 className="login-form__title">Sign in</h2>
          <p className="login-form__sub">{meta.sub}</p>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              type="email"
              className="field__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Continue'}
          </button>

          <p className="login-form__switch">
            {portal === 'patient' ? (
              <>Care team? <Link to="/login?portal=admin">Admin sign in</Link></>
            ) : (
              <>Patient? <Link to="/login?portal=patient">Patient sign in</Link></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
