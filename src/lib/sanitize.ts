import DOMPurify from 'dompurify';

export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function sanitizeForm<T extends Record<string, string>>(form: T): T {
  const sanitized = {} as T;
  for (const key in form) {
    if (typeof form[key] === 'string') {
      sanitized[key] = sanitizeText(form[key]) as T[typeof key];
    } else {
      sanitized[key] = form[key];
    }
  }
  return sanitized;
}
