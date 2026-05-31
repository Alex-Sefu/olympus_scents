export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function getInitial(text: string): string {
  return text?.charAt(0).toUpperCase() ?? '?';
}

export function splitNotes(notes?: string): string[] {
  if (!notes) return [];
  return notes.split(',').map(n => n.trim()).filter(Boolean);
}
