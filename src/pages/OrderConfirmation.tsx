import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';
import { formatPrice, formatDate } from '../lib/utils';
import { usePageTitle } from '../hooks/usePageTitle';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  usePageTitle('Comandă Confirmată');

  useEffect(() => {
    if (!id) return;
    async function fetchOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .single();
      setOrder(data as Order);
      setLoading(false);
    }
    fetchOrder();
  }, [id]);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div className="cart-spinner" />
    </div>
  );

  if (!order) return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <p>Comanda nu a fost găsită.</p>
      <Link to="/" className="btn-primary" style={{ marginTop:'20px', display:'inline-flex' }}>Acasă</Link>
    </div>
  );

  return (
    <div className="confirm-page">
      <div className="confirm-icon">✓</div>
      <h1 className="confirm-title">Comandă plasată cu succes!</h1>
      <p className="confirm-sub">
        Îți mulțumim pentru comandă. Vei primi un email de confirmare în scurt timp.
      </p>

      <div className="confirm-card">
        <div className="confirm-meta">
          <div className="confirm-meta-item">
            <span className="confirm-meta-label">Număr comandă</span>
            <span className="confirm-meta-val">#{order.id.slice(0,8).toUpperCase()}</span>
          </div>
          <div className="confirm-meta-item">
            <span className="confirm-meta-label">Data</span>
            <span className="confirm-meta-val">{formatDate(order.created_at)}</span>
          </div>
          <div className="confirm-meta-item">
            <span className="confirm-meta-label">Status</span>
            <span className="confirm-status">{order.status}</span>
          </div>
          <div className="confirm-meta-item">
            <span className="confirm-meta-label">Total</span>
            <span className="confirm-total">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="confirm-divider" />

        <div className="confirm-shipping">
          <h3 className="confirm-section-lbl">Adresă livrare</h3>
          <p>{order.shipping_name}</p>
          <p>{order.shipping_address}</p>
          <p>{order.shipping_city}, {order.shipping_postal_code}</p>
          <p>{order.shipping_phone}</p>
        </div>

        {order.items && order.items.length > 0 && (
          <>
            <div className="confirm-divider" />
            <h3 className="confirm-section-lbl">Produse comandate</h3>
            <div className="confirm-items">
              {order.items.map(item => (
                <div key={item.id} className="confirm-item">
                  <span className="confirm-item-name">{item.parfum_name}</span>
                  <span className="confirm-item-qty">× {item.quantity}</span>
                  <span className="confirm-item-price">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="confirm-actions">
        <Link to="/profile" className="btn-secondary">Vezi toate comenzile</Link>
        <Link to="/" className="btn-primary">Continuă cumpărăturile</Link>
      </div>
    </div>
  );
}
