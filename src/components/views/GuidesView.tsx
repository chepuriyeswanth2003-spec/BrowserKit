import React, { useState } from 'react';
import { BookOpen, CheckCircle, ArrowRight, ShieldCheck, Lock, FileText, Minimize2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { ActivePage, ToolType } from '../../types';
import { PrivacyBadge } from '../PrivacyBadge';
import { AdSlot } from '../AdSlot';

interface GuidesViewProps {
  setActivePage: (page: ActivePage) => void;
}

export const GuidesView: React.FC<GuidesViewProps> = ({ setActivePage }) => {
  const [expandedGuide, setExpandedGuide] = useState<string | null>('compress-guide');

  const articles = [
    {
      id: 'compress-guide',
      icon: <Minimize2 className="w-5 h-5 text-[#2f7a4f]" />,
      title: 'How Client-Side Image Compression Shrinks PNG & JPG Files Under 100KB',
      category: 'Image Optimization',
      readTime: '5 min read',
      toolTarget: 'compressor' as ToolType,
      toolLabel: 'Open Image Compressor',
      summary: 'Learn how WebP quantization and lossy HTML5 Canvas encoding reduce image payload sizes by up to 90% while keeping visual quality intact for portal uploads.',
      fullContent: (
        <div className="space-y-4 text-xs sm:text-sm text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] leading-relaxed font-normal">
          <p>
            When uploading photos to government portals, college admission forms, or email attachments, you often encounter strict file size limits—such as requiring photos to be <strong>under 50KB, 100KB, or 200KB</strong>.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-[#2d2d2d] dark:text-white pt-2">
            Why Legacy Cloud Converters Pose Privacy Risks
          </h3>
          <p>
            Traditional online image compression sites require you to upload your personal photos, ID headshots, and confidential documents to remote cloud servers. Once uploaded, your images may linger in cloud server temp directories or be processed by third-party analytics trackers.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-[#2d2d2d] dark:text-white pt-2">
            How BrowserKit's Client-Side Engine Works
          </h3>
          <p>
            BrowserKit performs 100% of image processing directly inside your device's web browser RAM using HTML5 Canvas APIs and Web Workers. Here is the step-by-step pipeline:
          </p>

          <ul className="space-y-2 pl-4 list-disc font-mono text-xs">
            <li><strong>Canvas Memory Initialization:</strong> Your image file is loaded into an offscreen HTML5 canvas element within local memory.</li>
            <li><strong>Smart Palette Quantization:</strong> Redundant color spectrum data is trimmed using perceptual psycho-visual algorithms.</li>
            <li><strong>Target KB Thresholding:</strong> The encoder iteratively recalculates quality steps to guarantee your image stays below target caps (50KB, 100KB, 200KB).</li>
            <li><strong>Instant Local Export:</strong> The compressed PNG, JPG, or WebP blob is generated locally and saved straight to your downloads folder.</li>
          </ul>

          <div className="p-4 wobbly-sm bg-[#2f7a4f] dark:bg-[#2f7a4f]/40 border border-[2px] border-[#2f7a4f] dark:border-[#2f7a4f] text-[#2f7a4f] dark:text-[#2f7a4f] text-xs font-mono">
            💡 <strong>Pro Tip:</strong> Converting heavy PNG graphics to WebP or JPEG can save an extra 30% to 50% file weight with zero noticeable difference in human visual perception.
          </div>
        </div>
      ),
    },
    {
      id: 'pdf-unlock-guide',
      icon: <Lock className="w-5 h-5 text-[#ff4d4d]" />,
      title: 'Why Unlocking PDFs & Removing Passwords Locally is 100% Safer Than Cloud Sites',
      category: 'PDF Security',
      readTime: '6 min read',
      toolTarget: 'pdf-password-remover' as ToolType,
      toolLabel: 'Open PDF Unlocker',
      summary: 'Discover how WebAssembly unlocks password-protected PDFs and strips printing, editing, and copying locks directly inside your browser memory without cloud transfers.',
      fullContent: (
        <div className="space-y-4 text-xs sm:text-sm text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] leading-relaxed font-normal">
          <p>
            Password-protected PDF files—such as bank statements, tax returns, paystubs, legal contracts, and medical records—are locked with encryption to protect sensitive personal data. However, when you need to print, edit, or split these documents, entering passwords every time becomes frustrating.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-[#2d2d2d] dark:text-white pt-2">
            The Danger of Uploading Protected Documents to Cloud Sites
          </h3>
          <p>
            Many online "PDF unlocker" websites require uploading your password-protected PDF alongside your decryption password to their remote cloud servers. This exposes your most sensitive financial and identity records to server-side logging and potential data breaches.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-[#2d2d2d] dark:text-white pt-2">
            Client-Side Decryption via pdf-lib WebAssembly
          </h3>
          <p>
            BrowserKit solves this privacy vulnerability by executing PDF decryption entirely inside your local web browser:
          </p>

          <ul className="space-y-2 pl-4 list-disc font-mono text-xs">
            <li><strong>Local ArrayBuffer Reading:</strong> Your PDF file is read as an ArrayBuffer in client-side RAM memory.</li>
            <li><strong>On-Device Key Decryption:</strong> `pdf-lib` parses encryption dictionaries locally and validates your password on your own CPU.</li>
            <li><strong>Owner Flag Stripping:</strong> Printing, copying, and editing restriction flags are stripped from document catalog headers.</li>
            <li><strong>Clean PDF Generation:</strong> A clean, unencrypted PDF document is exported directly to disk without a single byte ever being transmitted over the internet.</li>
          </ul>

          <div className="p-4 wobbly-sm bg-[#ff4d4d] dark:bg-[#ff4d4d]/40 border border-[2px] border-[#ff4d4d] dark:border-[#ff4d4d] text-[#ff4d4d] dark:text-[#ff4d4d] text-xs font-mono">
            🔒 <strong>Security Guarantee:</strong> Open your browser DevTools Network tab while unlocking a PDF—you will observe zero network uploads or external API requests.
          </div>
        </div>
      ),
    },
    {
      id: 'heic-to-jpg-guide',
      icon: <RefreshCw className="w-5 h-5 text-[#2d5da1]" />,
      title: 'How to Convert iPhone HEIC Photos to JPG on Windows & Mac Without Software',
      category: 'Image Conversion',
      readTime: '4 min read',
      toolTarget: 'converter' as ToolType,
      toolLabel: 'Open Format Converter',
      summary: 'Learn how iPhone High-Efficiency Image Coding (HEIC) format works and how to batch convert HEIC photos to universal high-res JPG images.',
      fullContent: (
        <div className="space-y-4 text-xs sm:text-sm text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] leading-relaxed font-normal">
          <p>
            Apple iPhones use **HEIC (High Efficiency Image Format)** by default to save camera storage space. While HEIC images offer excellent quality at smaller file sizes, many Windows PCs, Android devices, website upload portals, and photo printing kiosks fail to open `.heic` files.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-[#2d2d2d] dark:text-white pt-2">
            Converting HEIC to JPG 100% Client-Side
          </h3>
          <p>
            Instead of downloading third-party software executables or uploading private photo albums to cloud converters, BrowserKit utilizes `heic2any` WebAssembly decoders inside your browser:
          </p>

          <ul className="space-y-2 pl-4 list-disc font-mono text-xs">
            <li><strong>Drop HEIC Photos:</strong> Select individual iPhone AirDrop photos or entire photo folders.</li>
            <li><strong>Wasm Decoding:</strong> WebAssembly decodes HEIF/HEIC container bitstreams into raw RGBA pixel arrays in local memory.</li>
            <li><strong>Preserve EXIF & Resolution:</strong> Original camera dimensions, colors, and camera metadata are preserved.</li>
            <li><strong>Batch ZIP Export:</strong> Download converted JPG photos individually or saved together inside a single compressed ZIP package.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'aes256-encrypt-guide',
      icon: <ShieldCheck className="w-5 h-5 text-[#6b4fa0]" />,
      title: 'Understanding Client-Side AES-256 Password Encryption Vaults in Web Browsers',
      category: 'Security Vault',
      readTime: '5 min read',
      toolTarget: 'file-encryptor' as ToolType,
      toolLabel: 'Open File Encryptor',
      summary: 'Explore how Web Crypto APIs use PBKDF2 key derivation and AES-256-GCM authenticated encryption to protect confidential files before sending over email.',
      fullContent: (
        <div className="space-y-4 text-xs sm:text-sm text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] leading-relaxed font-normal">
          <p>
            Sending unencrypted PDFs, images, or documents over email or cloud storage links exposes your personal files to interception. Encrypting files with a master password ensures that only recipient possessing the password can open them.
          </p>

          <h3 className="text-sm sm:text-base font-bold text-[#2d2d2d] dark:text-white pt-2">
            The Web Crypto API & AES-256-GCM Architecture
          </h3>
          <p>
            BrowserKit leverages the browser's native `window.crypto.subtle` Web Crypto API:
          </p>

          <ul className="space-y-2 pl-4 list-disc font-mono text-xs">
            <li><strong>PBKDF2 Key Derivation:</strong> Your master password is stretched using 100,000 iterations of SHA-256 with a unique random salt.</li>
            <li><strong>AES-256-GCM Encryption:</strong> Files are encrypted using 256-bit Galois/Counter Mode authenticated encryption.</li>
            <li><strong>Zero Knowledge:</strong> Encryption keys are created in transient RAM memory and discarded immediately after file generation.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-10 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 wobbly-pill text-xs font-mono font-bold uppercase tracking-wider bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d]/[0.92] dark:text-[#f3ede2]/[0.55] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]">
          <BookOpen className="w-3.5 h-3.5 text-[#2f7a4f]" /> Web Utilities & Security Guides
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-[#2d2d2d] dark:text-white tracking-tight">
          BrowserKit SEO Tutorials
        </h1>
        <p className="text-sm text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] font-medium max-w-2xl mx-auto">
          In-depth technical articles explaining client-side WebAssembly image processing, browser-native PDF unlocking, HEIC photo conversion, and AES-256 security.
        </p>
        <div className="pt-1 flex justify-center">
          <PrivacyBadge compact />
        </div>
      </div>

      {/* Guides List */}
      <div className="space-y-6">
        {articles.map((article) => {
          const isExpanded = expandedGuide === article.id;
          return (
            <article
              key={article.id}
              className="p-6 md:p-8 wobbly-md bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm transition-all space-y-4"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#2d2d2d]/[0.7] border-b border-[#2d2d2d]/[0.15] dark:border-[#f3ede2] pb-3">
                <div className="flex items-center gap-2">
                  {article.icon}
                  <span className="font-bold text-[#2d2d2d] dark:text-white uppercase tracking-wider">
                    {article.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{article.readTime}</span>
                  <span className="px-2 py-0.5 wobbly-pill bg-[#2f7a4f] dark:bg-[#2f7a4f] text-[#2f7a4f] dark:text-[#2f7a4f] font-bold">
                    100% Client-Side
                  </span>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-extrabold text-[#2d2d2d] dark:text-white leading-snug">
                {article.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] font-medium leading-relaxed">
                {article.summary}
              </p>

              {/* Expandable Article Content */}
              {isExpanded ? (
                <div className="pt-4 border-t border-[#2d2d2d]/[0.15] dark:border-[#f3ede2] space-y-4 animate-fade-in">
                  {article.fullContent}
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#2d2d2d]/[0.15] dark:border-[#f3ede2] flex items-center justify-between gap-4">
                <button
                  onClick={() => setExpandedGuide(isExpanded ? null : article.id)}
                  className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] hover:text-[#2d2d2d] flex items-center gap-1 cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <span>Collapse Article</span> <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Read Full Guide</span> <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActivePage(article.toolTarget)}
                  className="px-5 py-2.5 wobbly-md text-xs font-bold uppercase tracking-wider bg-[#2d2d2d] dark:bg-white text-white dark:text-[#f3ede2] hover:bg-[#2d2d2d] dark:hover:bg-[#3a352f] shadow-hand-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>{article.toolLabel}</span> <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <AdSlot type="below-tool" />
    </div>
  );
};
