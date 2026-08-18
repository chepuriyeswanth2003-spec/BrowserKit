import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Scissors, FileText, Download, Loader2, Trash2 } from 'lucide-react';
import { splitPDF, getPDFPageCount } from '../../lib/pdfProcessor';
import { ToolPageShell } from './ToolPageShell';

export const PdfSplitterTool: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageSelection, setPageSelection] = useState<string>('1');
  const [isSplitting, setIsSplitting] = useState<boolean>(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setPdfFile(file);
    try {
      const count = await getPDFPageCount(file);
      setTotalPages(count);
      setPageSelection(`1-${Math.min(count, 3)}`);
    } catch {
      setTotalPages(1);
    }
  };

  const parsePageNumbers = (input: string, max: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.max(1, start); p <= Math.min(max, end); p++) {
            pages.add(p);
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= max) {
          pages.add(p);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!pdfFile || totalPages === 0) return;
    setIsSplitting(true);
    try {
      const pagesToExtract = parsePageNumbers(pageSelection, totalPages);
      if (pagesToExtract.length === 0) {
        alert('Please enter valid page numbers (e.g., 1, 3, 5-8).');
        return;
      }

      const splitBlob = await splitPDF(pdfFile, pagesToExtract);
      const url = URL.createObjectURL(splitBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted_pages_${pdfFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error splitting PDF:', err);
    } finally {
      setIsSplitting(false);
    }
  };

  const clearFile = () => {
    setPdfFile(null);
    setTotalPages(0);
  };

  return (
    <ToolPageShell
      categoryBadge="PDF Suite"
      categoryBadgeColor="rose"
      title="Split PDF & Extract Pages Online"
      description="Extract specific page ranges (e.g. 1-3, 5, 8-10) or split pages into a new PDF document."
      icon={<Scissors className="w-6 h-6 text-[#ff4d4d]" />}
    >
      <div className="space-y-6">
        {!pdfFile ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            title="Drop PDF File to Extract or Split Pages"
            subtitle="Select specific page ranges (e.g. 1, 3, 5-8) to split locally"
            accept=".pdf"
            multiple={false}
          />
        ) : (
          <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 wobbly-sm bg-[#ff4d4d] dark:bg-[#ff4d4d]/60 text-[#ff4d4d] dark:text-[#ff4d4d]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white truncate max-w-xs sm:max-w-md">
                    {pdfFile.name}
                  </h3>
                  <p className="text-xs font-mono text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] mt-0.5">
                    Total Document Pages: <span className="font-bold text-[#2d2d2d] dark:text-white">{totalPages} Pages</span>
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] hover:bg-[#ff4d4d] dark:hover:bg-[#ff4d4d]/40 transition-colors cursor-pointer"
                title="Remove File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2d2d2d]/[0.92] dark:text-[#f3ede2]/[0.55] block">
                  Enter Page Numbers to Extract (e.g., 1, 3, 5-8)
                </label>
                <input
                  type="text"
                  value={pageSelection}
                  onChange={(e) => setPageSelection(e.target.value)}
                  placeholder="e.g. 1-3, 5, 7"
                  className="w-full px-3.5 py-2.5 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29] text-xs font-mono text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]"
                />
                <p className="text-[11px] text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]">
                  Use commas for individual pages and hyphens for page ranges.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSplit}
                disabled={isSplitting}
                className="px-6 py-3 wobbly-sm text-xs font-bold uppercase tracking-wider bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] shadow-hand flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSplitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Extracting Pages...
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4 text-[#2f7a4f] dark:text-white" /> Extract Selected Pages
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
