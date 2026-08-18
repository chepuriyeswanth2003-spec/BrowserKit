import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Type, Image as ImageIcon, PenLine, Trash2, Loader2, Download, Eraser } from 'lucide-react';
import {
  applyPDFAnnotations,
  PDFTextAnnotation,
  PDFImageStampAnnotation,
} from '../../lib/pdfProcessor';

interface PdfEditorWorkspaceProps {
  file: File;
  onComplete?: (url: string, filename: string) => void;
}

type Mode = 'text' | 'image' | 'ink' | null;

interface PlacedText {
  id: string;
  pageIndex: number;
  xPct: number;
  yPct: number;
  text: string;
  fontSize: number;
}

export const PdfEditorWorkspace: React.FC<PdfEditorWorkspaceProps> = ({ file, onComplete }) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState<Mode>('text');
  const [placedTexts, setPlacedTexts] = useState<PlacedText[]>([]);
  const [pendingTextPos, setPendingTextPos] = useState<{ x: number; y: number } | null>(null);
  const [pendingTextValue, setPendingTextValue] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [stampImage, setStampImage] = useState<{ blob: Blob; pageIndex: number; xPct: number; yPct: number } | null>(null);
  const [inkStrokesByPage, setInkStrokesByPage] = useState<Record<number, string>>({}); // pageIndex -> dataURL
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const buf = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buf }).promise;
        setNumPages(doc.numPages);
        await renderPage(1, doc);
      } catch (err) {
        console.error('Failed to load PDF preview:', err);
      }
    })();
  }, [file]);

  const saveCurrentInk = () => {
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    // Only save if something was actually drawn (avoid storing blank canvases)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hasInk = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) {
        hasInk = true;
        break;
      }
    }
    if (hasInk) {
      setInkStrokesByPage((prev) => ({ ...prev, [currentPage - 1]: canvas.toDataURL('image/png') }));
    }
  };

  const renderPage = async (pageNo: number, pdfDocObj?: any) => {
    try {
      const doc = pdfDocObj || (await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise);
      const page = await doc.getPage(pageNo);
      const viewport = page.getViewport({ scale: 1.3 });
      const canvas = pdfCanvasRef.current;
      const inkCanvas = inkCanvasRef.current;
      if (!canvas || !inkCanvas) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      inkCanvas.width = viewport.width;
      inkCanvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
      }

      // Restore any previously-drawn ink for this page
      const inkCtx = inkCanvas.getContext('2d');
      if (inkCtx) {
        inkCtx.clearRect(0, 0, inkCanvas.width, inkCanvas.height);
        const existing = inkStrokesByPage[pageNo - 1];
        if (existing) {
          const img = new Image();
          img.onload = () => inkCtx.drawImage(img, 0, 0);
          img.src = existing;
        }
      }
    } catch (err) {
      console.error('Page render error:', err);
    }
  };

  const handlePageChange = (p: number) => {
    if (p < 1 || p > numPages) return;
    saveCurrentInk();
    setCurrentPage(p);
    renderPage(p);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;

    if (mode === 'text') {
      setPendingTextPos({ x: xPct, y: yPct });
      setPendingTextValue('');
    } else if (mode === 'image' && stampImage) {
      setStampImage({ ...stampImage, pageIndex: currentPage - 1, xPct, yPct });
    }
  };

  const commitPendingText = () => {
    if (!pendingTextPos || !pendingTextValue.trim()) {
      setPendingTextPos(null);
      return;
    }
    setPlacedTexts((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        pageIndex: currentPage - 1,
        xPct: pendingTextPos.x,
        yPct: pendingTextPos.y,
        text: pendingTextValue,
        fontSize,
      },
    ]);
    setPendingTextPos(null);
    setPendingTextValue('');
  };

  const removeText = (id: string) => setPlacedTexts((prev) => prev.filter((t) => t.id !== id));

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setStampImage({ blob: f, pageIndex: currentPage - 1, xPct: 0.4, yPct: 0.4 });
    setMode('image');
  };

  // Freehand ink drawing on the overlay canvas
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'ink') return;
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== 'ink') return;
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (isDrawing) saveCurrentInk();
    setIsDrawing(false);
  };

  const clearInkOnPage = () => {
    const canvas = inkCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setInkStrokesByPage((prev) => {
      const next = { ...prev };
      delete next[currentPage - 1];
      return next;
    });
  };

  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return res.blob();
  };

  const handleExport = async () => {
    setProcessing(true);
    saveCurrentInk();
    try {
      const textAnnotations: PDFTextAnnotation[] = placedTexts.map((t) => ({
        pageIndex: t.pageIndex,
        x: t.xPct,
        y: t.yPct,
        text: t.text,
        fontSize: t.fontSize,
        color: { r: 0.1, g: 0.1, b: 0.1 },
      }));

      const imageStamps: PDFImageStampAnnotation[] = stampImage
        ? [
            {
              pageIndex: stampImage.pageIndex,
              x: stampImage.xPct,
              y: stampImage.yPct,
              width: 0.25,
              imageBlob: stampImage.blob,
            },
          ]
        : [];

      const inkAnnotations = await Promise.all(
        (Object.entries(inkStrokesByPage) as [string, string][]).map(async ([pageIdx, dataUrl]) => ({
          pageIndex: parseInt(pageIdx, 10),
          imageBlob: await dataUrlToBlob(dataUrl),
        }))
      );

      const blob = await applyPDFAnnotations(file, textAnnotations, imageStamps, inkAnnotations);
      const url = URL.createObjectURL(blob);
      const filename = `edited_${file.name}`;
      setProcessedUrl(url);
      onComplete?.(url, filename);
    } catch (err) {
      console.error('Failed to export edited PDF:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = `edited_${file.name}`;
    a.click();
  };

  return (
    <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] space-y-5">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-3">
        {(['text', 'image', 'ink'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-2 wobbly-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              mode === m
                ? 'bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white border-transparent'
                : 'bg-white dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
            }`}
          >
            {m === 'text' && (
              <>
                <Type className="w-3.5 h-3.5" /> Add Text
              </>
            )}
            {m === 'image' && (
              <>
                <ImageIcon className="w-3.5 h-3.5" /> Add Image
              </>
            )}
            {m === 'ink' && (
              <>
                <PenLine className="w-3.5 h-3.5" /> Draw
              </>
            )}
          </button>
        ))}

        {mode === 'text' && (
          <div className="flex items-center gap-2 ml-auto text-xs">
            <label className="font-bold text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55]">Size</label>
            <input
              type="number"
              value={fontSize}
              min={8}
              max={72}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 14)}
              className="w-16 px-2 py-1 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29]"
            />
          </div>
        )}
        {mode === 'image' && (
          <button
            onClick={() => stampInputRef.current?.click()}
            className="ml-auto text-xs font-bold text-[#2d5da1] dark:text-[#2d5da1] cursor-pointer"
          >
            Upload Image...
          </button>
        )}
        {mode === 'ink' && (
          <button
            onClick={clearInkOnPage}
            className="ml-auto text-xs font-bold text-[#ff4d4d] dark:text-[#ff4d4d] flex items-center gap-1 cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5" /> Clear Page Drawing
          </button>
        )}
        <input ref={stampInputRef} type="file" accept="image/*" onChange={handleStampUpload} className="hidden" />
      </div>

      <p className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]">
        {mode === 'text' && 'Click anywhere on the page below to place a text box.'}
        {mode === 'image' && (stampImage ? 'Click on the page to reposition your image.' : 'Upload an image, then click the page to place it.')}
        {mode === 'ink' && 'Click and drag on the page to draw freehand.'}
      </p>

      <div className="relative inline-block border border-[2px] border-[#2d2d2d]/[0.4] dark:border-[#f3ede2] wobbly-sm overflow-hidden shadow-hand-sm mx-auto max-w-full">
        <canvas ref={pdfCanvasRef} className="block max-w-full" />
        <canvas
          ref={inkCanvasRef}
          className="absolute inset-0 max-w-full"
          style={{ cursor: mode === 'ink' ? 'crosshair' : mode ? 'copy' : 'default' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onClick={mode !== 'ink' ? handleCanvasClick : undefined}
        />

        {placedTexts
          .filter((t) => t.pageIndex === currentPage - 1)
          .map((t) => (
            <div
              key={t.id}
              className="absolute group"
              style={{ left: `${t.xPct * 100}%`, top: `${t.yPct * 100}%` }}
            >
              <span
                className="bg-[#b8860b]/70 px-1 wobbly-sm whitespace-nowrap"
                style={{ fontSize: `${t.fontSize}px` }}
              >
                {t.text}
              </span>
              <button
                onClick={() => removeText(t.id)}
                className="absolute -top-2 -right-2 hidden group-hover:flex w-4 h-4 wobbly-pill bg-[#ff4d4d] text-white items-center justify-center text-[10px] cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}

        {stampImage && stampImage.pageIndex === currentPage - 1 && (
          <div
            className="absolute border-2 border-dashed border-[#2d5da1] px-2 py-1 text-[10px] font-bold text-[#2d5da1] bg-white/80 wobbly-sm"
            style={{ left: `${stampImage.xPct * 100}%`, top: `${stampImage.yPct * 100}%` }}
          >
            Image placed here
          </div>
        )}

        {pendingTextPos && (
          <div
            className="absolute z-10 bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.4] dark:border-[#f3ede2] wobbly-sm shadow-hand p-2 flex gap-1"
            style={{ left: `${pendingTextPos.x * 100}%`, top: `${pendingTextPos.y * 100}%` }}
          >
            <input
              autoFocus
              type="text"
              value={pendingTextValue}
              onChange={(e) => setPendingTextValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitPendingText()}
              placeholder="Type text..."
              className="text-xs px-2 py-1 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#262220] w-40"
            />
            <button
              onClick={commitPendingText}
              className="text-xs px-2 py-1 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white font-bold cursor-pointer"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {numPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-xs font-bold text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55]">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 wobbly-sm bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] disabled:opacity-30 cursor-pointer"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="px-3 py-1.5 wobbly-sm bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] disabled:opacity-30 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {placedTexts.length > 0 && (
        <div className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]">
          {placedTexts.length} text annotation{placedTexts.length === 1 ? '' : 's'} placed across the document.
        </div>
      )}

      {!processedUrl ? (
        <button
          onClick={handleExport}
          disabled={processing}
          className="w-full py-3 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-hand cursor-pointer disabled:opacity-50"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving Edits...
            </>
          ) : (
            'Save Edited PDF'
          )}
        </button>
      ) : (
        <button
          onClick={handleDownload}
          className="w-full py-3 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-hand cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download Edited PDF
        </button>
      )}
    </div>
  );
};
