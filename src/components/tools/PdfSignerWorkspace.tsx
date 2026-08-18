import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PenTool, Upload, Trash2, Wand2, RefreshCw, CheckCircle, Download } from 'lucide-react';
import { signPDF, SignatureOptions } from '../../lib/pdfProcessor';

interface PdfSignerWorkspaceProps {
  file: File;
  onComplete?: (url: string, filename: string) => void;
}

export const PdfSignerWorkspace: React.FC<PdfSignerWorkspaceProps> = ({ file, onComplete }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);

  // Signature Position on Page (Normalized 0-1)
  const [sigPosX, setSigPosX] = useState<number>(0.6);
  const [sigPosY, setSigPosY] = useState<number>(0.8);
  const [sigWidth, setSigWidth] = useState<number>(150); // Points
  const [sigHeight, setSigHeight] = useState<number>(60); // Points

  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isDrawingPad, setIsDrawingPad] = useState(false);

  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

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
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = pdfCanvasRef.current;
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

  // Signature Drawing Canvas Handlers
  const startDrawingPad = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawingPad(true);
  };

  const drawPad = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingPad) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F172A';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawingPad = async () => {
    setIsDrawingPad(false);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) setSignatureBlob(blob);
    }, 'image/png');
  };

  const clearDrawingPad = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureBlob(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadFile = e.target.files[0];
      setSignatureBlob(uploadFile);
    }
  };

  const handleApplySignature = async () => {
    if (!signatureBlob) {
      alert('Please draw a signature or upload a signature image first.');
      return;
    }
    setProcessing(true);

    try {
      const pdfCanvas = pdfCanvasRef.current;
      const pdfWidth = pdfCanvas?.width || 595;
      const pdfHeight = pdfCanvas?.height || 842;

      // Convert top-left canvas relative coords to pdf-lib bottom-left coords
      const x = sigPosX * pdfWidth;
      const y = (1 - sigPosY) * pdfHeight - sigHeight;

      const opts: SignatureOptions = {
        pageIndex: currentPage,
        x,
        y: Math.max(10, y),
        width: sigWidth,
        height: sigHeight,
        imageBlob: signatureBlob,
      };

      const blob = await signPDF(file, opts);
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProcessing(false);
      if (onComplete) {
        onComplete(url, `signed_${file.name}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error signing PDF document.');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Signature Input Controls */}
      <div className="p-4 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#262220] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] flex items-center gap-2">
            <PenTool className="size-5 text-[#2f7a4f]" />
            Create Your Signature / Stamp
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => setSignatureMode('draw')}
              className={`px-3 py-1.5 wobbly-sm text-xs font-medium border ${
                signatureMode === 'draw'
                  ? 'border-[#2f7a4f] bg-[#2f7a4f] text-[#2f7a4f] dark:bg-[#2f7a4f]/40 dark:text-[#2f7a4f]'
                  : 'border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
              }`}
            >
              Draw Signature
            </button>
            <button
              onClick={() => setSignatureMode('upload')}
              className={`px-3 py-1.5 wobbly-sm text-xs font-medium border ${
                signatureMode === 'upload'
                  ? 'border-[#2f7a4f] bg-[#2f7a4f] text-[#2f7a4f] dark:bg-[#2f7a4f]/40 dark:text-[#2f7a4f]'
                  : 'border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
              }`}
            >
              Upload Image
            </button>
          </div>
        </div>

        {signatureMode === 'draw' ? (
          <div className="space-y-2">
            <div className="border border-[2px] border-[#2d2d2d]/[0.4] dark:border-[#f3ede2] wobbly-sm overflow-hidden bg-[#fdfbf7] dark:bg-[#332e29] inline-block">
              <canvas
                ref={sigCanvasRef}
                width={360}
                height={120}
                onMouseDown={startDrawingPad}
                onMouseMove={drawPad}
                onMouseUp={stopDrawingPad}
                className="cursor-crosshair block"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearDrawingPad}
                className="px-3 py-1 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] text-xs font-medium text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] flex items-center gap-1"
              >
                <Trash2 className="size-3.5" /> Clear Signature Pad
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageUpload}
              className="block w-full text-sm text-[#2d2d2d]/[0.7] file:mr-4 file:py-2 file:px-4 file:wobbly-sm file:border-0 file:text-xs file:font-semibold file:bg-[#2f7a4f] file:text-[#2f7a4f] hover:file:bg-[#2f7a4f]"
            />
          </div>
        )}
      </div>

      {/* Target Page Preview & Placement Controls */}
      <div className="p-4 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#262220] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]">Position Signature on Page {currentPage} of {numPages}</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] text-xs font-medium disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs font-mono text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55]">{currentPage} / {numPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= numPages}
              className="px-3 py-1.5 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] text-xs font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] mb-1">Horizontal Position ({Math.round(sigPosX * 100)}%)</label>
            <input
              type="range"
              min="0.05"
              max="0.85"
              step="0.01"
              value={sigPosX}
              onChange={(e) => setSigPosX(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] mb-1">Vertical Position ({Math.round(sigPosY * 100)}%)</label>
            <input
              type="range"
              min="0.05"
              max="0.90"
              step="0.01"
              value={sigPosY}
              onChange={(e) => setSigPosY(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Live Canvas Preview with Position Indicator */}
        <div className="relative inline-block border border-[2px] border-[#2d2d2d]/[0.4] dark:border-[#f3ede2] wobbly-sm overflow-hidden shadow-hand-sm">
          <canvas ref={pdfCanvasRef} className="block max-w-full" />
          <div
            className="absolute border-2 border-[#2f7a4f] bg-[#2f7a4f]/20 flex items-center justify-center text-[10px] font-bold text-[#2f7a4f] wobbly-sm"
            style={{
              left: `${sigPosX * 100}%`,
              top: `${sigPosY * 100}%`,
              width: '120px',
              height: '45px',
            }}
          >
            Signature Preview
          </div>
        </div>
      </div>

      {!processedUrl && (
        <button
          onClick={handleApplySignature}
          disabled={processing || !signatureBlob}
          className="w-full py-3.5 px-4 wobbly-sm bg-[#2d2d2d] dark:bg-[#3a352f] text-white dark:text-[#f3ede2] font-semibold hover:bg-[#2d2d2d] dark:hover:bg-[#3a352f] disabled:opacity-50 transition-all btn-interactive flex items-center justify-center gap-2 shadow-hand-sm"
        >
          {processing ? (
            <>
              <RefreshCw className="size-5 animate-spin" />
              Stamping Signature onto Document...
            </>
          ) : (
            <>
              <Wand2 className="size-5" />
              Sign Document Now
            </>
          )}
        </button>
      )}

      {processedUrl && (
        <div className="p-6 wobbly-sm border border-[2px] border-[#2f7a4f] dark:border-[#2f7a4f]/80 bg-[#2f7a4f]/50 dark:bg-[#2f7a4f]/20 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-6 text-[#2f7a4f] dark:text-[#2f7a4f] shrink-0" />
            <div>
              <h4 className="font-semibold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]">Signature Applied Successfully!</h4>
              <p className="text-xs text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55]">Signature embedded into page {currentPage} at target coordinates.</p>
            </div>
          </div>

          <a
            href={processedUrl}
            download={`signed_${file.name}`}
            className="w-full py-3 px-4 wobbly-sm bg-[#2f7a4f] hover:bg-[#2f7a4f] text-white font-semibold transition-all btn-interactive flex items-center justify-center gap-2 shadow-hand text-center block"
          >
            <Download className="size-5 inline" />
            Download Signed PDF
          </a>
        </div>
      )}
    </div>
  );
};
