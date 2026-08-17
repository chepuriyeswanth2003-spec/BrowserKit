import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ShieldAlert, Trash2, Wand2, RefreshCw, CheckCircle, Download } from 'lucide-react';
import { redactPDF, PageRedaction, RedactionRect } from '../../lib/pdfProcessor';

interface PdfRedactionWorkspaceProps {
  file: File;
  onComplete?: (url: string, filename: string) => void;
}

export const PdfRedactionWorkspace: React.FC<PdfRedactionWorkspaceProps> = ({ file, onComplete }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [redactionsMap, setRedactionsMap] = useState<Map<number, RedactionRect[]>>(new Map());
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<RedactionRect | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDoc = async () => {
      try {
        const buf = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buf }).promise;
        setNumPages(doc.numPages);
        renderPage(1, doc);
      } catch (err) {
        console.error('Failed to load PDF preview:', err);
      }
    };
    loadDoc();
  }, [file]);

  const renderPage = async (pageNo: number, pdfDocObj?: any) => {
    try {
      const doc = pdfDocObj || (await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise);
      const page = await doc.getPage(pageNo);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
      }
    } catch (err) {
      console.error('Page render error:', err);
    }
  };

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= numPages) {
      setCurrentPage(p);
      renderPage(p);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const curX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const curY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const x = Math.min(startPos.x, curX);
    const y = Math.min(startPos.y, curY);
    const width = Math.abs(curX - startPos.x);
    const height = Math.abs(curY - startPos.y);

    setCurrentRect({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentRect && currentRect.width > 0.01 && currentRect.height > 0.01) {
      setRedactionsMap((prev) => {
        const next = new Map(prev);
        const list = (next.get(currentPage) as RedactionRect[] | undefined) || [];
        next.set(currentPage, [...list, currentRect]);
        return next;
      });
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentRect(null);
  };

  const handleClearCurrentPageRedactions = () => {
    setRedactionsMap((prev) => {
      const next = new Map(prev);
      next.delete(currentPage);
      return next;
    });
  };

  const handleApplyRedactions = async () => {
    setProcessing(true);
    try {
      const redactionList: PageRedaction[] = [];
      redactionsMap.forEach((rects, pageIndex) => {
        if (rects.length > 0) {
          redactionList.push({ pageIndex, rects });
        }
      });

      if (redactionList.length === 0) {
        alert('Please draw at least one redaction box on the page preview.');
        setProcessing(false);
        return;
      }

      const blob = await redactPDF(file, redactionList);
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProcessing(false);
      if (onComplete) {
        onComplete(url, `redacted_${file.name}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error processing redactions.');
      setProcessing(false);
    }
  };

  const currentRects = redactionsMap.get(currentPage) || [];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-rose-600" />
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Draw Redaction Boxes (Page {currentPage} of {numPages})</h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{currentPage} / {numPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= numPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium disabled:opacity-40"
            >
              Next
            </button>
            <button
              onClick={handleClearCurrentPageRedactions}
              disabled={currentRects.length === 0}
              className="ml-3 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 text-xs font-medium disabled:opacity-40 flex items-center gap-1"
            >
              <Trash2 className="size-3.5" />
              Clear Page
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Click and drag on the page preview below to draw privacy redaction boxes over sensitive text or images.
        </p>

        {/* Canvas & Overlay Container */}
        <div className="relative inline-block border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm select-none">
          <canvas ref={canvasRef} className="block max-w-full" />
          <div
            ref={overlayRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="absolute inset-0 cursor-crosshair"
          >
            {/* Existing Redaction Boxes */}
            {currentRects.map((rect, idx) => (
              <div
                key={idx}
                className="absolute bg-black border border-rose-500 opacity-90"
                style={{
                  left: `${rect.x * 100}%`,
                  top: `${rect.y * 100}%`,
                  width: `${rect.width * 100}%`,
                  height: `${rect.height * 100}%`,
                }}
              />
            ))}

            {/* Currently Drawing Box */}
            {currentRect && (
              <div
                className="absolute bg-black/70 border-2 border-rose-500 border-dashed"
                style={{
                  left: `${currentRect.x * 100}%`,
                  top: `${currentRect.y * 100}%`,
                  width: `${currentRect.width * 100}%`,
                  height: `${currentRect.height * 100}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {!processedUrl && (
        <button
          onClick={handleApplyRedactions}
          disabled={processing || redactionsMap.size === 0}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-all btn-interactive flex items-center justify-center gap-2 shadow-sm"
        >
          {processing ? (
            <>
              <RefreshCw className="size-5 animate-spin" />
              Burning Pixel Redactions...
            </>
          ) : (
            <>
              <Wand2 className="size-5" />
              Apply Pixel Redactions ({Array.from(redactionsMap.values()).reduce((a: number, b: RedactionRect[]) => a + (b ? b.length : 0), 0)} Boxes)
            </>
          )}
        </button>
      )}

      {processedUrl && (
        <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Redaction Complete & Privacy Verified!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Zero extractable vector text survives under redacted areas.</p>
            </div>
          </div>

          <a
            href={processedUrl}
            download={`redacted_${file.name}`}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all btn-interactive flex items-center justify-center gap-2 shadow-md text-center block"
          >
            <Download className="size-5 inline" />
            Download Redacted PDF
          </a>
        </div>
      )}
    </div>
  );
};
