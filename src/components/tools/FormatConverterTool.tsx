import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
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
import { ToolPageShell } from './ToolPageShell';

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

export const FormatConverterTool: React.FC<FormatConverterToolProps> = ({ onDownloadTrigger }) => {
  const meta = TOOL_METADATA.converter;
  const [items, setItems] = useState<ConvertItem[]>([]);
  const [globalMode, setGlobalMode] = useState<GlobalFormatMode>('auto');

  const handleFilesSelected = async (files: File[]) => {
    trackEvent('converter_files_uploaded', { count: files.length });

    const newItems: ConvertItem[] = await Promise.all(
      files.map(async (file) => {
        const auto = await detectOptimalFormat(file);
        let targetFormat: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' = auto.targetFormat;

        if (globalMode !== 'auto') {
          targetFormat = globalMode;
        }

        return {
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          size: file.size,
          targetFormat,
          autoDetection: auto,
          status: 'idle' as const,
        };
      })
    );

    const fullList = [...items, ...newItems];
    setItems(fullList);
    processAllItems(fullList, globalMode);
  };

  const processAllItems = async (list: ConvertItem[], mode: GlobalFormatMode) => {
    const updated = await Promise.all(
      list.map(async (item) => {
        let fmt = item.targetFormat;
        if (mode !== 'auto') {
          fmt = mode;
        } else if (item.autoDetection) {
          fmt = item.autoDetection.targetFormat;
        }

        try {
          const res = await convertImageFormat(item.file, { targetFormat: fmt });
          return {
            ...item,
            targetFormat: fmt,
            convertedBlob: res.blob,
            convertedUrl: res.url,
            outFilename: res.filename,
            outSize: res.blob.size,
            status: 'done' as const,
          };
        } catch (err: any) {
          return {
            ...item,
            targetFormat: fmt,
            status: 'error' as const,
            error: err.message || 'Conversion failed',
          };
        }
      })
    );

    setItems(updated);
  };

  const handleGlobalModeChange = (mode: GlobalFormatMode) => {
    setGlobalMode(mode);
    processAllItems(items, mode);
  };

  const handleSingleFormatChange = async (id: string, newFmt: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif') => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, targetFormat: newFmt, status: 'converting' as const } : i))
    );

    const targetItem = items.find((i) => i.id === id);
    if (!targetItem) return;

    try {
      const res = await convertImageFormat(targetItem.file, { targetFormat: newFmt });
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                targetFormat: newFmt,
                convertedBlob: res.blob,
                convertedUrl: res.url,
                outFilename: res.filename,
                outSize: res.blob.size,
                status: 'done' as const,
              }
            : i
        )
      );
    } catch (err: any) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: 'error' as const, error: err.message || 'Failed' } : i
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
    <ToolPageShell
      categoryBadge="Image Suite"
      categoryBadgeColor="emerald"
      title={meta.title}
      description={meta.subtitle}
      icon={<RefreshCw className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
    >
      <div className="space-y-6">
        <Dropzone
          onFilesSelected={handleFilesSelected}
          accept="image/*,.heic,.heif,.pdf,.svg"
          title="Drop images, SVGs, or HEIC files to convert"
          subtitle="Auto-detects optimal formats (HEIC → JPG, PNG → WebP) or batch convert manually."
        />

        {items.length > 0 && (
          <div className="space-y-6">
            {/* Controls Bar */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Target Output Format
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select a global mode or customize per file
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleGlobalModeChange('auto')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      globalMode === 'auto'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Smart Auto-Detect
                  </button>
                  <button
                    onClick={() => handleGlobalModeChange('image/webp')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      globalMode === 'image/webp'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    WEBP
                  </button>
                  <button
                    onClick={() => handleGlobalModeChange('image/jpeg')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      globalMode === 'image/jpeg'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    JPG
                  </button>
                  <button
                    onClick={() => handleGlobalModeChange('image/png')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      globalMode === 'image/png'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    PNG
                  </button>
                </div>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {items.filter((i) => i.status === 'done').length} of {items.length} files converted locally
                </span>
              </div>
              <button
                onClick={handleDownloadAllZip}
                disabled={items.filter((i) => i.status === 'done').length === 0}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Archive className="w-4 h-4" /> Download All as ZIP
              </button>
            </div>

            {/* Converted Files List */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden w-full md:w-auto">
                    {item.convertedUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        <img
                          src={item.convertedUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center font-mono text-xs text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                        FILE
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                          {item.name}
                        </h4>
                        {item.autoDetection && globalMode === 'auto' && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold">
                            <Sparkles className="w-3 h-3" /> {item.autoDetection.reason}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{formatBytes(item.size)}</span>
                        {item.outSize && (
                          <>
                            <span>→</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {formatBytes(item.outSize)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                    {/* Per-item target format selector */}
                    <select
                      value={item.targetFormat}
                      onChange={(e) =>
                        handleSingleFormatChange(
                          item.id,
                          e.target.value as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
                        )
                      }
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="image/webp">Convert to WEBP</option>
                      <option value="image/jpeg">Convert to JPG</option>
                      <option value="image/png">Convert to PNG</option>
                    </select>

                    <button
                      onClick={() => handleDownloadSingle(item)}
                      disabled={item.status !== 'done'}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 hover:bg-slate-800 dark:hover:bg-emerald-500 shadow-xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
