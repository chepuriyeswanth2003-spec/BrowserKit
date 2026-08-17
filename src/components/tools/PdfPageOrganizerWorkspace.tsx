import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Layers, RotateCw, Trash2, ArrowLeft, ArrowRight, Wand2, RefreshCw, CheckCircle, Download } from 'lucide-react';
import { organizePDFPages, OrganizedPageSpec } from '../../lib/pdfProcessor';

interface PdfPageOrganizerWorkspaceProps {
  file: File;
  onComplete?: (url: string, filename: string) => void;
}

interface PageCardState {
  id: string;
  originalPageIndex: number; // 1-based
  rotationAngle: number; // 0, 90, 180, 270
  thumbnailUrl: string;
}

export const PdfPageOrganizerWorkspace: React.FC<PdfPageOrganizerWorkspaceProps> = ({ file, onComplete }) => {
  const [pages, setPages] = useState<PageCardState[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadThumbnails = async () => {
      setLoading(true);
      try {
        const buf = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buf }).promise;
        const pageCards: PageCardState[] = [];

        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);

            pageCards.push({
              id: `page_${i}_${Math.random()}`,
              originalPageIndex: i,
              rotationAngle: 0,
              thumbnailUrl,
            });
          }
        }

        setPages(pageCards);
        setLoading(false);
      } catch (err) {
        console.error('Failed to render page thumbnails:', err);
        setLoading(false);
      }
    };

    loadThumbnails();
  }, [file]);

  const movePage = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPages(updated);
  };

  const rotatePage = (index: number) => {
    const updated = [...pages];
    updated[index].rotationAngle = (updated[index].rotationAngle + 90) % 360;
    setPages(updated);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      alert('Document must contain at least one page.');
      return;
    }
    setPages(pages.filter((_, idx) => idx !== index));
  };

  const handleApplyChanges = async () => {
    setProcessing(true);
    try {
      const specs: OrganizedPageSpec[] = pages.map((p) => ({
        originalPageIndex: p.originalPageIndex,
        rotationAngle: p.rotationAngle,
      }));

      const blob = await organizePDFPages(file, specs);
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProcessing(false);
      if (onComplete) {
        onComplete(url, `organized_${file.name}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error reorganizing PDF pages.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="size-8 animate-spin text-rose-600 mx-auto" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rendering page thumbnails...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="size-5 text-indigo-600" />
            Visual Page Organizer ({pages.length} Pages)
          </h4>
          <p className="text-xs text-slate-500">Reorder pages with arrows, click rotate to turn individual pages, or delete unneeded pages.</p>
        </div>
      </div>

      {/* Grid of Page Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.map((p, idx) => (
          <div
            key={p.id}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2 flex flex-col items-center shadow-xs"
          >
            <div className="relative border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900">
              <img
                src={p.thumbnailUrl}
                alt={`Page ${p.originalPageIndex}`}
                className="max-h-40 object-contain transition-transform"
                style={{ transform: `rotate(${p.rotationAngle}deg)` }}
              />
              <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                Page {p.originalPageIndex}
              </span>
            </div>

            <div className="flex items-center gap-1 w-full justify-between pt-1">
              <button
                onClick={() => movePage(idx, -1)}
                disabled={idx === 0}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                title="Move Left"
              >
                <ArrowLeft className="size-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={() => rotatePage(idx)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Rotate 90°"
              >
                <RotateCw className="size-4 text-indigo-600" />
              </button>
              <button
                onClick={() => deletePage(idx)}
                className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
                title="Delete Page"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                onClick={() => movePage(idx, 1)}
                disabled={idx === pages.length - 1}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                title="Move Right"
              >
                <ArrowRight className="size-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!processedUrl && (
        <button
          onClick={handleApplyChanges}
          disabled={processing}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-all btn-interactive flex items-center justify-center gap-2 shadow-sm"
        >
          {processing ? (
            <>
              <RefreshCw className="size-5 animate-spin" />
              Rebuilding PDF Document...
            </>
          ) : (
            <>
              <Wand2 className="size-5" />
              Apply Page Organization & Rebuild Document
            </>
          )}
        </button>
      )}

      {processedUrl && (
        <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">PDF Reorganized Successfully!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Page sequence, rotations, and deletions applied on-device.</p>
            </div>
          </div>

          <a
            href={processedUrl}
            download={`organized_${file.name}`}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all btn-interactive flex items-center justify-center gap-2 shadow-md text-center block"
          >
            <Download className="size-5 inline" />
            Download Reorganized PDF
          </a>
        </div>
      )}
    </div>
  );
};
