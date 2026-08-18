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
      icon={<FilePlus className="w-6 h-6 text-[#ff4d4d]" />}
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
          <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-3">
              <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#ff4d4d] dark:text-[#ff4d4d]" />
                Selected PDFs ({pdfFiles.length})
              </h3>
              <button
                onClick={() => setPdfFiles([])}
                className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>

            <div className="space-y-2">
              {pdfFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="p-3 wobbly-sm bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 wobbly-pill bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#2d2d2d] dark:text-white truncate">
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 wobbly-sm bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] disabled:opacity-30 hover:bg-[#e5e0d8] dark:hover:bg-[#332e29] cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === pdfFiles.length - 1}
                      className="p-1.5 wobbly-sm bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] disabled:opacity-30 hover:bg-[#e5e0d8] dark:hover:bg-[#332e29] cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFile(index)}
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
                onClick={handleMerge}
                disabled={pdfFiles.length < 2 || isMerging}
                className="px-6 py-3 wobbly-sm text-xs font-bold uppercase tracking-wider bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] shadow-hand flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Merging Documents...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#2f7a4f] dark:text-white" /> Merge {pdfFiles.length} PDFs
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
