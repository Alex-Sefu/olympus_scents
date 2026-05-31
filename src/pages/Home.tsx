import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Parfum } from '../types';
import { COLLECTIONS } from '../data/collections';
import { useHermes } from '../context/HermesContext';
import { HermesHeroSVG } from '../components/HermesAssistant';
import PerfumeCard from '../components/PerfumeCard';
import './Home.css';

const PAGE_SIZE = 8;

// Skeleton component for loading
function SkeletonCard() {
  return (
    <div className="skeleton">
      <div className="skeleton__image"></div>
      <div className="skeleton__body">
        <div className="skeleton__line skeleton__line--wide"></div>
        <div className="skeleton__line skeleton__line--medium"></div>
        <div className="skeleton__line skeleton__line--narrow"></div>
      </div>
    </div>
  );
}

const HERMES_MESSAGE = 'Salut! Sunt Hermes, asistentul tău virtual. Cunoasc fiecare parfum din colecție — spune-mi ce cauți și îți găsesc esența perfectă. ✨';

function HermesSpeechBubble({ onOpen }: { onOpen: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setDone(false);
    const timer = setInterval(() => {
      i++;
      setDisplayed(HERMES_MESSAGE.slice(0, i));
      if (i >= HERMES_MESSAGE.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, 28);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hermes-bubble">
      {/* Coadă bubble */}
      <div className="hermes-bubble__tail" />
      {/* Text cu cursor animat */}
      <p className="hermes-bubble__text">
        {displayed}
        {!done && <span className="hermes-bubble__cursor">|</span>}
      </p>
      {/* Buton răspunde — apare după ce textul e complet */}
      {done && (
        <button className="hermes-bubble__reply" onClick={onOpen}>
          Răspunde lui Hermes →
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [parfumuri, setParfumuri] = useState<Parfum[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [brand, setBrand] = useState('');
  const [creator, setCreator] = useState('');
  const [tip, setTip] = useState('');
  const [sortBy, setSortBy] = useState<'nou' | 'pret_asc' | 'pret_desc'>('nou');

  const fetchParfumuri = useCallback(async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('parfumuri')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (brand.trim()) query = query.ilike('brand', `%${brand.trim()}%`);
    if (creator.trim()) query = query.ilike('creator', `%${creator.trim()}%`);
    if (tip) query = query.eq('tip_parfum', tip);

    if (sortBy === 'pret_asc') query = query.order('pret', { ascending: true });
    else if (sortBy === 'pret_desc') query = query.order('pret', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (!error && data) {
      setParfumuri(data as Parfum[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, brand, creator, tip, sortBy]);

  useEffect(() => {
    fetchParfumuri();
  }, [fetchParfumuri]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [brand, creator, tip, sortBy]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const { setOpen: setHermesOpen } = useHermes();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero__content">
          <div className="home-hero__eyebrow">
            <span className="home-hero__eyebrow-line"></span>
            Colecția Olimp 2025
            <span className="home-hero__eyebrow-dot"></span>
          </div>
          <h1 className="home-hero__title">
            Parfumuri<br />demne de<br />
            <em>Nemuritori</em>
          </h1>
          <p className="home-hero__sub">
            Parfumuri de lux selectate din casele de creație cele mai renumite din lume.
          </p>
          <div className="home-hero__btns">
            <button
              className="home-hero__btn-primary"
              onClick={() => document.querySelector('.home-filters')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explorează catalogul
            </button>
          </div>
        </div>

        {/* Hermes + speech bubble */}
        <div className="home-hero__visual">
          <div className="home-hero__hermes-wrap">
            {/* Speech bubble */}
            <HermesSpeechBubble onOpen={() => setHermesOpen(true)} />

            {/* Figura Hermes */}
            <button
              className="home-hero__hermes-figure"
              onClick={() => setHermesOpen(true)}
              aria-label="Deschide chat cu Hermes"
            >
              <HermesHeroSVG size={290} />
              <div className="home-hero__hermes-label">
                <span className="home-hero__hermes-name">Hermes</span>
                <span className="home-hero__hermes-role">Mesagerul Olimpului · AI</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Colecții Olimp */}
      <section className="home-collections">
        <div className="home-collections-header">
          <h2 className="home-collections-title">Colecțiile Olimpului</h2>
          <Link to="/collections" className="home-collections-all">
            Vezi toate →
          </Link>
        </div>
        <div className="home-collections-row">
          {COLLECTIONS.map(col => (
            <Link
              key={col.id}
              to={`/collections/${col.id}`}
              className="home-col-chip"
              style={{
                '--chip-accent': col.color_accent,
                '--chip-bg':     col.color_from,
                '--chip-text':   col.text_color,
              } as React.CSSProperties}
            >
              <span className="home-col-chip-emoji">{col.emoji}</span>
              <span className="home-col-chip-god">{col.god}</span>
              <span className="home-col-chip-season">{col.season}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Filtre */}
      <section className="home-filters">
        <div className="home-filters__row">
          <input
            type="text"
            placeholder="Marca..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="home-filter-input"
          />
          <input
            type="text"
            placeholder="Creator..."
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            className="home-filter-input"
          />
          <select
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            className="home-filter-input"
          >
            <option value="">Toate tipurile</option>
            <option value="Parfum">Parfum</option>
            <option value="Eau de Parfum">Eau de Parfum</option>
            <option value="Eau de Toilette">Eau de Toilette</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="home-filter-input"
          >
            <option value="nou">Cele mai noi</option>
            <option value="pret_asc">Preț crescător</option>
            <option value="pret_desc">Preț descrescător</option>
          </select>
        </div>

        <div className="home-filters__meta">
          <span>{loading ? '...' : `${total} parfumuri găsite`}</span>
          {(brand || creator || tip) && (
            <button
              className="home-filters__clear"
              onClick={() => { setBrand(''); setCreator(''); setTip(''); }}
            >
              Resetează filtrele ×
            </button>
          )}
        </div>
      </section>

      {/* Grid produse */}
      <div className="home-grid">
        {loading ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
        ) : parfumuri.length === 0 ? (
          <div className="home-empty">
            <p>Niciun parfum găsit pentru filtrele selectate.</p>
            <button
              className="home-filters__clear"
              onClick={() => { setBrand(''); setCreator(''); setTip(''); }}
            >
              Resetează filtrele
            </button>
          </div>
        ) : (
          parfumuri.map((p) => (
            <PerfumeCard
              key={p.id}
              parfum={p}
            />
          ))
        )}
      </div>

      {/* Paginare */}
      {totalPages > 1 && (
        <div className="home-pagination">
          <button
            className="btn btn-outline"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
          >
            ← Anterior
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`pagination-num ${i === page ? 'active' : ''}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
          >
            Următor →
          </button>
        </div>
      )}
    </div>
  );
}
