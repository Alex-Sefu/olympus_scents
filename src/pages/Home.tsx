import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Parfum } from '../types';
import { COLLECTIONS } from '../data/collections';
import { useHermes } from '../context/HermesContext';
import { usePageTitle } from '../hooks/usePageTitle';
import hermesMascota from '../assets/hermes_sticker.png';
import PerfumeCard from '../components/PerfumeCard';
import './Home.css';

const PAGE_SIZE = 8;

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
      if (i >= HERMES_MESSAGE.length) { clearInterval(timer); setDone(true); }
    }, 28);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hermes-bubble">
      <p className="hermes-bubble__text">
        {displayed}
        {!done && <span className="hermes-bubble__cursor">|</span>}
      </p>
      {done && (
        <button className="hermes-bubble__reply" onClick={onOpen}>
          Răspunde lui Hermes →
        </button>
      )}
    </div>
  );
}

export default function Home() {
  usePageTitle('Catalog Parfumuri');

  const [searchParams] = useSearchParams();
  const [parfumuri, setParfumuri]     = useState<Parfum[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(0);
  const [loading, setLoading]         = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');

  // Filters
  const [brand, setBrand]   = useState('');
  const [creator, setCreator] = useState('');
  const [tip, setTip]       = useState('');
  const [sortBy, setSortBy] = useState<'nou' | 'pret_asc' | 'pret_desc'>('nou');

  // Price range
  const [priceRange, setPriceRange]   = useState<[number, number]>([0, 2000]);
  const [maxPriceDB, setMaxPriceDB]   = useState(2000);

  // Fetch max price on mount
  useEffect(() => {
    async function fetchMaxPrice() {
      const { data } = await supabase
        .from('parfumuri')
        .select('pret')
        .order('pret', { ascending: false })
        .limit(1)
        .single();
      if (data) {
        const max = Math.ceil(data.pret / 100) * 100;
        setMaxPriceDB(max);
        setPriceRange([0, max]);
      }
    }
    fetchMaxPrice();
  }, []);

  // Read ?q= param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setGlobalSearch(q);
      setBrand('');
      setCreator('');
      // Scroll la gridul de produse după un mic delay (să se randeze)
      setTimeout(() => {
        document.querySelector('.home-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else {
      setGlobalSearch('');
    }
  }, [searchParams]);

  const fetchParfumuri = useCallback(async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('parfumuri')
      .select('*', { count: 'exact' })
      .range(from, to)
      .gte('pret', priceRange[0])
      .lte('pret', priceRange[1]);

    if (globalSearch.trim()) {
      query = query.or(
        `nume_parfum.ilike.%${globalSearch.trim()}%,brand.ilike.%${globalSearch.trim()}%,creator.ilike.%${globalSearch.trim()}%`
      );
    } else {
      if (brand.trim()) query = query.ilike('brand', `%${brand.trim()}%`);
      if (creator.trim()) query = query.ilike('creator', `%${creator.trim()}%`);
    }
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
  }, [page, brand, creator, tip, sortBy, globalSearch, priceRange]);

  useEffect(() => { fetchParfumuri(); }, [fetchParfumuri]);
  useEffect(() => { setPage(0); }, [brand, creator, tip, sortBy, globalSearch, priceRange]);

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

        <div className="home-hero__visual">
          <div className="hermes-assistant-container">
            <HermesSpeechBubble onOpen={() => setHermesOpen(true)} />
            <div className="hermes-sticker-wrap">
              <img
                src={hermesMascota}
                alt="Hermes Mascota"
                className="hermes-sticker-avatar"
                onClick={() => setHermesOpen(true)}
                title="Cere sfatul lui Hermes"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Colecții Olimp */}
      <section className="home-collections">
        <div className="home-collections-header">
          <h2 className="home-collections-title">Colecțiile Olimpului</h2>
          <Link to="/collections" className="home-collections-all">Vezi toate →</Link>
        </div>
        <div className="home-collections-row">
          {COLLECTIONS.map(col => (
            <Link
              key={col.id}
              to={`/collections/${col.id}`}
              className="home-col-chip"
              style={{ '--chip-accent': col.color_accent, '--chip-bg': col.color_from, '--chip-text': col.text_color } as React.CSSProperties}
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
        {globalSearch && (
          <div className="home-search-banner">
            🔍 Rezultate pentru: <strong>„{globalSearch}"</strong>
            <button className="home-filters__clear" onClick={() => { setGlobalSearch(''); window.history.pushState({}, '', '/'); }}>
              × Șterge căutarea
            </button>
          </div>
        )}

        <div className="home-filters__row">
          <input type="text" placeholder="Marca..." value={brand} onChange={e => setBrand(e.target.value)} className="home-filter-input" disabled={!!globalSearch} />
          <input type="text" placeholder="Creator..." value={creator} onChange={e => setCreator(e.target.value)} className="home-filter-input" disabled={!!globalSearch} />
          <select value={tip} onChange={e => setTip(e.target.value)} className="home-filter-input">
            <option value="">Toate tipurile</option>
            <option value="Parfum">Parfum</option>
            <option value="Eau de Parfum">Eau de Parfum</option>
            <option value="Eau de Toilette">Eau de Toilette</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="home-filter-input">
            <option value="nou">Cele mai noi</option>
            <option value="pret_asc">Preț crescător</option>
            <option value="pret_desc">Preț descrescător</option>
          </select>
        </div>

        {/* Price range slider */}
        <div className="price-filter">
          <div className="price-filter-header">
            <span className="price-filter-label">Preț</span>
            <span className="price-filter-values">{priceRange[0]} RON — {priceRange[1]} RON</span>
          </div>
          <div className="price-slider-wrap">
            <input
              type="range" className="price-slider"
              min={0} max={maxPriceDB} step={50}
              value={priceRange[0]}
              onChange={e => { const v = Number(e.target.value); if (v < priceRange[1]) setPriceRange([v, priceRange[1]]); }}
            />
            <input
              type="range" className="price-slider"
              min={0} max={maxPriceDB} step={50}
              value={priceRange[1]}
              onChange={e => { const v = Number(e.target.value); if (v > priceRange[0]) setPriceRange([priceRange[0], v]); }}
            />
            <div className="price-track">
              <div className="price-track-fill" style={{ left: `${(priceRange[0] / maxPriceDB) * 100}%`, right: `${100 - (priceRange[1] / maxPriceDB) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="home-filters__meta">
          <span>{loading ? '...' : `${total} parfumuri găsite`}</span>
          {(brand || creator || tip) && (
            <button className="home-filters__clear" onClick={() => { setBrand(''); setCreator(''); setTip(''); }}>
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
            <button className="home-filters__clear" onClick={() => { setBrand(''); setCreator(''); setTip(''); setPriceRange([0, maxPriceDB]); }}>
              Resetează filtrele
            </button>
          </div>
        ) : (
          parfumuri.map(p => <PerfumeCard key={p.id} parfum={p} />)
        )}
      </div>

      {/* Paginare */}
      {totalPages > 1 && (
        <div className="home-pagination">
          <button className="btn btn-outline" onClick={() => setPage(p => p - 1)} disabled={page === 0}>← Anterior</button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} className={`pagination-num ${i === page ? 'active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <button className="btn btn-outline" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Următor →</button>
        </div>
      )}
    </div>
  );
}
