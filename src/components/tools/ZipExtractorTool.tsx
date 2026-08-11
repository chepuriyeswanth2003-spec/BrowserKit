import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { FolderArchive, Download, Trash2, Loader2, FileText } from 'lucide-react';
import { readZipEntries, extractZipEntry, extractAllZipEntries } from '../../lib/zipProcessor';
import JSZip from 'jszip';
import { ZipEntryItem } from '../../types';
import { ToolPageShell } from './ToolPageShell';

export const ZipExtractorTool: React.FC = () => {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ZipEntryItem[]>([]);
  const [zipInstance, setZipInstance] = useState<JSZip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleZipSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setZipFile(file);
    setIsLoading(true);

    try {
      const { entries: parsedEntries, zipInstance: inst } = await readZipEntries(file);
      setEntries(parsedEntries);
      setZipInstance(inst);
    } catch (err) {
      console.error('Failed to read ZIP file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractSingle = async (entryName: string) => {
    if (!zipInstance) return;
    try {
      const blob = await extractZipEntry(zipInstance, entryName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = entryName.split('/').pop() || entryName;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error extracting single entry:', err);
    }
  };

  const handleExtractAll = async () => {
    if (!zipInstance) return;
    try {
      const extractedFiles = await extractAllZipEntries(zipInstance);
      for (const item of extractedFiles) {
        const url = URL.createObjectURL(item.blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanName = item.name.split('/').pop() || item.name;
        a.download = cleanName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error extracting all files:', err);
    }
  };

  const clearZip = () => {
    setZipFile(null);
    setEntries([]);
    setZipInstance(null);
  };

  return (
    <ToolPageShell
      categoryBadge="Vault Suite"
      categoryBadgeColor="amber"
      title="ZIP File Extractor & Viewer"
      description="Unpack .zip archives, view contained files, and extract individual items locally."
      icon={<FolderArchive className="w-6 h-6 text-amber-600" />}
    >
      <div className="space-y-6">
        {!zipFile ? (
          <Dropzone
            onFilesSelected={handleZipSelected}
            title="Drop .ZIP File to View & Extract Contents"
            subtitle="Inspect files, check folder trees, and extract items directly in browser"
            accept=".zip,application/zip,application/x-zip-compressed"
            multiple={false}
          />
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {zipFile.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Contained Files: {entries.length} | Size: {(zipFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExtractAll}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Extract All
                </button>

                <button
                  onClick={clearZip}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Remove archive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-spin mx-auto" />
                <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">Reading ZIP Central Directory...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                        {entry.name}
                      </span>
                    </div>

                    {!entry.isDirectory && (
                      <button
                        onClick={() => handleExtractSingle(entry.name)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Extract
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
