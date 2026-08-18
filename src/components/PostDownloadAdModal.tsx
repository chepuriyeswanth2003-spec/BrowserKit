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
        : `browserkit_batch_${Date.now()}.zip`;

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
      return <ImageIcon className="w-3.5 h-3.5 text-[#2f7a4f] shrink-0" />;
    }
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) {
      return <Film className="w-3.5 h-3.5 text-[#2d5da1] shrink-0" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-3.5 h-3.5 text-[#ff4d4d] shrink-0" />;
    }
    return <FileCode className="w-3.5 h-3.5 text-[#2d2d2d]/[0.7] shrink-0" />;
  };

  const totalFilesCount = processedFiles.length > 0 ? processedFiles.length : itemCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d2d2d]/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden wobbly-md bg-[#fdfbf7] dark:bg-[#2d2822] border-[3px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand-lg p-6 text-[#2d2d2d] dark:text-[#f3ede2]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 wobbly-sm text-[#2d2d2d]/60 dark:text-[#f3ede2]/60 hover:text-[#2d2d2d] dark:hover:text-[#f3ede2] hover:bg-[#e5e0d8] dark:hover:bg-[#3a352f] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 wobbly-sm bg-[#fff9c4] dark:bg-[#3a352f] text-[#2f7a4f] dark:text-[#7dd3a0] shrink-0 border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] -rotate-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Batch Complete!</h3>
            <p className="text-xs text-[#2d2d2d]/60 dark:text-[#f3ede2]/60 font-mono">
              {totalFilesCount > 1
                ? `Successfully processed ${totalFilesCount} files.`
                : `Successfully saved ${fileName || 'your file'}.`}
            </p>
          </div>
        </div>

        {/* Batch Archive ZIP Card */}
        {(processedFiles.length > 0 || onDownloadZip || itemCount > 1) && (
          <div className="mb-5 p-4 wobbly-sm bg-white dark:bg-[#332e29] border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-[#2d5da1]" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Batch ZIP Archive
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 wobbly-pill bg-[#fff9c4] dark:bg-[#3a352f] font-bold border-[2px] border-[#2d2d2d] dark:border-[#f3ede2]">
                {totalFilesCount} {totalFilesCount === 1 ? 'file' : 'files'}
              </span>
            </div>

            {/* Scrollable File List Preview if processedFiles are provided */}
            {processedFiles.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {processedFiles.map((file, idx) => (
                  <div
                    key={`batch-file-${idx}-${file.name}`}
                    className="p-2 wobbly-sm bg-[#fdfbf7] dark:bg-[#2d2822] border-[2px] border-[#2d2d2d]/40 dark:border-[#f3ede2]/40 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      {getFileIcon(file.name)}
                      <span className="text-xs font-mono font-medium truncate">
                        {file.name}
                      </span>
                    </div>
                    {file.url && (
                      <a
                        href={file.url}
                        download={file.name}
                        className="p-1 wobbly-sm text-[#2d2d2d]/50 dark:text-[#f3ede2]/50 hover:text-[#2d2d2d] dark:hover:text-[#f3ede2] transition-colors cursor-pointer"
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
              className={`w-full ${zipSuccess ? 'bg-[#2f7a4f] text-white border-[#2d2d2d]' : 'btn-primary'} disabled:opacity-50`}
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
                  <Package className="w-4 h-4" /> Download All ({totalFilesCount}) as ZIP
                </>
              )}
            </button>
          </div>
        )}

        {/* Ad Unit inside post-download modal */}
        <AdSlot type="modal" />

        <div className="mt-4 pt-4 border-t-2 border-dashed border-[#2d2d2d]/20 dark:border-[#f3ede2]/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#2d2d2d]/60 dark:text-[#f3ede2]/60">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero server data retained</span>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary !px-5 !py-2.5"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

