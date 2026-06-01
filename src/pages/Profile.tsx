import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Order } from '../types';
import { formatPrice, formatDate } from '../lib/utils';
import { usePageTitle } from '../hooks/usePageTitle';
import PageLoader from '../components/PageLoader';
import './Profile.css';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'În așteptare', color: '#92600A', bg: '#FEF3C7' },
  PAID:      { label: 'Plătită',      color: '#14532D', bg: '#DCFCE7' },
  SHIPPED:   { label: 'Expediată',    color: '#1D4ED8', bg: '#DBEAFE' },
  DELIVERED: { label: 'Livrată',      color: '#14532D', bg: '#DCFCE7' },
  CANCELLED: { label: 'Anulată',      color: '#991B1B', bg: '#FEE2E2' },
};

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  usePageTitle('Profilul Meu');

  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [orders, setOrders]         = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);

  // Settings state
  const [editName, setEditName]           = useState('');
  const [editEmail, setEditEmail]         = useState('');
  const [editPw, setEditPw]               = useState('');
  const [editPwConfirm, setEditPwConfirm] = useState('');
  const [showPw, setShowPw]               = useState(false);
  const [saveLoading, setSaveLoading]     = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState<string | null>(null);
  const [saveError, setSaveError]         = useState<string | null>(null);

  useEffect(() => {
    if (profile) setEditName(profile.full_name ?? '');
    if (user)    setEditEmail(user.email ?? '');
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;
    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      setOrders((data as Order[]) ?? []);
      setLoading(false);
    }
    fetchOrders();
  }, [user]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  async function handleSaveProfile() {
    setSaveLoading(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      if (editName.trim() !== profile?.full_name) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: editName.trim() })
          .eq('id', user!.id);
        if (error) throw new Error(error.message);
      }
      if (editEmail.trim() !== user?.email) {
        const { error } = await supabase.auth.updateUser({ email: editEmail.trim() });
        if (error) throw new Error(error.message);
      }
      if (editPw) {
        if (editPw.length < 6) throw new Error('Parola trebuie să aibă minim 6 caractere.');
        if (editPw !== editPwConfirm) throw new Error('Parolele nu coincid.');
        const { error } = await supabase.auth.updateUser({ password: editPw });
        if (error) throw new Error(error.message);
        setEditPw('');
        setEditPwConfirm('');
      }
      setSaveSuccess('Datele au fost salvate cu succes!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Eroare necunoscută');
    }
    setSaveLoading(false);
  }

  return (
    <div className="profile-page">
      {/* Header profil */}
      <div className="profile-hero">
        <div className="profile-avatar">
          {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="profile-name">{profile?.full_name || 'Utilizator'}</h1>
          <p className="profile-email">{user?.email}</p>
          <span className={`profile-role ${profile?.role === 'editor' ? 'profile-role--editor' : ''}`}>
            {profile?.role === 'editor' ? '✦ Editor' : 'Utilizator'}
          </span>
        </div>
        <button className="btn-danger profile-signout" onClick={handleSignOut}>
          Deconectare
        </button>
      </div>

      {/* Tab-uri */}
      <div className="profile-tabs">
        <button className={`profile-tab ${activeTab === 'orders' ? 'profile-tab--active' : ''}`} onClick={() => setActiveTab('orders')}>
          📦 Comenzile mele
        </button>
        <button className={`profile-tab ${activeTab === 'settings' ? 'profile-tab--active' : ''}`} onClick={() => setActiveTab('settings')}>
          ⚙️ Setări cont
        </button>
      </div>

      {/* Tab Comenzi */}
      {activeTab === 'orders' && (
        <div className="profile-section">
          <h2 className="profile-section-title">Istoricul comenzilor</h2>
          {loading ? (
            <PageLoader message="Se încarcă comenzile..." />
          ) : orders.length === 0 ? (
            <div className="profile-empty">
              <p>Nu ai plasate nicio comandă încă.</p>
              <Link to="/" className="btn-primary">Explorează catalogul</Link>
            </div>
          ) : (
            <div className="profile-orders">
              {orders.map(order => {
                const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.PENDING;
                const isExpanded = expandedId === order.id;
                return (
                  <div key={order.id} className="profile-order-card">
                    <div className="profile-order-header" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                      <div className="profile-order-meta">
                        <span className="profile-order-id">#{order.id.slice(0,8).toUpperCase()}</span>
                        <span className="profile-order-date">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="profile-order-right">
                        <span className="profile-order-status" style={{ color: statusInfo.color, background: statusInfo.bg }}>
                          {statusInfo.label}
                        </span>
                        <span className="profile-order-total">{formatPrice(order.total)}</span>
                        <span className="profile-order-toggle">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {isExpanded && order.items && (
                      <div className="profile-order-body">
                        <div className="profile-order-shipping">
                          <span className="profile-shipping-label">📦 Livrare la:</span>
                          <span>{order.shipping_name} · {order.shipping_city} · {order.shipping_phone}</span>
                        </div>
                        <div className="profile-order-items">
                          {order.items.map(item => (
                            <div key={item.id} className="profile-order-item">
                              <span className="poi-name">{item.parfum_name}</span>
                              <span className="poi-qty">× {item.quantity}</span>
                              <span className="poi-price">{formatPrice(item.unit_price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Setări */}
      {activeTab === 'settings' && (
        <div className="profile-settings">
          {saveSuccess && <div className="profile-alert profile-alert--success">{saveSuccess}</div>}
          {saveError   && <div className="profile-alert profile-alert--error">{saveError}</div>}

          <div className="profile-settings-card">
            <h3 className="profile-settings-title">Informații personale</h3>
            <div className="profile-field">
              <label className="profile-field-label">Nume complet</label>
              <input className="profile-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Numele tău" />
            </div>
            <div className="profile-field">
              <label className="profile-field-label">Adresă email</label>
              <input className="profile-input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="email@exemplu.com" />
              <span className="profile-field-hint">La schimbarea email-ului vei primi un link de confirmare.</span>
            </div>
          </div>

          <div className="profile-settings-card">
            <h3 className="profile-settings-title">Schimbă parola</h3>
            <p className="profile-settings-hint">Lasă gol dacă nu vrei să schimbi parola.</p>
            <div className="profile-field">
              <label className="profile-field-label">Parolă nouă</label>
              <div className="profile-pw-wrap">
                <input className="profile-input" type={showPw ? 'text' : 'password'} value={editPw} onChange={e => setEditPw(e.target.value)} placeholder="Minim 6 caractere" />
                <button type="button" className="profile-eye-btn" onClick={() => setShowPw(p => !p)}>{showPw ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div className="profile-field">
              <label className="profile-field-label">Confirmă parola nouă</label>
              <input className="profile-input" type={showPw ? 'text' : 'password'} value={editPwConfirm} onChange={e => setEditPwConfirm(e.target.value)} placeholder="Repetă parola" />
            </div>
          </div>

          <div className="profile-settings-footer">
            <button className="btn-primary" onClick={handleSaveProfile} disabled={saveLoading} style={{ padding: '12px 28px', fontSize: '12px' }}>
              {saveLoading ? 'Se salvează...' : 'Salvează modificările'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
