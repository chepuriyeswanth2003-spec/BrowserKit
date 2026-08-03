import { PDFDocument } from 'pdf-lib';

export async function mergePDFs(pdfFiles: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
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
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  // pageNumbers are 1-based
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
      // JPEG / WebP / standard image fallback via canvas JPEG conversion
      try {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      } catch {
        // Fallback: draw image to canvas then embed as PNG
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
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        const pngDataUrl = canvas.toDataURL('image/png');
        const pngArrayBuffer = await fetch(pngDataUrl).then((res) => res.arrayBuffer());
        embeddedImage = await pdfDoc.embedPng(pngArrayBuffer);
      }
    }

    const { width: imgWidth, height: imgHeight } = embeddedImage;

    let pageWidth = 595.28; // A4 portrait width in points
    let pageHeight = 841.89; // A4 portrait height in points

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

    // Calculate scaled dimensions to fit within margins
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
