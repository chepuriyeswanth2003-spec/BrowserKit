import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '../Dropzone';
import { PrivacyBadge } from '../PrivacyBadge';
import { AdSlot } from '../AdSlot';
import { TOOL_METADATA } from '../../lib/seoData';
import { PRESET_SIZES, processResizeCrop } from '../../lib/imageResizer';
import { Crop, Lock, Unlock, Download, Sliders, Trash2, Maximize2 } from 'lucide-react';
import { trackEvent } from '../../lib/analyticsSentry';

interface ResizerCropperToolProps {
  onDownloadTrigger: (
    filename?: string,
    count?: number,
    files?: { name: string; blob?: Blob; url?: string }[]
  ) => void;
}

export const ResizerCropperTool: React.FC<ResizerCropperToolProps> = ({
  onDownloadTrigger,
}) => {
  const meta = TOOL_METADATA.resizer;
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string>('image.png');
  const [origW, setOrigW] = useState<number>(0);
  const [origH, setOrigH] = useState<number>(0);

  const [targetWidth, setTargetWidth] = useState<number>(1080);
  const [targetHeight, setTargetHeight] = useState<number>(1080);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [scalePct, setScalePct] = useState<number>(100);

  const [selectedPresetId, setSelectedPresetId] = useState<string>('insta-sq');
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    trackEvent('resizer_file_uploaded', { name: file.name });

    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOrigW(img.width);
      setOrigH(img.height);
      setTargetWidth(img.width);
      setTargetHeight(img.height);
      setImageSrc(src);
      setOriginalName(file.name);
      renderResized(src, img.width, img.height);
    };
    img.src = src;
  };

  const renderResized = async (src: string, w: number, h: number) => {
    try {
      const res = await processResizeCrop(src, {
        targetWidth: Math.max(1, Math.round(w)),
        targetHeight: Math.max(1, Math.round(h)),
        quality: 0.95,
      });
      setProcessedUrl(res.url);
    } catch (e) {
      console.error('Resize error:', e);
    }
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    let newH = targetHeight;
    if (lockAspect && origW > 0) {
      newH = Math.round((val * origH) / origW);
      setTargetHeight(newH);
    }
    if (imageSrc) renderResized(imageSrc, val, newH);
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    let newW = targetWidth;
    if (lockAspect && origH > 0) {
      newW = Math.round((val * origW) / origH);
      setTargetWidth(newW);
    }
    if (imageSrc) renderResized(imageSrc, newW, val);
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') return;

    const preset = PRESET_SIZES.find((p) => p.id === presetId);
    if (preset) {
      setTargetWidth(preset.width);
      setTargetHeight(preset.height);
      if (imageSrc) renderResized(imageSrc, preset.width, preset.height);
    }
  };

  const handleScalePctChange = (pct: number) => {
    setScalePct(pct);
    if (origW > 0 && origH > 0) {
      const newW = Math.round((origW * pct) / 100);
      const newH = Math.round((origH * pct) / 100);
      setTargetWidth(newW);
      setTargetHeight(newH);
      if (imageSrc) renderResized(imageSrc, newW, newH);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const cleanName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const fileName = `${cleanName}_${targetWidth}x${targetHeight}.png`;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = fileName;
    a.click();
    onDownloadTrigger(fileName, 1, [{ name: fileName, url: processedUrl }]);
  };

  const handleClear = () => {
    setImageSrc(null);
    setProcessedUrl(null);
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {meta.title}
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
          {meta.subtitle}
        </p>
      </div>

      {!imageSrc ? (
        <Dropzone
          onFilesSelected={handleFilesSelected}
          multiple={false}
          title="Upload image to resize or crop"
          subtitle="Supports social media dimension presets, passport photo standards, and custom dimensions."
        />
      ) : (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" /> Dimension & Preset Controls
              </h3>
              <button
                onClick={handleClear}
                className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Image
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Presets Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">Standard Presets</label>
                <select
                  value={selectedPresetId}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="custom">Custom Dimensions</option>
                  <optgroup label="Social Media">
                    {PRESET_SIZES.filter((p) => p.category === 'social').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Passport & Visa">
                    {PRESET_SIZES.filter((p) => p.category === 'passport').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Web & Favicon">
                    {PRESET_SIZES.filter((p) => p.category === 'web').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Width / Height manual inputs + Lock toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold">Dimensions (Pixels)</label>
                  <button
                    onClick={() => setLockAspect(!lockAspect)}
                    className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
                  >
                    {lockAspect ? (
                      <>
                        <Lock className="w-3 h-3" /> Locked Ratio
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" /> Unlocked
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                  <span className="text-xs text-slate-400">×</span>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Scale Percentage Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Scale Scale %</span>
                  <span className="text-amber-600 font-mono">{scalePct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={scalePct}
                  onChange={(e) => handleScalePctChange(parseInt(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Original: {origW} × {origH} px</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                Resized Target: {targetWidth} × {targetHeight} px
              </span>
            </div>

            <div className="w-full h-96 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 relative">
              {processedUrl && (
                <img
                  src={processedUrl}
                  alt="Resized Preview"
                  className="max-w-full max-h-full object-contain rounded-lg border border-slate-200 dark:border-slate-700"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleDownload}
              disabled={!processedUrl}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download Resized Image
            </button>
          </div>
        </div>
      )}

      <AdSlot type="below-tool" />

      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {meta.faqs.map((faq, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {faq.question}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <PrivacyBadge />
    </div>
  );
};
