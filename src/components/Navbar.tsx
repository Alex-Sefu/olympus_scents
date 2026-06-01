import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../lib/supabase';
import type { Parfum } from '../types';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, isEditor, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState<Parfum[]>([]);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const { data } = await supabase
        .from('parfumuri')
        .select('id, nume_parfum, brand, pret, image_url, tip_parfum')
        .or(`nume_parfum.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,creator.ilike.%${searchQuery}%`)
        .limit(5);
      setSearchResults((data as Parfum[]) ?? []);
      setSearchOpen(true);
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Închide dropdown la click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  }

  function handleResultClick(parfumId: string) {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/perfume/${parfumId}`);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  }

  function handleNavClick() {
    setMobileMenuOpen(false);
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand" onClick={handleNavClick}>
          Olympus <span>Scents</span>
        </Link>

        <div className="navbar-links">
          <Link to="/">Parfumuri</Link>
          <Link to="/collections">Colecții</Link>
          {isEditor && <Link to="/editor/dashboard">Dashboard</Link>}
          {isEditor && <Link to="/editor/add">+ Adaugă</Link>}
        </div>

        {/* Search */}
        <div className="navbar-search-wrap" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="navbar-search-form">
            <input
              className="nav-search"
              placeholder="Caută parfum..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              autoComplete="off"
            />
            <button type="submit" className="navbar-search-btn" aria-label="Caută">
              🔍
            </button>
          </form>

          {searchOpen && (
            <div className="navbar-search-dropdown">
              {searchLoading ? (
                <div className="navbar-search-loading">Se caută...</div>
              ) : searchResults.length === 0 ? (
                <div className="navbar-search-empty">Niciun rezultat pentru „{searchQuery}"</div>
              ) : (
                <>
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      className="navbar-search-result"
                      onClick={() => handleResultClick(p.id)}
                    >
                      <div className="nsr-img">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.nume_parfum} />
                          : <span>{p.brand?.charAt(0)}</span>
                        }
                      </div>
                      <div className="nsr-info">
                        <span className="nsr-name">{p.nume_parfum}</span>
                        <span className="nsr-brand">{p.brand}</span>
                      </div>
                      <span className="nsr-price">{p.pret?.toFixed(2)} RON</span>
                    </div>
                  ))}
                  <div
                    className="navbar-search-all"
                    onClick={() => {
                      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    Vezi toate rezultatele pentru „{searchQuery}" →
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="navbar-right">
          <button
            className="navbar-menu-btn"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Meniu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {isAuthenticated ? (
            <>
              <span className="navbar-user">{profile?.full_name || 'Cont'}</span>
              {!isEditor && (
                <>
                  <Link to="/wishlist" className="navbar-cart-btn" title="Favorite">
                    ♡
                    {wishCount > 0 && <span className="navbar-cart-badge">{wishCount}</span>}
                  </Link>
                  <Link to="/cart" className="navbar-cart-btn">
                    🛒
                    {itemCount > 0 && <span className="navbar-cart-badge">{itemCount}</span>}
                  </Link>
                </>
              )}
              <Link to="/profile" className="navbar-profile">Profil</Link>
              <button className="btn-ghost" onClick={handleSignOut}>Deconectare</button>
            </>
          ) : (
            <Link to="/signin" className="btn-nav-gold">Autentificare</Link>
          )}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <Link to="/" className="navbar-mobile-link" onClick={handleNavClick}>🏛️ Parfumuri</Link>
          <Link to="/collections" className="navbar-mobile-link" onClick={handleNavClick}>⚡ Colecții</Link>
          {isAuthenticated && !isEditor && (
            <>
              <Link to="/cart" className="navbar-mobile-link" onClick={handleNavClick}>
                🛒 Coș {itemCount > 0 && `(${itemCount})`}
              </Link>
              <Link to="/wishlist" className="navbar-mobile-link" onClick={handleNavClick}>
                ♡ Favorite {wishCount > 0 && `(${wishCount})`}
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link to="/profile" className="navbar-mobile-link" onClick={handleNavClick}>👤 Profil</Link>
          )}
          {isEditor && (
            <>
              <div className="navbar-mobile-divider" />
              <Link to="/editor/dashboard" className="navbar-mobile-link" onClick={handleNavClick}>📊 Dashboard</Link>
              <Link to="/editor/add" className="navbar-mobile-link" onClick={handleNavClick}>➕ Adaugă parfum</Link>
            </>
          )}
          <div className="navbar-mobile-divider" />
          {isAuthenticated ? (
            <button className="navbar-mobile-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }} onClick={handleSignOut}>
              🚪 Deconectare
            </button>
          ) : (
            <Link to="/signin" className="navbar-mobile-link" onClick={handleNavClick}>🔐 Autentificare</Link>
          )}
        </div>
      )}
    </>
  );
}
