import { describe, it, expect } from 'vitest';
import { formatBytes } from './imageCompressor';

describe('imageCompressor utilities', () => {
  it('formats bytes correctly into human readable strings', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1073741824)).toBe('1 GB');
    expect(formatBytes(500)).toBe('500 Bytes');
  });
});
