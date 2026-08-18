import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Crop as CropIcon,
  Shield,
  FileText,
  UserCheck,
  PenTool,
  Calendar,
  Layers,
  RotateCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { ToolType } from '../../types';
import { ProcessedFileItem } from '../PostDownloadAdModal';
import { TOOL_METADATA } from '../../lib/seoData';
import { ToolPageShell } from './ToolPageShell';

interface ImageSuiteToolsProps {
  toolType: ToolType;
  onDownloadTrigger?: (
    filename: string,
    count: number,
    files?: ProcessedFileItem[]
  ) => void;
}

/**
 * Patches real DPI metadata into a JPEG's JFIF APP0 segment. Canvas.toBlob() never writes
 * DPI info (browsers emit a JFIF header with density units set to "none"), so print/passport
 * tools that read the DPI tag would see nothing useful even if the pixel dimensions were
 * sized correctly. This binary-patches the standard JFIF density fields after generation.
 */
async function setJpegDpi(blob: Blob, dpi: number): Promise<Blob> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  // JPEG must start with SOI (FFD8) followed by an APP0 (FFE0) JFIF marker in browser output.
  if (buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff || buf[3] !== 0xe0) {
    return blob; // Not a standard JFIF-headed JPEG — return unmodified rather than corrupt it
  }
  const jfifIdOffset = 4 + 2; // after marker(2)+len(2)
  const isJfif =
    buf[jfifIdOffset] === 0x4a &&
    buf[jfifIdOffset + 1] === 0x46 &&
    buf[jfifIdOffset + 2] === 0x49 &&
    buf[jfifIdOffset + 3] === 0x46;
  if (!isJfif) return blob;

  const unitsOffset = jfifIdOffset + 5 + 2; // after "JFIF\0"(5) + version(2)
  const out = buf.slice();
  out[unitsOffset] = 1; // 1 = dots per inch
  out[unitsOffset + 1] = (dpi >> 8) & 0xff;
  out[unitsOffset + 2] = dpi & 0xff;
  out[unitsOffset + 3] = (dpi >> 8) & 0xff;
  out[unitsOffset + 4] = dpi & 0xff;
  return new Blob([out], { type: 'image/jpeg' });
}

/** Real box blur (not a no-op) so the "Blur" effect actually does something. */
function applyBoxBlur(ctx: CanvasRenderingContext2D, width: number, height: number, radius: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const out = new Uint8ClampedArray(src.length);
  let scratch = new Uint8ClampedArray(src.length);

  horizontalBlurPass(src, scratch, width, height, radius);
  verticalBlurPass(scratch, out, width, height, radius);

  imgData.data.set(out);
  ctx.putImageData(imgData, 0, 0);
}

function horizontalBlurPass(src: Uint8ClampedArray, dst: Uint8ClampedArray, w: number, h: number, r: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;
      for (let dx = -r; dx <= r; dx++) {
        const xx = Math.min(w - 1, Math.max(0, x + dx));
        const idx = (y * w + xx) * 4;
        rSum += src[idx]; gSum += src[idx + 1]; bSum += src[idx + 2]; aSum += src[idx + 3];
        count++;
      }
      const oIdx = (y * w + x) * 4;
      dst[oIdx] = rSum / count; dst[oIdx + 1] = gSum / count; dst[oIdx + 2] = bSum / count; dst[oIdx + 3] = aSum / count;
    }
  }
}

function verticalBlurPass(src: Uint8ClampedArray, dst: Uint8ClampedArray, w: number, h: number, r: number) {
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;
      for (let dy = -r; dy <= r; dy++) {
        const yy = Math.min(h - 1, Math.max(0, y + dy));
        const idx = (yy * w + x) * 4;
        rSum += src[idx]; gSum += src[idx + 1]; bSum += src[idx + 2]; aSum += src[idx + 3];
        count++;
      }
      const oIdx = (y * w + x) * 4;
      dst[oIdx] = rSum / count; dst[oIdx + 1] = gSum / count; dst[oIdx + 2] = bSum / count; dst[oIdx + 3] = aSum / count;
    }
  }
}

/** Real pixelation: downscale to a coarse grid, then draw each cell back as a flat block. */
function applyPixelate(ctx: CanvasRenderingContext2D, width: number, height: number, blockSize: number) {
  const smallW = Math.max(1, Math.floor(width / blockSize));
  const smallH = Math.max(1, Math.floor(height / blockSize));
  const tmp = document.createElement('canvas');
  tmp.width = smallW;
  tmp.height = smallH;
  const tctx = tmp.getContext('2d')!;
  tctx.drawImage(ctx.canvas, 0, 0, width, height, 0, 0, smallW, smallH);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(tmp, 0, 0, smallW, smallH, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
}

const OFFICIAL_SIZE_PRESETS: Record<string, { w: number; h: number; label: string }> = {
  'us-passport': { w: 600, h: 600, label: 'US Passport / Visa (2x2 in, 600x600px @ 300dpi)' },
  'india-passport': { w: 413, h: 531, label: 'India Passport (3.5x4.5cm @ 300dpi)' },
  'india-signature': { w: 708, h: 236, label: 'India Signature (6x2cm @ 300dpi)' },
  'pan-card': { w: 213, h: 213, label: 'PAN Card Photo (25x25mm @ 300dpi)' },
};

const SOCIAL_SIZE_PRESETS: Record<string, { w: number; h: number; label: string }> = {
  'instagram-post': { w: 1080, h: 1080, label: 'Instagram Post (1080x1080)' },
  'instagram-story': { w: 1080, h: 1920, label: 'Instagram / TikTok Story (1080x1920)' },
  'facebook-cover': { w: 820, h: 312, label: 'Facebook Cover (820x312)' },
  'twitter-header': { w: 1500, h: 500, label: 'X / Twitter Header (1500x500)' },
  'linkedin-banner': { w: 1584, h: 396, label: 'LinkedIn Banner (1584x396)' },
  'youtube-thumbnail': { w: 1280, h: 720, label: 'YouTube Thumbnail (1280x720)' },
};

export const ImageSuiteTools: React.FC<ImageSuiteToolsProps> = ({
  toolType,
  onDownloadTrigger,
}) => {
  const meta = TOOL_METADATA[toolType] || {
    title: 'Image & Photo Utility',
    subtitle: 'Process and customize photos client-side.',
    description: 'Fast, private photo editing in your browser.',
  };

  const [file, setFile] = useState<File | null>(null);
  const [secondFile, setSecondFile] = useState<File | null>(null); // For merging photo + signature
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [secondPreviewUrl, setSecondPreviewUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [resultSize, setResultSize] = useState<number>(0);
  const [resultFormat, setResultFormat] = useState<string>('image/jpeg');

  // Tool Specific States
  const [passportBg, setPassportBg] = useState<'white' | 'blue' | 'red' | 'original'>('white');
  const [passportSize, setPassportSize] = useState<'3.5x4.5' | '2x2' | '35x45' | '600x600'>('3.5x4.5');
  const [candidateName, setCandidateName] = useState<string>('');
  const [candidateDob, setCandidateDob] = useState<string>('');
  const [targetDpi, setTargetDpi] = useState<number>(300);
  const [targetKb, setTargetKb] = useState<number>(50);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [flipHoriz, setFlipHoriz] = useState<boolean>(false);
  const [effectType, setEffectType] = useState<'grayscale' | 'bw' | 'blur' | 'pixelate' | 'border'>('grayscale');
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [officialSizeKey, setOfficialSizeKey] = useState<string>('us-passport');
  const [socialSizeKey, setSocialSizeKey] = useState<string>('instagram-post');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isSecond = false) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const url = URL.createObjectURL(selected);
      if (isSecond) {
        setSecondFile(selected);
        setSecondPreviewUrl(url);
      } else {
        setFile(selected);
        setPreviewUrl(url);
        setResultUrl('');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResultUrl('');
    }
  };

  const processImage = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = previewUrl;
      await new Promise((res) => (img.onload = res));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context unavailable');

      let outWidth = img.width;
      let outHeight = img.height;
      let format = 'image/jpeg';

      switch (toolType) {
        case 'passport-photo-maker': {
          // Passport standard 3.5cm x 4.5cm @ 300 DPI = 413 x 531 px
          if (passportSize === '2x2') {
            outWidth = 600;
            outHeight = 600;
          } else if (passportSize === '35x45') {
            outWidth = 413;
            outHeight = 531;
          } else {
            outWidth = 413;
            outHeight = 531;
          }

          canvas.width = outWidth;
          canvas.height = outHeight;

          // Fill Background Color
          if (passportBg === 'white') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, outWidth, outHeight);
          } else if (passportBg === 'blue') {
            ctx.fillStyle = '#2563EB';
            ctx.fillRect(0, 0, outWidth, outHeight);
          } else if (passportBg === 'red') {
            ctx.fillStyle = '#DC2626';
            ctx.fillRect(0, 0, outWidth, outHeight);
          }

          // Draw image centered aspect cover
          const scale = Math.max(outWidth / img.width, outHeight / img.height);
          const x = (outWidth - img.width * scale) / 2;
          const y = (outHeight - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          break;
        }

        case 'add-name-and-dob': {
          outWidth = img.width;
          outHeight = img.height + 100; // Extra white box at bottom
          canvas.width = outWidth;
          canvas.height = outHeight;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, outWidth, outHeight);
          ctx.drawImage(img, 0, 0, img.width, img.height);

          // Draw Name & DOB bar
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${Math.round(outWidth * 0.045)}px sans-serif`;
          ctx.textAlign = 'center';
          if (candidateName) {
            ctx.fillText(candidateName.toUpperCase(), outWidth / 2, img.height + 40);
          }
          if (candidateDob) {
            ctx.fillText(`DOB: ${candidateDob}`, outWidth / 2, img.height + 80);
          }
          break;
        }

        case 'signature-resizer': {
          // Standard Govt signature dimensions (6cm x 2cm @ 300 DPI = 708 x 236 px)
          outWidth = 708;
          outHeight = 236;
          canvas.width = outWidth;
          canvas.height = outHeight;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, outWidth, outHeight);
          ctx.drawImage(img, 0, 0, outWidth, outHeight);
          break;
        }

        case 'circle-crop': {
          const side = Math.min(img.width, img.height);
          canvas.width = side;
          canvas.height = side;

          ctx.beginPath();
          ctx.arc(side / 2, side / 2, side / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            img,
            (img.width - side) / 2,
            (img.height - side) / 2,
            side,
            side,
            0,
            0,
            side,
            side
          );
          format = 'image/png';
          break;
        }

        case 'merge-photo-signature': {
          if (!secondFile || !secondPreviewUrl) {
            throw new Error('Please upload both Passport Photo and Signature images.');
          }

          const sigImg = new Image();
          sigImg.crossOrigin = 'anonymous';
          sigImg.src = secondPreviewUrl;
          await new Promise((res) => (sigImg.onload = res));

          outWidth = 450;
          outHeight = 650; // 450x450 photo + 450x200 signature
          canvas.width = outWidth;
          canvas.height = outHeight;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, outWidth, outHeight);

          // Draw Photo top
          ctx.drawImage(img, 0, 0, 450, 450);

          // Divider line
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 450);
          ctx.lineTo(450, 450);
          ctx.stroke();

          // Draw Signature bottom
          ctx.drawImage(sigImg, 0, 450, 450, 200);
          break;
        }

        case 'image-watermark': {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.font = `bold ${Math.round(img.width * 0.08)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.translate(img.width / 2, img.height / 2);
          ctx.rotate((-30 * Math.PI) / 180);
          ctx.fillText(watermarkText, 0, 0);
          break;
        }

        case 'image-rotate-flip': {
          canvas.width = rotationAngle % 180 === 0 ? img.width : img.height;
          canvas.height = rotationAngle % 180 === 0 ? img.height : img.width;

          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotationAngle * Math.PI) / 180);
          if (flipHoriz) ctx.scale(-1, 1);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          break;
        }

        case 'image-effects': {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          if (effectType === 'grayscale') {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
              const gray = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
              d[i] = gray;
              d[i + 1] = gray;
              d[i + 2] = gray;
            }
            ctx.putImageData(imgData, 0, 0);
          } else if (effectType === 'bw') {
            // True black & white: threshold luminance rather than a continuous gray ramp
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
              const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
              const v = lum > 128 ? 255 : 0;
              d[i] = v;
              d[i + 1] = v;
              d[i + 2] = v;
            }
            ctx.putImageData(imgData, 0, 0);
          } else if (effectType === 'blur') {
            const radius = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) * 0.01));
            applyBoxBlur(ctx, canvas.width, canvas.height, radius);
          } else if (effectType === 'pixelate') {
            const blockSize = Math.max(4, Math.round(Math.min(canvas.width, canvas.height) * 0.02));
            applyPixelate(ctx, canvas.width, canvas.height, blockSize);
          } else if (effectType === 'border') {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = Math.round(img.width * 0.04);
            ctx.strokeRect(0, 0, img.width, img.height);
          }
          break;
        }

        case 'target-kb-compressor': {
          // Iteratively search quality factor to reach target KB
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          let low = 0.05;
          let high = 0.95;
          let bestBlob: Blob | null = null;

          for (let i = 0; i < 6; i++) {
            const mid = (low + high) / 2;
            const blob: Blob = await new Promise((r) =>
              canvas.toBlob((b) => r(b!), 'image/jpeg', mid)
            );
            if (blob.size / 1024 <= targetKb) {
              bestBlob = blob;
              low = mid; // Try higher quality
            } else {
              high = mid; // Reduce quality
            }
          }

          if (!bestBlob) {
            bestBlob = await new Promise((r) =>
              canvas.toBlob((b) => r(b!), 'image/jpeg', 0.1)
            );
          }

          const resUrl = URL.createObjectURL(bestBlob);
          setResultUrl(resUrl);
          setResultSize(bestBlob.size);
          setResultFormat('image/jpeg');
          setProcessing(false);
          return;
        }

        case 'join-images': {
          if (secondPreviewUrl) {
            const secondImg = new Image();
            secondImg.crossOrigin = 'anonymous';
            secondImg.src = secondPreviewUrl;
            await new Promise((r) => (secondImg.onload = r));

            canvas.width = Math.max(img.width, secondImg.width);
            canvas.height = img.height + secondImg.height;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, (canvas.width - img.width) / 2, 0);
            ctx.drawImage(secondImg, (canvas.width - secondImg.width) / 2, img.height);
          } else {
            canvas.width = img.width;
            canvas.height = img.height * 2;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            ctx.drawImage(img, 0, img.height);
          }
          break;
        }

        case 'official-size-resizer': {
          const preset = OFFICIAL_SIZE_PRESETS[officialSizeKey] || OFFICIAL_SIZE_PRESETS['us-passport'];
          canvas.width = preset.w;
          canvas.height = preset.h;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, preset.w, preset.h);
          // Cover-fit (crop to fill) instead of stretching, so faces/subjects aren't distorted
          const scale = Math.max(preset.w / img.width, preset.h / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          ctx.drawImage(img, (preset.w - dw) / 2, (preset.h - dh) / 2, dw, dh);
          format = 'image/jpeg';
          break;
        }

        case 'social-media-resizer': {
          const preset = SOCIAL_SIZE_PRESETS[socialSizeKey] || SOCIAL_SIZE_PRESETS['instagram-post'];
          canvas.width = preset.w;
          canvas.height = preset.h;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, preset.w, preset.h);
          const scale = Math.min(preset.w / img.width, preset.h / img.height);
          const x = (preset.w - img.width * scale) / 2;
          const y = (preset.h - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          break;
        }

        case 'image-dpi-converter': {
          // Real DPI conversion: resize pixel dimensions so the image prints at the target
          // DPI for its physical size, then write the actual DPI tag into the JPEG (previously
          // this just blindly doubled resolution and never touched real DPI metadata at all).
          const basePhysicalWidthIn = img.width / 96; // treat source as if captured at 96dpi baseline
          const basePhysicalHeightIn = img.height / 96;
          canvas.width = Math.round(basePhysicalWidthIn * targetDpi);
          canvas.height = Math.round(basePhysicalHeightIn * targetDpi);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          format = 'image/jpeg';
          break;
        }

        default: {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          break;
        }
      }

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const finalBlob = toolType === 'image-dpi-converter' ? await setJpegDpi(blob, targetDpi) : blob;
            const url = URL.createObjectURL(finalBlob);
            setResultUrl(url);
            setResultSize(finalBlob.size);
            setResultFormat(format);
          }
          setProcessing(false);
        },
        format,
        0.92
      );
    } catch (err: any) {
      alert(err.message || 'Image processing failed');
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `browserkit_${toolType}_${file?.name || 'edited.jpg'}`;
    a.click();

    if (onDownloadTrigger) {
      onDownloadTrigger(`browserkit_${toolType}_${file?.name || 'edited.jpg'}`, 1);
    }
  };

  return (
    <ToolPageShell
      categoryBadge="Image Suite"
      categoryBadgeColor="emerald"
      title={meta.title}
      description={meta.subtitle}
      icon={<ImageIcon className="w-6 h-6 text-[#2f7a4f]" />}
    >
        {/* Upload Dropzone */}
        {!previewUrl ? (
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[#2d2d2d]/[0.4] hover:border-[#2d2d2d] wobbly-md p-10 text-center transition-all bg-[#fdfbf7] hover:bg-[#e5e0d8]/50 cursor-pointer space-y-4 block relative"
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e)}
              className="sr-only"
            />
            <div className="w-16 h-16 wobbly-md bg-white text-[#2d2d2d]/[0.85] shadow-hand-sm flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2d2d2d]">
                Click or drop image here to browse
              </h3>
              <p className="text-xs text-[#2d2d2d]/[0.7] mt-1 font-mono">
                Supports JPG, PNG, WebP, HEIC (Max 50MB)
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 wobbly-md bg-[#2d2d2d] text-white text-xs font-bold shadow-hand cursor-pointer">
              Select Image File
            </span>
          </label>
        ) : (
          <div className="space-y-6">
            {/* Tool Specific Customizations Controls */}
            <div className="p-5 wobbly-md bg-[#fdfbf7] border border-[2px] border-[#2d2d2d]/[0.3] space-y-4">
              <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#2f7a4f]" />
                  <h3 className="text-sm font-bold text-[#2d2d2d]">Configure Settings</h3>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl('');
                    setResultUrl('');
                  }}
                  className="text-xs text-[#ff4d4d] hover:underline font-semibold cursor-pointer"
                >
                  Change Image
                </button>
              </div>

              {/* Passport Photo Maker Settings */}
              {toolType === 'passport-photo-maker' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-[#2d2d2d]/[0.85] block mb-1.5">Background Color</label>
                    <div className="flex items-center gap-2">
                      {(['white', 'blue', 'red'] as const).map((bg) => (
                        <button
                          key={bg}
                          onClick={() => setPassportBg(bg)}
                          className={`px-3 py-1.5 wobbly-sm font-bold capitalize border cursor-pointer ${
                            passportBg === bg
                              ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                              : 'bg-white text-[#2d2d2d]/[0.85] border-[#2d2d2d]/[0.4]'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#2d2d2d]/[0.85] block mb-1.5">Passport Dimensions</label>
                    <select
                      value={passportSize}
                      onChange={(e) => setPassportSize(e.target.value as any)}
                      className="w-full p-2 bg-white border border-[2px] border-[#2d2d2d]/[0.4] wobbly-sm font-semibold text-xs"
                    >
                      <option value="3.5x4.5">3.5cm x 4.5cm (Official India/SSC)</option>
                      <option value="2x2">2 x 2 Inch (US Passport/Visa)</option>
                      <option value="35x45">35mm x 45mm (Schengen/UK)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Add Name & DOB Settings */}
              {toolType === 'add-name-and-dob' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-[#2d2d2d]/[0.85] block mb-1">Full Candidate Name</label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. YESWANTH CHEPURI"
                      className="w-full p-2.5 bg-white border border-[2px] border-[#2d2d2d]/[0.4] wobbly-sm text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#2d2d2d]/[0.85] block mb-1 font-mono">Date of Photo / DOB</label>
                    <input
                      type="text"
                      value={candidateDob}
                      onChange={(e) => setCandidateDob(e.target.value)}
                      placeholder="e.g. 15/08/2026"
                      className="w-full p-2.5 bg-white border border-[2px] border-[#2d2d2d]/[0.4] wobbly-sm text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Merge Photo & Signature */}
              {toolType === 'merge-photo-signature' && (
                <div className="space-y-3 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] block">Upload Signature Image (Second File)</label>
                  {!secondPreviewUrl ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, true)}
                      className="text-xs text-[#2d2d2d]/[0.75]"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <img src={secondPreviewUrl} alt="Signature" className="h-12 border-2 border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]/[0.3] wobbly-sm" />
                      <span className="text-[#2f7a4f] font-bold">Signature Loaded ✓</span>
                    </div>
                  )}
                </div>
              )}

              {/* Target KB Compressor */}
              {toolType === 'target-kb-compressor' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] block">Select Target File Size Cap</label>
                  <div className="flex flex-wrap gap-2">
                    {[20, 50, 100, 200, 500].map((kb) => (
                      <button
                        key={kb}
                        onClick={() => setTargetKb(kb)}
                        className={`px-3 py-1.5 wobbly-sm font-bold border cursor-pointer ${
                          targetKb === kb
                            ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                            : 'bg-white text-[#2d2d2d]/[0.85] border-[#2d2d2d]/[0.4]'
                        }`}
                      >
                        Under {kb}KB
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Watermark Settings */}
              {toolType === 'image-watermark' && (
                <div className="text-xs space-y-1">
                  <label className="font-bold text-[#2d2d2d]/[0.85] block">Watermark Text Overlay</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[2px] border-[#2d2d2d]/[0.4] wobbly-sm text-xs"
                  />
                </div>
              )}

              {/* Rotate & Flip Settings */}
              {toolType === 'image-rotate-flip' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#2d2d2d]/[0.85] block mb-1.5">Rotation</label>
                    <div className="flex gap-2">
                      {[0, 90, 180, 270].map((angle) => (
                        <button
                          key={angle}
                          onClick={() => setRotationAngle(angle)}
                          className={`px-3 py-1.5 wobbly-sm font-bold border cursor-pointer ${
                            rotationAngle === angle
                              ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                              : 'bg-white text-[#2d2d2d]/[0.85] border-[#2d2d2d]/[0.4]'
                          }`}
                        >
                          {angle}°
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 font-bold text-[#2d2d2d]/[0.85]">
                    <input type="checkbox" checked={flipHoriz} onChange={(e) => setFlipHoriz(e.target.checked)} />
                    Flip Horizontally
                  </label>
                </div>
              )}

              {/* Effects Settings */}
              {toolType === 'image-effects' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] block">Choose Effect</label>
                  <div className="flex flex-wrap gap-2">
                    {(['grayscale', 'bw', 'blur', 'pixelate', 'border'] as const).map((ef) => (
                      <button
                        key={ef}
                        onClick={() => setEffectType(ef)}
                        className={`px-3 py-1.5 wobbly-sm font-bold border cursor-pointer capitalize ${
                          effectType === ef
                            ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                            : 'bg-white text-[#2d2d2d]/[0.85] border-[#2d2d2d]/[0.4]'
                        }`}
                      >
                        {ef === 'bw' ? 'Black & White' : ef}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DPI Converter Settings */}
              {toolType === 'image-dpi-converter' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] block">Target DPI</label>
                  <div className="flex flex-wrap gap-2">
                    {[150, 200, 300, 600].map((dpi) => (
                      <button
                        key={dpi}
                        onClick={() => setTargetDpi(dpi)}
                        className={`px-3 py-1.5 wobbly-sm font-bold border cursor-pointer ${
                          targetDpi === dpi
                            ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                            : 'bg-white text-[#2d2d2d]/[0.85] border-[#2d2d2d]/[0.4]'
                        }`}
                      >
                        {dpi} DPI
                      </button>
                    ))}
                  </div>
                  <p className="text-[#2d2d2d]/[0.7]">
                    Resizes pixel dimensions for the target print DPI and writes the DPI tag into the output JPEG.
                  </p>
                </div>
              )}

              {/* Official Size Resizer Settings */}
              {toolType === 'official-size-resizer' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] block">Document Type</label>
                  <select
                    value={officialSizeKey}
                    onChange={(e) => setOfficialSizeKey(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[2px] border-[#2d2d2d]/[0.4] wobbly-sm text-xs font-semibold"
                  >
                    {Object.entries(OFFICIAL_SIZE_PRESETS).map(([key, p]) => (
                      <option key={key} value={key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Social Media Resizer Settings */}
              {toolType === 'social-media-resizer' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] block">Platform Size</label>
                  <select
                    value={socialSizeKey}
                    onChange={(e) => setSocialSizeKey(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[2px] border-[#2d2d2d]/[0.4] wobbly-sm text-xs font-semibold"
                  >
                    {Object.entries(SOCIAL_SIZE_PRESETS).map(([key, p]) => (
                      <option key={key} value={key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={processImage}
                disabled={processing}
                className="w-full py-3 wobbly-md bg-[#2f7a4f] hover:bg-[#2f7a4f] text-white text-xs font-bold shadow-hand transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Image...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Apply & Render Photo
                  </>
                )}
              </button>
            </div>

            {/* Side-by-Side Preview & Download */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#2d2d2d]/[0.7] uppercase tracking-wider">Original Upload</span>
                <div className="p-3 bg-[#fdfbf7] dark:bg-[#262220] border-2 border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]/[0.3] wobbly-md flex items-center justify-center min-h-64">
                  <img src={previewUrl} alt="Original" className="max-h-64 object-contain wobbly-sm" />
                </div>
                <div className="text-[11px] font-mono text-[#2d2d2d]/[0.7] text-center">
                  Size: {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#2d2d2d]/[0.7] uppercase tracking-wider">Processed Result</span>
                <div className="p-3 bg-[#fdfbf7] dark:bg-[#262220] border-2 border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]/[0.3] wobbly-md flex items-center justify-center min-h-64">
                  {resultUrl ? (
                    <img src={resultUrl} alt="Result" className="max-h-64 object-contain wobbly-sm shadow-hand-sm" />
                  ) : (
                    <span className="text-xs text-[#2d2d2d]/[0.7] font-medium">Click Apply & Render above to preview</span>
                  )}
                </div>

                {resultUrl && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono text-[#2f7a4f] font-bold text-center">
                      Final Size: {(resultSize / 1024).toFixed(1)} KB
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 wobbly-md bg-[#2d2d2d] hover:bg-[#2d2d2d] text-white text-xs font-bold shadow-hand transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#2f7a4f]" /> Download Processed Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </ToolPageShell>
  );
};
