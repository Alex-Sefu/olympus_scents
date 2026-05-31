import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true); setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {success ? (
          <>
            <div className="auth-success-icon">✓</div>
            <h2 className="auth-title">Email trimis!</h2>
            <p className="auth-subtitle">
              Verifică căsuța de email pentru linkul de resetare a parolei.
            </p>
            <Link to="/signin" className="auth-btn" style={{ display:'block', textAlign:'center', textDecoration:'none' }}>
              Înapoi la login
            </Link>
          </>
        ) : (
          <>
            <h1 className="auth-title">Resetare parolă</h1>
            <p className="auth-subtitle">
              Introdu adresa de email și îți trimitem un link de resetare.
            </p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemplu.com"
                required
              />
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Se trimite...' : 'Trimite linkul de resetare'}
              </button>
            </form>
            <p className="auth-footer">
              <Link to="/signin" className="auth-link">← Înapoi la login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
