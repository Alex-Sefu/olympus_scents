import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import './Auth.css';

export default function SignUp() {
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  usePageTitle('Creare Cont');

  const [fullName, setFullName]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);
  const [loading, setLoading]           = useState(false);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError('Parolele nu coincid.'); return; }
    if (password.length < 6)  { setError('Parola trebuie să aibă cel puțin 6 caractere.'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) { setError(error); setLoading(false); }
    else setSuccess(true);
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-success-icon">✓</div>
          <h1 className="auth-title">Cont creat!</h1>
          <p className="auth-subtitle">
            Verifică-ți email-ul pentru a confirma contul, apoi te poți autentifica.
          </p>
          <Link to="/signin" className="auth-btn">Mergi la Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-tabs">
          <Link to="/signin" className="auth-tab">Login</Link>
          <Link to="/signup" className="auth-tab active">Sign Up</Link>
        </div>

        <h1 className="auth-title">Creare cont</h1>
        <p className="auth-subtitle">Completează datele pentru a te înregistra.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Nume complet</label>
          <input
            type="text"
            className="auth-input"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Ion Popescu"
            required
          />

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
              placeholder="Minim 6 caractere"
              required
              autoComplete="new-password"
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

          <label className="auth-label">Confirmă parola</label>
          <div className="auth-field-wrap">
            <input
              type={showConfirm ? 'text' : 'password'}
              className="auth-input"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repetă parola"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowConfirm(p => !p)}
              tabIndex={-1}
              aria-label={showConfirm ? 'Ascunde parola' : 'Arată parola'}
            >
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Se creează contul...' : 'Înregistrare'}
          </button>
        </form>

        <div className="auth-footer">
          Ai deja cont?{' '}
          <Link to="/signin" className="auth-link">Autentifică-te</Link>
        </div>
      </div>
    </div>
  );
}
