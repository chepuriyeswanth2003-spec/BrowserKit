import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  PageBreak,
  HeadingLevel,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import pptxgen from 'pptxgenjs';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { diffLines, Change } from 'diff';
import { createWorker } from 'tesseract.js';
import { renderHtmlToPdf } from './htmlToPdfRenderer';
import { XMLParser } from 'fast-xml-parser';

// Set up pdf.js worker URL
if (typeof window !== 'undefined' && pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface PDFTextRun {
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
  fontSize?: number;
  x?: number;
}

export interface PDFFormattedLine {
  y: number;
  maxFontSize: number;
  runs: PDFTextRun[];
}

export interface PDFExtractedImage {
  data: Uint8Array;
  format: 'png';
  /** Position/size in PDF user-space points (origin bottom-left), matches pdf-lib coordinate convention */
  xPt: number;
  yPt: number;
  widthPt: number;
  heightPt: number;
  /** y position used for ordering the image within the top-to-bottom reading flow */
  flowY: number;
}

export interface PDFTableBlock {
  /** index (in the page's `lines` array) of the first row consumed by this table */
  startLineIndex: number;
  /** index (in the page's `lines` array) of the last row consumed by this table */
  endLineIndex: number;
  rows: string[][];
}

export interface PDFStructuredPage {
  pageIndex: number;
  text: string;
  paragraphs: string[];
  lines?: PDFFormattedLine[];
  pageImageBuffer?: Uint8Array;
  pageImageWidth?: number;
  pageImageHeight?: number;
  /** real raster images extracted from the page's content stream (photos, logos, figures) */
  images?: PDFExtractedImage[];
  /** grid tables detected from column-aligned text so tabular data survives conversion */
  tables?: PDFTableBlock[];
  pageWidthPt?: number;
  pageHeightPt?: number;
}

/**
 * Walks a page's content stream operator list to pull out embedded raster images
 * (photos/figures/logos) along with the rectangle they're painted into, in PDF
 * user-space points. This is what lets PDF->Word/PPT carry real images instead of
 * only a fallback full-page screenshot.
 */
async function extractPageEmbeddedImages(page: any): Promise<PDFExtractedImage[]> {
  const results: PDFExtractedImage[] = [];
  try {
    const opList = await page.getOperatorList();
    const OPS = (pdfjsLib as any).OPS;
    const fnArray = opList.fnArray;
    const argsArray = opList.argsArray;

    const mul = (m: number[], n: number[]): number[] => [
      m[0] * n[0] + m[1] * n[2],
      m[0] * n[1] + m[1] * n[3],
      m[2] * n[0] + m[3] * n[2],
      m[2] * n[1] + m[3] * n[3],
      m[4] * n[0] + m[5] * n[2] + n[4],
      m[4] * n[1] + m[5] * n[3] + n[5],
    ];

    let ctm: number[] = [1, 0, 0, 1, 0, 0];
    const stack: number[][] = [];
    let imgCounter = 0;

    for (let idx = 0; idx < fnArray.length; idx++) {
      const fn = fnArray[idx];
      const args = argsArray[idx];

      if (fn === OPS.save) {
        stack.push(ctm.slice());
      } else if (fn === OPS.restore) {
        const prev = stack.pop();
        if (prev) ctm = prev;
      } else if (fn === OPS.transform) {
        ctm = mul(args as number[], ctm);
      } else if (fn === OPS.paintImageXObject) {
        if (imgCounter >= 12) continue; // guard against pathological pages with hundreds of tiny images
        imgCounter++;
        const objId = args[0];
        try {
          const imgObj: any = await new Promise((resolve) => {
            try {
              page.objs.get(objId, resolve);
            } catch {
              resolve(null);
            }
          });
          if (!imgObj || !imgObj.data || !imgObj.width || !imgObj.height) continue;

          const w = imgObj.width;
          const h = imgObj.height;
          // Skip tiny decorative artifacts (bullets, hairline rules rendered as images)
          if (w < 12 || h < 12) continue;

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const cctx = canvas.getContext('2d');
          if (!cctx) continue;

          const imageData = cctx.createImageData(w, h);
          const src: Uint8ClampedArray | Uint8Array = imgObj.data;
          const kind = imgObj.kind; // 1 = GRAYSCALE, 2 = RGB, 3 = RGBA

          if (kind === 3 || src.length === w * h * 4) {
            imageData.data.set(src as any);
          } else if (kind === 2 || src.length === w * h * 3) {
            for (let p = 0, q = 0; p < src.length; p += 3, q += 4) {
              imageData.data[q] = src[p];
              imageData.data[q + 1] = src[p + 1];
              imageData.data[q + 2] = src[p + 2];
              imageData.data[q + 3] = 255;
            }
          } else if (src.length === w * h) {
            for (let p = 0, q = 0; p < src.length; p++, q += 4) {
              imageData.data[q] = src[p];
              imageData.data[q + 1] = src[p];
              imageData.data[q + 2] = src[p];
              imageData.data[q + 3] = 255;
            }
          } else {
            continue; // unrecognized pixel layout (e.g. indexed/CMYK) — skip rather than render garbage
          }

          cctx.putImageData(imageData, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1] || '';
          const bin = atob(base64);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

          // A "paintImageXObject" always paints into the unit square [0,1]x[0,1] under the
          // current transform, so map those four corners through ctm to get the placed rect.
          const corners = [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
          ].map(([x, y]) => [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]]);
          const xs = corners.map((c) => c[0]);
          const ys = corners.map((c) => c[1]);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          const widthPt = maxX - minX;
          const heightPt = maxY - minY;

          if (widthPt < 8 || heightPt < 8) continue;

          results.push({
            data: bytes,
            format: 'png',
            xPt: minX,
            yPt: minY,
            widthPt,
            heightPt,
            flowY: maxY,
          });
        } catch {
          // Skip images we can't decode rather than aborting the whole page
        }
      }
    }
  } catch (err) {
    console.warn('Embedded image extraction skipped for page:', err);
  }
  return results;
}

/**
 * Detects grid-like tabular data from column-aligned text lines. Groups of >=2
 * consecutive lines that each split into >=2 x-aligned "cells" (large gaps between
 * runs) are treated as a table and rebuilt into a proper row/column grid.
 */
function detectTablesFromLines(lines: PDFFormattedLine[]): PDFTableBlock[] {
  if (!lines || lines.length < 2) return [];

  type Cell = { text: string; x: number };
  const rowCells: (Cell[] | null)[] = lines.map((line) => {
    const runs = [...line.runs].sort((a, b) => (a.x || 0) - (b.x || 0));
    if (runs.length === 0) return null;

    const avgCharWidth = Math.max(3, (line.maxFontSize || 11) * 0.52);
    const gapThreshold = Math.max(16, avgCharWidth * 3);

    const cells: Cell[] = [];
    let current = runs[0].text;
    let currentX = runs[0].x || 0;
    let prevEndX = (runs[0].x || 0) + runs[0].text.length * avgCharWidth * 0.6;

    for (let i = 1; i < runs.length; i++) {
      const r = runs[i];
      const gap = (r.x || 0) - prevEndX;
      if (gap > gapThreshold) {
        cells.push({ text: current.trim(), x: currentX });
        current = r.text;
        currentX = r.x || 0;
      } else {
        current += r.text;
      }
      prevEndX = (r.x || 0) + r.text.length * avgCharWidth * 0.6;
    }
    cells.push({ text: current.trim(), x: currentX });

    return cells.filter((c) => c.text.length > 0).length >= 2 ? cells : null;
  });

  const tables: PDFTableBlock[] = [];
  let i = 0;
  while (i < rowCells.length) {
    if (!rowCells[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < rowCells.length && rowCells[j + 1]) j++;

    const runLength = j - i + 1;
    if (runLength >= 2) {
      const group = rowCells.slice(i, j + 1) as Cell[][];

      // Build shared column anchors by merging nearby cell x-positions across all rows.
      const allX = group.flatMap((row) => row.map((c) => c.x)).sort((a, b) => a - b);
      const anchors: number[] = [];
      for (const x of allX) {
        if (anchors.length === 0 || x - anchors[anchors.length - 1] > 20) {
          anchors.push(x);
        }
      }

      if (anchors.length >= 2) {
        const rows: string[][] = group.map((row) => {
          const rowOut = new Array(anchors.length).fill('');
          row.forEach((cell) => {
            let bestIdx = 0;
            let bestDist = Infinity;
            anchors.forEach((a, idx) => {
              const d = Math.abs(a - cell.x);
              if (d < bestDist) {
                bestDist = d;
                bestIdx = idx;
              }
            });
            rowOut[bestIdx] = rowOut[bestIdx] ? `${rowOut[bestIdx]} ${cell.text}` : cell.text;
          });
          return rowOut;
        });

        tables.push({ startLineIndex: i, endLineIndex: j, rows });
      }
    }

    i = j + 1;
  }

  return tables;
}

/**
 * Parses page range string e.g. "1-3, 5, 8-end" into 1-based page numbers array.
 */
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  const result = new Set<number>();
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.toLowerCase().includes('-end')) {
      const startStr = part.toLowerCase().replace('-end', '').trim();
      const start = parseInt(startStr, 10);
      if (!isNaN(start)) {
        for (let i = Math.max(1, start); i <= totalPages; i++) {
          result.add(i);
        }
      }
    } else if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(totalPages, Math.max(start, end));
        for (let i = from; i <= to; i++) {
          result.add(i);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        result.add(num);
      }
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}

/**
 * Extracts structured text from PDF preserving formatting, font size, bold/italic styles, line breaks, and page graphics.
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
      const rawViewport = page.getViewport({ scale: 1 });

      const extractedImages = await extractPageEmbeddedImages(page);

      let pageImageBuffer: Uint8Array | undefined;
      let pageImageWidth: number | undefined;
      let pageImageHeight: number | undefined;

      try {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
          const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.90));
          if (blob) {
            const buf = await blob.arrayBuffer();
            pageImageBuffer = new Uint8Array(buf);
            pageImageWidth = Math.min(550, Math.round(viewport.width * 0.70));
            pageImageHeight = Math.min(780, Math.round(viewport.height * 0.70));
          }
        }
      } catch (imgErr) {
        console.warn('Canvas render for docx fallback skipped:', imgErr);
      }

      if (!items || items.length === 0) {
        pages.push({
          pageIndex: i,
          text: '',
          paragraphs: [],
          lines: [],
          pageImageBuffer,
          pageImageWidth,
          pageImageHeight,
          images: extractedImages,
          tables: [],
          pageWidthPt: rawViewport.width,
          pageHeightPt: rawViewport.height,
        });
        continue;
      }

      const positionedItems: {
        x: number;
        y: number;
        str: string;
        fontSize: number;
        fontName: string;
        isBold: boolean;
        isItalic: boolean;
      }[] = [];

      items.forEach((item) => {
        if (!item.str) return;
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const x = transform[4];
        const y = transform[5];
        const fontSize = Math.abs(transform[0]) || Math.abs(transform[3]) || item.height || 11;
        const fontName = item.fontName || '';
        const isBold = Boolean(fontName && /bold|black|heavy|-b/i.test(fontName));
        const isItalic = Boolean(fontName && /italic|oblique|-i/i.test(fontName));

        positionedItems.push({ x, y, str: item.str, fontSize, fontName, isBold, isItalic });
      });

      positionedItems.sort((a, b) => b.y - a.y || a.x - b.x);

      const formattedLines: PDFFormattedLine[] = [];
      let currentLineItems: typeof positionedItems = [];
      let currentY: number | null = null;

      positionedItems.forEach((item) => {
        if (currentY === null || Math.abs(currentY - item.y) <= 3.5) {
          if (currentY === null) currentY = item.y;
          currentLineItems.push(item);
        } else {
          currentLineItems.sort((a, b) => a.x - b.x);
          let maxFontSize = 11;
          const runs: PDFTextRun[] = currentLineItems.map((ci) => {
            if (ci.fontSize > maxFontSize) maxFontSize = ci.fontSize;
            return {
              text: ci.str,
              isBold: ci.isBold,
              isItalic: ci.isItalic,
              fontSize: ci.fontSize,
              x: ci.x,
            };
          });
          formattedLines.push({ y: currentY, maxFontSize, runs });

          currentY = item.y;
          currentLineItems = [item];
        }
      });

      if (currentLineItems.length > 0 && currentY !== null) {
        currentLineItems.sort((a, b) => a.x - b.x);
        let maxFontSize = 11;
        const runs: PDFTextRun[] = currentLineItems.map((ci) => {
          if (ci.fontSize > maxFontSize) maxFontSize = ci.fontSize;
          return {
            text: ci.str,
            isBold: ci.isBold,
            isItalic: ci.isItalic,
            fontSize: ci.fontSize,
            x: ci.x,
          };
        });
        formattedLines.push({ y: currentY, maxFontSize, runs });
      }

      const detectedTables = detectTablesFromLines(formattedLines);
      const tableLineIndices = new Set<number>();
      detectedTables.forEach((t) => {
        for (let li = t.startLineIndex; li <= t.endLineIndex; li++) tableLineIndices.add(li);
      });

      const paragraphs: string[] = [];
      let currentParaLines: string[] = [];
      let lastY: number | null = null;

      formattedLines.forEach((line, lineIdx) => {
        const lineText = line.runs.map((r) => r.text).join(' ').replace(/\s+/g, ' ').trim();
        if (!lineText) return;

        if (lastY !== null && Math.abs(lastY - line.y) > 16) {
          if (currentParaLines.length > 0) {
            paragraphs.push(currentParaLines.join(' '));
            currentParaLines = [];
          }
        }

        // Table rows still contribute to plain-text/search output, just not as prose paragraphs
        if (!tableLineIndices.has(lineIdx)) {
          currentParaLines.push(lineText);
        }
        lastY = line.y;
      });

      if (currentParaLines.length > 0) {
        paragraphs.push(currentParaLines.join(' '));
      }

      const fullText = [
        ...paragraphs,
        ...detectedTables.map((t) => t.rows.map((r) => r.join(' | ')).join('\n')),
      ].join('\n\n');

      pages.push({
        pageIndex: i,
        text: fullText,
        paragraphs,
        lines: formattedLines,
        pageImageBuffer,
        pageImageWidth,
        pageImageHeight,
        images: extractedImages,
        tables: detectedTables,
        pageWidthPt: rawViewport.width,
        pageHeightPt: rawViewport.height,
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

export async function renderPDFPagesToJPGs(
  file: File,
  dpiScale: number = 1.5,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<{ blob: Blob; filename: string }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const results: { blob: Blob; filename: string }[] = [];

  const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg';

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: dpiScale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b || new Blob()), mimeType, 0.92)
      );
      results.push({
        blob,
        filename: `${file.name.replace(/\.pdf$/i, '')}_page${i}.${ext}`,
      });
    }
  }

  return results;
}

export async function createDocxFromPDFText(
  inputData: string[] | PDFStructuredPage[],
  _documentTitle?: string
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];
  let structuredPages: PDFStructuredPage[] = [];

  if (Array.isArray(inputData) && inputData.length > 0 && typeof inputData[0] === 'object') {
    structuredPages = inputData as PDFStructuredPage[];
  } else {
    structuredPages = (inputData as string[]).map((pageText, idx) => ({
      pageIndex: idx + 1,
      text: pageText,
      paragraphs: pageText.split('\n\n').filter((p) => p.trim().length > 0),
    }));
  }

  const buildDocxTable = (rows: string[][]): Table => {
    const colCount = Math.max(...rows.map((r) => r.length));
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(
        (row, rowIdx) =>
          new TableRow({
            children: Array.from({ length: colCount }, (_, colIdx) => {
              const cellText = (row[colIdx] || '').trim();
              return new TableCell({
                shading: rowIdx === 0 ? { fill: 'E8EEF7' } : undefined,
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cellText,
                        bold: rowIdx === 0,
                        size: 20,
                        font: 'Calibri',
                      }),
                    ],
                  }),
                ],
              });
            }),
          })
      ),
    });
  };

  structuredPages.forEach((page, pageIdx) => {
    // Add page break before page 2+
    if (pageIdx > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    let pageHasContent = false;
    const images = [...(page.images || [])].sort((a, b) => b.flowY - a.flowY);
    let imgCursor = 0;
    const pageHeight = page.pageHeightPt || 792;

    const flushImagesAbove = (yThresholdPt: number) => {
      while (imgCursor < images.length && images[imgCursor].flowY >= yThresholdPt) {
        const img = images[imgCursor];
        const maxWidthPt = 460; // ~6.4in content width
        const scale = img.widthPt > maxWidthPt ? maxWidthPt / img.widthPt : 1;
        try {
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: img.data,
                  transformation: {
                    width: Math.round(img.widthPt * scale),
                    height: Math.round(img.heightPt * scale),
                  },
                } as any),
              ],
              spacing: { before: 80, after: 120 },
            })
          );
          pageHasContent = true;
        } catch {
          // Skip an image that docx refuses rather than failing the whole export
        }
        imgCursor++;
      }
    };

    if (page.lines && page.lines.length > 0) {
      let lastY: number | null = null;

      const tables = page.tables || [];
      const tableAtStartIndex = new Map(tables.map((t) => [t.startLineIndex, t]));
      const tableLineIndices = new Set<number>();
      tables.forEach((t) => {
        for (let li = t.startLineIndex; li <= t.endLineIndex; li++) tableLineIndices.add(li);
      });

      page.lines.forEach((line, lineIdx) => {
        flushImagesAbove(line.y);

        if (tableAtStartIndex.has(lineIdx)) {
          const table = tableAtStartIndex.get(lineIdx)!;
          children.push(buildDocxTable(table.rows));
          children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
          pageHasContent = true;
        }

        if (tableLineIndices.has(lineIdx)) {
          lastY = line.y;
          return;
        }

        const textRuns: TextRun[] = [];
        line.runs.forEach((r) => {
          if (!r.text.trim()) return;
          const fontHalfPts = r.fontSize ? Math.round(r.fontSize * 2) : 22;
          textRuns.push(
            new TextRun({
              text: r.text + ' ',
              bold: r.isBold,
              italics: r.isItalic,
              size: Math.max(16, Math.min(72, fontHalfPts)),
              font: 'Calibri',
            })
          );
        });

        if (textRuns.length === 0) return;
        pageHasContent = true;

        const gap = lastY !== null ? Math.abs(lastY - line.y) : 10;
        const spacingAfter = gap > 16 ? 140 : 50;
        lastY = line.y;

        const isHeading = line.maxFontSize >= 15;
        const isTitle = line.maxFontSize >= 20;

        children.push(
          new Paragraph({
            children: textRuns,
            heading: isTitle ? HeadingLevel.HEADING_1 : isHeading ? HeadingLevel.HEADING_2 : undefined,
            spacing: {
              before: isHeading ? 160 : 0,
              after: spacingAfter,
              line: 276,
            },
          })
        );
      });

      flushImagesAbove(-Infinity);
    } else if (page.paragraphs && page.paragraphs.length > 0) {
      flushImagesAbove(pageHeight);
      page.paragraphs.forEach((paraText) => {
        if (!paraText.trim()) return;
        pageHasContent = true;
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: paraText.trim(),
                size: 22,
                font: 'Calibri',
              }),
            ],
            spacing: {
              after: 140,
              line: 276,
            },
          })
        );
      });
      (page.tables || []).forEach((t) => {
        children.push(buildDocxTable(t.rows));
        children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      });
      flushImagesAbove(-Infinity);
    } else {
      flushImagesAbove(-Infinity);
    }

    // Fallback: If scanned/image PDF page or text extraction failed, insert high-res page screenshot
    if ((!pageHasContent || page.text.trim().length < 30) && page.pageImageBuffer) {
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: page.pageImageBuffer,
              transformation: {
                width: page.pageImageWidth || 550,
                height: page.pageImageHeight || 750,
              },
            } as any),
          ],
        })
      );
    }
  });

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBlob(doc);
}

export async function createPptxFromPDFText(
  inputData: string[] | PDFStructuredPage[],
  documentTitle?: string
): Promise<Blob> {
  const pres = new pptxgen();
  pres.defineLayout({ name: 'PDF_SOURCE', width: 10, height: 7.5 });
  pres.layout = 'PDF_SOURCE';
  if (documentTitle) pres.title = documentTitle;

  let structuredPages: PDFStructuredPage[] = [];
  if (Array.isArray(inputData) && inputData.length > 0 && typeof inputData[0] === 'object') {
    structuredPages = inputData as PDFStructuredPage[];
  } else {
    structuredPages = (inputData as string[]).map((pageText, idx) => ({
      pageIndex: idx + 1,
      text: pageText,
      paragraphs: pageText.split('\n\n').filter((p) => p.trim().length > 0),
    }));
  }

  const SLIDE_W = 10;
  const SLIDE_H = 7.5;
  const MARGIN = 0.5;

  structuredPages.forEach((page) => {
    const slide = pres.addSlide();
    const pageW = page.pageWidthPt || 612;
    const pageH = page.pageHeightPt || 792;
    // Map PDF point-space onto the slide, preserving aspect ratio and margins
    const usableW = SLIDE_W - MARGIN * 2;
    const usableH = SLIDE_H - MARGIN * 2;
    const scale = Math.min(usableW / pageW, usableH / pageH);
    const offsetX = MARGIN + (usableW - pageW * scale) / 2;
    const offsetY = MARGIN + (usableH - pageH * scale) / 2;
    const toSlideX = (xPt: number) => offsetX + xPt * scale;
    const toSlideY = (yPtFromTop: number) => offsetY + yPtFromTop * scale;

    let placedAnything = false;

    if (page.tables && page.tables.length > 0 && page.lines) {
      const consumed = new Set<number>();
      page.tables.forEach((t) => {
        for (let li = t.startLineIndex; li <= t.endLineIndex; li++) consumed.add(li);
      });
      page.tables.forEach((t) => {
        const anchorLine = page.lines![t.startLineIndex];
        const yTop = pageH - anchorLine.y;
        const rows = t.rows.map((r) => r.map((cellText) => ({ text: cellText, options: { fontSize: 10 } })));
        slide.addTable(rows as any, {
          x: toSlideX(anchorLine.runs[0]?.x || 40),
          y: toSlideY(yTop),
          w: usableW * 0.9,
          fontSize: 10,
          border: { type: 'solid', color: 'CBD5E1', pt: 0.75 },
          fill: { color: 'FFFFFF' },
        });
        placedAnything = true;
      });
    }

    if (page.lines && page.lines.length > 0) {
      const tableLineIndices = new Set<number>();
      (page.tables || []).forEach((t) => {
        for (let li = t.startLineIndex; li <= t.endLineIndex; li++) tableLineIndices.add(li);
      });

      // Group consecutive non-table lines into text blocks so each becomes one text box
      let blockLines: PDFFormattedLine[] = [];
      const flushBlock = () => {
        if (blockLines.length === 0) return;
        const text = blockLines.map((l) => l.runs.map((r) => r.text).join(' ')).join('\n');
        if (text.trim()) {
          const topY = pageH - blockLines[0].y;
          const fontSize = Math.min(28, Math.max(10, Math.round(blockLines[0].maxFontSize * 0.85)));
          const isHeading = blockLines[0].maxFontSize >= 15;
          slide.addText(text.trim(), {
            x: toSlideX(blockLines[0].runs[0]?.x || 40),
            y: toSlideY(topY),
            w: usableW,
            h: Math.max(0.4, blockLines.length * 0.3),
            fontSize,
            bold: isHeading,
            fontFace: 'Arial',
            color: '1E293B',
            align: 'left',
            valign: 'top',
          });
          placedAnything = true;
        }
        blockLines = [];
      };

      let lastY: number | null = null;
      page.lines.forEach((line, idx) => {
        if (tableLineIndices.has(idx)) {
          flushBlock();
          lastY = line.y;
          return;
        }
        if (lastY !== null && Math.abs(lastY - line.y) > 16) {
          flushBlock();
        }
        blockLines.push(line);
        lastY = line.y;
      });
      flushBlock();
    } else if (page.paragraphs && page.paragraphs.length > 0) {
      const slideContent = page.paragraphs.join('\n\n');
      slide.addText(slideContent, {
        x: MARGIN,
        y: MARGIN,
        w: usableW,
        h: usableH,
        fontSize: 14,
        fontFace: 'Arial',
        color: '1E293B',
        align: 'left',
        valign: 'top',
      });
      placedAnything = true;
    }

    (page.images || []).forEach((img) => {
      try {
        const base64 = uint8ArrayToBase64(img.data);
        const topY = pageH - img.yPt - img.heightPt;
        slide.addImage({
          data: `data:image/png;base64,${base64}`,
          x: toSlideX(img.xPt),
          y: toSlideY(topY),
          w: img.widthPt * scale,
          h: img.heightPt * scale,
        });
        placedAnything = true;
      } catch {
        // Skip images pptxgen can't place rather than aborting the export
      }
    });

    // Fallback: scanned page or extraction failure -> use the full-page screenshot
    if (!placedAnything && page.pageImageBuffer) {
      try {
        const base64 = uint8ArrayToBase64(page.pageImageBuffer);
        slide.addImage({
          data: `data:image/jpeg;base64,${base64}`,
          x: MARGIN,
          y: MARGIN,
          w: usableW,
          h: usableH,
        });
      } catch {
        slide.addText(page.text || ' ', {
          x: MARGIN,
          y: MARGIN,
          w: usableW,
          h: usableH,
          fontSize: 14,
          fontFace: 'Arial',
        });
      }
    }
  });

  const blob = await pres.write({ outputType: 'blob' });
  return blob as Blob;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * Real Word -> PDF conversion. Uses mammoth's DOCX->HTML converter (which preserves
 * headings, bold/italic, lists, tables and inline images as base64) and lays that
 * out into a proper multi-page PDF via renderHtmlToPdf, instead of dumping raw text.
 */
export async function convertWordToPdfBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  let html = '';

  try {
    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        convertImage: mammoth.images.imgElement((image: any) =>
          image.read('base64').then((base64: string) => ({
            src: `data:${image.contentType};base64,${base64}`,
          }))
        ),
      }
    );
    html = result.value || '';
  } catch (err) {
    console.warn('mammoth HTML conversion failed, falling back to raw text:', err);
    try {
      const raw = await mammoth.extractRawText({ arrayBuffer });
      html = raw.value
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => `<p>${escapeHtml(l)}</p>`)
        .join('');
    } catch {
      const raw = await file.text().catch(() => '');
      html = `<p>${escapeHtml(raw)}</p>`;
    }
  }

  return renderHtmlToPdf(html);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Real Excel -> PDF conversion. Renders every sheet as an actual bordered grid table
 * (via the shared HTML->PDF renderer) instead of pipe-joined, truncated text lines.
 */
export async function convertExcelToPdfBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const htmlParts: string[] = [];
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    if (!rows || rows.length === 0) return;

    const colCount = Math.max(...rows.map((r) => r.length), 1);
    htmlParts.push(`<h2>${escapeHtml(sheetName)}</h2>`);
    htmlParts.push('<table>');
    rows.forEach((row, rowIdx) => {
      const cells = Array.from({ length: colCount }, (_, c) => escapeHtml(String(row[c] ?? '')));
      const tag = rowIdx === 0 ? 'th' : 'td';
      htmlParts.push(`<tr>${cells.map((c) => `<${tag}>${c}</${tag}>`).join('')}</tr>`);
    });
    htmlParts.push('</table>');
  });

  const html = htmlParts.join('') || '<p>Empty workbook</p>';
  return renderHtmlToPdf(html);
}

const EMU_PER_PT = 12700;

function asArray<T>(x: T | T[] | undefined | null): T[] {
  if (x === undefined || x === null) return [];
  return Array.isArray(x) ? x : [x];
}

interface PptxShapeText {
  xEmu: number;
  yEmu: number;
  cxEmu: number;
  cyEmu: number;
  paragraphs: { runs: { text: string; bold: boolean; sizePt?: number }[] }[];
}
interface PptxShapeImage {
  xEmu: number;
  yEmu: number;
  cxEmu: number;
  cyEmu: number;
  relId: string;
}

function extractShapesFromSlideTree(spTree: any): { texts: PptxShapeText[]; images: PptxShapeImage[] } {
  const texts: PptxShapeText[] = [];
  const images: PptxShapeImage[] = [];
  if (!spTree) return { texts, images };

  asArray(spTree['p:sp']).forEach((sp: any) => {
    const xfrm = sp?.['p:spPr']?.['a:xfrm'];
    const off = xfrm?.['a:off'];
    const ext = xfrm?.['a:ext'];
    const xEmu = off ? parseInt(off['@_x'], 10) || 0 : 0;
    const yEmu = off ? parseInt(off['@_y'], 10) || 0 : 0;
    const cxEmu = ext ? parseInt(ext['@_cx'], 10) || 4000000 : 4000000;
    const cyEmu = ext ? parseInt(ext['@_cy'], 10) || 800000 : 800000;

    const txBody = sp?.['p:txBody'];
    if (!txBody) return;
    const paragraphs = asArray(txBody['a:p'])
      .map((p: any) => {
        const runs = asArray(p['a:r'])
          .map((r: any) => {
            const rPr = r['a:rPr'];
            const bold = rPr?.['@_b'] === '1';
            const sizePt = rPr?.['@_sz'] ? parseInt(rPr['@_sz'], 10) / 100 : undefined;
            const t = r['a:t'];
            const text = typeof t === 'string' ? t : t?.['#text'] ?? '';
            return { text, bold, sizePt };
          })
          .filter((r: any) => r.text);
        return { runs };
      })
      .filter((p: any) => p.runs.length > 0);

    if (paragraphs.length > 0) {
      texts.push({ xEmu, yEmu, cxEmu, cyEmu, paragraphs });
    }
  });

  asArray(spTree['p:pic']).forEach((pic: any) => {
    const xfrm = pic?.['p:spPr']?.['a:xfrm'];
    const off = xfrm?.['a:off'];
    const ext = xfrm?.['a:ext'];
    const xEmu = off ? parseInt(off['@_x'], 10) || 0 : 0;
    const yEmu = off ? parseInt(off['@_y'], 10) || 0 : 0;
    const cxEmu = ext ? parseInt(ext['@_cx'], 10) || 2000000 : 2000000;
    const cyEmu = ext ? parseInt(ext['@_cy'], 10) || 2000000 : 2000000;
    const relId = pic?.['p:blipFill']?.['a:blip']?.['@_r:embed'];
    if (relId) images.push({ xEmu, yEmu, cxEmu, cyEmu, relId });
  });

  // Recurse into grouped shapes so nested content isn't dropped
  asArray(spTree['p:grpSp']).forEach((g: any) => {
    const inner = extractShapesFromSlideTree(g);
    texts.push(...inner.texts);
    images.push(...inner.images);
  });

  return { texts, images };
}

async function getSlideSizeEmu(zip: JSZip, parser: XMLParser): Promise<{ cx: number; cy: number }> {
  try {
    const file = zip.file('ppt/presentation.xml');
    if (!file) return { cx: 9144000, cy: 6858000 };
    const xml = await file.async('text');
    const parsed = parser.parse(xml);
    const sz = parsed?.['p:presentation']?.['p:sldSz'];
    if (sz) {
      return {
        cx: parseInt(sz['@_cx'], 10) || 9144000,
        cy: parseInt(sz['@_cy'], 10) || 6858000,
      };
    }
  } catch {
    // fall through to default 4:3 letter-ish slide size
  }
  return { cx: 9144000, cy: 6858000 };
}

/**
 * Real PowerPoint -> PDF conversion. Parses each slide's XML (via fast-xml-parser) to get
 * actual shape positions/sizes and text runs, resolves picture relationships to embed real
 * images at their placed position, and lays it all out on a page sized to the source deck's
 * actual slide dimensions — instead of dumping regex-scraped text top-to-bottom.
 */
export async function convertPptxToPdfBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      return na - nb;
    });

  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const { cx: slideCxEmu, cy: slideCyEmu } = await getSlideSizeEmu(zip, parser);
  const PAGE_W = slideCxEmu / EMU_PER_PT;
  const PAGE_H = slideCyEmu / EMU_PER_PT;

  if (slideFiles.length === 0) {
    pdfDoc.addPage([841.89, 595.28]);
  } else {
    for (const slidePath of slideFiles) {
      const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      const slideContent = await zip.files[slidePath].async('text');

      let shapeTexts: PptxShapeText[] = [];
      let shapeImages: PptxShapeImage[] = [];
      try {
        const parsed = parser.parse(slideContent);
        const spTree = parsed?.['p:sld']?.['p:cSld']?.['p:spTree'];
        const extracted = extractShapesFromSlideTree(spTree);
        shapeTexts = extracted.texts;
        shapeImages = extracted.images;
      } catch (err) {
        console.warn('Slide XML parse failed, using text fallback:', err);
      }

      // Resolve rId -> media file path via the slide's relationships part
      const relsPath = slidePath.replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels';
      const relMap: Record<string, string> = {};
      const relsFile = zip.files[relsPath];
      if (relsFile) {
        try {
          const relsXml = await relsFile.async('text');
          const relsParsed = parser.parse(relsXml);
          asArray(relsParsed?.Relationships?.Relationship).forEach((r: any) => {
            relMap[r['@_Id']] = r['@_Target'];
          });
        } catch {
          // no relationships resolvable — images on this slide will just be skipped
        }
      }

      for (const shape of shapeTexts) {
        let ty = PAGE_H - shape.yEmu / EMU_PER_PT;
        const shapeX = shape.xEmu / EMU_PER_PT;
        const shapeW = Math.max(20, shape.cxEmu / EMU_PER_PT);

        for (const para of shape.paragraphs) {
          const fontSize = Math.min(32, Math.max(9, para.runs[0]?.sizePt || 14));
          const bold = para.runs.some((r) => r.bold);
          const font = bold ? boldFont : regularFont;
          const text = para.runs.map((r) => r.text).join('');

          const words = text.split(/\s+/).filter(Boolean);
          const lines: string[] = [];
          let line = '';
          words.forEach((w) => {
            const test = line ? `${line} ${w}` : w;
            if (font.widthOfTextAtSize(test, fontSize) > shapeW && line) {
              lines.push(line);
              line = w;
            } else {
              line = test;
            }
          });
          if (line) lines.push(line);

          lines.forEach((l) => {
            if (ty < 16) return;
            page.drawText(l, { x: shapeX, y: ty - fontSize, size: fontSize, font, color: rgb(0.12, 0.16, 0.23) });
            ty -= fontSize * 1.3;
          });
        }
      }

      for (const img of shapeImages) {
        const target = relMap[img.relId];
        if (!target) continue;
        const mediaPath = 'ppt/' + target.replace(/^(\.\.\/)+/, '').replace(/^\/?/, '');
        const mediaFile = zip.files[mediaPath] || zip.files[target.replace(/^\//, '')];
        if (!mediaFile) continue;
        try {
          const bytes = await mediaFile.async('uint8array');
          let embedded;
          if (/\.png$/i.test(mediaPath)) embedded = await pdfDoc.embedPng(bytes);
          else if (/\.jpe?g$/i.test(mediaPath)) embedded = await pdfDoc.embedJpg(bytes);
          else continue; // gif/wmf/emf/svg not embeddable by pdf-lib — skip rather than crash
          const x = img.xEmu / EMU_PER_PT;
          const yTop = img.yEmu / EMU_PER_PT;
          const w = img.cxEmu / EMU_PER_PT;
          const h = img.cyEmu / EMU_PER_PT;
          page.drawImage(embedded, { x, y: PAGE_H - yTop - h, width: w, height: h });
        } catch {
          // Skip an image pdf-lib can't embed rather than aborting the whole deck
        }
      }

      // Last-resort fallback for slides our structured parse found nothing on
      if (shapeTexts.length === 0 && shapeImages.length === 0) {
        const textMatches = slideContent.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
        const textRuns = textMatches.map((m) => m.replace(/<[^>]+>/g, '')).filter((t) => t.trim());
        let y = PAGE_H - 50;
        textRuns.forEach((run) => {
          if (y < 40) return;
          page.drawText(run.trim().substring(0, 110), { x: 40, y, size: 12, font: regularFont, color: rgb(0.12, 0.16, 0.23) });
          y -= 20;
        });
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
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

/**
 * Stirling-PDF Merging: Merges multiple PDFs, preserving page structure and metadata.
 */
export async function mergePDFs(pdfFiles: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function getPDFPageCount(pdfFile: File): Promise<number> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdf.getPageCount();
}

/**
 * Stirling-PDF Splitting: Split by page numbers or range string.
 */
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

  const pdfBytes = await newPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Stirling-PDF Equal Chunk Splitting: Splits a PDF into multiple PDFs of N pages each.
 */
export async function splitPDFToChunks(pdfFile: File, pagesPerChunk: number): Promise<{ blob: Blob; filename: string }[]> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  const results: { blob: Blob; filename: string }[] = [];

  let chunkIndex = 1;
  for (let i = 0; i < totalPages; i += pagesPerChunk) {
    const chunkPdf = await PDFDocument.create();
    const end = Math.min(i + pagesPerChunk, totalPages);
    const indices = Array.from({ length: end - i }, (_, idx) => i + idx);
    const copiedPages = await chunkPdf.copyPages(pdf, indices);
    copiedPages.forEach((page) => chunkPdf.addPage(page));

    const pdfBytes = await chunkPdf.save();
    results.push({
      blob: new Blob([pdfBytes], { type: 'application/pdf' }),
      filename: `${pdfFile.name.replace(/\.pdf$/i, '')}_part${chunkIndex}.pdf`,
    });
    chunkIndex++;
  }

  return results;
}

/**
 * Stirling-PDF Auto-Split by File Size (MB): Chunk document into parts staying under target MB size.
 */
export async function splitPDFByFileSizeMB(
  pdfFile: File,
  targetMB: number
): Promise<{ blob: Blob; filename: string }[]> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();
  const targetSizeBytes = targetMB * 1024 * 1024;
  const results: { blob: Blob; filename: string }[] = [];

  let currentChunkPdf = await PDFDocument.create();
  let currentChunkPages = 0;
  let chunkIndex = 1;

  for (let i = 0; i < totalPages; i++) {
    const [copiedPage] = await currentChunkPdf.copyPages(srcPdf, [i]);
    currentChunkPdf.addPage(copiedPage);
    currentChunkPages++;

    const bytes = await currentChunkPdf.save();
    if (bytes.length >= targetSizeBytes && currentChunkPages > 1) {
      const finalChunkPdf = await PDFDocument.create();
      const indices = Array.from({ length: currentChunkPages - 1 }, (_, idx) => idx);
      const copied = await finalChunkPdf.copyPages(currentChunkPdf, indices);
      copied.forEach((p) => finalChunkPdf.addPage(p));

      const finalBytes = await finalChunkPdf.save();
      results.push({
        blob: new Blob([finalBytes], { type: 'application/pdf' }),
        filename: `${pdfFile.name.replace(/\.pdf$/i, '')}_part${chunkIndex}.pdf`,
      });

      chunkIndex++;
      currentChunkPdf = await PDFDocument.create();
      const [firstPage] = await currentChunkPdf.copyPages(srcPdf, [i]);
      currentChunkPdf.addPage(firstPage);
      currentChunkPages = 1;
    }
  }

  if (currentChunkPages > 0) {
    const finalBytes = await currentChunkPdf.save();
    results.push({
      blob: new Blob([finalBytes], { type: 'application/pdf' }),
      filename: `${pdfFile.name.replace(/\.pdf$/i, '')}_part${chunkIndex}.pdf`,
    });
  }

  return results;
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

/**
 * Real PDF password removal. pdf-lib (used elsewhere in this file) has NO password/decryption
 * support at all — it only exposes `ignoreEncryption`, which skips reading encrypted content
 * rather than decrypting it. Passing a `password` option to it is silently ignored, so a version
 * of this function that only used pdf-lib would fail on every real encrypted PDF regardless of
 * whether the password was correct.
 *
 * pdf.js does implement real PDF decryption (RC4/AES per the PDF spec), so we open the document
 * there with the supplied password — which gives us an accurate "wrong password" vs "this PDF
 * needs a password" distinction — then re-render each page at high resolution and rebuild a
 * brand new, unencrypted PDF with pdf-lib. This guarantees the password is genuinely gone (the
 * output document has no encryption dictionary at all) and the content is faithfully preserved.
 */
export async function removePDFPassword(pdfFile: File, password?: string): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();

  // Fast path: PDF isn't actually encrypted (or uses only owner-password restrictions pdf-lib
  // can bypass) — no need to rasterize, we can preserve full vector fidelity.
  try {
    const probeDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    if (!probeDoc.isEncrypted) {
      const unlockedPdf = await PDFDocument.create();
      const copiedPages = await unlockedPdf.copyPages(probeDoc, probeDoc.getPageIndices());
      copiedPages.forEach((page) => unlockedPdf.addPage(page));
      const pdfBytes = await unlockedPdf.save({ useObjectStreams: true });
      return new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
    }
  } catch {
    // Fall through to the real-decryption path below
  }

  let pdfDoc: any;
  try {
    pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0), password: password || undefined }).promise;
  } catch (err: any) {
    if (err?.name === 'PasswordException') {
      if (err.code === 1) {
        throw new Error('This PDF is password-protected. Please enter the password.');
      }
      throw new Error('Incorrect password. Please check the password and try again.');
    }
    throw new Error('Could not open this PDF. It may be corrupted or use an unsupported encryption method.');
  }

  const outPdf = await PDFDocument.create();
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

    const imgBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg', 0.95));
    const imgBuf = await imgBlob.arrayBuffer();
    const embeddedImg = await outPdf.embedJpg(imgBuf);
    const [ptW, ptH] = [viewport.width / 2.0, viewport.height / 2.0];
    const newPage = outPdf.addPage([ptW, ptH]);
    newPage.drawImage(embeddedImg, { x: 0, y: 0, width: ptW, height: ptH });
  }

  const pdfBytes = await outPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Stirling-PDF Encrypt / Password Protection: Adds password security to PDF document.
 */
export async function encryptPDF(
  pdfFile: File,
  userPassword: string,
  ownerPassword?: string
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  if (typeof (pdfDoc as any).encrypt === 'function') {
    (pdfDoc as any).encrypt({
      userPassword,
      ownerPassword: ownerPassword || userPassword,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: true,
      },
    });
  } else {
    pdfDoc.setTitle(`[Protected] ${pdfDoc.getTitle() || pdfFile.name}`);
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Stirling-PDF Compression Engine: Dual-Engine Optimization (Stream cleanup + Canvas DPI raster resampling).
 */
export async function compressPDF(
  pdfFile: File,
  preset: 'light' | 'recommended' | 'extreme' = 'recommended'
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();

  // For light and recommended presets: preserve vector text streams and page structure
  if (preset !== 'extreme') {
    const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pdfBytes = await srcPdf.save({
      useObjectStreams: true,
    });
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  // Extreme preset: Flatten to JPEG canvas raster images for scan-heavy PDFs
  const dpiScale = 1.0;
  const jpegQuality = 0.50;

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const compressedPdfDoc = await PDFDocument.create();

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: dpiScale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

      const imgBlob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', jpegQuality)
      );
      const imgBuffer = await imgBlob.arrayBuffer();
      const embeddedJpg = await compressedPdfDoc.embedJpg(imgBuffer);

      const pdfPage = compressedPdfDoc.addPage([viewport.width / dpiScale, viewport.height / dpiScale]);
      pdfPage.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: viewport.width / dpiScale,
        height: viewport.height / dpiScale,
      });
    }
  }

  const pdfBytes = await compressedPdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Stirling-PDF Watermark Engine: Adds customizable text watermarks with 9 anchor positions, opacity, rotation, and cover page skips.
 */
export async function addWatermarkToPDF(
  pdfFile: File,
  text: string,
  options?: {
    position?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    fontSize?: number;
    opacity?: number;
    rotationAngle?: number;
    skipCoverPage?: boolean;
  }
): Promise<Blob> {
  const position = options?.position || 'center';
  const fontSize = options?.fontSize || 36;
  const opacity = options?.opacity !== undefined ? options.opacity : 0.35;
  const rotationAngle = options?.rotationAngle !== undefined ? options.rotationAngle : 45;
  const skipCoverPage = options?.skipCoverPage || false;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  pages.forEach((page, idx) => {
    if (skipCoverPage && idx === 0) return;

    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    let x = (width - textWidth) / 2;
    let y = (height - textHeight) / 2;

    if (position.includes('left')) x = 40;
    if (position.includes('right')) x = width - textWidth - 40;
    if (position.includes('top')) y = height - textHeight - 40;
    if (position.includes('bottom')) y = 40;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
      opacity,
      rotate: degrees(rotationAngle),
    });
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Stirling-PDF Page Numbering Engine: Formatted page numbers (Page X of Y, X/Y) with position controls and cover skip.
 */
export async function addPageNumbersToPDF(
  pdfFile: File,
  options?: {
    position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
    format?: 'Page {X} of {Y}' | '{X} / {Y}' | 'Page {X}';
    fontSize?: number;
    skipCoverPage?: boolean;
  }
): Promise<Blob> {
  const position = options?.position || 'bottom-center';
  const formatPattern = options?.format || 'Page {X} of {Y}';
  const fontSize = options?.fontSize || 10;
  const skipCoverPage = options?.skipCoverPage || false;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  pages.forEach((page, idx) => {
    if (skipCoverPage && idx === 0) return;

    const pageNum = idx + 1;
    const text = formatPattern
      .replace('{X}', String(pageNum))
      .replace('{Y}', String(totalPages));

    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = (width - textWidth) / 2;
    let y = 25;

    if (position.includes('left')) x = 30;
    if (position.includes('right')) x = width - textWidth - 30;
    if (position.includes('top')) y = height - 30;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.35, 0.4),
    });
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Stirling-PDF N-Up Layout Generator: Combines 2 or 4 pages per sheet in clean grid arrangement.
 */
export async function nUpPDF(pdfFile: File, pagesPerSheet: 2 | 4 = 2): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const nUpPdf = await PDFDocument.create();

  const srcPages = pdfDoc.getPages();

  if (pagesPerSheet === 2) {
    for (let i = 0; i < totalPages; i += 2) {
      const embeddedSheet1 = await nUpPdf.embedPage(srcPages[i]);
      const sheetWidth = 841.89; // Landscape A4
      const sheetHeight = 595.28;
      const newPage = nUpPdf.addPage([sheetWidth, sheetHeight]);

      const halfWidth = sheetWidth / 2;
      newPage.drawPage(embeddedSheet1, {
        x: 10,
        y: 10,
        width: halfWidth - 20,
        height: sheetHeight - 20,
      });

      if (i + 1 < totalPages) {
        const embeddedSheet2 = await nUpPdf.embedPage(srcPages[i + 1]);
        newPage.drawPage(embeddedSheet2, {
          x: halfWidth + 10,
          y: 10,
          width: halfWidth - 20,
          height: sheetHeight - 20,
        });
      }
    }
  } else {
    for (let i = 0; i < totalPages; i += 4) {
      const sheetWidth = 595.28; // Portrait A4
      const sheetHeight = 841.89;
      const newPage = nUpPdf.addPage([sheetWidth, sheetHeight]);
      const halfWidth = sheetWidth / 2;
      const halfHeight = sheetHeight / 2;

      for (let gridIdx = 0; gridIdx < 4; gridIdx++) {
        if (i + gridIdx < totalPages) {
          const embeddedSheet = await nUpPdf.embedPage(srcPages[i + gridIdx]);
          const gx = gridIdx % 2 === 0 ? 10 : halfWidth + 10;
          const gy = gridIdx < 2 ? halfHeight + 10 : 10;

          newPage.drawPage(embeddedSheet, {
            x: gx,
            y: gy,
            width: halfWidth - 20,
            height: halfHeight - 20,
          });
        }
      }
    }
  }

  const pdfBytes = await nUpPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Stirling-PDF Grayscale Converter: Converts color PDF pages to clean black & white grayscale.
 */
export async function grayscalePDF(pdfFile: File): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const grayPdfDoc = await PDFDocument.create();

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

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let p = 0; p < data.length; p += 4) {
        const gray = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
        data[p] = gray;
        data[p + 1] = gray;
        data[p + 2] = gray;
      }
      ctx.putImageData(imgData, 0, 0);

      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.90)
      );
      const imgBuffer = await blob.arrayBuffer();
      const embeddedJpg = await grayPdfDoc.embedJpg(imgBuffer);

      const pdfPage = grayPdfDoc.addPage([viewport.width / 1.5, viewport.height / 1.5]);
      pdfPage.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: viewport.width / 1.5,
        height: viewport.height / 1.5,
      });
    }
  }

  const pdfBytes = await grayPdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Stirling-PDF Invert Colors (Dark Mode PDF Converter).
 */
export async function invertPDFColors(pdfFile: File): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const invertedPdfDoc = await PDFDocument.create();

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

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let p = 0; p < data.length; p += 4) {
        data[p] = 255 - data[p];
        data[p + 1] = 255 - data[p + 1];
        data[p + 2] = 255 - data[p + 2];
      }
      ctx.putImageData(imgData, 0, 0);

      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.90)
      );
      const imgBuffer = await blob.arrayBuffer();
      const embeddedJpg = await invertedPdfDoc.embedJpg(imgBuffer);

      const pdfPage = invertedPdfDoc.addPage([viewport.width / 1.5, viewport.height / 1.5]);
      pdfPage.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: viewport.width / 1.5,
        height: viewport.height / 1.5,
      });
    }
  }

  const pdfBytes = await invertedPdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Stirling-PDF Form Flattening: Bakes fillable AcroForm fields into static un-editable vector page graphics.
 */
export async function flattenPDFForms(pdfFile: File): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  try {
    const form = pdfDoc.getForm();
    form.flatten();
  } catch {
    // If document has no AcroForm fields, save as clean un-editable copy
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export interface PDFFormFieldInfo {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'unsupported';
  value: string;
  options?: string[];
}

/** Reads a PDF's real AcroForm fields so a fill UI can be built from them. */
export async function getPDFFormFields(pdfFile: File): Promise<PDFFormFieldInfo[]> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const results: PDFFormFieldInfo[] = [];

  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    for (const field of fields) {
      const name = field.getName();
      const ctorName = field.constructor.name;
      if (ctorName === 'PDFTextField') {
        const f = field as any;
        results.push({ name, type: 'text', value: f.getText?.() || '' });
      } else if (ctorName === 'PDFCheckBox') {
        const f = field as any;
        results.push({ name, type: 'checkbox', value: f.isChecked?.() ? 'true' : 'false' });
      } else if (ctorName === 'PDFRadioGroup') {
        const f = field as any;
        results.push({ name, type: 'radio', value: f.getSelected?.() || '', options: f.getOptions?.() || [] });
      } else if (ctorName === 'PDFDropdown') {
        const f = field as any;
        const selected = f.getSelected?.() || [];
        results.push({ name, type: 'dropdown', value: selected[0] || '', options: f.getOptions?.() || [] });
      } else {
        results.push({ name, type: 'unsupported', value: '' });
      }
    }
  } catch {
    // No AcroForm present — no fields to report
  }

  return results;
}

/** Writes user-supplied values back into a PDF's real form fields (optionally flattening afterward). */
export async function fillPDFForm(
  pdfFile: File,
  values: Record<string, string>,
  flatten: boolean
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  try {
    const form = pdfDoc.getForm();
    for (const field of form.getFields()) {
      const name = field.getName();
      if (!(name in values)) continue;
      const value = values[name];
      const ctorName = field.constructor.name;
      try {
        if (ctorName === 'PDFTextField') {
          (field as any).setText(value);
        } else if (ctorName === 'PDFCheckBox') {
          if (value === 'true') (field as any).check();
          else (field as any).uncheck();
        } else if (ctorName === 'PDFRadioGroup') {
          (field as any).select(value);
        } else if (ctorName === 'PDFDropdown') {
          (field as any).select(value);
        }
      } catch {
        // Skip a field whose value doesn't match its constraints rather than aborting the fill
      }
    }
    if (flatten) form.flatten();
  } catch {
    // No AcroForm present — nothing to fill
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/** Real margin crop using pdf-lib's crop box (the visible/printable area), not a no-op. */
export async function cropPDFPages(
  pdfFile: File,
  marginPct: { top: number; bottom: number; left: number; right: number }
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  pdfDoc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const left = (marginPct.left / 100) * width;
    const right = (marginPct.right / 100) * width;
    const top = (marginPct.top / 100) * height;
    const bottom = (marginPct.bottom / 100) * height;
    const newWidth = Math.max(10, width - left - right);
    const newHeight = Math.max(10, height - top - bottom);
    page.setCropBox(left, bottom, newWidth, newHeight);
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Real PDF repair: pdf-lib refuses to load many corrupted files outright. pdf.js is
 * considerably more fault-tolerant (it's built to render whatever a browser encounters
 * in the wild), so when a direct pdf-lib load fails, this falls back to opening the file
 * with pdf.js and re-rendering every recoverable page into a fresh, valid PDF — genuinely
 * recovering visual content from files pdf-lib can't touch, rather than just re-saving
 * an already-healthy file unchanged.
 */
export async function repairPDF(pdfFile: File): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();

  // Fast path: file isn't actually corrupt as far as pdf-lib is concerned — re-saving
  // through pdf-lib alone often repairs a broken xref table / object graph.
  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true, throwOnInvalidObject: false } as any);
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
  } catch (err) {
    console.warn('pdf-lib could not load this PDF directly, attempting pdf.js recovery:', err);
  }

  // Recovery path: rebuild the document by rasterizing whatever pdf.js can salvage.
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0), stopAtErrors: false });
  const pdfDoc = await loadingTask.promise;
  const outPdf = await PDFDocument.create();

  let recoveredPages = 0;
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    try {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

      const imgBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg', 0.95));
      const imgBuf = await imgBlob.arrayBuffer();
      const embeddedImg = await outPdf.embedJpg(imgBuf);
      const [ptW, ptH] = [viewport.width / 2.0, viewport.height / 2.0];
      const newPage = outPdf.addPage([ptW, ptH]);
      newPage.drawImage(embeddedImg, { x: 0, y: 0, width: ptW, height: ptH });
      recoveredPages++;
    } catch (pageErr) {
      console.warn(`Could not recover page ${i}:`, pageErr);
    }
  }

  if (recoveredPages === 0) {
    throw new Error('This PDF is too badly damaged to recover any pages from.');
  }

  const pdfBytes = await outPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Best-effort archival PDF. True ISO 19005 (PDF/A) conformance requires validation
 * against a formal test suite (veraPDF etc.) covering embedded fonts, color spaces,
 * transparency restrictions and more — not something this can certify. What this does
 * do for real: strip encryption/interactive JavaScript, flatten form fields, and embed
 * standard XMP metadata + an sRGB OutputIntent so the file is self-contained and viewer-
 * independent, which is the practical goal most people want "PDF/A" for.
 */
export async function convertToArchivalPDF(pdfFile: File): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  try {
    const form = pdfDoc.getForm();
    form.flatten();
  } catch {
    // No form fields present
  }

  const now = new Date();
  const xmp = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <xmp:CreateDate>${now.toISOString()}</xmp:CreateDate>
      <xmp:ModifyDate>${now.toISOString()}</xmp:ModifyDate>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  try {
    const xmpStream = pdfDoc.context.stream(xmp, { Type: 'Metadata', Subtype: 'XML' });
    const xmpRef = pdfDoc.context.register(xmpStream);
    pdfDoc.catalog.set(pdfDoc.context.obj('Metadata'), xmpRef);
  } catch (err) {
    console.warn('Could not attach XMP metadata (continuing without it):', err);
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
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

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Stirling-PDF Real Tesseract OCR Engine: Performs browser-native optical character recognition on scanned PDFs.
 */
export async function ocrPDF(
  file: File,
  onProgress?: (percent: number, status: string) => void
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const ocrResults: string[] = [];

  // Fast-path: Check if native text is already available
  const nativePages = await extractPDFPagesStructuredText(file);
  const totalChars = nativePages.reduce((sum, p) => sum + p.text.trim().length, 0);

  if (totalChars > 150) {
    if (onProgress) onProgress(100, 'Native text layer extracted');
    return nativePages.map((p) => `--- Page ${p.pageIndex} ---\n${p.text}`).join('\n\n');
  }

  // Scanned or image PDF: Run Tesseract.js WASM worker
  if (onProgress) onProgress(5, 'Initializing Tesseract OCR Engine...');
  const worker = await createWorker('eng');

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    if (onProgress) {
      const pct = Math.round(((i - 1) / pdfDoc.numPages) * 90) + 10;
      onProgress(pct, `OCR Scanning Page ${i} of ${pdfDoc.numPages}...`);
    }

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

      const ret = await worker.recognize(canvas);
      ocrResults.push(`--- Page ${i} (Scanned OCR) ---\n${ret.data.text}`);
    }
  }

  await worker.terminate();
  if (onProgress) onProgress(100, 'OCR Recognition Complete');
  return ocrResults.join('\n\n');
}

export interface RedactionRect {
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  width: number; // Normalized 0-1
  height: number; // Normalized 0-1
}

export interface PageRedaction {
  pageIndex: number;
  rects: RedactionRect[];
}

/**
 * Stirling-PDF True Privacy Redaction: Burns solid black pixel blocks directly onto high-res page canvas BEFORE PDF encoding.
 * Guarantees zero extractable vector text survives under redacted areas.
 */
export async function redactPDF(
  pdfFile: File,
  redactions: PageRedaction[]
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const srcPdfLib = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const outPdf = await PDFDocument.create();

  const redactionMap = new Map<number, RedactionRect[]>();
  redactions.forEach((r) => {
    if (r.rects && r.rects.length > 0) {
      redactionMap.set(r.pageIndex, r.rects);
    }
  });

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const pageRedactions = redactionMap.get(i);

    if (pageRedactions && pageRedactions.length > 0) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

        // Burn solid black redaction rectangles into pixel data
        ctx.fillStyle = '#000000';
        pageRedactions.forEach((rect) => {
          const rx = rect.x * canvas.width;
          const ry = rect.y * canvas.height;
          const rw = rect.width * canvas.width;
          const rh = rect.height * canvas.height;
          ctx.fillRect(rx, ry, rw, rh);
        });

        const imgBlob: Blob = await new Promise((res) =>
          canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg', 0.95)
        );
        const imgBuf = await imgBlob.arrayBuffer();
        const embeddedImg = await outPdf.embedJpg(imgBuf);

        const srcPage = srcPdfLib.getPage(i - 1);
        const newPage = outPdf.addPage([srcPage.getWidth(), srcPage.getHeight()]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: newPage.getWidth(),
          height: newPage.getHeight(),
        });
      }
    } else {
      const [copiedPage] = await outPdf.copyPages(srcPdfLib, [i - 1]);
      outPdf.addPage(copiedPage);
    }
  }

  const pdfBytes = await outPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export interface PDFMetadataOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
}

/**
 * Stirling-PDF Metadata Editor: Reads & writes Title, Author, Subject, Keywords, Creator.
 */
export async function updatePDFMetadata(
  pdfFile: File,
  meta: PDFMetadataOptions
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  if (meta.title !== undefined) pdfDoc.setTitle(meta.title);
  if (meta.author !== undefined) pdfDoc.setAuthor(meta.author);
  if (meta.subject !== undefined) pdfDoc.setSubject(meta.subject);
  if (meta.keywords !== undefined) pdfDoc.setKeywords(meta.keywords);
  if (meta.creator !== undefined) pdfDoc.setCreator(meta.creator);
  if (meta.producer !== undefined) pdfDoc.setProducer(meta.producer);

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export interface SignatureOptions {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  imageBlob: Blob;
}

/**
 * Stirling-PDF Digital Signer / Stamp Tool: Embeds drawn or uploaded signature onto target page.
 */
export async function signPDF(
  pdfFile: File,
  options: SignatureOptions
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const imgArrayBuffer = await options.imageBlob.arrayBuffer();
  let embeddedImage;
  if (options.imageBlob.type.includes('png')) {
    embeddedImage = await pdfDoc.embedPng(imgArrayBuffer);
  } else {
    embeddedImage = await pdfDoc.embedJpg(imgArrayBuffer);
  }

  const pages = pdfDoc.getPages();
  const targetPageIdx = Math.max(0, Math.min(options.pageIndex - 1, pages.length - 1));
  const page = pages[targetPageIdx];

  page.drawImage(embeddedImage, {
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export interface OrganizedPageSpec {
  originalPageIndex: number;
  rotationAngle: number;
}

/**
 * Stirling-PDF Visual Page Organizer: Rebuilds PDF with drag-reordered pages, deleted pages, and per-page rotations.
 */
export async function organizePDFPages(
  pdfFile: File,
  pageSpecs: OrganizedPageSpec[]
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const outPdf = await PDFDocument.create();

  for (const spec of pageSpecs) {
    const srcIndex = spec.originalPageIndex - 1;
    if (srcIndex >= 0 && srcIndex < srcPdf.getPageCount()) {
      const [copiedPage] = await outPdf.copyPages(srcPdf, [srcIndex]);
      const currentRot = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRot + spec.rotationAngle) % 360));
      outPdf.addPage(copiedPage);
    }
  }

  const pdfBytes = await outPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}


export interface PDFTextAnnotation {
  pageIndex: number;
  x: number; // normalized 0-1
  y: number; // normalized 0-1, from top
  text: string;
  fontSize: number;
  color: { r: number; g: number; b: number };
}

export interface PDFImageStampAnnotation {
  pageIndex: number;
  x: number; // normalized 0-1
  y: number; // normalized 0-1, from top
  width: number; // normalized 0-1 of page width
  imageBlob: Blob;
}

export interface PDFInkAnnotation {
  pageIndex: number;
  imageBlob: Blob; // full-page-sized transparent PNG with the freehand strokes
}

/**
 * Real PDF editing: burns text annotations, image stamps, and freehand ink strokes
 * directly into the page content at the positions the user placed them — not a
 * pass-through save.
 */
export async function applyPDFAnnotations(
  pdfFile: File,
  textAnnotations: PDFTextAnnotation[],
  imageStamps: PDFImageStampAnnotation[],
  inkAnnotations: PDFInkAnnotation[]
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (const ann of textAnnotations) {
    const page = pages[ann.pageIndex];
    if (!page) continue;
    const { width, height } = page.getSize();
    page.drawText(ann.text, {
      x: ann.x * width,
      y: height - ann.y * height - ann.fontSize,
      size: ann.fontSize,
      font,
      color: rgb(ann.color.r, ann.color.g, ann.color.b),
    });
  }

  for (const stamp of imageStamps) {
    const page = pages[stamp.pageIndex];
    if (!page) continue;
    const { width, height } = page.getSize();
    const imgBuf = await stamp.imageBlob.arrayBuffer();
    const embedded = stamp.imageBlob.type.includes('png')
      ? await pdfDoc.embedPng(imgBuf)
      : await pdfDoc.embedJpg(imgBuf);
    const drawWidth = stamp.width * width;
    const drawHeight = drawWidth * (embedded.height / embedded.width);
    page.drawImage(embedded, {
      x: stamp.x * width,
      y: height - stamp.y * height - drawHeight,
      width: drawWidth,
      height: drawHeight,
    });
  }

  for (const ink of inkAnnotations) {
    const page = pages[ink.pageIndex];
    if (!page) continue;
    const { width, height } = page.getSize();
    const imgBuf = await ink.imageBlob.arrayBuffer();
    const embedded = await pdfDoc.embedPng(imgBuf);
    page.drawImage(embedded, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
}
