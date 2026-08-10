import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { FolderArchive, Download, Trash2, Loader2, FileText, Check } from 'lucide-react';
import { readZipEntries, extractZipEntry, extractAllZipEntries } from '../../lib/zipProcessor';
import JSZip from 'jszip';
import { ZipEntryItem } from '../../types';
import { PrivacyBadge } from '../PrivacyBadge';

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
      // strip parent path for filename
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
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <FolderArchive className="w-6 h-6 text-amber-600" />
              ZIP File Extractor & Viewer
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Unpack .zip archives, view contained files, and extract individual items locally.
            </p>
          </div>
          <PrivacyBadge />
        </div>

        {!zipFile ? (
          <Dropzone
            onFilesSelected={handleZipSelected}
            title="Drop .ZIP File to View & Extract Contents"
            subtitle="Inspect files, check folder trees, and extract items directly in browser"
            accept=".zip,application/zip,application/x-zip-compressed"
            multiple={false}
          />
        ) : (
        <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-md">
                  {zipFile.name}
                </h3>
                <p className="text-xs font-mono text-neutral-500">
                  Total Items: {entries.length} | Size: {(zipFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExtractAll}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" /> Extract All
              </button>
              <button
                onClick={clearZip}
                className="p-2 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-500" />
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {entry.name}
                    </span>
                  </div>

                  {!entry.isDirectory && (
                    <button
                      onClick={() => handleExtractSingle(entry.name)}
                      className="p-1.5 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-800 dark:text-neutral-200 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
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
    </div>
  );
};
