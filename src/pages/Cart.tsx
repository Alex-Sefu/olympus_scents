import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../lib/utils';
import './Cart.css';

export default function Cart() {
  const { items, total, loading, removeItem, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/signin');
    return null;
  }

  if (loading) return (
    <div className="cart-loading"><div className="cart-spinner" /></div>
  );

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="cart-title">Coșul tău</h1>
        <p className="cart-subtitle">
          {items.length === 0 ? 'Coșul este gol.' : `${items.length} produs${items.length > 1 ? 'e' : ''} în coș`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <p>Nu ai niciun produs în coș.</p>
          <Link to="/" className="btn-primary">Explorează catalogul</Link>
        </div>
      ) : (
        <div className="cart-layout">

          {/* Lista produse */}
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">

                {/* Imagine */}
                <div className="cart-item-img">
                  {item.parfum?.image_url
                    ? <img src={item.parfum.image_url} alt={item.parfum.nume_parfum} />
                    : <span className="cart-item-mono">
                        {item.parfum?.brand?.charAt(0) ?? '?'}
                      </span>
                  }
                </div>

                {/* Info */}
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.parfum?.nume_parfum}</h3>
                  <p className="cart-item-brand">{item.parfum?.brand}</p>
                  {item.parfum?.tip_parfum && (
                    <span className="cart-item-tip">{item.parfum.tip_parfum}</span>
                  )}
                  <p className="cart-item-price-unit">
                    {formatPrice(item.parfum?.pret ?? 0)} / buc.
                  </p>
                </div>

                {/* Cantitate */}
                <div className="cart-item-qty">
                  <button
                    className="cart-qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >−</button>
                  <span className="cart-qty-val">{item.quantity}</span>
                  <button
                    className="cart-qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= (item.parfum?.stoc ?? 99)}
                  >+</button>
                </div>

                {/* Subtotal */}
                <div className="cart-item-subtotal">
                  {formatPrice((item.parfum?.pret ?? 0) * item.quantity)}
                </div>

                {/* Elimină */}
                <button
                  className="cart-item-remove btn-danger"
                  onClick={() => removeItem(item.id)}
                  title="Elimină din coș"
                >
                  ✕
                </button>

              </div>
            ))}
          </div>

          {/* Sumar comandă */}
          <div className="cart-summary">
            <h2 className="cart-summary-title">Sumar comandă</h2>

            <div className="cart-summary-rows">
              {items.map(item => (
                <div key={item.id} className="cart-summary-row">
                  <span>{item.parfum?.nume_parfum} × {item.quantity}</span>
                  <span>{formatPrice((item.parfum?.pret ?? 0) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span>Total</span>
              <span className="cart-total-val">{formatPrice(total)}</span>
            </div>

            <div className="cart-summary-shipping">
              🚚 Livrare gratuită pentru comenzi peste 300 RON
            </div>

            <button
              className="btn-primary cart-checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Continuă spre checkout →
            </button>

            <Link to="/" className="btn-secondary cart-continue-btn">
              ← Continuă cumpărăturile
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
