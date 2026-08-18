import React, { useRef, useState, useEffect } from 'react';
import { Upload, ImagePlus, FileCheck, Clipboard, FolderPlus, Sparkles } from 'lucide-react';

export interface DropzoneProps {
  onFilesSelected?: (files: File[]) => void;
  onFileSelect?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'compact' | 'mini';
  enableGlobalDrop?: boolean;
}

// Recursive helper to traverse dropped directories (folders) and collect files
async function extractFilesFromDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
  const files: File[] = [];
  const items = Array.from(dataTransfer.items || []);

  const scanEntry = async (entry: any) => {
    if (!entry) return;
    if (entry.isFile) {
      await new Promise<void>((resolve) => {
        entry.file(
          (file: File) => {
            files.push(file);
            resolve();
          },
          () => resolve()
        );
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const readEntries = async (): Promise<any[]> => {
        return new Promise((resolve) => {
          reader.readEntries((entries: any[]) => resolve(entries), () => resolve([]));
        });
      };
      let entries = await readEntries();
      while (entries.length > 0) {
        for (const childEntry of entries) {
          await scanEntry(childEntry);
        }
        entries = await readEntries();
      }
    }
  };

  const promises = items.map(async (item) => {
    if (item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        await scanEntry(entry);
        return;
      }
    }
    const file = item.getAsFile();
    if (file) files.push(file);
  });

  await Promise.all(promises);

  // Fallback to standard files list if scanner yielded no files
  if (files.length === 0 && dataTransfer.files && dataTransfer.files.length > 0) {
    return Array.from(dataTransfer.files);
  }

  return files;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  onFileSelect,
  accept = 'image/*,.pdf,.zip,.heic,.heif,.mp4,.webm,.mov,.mp3,.wav',
  multiple = true,
  title = 'Drag & drop files or folders here to start',
  subtitle = 'Supports images, HEIC, PDFs, Videos, Audios, and ZIP archives. 100% Client-Side Private Processing.',
  variant = 'default',
  enableGlobalDrop = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGlobalDragOver, setIsGlobalDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const notifyFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    if (onFilesSelected) onFilesSelected(files);
    if (onFileSelect) onFileSelect(files);
  };

  // Clipboard Paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;

      const pastedFiles: File[] = [];
      const items = Array.from(e.clipboardData.items);

      items.forEach((item) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      });

      if (pastedFiles.length > 0) {
        e.preventDefault();
        notifyFilesSelected(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected, onFileSelect]);

  // Global Page Drag-and-Drop Handler
  useEffect(() => {
    if (!enableGlobalDrop) return;

    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current += 1;
      if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
        setIsGlobalDragOver(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsGlobalDragOver(false);
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleWindowDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsGlobalDragOver(false);

      if (e.dataTransfer) {
        const filesArray = (await extractFilesFromDataTransfer(e.dataTransfer)) as File[];
        notifyFilesSelected(filesArray);
      }
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [enableGlobalDrop, onFilesSelected, onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer) {
      const filesArray = (await extractFilesFromDataTransfer(e.dataTransfer)) as File[];
      notifyFilesSelected(filesArray);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      notifyFilesSelected(filesArray);
      e.target.value = '';
    }
  };

  if (variant === 'compact' || variant === 'mini') {
    return (
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative block cursor-pointer wobbly-sm border-2 border-dashed p-4 text-center transition-all duration-200 outline-none flex items-center justify-center gap-3 ${
          isDragOver
            ? 'border-[#2d2d2d] bg-[#e5e0d8] dark:border-white dark:bg-[#332e29] scale-[1.01]'
            : 'border-[#2d2d2d]/[0.4] dark:border-[#f3ede2] hover:border-[#2d2d2d] dark:hover:border-[#f3ede2]/[0.15] bg-white dark:bg-[#332e29] shadow-hand-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
        />
        <div className="p-2 wobbly-sm bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d]/[0.92] dark:text-[#f3ede2]/[0.55]">
          <Upload className="size-4" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] flex items-center gap-1.5">
            <span>Add or drop more files / folders</span>
            <span className="text-[10px] px-1.5 py-0.5 wobbly-sm bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] font-mono">
              Batch
            </span>
          </p>
          <p className="text-[11px] text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]">
            Click or tap to browse or drop items anywhere on page
          </p>
        </div>
      </label>
    );
  }

  return (
    <div className="w-full relative">
      {/* Global Drag-and-Drop Overlay */}
      {isGlobalDragOver && (
        <div className="fixed inset-0 z-50 bg-[#1a1a1a]/85 backdrop-blur-md text-white flex flex-col items-center justify-center p-6 animate-fade-in pointer-events-none">
          <div className="p-6 wobbly-md bg-[#2d2d2d] border-2 border-[#2d2d2d] flex flex-col items-center justify-center text-center gap-4 max-w-lg shadow-hand-lg animate-bounce">
            <Upload className="size-16 text-white" />
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Drop Files or Folders Anywhere!</h2>
              <p className="text-sm text-[#2d2d2d]/[0.7] mt-1 font-mono">
                BrowserKit will automatically load and process files locally in your browser.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Upload Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative wobbly-md border-[3px] border-dashed p-8 sm:p-12 text-center transition-all duration-150 flex flex-col items-center justify-center gap-6 ${
          isDragOver
            ? 'border-[#ff4d4d] bg-[#fff9c4]/40 dark:bg-[#3a352f] scale-[1.01] shadow-hand'
            : 'border-[#2d2d2d] dark:border-[#f3ede2] hover:border-[#2d5da1] dark:hover:border-[#2d5da1] bg-white dark:bg-[#2d2822] shadow-hand-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
          id="main-dropzone-input"
        />

        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleInputChange}
          className="sr-only"
          id="folder-dropzone-input"
        />

        {/* Central Icon */}
        <div className="size-16 wobbly-sm bg-[#fff9c4] dark:bg-[#3a352f] border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] flex items-center justify-center text-[#2d2d2d] dark:text-[#f3ede2] shadow-hand-sm rotate-2">
          {isDragOver ? <FileCheck className="size-8 text-[#2f7a4f] dark:text-[#7dd3a0]" /> : <ImagePlus className="size-8 text-[#2d2d2d] dark:text-[#f3ede2]" />}
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-[#2d2d2d] dark:text-[#f3ede2]">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-[#2d2d2d]/70 dark:text-[#f3ede2]/70 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Action Buttons: Choose File / Choose Folder */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <label
            htmlFor="main-dropzone-input"
            className="btn-primary"
          >
            <Upload className="size-4" /> Select Files
          </label>

          <label
            htmlFor="folder-dropzone-input"
            className="btn-secondary"
          >
            <FolderPlus className="size-4" /> Select Folder
          </label>
        </div>

        {/* Footer Hint Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono text-[#2d2d2d]/70 dark:text-[#f3ede2]/70">
          <span className="flex items-center gap-1 px-2.5 py-1 wobbly-pill bg-white dark:bg-[#2d2822] border-[2px] border-[#2d2d2d] dark:border-[#f3ede2]">
            <Clipboard className="size-3" /> Paste Image (Ctrl+V / Cmd+V)
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 wobbly-pill bg-white dark:bg-[#2d2822] border-[2px] border-[#2d2d2d] dark:border-[#f3ede2]">
            <Sparkles className="size-3 text-[#ff4d4d]" /> 100% Private On-Device Processing
          </span>
        </div>
      </div>
    </div>
  );
};
