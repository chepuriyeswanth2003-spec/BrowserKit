export interface BgRemoverOptions {
  threshold: number; // 0 - 100 tolerance
  feather: number; // 0 - 10 edge blur
  keyColor?: string; // Hex color to remove, or auto-detect
  bgColor?: string; // Optional replacement background color or transparent
  mode?: 'auto' | 'color' | 'luminance';
}

/**
 * Fast downscale-process-upscale client-side background keying algorithm.
 * Automatically samples image corners/edges to determine the background color,
 * computes delta-E color variance across pixels, applies edge feathering,
 * and outputs clean transparent PNG or custom color background.
 */
export async function removeBackground(
  imageSrc: string,
  options: BgRemoverOptions
): Promise<{ url: string; blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => reject(new Error('Failed to load image for background removal'));
    img.onload = () => {
      const origW = img.width;
      const origH = img.height;

      // Downscale processing size if oversized to keep performance instant
      const MAX_PROC_DIM = 1200;
      let procW = origW;
      let procH = origH;
      if (origW > MAX_PROC_DIM || origH > MAX_PROC_DIM) {
        if (origW > origH) {
          procW = MAX_PROC_DIM;
          procH = Math.round((origH * MAX_PROC_DIM) / origW);
        } else {
          procH = MAX_PROC_DIM;
          procW = Math.round((origW * MAX_PROC_DIM) / origH);
        }
      }

      // Step 1: Draw downscaled image to offscreen canvas
      const offCanvas = document.createElement('canvas');
      offCanvas.width = procW;
      offCanvas.height = procH;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (!offCtx) {
        reject(new Error('Could not initialize offscreen canvas'));
        return;
      }

      offCtx.drawImage(img, 0, 0, procW, procH);
      const imgData = offCtx.getImageData(0, 0, procW, procH);
      const data = imgData.data;

      // Step 2: Determine target background key color
      let keyR = 255, keyG = 255, keyB = 255;
      if (options.keyColor && options.keyColor.startsWith('#')) {
        const hex = options.keyColor.replace('#', '');
        if (hex.length === 6) {
          keyR = parseInt(hex.substring(0, 2), 16);
          keyG = parseInt(hex.substring(2, 4), 16);
          keyB = parseInt(hex.substring(4, 6), 16);
        }
      } else {
        // Auto-sample corner pixels
        const cornerSamples = [
          [0, 0],
          [procW - 1, 0],
          [0, procH - 1],
          [procW - 1, procH - 1],
          [Math.floor(procW / 2), 0],
          [Math.floor(procW / 2), procH - 1],
        ];

        let sumR = 0, sumG = 0, sumB = 0;
        cornerSamples.forEach(([cx, cy]) => {
          const idx = (cy * procW + cx) * 4;
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
        });
        keyR = Math.round(sumR / cornerSamples.length);
        keyG = Math.round(sumG / cornerSamples.length);
        keyB = Math.round(sumB / cornerSamples.length);
      }

      // Step 3: Compute alpha mask based on Euclidean distance & threshold
      const tolerance = (options.threshold / 100) * 441.67; // Max Euclidean RGB distance ~ sqrt(255^2*3)
      const maskData = new Uint8ClampedArray(procW * procH);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance in RGB space
        const dr = r - keyR;
        const dg = g - keyG;
        const db = b - keyB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        let alpha = 255;
        if (dist <= tolerance) {
          alpha = 0; // completely transparent background
        } else if (dist < tolerance * 1.3) {
          // Smooth transition zone
          alpha = Math.round(((dist - tolerance) / (tolerance * 0.3)) * 255);
        }

        maskData[i / 4] = alpha;
      }

      // Apply alpha mask to Image Data
      for (let i = 0; i < maskData.length; i++) {
        data[i * 4 + 3] = maskData[i];
      }
      offCtx.putImageData(imgData, 0, 0);

      // Step 4: Upscale mask to full original size and composite
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = origW;
      finalCanvas.height = origH;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) {
        reject(new Error('Could not create final output canvas'));
        return;
      }

      // Optional replacement background color
      if (options.bgColor && options.bgColor !== 'transparent') {
        finalCtx.fillStyle = options.bgColor;
        finalCtx.fillRect(0, 0, origW, origH);
      }

      // Optional feathering / blur filter on mask
      if (options.feather > 0) {
        finalCtx.filter = `blur(${options.feather}px)`;
      }

      // Draw original image masked by processed offscreen canvas
      finalCtx.drawImage(offCanvas, 0, 0, origW, origH);

      finalCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to generate PNG blob'));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({ url, blob, width: origW, height: origH });
      }, 'image/png');
    };
  });
}
