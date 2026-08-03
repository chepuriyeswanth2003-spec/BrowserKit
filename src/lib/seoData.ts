import { ToolMeta, ToolType } from '../types';
import { PROGRAMMATIC_ROUTES } from '../data/toolsData';

export const TOOL_METADATA: Record<ToolType, ToolMeta> = {
  compressor: {
    id: 'compressor',
    category: 'image',
    badge: 'Popular',
    title: 'Free Image Compressor',
    subtitle: 'Reduce image file size by up to 90% without losing visual quality.',
    description: 'Batch compress JPG, PNG, WebP, and GIF images instantly in your browser. Set custom quality or target file size (e.g. under 100 KB). Download individually or as a ZIP archive.',
    iconName: 'Minimize2',
    seoKeyword: 'compress image online free',
    metaTitle: 'Free Image Compressor Online — Batch Compress JPG, PNG, WebP | BrowserKit',
    metaDescription: '100% free client-side image compressor. Reduce file sizes instantly with live before/after diffs, target KB settings, and batch ZIP downloads.',
    faqs: [
      {
        question: 'Are my photos uploaded to a server?',
        answer: 'No. BrowserKit processes all images 100% client-side inside your web browser. Your files never leave your device.',
      },
      {
        question: 'How can I compress an image to a specific KB size?',
        answer: 'Use the "Target File Size" input in our Image Compressor. The algorithm automatically adjusts compression parameters to meet your exact KB goal.',
      },
      {
        question: 'Is there a limit on how many images I can compress?',
        answer: 'There are no usage limits, paywalls, or account registrations required. Compress unlimited images for free.',
      },
    ],
  },
  'bg-remover': {
    id: 'bg-remover',
    category: 'image',
    badge: 'AI Powered',
    title: 'Free AI Background Remover',
    subtitle: 'Remove photo backgrounds automatically in seconds.',
    description: 'Isolate subjects and create transparent PNG photos directly in your browser. Features edge refinement, tolerance tuning, checkered preview, and background color replacement.',
    iconName: 'Scissors',
    seoKeyword: 'remove background from image free',
    metaTitle: 'Free AI Background Remover Online — Transparent PNG Creator | BrowserKit',
    metaDescription: 'Remove image background online for free. Smart edge detection creates clean transparent PNGs entirely in your browser.',
    faqs: [
      {
        question: 'How does client-side background removal work?',
        answer: 'We utilize a fast browser-based segmentation algorithm combining edge detection, color keying, and mask optimization directly in Canvas.',
      },
      {
        question: 'Can I replace the removed background with a solid color?',
        answer: 'Yes! After removing the background, choose a transparent canvas or pick any custom solid color or gradient.',
      },
    ],
  },
  converter: {
    id: 'converter',
    category: 'image',
    badge: 'High Speed',
    title: 'Free Image Format Converter',
    subtitle: 'Convert between JPG, PNG, WebP, GIF, SVG, PDF, and HEIC.',
    description: 'Convert iPhone HEIC photos to JPG, render PDF pages as high-resolution JPG images, rasterize vector SVGs, and transcode WebP/PNG/JPG files in batches.',
    iconName: 'RefreshCw',
    seoKeyword: 'convert image format online free',
    metaTitle: 'Free Image Format Converter — HEIC, JPG, PNG, WebP, PDF, SVG | BrowserKit',
    metaDescription: 'Batch convert image formats online for free. Support for HEIC to JPG, PDF to JPG, SVG to PNG, WebP, GIF and more with zero server uploads.',
    faqs: [
      {
        question: 'Can I convert iPhone HEIC photos to JPG on Windows or Mac?',
        answer: 'Yes! Our built-in client-side HEIC decoder converts Apple .heic photos directly into standard JPGs in your browser.',
      },
      {
        question: 'How do I convert PDF pages into JPG images?',
        answer: 'Simply drop your PDF file into the converter. It renders the pages onto a high-DPI canvas and extracts them as JPG photos.',
      },
    ],
  },
  resizer: {
    id: 'resizer',
    category: 'image',
    badge: 'Presets',
    title: 'Free Image Resizer & Cropper',
    subtitle: 'Resize, crop, scale, and adjust aspect ratios for social media & passport photos.',
    description: 'Resize images by pixel dimensions, percentage scale, or lock aspect ratios. Includes built-in presets for Instagram, YouTube thumbnails, Twitter headers, Passport/Visa photos, and website favicons.',
    iconName: 'Crop',
    seoKeyword: 'resize image online free',
    metaTitle: 'Free Image Resizer & Aspect Ratio Cropper Online | BrowserKit',
    metaDescription: 'Crop and resize images to exact dimensions or social media presets (Instagram, Passport photo, Favicon, YouTube). 100% free and private.',
    faqs: [
      {
        question: 'What image presets are included?',
        answer: 'Presets include Instagram Square, Instagram Story, YouTube Thumbnail, Twitter Header, Passport/Visa 2x2 inch standards, Favicon 32x32, and custom dimensions.',
      },
    ],
  },
  palette: {
    id: 'palette',
    category: 'image',
    badge: 'Design Tool',
    title: 'Color Picker & Favicon Pack Generator',
    subtitle: 'Extract dominant color palettes and generate full website icon packs.',
    description: 'Use the interactive pixel eyedropper to inspect HEX/RGB/HSL/CMYK color values. Extract dominant color swatches using k-means clustering and generate complete Favicon ZIP packs for websites.',
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
  'audio-tools': {
    id: 'audio-tools',
    category: 'audio',
    badge: 'Audio Tool',
    title: 'Audio Extractor & Sound Converter',
    subtitle: 'Extract audio tracks from videos or convert sound files to WAV format.',
    description: 'Extract background music, voice tracks, or sound effects from MP4 videos, or convert audio files into uncompressed WAV files using standard Web Audio APIs.',
    iconName: 'Music',
    seoKeyword: 'extract audio from video online free',
    metaTitle: 'Free Audio Extractor & Video Sound Converter Online | BrowserKit',
    metaDescription: 'Extract MP3/WAV audio tracks from videos online for free. Fast browser-based sound extractor with zero server recording.',
    faqs: [
      {
        question: 'What video formats are supported for audio extraction?',
        answer: 'Supports MP4, WebM, MOV, AVI, and MKV video files supported by your web browser.',
      },
    ],
  },
  'svg-optimizer': {
    id: 'svg-optimizer',
    category: 'image',
    badge: 'Vector',
    title: 'SVG Cleaner & Code Optimizer',
    subtitle: 'Clean up SVG vector code, strip metadata, and convert to PNG.',
    description: 'Paste or upload SVG vector graphics to clean up raw XML, remove comments/metadata, minify markup, adjust dimensions, and render vector art into high-DPI PNG images.',
    iconName: 'Code',
    seoKeyword: 'optimize svg online free',
    metaTitle: 'Free SVG Cleaner, Optimizer & Vector to PNG Converter | BrowserKit',
    metaDescription: 'Clean and optimize SVG code online for free. Minify SVG markup, preview vector art, and convert SVG files into high-resolution PNG images.',
    faqs: [
      {
        question: 'How does SVG code optimization work?',
        answer: 'It strips XML doctypes, comments, editor metadata (Inkscape, Illustrator), removes whitespace, and formats clean markup ready for web code.',
      },
    ],
  },
  'file-encryptor': {
    id: 'file-encryptor',
    category: 'zip',
    badge: 'Security',
    title: 'Password File Encryptor & Vault',
    subtitle: 'Encrypt images, videos, PDFs, and ZIP archives with a master password.',
    description: 'Protect confidential photos, private videos, PDF contracts, and ZIP archives using military-grade 256-bit AES-GCM encryption with PBKDF2 key derivation (100,000 iterations). 100% browser-based with zero server uploads.',
    iconName: 'Lock',
    seoKeyword: 'encrypt image video pdf zip file with password free online',
    metaTitle: 'Free Password Encryptor for Images, Videos, PDFs & ZIP Files | BrowserKit',
    metaDescription: 'Encrypt photos, videos, PDFs, and ZIP files with password protection online for free. Military-grade browser AES-256 vault with zero server uploads.',
    faqs: [
      {
        question: 'Are my encrypted files uploaded to any cloud server?',
        answer: 'No. Encryption and decryption execute 100% locally inside your web browser using WebCrypto subtle crypto APIs. Your files and passwords never leave your device.',
      },
      {
        question: 'What file formats can I encrypt with password?',
        answer: 'You can password-protect any file format including images (JPG, PNG, WebP), videos (MP4, MOV, WebM), PDF documents, ZIP archives, Office documents, and text files.',
      },
      {
        question: 'What encryption algorithm is used?',
        answer: 'BrowserKit Vault uses AES-256-GCM authenticated encryption paired with PBKDF2 key derivation (100,000 SHA-256 hashing rounds) and unique random salts for maximum security.',
      },
    ],
  },
};

export function generateSitemapXML(baseUrl: string): string {
  const date = new Date().toISOString().split('T')[0];
  const pages = [
    '',
    'compressor',
    'bg-remover',
    'converter',
    'resizer',
    'palette',
    'meme',
    'video-trimmer',
    'video-to-gif',
    'pdf-merger',
    'pdf-splitter',
    'images-to-pdf',
    'zip-archiver',
    'zip-extractor',
    'audio-tools',
    'svg-optimizer',
    'file-encryptor',
    ...PROGRAMMATIC_ROUTES.map((p) => p.slug),
    'guides',
    'privacy',
    'terms',
  ];

  const urls = pages
    .map(
      (path) => `  <url>
    <loc>${baseUrl}/${path}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function generateRobotsTxt(baseUrl: string): string {
  return `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`;
}
