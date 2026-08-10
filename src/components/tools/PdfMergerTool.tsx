import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { FileText, ArrowUp, ArrowDown, Trash2, Download, Loader2, FilePlus } from 'lucide-react';
import { mergePDFs } from '../../lib/pdfProcessor';
import { PrivacyBadge } from '../PrivacyBadge';

export const PdfMergerTool: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);

  const handleFilesSelected = (files: File[]) => {
    const validPdfs = files.filter((f) => f.type.includes('pdf') || f.name.endsWith('.pdf'));
    setPdfFiles((prev) => [...prev, ...validPdfs]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...pdfFiles];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setPdfFiles(next);
  };

  const moveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    const next = [...pdfFiles];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setPdfFiles(next);
  };

  const removeFile = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) return;
    setIsMerging(true);
    try {
      const mergedBlob = await mergePDFs(pdfFiles);
      const url = URL.createObjectURL(mergedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merged_document_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error merging PDFs:', err);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <FilePlus className="w-6 h-6 text-rose-600" />
            Merge PDF Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Combine multiple PDF files into one clean document in the order you want.
          </p>
        </div>

        <Dropzone
          onFilesSelected={handleFilesSelected}
          title="Drop PDF Files to Merge"
          subtitle="Combine multiple PDF documents into one single file (100% Client-Side)"
          accept="application/pdf,.pdf"
          multiple={true}
        />
      </div>

      {pdfFiles.length > 0 && (
        <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              Selected PDFs ({pdfFiles.length})
            </h3>
            <button
              onClick={() => setPdfFiles([])}
              className="text-xs text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>

          <div className="space-y-2">
            {pdfFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {file.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === pdfFiles.length - 1}
                    className="p-1.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 disabled:opacity-30 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 rounded bg-rose-100 text-rose-600 hover:bg-rose-200 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Dropzone
                variant="compact"
                accept="application/pdf,.pdf"
                onFilesSelected={handleFilesSelected}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleMerge}
              disabled={pdfFiles.length < 2 || isMerging}
              className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              {isMerging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Merging Documents...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Merge {pdfFiles.length} PDFs
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
