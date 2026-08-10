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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <Scissors className="w-6 h-6 text-rose-600" />
              Split PDF & Extract Pages
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Extract specific page ranges (e.g. 1-3, 5, 8-10) or split pages into a new PDF document.
            </p>
          </div>
          <PrivacyBadge />
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
              <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-md">
                  {pdfFile.name}
                </h3>
                <p className="text-xs font-mono text-neutral-500">
                  Total Document Pages: {totalPages} | Size: {(pdfFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
              Pages to Extract (comma-separated or ranges):
            </label>
            <input
              type="text"
              value={pageSelection}
              onChange={(e) => setPageSelection(e.target.value)}
              placeholder="e.g. 1, 3, 5-8"
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
            <p className="text-[11px] text-neutral-500 font-mono">
              Example: "1, 2, 5" extracts pages 1, 2 and 5. "1-4" extracts pages 1 through 4.
            </p>
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
    </div>
  );
};
