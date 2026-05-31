import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Order } from '../types';
import { formatPrice, formatDate } from '../lib/utils';
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

  const [orders, setOrders]         = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);

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

      {/* Istoricul comenzilor */}
      <div className="profile-section">
        <h2 className="profile-section-title">Istoricul comenzilor</h2>

        {loading ? (
          <div className="profile-loading"><div className="cart-spinner" /></div>
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
                  <div
                    className="profile-order-header"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="profile-order-meta">
                      <span className="profile-order-id">
                        #{order.id.slice(0,8).toUpperCase()}
                      </span>
                      <span className="profile-order-date">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="profile-order-right">
                      <span
                        className="profile-order-status"
                        style={{ color: statusInfo.color, background: statusInfo.bg }}
                      >
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
    </div>
  );
}
