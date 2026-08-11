import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { PrivacyBadge } from '../PrivacyBadge';
import { AdSlot } from '../AdSlot';
import { TOOL_METADATA } from '../../lib/seoData';
import {
  convertImageFormat,
  createBatchConverterZip,
  detectOptimalFormat,
  AutoDetectResult,
} from '../../lib/formatConverter';
import {
  Download,
  Archive,
  RefreshCw,
  Trash2,
  ArrowRight,
  Sparkles,
  Wand2,
  Info,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { trackEvent } from '../../lib/analyticsSentry';
import { formatBytes } from '../../lib/imageCompressor';

interface FormatConverterToolProps {
  onDownloadTrigger: (
    filename?: string,
    count?: number,
    files?: { name: string; blob?: Blob; url?: string; size?: number }[]
  ) => void;
}

type GlobalFormatMode = 'auto' | 'image/jpeg' | 'image/png' | 'image/webp';

interface ConvertItem {
  id: string;
  file: File;
  name: string;
  size: number;
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  autoDetection?: AutoDetectResult;
  convertedBlob?: Blob;
  convertedUrl?: string;
  outFilename?: string;
  outSize?: number;
  status: 'idle' | 'converting' | 'done' | 'error';
  error?: string;
}

export const FormatConverterTool: React.FC<FormatConverterToolProps> = ({
  onDownloadTrigger,
}) => {
  const meta = TOOL_METADATA.converter;
  const [items, setItems] = useState<ConvertItem[]>([]);
  const [globalFormatMode, setGlobalFormatMode] = useState<GlobalFormatMode>('auto');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFilesSelected = async (files: File[]) => {
    trackEvent('format_converter_files_uploaded', { count: files.length });
    setIsProcessing(true);

    const newItemsWithDetect = await Promise.all(
      files.map(async (f) => {
        const autoResult = await detectOptimalFormat(f);
        const targetFmt =
          globalFormatMode === 'auto' ? autoResult.targetFormat : globalFormatMode;

        return {
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          name: f.name,
          size: f.size,
          targetFormat: targetFmt,
          autoDetection: autoResult,
          status: 'idle' as const,
        };
      })
    );

    const allItems = [...items, ...newItemsWithDetect];
    setItems(allItems);
    processBatch(allItems, globalFormatMode);
  };

  const processBatch = async (list: ConvertItem[], mode: GlobalFormatMode) => {
    setIsProcessing(true);

    const updated = await Promise.all(
      list.map(async (item) => {
        const targetFmt =
          mode === 'auto'
            ? item.autoDetection?.targetFormat || 'image/webp'
            : mode;

        try {
          const res = await convertImageFormat(item.file, {
            targetFormat: targetFmt,
            quality: 0.92,
          });

          return {
            ...item,
            targetFormat: targetFmt,
            convertedBlob: res.blob,
            convertedUrl: res.url,
            outFilename: res.filename,
            outSize: res.blob.size,
            status: 'done' as const,
          };
        } catch (err: any) {
          return {
            ...item,
            targetFormat: targetFmt,
            status: 'error' as const,
            error: err.message || 'Conversion error',
          };
        }
      })
    );

    setItems(updated);
    setIsProcessing(false);
  };

  const handleGlobalFormatModeChange = (mode: GlobalFormatMode) => {
    setGlobalFormatMode(mode);
    if (items.length > 0) {
      processBatch(items, mode);
    }
  };

  const handleItemFormatChange = async (
    itemId: string,
    newFormat: 'image/jpeg' | 'image/png' | 'image/webp'
  ) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Set converting state
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: 'converting' } : i))
    );

    try {
      const res = await convertImageFormat(item.file, {
        targetFormat: newFormat,
        quality: 0.92,
      });

      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                targetFormat: newFormat,
                convertedBlob: res.blob,
                convertedUrl: res.url,
                outFilename: res.filename,
                outSize: res.blob.size,
                status: 'done',
              }
            : i
        )
      );
    } catch (err: any) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, status: 'error', error: err.message || 'Conversion failed' }
            : i
        )
      );
    }
  };

  const getDoneFilesList = () => {
    return items
      .filter((i) => i.status === 'done' && i.convertedUrl && i.outFilename)
      .map((i) => ({
        name: i.outFilename!,
        url: i.convertedUrl,
        blob: i.convertedBlob,
        size: i.outSize,
      }));
  };

  const handleDownloadSingle = (item: ConvertItem) => {
    if (!item.convertedUrl || !item.outFilename) return;
    const a = document.createElement('a');
    a.href = item.convertedUrl;
    a.download = item.outFilename;
    a.click();

    const doneFiles = getDoneFilesList();
    onDownloadTrigger(item.outFilename, 1, doneFiles);
  };

  const handleDownloadAllZip = async () => {
    const doneItems = items.filter(
      (i) => i.status === 'done' && i.convertedBlob && i.outFilename
    );
    if (doneItems.length === 0) return;

    const filesToZip = doneItems.map((i) => ({
      filename: i.outFilename!,
      blob: i.convertedBlob!,
    }));

    const doneFiles = getDoneFilesList();
    const zipBlob = await createBatchConverterZip(filesToZip);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'browserkit_converted.zip';
    a.click();
    URL.revokeObjectURL(url);

    onDownloadTrigger('browserkit_converted.zip', doneItems.length, doneFiles);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
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

      <Dropzone
        onFilesSelected={handleFilesSelected}
        accept="image/*,.heic,.heif,.pdf,.svg"
        title="Drop images, SVGs, or HEIC files to convert"
        subtitle="Auto-detects optimal formats (HEIC → JPG, PNG → WebP) or batch convert manually."
      />

      {items.length > 0 && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    Target Output Format
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select a global mode or customize per file
                  </p>
                </div>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleGlobalFormatModeChange('auto')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    globalFormatMode === 'auto'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Auto-Detect (Recommended)
                </button>

                <button
                  onClick={() => handleGlobalFormatModeChange('image/jpeg')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    globalFormatMode === 'image/jpeg'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  JPG
                </button>

                <button
                  onClick={() => handleGlobalFormatModeChange('image/png')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    globalFormatMode === 'image/png'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  PNG
                </button>

                <button
                  onClick={() => handleGlobalFormatModeChange('image/webp')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    globalFormatMode === 'image/webp'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  WebP
                </button>
              </div>
            </div>

            {/* Auto-Detect Informational Banner */}
            {globalFormatMode === 'auto' && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                <Wand2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Smart Auto-Detect Active:</strong> Each file is analyzed based on mime type, original structure, and transparency to pair with its most efficient format.
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Files ({items.length})
            </span>

            <button
              onClick={handleDownloadAllZip}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Archive className="w-4 h-4" /> Download All as ZIP
            </button>
          </div>

          {/* Item Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500">
                        Original: {formatBytes(item.size)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Auto-Detection Badge & Reason */}
                  {item.autoDetection && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Suggested: {item.autoDetection.badgeLabel}
                        </span>
                        {item.autoDetection.savingsEstimate && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-bold">
                            {item.autoDetection.savingsEstimate}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-snug">
                        {item.autoDetection.reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status, Conversion Info & Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Per-Item Format Selector */}
                    <select
                      value={item.targetFormat}
                      onChange={(e) =>
                        handleItemFormatChange(
                          item.id,
                          e.target.value as 'image/jpeg' | 'image/png' | 'image/webp'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="image/jpeg">JPG</option>
                      <option value="image/png">PNG</option>
                      <option value="image/webp">WebP</option>
                    </select>

                    {item.status === 'converting' && (
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-500" /> Converting...
                      </span>
                    )}

                    {item.status === 'done' && item.outFilename && (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[120px]">
                          {item.outFilename}
                        </span>
                        {item.outSize && (
                          <span className="text-slate-400">
                            ({formatBytes(item.outSize)})
                          </span>
                        )}
                      </div>
                    )}

                    {item.status === 'error' && (
                      <span className="text-[11px] font-mono text-rose-500 font-bold">
                        Failed
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDownloadSingle(item)}
                    disabled={item.status !== 'done'}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
                    title="Download converted file"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            ))}
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

