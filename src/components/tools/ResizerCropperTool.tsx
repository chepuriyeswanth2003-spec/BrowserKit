import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '../Dropzone';
import { TOOL_METADATA } from '../../lib/seoData';
import { PRESET_SIZES, processResizeCrop } from '../../lib/imageResizer';
import { Crop, Lock, Unlock, Download, Sliders, Trash2, Maximize2 } from 'lucide-react';
import { trackEvent } from '../../lib/analyticsSentry';
import { ToolPageShell } from './ToolPageShell';

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
    const res = await processResizeCrop(src, { targetWidth: w, targetHeight: h });
    setProcessedUrl(res.url);
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspect && origW > 0) {
      const h = Math.round((w / origW) * origH);
      setTargetHeight(h);
      if (imageSrc) renderResized(imageSrc, w, h);
    } else if (imageSrc) {
      renderResized(imageSrc, w, targetHeight);
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspect && origH > 0) {
      const w = Math.round((h / origH) * origW);
      setTargetWidth(w);
      if (imageSrc) renderResized(imageSrc, w, h);
    } else if (imageSrc) {
      renderResized(imageSrc, targetWidth, h);
    }
  };

  const handleScaleChange = (pct: number) => {
    setScalePct(pct);
    if (origW > 0 && origH > 0) {
      const newW = Math.round((origW * pct) / 100);
      const newH = Math.round((origH * pct) / 100);
      setTargetWidth(newW);
      setTargetHeight(newH);
      if (imageSrc) renderResized(imageSrc, newW, newH);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = PRESET_SIZES.find((item) => item.id === presetId);
    if (p && p.width > 0 && p.height > 0) {
      setTargetWidth(p.width);
      setTargetHeight(p.height);
      if (imageSrc) renderResized(imageSrc, p.width, p.height);
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
    <ToolPageShell
      categoryBadge="Image Suite"
      categoryBadgeColor="emerald"
      title={meta.title}
      description={meta.subtitle}
      icon={<Crop className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
    >
      <div className="space-y-6">
        {!imageSrc ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            multiple={false}
            title="Upload an image to resize & crop"
            subtitle="Preset dimensions for Passport (3.5x4.5cm), Instagram (1080x1080), YouTube, and official forms."
          />
        ) : (
          <div className="space-y-8">
            {/* Main Controls Panel */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Dimension Controls
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Original Resolution: {origW} x {origH} px
                  </p>
                </div>

                <button
                  onClick={handleClear}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Image
                </button>
              </div>

              {/* Preset Buttons Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Popular Social & Passport Presets
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {PRESET_SIZES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPresetId === preset.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{preset.label}</div>
                      <div className="text-[10px] font-mono opacity-80">
                        {preset.width > 0 ? `${preset.width}x${preset.height}` : 'Custom'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Custom Dimensions Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Width (Pixels)
                  </label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Height (Pixels)
                    </label>
                    <button
                      onClick={() => setLockAspect(!lockAspect)}
                      className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 cursor-pointer"
                    >
                      {lockAspect ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {lockAspect ? 'Aspect Locked' : 'Unlocked'}
                    </button>
                  </div>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Percentage Scaling: {scalePct}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={scalePct}
                    onChange={(e) => handleScaleChange(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Live Canvas Preview */}
            {processedUrl && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 text-center">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  <span>Resized Preview</span>
                  <span>
                    Output: {targetWidth} x {targetHeight} px
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center max-h-96 overflow-hidden">
                  <img
                    src={processedUrl}
                    alt="Resized output"
                    className="max-h-80 w-auto object-contain rounded-lg shadow-xs"
                  />
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mx-auto"
                >
                  <Download className="w-4 h-4 text-emerald-400 dark:text-white" /> Download Resized Image
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
