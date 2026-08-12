import { describe, it, expect } from 'vitest';
import { formatBytes } from '../lib/imageCompressor';
import { rgbToHex, rgbToHsl, rgbToCmyk } from '../lib/colorPaletteExtractor';
import { generateSitemapXML, generateRobotsTxt } from '../lib/seoData';

describe('Image Utility Functions', () => {
  it('correctly formats byte sizes', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1572864, 1)).toBe('1.5 MB');
  });

  it('converts RGB to HEX accurately', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
  });

  it('converts RGB to HSL correctly', () => {
    const hslWhite = rgbToHsl(255, 255, 255);
    expect(hslWhite.l).toBe(100);

    const hslBlack = rgbToHsl(0, 0, 0);
    expect(hslBlack.l).toBe(0);
  });

  it('converts RGB to CMYK correctly', () => {
    const cmykBlack = rgbToCmyk(0, 0, 0);
    expect(cmykBlack.k).toBe(100);
  });

  it('generates valid sitemap XML and robots.txt', () => {
    const sitemap = generateSitemapXML('https://browserkit.co.in');
    expect(sitemap).toContain('<?xml');
    expect(sitemap).toContain('https://browserkit.co.in/image-tools');

    const robots = generateRobotsTxt('https://browserkit.co.in');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Sitemap: https://browserkit.co.in/sitemap.xml');
  });
});
