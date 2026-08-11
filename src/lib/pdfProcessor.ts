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

export async function extractPDFPagesText(file: File): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageStr = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ');
      pageTexts.push(pageStr.trim() || `[Page ${i} Image / Scanned Content]`);
    }
    return pageTexts;
  } catch (err) {
    console.warn('PDFjs extraction fallback:', err);
    return [`Content from ${file.name}`];
  }
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

export async function createDocxFromPDFText(pageTexts: string[], documentTitle: string): Promise<Blob> {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: documentTitle.replace(/\.pdf$/i, ''),
          bold: true,
          size: 32,
        }),
      ],
    }),
  ];

  pageTexts.forEach((pageText, idx) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Page ${idx + 1}`,
            bold: true,
            size: 24,
            color: '1E293B',
          }),
        ],
      })
    );

    const sentences = pageText.split(/(?<=[.?!])\s+/);
    sentences.forEach((sentence) => {
      if (sentence.trim()) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: sentence.trim(), size: 22 })],
          })
        );
      }
    });
  });

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });

  return await Packer.toBlob(doc);
}

export async function createPptxFromPDFText(pageTexts: string[], documentTitle: string): Promise<Blob> {
  const pres = new pptxgen();
  pres.title = documentTitle;

  pageTexts.forEach((pageText, idx) => {
    const slide = pres.addSlide();
    slide.addText(`${documentTitle.replace(/\.pdf$/i, '')} — Slide ${idx + 1}`, {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: '0F172A',
    });

    const lines = pageText
      .split(/(?<=[.?!])\s+/)
      .filter((l) => l.trim().length > 0)
      .slice(0, 6);

    const bulletItems = lines.map((l) => ({ text: l.trim() }));
    slide.addText(bulletItems.length > 0 ? bulletItems : [{ text: pageText.substring(0, 200) }], {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 5.0,
      fontSize: 14,
      bullet: true,
      color: '334155',
    });
  });

  const blob = await pres.write({ outputType: 'blob' });
  return blob as Blob;
}

export async function convertWordToPdfBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  let extractedText = '';

  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    extractedText = result.value || 'Extracted Document Content';
  } catch {
    extractedText = await file.text();
  }

  const pdfDoc = await PDFDocument.create();
  const lines = extractedText.split('\n').filter((l) => l.trim().length > 0);

  let page = pdfDoc.addPage([595.28, 841.89]);
  let y = 800;

  page.drawText(`Converted Document: ${file.name}`, { x: 50, y, size: 16, color: rgb(0.1, 0.1, 0.1) });
  y -= 40;

  for (const line of lines) {
    if (y < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
    }
    const cleanLine = line.substring(0, 85).replace(/[\r\n]/g, '');
    page.drawText(cleanLine, { x: 50, y, size: 10, color: rgb(0.2, 0.2, 0.2) });
    y -= 18;
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function convertExcelToPdfBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[sheetName];
  const rows: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]);
  let y = 800;

  page.drawText(`Excel Spreadsheet: ${file.name} (${sheetName})`, { x: 50, y, size: 16, color: rgb(0.1, 0.1, 0.1) });
  y -= 40;

  for (const row of rows.slice(0, 45)) {
    if (y < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
    }
    const rowStr = row.map((cell) => String(cell || '')).join(' | ');
    const cleanStr = rowStr.substring(0, 90);
    page.drawText(cleanStr, { x: 50, y, size: 9, color: rgb(0.2, 0.2, 0.2) });
    y -= 16;
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function convertPptxToPdfBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideFiles = Object.keys(zip.files).filter((f) => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'));

  const pdfDoc = await PDFDocument.create();

  if (slideFiles.length === 0) {
    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawText(`Presentation Document: ${file.name}`, { x: 50, y: 780, size: 16 });
  } else {
    for (let idx = 0; idx < slideFiles.length; idx++) {
      const slideContent = await zip.files[slideFiles[idx]].async('text');
      const textMatches = slideContent.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
      const textRuns = textMatches.map((m) => m.replace(/<[^>]+>/g, '')).filter((t) => t.trim());

      const page = pdfDoc.addPage([841.89, 595.28]); // Landscape for slides
      page.drawText(`Slide ${idx + 1} — ${file.name}`, { x: 40, y: 550, size: 18, color: rgb(0.1, 0.1, 0.1) });

      let y = 500;
      for (const run of textRuns.slice(0, 15)) {
        if (y < 60) break;
        page.drawText(`• ${run.substring(0, 100)}`, { x: 50, y, size: 11, color: rgb(0.2, 0.2, 0.2) });
        y -= 24;
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
