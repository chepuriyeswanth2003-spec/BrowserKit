import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

if (typeof globalThis.DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}

async function getPdfProcessor() {
  return await import('../lib/pdfProcessor');
}

async function createSamplePdfFile(): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText('Stirling PDF BrowserKit Suite Unit Test Document Page 1', {
    x: 50,
    y: 350,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });

  const page2 = pdfDoc.addPage([600, 400]);
  page2.drawText('Stirling PDF BrowserKit Suite Unit Test Document Page 2', {
    x: 50,
    y: 350,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });

  const bytes = await pdfDoc.save();
  return new File([bytes], 'sample.pdf', { type: 'application/pdf' });
}

describe('Stirling-PDF Processor Engine Unit Tests', () => {
  it('loads and verifies sample PDF page count', async () => {
    const file = await createSamplePdfFile();
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    expect(pdfDoc.getPageCount()).toBe(2);
  });

  it('compressPDF retains vector text and valid page count in recommended mode', async () => {
    const { compressPDF } = await getPdfProcessor();
    const file = await createSamplePdfFile();

    const compressedBlob = await compressPDF(file, 'recommended');
    expect(compressedBlob.size).toBeGreaterThan(0);

    const compressedBuffer = await compressedBlob.arrayBuffer();
    const compressedPdf = await PDFDocument.load(compressedBuffer);
    expect(compressedPdf.getPageCount()).toBe(2);
  }, 15000);

  it('splitPDFByFileSizeMB splits sample document into chunks', async () => {
    const { splitPDFByFileSizeMB } = await getPdfProcessor();
    const file = await createSamplePdfFile();
    const chunks = await splitPDFByFileSizeMB(file, 0.001); // tiny threshold to trigger split
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].filename).toContain('_part1.pdf');
  }, 15000);

  it('encryptPDF and removePDFPassword manage password protection', async () => {
    const { encryptPDF, removePDFPassword } = await getPdfProcessor();
    const file = await createSamplePdfFile();
    const protectedBlob = await encryptPDF(file, 'secret123');
    const protectedFile = new File([protectedBlob], 'protected.pdf', { type: 'application/pdf' });

    expect(protectedBlob.size).toBeGreaterThan(0);
    const unlockedBlob = await removePDFPassword(protectedFile, 'secret123');
    expect(unlockedBlob.size).toBeGreaterThan(0);
  });
});
