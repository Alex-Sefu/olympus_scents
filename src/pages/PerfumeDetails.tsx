import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import WishlistButton from '../components/WishlistButton';
import type { Parfum } from '../types';
import { formatPrice, splitNotes } from '../lib/utils';
import TagPill from '../components/TagPill';
import PerfumeCard from '../components/PerfumeCard';
import './PerfumeDetails.css';

export default function PerfumeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isEditor } = useAuth();
  const { addItem, addingId } = useCart();

  const [parfum, setParfum] = useState<Parfum | null>(null);
  const [similare, setSimilare] = useState<Parfum[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    fetchParfum();
  }, [id]);

  async function fetchParfum() {
    setLoading(true);
    const { data, error } = await supabase
      .from('parfumuri')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      navigate('/');
      return;
    }

    const p = data as Parfum;
    setParfum(p);
    fetchSimilare(p);
    setLoading(false);
  }

  async function fetchSimilare(p: Parfum) {
    const { data } = await supabase
      .from('parfumuri')
      .select('*')
      .eq('brand', p.brand)
      .neq('id', p.id)
      .limit(4);

    if (data) setSimilare(data as Parfum[]);
  }

  async function handleAddToCart() {
    if (!parfum) return;
    await addItem(parfum, qty);
  }

  if (loading) {
    return (
      <div className="details-loading">
        <div className="details-loading__spinner"></div>
      </div>
    );
  }

  if (!parfum) return null;

  const noteVarf = splitNotes(parfum.note_varf);
  const noteBaza = splitNotes(parfum.note_baza);

  return (
    <div className="details-page">
      {/* Header page */}
      <div className="details-header">
        <button
          className="details-back"
          onClick={() => navigate(-1)}
        >
          ← Înapoi la catalog
        </button>
      </div>

      {/* Main card */}
      <div className="details-card">
        {/* Image column */}
        <div className="details-image-col">
          {parfum.image_url ? (
            <img src={parfum.image_url} alt={parfum.nume_parfum} />
          ) : (
            <div className="details-image-mono">
              {parfum.brand.charAt(0).toUpperCase()}
            </div>
          )}
          {parfum.tip_parfum && (
            <div className="details-image-badge">{parfum.tip_parfum}</div>
          )}
        </div>

        {/* Info column */}
        <div className="details-info-col">
          <div>
            <h1 className="details-name">{parfum.nume_parfum}</h1>
            <p className="details-brand">{parfum.brand}</p>
          </div>

          {/* Price + stock */}
          <div className="details-price-box">
            <div className="details-price">{formatPrice(parfum.pret)}</div>
            <div className={`details-stoc details-stoc--${parfum.stoc > 0 ? 'in' : 'out'}`}>
              {parfum.stoc > 0 ? (
                <>&#10003; {parfum.stoc} în stoc</>
              ) : (
                <>Stoc epuizat</>
              )}
            </div>
          </div>

          {/* Meta grid */}
          <div className="details-meta-grid">
            {parfum.tip_parfum && (
              <div className="details-meta-item">
                <span className="details-meta-label">Tip parfum</span>
                <span className="details-meta-value">{parfum.tip_parfum}</span>
              </div>
            )}
            {parfum.creator && (
              <div className="details-meta-item">
                <span className="details-meta-label">Creator</span>
                <span className="details-meta-value">{parfum.creator}</span>
              </div>
            )}
            {parfum.anul_lansarii && (
              <div className="details-meta-item">
                <span className="details-meta-label">An lansare</span>
                <span className="details-meta-value">{parfum.anul_lansarii}</span>
              </div>
            )}
          </div>

          {/* Top notes */}
          {noteVarf.length > 0 && (
            <div className="details-notes">
              <span className="details-notes-label">Note de vârf</span>
              <div className="details-notes-pills">
                {noteVarf.map((n) => (
                  <TagPill key={n} label={n} variant="varf" />
                ))}
              </div>
            </div>
          )}

          {/* Base notes */}
          {noteBaza.length > 0 && (
            <div className="details-notes">
              <span className="details-notes-label">Note de bază</span>
              <div className="details-notes-pills">
                {noteBaza.map((n) => (
                  <TagPill key={n} label={n} variant="baza" />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="details-actions">
            {isAuthenticated && !isEditor && parfum.stoc > 0 && (
              <>
                <div className="details-qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(parfum.stoc, q + 1))}>+</button>
                </div>
                <button
                  className={`btn btn-gold details-cart-btn ${parfum && addingId === parfum.id ? 'btn-gold--loading' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!!(parfum && addingId === parfum.id)}
                >
                  {parfum && addingId === parfum.id
                    ? <span className="btn-gold-spinner" />
                    : 'Adaugă în coș'
                  }
                </button>
                <WishlistButton parfumId={parfum.id} size="md" />
              </>
            )}
            {!isAuthenticated && parfum.stoc > 0 && (
              <button
                className="btn btn-gold details-cart-btn"
                onClick={() => navigate('/signin')}
              >
                Autentificeă-te pentru a cumpăra
              </button>
            )}
            {isEditor && (
              <button
                className="btn btn-edit details-cart-btn"
                onClick={() => navigate(`/editor/edit/${parfum.id}`)}
              >
                Editează parfumul
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Similar perfumes */}
      {similare.length > 0 && (
        <section className="details-similare">
          <h2 className="details-similare-title">Din aceeași brand</h2>
          <div className="details-similare-grid">
            {similare.map((p) => (
              <PerfumeCard
                key={p.id}
                parfum={p}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
