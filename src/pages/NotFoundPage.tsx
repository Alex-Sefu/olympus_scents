import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  usePageTitle('Pagina Nu Există — 404');
  return (
    <div className="nf-page">
      <div className="nf-content">
        <div className="nf-god">⚡</div>
        <h1 className="nf-code">404</h1>
        <h2 className="nf-title">Pagina nu există</h2>
        <p className="nf-sub">
          Hermes nu a putut găsi această pagină în Olimp. Poate a fost mutată sau nu a existat niciodată.
        </p>
        <div className="nf-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            ← Înapoi
          </button>
          <Link to="/" className="btn-primary">Acasă</Link>
        </div>
      </div>
    </div>
  );
}
