import { ToolType } from '../types';

// Expose only tools that produce the transformation and file type they advertise.
export const PUBLIC_TOOL_TYPES = new Set<ToolType>([
  'compressor', 'converter', 'resizer', 'palette', 'meme',
  'passport-photo-maker', 'add-name-and-dob', 'signature-resizer', 'circle-crop',
  'merge-photo-signature', 'image-watermark', 'image-rotate-flip', 'image-effects',
  'target-kb-compressor', 'pdf-merger', 'pdf-splitter', 'images-to-pdf',
  'zip-archiver', 'zip-extractor', 'audio-tools', 'video-to-gif', 'svg-optimizer',
  'file-encryptor',
]);

export const PUBLIC_PROGRAMMATIC_SLUGS = new Set([
  'heic-to-jpg', 'convert-heic-to-jpg-mac', 'png-to-webp', 'svg-to-png',
  'compress-png-online', 'compress-jpg-online', 'passport-photo-crop-2x2',
  'merge-pdf-offline', 'split-pdf-pages', 'convert-images-to-pdf',
  'extract-video-frames', 'meme-generator-online', 'svg-cleaner-optimizer',
  'create-zip-archive', 'extract-zip-online', 'encrypt-file-password',
]);

export const isPublicTool = (toolType: ToolType): boolean => PUBLIC_TOOL_TYPES.has(toolType);
