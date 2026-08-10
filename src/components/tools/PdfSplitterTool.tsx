import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Scissors, FileText, Download, Loader2, Trash2 } from 'lucide-react';
import { splitPDF, getPDFPageCount } from '../../lib/pdfProcessor';
import { PrivacyBadge } from '../PrivacyBadge';

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
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Scissors className="w-6 h-6 text-rose-600" />
            Split PDF & Extract Pages
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Extract specific page ranges (e.g. 1-3, 5, 8-10) or split pages into a new PDF document.
          </p>
        </div>

        {!pdfFile ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            title="Drop PDF File to Extract or Split Pages"
            subtitle="Select specific page ranges (e.g. 1, 3, 5-8) to split locally"
            accept="application/pdf,.pdf"
            multiple={false}
          />
        ) : (
          <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-xs sm:max-w-md">
                    {pdfFile.name}
                  </h3>
                  <p className="text-xs font-mono text-neutral-500 mt-0.5">
                    Total Document Pages: <span className="font-bold text-neutral-900 dark:text-neutral-100">{totalPages} Pages</span>
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Remove File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                  Enter Page Numbers to Extract (e.g., 1, 3, 5-8)
                </label>
                <input
                  type="text"
                  value={pageSelection}
                  onChange={(e) => setPageSelection(e.target.value)}
                  placeholder="e.g. 1-3, 5, 7"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
                <p className="text-[11px] text-neutral-500">
                  Use commas for individual pages and hyphens for page ranges.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSplit}
                disabled={isSplitting}
                className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
              >
                {isSplitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Extracting Pages...
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" /> Extract Selected Pages
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <PrivacyBadge />
    </div>
  );
};
