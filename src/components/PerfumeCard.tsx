import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import WishlistButton from './WishlistButton';
import type { Parfum } from '../types';
import { formatPrice, getInitial } from '../lib/utils';
import './PerfumeCard.css';

interface Props {
  parfum: Parfum;
}

export default function PerfumeCard({ parfum }: Props) {
  const { isAuthenticated, isEditor } = useAuth();
  const { addItem, addingId } = useCart();

  const isAdding = addingId === parfum.id;

  return (
    <div className="perfume-card">
      {/* Zona imagine */}
      <div className="perfume-card__image">
        {parfum.image_url ? (
          <img src={parfum.image_url} alt={parfum.nume_parfum} />
        ) : (
          <div className="perfume-card__mono">
            {getInitial(parfum.brand)}
          </div>
        )}
        {parfum.tip_parfum && (
          <div className="perfume-card__badge">
            {parfum.tip_parfum}
          </div>
        )}
        {parfum.stoc === 0 && (
          <div className="perfume-card__sold-out">
            Stoc epuizat
          </div>
        )}
        {/* Wishlist button — doar pentru useri autentificați non-editor */}
        {isAuthenticated && !isEditor && (
          <div className="card-wishlist-pos">
            <WishlistButton parfumId={parfum.id} size="sm" />
          </div>
        )}
      </div>

      {/* Conținut */}
      <div className="perfume-card__body">
        <h3 className="perfume-card__name">{parfum.nume_parfum}</h3>
        <p className="perfume-card__brand">{parfum.brand}</p>

        <p className="perfume-card__price">
          {formatPrice(parfum.pret)}
        </p>

        <div className="perfume-card__actions">
          <Link to={`/perfume/${parfum.id}`} className="btn btn-outline">
            → Detalii
          </Link>

          {isAuthenticated && !isEditor && parfum.stoc > 0 && (
            <button
              className={`btn btn-gold ${isAdding ? 'btn-gold--loading' : ''}`}
              onClick={() => addItem(parfum)}
              disabled={isAdding}
            >
              {isAdding ? (
                <span className="btn-gold-spinner" />
              ) : (
                '+ Coș'
              )}
            </button>
          )}

          {isEditor && (
            <Link
              to={`/editor/edit/${parfum.id}`}
              className="btn btn-edit"
            >
              Editează
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
