import { Link } from 'react-router-dom';
import { COLLECTIONS } from '../data/collections';
import { usePageTitle } from '../hooks/usePageTitle';
import './CollectionsPage.css';

function getGodSymbol(id: string): string {
  const symbols: Record<string, string> = {
    artemis: '🌙',
    poseidon: '🔱',
    dionysos: '🍇',
    zeus: '⚡',
  };
  return symbols[id] ?? '✦';
}

export default function CollectionsPage() {
  usePageTitle('Colecțiile Olimpului');
  return (
    <div className="cp-page">

      {/* Header */}
      <header className="cp-header">
        <p className="cp-eyebrow">Parfumerie Privat</p>
        <h1 className="cp-title">Colecțiile Olimpului</h1>
        <p className="cp-subtitle">
          Patru anotimpuri, patru zei, patru esențe. Alege sezonul care rezonează cu tine.
        </p>
      </header>

      {/* Grid colecții */}
      <div className="cp-grid">
        {COLLECTIONS.map((col) => (
          <Link
            key={col.id}
            to={`/collections/${col.id}`}
            className="cp-card"
            style={{
              '--col-from':   col.color_from,
              '--col-to':     col.color_to,
              '--col-accent': col.color_accent,
              '--col-text':   col.text_color,
            } as React.CSSProperties}
          >
            {/* Fundal gradient */}
            <div className="cp-card-bg" />

            {/* Conținut */}
            <div className="cp-card-body">
              <div className="cp-card-season-row">
                <span className="cp-card-emoji">{col.emoji}</span>
                <span className="cp-card-season">{col.season}</span>
              </div>

              <div className="cp-god-avatar">
                <span className="cp-god-symbol">{getGodSymbol(col.id)}</span>
              </div>

              <h2 className="cp-card-god">{col.god}</h2>
              <p className="cp-card-tagline">{col.tagline}</p>

              <div className="cp-card-vibe">
                {col.vibe.split(' · ').map(v => (
                  <span key={v} className="cp-vibe-pill">{v}</span>
                ))}
              </div>

              <div className="cp-card-footer">
                <span className="cp-card-count">
                  {col.parfumuri.length} parfumuri
                </span>
                <span className="cp-card-cta">
                  Descoperă →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Separator decorativ */}
      <div className="cp-divider">
        <span className="cp-divider-text">☿ Olimpul te așteaptă ☿</span>
      </div>

    </div>
  );
}
