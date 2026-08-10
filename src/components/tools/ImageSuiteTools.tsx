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
import { PrivacyBadge } from '../PrivacyBadge';
import { TOOL_METADATA } from '../../lib/seoData';

interface ImageSuiteToolsProps {
  toolType: ToolType;
  onDownloadTrigger?: (
    filename: string,
    count: number,
    files?: ProcessedFileItem[]
  ) => void;
}

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

        default: {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          break;
        }
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            setResultSize(blob.size);
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Image Suite
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          {meta.title}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">{meta.subtitle}</p>
      </div>

      {/* Main Workspace */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Upload Dropzone */}
        {!previewUrl ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-3xl p-10 text-center transition-all bg-slate-50 hover:bg-slate-100/50 cursor-pointer space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-white text-slate-700 shadow-sm flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Drop image here or click to browse
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Supports JPG, PNG, WebP, HEIC (Max 50MB)
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-all cursor-pointer"
            >
              Select Image File
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tool Specific Customizations Controls */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Configure Settings</h3>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl('');
                    setResultUrl('');
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Change Image
                </button>
              </div>

              {/* Passport Photo Maker Settings */}
              {toolType === 'passport-photo-maker' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Background Color</label>
                    <div className="flex items-center gap-2">
                      {(['white', 'blue', 'red'] as const).map((bg) => (
                        <button
                          key={bg}
                          onClick={() => setPassportBg(bg)}
                          className={`px-3 py-1.5 rounded-xl font-bold capitalize border cursor-pointer ${
                            passportBg === bg
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Passport Dimensions</label>
                    <select
                      value={passportSize}
                      onChange={(e) => setPassportSize(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold text-xs"
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
                    <label className="font-bold text-slate-700 block mb-1">Full Candidate Name</label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. YESWANTH CHEPURI"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 font-mono">Date of Photo / DOB</label>
                    <input
                      type="text"
                      value={candidateDob}
                      onChange={(e) => setCandidateDob(e.target.value)}
                      placeholder="e.g. 15/08/2026"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Merge Photo & Signature */}
              {toolType === 'merge-photo-signature' && (
                <div className="space-y-3 text-xs">
                  <label className="font-bold text-slate-700 block">Upload Signature Image (Second File)</label>
                  {!secondPreviewUrl ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, true)}
                      className="text-xs text-slate-600"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <img src={secondPreviewUrl} alt="Signature" className="h-12 border rounded-lg" />
                      <span className="text-emerald-700 font-bold">Signature Loaded ✓</span>
                    </div>
                  )}
                </div>
              )}

              {/* Target KB Compressor */}
              {toolType === 'target-kb-compressor' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-700 block">Select Target File Size Cap</label>
                  <div className="flex flex-wrap gap-2">
                    {[20, 50, 100, 200, 500].map((kb) => (
                      <button
                        key={kb}
                        onClick={() => setTargetKb(kb)}
                        className={`px-3 py-1.5 rounded-xl font-bold border cursor-pointer ${
                          targetKb === kb
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300'
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
                  <label className="font-bold text-slate-700 block">Watermark Text Overlay</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={processImage}
                disabled={processing}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original Upload</span>
                <div className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-center min-h-64">
                  <img src={previewUrl} alt="Original" className="max-h-64 object-contain rounded-lg" />
                </div>
                <div className="text-[11px] font-mono text-slate-500 text-center">
                  Size: {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Processed Result</span>
                <div className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-center min-h-64">
                  {resultUrl ? (
                    <img src={resultUrl} alt="Result" className="max-h-64 object-contain rounded-lg shadow-sm" />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Click Apply & Render above to preview</span>
                  )}
                </div>

                {resultUrl && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono text-emerald-700 font-bold text-center">
                      Final Size: {(resultSize / 1024).toFixed(1)} KB
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" /> Download Processed Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <PrivacyBadge />
    </div>
  );
};
