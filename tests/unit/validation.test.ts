import { isSafePath, isSafeText } from '../../src/shared/validation';

describe('validation', () => {
  it('accepts safe paths and rejects traversal', () => {
    expect(isSafePath('/tmp/file.txt')).toBe(true);
    expect(isSafePath('../etc/passwd')).toBe(false);
  });

  it('validates text bounds', () => {
    expect(isSafeText('hello')).toBe(true);
    expect(isSafeText('a'.repeat(30), 10)).toBe(false);
  });
});
