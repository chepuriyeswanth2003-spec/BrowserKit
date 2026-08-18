import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { ProcessedImage } from '../../types';
import { TOOL_METADATA } from '../../lib/seoData';
import { compressImage, createBatchZip, formatBytes } from '../../lib/imageCompressor';
import { Download, Archive, RefreshCw, Trash2, Sliders, CheckCircle, Minimize2 } from 'lucide-react';
import { trackEvent } from '../../lib/analyticsSentry';
import { ToolPageShell } from './ToolPageShell';

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

    const updatedList = await Promise.all(
      listToProcess.map(async (item) => {
        if (item.status === 'done' && !targetKBStr && formatOpt === 'original') {
          return item;
        }

        try {
          const res = await compressImage(item.file, {
            quality: qValue,
            targetSizeKB: targetKB,
            targetFormat: formatOpt !== 'original' ? formatOpt : undefined,
          });

          return {
            ...item,
            processedSize: res.blob.size,
            processedUrl: res.url,
            width: res.width,
            height: res.height,
            format: res.blob.type,
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

    setItems(updatedList);
    setIsProcessingBatch(false);
  };

  const handleQualityChange = (val: number) => {
    setQuality(val);
    processBatch(items, val, targetSizeKB, outputFormat);
  };

  const handleTargetKBChange = (val: string) => {
    setTargetSizeKB(val);
    processBatch(items, quality, val, outputFormat);
  };

  const handleFormatChange = (fmt: string) => {
    setOutputFormat(fmt);
    processBatch(items, quality, targetSizeKB, fmt);
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
          size: i.processedSize,
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
    a.download = 'browserkit_compressed.zip';
    a.click();
    URL.revokeObjectURL(url);

    onDownloadTrigger('browserkit_compressed.zip', doneItems.length, doneFiles);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  return (
    <ToolPageShell
      categoryBadge="Image Suite"
      categoryBadgeColor="emerald"
      title={meta.title}
      description={meta.subtitle}
      icon={<Minimize2 className="w-6 h-6 text-[#2f7a4f] dark:text-[#2f7a4f]" />}
    >
      <div className="space-y-6">
        <Dropzone onFilesSelected={handleFilesSelected} />

        {items.length > 0 && (
          <div className="space-y-6">
            {/* Controls Bar */}
            <div className="p-5 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-3">
                <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> Compression Settings
                </h3>
                <button
                  onClick={clearAll}
                  className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All ({items.length})
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quality Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">
                    <span>Target Quality: {Math.round(quality * 100)}%</span>
                    <span className="text-[#2d2d2d]/[0.7] font-normal">
                      {quality > 0.85 ? 'Best Visuals' : quality > 0.6 ? 'Balanced' : 'Max Compression'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Target KB Threshold */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">
                    Target KB Cap (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={targetSizeKB}
                      onChange={(e) => handleTargetKBChange(e.target.value)}
                      className="w-full px-3 py-1.5 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29] text-xs text-[#2d2d2d] dark:text-white"
                    />
                    <div className="flex gap-1">
                      {['50', '100', '200'].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handleTargetKBChange(preset)}
                          className={`px-2 py-1 wobbly-sm text-[11px] font-mono font-bold cursor-pointer ${
                            targetSizeKB === preset
                              ? 'bg-[#2f7a4f] text-white'
                              : 'bg-white dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] border border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
                          }`}
                        >
                          {preset}K
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Output Format Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => handleFormatChange(e.target.value)}
                    className="w-full px-3 py-2 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29] text-xs text-[#2d2d2d] dark:text-white"
                  >
                    <option value="original">Original Format</option>
                    <option value="image/webp">WebP (Smallest File Size)</option>
                    <option value="image/jpeg">JPG / JPEG</option>
                    <option value="image/png">PNG</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 wobbly-md bg-[#2f7a4f] dark:bg-[#2f7a4f]/40 border border-[2px] border-[#2f7a4f] dark:border-[#2f7a4f]/60">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2f7a4f] dark:text-[#2f7a4f]">
                <CheckCircle className="w-4 h-4 text-[#2f7a4f] dark:text-[#2f7a4f] shrink-0" />
                <span>
                  {items.filter((i) => i.status === 'done').length} of {items.length} images compressed locally
                </span>
              </div>
              <button
                onClick={handleDownloadAllZip}
                disabled={items.filter((i) => i.status === 'done').length === 0}
                className="w-full sm:w-auto px-5 py-2.5 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-hand hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] disabled:opacity-50 transition-all cursor-pointer"
              >
                <Archive className="w-4 h-4" /> Download All as ZIP
              </button>
            </div>

            {/* File List */}
            <div className="space-y-3">
              {items.map((item) => {
                const savings =
                  item.originalSize && item.processedSize
                    ? Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100)
                    : 0;

                return (
                  <div
                    key={item.id}
                    className="p-4 wobbly-md bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-hand-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
                      <div className="w-12 h-12 wobbly-sm bg-[#e5e0d8] dark:bg-[#332e29] overflow-hidden shrink-0 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]">
                        <img
                          src={item.processedUrl || item.originalUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#2d2d2d] dark:text-white truncate max-w-xs">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] mt-0.5">
                          <span>{formatBytes(item.originalSize)}</span>
                          {item.processedSize && (
                            <>
                              <span>→</span>
                              <span className="font-bold text-[#2f7a4f] dark:text-[#2f7a4f]">
                                {formatBytes(item.processedSize)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                      {savings > 0 && (
                        <span className="px-2.5 py-1 wobbly-pill bg-[#2f7a4f] text-white font-mono font-bold text-[11px] border-[2px] border-[#2d2d2d]">
                          -{savings}%
                        </span>
                      )}

                      <button
                        onClick={() => handleDownloadSingle(item)}
                        disabled={item.status !== 'done'}
                        className="px-4 py-2 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] shadow-hand-sm transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] hover:bg-[#ff4d4d] dark:hover:bg-[#ff4d4d]/40 transition-colors cursor-pointer"
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
      </div>
    </ToolPageShell>
  );
};
