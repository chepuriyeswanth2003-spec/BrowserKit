import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  X,
  Download,
  ShieldCheck,
  Archive,
  Loader2,
  Check,
  FileText,
  Image as ImageIcon,
  Film,
  FileCode,
  Package,
} from 'lucide-react';
import JSZip from 'jszip';
import { AdSlot } from './AdSlot';

export interface ProcessedFileItem {
  name: string;
  blob?: Blob;
  url?: string;
  size?: number;
}

interface PostDownloadAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
  itemCount?: number;
  processedFiles?: ProcessedFileItem[];
  onDownloadZip?: () => Promise<void> | void;
}

export const PostDownloadAdModal: React.FC<PostDownloadAdModalProps> = ({
  isOpen,
  onClose,
  fileName,
  itemCount = 1,
  processedFiles = [],
  onDownloadZip,
}) => {
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipSuccess, setZipSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setZipSuccess(false);
      setIsZipping(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZipDownload = async () => {
    if (onDownloadZip) {
      setIsZipping(true);
      try {
        await onDownloadZip();
        setZipSuccess(true);
      } catch (err) {
        console.error('Error triggering ZIP download:', err);
      } finally {
        setIsZipping(false);
      }
      return;
    }

    if (!processedFiles || processedFiles.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();

      for (let i = 0; i < processedFiles.length; i++) {
        const item = processedFiles[i];
        let fileBlob = item.blob;

        if (!fileBlob && item.url) {
          const resp = await fetch(item.url);
          fileBlob = await resp.blob();
        }

        if (fileBlob) {
          zip.file(item.name || `file_${i + 1}`, fileBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;

      const zipName = fileName
        ? fileName.replace(/\.[^/.]+$/, '') + '_batch_archive.zip'
        : `mediacraft_batch_${Date.now()}.zip`;

      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setZipSuccess(true);
    } catch (err) {
      console.error('Failed to generate ZIP archive:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const getFileIcon = (fileItemName: string) => {
    const ext = fileItemName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '')) {
      return <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) {
      return <Film className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    }
    return <FileCode className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
  };

  const totalFilesCount = processedFiles.length > 0 ? processedFiles.length : itemCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 text-neutral-900 dark:text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Download Complete</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              {totalFilesCount > 1
                ? `Successfully processed ${totalFilesCount} files.`
                : `Successfully saved ${fileName || 'your file'}.`}
            </p>
          </div>
        </div>

        {/* Batch Archive ZIP Card */}
        {(processedFiles.length > 0 || onDownloadZip || itemCount > 1) && (
          <div className="mb-5 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                  Batch ZIP Archive
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                {totalFilesCount} {totalFilesCount === 1 ? 'file' : 'files'}
              </span>
            </div>

            {/* Scrollable File List Preview if processedFiles are provided */}
            {processedFiles.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {processedFiles.map((file, idx) => (
                  <div
                    key={`batch-file-${idx}-${file.name}`}
                    className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      {getFileIcon(file.name)}
                      <span className="text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {file.name}
                      </span>
                    </div>
                    {file.url && (
                      <a
                        href={file.url}
                        download={file.name}
                        className="p-1 rounded text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                        title={`Download ${file.name}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Single ZIP Archive Download Button */}
            <button
              onClick={handleZipDownload}
              disabled={isZipping}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                zipSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
              } shadow-xs disabled:opacity-50 active:scale-98`}
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Bundling ZIP Archive...
                </>
              ) : zipSuccess ? (
                <>
                  <Check className="w-4 h-4" /> ZIP Archive Downloaded!
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 text-emerald-400" /> Download All ({totalFilesCount}) as ZIP Archive (.zip)
                </>
              )}
            </button>
          </div>
        )}

        {/* Ad Unit inside post-download modal */}
        <AdSlot type="modal" />

        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <span>Zero server data retained</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all"
          >
            Done / Convert More
          </button>
        </div>
      </div>
    </div>
  );
};

