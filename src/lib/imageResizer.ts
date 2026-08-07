import { PresetSize } from '../types';

export const PRESET_SIZES: PresetSize[] = [
  // Social Media
  { id: 'insta-sq', label: 'Instagram Square (1080 × 1080)', category: 'social', width: 1080, height: 1080, aspectRatio: 1 },
  { id: 'insta-portrait', label: 'Instagram Portrait (1080 × 1350)', category: 'social', width: 1080, height: 1350, aspectRatio: 4 / 5 },
  { id: 'insta-story', label: 'Instagram Story / Reel (1080 × 1920)', category: 'social', width: 1080, height: 1920, aspectRatio: 9 / 16 },
  { id: 'yt-thumb', label: 'YouTube Thumbnail (1280 × 720)', category: 'social', width: 1280, height: 720, aspectRatio: 16 / 9 },
  { id: 'twitter-hdr', label: 'Twitter / X Header (1500 × 500)', category: 'social', width: 1500, height: 500, aspectRatio: 3 / 1 },
  { id: 'fb-cover', label: 'Facebook Cover (820 × 312)', category: 'social', width: 820, height: 312, aspectRatio: 820 / 312 },
  
  // Passport & Visa
  { id: 'us-passport', label: 'US Passport Photo 2×2" (600 × 600)', category: 'passport', width: 600, height: 600, aspectRatio: 1 },
  { id: 'schengen-visa', label: 'Schengen Visa 35×45mm (413 × 531)', category: 'passport', width: 413, height: 531, aspectRatio: 413 / 531 },
  { id: 'uk-passport', label: 'UK Passport Photo (413 × 531)', category: 'passport', width: 413, height: 531, aspectRatio: 413 / 531 },

  // Web & Favicons
  { id: 'favicon-32', label: 'Favicon Standard (32 × 32)', category: 'web', width: 32, height: 32, aspectRatio: 1 },
  { id: 'favicon-16', label: 'Favicon Small (16 × 16)', category: 'web', width: 16, height: 16, aspectRatio: 1 },
  { id: 'apple-touch', label: 'Apple Touch Icon (180 × 180)', category: 'web', width: 180, height: 180, aspectRatio: 1 },
  { id: 'hd-banner', label: 'Full HD Web Banner (1920 × 1080)', category: 'web', width: 1920, height: 1080, aspectRatio: 16 / 9 },
];

export interface CropRect {
  x: number; // percentage 0 - 100 or pixels
  y: number;
  width: number;
  height: number;
}

export interface ResizeCropOptions {
  targetWidth: number;
  targetHeight: number;
  cropRect?: CropRect; // in pixel coordinates relative to original
  format?: string; // 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number;
}

export async function processResizeCrop(
  imageSrc: string,
  options: ResizeCropOptions
): Promise<{ url: string; blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onerror = () => reject(new Error('Failed to load image for resizing'));
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = options.targetWidth;
      canvas.height = options.targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Canvas 2d context unavailable'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const format = options.format || 'image/png';
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, options.targetWidth, options.targetHeight);
      }

      if (options.cropRect) {
        const { x, y, width, height } = options.cropRect;
        ctx.drawImage(
          img,
          x,
          y,
          width,
          height,
          0,
          0,
          options.targetWidth,
          options.targetHeight
        );
      } else {
        ctx.drawImage(img, 0, 0, options.targetWidth, options.targetHeight);
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate output image blob'));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve({ url, blob, width: options.targetWidth, height: options.targetHeight });
        },
        format,
        options.quality || 0.95
      );
    };
    img.src = imageSrc;
  });
}
