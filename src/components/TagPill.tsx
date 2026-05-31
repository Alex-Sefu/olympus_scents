import './TagPill.css';

interface Props {
  label: string;
  variant?: 'varf' | 'baza' | 'tip' | 'default';
}

export default function TagPill({ label, variant = 'default' }: Props) {
  return (
    <span className={`tag-pill tag-pill--${variant}`}>
      {label}
    </span>
  );
}
