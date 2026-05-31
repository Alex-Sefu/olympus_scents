import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, isEditor, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Olympus <span>Scents</span>
      </Link>

      <div className="navbar-links">
        <Link to="/">Parfumuri</Link>
        <Link to="/collections">Colecții</Link>
        {isEditor && <Link to="/editor/dashboard">Dashboard</Link>}
        {isEditor && <Link to="/editor/add">+ Adaugă</Link>}
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <span className="navbar-user">{profile?.full_name || 'Cont'}</span>
            {!isEditor && (
              <>
                <Link to="/wishlist" className="navbar-cart-btn" title="Favorite">
                  ♡
                  {wishCount > 0 && (
                    <span className="navbar-cart-badge">{wishCount}</span>
                  )}
                </Link>
                <Link to="/cart" className="navbar-cart-btn">
                  🛒
                  {itemCount > 0 && (
                    <span className="navbar-cart-badge">{itemCount}</span>
                  )}
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
  );
}
