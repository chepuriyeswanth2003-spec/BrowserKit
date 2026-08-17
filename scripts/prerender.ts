import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('[Prerender] Error: dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

interface RouteMetadata {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  h1: string;
  subtitle?: string;
  benefits?: string[];
  steps?: string[];
  category?: string;
}

const CATEGORY_ROUTES: RouteMetadata[] = [
  {
    slug: 'pdf-tools',
    metaTitle: 'Free Client-Side PDF Tools Suite — Merge, Split, Compress & Unlock PDFs | BrowserKit Studio',
    metaDescription: '100% private client-side PDF utility suite. Merge PDF files, split page ranges, compress PDFs under 200KB, remove passwords, sign documents, and redact text on-device.',
    metaKeywords: 'pdf tools, merge pdf offline, split pdf pages, compress pdf under 200kb, remove pdf password, unlock pdf online free, sign pdf online, redact pdf',
    h1: 'Free Client-Side PDF Tools & Utility Suite',
    subtitle: 'Merge, split, compress, unlock, redact, sign, and edit PDF documents 100% locally with zero server uploads.',
    category: 'PDF Suite',
    benefits: [
      '100% Local In-Browser Processing: Your PDF files never leave your device memory.',
      'Comprehensive Toolset: Merge, split, compress, unlock, redact, sign, convert, and organize PDFs.',
      'High Speed & Unlimited Usage: Zero file size caps, queue delays, or watermarks.',
    ],
    steps: [
      'Select a PDF utility tool from the suite.',
      'Drag and drop your PDF documents.',
      'Adjust tool parameters and download your processed PDF file instantly.',
    ],
  },
  {
    slug: 'image-tools',
    metaTitle: 'Free Client-Side Image Tools Suite — Compress, Convert, Resize & Passport Photos | BrowserKit Studio',
    metaDescription: 'Complete client-side image editor and converter suite. Compress PNG/JPG under 100KB, convert HEIC to JPG, crop 2x2 passport photos, and add candidate name/DOB on photos.',
    metaKeywords: 'image tools, compress image under 100kb, convert heic to jpg, passport photo maker, add name and dob on photo, resize signature 300 dpi, png to webp',
    h1: 'Free Client-Side Image & Photo Tools Suite',
    subtitle: 'Compress, convert, resize, crop, and format image assets 100% locally in your browser.',
    category: 'Image Suite',
    benefits: [
      'Private Local Processing: Instant HTML5 Canvas rendering with zero server uploads.',
      'Official Exam Framing: Preset dimensions for SSC, UPSC, PAN Card, and US Visa photos.',
      'Universal Format Support: Works with HEIC, PNG, JPG, WebP, SVG, and GIF files.',
    ],
    steps: [
      'Choose an image tool from the suite.',
      'Upload single or batch photographs.',
      'Apply compression or resize options and download your optimized image.',
    ],
  },
  {
    slug: 'video-tools',
    metaTitle: 'Free Client-Side Video & Audio Tools Suite — Trim, Extract Audio & Convert | BrowserKit Studio',
    metaDescription: 'Browser-native video and audio editor suite. Trim MP4 clips without watermarks, extract 320kbps MP3 audio, resize video aspect ratios to 9:16 vertical, and grab video frames.',
    metaKeywords: 'video tools, trim video without watermark, extract audio mp4, convert video to mp3 320kbps, audio cutter ringtone maker, resize video 9 16, thumbnail grabber',
    h1: 'Free Client-Side Video & Audio Utilities Suite',
    subtitle: 'Trim video clips, extract audio, convert formats, and grab video frame snapshots on-device.',
    category: 'Video & Audio Suite',
    benefits: [
      'Watermark-Free Exports: Export clean videos without branding overlays.',
      'Zero Cloud Uploads: Fast WebAssembly and HTML5 Media API processing.',
      'TikTok & Reels Presets: Convert landscape 16:9 videos into 9:16 vertical shorts.',
    ],
    steps: [
      'Select a video or audio tool.',
      'Upload your video clip or sound file.',
      'Process timestamps or aspect ratio and export your media asset.',
    ],
  },
  {
    slug: 'zip-tools',
    metaTitle: 'Free Archive & Security Vault — Zip Compressor, Extractor & File Encryptor | BrowserKit Studio',
    metaDescription: '100% private client-side archive utility suite. Create ZIP archives, extract .zip files, remove ZIP passwords, and encrypt files with AES-256 password protection locally.',
    metaKeywords: 'zip tools, create zip archive, extract zip online, remove zip password, unlock zip file, encrypt file password, aes 256 file encryptor',
    h1: 'Free Archive & File Encryption Security Vault',
    subtitle: 'Compress ZIP archives, extract files, remove passwords, and encrypt documents with AES-256 locally.',
    category: 'Archive & Vault',
    benefits: [
      'AES-256 Password Encryption: Military-grade file protection rendered entirely in your browser.',
      'Instant Archive Unzipping: Extract multi-file ZIP archives without installing desktop software.',
      '100% Privacy Guarantee: Zero data transmitted across network connections.',
    ],
    steps: [
      'Select a ZIP archive or encryption tool.',
      'Drop your files or password-protected archives.',
      'Export compressed archives or decrypted files instantly.',
    ],
  },
  {
    slug: 'guides',
    metaTitle: 'BrowserKit Studio User Guides & How-To Tutorials | Official Guides',
    metaDescription: 'Comprehensive step-by-step guides for BrowserKit Studio tools. Learn how to compress images under 100KB, remove PDF passwords, convert HEIC to JPG on Mac, and format passport photos.',
    metaKeywords: 'browserkit guides, how to compress image under 100kb, how to remove pdf password, convert heic to jpg mac guide',
    h1: 'BrowserKit Studio User Guides & Tutorials',
    subtitle: 'Step-by-step instructions and technical documentation for client-side web utility tools.',
    category: 'Guides',
  },
  {
    slug: 'privacy',
    metaTitle: 'Privacy Policy | BrowserKit Studio Official Site',
    metaDescription: 'Read the official BrowserKit Studio privacy policy (browserkit.co.in). 100% client-side local browser processing guarantee — zero file uploads, zero server tracking.',
    h1: 'BrowserKit Studio Privacy Policy',
    subtitle: '100% Local In-Browser Processing Promise & Zero File Upload Guarantee',
    category: 'Legal',
  },
  {
    slug: 'terms',
    metaTitle: 'Terms of Service | BrowserKit Studio Official Site',
    metaDescription: 'Read the official Terms of Service for BrowserKit Studio (browserkit.co.in). Free client-side web utility tools for personal and commercial usage.',
    h1: 'BrowserKit Studio Terms of Service',
    subtitle: 'Terms and conditions for utilizing BrowserKit Studio web utility tools.',
    category: 'Legal',
  },
];

const PROGRAMMATIC_ROUTES: RouteMetadata[] = [
  {
    slug: 'resize-video-aspect-ratio-9-16',
    metaTitle: 'Free Video Aspect Ratio Resizer — Convert to 9:16 TikTok & Reels | BrowserKit Studio',
    metaDescription: 'Convert landscape 16:9 videos into 9:16 vertical shorts for TikTok & Instagram Reels free online.',
    metaKeywords: 'resize video aspect ratio 9 16, convert 16 9 to 9 16 video, vertical video converter online free',
    h1: 'Resize Video Aspect Ratio to 9:16 TikTok & Reels',
    subtitle: 'Convert 16:9 landscape videos into 9:16 vertical format with blurred background padding or center crop.',
    category: 'Video Editing',
    benefits: [
      'Convert 16:9 landscape videos into 9:16 vertical format for TikTok, Reels, and Shorts.',
      'Auto-fill side bars with blurred video padding or crop center frame.',
      '100% private in-browser canvas rendering.',
    ],
    steps: [
      'Upload your video clip.',
      'Select 9:16 TikTok or 1:1 Instagram preset.',
      'Export and download your vertical video asset.',
    ],
  },
  {
    slug: 'convert-video-to-mp3-320kbps',
    metaTitle: 'Free Video to MP3 Converter — 320kbps Audio Extractor | BrowserKit Studio',
    metaDescription: 'Extract 320kbps MP3 audio tracks from MP4, WebM, and MOV video files free online.',
    metaKeywords: 'convert video to mp3 320kbps, extract audio mp4 320kbps, video to audio converter online free',
    h1: 'Convert Video to 320kbps MP3 Audio Free',
    subtitle: 'Extract pristine 320kbps MP3 audio tracks from any MP4, WebM, or MOV video file.',
    category: 'Audio Conversion',
    benefits: [
      'Extract pristine 320kbps MP3 audio from any MP4, WebM, or MOV video.',
      'Fast browser-native Web Audio API encoding with zero server uploads.',
      '100% free with no file size limits.',
    ],
    steps: [
      'Upload your video file.',
      'Choose 320kbps MP3 or lossless WAV format.',
      'Download your extracted audio track.',
    ],
  },
  {
    slug: 'audio-cutter-ringtone-maker',
    metaTitle: 'Free Audio Cutter & Ringtone Maker — Trim MP3 Online | BrowserKit Studio',
    metaDescription: 'Trim audio clips and make custom MP3 ringtones online for free with visual waveform controls.',
    metaKeywords: 'audio cutter ringtone maker, trim mp3 online free, custom ringtone maker iphone android',
    h1: 'Free Audio Cutter & Custom Ringtone Maker',
    subtitle: 'Trim MP3 and WAV audio files with visual waveform scrubber controls.',
    category: 'Audio Utilities',
    benefits: [
      'Trim MP3 and WAV audio files to custom start/end timestamps.',
      'Make custom ringtones for iPhone (M4R) and Android (MP3).',
      'Visual waveform scrubber with zero server uploads.',
    ],
    steps: [
      'Upload your audio file or song.',
      'Adjust start and end sliders to choose your trim section.',
      'Export and download your custom ringtone.',
    ],
  },
  {
    slug: 'passport-size-photo-maker',
    metaTitle: 'Free Passport Size Photo Maker — Official Size & Color Framing | BrowserKit Studio',
    metaDescription: 'Create official 3.5cm x 4.5cm, 2x2 inch passport photos with white, blue, or red canvas free online.',
    metaKeywords: 'passport size photo maker online free, official passport photo maker 3.5x4.5cm, 2x2 inch passport crop',
    h1: 'Free Passport Size Photo Maker',
    subtitle: 'Create official 3.5x4.5cm, 2x2 inch, or 35x45mm passport photos with white, blue, or red backgrounds.',
    category: 'Passport Tools',
    benefits: [
      'Create official 3.5x4.5cm, 2x2 inch, or 35x45mm passport photos.',
      'Format canvas border color to white, blue, or red for SSC, UPSC, US Visa.',
      '100% private in-browser rendering with zero cloud uploads.',
    ],
    steps: [
      'Upload your headshot or photo.',
      'Select desired canvas color (white, blue, or red) and passport dimensions.',
      'Click Apply & Render Photo to download instant passport photos.',
    ],
  },
  {
    slug: 'add-name-and-dob-on-photo',
    metaTitle: 'Add Name & Date on Photo for SSC & UPSC Online | BrowserKit Studio',
    metaDescription: 'Add candidate name and date of photo / DOB on photos for SSC, UPSC, and govt exam forms free.',
    metaKeywords: 'add name and dob on photo, add name and date of photo online free, ssc upsc photo name date generator',
    h1: 'Add Candidate Name & DOB / Date on Photo Online',
    subtitle: 'Print candidate full name and date of photo / DOB at the bottom of exam photos.',
    category: 'Govt Exam Tools',
    benefits: [
      'Add mandatory name and date stamp for SSC, UPSC, Railway, and State PSC forms.',
      'Customize font size, bar height, and date format.',
      'Instant local browser rendering with zero data collection.',
    ],
    steps: [
      'Upload your photograph.',
      'Type candidate full name and date of photo (or DOB).',
      'Download your formatted exam photo with name and date bar.',
    ],
  },
  {
    slug: 'resize-signature-300-dpi',
    metaTitle: 'Free Signature Resizer — 6cm x 2cm @ 300 DPI | BrowserKit Studio',
    metaDescription: 'Resize signature images for SSC, PAN Card, and UPSC exam applications online for free.',
    metaKeywords: 'resize signature 300 dpi, resize signature 6cm x 2cm online free, pan card ssc signature resizer',
    h1: 'Resize Signature Scan to 6cm x 2cm @ 300 DPI',
    subtitle: 'Resize signature scans to exact 6cm x 2cm or 300 DPI requirements.',
    category: 'Govt Exam Tools',
    benefits: [
      'Resize signature scans to 6cm x 2cm, 50mm x 20mm, or under 20KB for online forms.',
      'Outputs exact 300 DPI metadata density for official portal compliance.',
      '100% private local browser processing.',
    ],
    steps: [
      'Upload your signature image scan.',
      'Select 6cm x 2cm or 300 DPI preset.',
      'Download your resized signature file ready for upload.',
    ],
  },
  {
    slug: 'compress-image-to-20kb',
    metaTitle: 'Compress Image to 20KB Online Free — JPG & PNG | BrowserKit Studio',
    metaDescription: 'Compress JPG and PNG images strictly under 20KB online for free for online application forms.',
    metaKeywords: 'compress image to 20kb, reduce photo size below 20kb online free, compress jpg to 20kb online',
    h1: 'Compress Image File Size Strictly Under 20KB',
    subtitle: 'Reduce image file sizes under 20KB for government application portals and exam forms.',
    category: 'Image Compression',
    benefits: [
      'Compress JPG, PNG, and WebP photos under 20KB without destroying readability.',
      'Automatic quality loop algorithm targeting exact byte thresholds.',
      'Zero server uploads with 100% privacy.',
    ],
    steps: [
      'Upload your photo or signature file.',
      'Click Compress to 20KB.',
      'Download your compressed image under 20KB.',
    ],
  },
  {
    slug: 'compress-image-under-100kb',
    metaTitle: 'Compress Image Under 100KB Online Free | BrowserKit Studio',
    metaDescription: 'Compress JPG and PNG images under 100KB online for free with real-time quality control.',
    metaKeywords: 'compress image under 100kb, reduce photo size below 100kb online free, compress jpg under 100kb',
    h1: 'Compress Image File Size Under 100KB Online Free',
    subtitle: 'Reduce high-resolution photos under 100KB while preserving crisp details.',
    category: 'Image Compression',
    benefits: [
      'Shrink large camera photos to under 100KB in milliseconds.',
      'Side-by-side preview to verify visual quality before saving.',
      'Instant local browser processing.',
    ],
    steps: [
      'Upload your image.',
      'Select Under 100KB target preset.',
      'Download your compressed photo file.',
    ],
  },
  {
    slug: 'merge-photo-and-signature',
    metaTitle: 'Merge Photo & Signature Online — Combine into 1 Image | BrowserKit Studio',
    metaDescription: 'Merge passport photo and signature into a single file for government applications free.',
    metaKeywords: 'merge photo and signature, combine photo and signature into one file online free, photo signature joiner',
    h1: 'Merge Photo & Signature Scan into One File',
    subtitle: 'Combine passport photograph and signature scan vertically into a single uploaded document.',
    category: 'Govt Exam Tools',
    benefits: [
      'Format passport photo on top and signature scan on bottom.',
      'Adjust white padding, dividing border line, and overall width.',
      '100% private in-browser rendering.',
    ],
    steps: [
      'Upload passport photograph.',
      'Upload signature scan image.',
      'Download the merged combined photo + signature asset.',
    ],
  },
  {
    slug: 'heic-to-jpg',
    metaTitle: 'Free HEIC to JPG Converter Online — Batch Convert | BrowserKit Studio',
    metaDescription: 'Convert iPhone HEIC photos to high-resolution JPG images online for free with zero server uploads.',
    metaKeywords: 'heic to jpg, convert heic to jpg online free, iphone heic to jpg converter',
    h1: 'Convert iPhone HEIC Photos to JPG Online Free',
    subtitle: 'Convert Apple HEIC photos into universally compatible high-resolution JPG images.',
    category: 'Format Conversion',
    benefits: [
      'Batch convert iPhone .heic photos into standard JPG or PNG.',
      'Preserve original image resolution and colors.',
      '100% client-side processing — no photos sent to remote servers.',
    ],
    steps: [
      'Drop your iPhone .heic photos.',
      'Click Convert to JPG.',
      'Download your converted JPG image files.',
    ],
  },
  {
    slug: 'convert-heic-to-jpg-mac',
    metaTitle: 'Convert HEIC to JPG on Mac & PC Free | BrowserKit Studio',
    metaDescription: 'Convert HEIC photos to JPG on Mac and Windows PC without installing software.',
    metaKeywords: 'convert heic to jpg mac, how to convert heic to jpg on mac free, heic converter mac pc',
    h1: 'Convert HEIC to JPG on Mac & PC Online Free',
    subtitle: 'Convert Apple HEIC photos on Mac, Windows, and Linux browsers without downloading software.',
    category: 'Format Conversion',
    benefits: [
      'Works in Safari, Chrome, Edge, and Firefox on Mac and PC.',
      'Batch convert multiple HEIC photos at once.',
      '100% free with zero registration.',
    ],
    steps: [
      'Select HEIC files from your Mac or PC.',
      'Click Convert to JPG.',
      'Download your JPG files.',
    ],
  },
  {
    slug: 'png-to-webp',
    metaTitle: 'Free PNG to WebP Converter Online | BrowserKit Studio',
    metaDescription: 'Convert PNG graphics to lightweight modern WebP format online for free.',
    metaKeywords: 'png to webp, convert png to webp online free, png to webp converter',
    h1: 'Convert PNG Images to Modern WebP Format',
    subtitle: 'Reduce image file size by up to 80% while maintaining full alpha transparency.',
    category: 'Format Conversion',
    benefits: [
      'Reduce web image payloads drastically with modern WebP compression.',
      'Preserve transparent background channels.',
      'Instant local browser batch conversion.',
    ],
    steps: [
      'Upload your PNG images.',
      'Click Convert to WebP.',
      'Download your optimized WebP graphics.',
    ],
  },
  {
    slug: 'png-to-ico-favicon',
    metaTitle: 'Free PNG to ICO Favicon Generator | BrowserKit Studio',
    metaDescription: 'Convert PNG logos into 16x16, 32x32, 48x48 ICO favicon files for websites free online.',
    metaKeywords: 'png to ico favicon, png to ico converter online free, website favicon generator',
    h1: 'Convert PNG Logo to Multi-Size ICO Favicon',
    subtitle: 'Generate website favicon.ico files containing 16x16, 32x32, and 48x48 pixel icons.',
    category: 'Favicon Generator',
    benefits: [
      'Generate multi-resolution ICO files for all web browsers.',
      'Preserve transparent background pixels.',
      'Instant download with zero cloud storage.',
    ],
    steps: [
      'Upload your PNG logo or icon image.',
      'Select Favicon size presets.',
      'Download your website favicon.ico file.',
    ],
  },
  {
    slug: 'compress-pdf-to-200kb',
    metaTitle: 'Compress PDF to 200KB Online Free | BrowserKit Studio',
    metaDescription: 'Compress PDF documents under 200KB online for free with dual-engine stream optimization.',
    metaKeywords: 'compress pdf to 200kb, reduce pdf size under 200kb online free, compress pdf file online',
    h1: 'Compress PDF Document File Size Under 200KB',
    subtitle: 'Reduce large PDF document sizes under 200KB for application form uploads.',
    category: 'PDF Tools',
    benefits: [
      'Reduce PDF byte size under 200KB thresholds.',
      'Stirling-PDF dual-engine stream cleanup preserving vector text readability.',
      '100% private in-browser processing.',
    ],
    steps: [
      'Upload your PDF document.',
      'Select Compress to 200KB.',
      'Download your compressed PDF file.',
    ],
  },
  {
    slug: 'remove-pdf-password',
    metaTitle: 'Remove PDF Password Online Free — Unlock PDF | BrowserKit Studio',
    metaDescription: 'Remove password protection and printing/copying restrictions from PDF files free online.',
    metaKeywords: 'remove pdf password, unlock pdf online free, remove owner password from pdf online',
    h1: 'Remove Password Restrictions from PDF Online Free',
    subtitle: 'Unlock password-protected PDFs and remove printing, copying, and editing restrictions.',
    category: 'PDF Tools',
    benefits: [
      'Remove user and owner passwords from PDF files.',
      '100% private local browser decryption.',
      'Download clean, restriction-free PDF documents.',
    ],
    steps: [
      'Upload password-protected PDF.',
      'Enter password if required.',
      'Download your unlocked PDF file.',
    ],
  },
  {
    slug: 'unlock-pdf-online',
    metaTitle: 'Unlock PDF Online Free — Remove PDF Passwords | BrowserKit Studio',
    metaDescription: 'Unlock password protected PDF documents online for free in your browser with 100% privacy.',
    metaKeywords: 'unlock pdf online, unlock pdf file free, pdf password remover online',
    h1: 'Unlock Password Protected PDF Documents Online',
    subtitle: 'Unlock PDF files and remove security locks 100% locally in browser.',
    category: 'PDF Tools',
    benefits: [
      'Unlock encrypted PDF files on-device.',
      'Zero server file uploads.',
      'Fast and free with no limits.',
    ],
    steps: [
      'Upload your encrypted PDF.',
      'Provide password to decrypt.',
      'Download unlocked PDF.',
    ],
  },
  {
    slug: 'unlock-zip-file',
    metaTitle: 'Unlock ZIP File Online Free — Remove ZIP Password | BrowserKit Studio',
    metaDescription: 'Unlock password-protected ZIP files and extract encrypted ZIP archives online for free.',
    metaKeywords: 'unlock zip file, remove zip password online free, zip archive password unlocker',
    h1: 'Unlock Password Protected ZIP File Online Free',
    subtitle: 'Extract password-protected ZIP archives and remove security restrictions on-device.',
    category: 'Archive Tools',
    benefits: [
      'Extract encrypted ZIP archives locally.',
      'No files sent across remote servers.',
      'Fast multi-file extraction.',
    ],
    steps: [
      'Upload password-protected ZIP archive.',
      'Enter ZIP password.',
      'Extract and download your files.',
    ],
  },
  {
    slug: 'remove-zip-password',
    metaTitle: 'Remove ZIP Password Online Free | BrowserKit Studio',
    metaDescription: 'Remove password security from ZIP archives and re-save unencrypted ZIP files free online.',
    metaKeywords: 'remove zip password, zip password remover online free, unlock encrypted zip',
    h1: 'Remove Security Password from ZIP Archives',
    subtitle: 'Re-compress password-protected ZIP files into clean, unlocked ZIP archives.',
    category: 'Archive Tools',
    benefits: [
      'Remove password barriers from ZIP archives.',
      '100% private local extraction and re-archiving.',
      'Free with zero file size limits.',
    ],
    steps: [
      'Upload protected ZIP archive.',
      'Enter password.',
      'Download unlocked ZIP archive.',
    ],
  },
  {
    slug: 'trim-video-without-watermark',
    metaTitle: 'Trim Video Online Without Watermark Free | BrowserKit Studio',
    metaDescription: 'Trim MP4, WebM, and MOV videos online without watermarks for free in your browser.',
    metaKeywords: 'trim video without watermark, video trimmer online free no watermark, cut video online free',
    h1: 'Trim Video Clips Online Without Watermark',
    subtitle: 'Cut and trim video files to custom start/end timestamps without adding watermarks.',
    category: 'Video Tools',
    benefits: [
      '100% clean video export with zero watermarks or logos.',
      'Fast browser-native HTML5 video canvas cutting.',
      'Supports MP4, WebM, MOV, and AVI clips.',
    ],
    steps: [
      'Upload your video file.',
      'Adjust timeline start and end markers.',
      'Export and download your trimmed video.',
    ],
  },
  {
    slug: 'passport-photo-crop-2x2',
    metaTitle: 'Passport Photo 2x2 Inch Crop Tool Free | BrowserKit Studio',
    metaDescription: 'Crop headshots to exact 2x2 inch (600x600 px) US Passport requirements online free.',
    metaKeywords: 'passport photo crop 2x2, 2x2 inch photo resizer online free, us visa photo crop',
    h1: 'Crop Photo to 2x2 Inch Passport Sizing Free',
    subtitle: 'Crop photographs to official 2x2 inch (51x51mm, 600x600px) US Passport & Visa dimensions.',
    category: 'Passport Tools',
    benefits: [
      'Format headshots to 2x2 inch (600x600 pixel) US Passport standards.',
      'Option to set solid white background.',
      '100% private local rendering.',
    ],
    steps: [
      'Upload your photo.',
      'Select 2x2 Inch Passport preset.',
      'Download your cropped 2x2 passport photo.',
    ],
  },
  {
    slug: 'pdf-merger',
    metaTitle: 'Free PDF Merger — Merge PDF Files Online | BrowserKit Studio',
    metaDescription: 'Combine multiple PDF documents into a single PDF file online for free with 100% privacy.',
    metaKeywords: 'pdf merger, merge pdf online free, combine pdf files offline',
    h1: 'Merge Multiple PDF Files into One Document',
    subtitle: 'Combine multiple PDF files in custom order with 100% local browser processing.',
    category: 'PDF Tools',
    benefits: [
      'Merge unlimited PDF files into one.',
      'Drag and drop to re-order pages.',
      '100% private on-device processing.',
    ],
    steps: [
      'Upload your PDF files.',
      'Arrange PDFs in your desired order.',
      'Click Merge PDFs to download your combined document.',
    ],
  },
  {
    slug: 'pdf-splitter',
    metaTitle: 'Free PDF Splitter — Split PDF Pages Online | BrowserKit Studio',
    metaDescription: 'Split PDF files into individual pages or custom page range chunks online for free.',
    metaKeywords: 'pdf splitter, split pdf pages online free, extract pages from pdf',
    h1: 'Split PDF Files into Individual Pages or Chunks',
    subtitle: 'Extract specific pages or split PDF documents into equal page chunks.',
    category: 'PDF Tools',
    benefits: [
      'Split PDF by custom page ranges (e.g. 1-3, 5, 8-10).',
      'Split into equal page chunks or MB target sizes.',
      '100% private in-browser execution.',
    ],
    steps: [
      'Upload your PDF file.',
      'Select page split range or chunk count.',
      'Download your split PDF pages.',
    ],
  },
  {
    slug: 'pdf-signer',
    metaTitle: 'Free PDF Digital Signer & Stamp Tool | BrowserKit Studio',
    metaDescription: 'Sign PDF documents online for free. Draw or upload a signature and place it on PDF pages.',
    metaKeywords: 'pdf signer, sign pdf online free, add signature to pdf document',
    h1: 'Digital Signer & Signature Stamp Tool for PDF',
    subtitle: 'Draw a custom signature or upload a signature image stamp to place on target PDF pages.',
    category: 'PDF Tools',
    benefits: [
      'Draw smooth digital signatures on interactive canvas pad.',
      'Upload signature scans and stamp on any PDF page.',
      '100% local on-device signing with zero server uploads.',
    ],
    steps: [
      'Upload your PDF document.',
      'Draw or upload your signature stamp.',
      'Position signature on target page and download signed PDF.',
    ],
  },
  {
    slug: 'pdf-to-jpg',
    metaTitle: 'Free PDF to JPG Converter Online | BrowserKit Studio',
    metaDescription: 'Convert PDF document pages to crisp JPEG images online for free in your browser.',
    metaKeywords: 'pdf to jpg, convert pdf to jpg online free, pdf pages to jpeg images',
    h1: 'Convert PDF Document Pages to Crisp JPG Images',
    subtitle: 'Render every page of your PDF document into high-resolution JPEG image files.',
    category: 'PDF Tools',
    benefits: [
      'Render high-DPI crisp JPEG images for every PDF page.',
      'Download single image or ZIP bundle of all pages.',
      '100% local browser canvas rendering.',
    ],
    steps: [
      'Upload your PDF document.',
      'Click Convert to JPG.',
      'Download page image files or ZIP archive.',
    ],
  },
  {
    slug: 'pdf-to-word',
    metaTitle: 'Free PDF to Word Converter (.docx) | BrowserKit Studio',
    metaDescription: 'Convert PDF files to editable Microsoft Word .docx documents online for free.',
    metaKeywords: 'pdf to word, convert pdf to docx online free, pdf to word converter editable',
    h1: 'Convert PDF Document to Editable Word (.docx) File',
    subtitle: 'Extract text streams, headings, and formatting from PDF into native Word .docx format.',
    category: 'PDF Tools',
    benefits: [
      'Extract text, headings, and page structures into native Microsoft Word .docx files.',
      'High-fidelity font size mapping and page break insertion.',
      '100% private local conversion.',
    ],
    steps: [
      'Upload your PDF file.',
      'Click Convert to Word.',
      'Download your editable .docx file.',
    ],
  },
  {
    slug: 'images-to-pdf',
    metaTitle: 'Free Images to PDF Converter — JPG & PNG | BrowserKit Studio',
    metaDescription: 'Convert JPG, PNG, and WebP images into a formatted PDF document online free.',
    metaKeywords: 'images to pdf, convert jpg to pdf online free, photo to pdf maker',
    h1: 'Convert Multiple Images to Single PDF Document',
    subtitle: 'Combine photos, scans, and graphic files into a clean PDF document.',
    category: 'PDF Tools',
    benefits: [
      'Combine JPG, PNG, WebP, and HEIC photos into 1 PDF.',
      'Customize page margins, orientation, and image ordering.',
      '100% private local execution.',
    ],
    steps: [
      'Upload your image files.',
      'Arrange image sequence.',
      'Download your compiled PDF document.',
    ],
  },
  {
    slug: 'social-video-downloader',
    metaTitle: 'Social Video Downloader & Frame Grabber | BrowserKit Studio',
    metaDescription: 'Extract and download video frames and media assets free online with 100% privacy.',
    metaKeywords: 'social video downloader, video frame extractor, grab video frames online',
    h1: 'Social Video Downloader & Media Frame Grabber',
    subtitle: 'Process video clips, capture frame snapshots, and extract media assets on-device.',
    category: 'Video Tools',
    benefits: [
      'Capture high-res frame snapshots from any video.',
      'Export frame grabs to PNG or JPG.',
      '100% local processing.',
    ],
    steps: [
      'Upload your video clip.',
      'Scrub to desired frame.',
      'Download frame snapshot image.',
    ],
  },
  {
    slug: 'social-audio-extractor',
    metaTitle: 'Free Social Audio Extractor — Video to Audio | BrowserKit Studio',
    metaDescription: 'Extract audio tracks from video clips free online in 320kbps MP3 or WAV format.',
    metaKeywords: 'social audio extractor, extract audio from video online free, mp4 to mp3',
    h1: 'Extract Audio Tracks from Video Clips Free',
    subtitle: 'Extract high quality sound tracks from MP4, WebM, and MOV video clips on-device.',
    category: 'Audio Tools',
    benefits: [
      'Extract pristine 320kbps MP3 or WAV audio tracks.',
      'Zero server uploads.',
      'Fast browser-native execution.',
    ],
    steps: [
      'Upload video clip.',
      'Select output audio format.',
      'Download extracted audio file.',
    ],
  },
  {
    slug: 'thumbnail-grabber',
    metaTitle: 'Free Video Thumbnail Grabber & Snapshot Tool | BrowserKit Studio',
    metaDescription: 'Extract high resolution thumbnail images and frame snapshots from video files free.',
    metaKeywords: 'thumbnail grabber, video thumbnail extractor online free, capture video snapshot',
    h1: 'Extract High-Res Video Thumbnails & Snapshot Frames',
    subtitle: 'Capture full resolution video thumbnails and frame stills from video files.',
    category: 'Video Tools',
    benefits: [
      'Capture original resolution thumbnail snapshots.',
      'Export to PNG or JPG formats.',
      'Zero cloud server uploads.',
    ],
    steps: [
      'Upload video file.',
      'Select snapshot timestamp frame.',
      'Download thumbnail image.',
    ],
  },
  {
    slug: 'video-format-swapper',
    metaTitle: 'Free Video Format Swapper — MP4, WebM, MOV | BrowserKit Studio',
    metaDescription: 'Swap video container formats between MP4, WebM, and MOV free online in your browser.',
    metaKeywords: 'video format swapper, convert video format online free, mp4 to webm mov',
    h1: 'Swap Video Container Formats (MP4, WebM, MOV)',
    subtitle: 'Convert video container formats locally in browser with WebAssembly media tools.',
    category: 'Video Tools',
    benefits: [
      'Convert between MP4, WebM, and MOV containers.',
      'Preserve original video quality.',
      '100% private in-browser conversion.',
    ],
    steps: [
      'Upload video clip.',
      'Choose target format (MP4, WebM, MOV).',
      'Download converted video file.',
    ],
  },
  {
    slug: 'video-trimmer',
    metaTitle: 'Free Video Trimmer — Cut Video Clips Online | BrowserKit Studio',
    metaDescription: 'Trim and cut video clips online for free with visual timeline scrubber controls.',
    metaKeywords: 'video trimmer, cut video clip online free, trim mp4 video',
    h1: 'Trim & Cut Video Clips Online Free',
    subtitle: 'Trim MP4, WebM, and MOV video clips with visual timeline scrubber controls.',
    category: 'Video Tools',
    benefits: [
      'Visual timeline scrubber controls.',
      'Watermark-free video export.',
      '100% private local execution.',
    ],
    steps: [
      'Upload video clip.',
      'Set start and end timestamps.',
      'Download trimmed video asset.',
    ],
  },
  {
    slug: 'gif-maker',
    metaTitle: 'Free Animated GIF Maker — Video & Images to GIF | BrowserKit Studio',
    metaDescription: 'Create animated GIFs from video clips or image sequences free online in browser.',
    metaKeywords: 'gif maker, convert video to gif online free, images to animated gif',
    h1: 'Create Animated GIFs from Video Clips & Photos',
    subtitle: 'Convert video clips or multiple photos into custom animated GIF files.',
    category: 'Media Tools',
    benefits: [
      'Convert video clips to animated GIF.',
      'Customize frame rate (FPS) and loop settings.',
      '100% local processing.',
    ],
    steps: [
      'Upload video or photo sequence.',
      'Select GIF FPS and dimensions.',
      'Download animated GIF file.',
    ],
  },
];

const ALL_ROUTES = [...CATEGORY_ROUTES, ...PROGRAMMATIC_ROUTES];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generatePreRenderedContent(route: RouteMetadata): string {
  const h1 = escapeHtml(route.h1);
  const subtitle = escapeHtml(route.subtitle || route.metaDescription);
  const canonicalUrl = `https://browserkit.co.in/${route.slug}`;

  let benefitsHtml = '';
  if (route.benefits && route.benefits.length > 0) {
    const listItems = route.benefits.map((b) => `<li style="margin-bottom:8px;">${escapeHtml(b)}</li>`).join('');
    benefitsHtml = `
      <section style="margin-top:32px; padding:24px; border:1px solid #e2e8f0; border-radius:12px; background-color:#f8fafc;">
        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin-bottom:16px;">Key Features & Privacy Benefits</h2>
        <ul style="padding-left:20px; color:#334155; line-height:1.6;">${listItems}</ul>
      </section>`;
  }

  let stepsHtml = '';
  if (route.steps && route.steps.length > 0) {
    const listItems = route.steps.map((s) => `<li style="margin-bottom:8px;">${escapeHtml(s)}</li>`).join('');
    stepsHtml = `
      <section style="margin-top:24px; padding:24px; border:1px solid #e2e8f0; border-radius:12px; background-color:#ffffff;">
        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin-bottom:16px;">How to Use ${h1}</h2>
        <ol style="padding-left:20px; color:#334155; line-height:1.6;">${listItems}</ol>
      </section>`;
  }

  const jsonLdSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${canonicalUrl}#webapp`,
    name: route.h1,
    url: canonicalUrl,
    description: route.metaDescription,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires HTML5 Canvas and JavaScript enabled',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://browserkit.co.in/#organization',
      name: 'BrowserKit Studio',
      url: 'https://browserkit.co.in/',
    },
  });

  return `
    <div style="max-width:1200px; margin:0 auto; padding:32px 16px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <nav style="font-size:14px; color:#64748b; margin-bottom:16px;">
        <a href="https://browserkit.co.in/" style="color:#2563eb; text-decoration:none;">BrowserKit Studio</a> &gt; <span>${escapeHtml(route.category || 'Tool')}</span>
      </nav>
      <header style="margin-bottom:24px;">
        <h1 style="font-size:32px; font-weight:800; color:#0f172a; margin-bottom:8px; line-height:1.2;">${h1}</h1>
        <p style="font-size:18px; color:#475569; line-height:1.5;">${subtitle}</p>
      </header>
      <div id="tool-workspace-mount" style="min-height:300px; padding:32px; border:2px dashed #cbd5e1; border-radius:16px; text-align:center; background-color:#f1f5f9;">
        <p style="font-size:16px; font-weight:600; color:#334155;">Select or drop your files to process 100% locally in your browser memory.</p>
      </div>
      ${benefitsHtml}
      ${stepsHtml}
    </div>
    <script type="application/ld+json">${jsonLdSchema}</script>`;
}

let generatedCount = 0;

for (const route of ALL_ROUTES) {
  const canonicalUrl = `https://browserkit.co.in/${route.slug}`;
  let routeHtml = baseHtml;

  // Replace Title & Meta Title
  routeHtml = routeHtml.replace(/<title>.*?<\/title>/gi, `<title>${escapeHtml(route.metaTitle)}</title>`);
  routeHtml = routeHtml.replace(/<meta name="title" content=".*?" \/>/gi, `<meta name="title" content="${escapeHtml(route.metaTitle)}" />`);

  // Replace Meta Description
  routeHtml = routeHtml.replace(/<meta name="description" content=".*?" \/>/gi, `<meta name="description" content="${escapeHtml(route.metaDescription)}" />`);

  // Replace Meta Keywords if present
  if (route.metaKeywords) {
    routeHtml = routeHtml.replace(/<meta name="keywords" content=".*?" \/>/gi, `<meta name="keywords" content="${escapeHtml(route.metaKeywords)}" />`);
  }

  // Replace Canonical Link to SELF-REFERENCING canonical URL
  routeHtml = routeHtml.replace(/<link rel="canonical" href=".*?" \/>/gi, `<link rel="canonical" href="${canonicalUrl}" />`);

  // Replace Open Graph Meta Tags
  routeHtml = routeHtml.replace(/<meta property="og:url" content=".*?" \/>/gi, `<meta property="og:url" content="${canonicalUrl}" />`);
  routeHtml = routeHtml.replace(/<meta property="og:title" content=".*?" \/>/gi, `<meta property="og:title" content="${escapeHtml(route.metaTitle)}" />`);
  routeHtml = routeHtml.replace(/<meta property="og:description" content=".*?" \/>/gi, `<meta property="og:description" content="${escapeHtml(route.metaDescription)}" />`);

  // Replace Twitter Meta Tags
  routeHtml = routeHtml.replace(/<meta name="twitter:url" content=".*?" \/>/gi, `<meta name="twitter:url" content="${canonicalUrl}" />`);
  routeHtml = routeHtml.replace(/<meta name="twitter:title" content=".*?" \/>/gi, `<meta name="twitter:title" content="${escapeHtml(route.metaTitle)}" />`);
  routeHtml = routeHtml.replace(/<meta name="twitter:description" content=".*?" \/>/gi, `<meta name="twitter:description" content="${escapeHtml(route.metaDescription)}" />`);

  // Inject Pre-rendered HTML payload inside <div id="root"></div>
  const preRenderedContent = generatePreRenderedContent(route);
  routeHtml = routeHtml.replace('<div id="root"></div>', `<div id="root">${preRenderedContent}</div>`);

  // Write to dist/${route.slug}/index.html
  const targetDir = path.join(distDir, route.slug);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFilePath = path.join(targetDir, 'index.html');
  fs.writeFileSync(targetFilePath, routeHtml, 'utf8');
  generatedCount++;
}

console.log(`[Prerender] Successfully generated ${generatedCount} static pre-rendered route HTML pages in dist/!`);
