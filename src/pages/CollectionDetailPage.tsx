import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import type { Parfum } from '../types';
import { COLLECTIONS } from '../data/collections';
import { formatPrice, getInitial } from '../lib/utils';
import TagPill from '../components/TagPill';
import './CollectionDetailPage.css';

function getGodSymbol(id: string): string {
  return ({ artemis: '🌙', poseidon: '🔱', dionysos: '🍇', zeus: '⚡' } as Record<string, string>)[id] ?? '✦';
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isEditor } = useAuth();
  const { addItem, addingId } = useCart();

  const [parfumuri, setParfumuri] = useState<Parfum[]>([]);
  const [loading, setLoading]     = useState(true);

  const collection = COLLECTIONS.find(c => c.id === id);

  useEffect(() => {
    if (!collection) { navigate('/collections'); return; }
    fetchParfumuri();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchParfumuri() {
    setLoading(true);
    const { data } = await supabase
      .from('parfumuri')
      .select('*')
      .eq('colectie', id)
      .order('nume_parfum', { ascending: true });
    setParfumuri((data as Parfum[]) ?? []);
    setLoading(false);
  }

  if (!collection) return null;

  return (
    <div
      className="cdp-page"
      style={{
        '--col-from':   collection.color_from,
        '--col-to':     collection.color_to,
        '--col-accent': collection.color_accent,
        '--col-text':   collection.text_color,
      } as React.CSSProperties}
    >

      {/* Hero colecție */}
      <header className="cdp-hero">
        <div className="cdp-hero-bg" />
        <div className="cdp-hero-content">
          <Link to="/collections" className="cdp-back">
            ← Toate colecțiile
          </Link>

          <div className="cdp-hero-main">
            <div className="cdp-god-avatar-big">
              <span>{getGodSymbol(collection.id)}</span>
            </div>
            <div>
              <div className="cdp-season-row">
                <span className="cdp-emoji">{collection.emoji}</span>
                <span className="cdp-season">{collection.season}</span>
              </div>
              <h1 className="cdp-god-name">{collection.god}</h1>
              <p className="cdp-tagline">"{collection.tagline}"</p>
              <p className="cdp-description">{collection.description}</p>
              <div className="cdp-vibe-row">
                {collection.vibe.split(' · ').map(v => (
                  <span key={v} className="cdp-vibe-pill">{v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Parfumurile colecției */}
      <div className="cdp-body">
        <div className="cdp-section-header">
          <h2 className="cdp-section-title">
            Parfumurile colecției {collection.god}
          </h2>
          <span className="cdp-count">
            {loading ? '...' : `${parfumuri.length} parfumuri`}
          </span>
        </div>

        {loading ? (
          <div className="cdp-loading">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="cdp-skeleton" />
            ))}
          </div>
        ) : parfumuri.length === 0 ? (
          <div className="cdp-empty">
            <p>Niciun parfum asociat cu această colecție momentan.</p>
            {isEditor && (
              <p className="cdp-empty-hint">
                Poți asocia parfumuri din <Link to="/editor/dashboard">Dashboard Editor</Link>.
              </p>
            )}
          </div>
        ) : (
          <div className="cdp-grid">
            {parfumuri.map(parfum => {
              const isAdding = addingId === parfum.id;
              return (
                <article key={parfum.id} className="cdp-card">
                  {/* Imagine */}
                  <div className="cdp-card-img">
                    {parfum.image_url
                      ? <img src={parfum.image_url} alt={parfum.nume_parfum} loading="lazy" />
                      : <span className="cdp-card-mono">{getInitial(parfum.brand)}</span>
                    }
                    {parfum.tip_parfum && (
                      <span className="cdp-card-badge-tip">{parfum.tip_parfum}</span>
                    )}
                    {parfum.stoc === 0 && (
                      <div className="cdp-sold-out">Stoc epuizat</div>
                    )}
                    <span className="cdp-card-badge-god">
                      {getGodSymbol(collection.id)} {collection.god}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="cdp-card-body">
                    <h3 className="cdp-card-name">{parfum.nume_parfum}</h3>
                    <p className="cdp-card-brand">{parfum.brand}</p>

                    {parfum.note_varf && (
                      <div className="cdp-card-notes">
                        {parfum.note_varf.split(',').slice(0, 3).map(n => (
                          <TagPill key={n} label={n.trim()} variant="varf" />
                        ))}
                      </div>
                    )}

                    <div className="cdp-card-footer">
                      <span className="cdp-card-price">{formatPrice(parfum.pret)}</span>
                      <div className="cdp-card-actions">
                        <Link
                          to={`/perfume/${parfum.id}`}
                          className="btn-outline-blue cdp-btn"
                        >
                          Detalii
                        </Link>
                        {isAuthenticated && !isEditor && parfum.stoc > 0 && (
                          <button
                            className={`btn-outline-gold cdp-btn ${isAdding ? 'cdp-btn--loading' : ''}`}
                            onClick={() => addItem(parfum)}
                            disabled={isAdding}
                          >
                            {isAdding
                              ? <span className="cdp-btn-spinner" />
                              : '+ Coș'
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Link spre catalog complet */}
        <div className="cdp-catalog-link">
          <p>Vrei să explorezi întregul catalog?</p>
          <Link to="/" className="btn-primary">
            Vezi toate parfumurile
          </Link>
        </div>
      </div>

    </div>
  );
}
