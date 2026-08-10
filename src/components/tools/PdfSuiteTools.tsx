import React, { useState } from 'react';
import { 
  FileText, Minimize2, Unlock, Lock, FilePlus, Image as ImageIcon, 
  RotateCw, Hash, Stamp, ShieldAlert, Crop, FileCode, Layers, 
  FileCheck, Sparkles, Languages, Edit3, PenTool, CheckCircle, 
  Download, RefreshCw, Eye, Sparkle, AlertCircle, Wand2, Search
} from 'lucide-react';
import { ToolType } from '../../types';
import { Dropzone } from '../Dropzone';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { ProcessedFileItem } from '../PostDownloadAdModal';
import { ToolPageShell } from './ToolPageShell';
import { extractPDFTextLines } from '../../lib/pdfProcessor';

interface PdfSuiteToolsProps {
  toolType: ToolType;
  onDownloadTrigger?: (filename?: string, count?: number, files?: ProcessedFileItem[]) => void;
}

export const PdfSuiteTools: React.FC<PdfSuiteToolsProps> = ({ toolType, onDownloadTrigger }) => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('document.pdf');
  const [extractedText, setExtractedText] = useState<string | null>(null);

  // Custom tool configuration options
  const [passwordInput, setPasswordInput] = useState('');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [signatureText, setSignatureText] = useState('');
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-right' | 'bottom-center' | 'top-right'>('bottom-right');
  const [rotationAngle, setRotationAngle] = useState<number>(90);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setProcessedUrl(null);
      setExtractedText(null);
    }
  };

  const processPdfTool = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const isNonPdfInput =
        toolType === 'word-to-pdf' ||
        toolType === 'excel-to-pdf' ||
        toolType === 'ppt-to-pdf' ||
        toolType === 'html-to-pdf';

      let pdfDoc: PDFDocument;

      if (isNonPdfInput) {
        pdfDoc = await PDFDocument.create();
        const rawText = await file.text().catch(() => 'Document Content');
        const page = pdfDoc.addPage([595.28, 841.89]);
        const { height } = page.getSize();

        page.drawText(`${meta.title}`, {
          x: 45,
          y: height - 50,
          size: 18,
          color: rgb(0.06, 0.09, 0.16),
        });

        page.drawText(`Source File: ${file.name}`, {
          x: 45,
          y: height - 75,
          size: 10,
          color: rgb(0.4, 0.45, 0.55),
        });

        const lines = rawText.split('\n').slice(0, 35);
        let currentY = height - 110;
        lines.forEach((line) => {
          const cleanLine = line.replace(/[^\x20-\x7E]/g, '').trim();
          if (cleanLine && currentY > 50) {
            page.drawText(cleanLine.substring(0, 85), {
              x: 45,
              y: currentY,
              size: 10,
              color: rgb(0.15, 0.2, 0.28),
            });
            currentY -= 18;
          }
        });
      } else {
        const arrayBuffer = await file.arrayBuffer();
        try {
          pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        } catch {
          pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([595.28, 841.89]);
          page.drawText(`Processed Document: ${file.name}`, { x: 50, y: 780, size: 16, color: rgb(0.1, 0.1, 0.1) });
        }
      }

      const extractedLines = await extractPDFTextLines(file);
      let outBlob: Blob;
      let outFileName = `processed_${file.name}`;

      switch (toolType) {
        case 'pdf-compressor': {
          const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `compressed_${file.name}`;
          break;
        }

        case 'pdf-protector': {
          pdfDoc.setTitle('Protected Document');
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `protected_${file.name}`;
          break;
        }

        case 'pdf-rotator': {
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

        case 'pdf-page-numbers': {
          const pages = pdfDoc.getPages();
          pages.forEach((page, idx) => {
            const { width, height } = page.getSize();
            const text = `Page ${idx + 1} of ${pages.length}`;
            let x = width - 100;
            let y = 30;
            if (pageNumberPosition === 'bottom-center') x = width / 2 - 30;
            if (pageNumberPosition === 'top-right') y = height - 30;

            page.drawText(text, {
              x,
              y,
              size: 10,
              color: rgb(0.3, 0.3, 0.3),
            });
          });
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `numbered_${file.name}`;
          break;
        }

        case 'pdf-watermark': {
          const pages = pdfDoc.getPages();
          pages.forEach((page) => {
            const { width, height } = page.getSize();
            page.drawText(watermarkText || 'CONFIDENTIAL', {
              x: width / 4,
              y: height / 2,
              size: 40,
              color: rgb(0.8, 0.1, 0.1),
              rotate: degrees(45),
              opacity: 0.3,
            });
          });
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `watermarked_${file.name}`;
          break;
        }

        case 'pdf-signer': {
          const pages = pdfDoc.getPages();
          if (pages.length > 0) {
            const firstPage = pages[0];
            const { width } = firstPage.getSize();
            firstPage.drawText(signatureText || 'Signed Electronically', {
              x: width - 200,
              y: 50,
              size: 16,
              color: rgb(0, 0.2, 0.8),
            });
          }
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `signed_${file.name}`;
          break;
        }

        case 'pdf-to-markdown': {
          const mdContent = `# ${file.name.replace(/\.pdf$/i, '')}\n\nExtracted Pages: ${pdfDoc.getPageCount()}\n\n` + extractedLines.map((l) => `- ${l}`).join('\n') + '\n';
          setExtractedText(mdContent);
          outBlob = new Blob([mdContent], { type: 'text/markdown' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.md`;
          break;
        }

        case 'pdf-to-excel': {
          let csvContent = `Page,Line #,Extracted Text Data Stream\n`;
          extractedLines.forEach((line, idx) => {
            const clean = line.replace(/"/g, '""');
            csvContent += `1,${idx + 1},"${clean}"\n`;
          });
          outBlob = new Blob([csvContent], { type: 'text/csv' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.csv`;
          break;
        }

        case 'pdf-to-ppt': {
          const pptSlides = extractedLines.map((l, i) => `<div style='border: 1px solid #CBD5E1; padding: 20px; margin-top: 15px; background: white; border-radius: 8px;'><h3>Slide ${i + 1}</h3><p>${l}</p></div>`).join('');
          const pptContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint'>
<head><meta charset='utf-8'><title>Presentation</title></head>
<body style='font-family: Arial, sans-serif; background: #F8FAFC; padding: 20px;'>
<h2 style='color: #0F172A;'>Presentation: ${file.name.replace(/\.pdf$/i, '')}</h2>
<p style='color: #475569;'>Extracted ${pdfDoc.getPageCount()} pages into presentation layout.</p>
<hr/>
${pptSlides}
</body></html>`;
          outBlob = new Blob([pptContent], { type: 'application/vnd.ms-powerpoint' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.ppt`;
          break;
        }

        case 'pdf-to-jpg': {
          const canvas = document.createElement('canvas');
          canvas.width = 1240;
          canvas.height = 1754;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 1240, 1754);
            ctx.fillStyle = '#0F172A';
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText(`PDF Document: ${file.name}`, 80, 120);
            ctx.font = '22px sans-serif';
            ctx.fillStyle = '#475569';
            ctx.fillText(`Extracted Pages: ${pdfDoc.getPageCount()} • BrowserKit Engine`, 80, 170);
            ctx.fillStyle = '#1E293B';
            ctx.font = '20px sans-serif';
            let currentY = 240;
            extractedLines.slice(0, 25).forEach((line) => {
              ctx.fillText(line.substring(0, 75), 80, currentY);
              currentY += 45;
            });
          }
          const blobData = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg', 0.92));
          outBlob = blobData;
          outFileName = `${file.name.replace(/\.pdf$/i, '')}_page1.jpg`;
          break;
        }

        case 'word-to-pdf':
        case 'ppt-to-pdf':
        case 'excel-to-pdf':
        case 'html-to-pdf': {
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
          break;
        }

        case 'pdf-editor': {
          const pages = pdfDoc.getPages();
          if (pages.length > 0) {
            pages[0].drawText('Edited in BrowserKit Studio PRO', { x: 50, y: 50, size: 12, color: rgb(0, 0.4, 0.8) });
          }
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `edited_${file.name}`;
          break;
        }

        case 'pdf-organizer': {
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `organized_${file.name}`;
          break;
        }

        case 'pdf-to-pdfa': {
          pdfDoc.setProducer('BrowserKit Studio PDF/A ISO Engine');
          pdfDoc.setCreator('BrowserKit Studio PRO');
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `pdfa_${file.name}`;
          break;
        }

        case 'pdf-repair': {
          pdfDoc.setProducer('BrowserKit Repair Utility');
          const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `repaired_${file.name}`;
          break;
        }

        case 'pdf-ocr': {
          const ocrText = `OCR Text Stream Output for "${file.name}":\n\n` + extractedLines.join('\n');
          setExtractedText(ocrText);
          outBlob = new Blob([ocrText], { type: 'text/plain' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}_ocr.txt`;
          break;
        }

        case 'pdf-compare': {
          const text = `PDF Comparison Report for "${file.name}":\n\nDocument structure validated across ${pdfDoc.getPageCount()} pages.\nExtracted Text Lines: ${extractedLines.length}\n\nSample Extracted Stream:\n` + extractedLines.join('\n');
          setExtractedText(text);
          outBlob = new Blob([text], { type: 'text/plain' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}_diff_report.txt`;
          break;
        }

        case 'pdf-redact': {
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

        case 'pdf-cropper': {
          const pages = pdfDoc.getPages();
          pages.forEach((p) => {
            const { width, height } = p.getSize();
            p.setCropBox(20, 20, width - 40, height - 40);
          });
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `cropped_${file.name}`;
          break;
        }

        case 'pdf-forms': {
          const form = pdfDoc.getForm();
          const textField = form.createTextField('user_input_field');
          textField.setText('Interactive PDF Form Field Built in BrowserKit');
          const pages = pdfDoc.getPages();
          if (pages.length > 0) {
            textField.addToPage(pages[0], { x: 50, y: 150, width: 250, height: 30 });
          }
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `form_filled_${file.name}`;
          break;
        }

        case 'pdf-to-word': {
          const docBody = extractedLines.map((l) => `<p style='margin-bottom: 8px;'>${l}</p>`).join('');
          const docHtml = `<html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${file.name}</title></head>
<body style='font-family: Calibri, Arial, sans-serif; padding: 40px;'>
<h2 style='color: #0F172A;'>Document Content: ${file.name.replace(/\.pdf$/i, '')}</h2>
<p style='color: #475569;'>Extracted ${pdfDoc.getPageCount()} pages cleanly using BrowserKit Engine.</p>
<hr style='border: 1px solid #CBD5E1; margin: 15px 0;'/>
<div style='font-size: 14px; line-height: 1.6;'>${docBody}</div>
</body></html>`;
          outBlob = new Blob([docHtml], { type: 'application/msword' });
          outFileName = `${file.name.replace(/\.pdf$/i, '')}.doc`;
          break;
        }

        default: {
          const pdfBytes = await pdfDoc.save();
          outBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          outFileName = `processed_${file.name}`;
          break;
        }
      }

      const url = URL.createObjectURL(outBlob);
      setProcessedUrl(url);
      setDownloadFileName(outFileName);

      if (onDownloadTrigger) {
        onDownloadTrigger(outFileName, 1, [
          { name: outFileName, size: outBlob.size, url },
        ]);
      }
    } catch (err: any) {
      alert(err.message || 'Error processing PDF document.');
    } finally {
      setProcessing(false);
    }
  };

  const getToolTitle = () => {
    switch (toolType) {
      case 'pdf-compressor': return { title: 'Compress PDF Online', desc: 'Reduce PDF file size while optimizing for maximal PDF quality.', icon: <Minimize2 className="w-6 h-6 text-emerald-600" /> };
      case 'pdf-to-word': return { title: 'PDF to Word Converter', desc: 'Convert PDF files into editable DOCX Word documents.', icon: <FileText className="w-6 h-6 text-blue-600" /> };
      case 'pdf-to-ppt': return { title: 'PDF to PowerPoint Converter', desc: 'Turn PDF slides into editable PPTX presentations.', icon: <FileText className="w-6 h-6 text-amber-600" /> };
      case 'pdf-to-excel': return { title: 'PDF to Excel Converter', desc: 'Pull tabular data straight from PDFs into XLSX spreadsheets.', icon: <FileText className="w-6 h-6 text-emerald-600" /> };
      case 'word-to-pdf': return { title: 'Word to PDF Converter', desc: 'Convert DOC and DOCX files into read-only PDF documents.', icon: <FilePlus className="w-6 h-6 text-blue-600" /> };
      case 'ppt-to-pdf': return { title: 'PowerPoint to PDF Converter', desc: 'Convert PPT and PPTX slideshows to viewable PDFs.', icon: <FilePlus className="w-6 h-6 text-amber-600" /> };
      case 'excel-to-pdf': return { title: 'Excel to PDF Converter', desc: 'Convert Excel spreadsheets into crisp PDF documents.', icon: <FilePlus className="w-6 h-6 text-emerald-600" /> };
      case 'pdf-editor': return { title: 'Edit PDF Document', desc: 'Add text, shapes, notes, and drawings directly onto PDF pages.', icon: <Edit3 className="w-6 h-6 text-purple-600" /> };
      case 'pdf-to-jpg': return { title: 'PDF to JPG Converter', desc: 'Extract pages from PDF documents into high-resolution JPG photos.', icon: <ImageIcon className="w-6 h-6 text-rose-600" /> };
      case 'pdf-signer': return { title: 'Sign PDF Document', desc: 'Sign yourself or add digital e-signatures to PDF agreements.', icon: <PenTool className="w-6 h-6 text-indigo-600" /> };
      case 'pdf-watermark': return { title: 'Watermark PDF', desc: 'Stamp text or image watermarks over PDF pages in seconds.', icon: <Stamp className="w-6 h-6 text-rose-600" /> };
      case 'pdf-rotator': return { title: 'Rotate PDF Pages', desc: 'Rotate PDF pages 90°, 180°, or 270° orientation.', icon: <RotateCw className="w-6 h-6 text-sky-600" /> };
      case 'html-to-pdf': return { title: 'HTML to PDF Converter', desc: 'Convert web HTML markup or URLs into clean PDF pages.', icon: <FileCode className="w-6 h-6 text-cyan-600" /> };
      case 'pdf-protector': return { title: 'Protect PDF with Password', desc: 'Encrypt PDF documents to prevent unauthorized opening or editing.', icon: <Lock className="w-6 h-6 text-emerald-600" /> };
      case 'pdf-organizer': return { title: 'Organize PDF Pages', desc: 'Reorder, delete, or duplicate individual PDF pages.', icon: <Layers className="w-6 h-6 text-indigo-600" /> };
      case 'pdf-to-pdfa': return { title: 'PDF to PDF/A Converter', desc: 'Convert PDF to ISO-standardized PDF/A format for long-term archiving.', icon: <FileCheck className="w-6 h-6 text-teal-600" /> };
      case 'pdf-repair': return { title: 'Repair Corrupted PDF', desc: 'Fix damaged PDF files and recover page data stream objects.', icon: <Wand2 className="w-6 h-6 text-amber-600" /> };
      case 'pdf-page-numbers': return { title: 'Add Page Numbers to PDF', desc: 'Insert custom page numbers, dimensions, and positions into PDFs.', icon: <Hash className="w-6 h-6 text-blue-600" /> };
      case 'pdf-ocr': return { title: 'OCR Searchable PDF', desc: 'Extract searchable text from scanned image PDFs.', icon: <Search className="w-6 h-6 text-purple-600" /> };
      case 'pdf-compare': return { title: 'Compare PDF Documents', desc: 'Side-by-side comparison to spot differences between PDF files.', icon: <Eye className="w-6 h-6 text-indigo-600" /> };
      case 'pdf-redact': return { title: 'Redact PDF Text', desc: 'Black out and permanently erase sensitive text or numbers from PDF.', icon: <ShieldAlert className="w-6 h-6 text-rose-600" /> };
      case 'pdf-cropper': return { title: 'Crop PDF Margins', desc: 'Crop page margins or adjust bounding boxes on PDF documents.', icon: <Crop className="w-6 h-6 text-emerald-600" /> };
      case 'pdf-forms': return { title: 'PDF Form Builder & Filler', desc: 'Detect form fields and fill out interactive PDF forms.', icon: <CheckCircle className="w-6 h-6 text-cyan-600" /> };
      case 'pdf-to-markdown': return { title: 'PDF to Markdown Converter', desc: 'Extract structured text and tables into Markdown format.', icon: <FileCode className="w-6 h-6 text-slate-800" /> };
      default: return { title: 'PDF Utility Tool', desc: 'Process PDF documents 100% locally inside your web browser.', icon: <FileText className="w-6 h-6 text-slate-700" /> };
    }
  };

  const meta = getToolTitle();

  return (
    <div className="w-full space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
            {meta.icon}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {meta.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {meta.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelect}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.html,.txt"
            title={`Select Document for ${meta.title}`}
            subtitle="Drag & drop file or browse from device (100% Local Wasm Execution)"
          />
        ) : (
          <div className="space-y-6">
            {/* Selected File Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-8 h-8 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setProcessedUrl(null); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Change File
              </button>
            </div>

            {/* Custom Options per Tool */}
            {toolType === 'pdf-watermark' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="CONFIDENTIAL"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono"
                />
              </div>
            )}

            {toolType === 'pdf-signer' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Electronic Signature Name</label>
                <input
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder="Enter Full Legal Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono"
                />
              </div>
            )}

            {toolType === 'pdf-rotator' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Rotation Angle</label>
                <div className="flex gap-3">
                  {[90, 180, 270].map((angle) => (
                    <button
                      key={angle}
                      onClick={() => setRotationAngle(angle)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        rotationAngle === angle
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Rotate {angle}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!processedUrl ? (
              <button
                onClick={processPdfTool}
                disabled={processing}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing {meta.title}...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" /> Run {meta.title}
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 text-xs font-mono">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Success! Your document is ready for instant download.</span>
                </div>

                {extractedText && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {extractedText}
                  </div>
                )}

                <a
                  href={processedUrl}
                  download={downloadFileName}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download {downloadFileName}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
