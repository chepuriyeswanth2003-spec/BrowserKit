import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { PrivacyBadge } from '../PrivacyBadge';
import { AdSlot } from '../AdSlot';
import { TOOL_METADATA } from '../../lib/seoData';
import { removeBackground } from '../../lib/backgroundRemover';
import { Download, Sliders, Trash2, Check, RefreshCw, Pipette, Eye } from 'lucide-react';
import { trackEvent } from '../../lib/analyticsSentry';

interface BackgroundRemoverToolProps {
  onDownloadTrigger: (
    filename?: string,
    count?: number,
    files?: { name: string; blob?: Blob; url?: string }[]
  ) => void;
}

export const BackgroundRemoverTool: React.FC<BackgroundRemoverToolProps> = ({
  onDownloadTrigger,
}) => {
  const meta = TOOL_METADATA['bg-remover'];
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string>('image.png');
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(30);
  const [feather, setFeather] = useState<number>(1);
  const [keyColor, setKeyColor] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    trackEvent('bg_remover_uploaded', { name: file.name });

    const src = URL.createObjectURL(file);
    setOriginalUrl(src);
    setOriginalName(file.name);
    processImage(src, threshold, feather, keyColor, bgColor);
  };

  const processImage = async (
    src: string,
    thresh: number,
    feath: number,
    keyHex: string,
    bgHex: string
  ) => {
    setIsProcessing(true);
    try {
      const res = await removeBackground(src, {
        threshold: thresh,
        feather: feath,
        keyColor: keyHex || undefined,
        bgColor: bgHex,
      });
      setProcessedUrl(res.url);
    } catch (e) {
      console.error('Background removal error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSettingChange = (
    newThresh: number,
    newFeath: number,
    newKey: string,
    newBg: string
  ) => {
    setThreshold(newThresh);
    setFeather(newFeath);
    setKeyColor(newKey);
    setBgColor(newBg);
    if (originalUrl) {
      processImage(originalUrl, newThresh, newFeath, newKey, newBg);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const cleanName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const fileName = `${cleanName}_no_bg.png`;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = fileName;
    a.click();
    onDownloadTrigger(fileName, 1, [{ name: fileName, url: processedUrl }]);
  };

  const handleClear = () => {
    setOriginalUrl(null);
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
        <PrivacyBadge compact />
      </div>

      {!originalUrl ? (
        <Dropzone
          onFilesSelected={handleFilesSelected}
          multiple={false}
          title="Upload image to remove background"
          subtitle="Supports JPG, PNG, WebP, and HEIC photos. Fast downscale-process-upscale pipeline."
        />
      ) : (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" /> Edge & Background Keying Controls
              </h3>
              <button
                onClick={handleClear}
                className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Image
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Tolerance Threshold */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Sensitivity / Tolerance</span>
                  <span className="text-purple-600 font-mono">{threshold}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={threshold}
                  onChange={(e) =>
                    handleSettingChange(parseInt(e.target.value), feather, keyColor, bgColor)
                  }
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Edge Feathering */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Edge Feather / Smoothing</span>
                  <span className="text-purple-600 font-mono">{feather}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={feather}
                  onChange={(e) =>
                    handleSettingChange(threshold, parseInt(e.target.value), keyColor, bgColor)
                  }
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Custom Key Color */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">Key Color (Auto-sample default)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={keyColor || '#ffffff'}
                    onChange={(e) =>
                      handleSettingChange(threshold, feather, e.target.value, bgColor)
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border-0"
                  />
                  <button
                    type="button"
                    onClick={() => handleSettingChange(threshold, feather, '', bgColor)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Reset Auto
                  </button>
                </div>
              </div>

              {/* Replacement Background Color */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">Background Fill</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSettingChange(threshold, feather, keyColor, 'transparent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      bgColor === 'transparent'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Transparent
                  </button>
                  <input
                    type="color"
                    value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                    onChange={(e) =>
                      handleSettingChange(threshold, feather, keyColor, e.target.value)
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Original Source Image
              </span>
              <div className="w-full h-80 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2">
                <img
                  src={originalUrl}
                  alt="Original"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>

            {/* Processed Transparent PNG with Checkered Pattern */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Transparent Result
                </span>
                {isProcessing && (
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Keying background...
                  </span>
                )}
              </div>

              <div
                className="w-full h-80 rounded-xl overflow-hidden flex items-center justify-center p-2 relative"
                style={{
                  backgroundImage:
                    bgColor === 'transparent'
                      ? `radial-gradient(#cbd5e1 1px, transparent 0)`
                      : undefined,
                  backgroundSize: '16px 16px',
                  backgroundColor: bgColor !== 'transparent' ? bgColor : '#f8fafc',
                }}
              >
                {processedUrl ? (
                  <img
                    src={processedUrl}
                    alt="Processed"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-xs text-slate-400">Processing background removal...</div>
                )}
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <button
              onClick={handleDownload}
              disabled={!processedUrl || isProcessing}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download Transparent PNG
            </button>
          </div>
        </div>
      )}

      <AdSlot type="below-tool" />

      {/* FAQs */}
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
    </div>
  );
};
