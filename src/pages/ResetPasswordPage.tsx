import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Auth.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Parolele nu coincid.'); return; }
    if (password.length < 6)  { setError('Parola trebuie să aibă minim 6 caractere.'); return; }
    setLoading(true); setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => navigate('/signin'), 2500);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {success ? (
          <>
            <div className="auth-success-icon">✓</div>
            <h2 className="auth-title">Parolă schimbată!</h2>
            <p className="auth-subtitle">Vei fi redirecționat la login în câteva secunde...</p>
          </>
        ) : (
          <>
            <h1 className="auth-title">Parolă nouă</h1>
            <p className="auth-subtitle">Alege o parolă nouă pentru contul tău.</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-label">Parolă nouă</label>
              <div className="auth-field-wrap">
                <input
                  className="auth-input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minim 6 caractere"
                  required
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Ascunde parola' : 'Arată parola'}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              <label className="auth-label">Confirmă parola</label>
              <div className="auth-field-wrap">
                <input
                  className="auth-input"
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repetă parola"
                  required
                />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Se salvează...' : 'Salvează parola nouă'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
