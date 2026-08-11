import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import pptxgen from 'pptxgenjs';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { diffLines, Change } from 'diff';

// Set up pdf.js worker URL
if (typeof window !== 'undefined' && pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface PDFStructuredPage {
  pageIndex: number;
  text: string;
  paragraphs: string[];
}

/**
 * Extracts structured text from PDF preserving line breaks, paragraph structure, and reading order.
 */
export async function extractPDFPagesStructuredText(file: File): Promise<PDFStructuredPage[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const pages: PDFStructuredPage[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];

      if (!items || items.length === 0) {
        pages.push({ pageIndex: i, text: '', paragraphs: [] });
        continue;
      }

      // Extract text items with X/Y positioning
      const positionedItems: { x: number; y: number; str: string }[] = [];
      items.forEach((item) => {
        if (!item.str) return;
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const x = transform[4];
        const y = transform[5];
        positionedItems.push({ x, y, str: item.str });
      });

      // Group items into horizontal lines (y within 3.5px threshold)
      const lines: { y: number; text: string }[] = [];
      // Sort vertically top-to-bottom (y descending)
      positionedItems.sort((a, b) => b.y - a.y || a.x - b.x);

      let currentLineItems: { x: number; str: string }[] = [];
      let currentY: number | null = null;

      positionedItems.forEach((item) => {
        if (currentY === null || Math.abs(currentY - item.y) <= 3.5) {
          if (currentY === null) currentY = item.y;
          currentLineItems.push({ x: item.x, str: item.str });
        } else {
          // Flush current line
          currentLineItems.sort((a, b) => a.x - b.x);
          const lineStr = currentLineItems.map((ci) => ci.str).join(' ').replace(/\s+/g, ' ');
          lines.push({ y: currentY, text: lineStr });

          currentY = item.y;
          currentLineItems = [{ x: item.x, str: item.str }];
        }
      });

      if (currentLineItems.length > 0 && currentY !== null) {
        currentLineItems.sort((a, b) => a.x - b.x);
        const lineStr = currentLineItems.map((ci) => ci.str).join(' ').replace(/\s+/g, ' ');
        lines.push({ y: currentY, text: lineStr });
      }

      // Group lines into paragraphs based on vertical spacing
      const paragraphs: string[] = [];
      let currentParaLines: string[] = [];
      let lastY: number | null = null;

      lines.forEach((line) => {
        const trimmed = line.text.trim();
        if (!trimmed) return;

        if (lastY !== null && Math.abs(lastY - line.y) > 16) {
          // Larger vertical gap signifies paragraph break
          if (currentParaLines.length > 0) {
            paragraphs.push(currentParaLines.join(' '));
            currentParaLines = [];
          }
        }

        currentParaLines.push(trimmed);
        lastY = line.y;
      });

      if (currentParaLines.length > 0) {
        paragraphs.push(currentParaLines.join(' '));
      }

      pages.push({
        pageIndex: i,
        text: paragraphs.join('\n\n'),
        paragraphs,
      });
    }

    return pages;
  } catch (err) {
    console.warn('PDFjs structured extraction fallback:', err);
    return [{ pageIndex: 1, text: file.name, paragraphs: [file.name] }];
  }
}

export async function extractPDFPagesText(file: File): Promise<string[]> {
  const structuredPages = await extractPDFPagesStructuredText(file);
  return structuredPages.map((p) => p.text);
}

export async function renderPDFPagesToJPGs(file: File): Promise<{ blob: Blob; filename: string }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const results: { blob: Blob; filename: string }[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.92)
      );
      results.push({
        blob,
        filename: `${file.name.replace(/\.pdf$/i, '')}_page${i}.jpg`,
      });
    }
  }

  return results;
}

/**
 * Creates a clean Word document (.docx) matching original document paragraph structures
 * WITHOUT adding artificial title headers or Page 1 / Page 2 text.
 */
export async function createDocxFromPDFText(
  inputData: string[] | PDFStructuredPage[],
  _documentTitle?: string
): Promise<Blob> {
  const docParagraphs: Paragraph[] = [];

  // Determine if input is PDFStructuredPage array or string array
  let structuredPages: { paragraphs: string[] }[] = [];
  if (Array.isArray(inputData) && inputData.length > 0 && typeof inputData[0] === 'object') {
    structuredPages = inputData as PDFStructuredPage[];
  } else {
    structuredPages = (inputData as string[]).map((pageText) => ({
      paragraphs: pageText.split('\n\n').filter((p) => p.trim().length > 0),
    }));
  }

  structuredPages.forEach((page) => {
    page.paragraphs.forEach((paraText) => {
      if (!paraText.trim()) return;

      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: paraText.trim(),
              size: 23, // ~11.5pt standard font
              font: 'Calibri',
            }),
          ],
          spacing: {
            after: 140, // ~7pt space after paragraph
            line: 276,  // 1.15 line spacing
          },
        })
      );
    });
  });

  const doc = new Document({
    sections: [{ children: docParagraphs }],
  });

  return await Packer.toBlob(doc);
}

/**
 * Creates a PowerPoint presentation (.pptx) matching original document structure
 * WITHOUT adding artificial slide titles or document header text.
 */
export async function createPptxFromPDFText(
  inputData: string[] | PDFStructuredPage[],
  documentTitle?: string
): Promise<Blob> {
  const pres = new pptxgen();
  if (documentTitle) pres.title = documentTitle;

  let structuredPages: { paragraphs: string[] }[] = [];
  if (Array.isArray(inputData) && inputData.length > 0 && typeof inputData[0] === 'object') {
    structuredPages = inputData as PDFStructuredPage[];
  } else {
    structuredPages = (inputData as string[]).map((pageText) => ({
      paragraphs: pageText.split('\n\n').filter((p) => p.trim().length > 0),
    }));
  }

  structuredPages.forEach((page) => {
    const slide = pres.addSlide();

    const slideContent = page.paragraphs.join('\n\n');
    slide.addText(slideContent || ' ', {
      x: 0.8,
      y: 0.8,
      w: 8.4,
      h: 5.8,
      fontSize: 14,
      fontFace: 'Arial',
      color: '1E293B',
      align: 'left',
      valign: 'top',
    });
  });

  const blob = await pres.write({ outputType: 'blob' });
  return blob as Blob;
}

/**
 * Converts Word document (.docx) to PDF WITHOUT prepending artificial title header text.
 */
export async function convertWordToPdfBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  let extractedText = '';

  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    extractedText = result.value || '';
  } catch {
    extractedText = await file.text();
  }

  const pdfDoc = await PDFDocument.create();
  const rawParagraphs = extractedText.split('\n').filter((l) => l.trim().length > 0);

  let page = pdfDoc.addPage([595.28, 841.89]);
  let y = 790;
  const margin = 50;
  const maxLineWidth = 495; // 595 - 2*50

  for (const para of rawParagraphs) {
    // Wrap paragraph text into lines fitting 495px width
    const words = para.trim().split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      // Approx font char width ~ 5.5px at size 10
      if (testLine.length * 5.5 > maxLineWidth && currentLine.length > 0) {
        if (y < 50) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = 790;
        }
        page.drawText(currentLine, { x: margin, y, size: 10, color: rgb(0.12, 0.16, 0.23) });
        y -= 14;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      if (y < 50) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 790;
      }
      page.drawText(currentLine, { x: margin, y, size: 10, color: rgb(0.12, 0.16, 0.23) });
      y -= 18; // Paragraph spacing gap
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Converts Excel spreadsheet (.xlsx) to PDF WITHOUT prepending artificial title header text.
 */
export async function convertExcelToPdfBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[sheetName];
  const rows: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]);
  let y = 790;

  for (const row of rows) {
    if (!row || row.length === 0) continue;
    if (y < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 790;
    }

    const rowStr = row.map((cell) => String(cell ?? '')).join('   |   ');
    const cleanStr = rowStr.substring(0, 100);
    page.drawText(cleanStr, { x: 45, y, size: 9, color: rgb(0.12, 0.16, 0.23) });
    y -= 16;
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Converts PowerPoint presentation (.pptx) to PDF WITHOUT prepending artificial title header text.
 */
export async function convertPptxToPdfBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideFiles = Object.keys(zip.files).filter((f) => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'));

  const pdfDoc = await PDFDocument.create();

  if (slideFiles.length === 0) {
    pdfDoc.addPage([841.89, 595.28]);
  } else {
    for (let idx = 0; idx < slideFiles.length; idx++) {
      const slideContent = await zip.files[slideFiles[idx]].async('text');
      const textMatches = slideContent.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
      const textRuns = textMatches.map((m) => m.replace(/<[^>]+>/g, '')).filter((t) => t.trim());

      const page = pdfDoc.addPage([841.89, 595.28]); // Landscape slide
      let y = 540;

      for (const run of textRuns) {
        if (y < 50) break;
        const lineStr = run.trim().substring(0, 110);
        page.drawText(lineStr, { x: 50, y, size: 12, color: rgb(0.12, 0.16, 0.23) });
        y -= 22;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function comparePDFsText(file1: File, file2: File): Promise<{ report: string; diffs: Change[] }> {
  const text1 = (await extractPDFPagesText(file1)).join('\n');
  const text2 = (await extractPDFPagesText(file2)).join('\n');

  const diffs = diffLines(text1, text2);
  const addedCount = diffs.filter((d) => d.added).length;
  const removedCount = diffs.filter((d) => d.removed).length;

  const report = `PDF Comparison Report:
Document 1: ${file1.name}
Document 2: ${file2.name}
Total Changes Detected: ${addedCount} additions, ${removedCount} deletions.
`;

  return { report, diffs };
}

export async function mergePDFs(pdfFiles: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();
  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function getPDFPageCount(pdfFile: File): Promise<number> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdf.getPageCount();
}

export async function splitPDF(pdfFile: File, pageNumbers: number[]): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const pageIndices = pageNumbers
    .map((num) => num - 1)
    .filter((idx) => idx >= 0 && idx < pdf.getPageCount());

  if (pageIndices.length === 0) {
    throw new Error('No valid page numbers provided.');
  }

  const copiedPages = await newPdf.copyPages(pdf, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function checkIfPDFEncrypted(pdfFile: File): Promise<boolean> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.isEncrypted;
  } catch {
    return true;
  }
}

export async function removePDFPassword(pdfFile: File, password?: string): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  let pdfDoc;

  try {
    if (password) {
      pdfDoc = await PDFDocument.load(arrayBuffer, { password } as any);
    } else {
      pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    }
  } catch {
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch {
      throw new Error('Password required. Please enter the correct password to unlock this PDF.');
    }
  }

  const unlockedPdf = await PDFDocument.create();
  const copiedPages = await unlockedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
  copiedPages.forEach((page) => unlockedPdf.addPage(page));

  const pdfBytes = await unlockedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function imagesToPDF(
  imageFiles: File[],
  pageSize: 'a4' | 'letter' | 'fit' = 'a4',
  orientation: 'portrait' | 'landscape' = 'portrait',
  margin: number = 20
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer();
    let embeddedImage;

    if (file.type.includes('png')) {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else {
      try {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      } catch {
        const blobUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = blobUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        URL.revokeObjectURL(blobUrl);

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx?.drawImage(img, 0, 0);

        const pngDataUrl = canvas.toDataURL('image/png');
        const pngArrayBuffer = await fetch(pngDataUrl).then((res) => res.arrayBuffer());
        embeddedImage = await pdfDoc.embedPng(pngArrayBuffer);
      }
    }

    const { width: imgWidth, height: imgHeight } = embeddedImage;

    let pageWidth = 595.28;
    let pageHeight = 841.89;

    if (pageSize === 'letter') {
      pageWidth = 612;
      pageHeight = 792;
    } else if (pageSize === 'fit') {
      pageWidth = imgWidth + margin * 2;
      pageHeight = imgHeight + margin * 2;
    }

    if (orientation === 'landscape' && pageSize !== 'fit') {
      const temp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = temp;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const maxDrawWidth = pageWidth - margin * 2;
    const maxDrawHeight = pageHeight - margin * 2;

    const scale = Math.min(maxDrawWidth / imgWidth, maxDrawHeight / imgHeight, 1);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
