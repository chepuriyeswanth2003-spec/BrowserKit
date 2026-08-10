import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { PrivacyBadge } from '../PrivacyBadge';
import { AdSlot } from '../AdSlot';
import { ProcessedImage } from '../../types';
import { TOOL_METADATA } from '../../lib/seoData';
import { compressImage, createBatchZip, formatBytes } from '../../lib/imageCompressor';
import { Download, Archive, RefreshCw, Trash2, Sliders, CheckCircle, ArrowRight } from 'lucide-react';
import { trackEvent } from '../../lib/analyticsSentry';

interface CompressorToolProps {
  onDownloadTrigger: (
    filename?: string,
    count?: number,
    files?: { name: string; blob?: Blob; url?: string; size?: number }[]
  ) => void;
}

export const CompressorTool: React.FC<CompressorToolProps> = ({ onDownloadTrigger }) => {
  const meta = TOOL_METADATA.compressor;
  const [items, setItems] = useState<ProcessedImage[]>([]);
  const [quality, setQuality] = useState<number>(0.8);
  const [targetSizeKB, setTargetSizeKB] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<string>('original');
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);

  const handleFilesSelected = async (files: File[]) => {
    trackEvent('compressor_files_uploaded', { count: files.length });

    const newItems: ProcessedImage[] = files.map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      name: f.name,
      originalSize: f.size,
      originalUrl: URL.createObjectURL(f),
      format: f.type || 'image/jpeg',
      width: 0,
      height: 0,
      status: 'idle',
    }));

    setItems((prev) => [...prev, ...newItems]);
    processBatch([...items, ...newItems], quality, targetSizeKB, outputFormat);
  };

  const processBatch = async (
    listToProcess: ProcessedImage[],
    qValue: number,
    targetKBStr: string,
    formatOpt: string
  ) => {
    setIsProcessingBatch(true);
    const targetKB = targetKBStr ? parseFloat(targetKBStr) : undefined;

    const updated = await Promise.all(
      listToProcess.map(async (item) => {
        try {
          const targetFmt =
            formatOpt === 'original'
              ? item.format
              : formatOpt === 'image/webp'
              ? 'image/webp'
              : formatOpt === 'image/jpeg'
              ? 'image/jpeg'
              : 'image/png';

          const res = await compressImage(item.file, {
            quality: qValue,
            targetSizeKB: targetKB,
            targetFormat: targetFmt,
          });

          return {
            ...item,
            processedSize: res.blob.size,
            processedUrl: res.url,
            width: res.width,
            height: res.height,
            format: res.format,
            status: 'done' as const,
          };
        } catch (err: any) {
          return {
            ...item,
            status: 'error' as const,
            error: err.message || 'Compression failed',
          };
        }
      })
    );

    setItems(updated);
    setIsProcessingBatch(false);
  };

  const handleRecompress = (q: number, kbStr: string, fmt: string) => {
    setQuality(q);
    setTargetSizeKB(kbStr);
    setOutputFormat(fmt);
    if (items.length > 0) {
      processBatch(items, q, kbStr, fmt);
    }
  };

  const getDoneFilesList = () => {
    return items
      .filter((i) => i.status === 'done' && i.processedUrl)
      .map((i) => {
        const ext = i.format.split('/')[1] || 'jpg';
        const cleanName = i.name.substring(0, i.name.lastIndexOf('.')) || i.name;
        return {
          name: `${cleanName}_compressed.${ext}`,
          url: i.processedUrl,
          blob: i.processedBlob,
          size: i.compressedSize,
        };
      });
  };

  const handleDownloadSingle = (item: ProcessedImage) => {
    if (!item.processedUrl) return;
    const a = document.createElement('a');
    a.href = item.processedUrl;
    const ext = item.format.split('/')[1] || 'jpg';
    const cleanName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    a.download = `${cleanName}_compressed.${ext}`;
    a.click();

    const doneFiles = getDoneFilesList();
    onDownloadTrigger(item.name, 1, doneFiles);
  };

  const handleDownloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.processedUrl);
    if (doneItems.length === 0) return;

    const doneFiles = getDoneFilesList();
    const zipBlob = await createBatchZip(doneItems);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imagetoolkit_compressed.zip';
    a.click();
    URL.revokeObjectURL(url);

    onDownloadTrigger('imagetoolkit_compressed.zip', doneItems.length, doneFiles);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {meta.title}
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
          {meta.subtitle}
        </p>
      </div>

      {/* Main Upload Dropzone */}
      <Dropzone onFilesSelected={handleFilesSelected} />

      {/* Control Panel & File List */}
      {items.length > 0 && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-neutral-700 dark:text-neutral-300" /> Compression Settings
              </h3>
              <button
                onClick={clearAll}
                className="text-xs text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All ({items.length})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quality Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Quality Level</span>
                  <span className="text-neutral-900 dark:text-neutral-100 font-mono">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) =>
                    handleRecompress(parseFloat(e.target.value), targetSizeKB, outputFormat)
                  }
                  className="w-full accent-black dark:accent-white cursor-pointer"
                />
              </div>

              {/* Target File Size in KB */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">Target Max Size (Optional KB)</label>
                <input
                  type="number"
                  placeholder="e.g. 100 KB"
                  value={targetSizeKB}
                  onChange={(e) => handleRecompress(quality, e.target.value, outputFormat)}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              {/* Format Override */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => handleRecompress(quality, targetSizeKB, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                >
                  <option value="original">Preserve Original Format</option>
                  <option value="image/webp">Convert to WebP (Next-Gen)</option>
                  <option value="image/jpeg">Convert to JPG</option>
                  <option value="image/png">Convert to PNG</option>
                </select>
              </div>
            </div>
          </div>

          {/* Batch Download Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Processed Files ({items.length})
            </span>

            <button
              onClick={handleDownloadAllZip}
              disabled={isProcessingBatch}
              className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Archive className="w-4 h-4" /> Download All as ZIP
            </button>
          </div>

          {/* Items Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const diffPct =
                item.processedSize && item.originalSize
                  ? Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100)
                  : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={item.processedUrl || item.originalUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-700"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                        <span>{formatBytes(item.originalSize)}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-400" />
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {item.processedSize ? formatBytes(item.processedSize) : '...'}
                        </span>
                      </div>

                      {diffPct > 0 && (
                        <span className="inline-block text-[10px] font-mono font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                          Saved {diffPct}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDownloadSingle(item)}
                      disabled={item.status !== 'done'}
                      className="p-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all disabled:opacity-50"
                      title="Download compressed file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ad Unit below tool */}
      <AdSlot type="below-tool" />

      {/* FAQ Section */}
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
