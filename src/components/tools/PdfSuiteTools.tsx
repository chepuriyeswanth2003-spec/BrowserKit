import React, { useState } from 'react';
import { 
  FileText, Minimize2, Unlock, Lock, FilePlus, Image as ImageIcon, 
  RotateCw, Hash, Stamp, ShieldAlert, Crop, FileCode, Layers, 
  FileCheck, Sparkles, Languages, Edit3, PenTool, CheckCircle, 
  Download, RefreshCw, Eye, AlertCircle, Wand2, Search, Plus, Trash2, FileDiff, Grid, Sun
} from 'lucide-react';
import { ToolType } from '../../types';
import { Dropzone } from '../Dropzone';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { ProcessedFileItem } from '../PostDownloadAdModal';
import { ToolPageShell } from './ToolPageShell';
import { 
  extractPDFPagesText, 
  extractPDFPagesStructuredText,
  renderPDFPagesToJPGs, 
  createDocxFromPDFText, 
  createPptxFromPDFText, 
  convertWordToPdfBlob, 
  convertExcelToPdfBlob, 
  convertPptxToPdfBlob, 
  comparePDFsText,
  compressPDF,
  addWatermarkToPDF,
  addPageNumbersToPDF,
  nUpPDF,
  grayscalePDF,
  invertPDFColors,
  flattenPDFForms,
  splitPDFToChunks,
  ocrPDF,
  redactPDF,
  updatePDFMetadata,
  signPDF,
  organizePDFPages
} from '../../lib/pdfProcessor';
import JSZip from 'jszip';
import { Change } from 'diff';
import { PdfRedactionWorkspace } from './PdfRedactionWorkspace';
import { PdfPageOrganizerWorkspace } from './PdfPageOrganizerWorkspace';
import { PdfSignerWorkspace } from './PdfSignerWorkspace';
import { PdfMetadataWorkspace } from './PdfMetadataWorkspace';

interface PdfSuiteToolsProps {
  toolType: ToolType;
  onDownloadTrigger?: (filename?: string, count?: number, files?: ProcessedFileItem[]) => void;
}

export const PdfSuiteTools: React.FC<PdfSuiteToolsProps> = ({ toolType, onDownloadTrigger }) => {
  const [file, setFile] = useState<File | null>(null);
  const [secondFile, setSecondFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('document.pdf');
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [diffResults, setDiffResults] = useState<Change[] | null>(null);

  // Stirling-PDF Options
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkPosition, setWatermarkPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.35);
  const [watermarkRotation, setWatermarkRotation] = useState<number>(45);
  const [skipCoverPage, setSkipCoverPage] = useState<boolean>(false);

  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right'>('bottom-center');
  const [pageNumberFormat, setPageNumberFormat] = useState<'Page {X} of {Y}' | '{X} / {Y}' | 'Page {X}'>('Page {X} of {Y}');

  const [compressionPreset, setCompressionPreset] = useState<'light' | 'recommended' | 'extreme'>('recommended');
  const [nUpPages, setNUpPages] = useState<2 | 4>(2);
  const [rotationAngle, setRotationAngle] = useState<number>(90);

  const getInputSpec = (type: ToolType) => {
    if (type === 'word-to-pdf') {
      return { accept: '.docx,.doc', title: 'Select Word Document (.docx)', subtitle: 'Converts Word files directly to PDF on-device' };
    }
    if (type === 'excel-to-pdf') {
      return { accept: '.xlsx,.xls', title: 'Select Excel Spreadsheet (.xlsx)', subtitle: 'Converts Excel spreadsheets directly to PDF on-device' };
    }
    if (type === 'ppt-to-pdf') {
      return { accept: '.pptx,.ppt', title: 'Select PowerPoint Presentation (.pptx)', subtitle: 'Converts PowerPoint slides directly to PDF on-device' };
    }
    if (type === 'html-to-pdf') {
      return { accept: '.html,.htm', title: 'Select HTML Document (.html)', subtitle: 'Converts HTML code directly to PDF on-device' };
    }
    // ALL OTHER PDF TOOLS REQUIRE A PDF FILE AS INPUT!
    return { accept: '.pdf', title: 'Select PDF Document (.pdf)', subtitle: '100% local browser processing — zero server uploads' };
  };

  const inputSpec = getInputSpec(toolType);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      if (!file) {
        setFile(files[0]);
      } else if (toolType === 'pdf-compare' && !secondFile) {
        setSecondFile(files[0]);
      } else {
        setFile(files[0]);
      }
      setProcessedUrl(null);
      setExtractedText(null);
      setDiffResults(null);
    }
  };

  const processPdfTool = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      let outBlob: Blob;
      let outFileName = `processed_${file.name}`;

      switch (toolType) {
        case 'pdf-to-word': {
          const structuredPages = await extractPDFPagesStructuredText(file);
          outBlob = await createDocxFromPDFText(structuredPages);
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.docx`;
          break;
        }

        case 'pdf-to-ppt': {
          const structuredPages = await extractPDFPagesStructuredText(file);
          outBlob = await createPptxFromPDFText(structuredPages);
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.pptx`;
          break;
        }

        case 'word-to-pdf': {
          outBlob = await convertWordToPdfBlob(file);
          outFileName = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
          break;
        }

        case 'excel-to-pdf': {
          outBlob = await convertExcelToPdfBlob(file);
          outFileName = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
          break;
        }

        case 'ppt-to-pdf': {
          outBlob = await convertPptxToPdfBlob(file);
          outFileName = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
          break;
        }

        case 'pdf-to-excel': {
          const structuredPages = await extractPDFPagesStructuredText(file);
          let csvContent = '';
          structuredPages.forEach((page) => {
            page.paragraphs.forEach((para) => {
              if (para.trim()) {
                const escaped = para.replace(/"/g, '""');
                csvContent += `"${escaped}"\n`;
              }
            });
          });
          outBlob = new Blob([csvContent], { type: 'text/csv' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.csv`;
          break;
        }

        case 'pdf-to-markdown': {
          const structuredPages = await extractPDFPagesStructuredText(file);
          const mdLines: string[] = [];
          structuredPages.forEach((p) => {
            mdLines.push(p.text);
            mdLines.push('\n---\n');
          });
          const fullMd = mdLines.join('\n');
          setExtractedText(fullMd);
          outBlob = new Blob([fullMd], { type: 'text/markdown' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.md`;
          break;
        }

        case 'pdf-ocr': {
          const ocrText = await ocrPDF(file);
          setExtractedText(ocrText);
          outBlob = new Blob([ocrText], { type: 'text/plain' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}_ocr.txt`;
          break;
        }

        case 'pdf-compare': {
          if (!secondFile) {
            alert('Please select a second PDF file to compare.');
            setProcessing(false);
            return;
          }
          const { report, diffs } = await comparePDFsText(file, secondFile);
          setExtractedText(report);
          setDiffResults(diffs);
          outBlob = new Blob([report], { type: 'text/plain' });
          outFileName = `comparison_${file.name.replace(/\.pdf$/i, '')}_vs_${secondFile.name.replace(/\.pdf$/i, '')}.txt`;
          break;
        }

        case 'pdf-to-jpg': {
          const pagesJPG = await renderPDFPagesToJPGs(file);
          if (pagesJPG.length === 1) {
            outBlob = pagesJPG[0].blob;
            outFileName = pagesJPG[0].filename;
          } else {
            const zip = new JSZip();
            pagesJPG.forEach((item) => {
              zip.file(item.filename, item.blob);
            });
            outBlob = await zip.generateAsync({ type: 'blob' });
            outFileName = `${file.name.replace(/\.pdf$/i, '')}_images.zip`;
          }
          break;
        }

        case 'pdf-compressor': {
          outBlob = await compressPDF(file, compressionPreset);
          outFileName = `compressed_${file.name}`;
          break;
        }

        case 'pdf-rotator': {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const pages = pdfDoc.getPages();
          pages.forEach((page) => {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + rotationAngle) % 360));
          });
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `rotated_${file.name}`;
          break;
        }

        case 'pdf-watermark': {
          outBlob = await addWatermarkToPDF(file, watermarkText || 'CONFIDENTIAL', {
            position: watermarkPosition,
            opacity: watermarkOpacity,
            rotationAngle: watermarkRotation,
            skipCoverPage,
          });
          outFileName = `watermarked_${file.name}`;
          break;
        }

        case 'pdf-page-numbers': {
          outBlob = await addPageNumbersToPDF(file, {
            position: pageNumberPosition,
            format: pageNumberFormat,
            skipCoverPage,
          });
          outFileName = `numbered_${file.name}`;
          break;
        }

        case 'pdf-nup': {
          outBlob = await nUpPDF(file, nUpPages);
          outFileName = `grid_${nUpPages}up_${file.name}`;
          break;
        }

        case 'pdf-grayscale': {
          outBlob = await grayscalePDF(file);
          outFileName = `grayscale_${file.name}`;
          break;
        }

        case 'pdf-invert': {
          outBlob = await invertPDFColors(file);
          outFileName = `darkmode_${file.name}`;
          break;
        }

        case 'pdf-flatten': {
          outBlob = await flattenPDFForms(file);
          outFileName = `flattened_${file.name}`;
          break;
        }

        case 'pdf-redact': {
          outBlob = await redactPDF(file, [
            { pageIndex: 1, rects: [{ x: 0.1, y: 0.45, width: 0.8, height: 0.1 }] }
          ]);
          outFileName = `redacted_${file.name}`;
          break;
        }

        default: {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `processed_${file.name}`;
          break;
        }
      }

      const url = URL.createObjectURL(outBlob);
      setProcessedUrl(url);
      setDownloadFileName(outFileName);
      setProcessing(false);
    } catch (err: any) {
      alert(err.message || 'Error processing document.');
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = downloadFileName;
    a.click();

    if (onDownloadTrigger) {
      onDownloadTrigger(downloadFileName, 1);
    }
  };

  const getToolMeta = () => {
    switch (toolType) {
      case 'pdf-to-word': return { title: 'PDF to Word Converter (.docx)', desc: 'Extract PDF text streams into a native Microsoft Word .docx document.', icon: <FileText className="size-6 text-blue-600" /> };
      case 'pdf-to-ppt': return { title: 'PDF to PowerPoint Converter (.pptx)', desc: 'Extract PDF pages into native Microsoft PowerPoint slides.', icon: <Sparkles className="size-6 text-amber-600" /> };
      case 'word-to-pdf': return { title: 'Word to PDF Converter', desc: 'Convert .docx files directly to PDF on-device.', icon: <FileCheck className="size-6 text-indigo-600" /> };
      case 'excel-to-pdf': return { title: 'Excel to PDF Converter', desc: 'Convert .xlsx spreadsheets into formatted PDF documents.', icon: <FileCheck className="size-6 text-emerald-600" /> };
      case 'ppt-to-pdf': return { title: 'PowerPoint to PDF Converter', desc: 'Convert .pptx presentation slides into PDF format.', icon: <FileCheck className="size-6 text-rose-600" /> };
      case 'pdf-to-excel': return { title: 'PDF to Excel Converter (.csv)', desc: 'Extract text lines into spreadsheet tabular data.', icon: <FileCheck className="size-6 text-emerald-600" /> };
      case 'pdf-to-jpg': return { title: 'PDF to JPG Image Converter', desc: 'Render actual PDF pages to crisp JPEG images.', icon: <ImageIcon className="size-6 text-purple-600" /> };
      case 'pdf-compare': return { title: 'Compare PDF Documents', desc: 'Side-by-side text diff comparison of two PDF files.', icon: <FileDiff className="size-6 text-cyan-600" /> };
      case 'pdf-ocr': return { title: 'PDF OCR Text Extractor (Tesseract.js WASM)', desc: 'Real browser-native optical character recognition on scanned PDFs.', icon: <Search className="size-6 text-sky-600" /> };
      case 'pdf-to-markdown': return { title: 'PDF to Markdown Converter', desc: 'Convert PDF content into structured Markdown.', icon: <FileCode className="size-6 text-slate-800 dark:text-slate-200" /> };
      case 'pdf-compressor': return { title: 'PDF Smart Compressor', desc: 'Stirling-PDF dual-engine stream cleanup & canvas DPI optimization.', icon: <Minimize2 className="size-6 text-emerald-600" /> };
      case 'pdf-watermark': return { title: 'PDF Watermark Generator', desc: 'Add customizable text watermarks with position & opacity control.', icon: <Stamp className="size-6 text-rose-600" /> };
      case 'pdf-page-numbers': return { title: 'PDF Page Numbering Engine', desc: 'Add page numbers with custom position & formatting.', icon: <Hash className="size-6 text-blue-600" /> };
      case 'pdf-nup': return { title: 'PDF N-Up Grid Layout (2-Up / 4-Up)', desc: 'Combine multiple PDF pages onto single sheets for print handouts.', icon: <Grid className="size-6 text-indigo-600" /> };
      case 'pdf-grayscale': return { title: 'PDF Grayscale Converter', desc: 'Convert colored PDF pages into clean black & white grayscale.', icon: <Sun className="size-6 text-slate-600" /> };
      case 'pdf-redact': return { title: 'PDF Privacy Redaction Engine', desc: 'Draw boxes on page previews to burn solid black pixels into PDF.', icon: <ShieldAlert className="size-6 text-rose-600" /> };
      case 'pdf-organize': return { title: 'Visual PDF Page Organizer', desc: 'Drag-reorder, delete, or rotate individual PDF pages visually.', icon: <Layers className="size-6 text-indigo-600" /> };
      case 'pdf-sign': return { title: 'PDF Digital Signer / Stamp Tool', desc: 'Draw or upload a signature and place it on target pages.', icon: <PenTool className="size-6 text-emerald-600" /> };
      case 'pdf-metadata': return { title: 'PDF Document Properties & Metadata Editor', desc: 'Read and update Title, Author, Subject, and Keywords properties.', icon: <Edit3 className="size-6 text-blue-600" /> };
      default: return { title: 'Stirling-PDF Utility Engine', desc: 'Local in-browser Stirling-PDF tools with 100% privacy.', icon: <FileText className="size-6 text-rose-600" /> };
    }
  };

  const meta = getToolMeta();

  return (
    <ToolPageShell
      title={meta.title}
      subtitle={meta.desc}
      badge="Stirling Engine"
      icon={meta.icon}
    >
      <div className="space-y-6">
        {/* Dropzone */}
        {!file && (
          <Dropzone
            onFilesSelected={handleFileSelect}
            accept={inputSpec.accept}
            title={inputSpec.title}
            subtitle={inputSpec.subtitle}
          />
        )}

        {file && (
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="size-8 text-rose-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setSecondFile(null); setProcessedUrl(null); }}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        )}

        {/* Specialized Workspaces */}
        {file && toolType === 'pdf-redact' && (
          <PdfRedactionWorkspace file={file} />
        )}

        {file && toolType === 'pdf-organize' && (
          <PdfPageOrganizerWorkspace file={file} />
        )}

        {file && toolType === 'pdf-sign' && (
          <PdfSignerWorkspace file={file} />
        )}

        {file && toolType === 'pdf-metadata' && (
          <PdfMetadataWorkspace file={file} />
        )}

        {/* Second File Dropzone for PDF Compare */}
        {toolType === 'pdf-compare' && file && !secondFile && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Second PDF to Compare:</p>
            <Dropzone
              onFilesSelected={handleFileSelect}
              accept=".pdf"
              title="Select Second PDF File (.pdf)"
              subtitle="Will compare text diff against first document"
            />
          </div>
        )}

        {/* Stirling Tool Specific Controls */}
        {file && toolType === 'pdf-compressor' && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Compression Preset:</label>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'recommended', 'extreme'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCompressionPreset(preset)}
                  className={`p-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                    compressionPreset === preset
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {file && toolType === 'pdf-watermark' && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Watermark Text:</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Position Anchor:</label>
                <select
                  value={watermarkPosition}
                  onChange={(e) => setWatermarkPosition(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="center">Center</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={skipCoverPage}
                onChange={(e) => setSkipCoverPage(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Skip First Page (Cover Page)
            </label>
          </div>
        )}

        {file && toolType === 'pdf-page-numbers' && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Position:</label>
                <select
                  value={pageNumberPosition}
                  onChange={(e) => setPageNumberPosition(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Format Pattern:</label>
                <select
                  value={pageNumberFormat}
                  onChange={(e) => setPageNumberFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="Page {X} of {Y}">Page X of Y</option>
                  <option value="{X} / {Y}">X / Y</option>
                  <option value="Page {X}">Page X</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={skipCoverPage}
                onChange={(e) => setSkipCoverPage(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Skip First Page (Cover Page)
            </label>
          </div>
        )}

        {file && toolType === 'pdf-nup' && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pages Per Sheet:</label>
            <div className="grid grid-cols-2 gap-3">
              {([2, 4] as const).map((pages) => (
                <button
                  key={pages}
                  onClick={() => setNUpPages(pages)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    nUpPages === pages
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {pages}-Up ({pages} Pages per Sheet)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Process Action Button */}
        {file && !processedUrl && !['pdf-redact', 'pdf-organize', 'pdf-sign', 'pdf-metadata'].includes(toolType) && (
          <button
            onClick={processPdfTool}
            disabled={processing}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-all btn-interactive flex items-center justify-center gap-2 shadow-sm"
          >
            {processing ? (
              <>
                <RefreshCw className="size-5 animate-spin" />
                Processing Document...
              </>
            ) : (
              <>
                <Wand2 className="size-5" />
                Process Document Now
              </>
            )}
          </button>
        )}

        {/* Result & Download Workspace */}
        {processedUrl && (
          <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Document Processing Complete!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">100% processed locally on your device with complete privacy.</p>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all btn-interactive flex items-center justify-center gap-2 shadow-md"
            >
              <Download className="size-5" />
              Download {downloadFileName}
            </button>
          </div>
        )}

        {/* Extracted Text Readout */}
        {extractedText && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Extracted Content:</h4>
            <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs font-mono overflow-x-auto max-h-60 text-slate-800 dark:text-slate-200">
              {extractedText}
            </pre>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
