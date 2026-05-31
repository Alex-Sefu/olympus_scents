import './ErrorState.css';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'A apărut o eroare',
  message = 'Nu am putut încărca datele. Încearcă din nou.',
  onRetry,
}: Props) {
  return (
    <div className="error-state">
      <div className="error-state-icon">⚠️</div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-msg">{message}</p>
      {onRetry && (
        <button className="btn-primary error-state-btn" onClick={onRetry}>
          Încearcă din nou
        </button>
      )}
    </div>
  );
}
