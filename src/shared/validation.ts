const MAX_PATH_LENGTH = 4096;

export function isSafePath(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!value || value.length > MAX_PATH_LENGTH) return false;
  if (value.includes('\u0000') || value.includes('..')) return false;
  return true;
}

export function isSafeText(value: unknown, maxLength = 2_000_000): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}
