import React, { useState } from 'react';
import { 
  FileText, Minimize2, Unlock, Lock, FilePlus, Image as ImageIcon, 
  RotateCw, Hash, Stamp, ShieldAlert, Crop, FileCode, Layers, 
  FileCheck, Sparkles, Languages, Edit3, PenTool, CheckCircle, 
  Download, RefreshCw, Eye, AlertCircle, Wand2, Search, Plus, Trash2, FileDiff
} from 'lucide-react';
import { ToolType } from '../../types';
import { Dropzone } from '../Dropzone';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { ProcessedFileItem } from '../PostDownloadAdModal';
import { ToolPageShell } from './ToolPageShell';
import { 
  extractPDFPagesText, 
  renderPDFPagesToJPGs, 
  createDocxFromPDFText, 
  createPptxFromPDFText, 
  convertWordToPdfBlob, 
  convertExcelToPdfBlob, 
  convertPptxToPdfBlob, 
  comparePDFsText 
} from '../../lib/pdfProcessor';
import JSZip from 'jszip';
import { Change } from 'diff';

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

  // Custom tool options
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [signatureText, setSignatureText] = useState('');
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-right' | 'bottom-center' | 'top-right'>('bottom-right');
  const [rotationAngle, setRotationAngle] = useState<number>(90);

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
          const pageTexts = await extractPDFPagesText(file);
          outBlob = await createDocxFromPDFText(pageTexts, file.name);
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.docx`;
          break;
        }

        case 'pdf-to-ppt': {
          const pageTexts = await extractPDFPagesText(file);
          outBlob = await createPptxFromPDFText(pageTexts, file.name);
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

        case 'html-to-pdf': {
          const rawText = await file.text().catch(() => 'HTML Document');
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([595.28, 841.89]);
          const lines = rawText.replace(/<[^>]+>/g, ' ').split('\n').filter(l => l.trim().length > 0);

          let y = 800;
          page.drawText(`Converted HTML Document: ${file.name}`, { x: 50, y, size: 16, color: rgb(0.1, 0.1, 0.1) });
          y -= 35;

          for (const l of lines.slice(0, 40)) {
            page.drawText(l.substring(0, 80), { x: 50, y, size: 10, color: rgb(0.2, 0.2, 0.2) });
            y -= 16;
          }
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
          break;
        }

        case 'pdf-to-excel': {
          const pageTexts = await extractPDFPagesText(file);
          let csvContent = `Page,Line Number,Extracted Text Content\n`;
          pageTexts.forEach((pageText, pIdx) => {
            const lines = pageText.split(/(?<=[.?!])\s+/);
            lines.forEach((l, lIdx) => {
              if (l.trim()) {
                const escaped = l.replace(/"/g, '""');
                csvContent += `${pIdx + 1},${lIdx + 1},"${escaped}"\n`;
              }
            });
          });
          outBlob = new Blob([csvContent], { type: 'text/csv' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.csv`;
          break;
        }

        case 'pdf-to-markdown': {
          const pageTexts = await extractPDFPagesText(file);
          const mdLines = [`# ${file.name.replace(/\.pdf$/i, '')}\n\n*Extracted via BrowserKit Local Engine*\n`];
          pageTexts.forEach((pText, idx) => {
            mdLines.push(`## Page ${idx + 1}\n`);
            mdLines.push(pText);
            mdLines.push('\n---\n');
          });
          const fullMd = mdLines.join('\n');
          setExtractedText(fullMd);
          outBlob = new Blob([fullMd], { type: 'text/markdown' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.md`;
          break;
        }

        case 'pdf-ocr': {
          const pageTexts = await extractPDFPagesText(file);
          const ocrText = `OCR Text Extraction Output for "${file.name}":\n\n` + pageTexts.join('\n\n--- Page Break ---\n\n');
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
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
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
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const pages = pdfDoc.getPages();
          pages.forEach((page) => {
            const { width, height } = page.getSize();
            page.drawText(watermarkText || 'CONFIDENTIAL', {
              x: width / 4,
              y: height / 2,
              size: 36,
              color: rgb(0.8, 0.1, 0.1),
              rotate: degrees(45),
              opacity: 0.35,
            });
          });
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `watermarked_${file.name}`;
          break;
        }

        case 'pdf-redact': {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const pages = pdfDoc.getPages();
          pages.forEach((p) => {
            const { width, height } = p.getSize();
            p.drawRectangle({ x: 40, y: height / 2 - 20, width: width - 80, height: 40, color: rgb(0, 0, 0) });
          });
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
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
      case 'pdf-to-word': return { title: 'PDF to Word Converter (.docx)', desc: 'Extract text layout streams into a real Microsoft Word .docx document.', icon: <FileText className="w-6 h-6 text-blue-600" /> };
      case 'pdf-to-ppt': return { title: 'PDF to PowerPoint Converter (.pptx)', desc: 'Extract PDF pages into native Microsoft PowerPoint slides.', icon: <Sparkles className="w-6 h-6 text-amber-600" /> };
      case 'word-to-pdf': return { title: 'Word to PDF Converter', desc: 'Convert .docx files directly to PDF on-device.', icon: <FileCheck className="w-6 h-6 text-indigo-600" /> };
      case 'excel-to-pdf': return { title: 'Excel to PDF Converter', desc: 'Convert .xlsx spreadsheets into formatted PDF documents.', icon: <FileCheck className="w-6 h-6 text-emerald-600" /> };
      case 'ppt-to-pdf': return { title: 'PowerPoint to PDF Converter', desc: 'Convert .pptx presentation slides into PDF format.', icon: <FileCheck className="w-6 h-6 text-rose-600" /> };
      case 'pdf-to-excel': return { title: 'PDF to Excel Converter (.csv)', desc: 'Extract text lines into spreadsheet tabular data.', icon: <FileCheck className="w-6 h-6 text-emerald-600" /> };
      case 'pdf-to-jpg': return { title: 'PDF to JPG Image Converter', desc: 'Render actual PDF pages to crisp JPEG images.', icon: <ImageIcon className="w-6 h-6 text-purple-600" /> };
      case 'pdf-compare': return { title: 'Compare PDF Documents', desc: 'Side-by-side text diff comparison of two PDF files.', icon: <FileDiff className="w-6 h-6 text-cyan-600" /> };
      case 'pdf-ocr': return { title: 'PDF OCR Text Extractor', desc: 'Extract readable text content from PDF pages.', icon: <Search className="w-6 h-6 text-sky-600" /> };
      case 'pdf-to-markdown': return { title: 'PDF to Markdown Converter', desc: 'Convert PDF content into structured Markdown.', icon: <FileCode className="w-6 h-6 text-slate-800 dark:text-slate-200" /> };
      default: return { title: 'PDF Utility Suite', desc: 'Local in-browser PDF processing with complete privacy.', icon: <FileText className="w-6 h-6 text-rose-600" /> };
    }
  };

  const meta = getToolMeta();

  return (
    <ToolPageShell
      categoryBadge="PDF Suite"
      categoryBadgeColor="rose"
      title={meta.title}
      description={meta.desc}
      icon={meta.icon}
    >
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.html,.txt"
          title={`Select Document for ${meta.title}`}
          subtitle="Drag & drop file or browse device (100% Local On-Device Execution)"
        />
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setSecondFile(null);
                setProcessedUrl(null);
                setExtractedText(null);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {toolType === 'pdf-compare' && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Second Document to Compare
              </label>
              {!secondFile ? (
                <Dropzone
                  onFilesSelected={handleFileSelect}
                  accept=".pdf"
                  title="Upload Second PDF File to Compare"
                  subtitle="Select second version of PDF document"
                  multiple={false}
                />
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{secondFile.name}</span>
                  <button onClick={() => setSecondFile(null)} className="text-xs text-rose-600 font-bold hover:underline cursor-pointer">
                    Change File
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              onClick={processPdfTool}
              disabled={processing}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {processing ? 'Processing...' : `Run ${meta.title}`}
            </button>
          </div>

          {diffResults && (
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2 max-h-72 overflow-y-auto">
              <h4 className="font-bold text-emerald-400 border-b border-slate-800 pb-2">Line-by-Line Diff Stream:</h4>
              {diffResults.map((part, index) => {
                const color = part.added ? 'text-emerald-400 bg-emerald-950/40' : part.removed ? 'text-rose-400 bg-rose-950/40' : 'text-slate-400';
                const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
                return (
                  <div key={index} className={`p-1 rounded ${color}`}>
                    {prefix}{part.value}
                  </div>
                );
              })}
            </div>
          )}

          {processedUrl && (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-xs animate-fade-in">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-4 h-4" /> Ready for Download
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">{downloadFileName}</p>
              <button
                onClick={handleDownload}
                className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400 dark:text-white" /> Download Output File
              </button>
            </div>
          )}
        </div>
      )}
    </ToolPageShell>
  );
};
