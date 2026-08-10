import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { FilePlus, Trash2, Download, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { imagesToPDF } from '../../lib/pdfProcessor';
import { PrivacyBadge } from '../PrivacyBadge';

export const ImagesToPdfTool: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(20);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleImagesSelected = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    setImages((prev) => [...prev, ...imageFiles]);
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    const temp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = temp;
    setImages(next);
  };

  const moveDown = (idx: number) => {
    if (idx === images.length - 1) return;
    const next = [...images];
    const temp = next[idx + 1];
    next[idx + 1] = next[idx];
    next[idx] = temp;
    setImages(next);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    try {
      const pdfBlob = await imagesToPDF(images, pageSize, orientation, margin);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `images_converted_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating PDF from images:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <FilePlus className="w-6 h-6 text-rose-600" />
              Convert Images to PDF
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Convert JPG, PNG, WebP, and SVG images into a professional PDF document.
            </p>
          </div>
          <PrivacyBadge />
        </div>

        <Dropzone
          onFilesSelected={handleImagesSelected}
          title="Drop Photos or Images to Convert to PDF"
          subtitle="Supports JPG, PNG, WebP, SVG. Adjust page size and layout settings."
          accept="image/*"
          multiple={true}
        />
      </div>

      {images.length > 0 && (
        <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-neutral-100"
              >
                <option value="a4">Standard A4</option>
                <option value="letter">US Letter</option>
                <option value="fit">Fit Page to Image Size</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Orientation
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-neutral-100"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Page Margin: {margin}pt
              </label>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="w-full accent-black dark:accent-white cursor-pointer"
              />
            </div>
          </div>

          {/* List of images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Images Sequence ({images.length})
              </span>
              <button
                onClick={() => setImages([])}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {images.map((file, idx) => (
                <div
                  key={`img-pdf-${idx}-${file.name}`}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-xs font-mono font-bold w-5 text-slate-500">
                      {idx + 1}.
                    </span>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <span className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeImage(idx)}
                      className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-rose-500"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Compact Dropzone for adding more images to batch */}
            <Dropzone
              variant="compact"
              accept="image/*"
              onFilesSelected={handleImagesSelected}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Building PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Convert {images.length} Images to PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <PrivacyBadge />
    </div>
  );
};
