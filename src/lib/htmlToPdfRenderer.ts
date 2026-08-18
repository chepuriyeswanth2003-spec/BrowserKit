import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts, RGB } from 'pdf-lib';

/**
 * A small but real HTML -> PDF layout engine used to turn mammoth's DOCX->HTML
 * output (and similar structured HTML) into a properly formatted PDF: real
 * word-wrapping measured against actual font metrics, bold/italic runs, heading
 * sizes, bullet/numbered lists, bordered tables, and embedded images placed in
 * document flow. This replaces naive "dump raw text" exporters.
 */

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
}

interface Token {
  text: string;
  bold: boolean;
  italic: boolean;
}

const PAGE_W = 595.28; // A4 portrait, points
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

export interface RenderContext {
  pdfDoc: PDFDocument;
  page: PDFPage;
  y: number;
  fonts: {
    regular: PDFFont;
    bold: PDFFont;
    italic: PDFFont;
    boldItalic: PDFFont;
  };
  textColor: RGB;
}

async function loadFonts(pdfDoc: PDFDocument) {
  return {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
  };
}

function fontFor(ctx: RenderContext, bold: boolean, italic: boolean): PDFFont {
  if (bold && italic) return ctx.fonts.boldItalic;
  if (bold) return ctx.fonts.bold;
  if (italic) return ctx.fonts.italic;
  return ctx.fonts.regular;
}

function ensureSpace(ctx: RenderContext, neededHeight: number) {
  if (ctx.y - neededHeight < MARGIN) {
    ctx.page = ctx.pdfDoc.addPage([PAGE_W, PAGE_H]);
    ctx.y = PAGE_H - MARGIN;
  }
}

function tokenize(runs: Run[]): Token[] {
  const tokens: Token[] = [];
  runs.forEach((run) => {
    const words = run.text.split(/(\s+)/).filter((w) => w.length > 0);
    words.forEach((w) => tokens.push({ text: w, bold: run.bold, italic: run.italic }));
  });
  return tokens;
}

/** Greedy word-wrap that measures actual glyph widths per run's font/size, not char-count heuristics. */
function wrapTokens(ctx: RenderContext, tokens: Token[], fontSize: number, maxWidth: number): Token[][] {
  const lines: Token[][] = [];
  let current: Token[] = [];
  let currentWidth = 0;

  tokens.forEach((tok) => {
    if (tok.text.trim() === '') {
      // whitespace token: only keep if line non-empty (avoid leading spaces)
      if (current.length > 0) {
        const w = fontFor(ctx, tok.bold, tok.italic).widthOfTextAtSize(tok.text, fontSize);
        current.push(tok);
        currentWidth += w;
      }
      return;
    }
    const w = fontFor(ctx, tok.bold, tok.italic).widthOfTextAtSize(tok.text, fontSize);
    if (currentWidth + w > maxWidth && current.length > 0) {
      // trim trailing whitespace token before pushing
      while (current.length && current[current.length - 1].text.trim() === '') current.pop();
      lines.push(current);
      current = [tok];
      currentWidth = w;
    } else {
      current.push(tok);
      currentWidth += w;
    }
  });
  if (current.length) {
    while (current.length && current[current.length - 1].text.trim() === '') current.pop();
    if (current.length) lines.push(current);
  }
  return lines;
}

function drawWrappedRuns(
  ctx: RenderContext,
  runs: Run[],
  opts: { fontSize: number; x: number; maxWidth: number; lineHeight?: number; color?: RGB }
) {
  const { fontSize, x, maxWidth } = opts;
  const lineHeight = opts.lineHeight || fontSize * 1.35;
  const color = opts.color || ctx.textColor;
  const tokens = tokenize(runs);
  if (tokens.every((t) => t.text.trim() === '')) return 0;

  const lines = wrapTokens(ctx, tokens, fontSize, maxWidth);
  lines.forEach((line) => {
    ensureSpace(ctx, lineHeight);
    let cx = x;
    line.forEach((tok) => {
      const f = fontFor(ctx, tok.bold, tok.italic);
      ctx.page.drawText(tok.text, { x: cx, y: ctx.y - fontSize, size: fontSize, font: f, color });
      cx += f.widthOfTextAtSize(tok.text, fontSize);
    });
    ctx.y -= lineHeight;
  });
  return lines.length * lineHeight;
}

function extractRuns(el: Element): Run[] {
  const runs: Run[] = [];
  const walk = (node: Node, bold: boolean, italic: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').replace(/\s+/g, ' ');
      if (text) runs.push({ text, bold, italic });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = (node as Element).tagName.toLowerCase();
    const nextBold = bold || tag === 'strong' || tag === 'b';
    const nextItalic = italic || tag === 'em' || tag === 'i';
    if (tag === 'br') {
      runs.push({ text: '\n', bold, italic });
      return;
    }
    node.childNodes.forEach((child) => walk(child, nextBold, nextItalic));
  };
  el.childNodes.forEach((child) => walk(child, false, false));
  return runs;
}

async function embedDataUriImage(pdfDoc: PDFDocument, src: string) {
  try {
    const match = /^data:(image\/\w+);base64,(.+)$/.exec(src);
    if (!match) return null;
    const mime = match[1];
    const base64 = match[2];
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (mime.includes('png')) return await pdfDoc.embedPng(bytes);
    if (mime.includes('jpeg') || mime.includes('jpg')) return await pdfDoc.embedJpg(bytes);
    return null; // unsupported embedded format (e.g. gif/svg) — skip rather than crash
  } catch {
    return null;
  }
}

async function renderTable(ctx: RenderContext, table: Element) {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 0) return;

  const rowCells = rows.map((r) => Array.from(r.querySelectorAll('td, th')));
  const colCount = Math.max(...rowCells.map((r) => r.length), 1);
  const colWidth = CONTENT_W / colCount;
  const cellPad = 5;
  const fontSize = 9.5;

  for (let r = 0; r < rowCells.length; r++) {
    const cells = rowCells[r];
    const isHeader = cells.length > 0 && cells[0].tagName.toLowerCase() === 'th';

    // Pre-wrap all cells to find the tallest cell -> row height
    const wrappedPerCell: Token[][][] = [];
    for (let c = 0; c < colCount; c++) {
      const cellEl = cells[c];
      const runs = cellEl ? extractRuns(cellEl) : [{ text: '', bold: false, italic: false }];
      const boldedRuns = isHeader ? runs.map((rn) => ({ ...rn, bold: true })) : runs;
      const tokens = tokenize(boldedRuns);
      const lines = wrapTokens(ctx, tokens, fontSize, colWidth - cellPad * 2);
      wrappedPerCell.push(lines);
    }
    const lineHeight = fontSize * 1.3;
    const rowHeight = Math.max(1, ...wrappedPerCell.map((l) => l.length)) * lineHeight + cellPad * 2;

    ensureSpace(ctx, rowHeight);
    const rowTopY = ctx.y;

    if (isHeader) {
      ctx.page.drawRectangle({
        x: MARGIN,
        y: rowTopY - rowHeight,
        width: CONTENT_W,
        height: rowHeight,
        color: rgb(0.91, 0.94, 0.97),
      });
    }

    for (let c = 0; c < colCount; c++) {
      const cellX = MARGIN + c * colWidth;
      ctx.page.drawRectangle({
        x: cellX,
        y: rowTopY - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderColor: rgb(0.78, 0.82, 0.86),
        borderWidth: 0.75,
      });

      let ty = rowTopY - cellPad;
      wrappedPerCell[c].forEach((line) => {
        let cx = cellX + cellPad;
        line.forEach((tok) => {
          const f = fontFor(ctx, tok.bold, tok.italic);
          ctx.page.drawText(tok.text, { x: cx, y: ty - fontSize, size: fontSize, font: f, color: ctx.textColor });
          cx += f.widthOfTextAtSize(tok.text, fontSize);
        });
        ty -= lineHeight;
      });
    }

    ctx.y = rowTopY - rowHeight;
  }
  ctx.y -= 10;
}

async function renderBlock(ctx: RenderContext, el: Element, listState: { ordered: boolean; index: number }[]) {
  const tag = el.tagName.toLowerCase();

  if (tag === 'table') {
    ensureSpace(ctx, 20);
    await renderTable(ctx, el);
    return;
  }

  if (tag === 'img') {
    const src = el.getAttribute('src') || '';
    const img = await embedDataUriImage(ctx.pdfDoc, src);
    if (img) {
      const scale = Math.min(1, CONTENT_W / img.width);
      const w = img.width * scale;
      const h = img.height * scale;
      ensureSpace(ctx, h + 10);
      ctx.page.drawImage(img, { x: MARGIN, y: ctx.y - h, width: w, height: h });
      ctx.y -= h + 12;
    }
    return;
  }

  if (/^h[1-6]$/.test(tag)) {
    const level = parseInt(tag[1], 10);
    const fontSize = Math.max(13, 22 - (level - 1) * 2.2);
    ensureSpace(ctx, fontSize * 1.6 + 8);
    ctx.y -= 6;
    const runs = extractRuns(el).map((r) => ({ ...r, bold: true }));
    drawWrappedRuns(ctx, runs, { fontSize, x: MARGIN, maxWidth: CONTENT_W });
    ctx.y -= 4;
    return;
  }

  if (tag === 'li') {
    const depth = listState.length;
    const state = listState[listState.length - 1];
    const indent = 16 * Math.max(1, depth);
    let prefix = '\u2022';
    if (state?.ordered) {
      state.index += 1;
      prefix = `${state.index}.`;
    }
    ensureSpace(ctx, 14);
    ctx.page.drawText(prefix, {
      x: MARGIN + indent - 14,
      y: ctx.y - 11,
      size: 11,
      font: ctx.fonts.regular,
      color: ctx.textColor,
    });
    const runs = extractRuns(el);
    drawWrappedRuns(ctx, runs, { fontSize: 11, x: MARGIN + indent, maxWidth: CONTENT_W - indent });
    ctx.y -= 2;
    return;
  }

  if (tag === 'ul' || tag === 'ol') {
    listState.push({ ordered: tag === 'ol', index: 0 });
    for (const child of Array.from(el.children)) {
      await renderBlock(ctx, child, listState);
    }
    listState.pop();
    ctx.y -= 4;
    return;
  }

  if (tag === 'blockquote') {
    ensureSpace(ctx, 14);
    const runs = extractRuns(el).map((r) => ({ ...r, italic: true }));
    drawWrappedRuns(ctx, runs, { fontSize: 11, x: MARGIN + 14, maxWidth: CONTENT_W - 14, color: rgb(0.35, 0.4, 0.46) });
    ctx.y -= 6;
    return;
  }

  if (tag === 'p' || tag === 'div') {
    const hasImg = el.querySelector('img');
    if (hasImg && el.children.length === 1) {
      await renderBlock(ctx, el.children[0], listState);
      return;
    }
    const runs = extractRuns(el);
    if (runs.some((r) => r.text.trim())) {
      drawWrappedRuns(ctx, runs, { fontSize: 11, x: MARGIN, maxWidth: CONTENT_W });
      ctx.y -= 8;
    } else {
      ctx.y -= 6;
    }
    return;
  }

  // Unknown/inline-only wrapper: recurse into children as blocks, or render as paragraph
  if (el.children.length > 0) {
    for (const child of Array.from(el.children)) {
      await renderBlock(ctx, child, listState);
    }
  } else {
    const runs = extractRuns(el);
    if (runs.some((r) => r.text.trim())) {
      drawWrappedRuns(ctx, runs, { fontSize: 11, x: MARGIN, maxWidth: CONTENT_W });
      ctx.y -= 8;
    }
  }
}

/**
 * Renders a fragment of HTML (block-level elements: p/h1-6/ul/ol/table/img/blockquote)
 * into a fresh multi-page PDF, with real text wrapping, styling, tables and images.
 */
export async function renderHtmlToPdf(html: string): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const fonts = await loadFonts(pdfDoc);

  const ctx: RenderContext = {
    pdfDoc,
    page,
    y: PAGE_H - MARGIN,
    fonts,
    textColor: rgb(0.09, 0.11, 0.15),
  };

  const doc = new DOMParser().parseFromString(html || '<p></p>', 'text/html');
  const body = doc.body;

  if (!body || body.children.length === 0) {
    drawWrappedRuns(ctx, [{ text: body?.textContent || '', bold: false, italic: false }], {
      fontSize: 11,
      x: MARGIN,
      maxWidth: CONTENT_W,
    });
  } else {
    for (const child of Array.from(body.children)) {
      await renderBlock(ctx, child, []);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
}
