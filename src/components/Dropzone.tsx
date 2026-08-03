import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, ImagePlus, FileCheck, Clipboard, FolderPlus, Sparkles } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
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
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  });

  await Promise.all(promises);

  if (files.length === 0 && dataTransfer.files && dataTransfer.files.length > 0) {
    return Array.from(dataTransfer.files);
  }

  return files;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  accept = 'image/*,.heic,.heif,.pdf,.svg',
  multiple = true,
  title = 'Drag & drop your files or folders here',
  subtitle = 'Supports images, PDFs, SVGs, iPhone HEIC photos & entire folders',
  variant = 'default',
  enableGlobalDrop = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGlobalDragOver, setIsGlobalDragOver] = useState(false);
  const [justPasted, setJustPasted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef<number>(0);

  // Global window drag-and-drop listener
  useEffect(() => {
    if (!enableGlobalDrop) return;

    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        dragCounterRef.current += 1;
        if (dragCounterRef.current === 1) {
          setIsGlobalDragOver(true);
        }
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
      setIsDragOver(false);

      if (e.dataTransfer) {
        const extracted = await extractFilesFromDataTransfer(e.dataTransfer);
        if (extracted.length > 0) {
          onFilesSelected(extracted);
        }
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
  }, [enableGlobalDrop, onFilesSelected]);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items);
      const pasteFiles: File[] = [];

      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) pasteFiles.push(file);
        }
      }

      if (pasteFiles.length > 0) {
        e.preventDefault();
        onFilesSelected(pasteFiles);
        setJustPasted(true);
        setTimeout(() => setJustPasted(false), 2000);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer) {
      const extracted = await extractFilesFromDataTransfer(e.dataTransfer);
      if (extracted.length > 0) {
        onFilesSelected(extracted);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      // Reset input value so re-selecting same files works
      e.target.value = '';
    }
  };

  if (variant === 'compact' || variant === 'mini') {
    return (
      <div className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 outline-none flex items-center justify-center gap-3 ${
            isDragOver
              ? 'border-slate-900 bg-slate-200 dark:border-white dark:bg-slate-800 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-100 bg-slate-50/50 dark:bg-slate-900/40'
          }`}
        >
          <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Add or drop more files / folders</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono">
                Batch
              </span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click to browse or drop items anywhere on page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Global Drag-and-Drop Overlay */}
      {isGlobalDragOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md text-white flex flex-col items-center justify-center p-6 animate-fade-in pointer-events-none">
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center text-center space-y-4 max-w-lg shadow-2xl animate-bounce">
            <Upload className="w-16 h-16 text-white" />
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
                Drop Files or Folders Anywhere
              </h2>
              <p className="text-sm font-medium text-slate-300 mt-1">
                Release to immediately import into batch queue
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-200 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <FolderPlus className="w-4 h-4" /> Folder Traversal Supported
            </div>
          </div>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-200 outline-none ${
          isDragOver
            ? 'border-slate-900 bg-slate-200/80 dark:border-white dark:bg-slate-800/80 scale-[1.01] shadow-lg'
            : justPasted
            ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-800'
            : 'border-slate-300 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-100 bg-slate-50/50 dark:bg-slate-900/30 hover:shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Local Dragover Visual Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-slate-950/90 text-white flex flex-col items-center justify-center p-6 z-20 animate-fade-in backdrop-blur-xs">
            <Upload className="w-12 h-12 mb-2 text-white animate-bounce" />
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              RELEASE TO IMPORT BATCH
            </h3>
            <p className="text-xs font-mono font-medium text-slate-300 mt-1">
              Supports Files, Images & Full Folder Trees
            </p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm relative">
            <Upload className="w-7 h-7 text-slate-900 dark:text-white" />
            <Sparkles className="w-4 h-4 text-slate-400 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-2.5 mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ImagePlus className="w-4 h-4 text-white dark:text-slate-900" /> Browse Files
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" /> Camera
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <Clipboard className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> Paste (Ctrl+V)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <FolderPlus className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> Drop Folders
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <FileCheck className="w-3.5 h-3.5" /> 100% Client-Side
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


