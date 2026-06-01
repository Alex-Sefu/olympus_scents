import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import type { Parfum } from '../types';
import { formatPrice, getInitial } from '../lib/utils';
import WishlistButton from '../components/WishlistButton';
import { usePageTitle } from '../hooks/usePageTitle';
import './WishlistPage.css';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlistIds } = useWishlist();
  const { addItem } = useCart();
  const [parfumuri, setParfumuri] = useState<Parfum[]>([]);
  const [loading, setLoading] = useState(true);
  usePageTitle('Favoritele Mele');

  useEffect(() => {
    if (!user || wishlistIds.size === 0) { setParfumuri([]); setLoading(false); return; }
    fetchWishlist();
  }, [user, wishlistIds]);

  async function fetchWishlist() {
    setLoading(true);
    const { data } = await supabase
      .from('parfumuri')
      .select('*')
      .in('id', [...wishlistIds]);
    setParfumuri((data as Parfum[]) ?? []);
    setLoading(false);
  }

  return (
    <div className="wl-page">
      <div className="wl-header">
        <h1 className="wl-title">Favoritele tale</h1>
        <p className="wl-subtitle">
          {parfumuri.length === 0 ? 'Nu ai salvat niciun parfum.' : `${parfumuri.length} parfumuri salvate`}
        </p>
      </div>

      {loading ? (
        <div className="wl-loading"><div className="wl-spinner" /></div>
      ) : parfumuri.length === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty-icon">♡</div>
          <p>Nu ai parfumuri favorite încă.</p>
          <Link to="/" className="btn-primary">Explorează catalogul</Link>
        </div>
      ) : (
        <div className="wl-grid">
          {parfumuri.map(p => (
            <article key={p.id} className="wl-card">
              <div className="wl-card-img">
                {p.image_url
                  ? <img src={p.image_url} alt={p.nume_parfum} />
                  : <span className="wl-mono">{getInitial(p.brand)}</span>
                }
                <div className="wl-card-wishlist">
                  <WishlistButton parfumId={p.id} size="sm" />
                </div>
                {p.tip_parfum && <span className="wl-badge-tip">{p.tip_parfum}</span>}
              </div>
              <div className="wl-card-body">
                <h3 className="wl-card-name">{p.nume_parfum}</h3>
                <p className="wl-card-brand">{p.brand}</p>
                <p className="wl-card-price">{formatPrice(p.pret)}</p>
                <div className="wl-card-actions">
                  <Link to={`/perfume/${p.id}`} className="btn-outline-blue wl-btn">Detalii</Link>
                  {p.stoc > 0 && (
                    <button className="btn-outline-gold wl-btn" onClick={() => addItem(p)}>
                      + Coș
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
