import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { FilePlus, Trash2, Download, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { imagesToPDF } from '../../lib/pdfProcessor';
import { ToolPageShell } from './ToolPageShell';

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
    <ToolPageShell
      categoryBadge="PDF Suite"
      categoryBadgeColor="rose"
      title="Convert Images to PDF Online"
      description="Convert JPG, PNG, WebP, and SVG images into a professional PDF document."
      icon={<FilePlus className="w-6 h-6 text-[#ff4d4d]" />}
    >
      <div className="space-y-6">
        <Dropzone
          onFilesSelected={handleImagesSelected}
          title="Drop Photos or Images to Convert to PDF"
          subtitle="Supports JPG, PNG, WebP, SVG. Adjust page size and layout settings."
          accept="image/*"
          multiple={true}
        />

        {images.length > 0 && (
          <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">
                  Page Format
                </label>
                <select
                  value={pageSize}
                  onChange={(e: any) => setPageSize(e.target.value)}
                  className="w-full px-3 py-2 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29] text-xs text-[#2d2d2d] dark:text-white"
                >
                  <option value="a4">Standard A4 (210 x 297 mm)</option>
                  <option value="letter">US Letter (8.5 x 11 in)</option>
                  <option value="fit">Auto-Fit to Image Dimensions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">
                  Page Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e: any) => setOrientation(e.target.value)}
                  className="w-full px-3 py-2 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29] text-xs text-[#2d2d2d] dark:text-white"
                >
                  <option value="portrait">Vertical (Portrait)</option>
                  <option value="landscape">Horizontal (Landscape)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">
                  Border Margin: {margin}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              {images.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="p-3 wobbly-sm bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 wobbly-pill bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#2d2d2d] dark:text-white truncate">
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 wobbly-sm bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] disabled:opacity-30 hover:bg-[#e5e0d8] dark:hover:bg-[#332e29] cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === images.length - 1}
                      className="p-1.5 wobbly-sm bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] disabled:opacity-30 hover:bg-[#e5e0d8] dark:hover:bg-[#332e29] cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeImage(idx)}
                      className="p-1.5 wobbly-sm bg-[#ff4d4d] dark:bg-[#ff4d4d]/60 text-[#ff4d4d] dark:text-[#ff4d4d] hover:bg-[#ff4d4d] ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleGeneratePdf}
                disabled={images.length === 0 || isGenerating}
                className="px-6 py-3 wobbly-sm text-xs font-bold uppercase tracking-wider bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] shadow-hand flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Building PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#2f7a4f] dark:text-white" /> Convert {images.length} Images to PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
