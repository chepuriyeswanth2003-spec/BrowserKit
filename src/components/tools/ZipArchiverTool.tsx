import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Archive, Trash2, Download, Loader2 } from 'lucide-react';
import { createZip } from '../../lib/zipProcessor';
import { ToolPageShell } from './ToolPageShell';

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
    <ToolPageShell
      categoryBadge="Vault Suite"
      categoryBadgeColor="amber"
      title="ZIP Archiver & File Compressor"
      description="Bundle multiple files into a single compressed .zip file 100% locally in your browser."
      icon={<Archive className="w-6 h-6 text-amber-600" />}
    >
      <div className="space-y-6">
        <Dropzone
          onFilesSelected={handleFilesSelected}
          title="Drop Any Files to Create a ZIP Archive"
          subtitle="Combine photos, PDFs, videos, and documents into a compressed .zip file"
          multiple={true}
        />

        {files.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="space-y-1 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Archive Output Filename
                </label>
                <input
                  type="text"
                  value={zipFileName}
                  onChange={(e) => setZipFileName(e.target.value)}
                  placeholder="archive.zip"
                  className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={() => setFiles([])}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All Files
              </button>
            </div>

            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Archive className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
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
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 shadow-md flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isZipping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Compressing Files...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 text-emerald-400 dark:text-white" /> Download ZIP ({files.length} files)
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
