import './PageLoader.css';

interface Props {
  fullPage?: boolean;
  message?: string;
}

export default function PageLoader({ fullPage = false, message }: Props) {
  return (
    <div className={`page-loader ${fullPage ? 'page-loader--full' : ''}`}>
      <div className="page-loader-inner">
        <div className="page-loader-omega">Ω</div>
        <div className="page-loader-spinner" />
        {message && <p className="page-loader-msg">{message}</p>}
      </div>
    </div>
  );
}
