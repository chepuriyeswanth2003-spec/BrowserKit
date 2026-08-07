import heic2any from 'heic2any';
import JSZip from 'jszip';

export interface ConvertOptions {
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  quality?: number; // 0.1 to 1.0
}

export interface AutoDetectResult {
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp';
  badgeLabel: string;
  reason: string;
  savingsEstimate?: string;
}

export async function detectOptimalFormat(file: File): Promise<AutoDetectResult> {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // 1. HEIC / HEIF photos
  if (
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif') ||
    mimeType.includes('heic') ||
    mimeType.includes('heif')
  ) {
    return {
      targetFormat: 'image/jpeg',
      badgeLabel: 'JPG (Universal Photo)',
      reason: 'HEIC/HEIF photo detected. Converting to JPG guarantees maximum cross-platform compatibility.',
      savingsEstimate: 'Web Compatible',
    };
  }

  // 2. SVG Vector Graphics
  if (fileName.endsWith('.svg') || mimeType.includes('svg')) {
    return {
      targetFormat: 'image/png',
      badgeLabel: 'PNG (Crisp Raster)',
      reason: 'SVG vector format detected. PNG preserves crisp vector edges and transparent backgrounds.',
      savingsEstimate: 'Lossless Raster',
    };
  }

  // 3. Raw / Uncompressed Bitmaps (BMP, TIFF)
  if (
    fileName.endsWith('.bmp') ||
    fileName.endsWith('.tiff') ||
    fileName.endsWith('.tif') ||
    mimeType.includes('bmp') ||
    mimeType.includes('tiff')
  ) {
    return {
      targetFormat: 'image/webp',
      badgeLabel: 'WebP (Ultra Shrink)',
      reason: 'Uncompressed raw bitmap detected. WebP reduces file size by up to 80% with minimal loss.',
      savingsEstimate: '~80% smaller',
    };
  }

  // 4. PNG Graphics & Photos
  if (mimeType.includes('png') || fileName.endsWith('.png')) {
    const hasAlpha = await checkImageHasTransparency(file).catch(() => true);
    if (hasAlpha) {
      return {
        targetFormat: 'image/webp',
        badgeLabel: 'WebP (Lossless Alpha)',
        reason: 'PNG image with transparency detected. WebP preserves alpha transparency with 30-50% smaller size.',
        savingsEstimate: '~35% smaller',
      };
    } else {
      return {
        targetFormat: 'image/webp',
        badgeLabel: 'WebP (High Efficiency)',
        reason: 'Opaque PNG photo/graphic detected. WebP significantly reduces bandwidth payload.',
        savingsEstimate: '~45% smaller',
      };
    }
  }

  // 5. GIF
  if (mimeType.includes('gif') || fileName.endsWith('.gif')) {
    return {
      targetFormat: 'image/webp',
      badgeLabel: 'WebP (Modern Format)',
      reason: 'GIF image detected. WebP provides richer color support and much smaller payload.',
      savingsEstimate: '~50% smaller',
    };
  }

  // 6. JPEG / JPG Photos
  if (
    mimeType.includes('jpeg') ||
    mimeType.includes('jpg') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg')
  ) {
    return {
      targetFormat: 'image/webp',
      badgeLabel: 'WebP (Next-Gen Web)',
      reason: 'JPEG photo detected. WebP delivers ~25-35% smaller file size at identical visual quality.',
      savingsEstimate: '~30% smaller',
    };
  }

  // Default fallback
  return {
    targetFormat: 'image/webp',
    badgeLabel: 'WebP (Recommended)',
    reason: 'WebP is the current web standard for optimal balance of speed and image quality.',
    savingsEstimate: 'Optimal Size',
  };
}

async function checkImageHasTransparency(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    if (!file.type.includes('png') && !file.name.toLowerCase().endsWith('.png')) {
      resolve(false);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const w = Math.min(img.width, 200);
        const h = Math.min(img.height, 200);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(true);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const imgData = ctx.getImageData(0, 0, w, h).data;
          for (let i = 3; i < imgData.length; i += 4) {
            if (imgData[i] < 255) {
              resolve(true);
              return;
            }
          }
          resolve(false);
        } catch {
          resolve(true);
        }
      };
      img.onerror = () => resolve(false);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(false);
    reader.readAsDataURL(file);
  });
}

export async function convertImageFormat(
  file: File,
  options: ConvertOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; filename: string }> {
  const extensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  const targetExt = extensionMap[options.targetFormat] || 'jpg';
  const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const outFilename = `${cleanName}.${targetExt}`;

  // Case 1: HEIC / HEIF file conversion using heic2any
  if (
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif') ||
    file.type.includes('heic') ||
    file.type.includes('heif')
  ) {
    const convertedRes = await heic2any({
      blob: file,
      toType: options.targetFormat,
      quality: options.quality || 0.9,
    });

    const blob = Array.isArray(convertedRes) ? convertedRes[0] : convertedRes;
    const url = URL.createObjectURL(blob);

    // Read dimensions from converted image
    const dimensions = await getImageDimensions(url);
    return { blob, url, width: dimensions.width, height: dimensions.height, filename: outFilename };
  }

  // Case 2: SVG or standard image conversion via Canvas
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Image failed to load'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Fill white background for JPEG exports
        if (options.targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, img.width, img.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas blob generation failed'));
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve({
              blob,
              url,
              width: img.width,
              height: img.height,
              filename: outFilename,
            });
          },
          options.targetFormat,
          options.quality || 0.92
        );
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 800, height: 600 });
    img.src = url;
  });
}

export async function createBatchConverterZip(
  convertedFiles: { filename: string; blob: Blob }[]
): Promise<Blob> {
  const zip = new JSZip();
  convertedFiles.forEach((file) => {
    zip.file(file.filename, file.blob);
  });
  return zip.generateAsync({ type: 'blob' });
}
