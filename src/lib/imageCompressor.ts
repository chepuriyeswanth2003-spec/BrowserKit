import JSZip from 'jszip';
import { ProcessedImage } from '../types';

export interface CompressOptions {
  quality: number; // 0.1 to 1.0
  targetFormat?: string; // 'image/jpeg' | 'image/webp' | 'image/png'
  targetSizeKB?: number; // Target size limit in KB
  maxWidth?: number;
  maxHeight?: number;
}

export async function compressImage(
  file: File,
  options: CompressOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; format: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Downscale if bounds requested
        if (options.maxWidth && width > options.maxWidth) {
          height = Math.round((height * options.maxWidth) / width);
          width = options.maxWidth;
        }
        if (options.maxHeight && height > options.maxHeight) {
          width = Math.round((width * options.maxHeight) / height);
          height = options.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas 2d context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const mimeType = options.targetFormat || file.type || 'image/jpeg';

        // Fill white background for JPEG exports if original has transparency
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        let initialQuality = options.quality;

        // If target size in KB specified, attempt binary search for best quality
        if (options.targetSizeKB && options.targetSizeKB > 0) {
          const targetBytes = options.targetSizeKB * 1024;
          let low = 0.05;
          let high = 1.0;
          let bestBlob: Blob | null = null;

          for (let i = 0; i < 6; i++) {
            const mid = (low + high) / 2;
            const testBlob = await new Promise<Blob | null>((res) =>
              canvas.toBlob(res, mimeType, mid)
            );
            if (!testBlob) break;

            if (testBlob.size <= targetBytes) {
              bestBlob = testBlob;
              low = mid; // try higher quality if under limit
            } else {
              high = mid; // lower quality if over limit
            }
          }

          if (bestBlob) {
            const url = URL.createObjectURL(bestBlob);
            resolve({ blob: bestBlob, url, width, height, format: mimeType });
            return;
          }
        }

        // Standard compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas blob generation failed'));
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve({ blob, url, width, height, format: mimeType });
          },
          mimeType,
          initialQuality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function createBatchZip(
  items: ProcessedImage[],
  zipFilename = 'imagetoolkit_compressed.zip'
): Promise<Blob> {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.processedUrl) {
      const response = await fetch(item.processedUrl);
      const blob = await response.blob();
      const ext = item.format.split('/')[1] || 'jpg';
      const cleanName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      zip.file(`${cleanName}_compressed.${ext}`, blob);
    }
  }

  return zip.generateAsync({ type: 'blob' });
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
