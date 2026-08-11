import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { FileText, ArrowUp, ArrowDown, Trash2, Download, Loader2, FilePlus } from 'lucide-react';
import { mergePDFs } from '../../lib/pdfProcessor';
import { ToolPageShell } from './ToolPageShell';

export const PdfMergerTool: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);

  const handleFilesSelected = (files: File[]) => {
    const validPdfs = files.filter((f) => f.type.toLowerCase().includes('pdf') || f.name.toLowerCase().endsWith('.pdf') || f.type === '');
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
    <ToolPageShell
      categoryBadge="PDF Suite"
      categoryBadgeColor="rose"
      title="Merge PDF Documents Online"
      description="Combine multiple PDF files into one clean document in the order you want 100% locally."
      icon={<FilePlus className="w-6 h-6 text-rose-600" />}
    >
      <div className="space-y-6">
        <Dropzone
          onFilesSelected={handleFilesSelected}
          title="Drop PDF Files to Merge"
          subtitle="Combine multiple PDF documents into one single file (100% Client-Side)"
          accept=".pdf"
          multiple={true}
        />

        {pdfFiles.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Selected PDFs ({pdfFiles.length})
              </h3>
              <button
                onClick={() => setPdfFiles([])}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>

            <div className="space-y-2">
              {pdfFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === pdfFiles.length - 1}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-200 ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleMerge}
                disabled={pdfFiles.length < 2 || isMerging}
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 shadow-md flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Merging Documents...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-400 dark:text-white" /> Merge {pdfFiles.length} PDFs
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
