import { ToolType } from '../types';

// Expose only tools that produce the transformation and file type they advertise.
export const PUBLIC_TOOL_TYPES = new Set<ToolType>([
  'compressor', 'converter', 'resizer', 'palette', 'meme',
  'passport-photo-maker', 'add-name-and-dob', 'signature-resizer', 'circle-crop',
  'merge-photo-signature', 'image-watermark', 'image-rotate-flip', 'image-effects',
  'target-kb-compressor',
  
  // PDF Suite Tools
  'pdf-merger', 'pdf-splitter', 'pdf-compressor', 'pdf-password-remover', 'pdf-protector',
  'images-to-pdf', 'pdf-to-jpg', 'pdf-to-word', 'pdf-to-ppt', 'pdf-to-excel',
  'word-to-pdf', 'ppt-to-pdf', 'excel-to-pdf', 'html-to-pdf', 'pdf-editor',
  'pdf-signer', 'pdf-watermark', 'pdf-rotator', 'pdf-organizer', 'pdf-to-pdfa',
  'pdf-repair', 'pdf-page-numbers', 'pdf-ocr', 'pdf-compare', 'pdf-redact',
  'pdf-cropper', 'pdf-forms', 'pdf-to-markdown',

  // Archive & Media Tools
  'zip-archiver', 'zip-extractor', 'zip-password-remover', 'audio-tools',
  'video-to-gif', 'video-trimmer', 'video-to-audio', 'audio-cutter',
  'aspect-ratio-resizer', 'thumbnail-grabber', 'social-video-downloader',
  'video-format-swapper', 'gif-maker', 'svg-optimizer', 'file-encryptor',
]);

export const PUBLIC_PROGRAMMATIC_SLUGS = new Set([
  'heic-to-jpg', 'convert-heic-to-jpg-mac', 'png-to-webp', 'svg-to-png',
  'compress-png-online', 'compress-jpg-online', 'passport-photo-crop-2x2',
  'merge-pdf-offline', 'split-pdf-pages', 'convert-images-to-pdf',
  'compress-pdf-to-200kb', 'remove-pdf-password', 'unlock-pdf-online',
  'unlock-zip-file', 'remove-zip-password', 'trim-video-without-watermark',
  'extract-audio-mp4', 'resize-video-aspect-ratio-9-16', 'convert-video-to-mp3-320kbps',
  'audio-cutter-ringtone-maker', 'passport-size-photo-maker', 'add-name-and-dob-on-photo',
  'resize-signature-300-dpi', 'compress-image-to-20kb', 'merge-photo-and-signature',
  'png-to-ico-favicon', 'extract-video-frames', 'meme-generator-online', 'svg-cleaner-optimizer',
  'create-zip-archive', 'extract-zip-online', 'encrypt-file-password', 'resize-image-social',
]);

export const isPublicTool = (toolType: ToolType): boolean => PUBLIC_TOOL_TYPES.has(toolType);
