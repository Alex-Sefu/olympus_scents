import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import './Auth.css';

export default function SignIn() {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  usePageTitle('Autentificare');

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);
  const [attempts, setAttempts]         = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Verifică blocare temporară
    if (blockedUntil && Date.now() < blockedUntil) {
      const secs = Math.ceil((blockedUntil - Date.now()) / 1000);
      setError(`Prea multe încercări. Încearcă din nou în ${secs} secunde.`);
      return;
    }

    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setBlockedUntil(Date.now() + 30_000);
        setAttempts(0);
        setError('Prea multe încercări eșuate. Contul e blocat temporar 30 secunde.');
      } else {
        setError(`${error} (${5 - newAttempts} încercări rămase)`);
      }
      setLoading(false);
    } else {
      setAttempts(0);
      setBlockedUntil(null);
      navigate('/');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-tabs">
          <Link to="/signin" className="auth-tab active">Login</Link>
          <Link to="/signup" className="auth-tab">Sign Up</Link>
        </div>

        <h1 className="auth-title">Autentificare</h1>
        <p className="auth-subtitle">Introdu datele pentru a accesa magazinul privat.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Email</label>
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@exemplu.com"
            required
            autoComplete="email"
          />

          <label className="auth-label">Parolă</label>
          <div className="auth-field-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Parola ta"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword(p => !p)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '14px', marginTop: '-4px' }}>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '12px' }}>
              Ai uitat parola?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading || !!(blockedUntil && Date.now() < blockedUntil)}
          >
            {loading ? 'Se conectează...' : 'Conectare'}
          </button>
        </form>

        <div className="auth-footer">
          Nu ai cont?{' '}
          <Link to="/signup" className="auth-link">Înregistrează-te</Link>
        </div>
      </div>
    </div>
  );
}
