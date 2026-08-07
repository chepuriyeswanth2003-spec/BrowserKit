import { ToolMeta, ToolType } from '../types';

export const TOOL_METADATA: Record<ToolType, ToolMeta> = {
  compressor: {
    id: 'compressor',
    category: 'image',
    badge: 'Most Popular',
    title: 'Client-Side Image Compressor',
    subtitle: 'Shrink PNG, JPG, and WebP images by up to 90% without quality loss.',
    description: 'Compress single or batch images locally in your browser. Set target file size caps (under 50KB, 100KB, 200KB), fine-tune compression quality, compare side-by-side previews, and download instantly with zero server uploads.',
    iconName: 'Minimize2',
    seoKeyword: 'compress image online free',
    metaTitle: 'Free Image Compressor Online — Compress PNG & JPG Under 100KB | BrowserKit',
    metaDescription: 'Compress images online for free. Reduce PNG, JPG, WebP file sizes by up to 90% in your browser. Target exact KB sizes with zero server uploads.',
    faqs: [
      {
        question: 'Is my data private when compressing images?',
        answer: 'Yes, 100%. Processing runs entirely inside your browser memory using HTML5 Canvas APIs. Your images are never uploaded to any remote server.',
      },
      {
        question: 'Can I compress images under a specific file size like 100 KB?',
        answer: 'Yes! Select one of our target size presets (50 KB, 100 KB, 200 KB) or use the target KB input to compress your image to exact size requirements.',
      },
      {
        question: 'Which image formats are supported?',
        answer: 'We support PNG, JPG, JPEG, WebP, GIF, BMP, and SVG files.',
      },
    ],
  },
  'bg-remover': {
    id: 'bg-remover',
    category: 'image',
    badge: 'AI Powered',
    title: 'Instant Background Remover & Transparent PNG Creator',
    subtitle: 'Isolate subjects and erase backgrounds automatically with client-side AI segmentation.',
    description: 'Remove background pixels from portraits, product photos, e-commerce shots, and logos. Edge-detection AI identifies key subjects and outputs transparent PNG images in real-time.',
    iconName: 'Scissors',
    seoKeyword: 'remove background from image free',
    metaTitle: 'Free AI Background Remover Online — Make Transparent PNGs | BrowserKit',
    metaDescription: 'Remove image backgrounds automatically in seconds. Local browser AI segmentation creates high-res transparent PNGs with zero cloud uploads.',
    faqs: [
      {
        question: 'Does background removal work on complex edges like hair?',
        answer: 'Yes! Our intelligent edge-segmentation engine smoothly isolates fine details like hair strands and object boundaries.',
      },
      {
        question: 'Can I replace the background with a solid color?',
        answer: 'Yes. You can export a transparent PNG or choose white, black, or custom solid color backgrounds.',
      },
    ],
  },
  converter: {
    id: 'converter',
    category: 'image',
    badge: 'High Speed',
    title: 'Universal Image Format Converter',
    subtitle: 'Convert between HEIC, PNG, JPG, WebP, GIF, BMP, and SVG formats.',
    description: 'Batch convert iPhone HEIC photos, modern WebP graphics, vector SVGs, and PNG/JPG photos. Preserves EXIF metadata, original dimensions, and transparency channels.',
    iconName: 'RefreshCw',
    seoKeyword: 'heic to jpg converter online',
    metaTitle: 'Free Image Format Converter — HEIC to JPG, PNG to WebP | BrowserKit',
    metaDescription: 'Convert HEIC to JPG, PNG to WebP, SVG to PNG, and more for free. Instant batch browser conversion with zero server uploads.',
    faqs: [
      {
        question: 'Can I convert iPhone HEIC photos to JPG?',
        answer: 'Yes! Drop your HEIC files into the converter and they will instantly convert into standard high-resolution JPG images compatible with any software.',
      },
      {
        question: 'Is transparent PNG to WebP conversion supported?',
        answer: 'Yes, full alpha-channel transparency is preserved when converting between PNG, WebP, and SVG formats.',
      },
    ],
  },
  resizer: {
    id: 'resizer',
    category: 'image',
    badge: 'Precision',
    title: 'Image Resizer, Cropper & Aspect Ratio Tool',
    subtitle: 'Resize pixel dimensions or crop images for social media, passports, and web assets.',
    description: 'Crop and resize images to exact pixel widths/heights or select aspect ratio presets for Instagram posts, YouTube thumbnails, Passport 2x2 photos, Twitter banners, and web Favicons.',
    iconName: 'Crop',
    seoKeyword: 'resize image online free',
    metaTitle: 'Free Image Resizer & Cropper — Passport & Social Media Presets | BrowserKit',
    metaDescription: 'Resize image dimensions in pixels, percentage, or centimeters. Crop photos for Instagram, Passport 2x2, YouTube thumbnails, and Favicons free.',
    faqs: [
      {
        question: 'Can I resize images for US Passport or VISA applications?',
        answer: 'Yes! Select the 2x2 inch (51x51 mm / 600x600 px) Passport photo preset to crop headshots to official requirements.',
      },
    ],
  },
  palette: {
    id: 'palette',
    category: 'image',
    badge: 'Design',
    title: 'Color Palette Extractor & Precision Eyedropper',
    subtitle: 'Extract dominant color palettes and sample exact HEX/RGB/CMYK pixel colors.',
    description: 'Upload any graphic or photograph to automatically generate a harmonized 6-color palette. Use the interactive pixel magnifying eyedropper to copy exact HEX, RGB, HSL, and CMYK color codes.',
    iconName: 'Palette',
    seoKeyword: 'color picker and palette extractor free',
    metaTitle: 'Color Picker, Palette Extractor & Favicon Generator | BrowserKit',
    metaDescription: 'Extract dominant colors from any photo, copy HEX/RGB/CMYK codes with 1 click, and build downloadable website Favicon icon packs.',
    faqs: [
      {
        question: 'How does the Color Eyedropper work?',
        answer: 'Hover over any uploaded image to see a magnified view of individual pixels. Click anywhere to select and copy exact HEX, RGB, HSL, or CMYK codes.',
      },
    ],
  },
  meme: {
    id: 'meme',
    category: 'image',
    badge: 'Fun',
    title: 'Free Meme Generator & Text Overlay',
    subtitle: 'Create funny memes and custom text overlays in seconds.',
    description: 'Choose from classic popular meme templates or upload your own image. Add draggable, resizable text layers with impact fonts, outlines, shadows, watermarks, and custom colors.',
    iconName: 'Smile',
    seoKeyword: 'free meme generator online',
    metaTitle: 'Free Meme Generator Online — Classic Templates & Custom Text | BrowserKit',
    metaDescription: 'Create custom memes with draggable text boxes, classic fonts, stroke outlines, and built-in templates. Export high-res PNG memes for free.',
    faqs: [
      {
        question: 'Are memes watermarked?',
        answer: 'No! We never force watermarks on your creations. All meme exports are 100% clean and free.',
      },
    ],
  },
  'video-trimmer': {
    id: 'video-trimmer',
    category: 'video',
    badge: 'New',
    title: 'Video Trimmer, Cutter & Audio Muter',
    subtitle: 'Trim video length, set custom start/end points, or mute audio.',
    description: 'Trim MP4, WebM, MOV, and AVI videos directly in your browser. Set exact start and end seconds, mute original audio background tracks, and export trimmed video clips in high quality.',
    iconName: 'Video',
    seoKeyword: 'trim video online free no watermark',
    metaTitle: 'Free Video Trimmer & Audio Muter Online — Cut Video Clips | BrowserKit',
    metaDescription: 'Trim and cut video clips online without watermark. Set start/end timestamps, mute audio tracks, and process MP4/WebM videos 100% locally.',
    faqs: [
      {
        question: 'Are video files uploaded to a cloud server?',
        answer: 'No. Video processing runs completely client-side in your browser using HTML5 Video APIs. Large video files stay strictly on your local computer.',
      },
      {
        question: 'Can I remove audio or background noise from my video?',
        answer: 'Yes! Toggle the "Mute Audio" switch to instantly export a silent video clip.',
      },
    ],
  },
  'video-to-gif': {
    id: 'video-to-gif',
    category: 'video',
    badge: 'Utility',
    title: 'Video Frame Extractor & Snapshot Tool',
    subtitle: 'Extract high-resolution image frames and snapshots from any video file.',
    description: 'Capture individual photo frames or continuous image sequences from MP4, WebM, or MOV videos. Adjust sampling FPS, preview snapshots, and download full-res PNG image frames.',
    iconName: 'Film',
    seoKeyword: 'extract frames from video online free',
    metaTitle: 'Free Video Frame Extractor & Snapshot Generator | BrowserKit',
    metaDescription: 'Extract high quality PNG/JPG image frames from videos online for free. Capture precise video snapshots at custom frame rates directly in your browser.',
    faqs: [
      {
        question: 'How many frames can I extract from a video?',
        answer: 'You can extract up to 50 frame snapshots per video or sample at 1-10 FPS intervals, downloaded as a clean ZIP package or individual PNGs.',
      },
    ],
  },
  'pdf-merger': {
    id: 'pdf-merger',
    category: 'pdf',
    badge: 'PDF Suite',
    title: 'PDF Merger & Document Combiner',
    subtitle: 'Combine multiple PDF files into one clean document.',
    description: 'Merge separate PDF documents into a single organized PDF file. Drag and drop to reorder files or individual pages, preview document layouts, and download instant merged PDFs.',
    iconName: 'FileText',
    seoKeyword: 'merge pdf files online free',
    metaTitle: 'Free PDF Merger Online — Combine Multiple PDFs Easily | BrowserKit',
    metaDescription: '100% free PDF merger tool. Drag and drop multiple PDF files, arrange page sequence, and combine into a single PDF document with zero file limits.',
    faqs: [
      {
        question: 'Is my confidential PDF document secure?',
        answer: 'Yes! All PDF processing is performed locally inside your browser using pdf-lib WebAssembly technology. Your files are never uploaded anywhere.',
      },
      {
        question: 'Can I reorder PDF files before merging?',
        answer: 'Yes. Simply use the Up/Down controls or drag files into your desired page order before generating the merged file.',
      },
    ],
  },
  'pdf-splitter': {
    id: 'pdf-splitter',
    category: 'pdf',
    badge: 'PDF Suite',
    title: 'PDF Page Extractor & Splitter',
    subtitle: 'Extract selected pages or split large PDF files into smaller documents.',
    description: 'Extract specific pages (e.g. pages 1, 3, 5-8) or split multi-page PDF documents into custom standalone PDF files with a single click.',
    iconName: 'Scissors',
    seoKeyword: 'split pdf pages free online',
    metaTitle: 'Free PDF Splitter & Page Extractor Online | BrowserKit',
    metaDescription: 'Split PDF files and extract specific page ranges online for free. Fast, private client-side PDF document page extraction.',
    faqs: [
      {
        question: 'How do I specify which pages to extract?',
        answer: 'Enter individual page numbers separated by commas (e.g., 1, 4, 7) or page ranges (e.g., 2-5). Our tool extracts only those pages into a new PDF.',
      },
    ],
  },
  'pdf-password-remover': {
    id: 'pdf-password-remover',
    category: 'pdf',
    badge: 'Security',
    title: 'PDF Password Remover & PDF Unlocker',
    subtitle: 'Remove passwords and owner restrictions from PDF documents.',
    description: 'Unlock password-protected PDFs and strip printing, editing, and copying restrictions 100% locally in your browser. Fast, free, and completely secure.',
    iconName: 'Unlock',
    seoKeyword: 'remove pdf password online free',
    metaTitle: 'Free PDF Password Remover & Unlocker Online | BrowserKit',
    metaDescription: 'Remove passwords and owner restrictions from PDF files online for free. Unlock password-protected PDFs 100% on-device with zero server uploads.',
    faqs: [
      {
        question: 'Is my password-protected PDF file uploaded anywhere?',
        answer: 'No. All PDF unlocking and decryption happens locally inside your browser RAM using WebAssembly. Your files are never sent to external servers.',
      },
      {
        question: 'Can I remove printing or copying restrictions?',
        answer: 'Yes! Our tool removes owner restriction flags so you can print, copy, or edit your document freely.',
      },
    ],
  },
  'images-to-pdf': {
    id: 'images-to-pdf',
    category: 'pdf',
    badge: 'Popular',
    title: 'Images to PDF Converter',
    subtitle: 'Convert JPG, PNG, and WebP images into a single PDF document.',
    description: 'Transform multiple photos or scanned documents into a professionally formatted PDF. Customize page sizes (A4, Letter, Auto-Fit), page margins, and orientation.',
    iconName: 'FilePlus',
    seoKeyword: 'convert jpg to pdf online free',
    metaTitle: 'Free Images to PDF Converter — Convert JPG & PNG to PDF | BrowserKit',
    metaDescription: 'Convert images (JPG, PNG, WebP) into PDF documents online for free. Custom page layouts, A4/Letter size options, and portrait/landscape orientation.',
    faqs: [
      {
        question: 'Can I convert multiple images into one single PDF?',
        answer: 'Yes! Select multiple photos, arrange their order, and export them together as a multi-page PDF file.',
      },
    ],
  },
  'zip-archiver': {
    id: 'zip-archiver',
    category: 'zip',
    badge: 'ZIP Suite',
    title: 'ZIP Creator & File Archiver',
    subtitle: 'Compress images, documents, and videos into a downloadable .zip package.',
    description: 'Combine files into a compressed .zip archive directly in your browser. Speed up file sharing and email attachments with fast client-side DEFLATE compression.',
    iconName: 'Archive',
    seoKeyword: 'create zip file online free',
    metaTitle: 'Free ZIP Creator Online — Compress Files into ZIP Archive | BrowserKit',
    metaDescription: 'Create .zip compressed archives online for free. Pack photos, documents, and files into a single zip file with zero server uploads.',
    faqs: [
      {
        question: 'Is there a limit on ZIP file sizes?',
        answer: 'Because compression happens inside your browser RAM, you can create ZIP archives up to hundreds of megabytes depending on your system memory.',
      },
    ],
  },
  'zip-extractor': {
    id: 'zip-extractor',
    category: 'zip',
    badge: 'ZIP Suite',
    title: 'ZIP Extractor & Archive Viewer',
    subtitle: 'Inspect and extract files from .zip archives without uploading.',
    description: 'Drop any .zip archive to view its contents, file sizes, and folder structure. Extract individual files or download all unzipped files with full privacy.',
    iconName: 'FolderArchive',
    seoKeyword: 'extract zip file online free',
    metaTitle: 'Free ZIP Extractor Online — Open & Unzip Files in Browser | BrowserKit',
    metaDescription: 'Unzip and extract files from .zip archives online for free. Inspect zip contents and download files individually or all at once.',
    faqs: [
      {
        question: 'Can I inspect zip file contents before extracting?',
        answer: 'Yes! Upload any .zip file to instantly preview all contained filenames, file sizes, and creation dates.',
      },
    ],
  },
  'zip-password-remover': {
    id: 'zip-password-remover',
    category: 'zip',
    badge: 'Security',
    title: 'ZIP Password Remover & Archive Extractor',
    subtitle: 'Unlock password-protected ZIP archives and extract all contents.',
    description: 'Unlock encrypted ZIP archives and extract all contained files to clean, unencrypted downloads directly inside your browser.',
    iconName: 'Unlock',
    seoKeyword: 'unlock password protected zip file online',
    metaTitle: 'Free ZIP Password Remover & Unlocker Online | BrowserKit',
    metaDescription: 'Unlock password-protected ZIP archives online for free. Extract encrypted zip files and save clean unencrypted downloads 100% locally.',
    faqs: [
      {
        question: 'How does client-side ZIP unlocking work?',
        answer: 'Enter the zip decryption password and JSZip decrypts all archive entries directly inside your browser memory, outputting clean unlocked files.',
      },
    ],
  },
  'audio-tools': {
    id: 'audio-tools',
    category: 'audio',
    badge: 'Audio',
    title: 'Audio Converter & Sound Extractor',
    subtitle: 'Convert audio formats or extract high quality audio tracks from video files.',
    description: 'Convert audio recordings between MP3, WAV, WebM, OGG, and AAC. Extract background music or voice tracks from video files (MP4, MOV, WebM) with zero quality loss.',
    iconName: 'Music',
    seoKeyword: 'extract audio from mp4 free',
    metaTitle: 'Free Audio Converter & Video Audio Extractor | BrowserKit',
    metaDescription: 'Extract audio from video (MP4 to WAV/MP3) and convert audio formats online for free. 100% browser execution with zero server uploads.',
    faqs: [
      {
        question: 'Which audio formats can I extract or convert?',
        answer: 'You can extract or convert MP3, WAV, OGG, WebM, AAC, and M4A audio files.',
      },
    ],
  },
  'svg-optimizer': {
    id: 'svg-optimizer',
    category: 'image',
    badge: 'Developer',
    title: 'SVG Cleaner, Minifier & Converter',
    subtitle: 'Minify raw SVG markup, strip unnecessary metadata, or convert SVG to PNG.',
    description: 'Clean up vector graphics created in Figma, Illustrator, or Inkscape. Remove unused XML tags, editor metadata, and inline styles to reduce SVG payload sizes for web development.',
    iconName: 'Code',
    seoKeyword: 'svg optimizer minifier online',
    metaTitle: 'Free SVG Cleaner, Minifier & PNG Rasterizer | BrowserKit',
    metaDescription: 'Optimize and minify SVG markup online for free. Strip editor metadata, clean up vector XML tags, and render crisp SVG to PNG icons.',
    faqs: [
      {
        question: 'Does SVG minification break vector styling?',
        answer: 'No. Our cleaner strips only redundant comments, editor metadata, and unused group tags while keeping vector paths perfectly intact.',
      },
    ],
  },
  'file-encryptor': {
    id: 'file-encryptor',
    category: 'zip',
    badge: 'Security',
    title: 'Client-Side File Encryptor (AES-256 Vault)',
    subtitle: 'Encrypt photos, videos, PDFs, and documents with military-grade password vaulting.',
    description: 'Protect sensitive files before sending over email or cloud storage. Encrypt files using AES-256-GCM encryption with PBKDF2 password derivation. Decrypt encrypted vault files anytime using your master password.',
    iconName: 'Lock',
    seoKeyword: 'password encrypt file online free',
    metaTitle: 'Free File Encryptor — Password Protect Files with AES-256 | BrowserKit',
    metaDescription: 'Encrypt photos, PDFs, documents, and ZIP files with password protection online for free. AES-256-GCM browser encryption with zero server uploads.',
    faqs: [
      {
        question: 'Can someone decrypt my file if they forget the password?',
        answer: 'No. AES-256 encryption is mathematically unbreakable without the correct master password. Keep your password safe!',
      },
    ],
  },
};

export function generateSitemapXML(routes?: any): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://browserkit.onrender.com/</loc></url>
</urlset>`;
}

export function generateRobotsTxt(domain?: any): string {
  return `User-agent: *\nAllow: /\n\nSitemap: https://browserkit.onrender.com/sitemap.xml`;
}
