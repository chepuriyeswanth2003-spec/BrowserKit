export interface BgRemoverOptions {
  threshold: number; // 0 - 100 tolerance
  feather: number; // 0 - 10 edge blur
  keyColor?: string; // Hex color to remove, or auto-detect
  bgColor?: string; // Optional replacement background color or transparent
}

/**
 * Fast client-side background removal & keying engine.
 * Samples perimeter pixels to determine background color,
 * calculates color variance, applies edge feathering,
 * and outputs a high-resolution transparent PNG.
 */
export async function removeBackground(
  imageSrc: string,
  options: BgRemoverOptions
): Promise<{ url: string; blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Only set crossOrigin for remote http/https URLs, NOT for blob: or data: URLs
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onerror = (err) => {
      console.error('Image load error during background removal:', err);
      reject(new Error('Failed to load image for background removal'));
    };

    img.onload = () => {
      const origW = img.width || 800;
      const origH = img.height || 600;

      // Processing resolution cap for performance
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

      // 1. Draw image on processing canvas
      const offCanvas = document.createElement('canvas');
      offCanvas.width = procW;
      offCanvas.height = procH;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (!offCtx) {
        reject(new Error('Could not initialize processing canvas'));
        return;
      }

      offCtx.drawImage(img, 0, 0, procW, procH);
      const imgData = offCtx.getImageData(0, 0, procW, procH);
      const data = imgData.data;

      // 2. Determine target key color
      let keyR = 255, keyG = 255, keyB = 255;
      if (options.keyColor && options.keyColor.startsWith('#')) {
        const hex = options.keyColor.replace('#', '');
        if (hex.length === 6) {
          keyR = parseInt(hex.substring(0, 2), 16);
          keyG = parseInt(hex.substring(2, 4), 16);
          keyB = parseInt(hex.substring(4, 6), 16);
        }
      } else {
        // Sample perimeter edge pixels to identify background color
        const samples: [number, number][] = [];
        const stepX = Math.max(1, Math.floor(procW / 6));
        const stepY = Math.max(1, Math.floor(procH / 6));

        // Top & Bottom rows
        for (let x = 0; x < procW; x += stepX) {
          samples.push([x, 0]);
          samples.push([x, procH - 1]);
        }
        // Left & Right columns
        for (let y = 0; y < procH; y += stepY) {
          samples.push([0, y]);
          samples.push([procW - 1, y]);
        }

        let sumR = 0, sumG = 0, sumB = 0;
        samples.forEach(([cx, cy]) => {
          const idx = (cy * procW + cx) * 4;
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
        });

        const sampleCount = Math.max(1, samples.length);
        keyR = Math.round(sumR / sampleCount);
        keyG = Math.round(sumG / sampleCount);
        keyB = Math.round(sumB / sampleCount);
      }

      // 3. Compute Euclidean color distance and apply alpha transparency
      // Max Euclidean RGB distance ~ sqrt(255^2 * 3) = 441.67
      const maxDist = 441.67;
      const tolerance = (options.threshold / 100) * maxDist;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dr = r - keyR;
        const dg = g - keyG;
        const db = b - keyB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist <= tolerance) {
          data[i + 3] = 0; // Transparent
        } else if (dist < tolerance * 1.25) {
          // Feather transition edge
          const alphaRatio = (dist - tolerance) / (tolerance * 0.25);
          data[i + 3] = Math.round(alphaRatio * 255);
        }
      }

      offCtx.putImageData(imgData, 0, 0);

      // 4. Output final image at full original dimensions
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = origW;
      finalCanvas.height = origH;
      const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
      if (!finalCtx) {
        reject(new Error('Could not create output canvas'));
        return;
      }

      // Fill optional background color
      if (options.bgColor && options.bgColor !== 'transparent') {
        finalCtx.fillStyle = options.bgColor;
        finalCtx.fillRect(0, 0, origW, origH);
      }

      // Feathering filter
      if (options.feather > 0) {
        finalCtx.filter = `blur(${options.feather}px)`;
      }

      finalCtx.drawImage(offCanvas, 0, 0, origW, origH);

      finalCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to generate PNG image blob'));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({ url, blob, width: origW, height: origH });
      }, 'image/png');
    };

    img.src = imageSrc;
  });
}
