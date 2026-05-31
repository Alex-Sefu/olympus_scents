import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import './WishlistButton.css';

interface Props {
  parfumId: string;
  size?: 'sm' | 'md';
}

export default function WishlistButton({ parfumId, size = 'md' }: Props) {
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(parfumId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/signin'); return; }
    await toggle(parfumId);
  }

  return (
    <button
      className={`wishlist-btn wishlist-btn--${size} ${wishlisted ? 'wishlist-btn--active' : ''}`}
      onClick={handleClick}
      title={wishlisted ? 'Elimină din favorite' : 'Adaugă la favorite'}
      aria-label={wishlisted ? 'Elimină din favorite' : 'Adaugă la favorite'}
    >
      {wishlisted ? '♥' : '♡'}
    </button>
  );
}
