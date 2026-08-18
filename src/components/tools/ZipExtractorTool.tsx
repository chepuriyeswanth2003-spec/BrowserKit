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
      icon={<FolderArchive className="w-6 h-6 text-[#b8860b]" />}
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
          <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 wobbly-sm bg-[#b8860b] dark:bg-[#b8860b]/60 text-[#b8860b] dark:text-[#b8860b] border border-[2px] border-[#b8860b] dark:border-[#b8860b]">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white truncate max-w-xs sm:max-w-md">
                    {zipFile.name}
                  </h3>
                  <p className="text-xs font-mono text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]">
                    Contained Files: {entries.length} | Size: {(zipFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExtractAll}
                  className="px-4 py-2 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-hand cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Extract All
                </button>

                <button
                  onClick={clearZip}
                  className="p-2 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] hover:bg-[#ff4d4d] dark:hover:bg-[#ff4d4d]/40 transition-colors cursor-pointer"
                  title="Remove archive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-[#b8860b] dark:text-[#b8860b] animate-spin mx-auto" />
                <p className="text-xs font-mono font-bold text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55]">Reading ZIP Central Directory...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 wobbly-sm bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-4 h-4 text-[#2d2d2d]/[0.7] shrink-0" />
                      <span className="text-xs font-mono font-bold text-[#2d2d2d] dark:text-white truncate">
                        {entry.name}
                      </span>
                    </div>

                    {!entry.isDirectory && (
                      <button
                        onClick={() => handleExtractSingle(entry.name)}
                        className="px-3 py-1.5 wobbly-sm bg-[#e5e0d8] dark:bg-[#332e29] hover:bg-[#2f7a4f] hover:text-white dark:hover:bg-[#2f7a4f] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
