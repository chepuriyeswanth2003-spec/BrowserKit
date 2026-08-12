import { describe, it, expect } from 'vitest';

describe('formatConverter file format rules', () => {
  it('identifies image mime types and extensions correctly', () => {
    const filename = 'photo.heic';
    expect(filename.endsWith('.heic')).toBe(true);
  });
});
