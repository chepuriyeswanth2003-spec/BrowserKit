export type ToolType =
  | 'compressor'
  | 'converter'
  | 'resizer'
  | 'palette'
  | 'meme'
  | 'video-trimmer'
  | 'video-to-gif'
  | 'pdf-merger'
  | 'pdf-splitter'
  | 'pdf-compressor'
  | 'pdf-password-remover'
  | 'pdf-protector'
  | 'images-to-pdf'
  | 'pdf-to-jpg'
  | 'pdf-to-word'
  | 'pdf-to-ppt'
  | 'pdf-to-excel'
  | 'word-to-pdf'
  | 'ppt-to-pdf'
  | 'excel-to-pdf'
  | 'html-to-pdf'
  | 'pdf-editor'
  | 'pdf-signer'
  | 'pdf-watermark'
  | 'pdf-rotator'
  | 'pdf-organizer'
  | 'pdf-to-pdfa'
  | 'pdf-repair'
  | 'pdf-page-numbers'
  | 'pdf-ocr'
  | 'pdf-compare'
  | 'pdf-redact'
  | 'pdf-cropper'
  | 'pdf-forms'
  | 'pdf-ai-summarizer'
  | 'pdf-translate'
  | 'pdf-to-markdown'
  | 'zip-archiver'
  | 'zip-extractor'
  | 'zip-password-remover'
  | 'audio-tools'
  | 'svg-optimizer'
  | 'file-encryptor';

export type ActivePage = ToolType | 'home' | 'guides' | 'privacy' | 'terms';

export type ToolCategory = 'image' | 'video' | 'pdf' | 'zip' | 'audio';

export interface ProcessedImage {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  processedSize?: number;
  originalUrl: string;
  processedUrl?: string;
  format: string;
  width: number;
  height: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  error?: string;
  targetFormat?: string;
  quality?: number;
}

export interface PresetSize {
  id: string;
  label: string;
  category: 'social' | 'passport' | 'web' | 'print' | 'custom';
  width: number;
  height: number;
  aspectRatio?: number;
}

export interface ColorSwatch {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
  population: number;
  percentage: number;
  isLight: boolean;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  isUppercase: boolean;
  shadowColor: string;
  shadowBlur: number;
  align: 'left' | 'center' | 'right';
}

export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  defaultTexts: { text: string; x: number; y: number }[];
}

export interface ZipEntryItem {
  id: string;
  name: string;
  size: number;
  isDirectory: boolean;
  fileObject?: File;
  date?: Date;
}

export interface ToolMeta {
  id: ToolType;
  category: ToolCategory;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  badge: string;
  seoKeyword: string;
  metaTitle: string;
  metaDescription: string;
  faqs: { question: string; answer: string }[];
}
