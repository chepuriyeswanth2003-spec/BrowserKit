import JSZip from 'jszip';
import { ColorSwatch } from '../types';

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function rgbToCmyk(
  r: number,
  g: number,
  b: number
): { c: number; m: number; y: number; k: number } {
  if (r === 0 && g === 0 && b === 0) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const c = 1 - r / 255;
  const m = 1 - g / 255;
  const y = 1 - b / 255;
  const k = Math.min(c, m, y);

  return {
    c: Math.round(((c - k) / (1 - k)) * 100),
    m: Math.round(((m - k) / (1 - k)) * 100),
    y: Math.round(((y - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

/**
 * Extract dominant color swatches using k-means color quantization
 */
export async function extractColorPalette(
  imageSrc: string,
  swatchCount = 6
): Promise<ColorSwatch[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const sampleSize = 100; // downsample for performance
      canvas.width = sampleSize;
      canvas.height = sampleSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve([]);
        return;
      }

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imgData.data;

      // Collect non-transparent pixel samples
      const pixels: { r: number; g: number; b: number }[] = [];
      for (let i = 0; i < data.length; i += 16) { // step by 4 pixels
        if (data[i + 3] > 128) { // ignore transparent
          pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
        }
      }

      if (pixels.length === 0) {
        resolve([]);
        return;
      }

      // Simple K-Means Clustering
      let centroids = pixels.slice(0, swatchCount).map((p) => ({ ...p }));
      let assignments = new Array(pixels.length).fill(0);

      for (let iter = 0; iter < 8; iter++) {
        // Assign pixels to closest centroid
        const counts = new Array(swatchCount).fill(0);
        const sums = Array.from({ length: swatchCount }, () => ({ r: 0, g: 0, b: 0 }));

        pixels.forEach((p, pIdx) => {
          let minDist = Infinity;
          let bestIdx = 0;

          centroids.forEach((c, cIdx) => {
            const dr = p.r - c.r;
            const dg = p.g - c.g;
            const db = p.b - c.b;
            const dist = dr * dr + dg * dg + db * db;
            if (dist < minDist) {
              minDist = dist;
              bestIdx = cIdx;
            }
          });

          assignments[pIdx] = bestIdx;
          counts[bestIdx]++;
          sums[bestIdx].r += p.r;
          sums[bestIdx].g += p.g;
          sums[bestIdx].b += p.b;
        });

        // Update centroids
        centroids = centroids.map((c, cIdx) => {
          if (counts[cIdx] === 0) return c;
          return {
            r: Math.round(sums[cIdx].r / counts[cIdx]),
            g: Math.round(sums[cIdx].g / counts[cIdx]),
            b: Math.round(sums[cIdx].b / counts[cIdx]),
          };
        });
      }

      // Compute proportions & build swatches
      const totalSamples = pixels.length;
      const counts = new Array(swatchCount).fill(0);
      assignments.forEach((a) => counts[a]++);

      const swatches: ColorSwatch[] = centroids.map((c, idx) => {
        const hex = rgbToHex(c.r, c.g, c.b);
        const hsl = rgbToHsl(c.r, c.g, c.b);
        const cmyk = rgbToCmyk(c.r, c.g, c.b);
        const pop = counts[idx];
        const pct = Math.round((pop / totalSamples) * 100);
        const isLight = hsl.l > 60;

        return {
          hex,
          rgb: c,
          hsl,
          cmyk,
          population: pop,
          percentage: pct,
          isLight,
        };
      });

      // Sort by population percentage
      swatches.sort((a, b) => b.percentage - a.percentage);
      resolve(swatches);
    };
    img.src = imageSrc;
  });
}

/**
 * Generate full downloadable Favicon Pack ZIP
 */
export async function generateFaviconPackZip(imageSrc: string): Promise<Blob> {
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  const zip = new JSZip();

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Failed to load image for favicon pack'));
    el.src = imageSrc;
  });

  for (const item of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = item.size;
    canvas.height = item.size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, item.size, item.size);

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (blob) {
        zip.file(item.name, blob);
      }
    }
  }

  // Add html instructions snippet
  const htmlSnippet = `<!-- Add these tags to your website <head> -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
`;
  zip.file('head_tags.html', htmlSnippet);

  // Add site.webmanifest
  const manifestJson = {
    name: 'My Website',
    short_name: 'Website',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  };
  zip.file('site.webmanifest', JSON.stringify(manifestJson, null, 2));

  return zip.generateAsync({ type: 'blob' });
}
