import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Archive, Trash2, Download, Loader2 } from 'lucide-react';
import { createZip } from '../../lib/zipProcessor';
import { PrivacyBadge } from '../PrivacyBadge';

export const ZipArchiverTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [zipFileName, setZipFileName] = useState<string>('archive.zip');
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateZip = async () => {
    if (files.length === 0) return;
    setIsZipping(true);
    try {
      const name = zipFileName.endsWith('.zip') ? zipFileName : `${zipFileName}.zip`;
      const zipBlob = await createZip(files, name);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Archive className="w-6 h-6 text-amber-600" />
            ZIP Archiver & File Compressor
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Bundle multiple files into a single compressed .zip file 100% locally in your browser.
          </p>
        </div>

        <Dropzone
          onFilesSelected={handleFilesSelected}
          title="Drop Any Files to Create a ZIP Archive"
          subtitle="Combine photos, PDFs, videos, and documents into a compressed .zip file"
          multiple={true}
        />
      </div>

      {files.length > 0 && (
        <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="space-y-1 w-full sm:w-auto">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Archive Output Filename
              </label>
              <input
                type="text"
                value={zipFileName}
                onChange={(e) => setZipFileName(e.target.value)}
                placeholder="archive.zip"
                className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <button
              onClick={() => setFiles([])}
              className="text-xs text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Files
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Archive className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {file.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-neutral-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleCreateZip}
              disabled={files.length === 0 || isZipping}
              className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Compressing Files...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" /> Download ZIP ({files.length} files)
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
