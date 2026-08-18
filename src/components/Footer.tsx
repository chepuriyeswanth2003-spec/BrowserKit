import React, { useState } from 'react';
import { Wrench, FileCode, Lock, Heart } from 'lucide-react';
import type { ActivePage } from '../types';
import { SitemapModal } from './SitemapModal';
import { PROGRAMMATIC_ROUTES } from '../data/toolsData';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
  onNavigateRoute?: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage, onNavigateRoute }) => {
  const [sitemapModalOpen, setSitemapModalOpen] = useState(false);

  return (
    <footer className="w-full border-t-[3px] border-[#2d2d2d] dark:border-[#f3ede2] bg-[#fdfbf7] dark:bg-[#262220] text-[#2d2d2d]/70 dark:text-[#f3ede2]/70 text-xs transition-colors mt-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Column 1: Brand & Trust */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 wobbly-sm bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand-sm">
                <Wrench className="size-4" />
              </div>
              <span className="font-bold text-lg text-[#2d2d2d] dark:text-[#f3ede2]">
                Browser<span className="text-[#ff4d4d]">Kit</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#2d2d2d]/70 dark:text-[#f3ede2]/70 max-w-sm font-medium">
              100% Client-Side Privacy-First Web Media Utility Toolkit. Fast, secure browser-based tools with zero server uploads for images, video, PDFs, ZIP archives, and audio files.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 wobbly-pill text-xs font-mono font-bold bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand-sm select-none whitespace-nowrap">
                <Lock className="size-3.5 text-white shrink-0" />
                <span className="text-white">100% Private On-Device Processing</span>
              </div>
            </div>
          </div>

          {/* Column 2: Image Tools */}
          <div>
            <h3 className="font-bold text-xs text-[#2d2d2d] dark:text-[#f3ede2] uppercase tracking-wider mb-3 font-mono">
              Image Utilities
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('compressor'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  Image Compressor
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('converter'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  HEIC & Format Converter
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('resizer'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  Resizer & Passport Cropper
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('palette'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  Color Picker & Favicons
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Video & Audio */}
          <div>
            <h3 className="font-bold text-xs text-[#2d2d2d] dark:text-[#f3ede2] uppercase tracking-wider mb-3 font-mono">
              Video & Audio
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('video-trimmer'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  Video Trimmer & Muter
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('video-to-gif'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  Frame Extractor
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('audio-tools'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  Audio Track Extractor
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: PDF & ZIP */}
          <div>
            <h3 className="font-bold text-xs text-[#2d2d2d] dark:text-[#f3ede2] uppercase tracking-wider mb-3 font-mono">
              PDF & ZIP Tools
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('pdf-merger'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  PDF Merger
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('pdf-splitter'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  PDF Page Extractor
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('images-to-pdf'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  Images to PDF
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('zip-archiver'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  ZIP Archiver & Creator
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('file-encryptor'); }} className="hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] transition-colors cursor-pointer">
                  Password Encryptor Vault
                </button>
              </li>
              <li className="pt-2 border-t-2 border-dashed border-[#2d2d2d]/30 dark:border-[#f3ede2]/30">
                <button onClick={() => setSitemapModalOpen(true)} className="flex items-center gap-1.5 hover:text-[#ff4d4d] transition-colors font-mono cursor-pointer">
                  <FileCode className="size-3.5 text-[#2d2d2d]/70 dark:text-[#f3ede2]/60" /> Dynamic Sitemap XML
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Programmatic SEO Routes Bar */}
        <div className="pt-6 border-t-2 border-dashed border-[#2d2d2d]/30 dark:border-[#f3ede2]/30 mb-6 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold uppercase text-[#2d2d2d]/70 dark:text-[#f3ede2]/70">
            Programmatic Long-Tail Search Landing Pages
          </span>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            {PROGRAMMATIC_ROUTES.map((pRoute) => (
              <button
                key={pRoute.slug}
                onClick={() => {
                  if (onNavigateRoute) onNavigateRoute(pRoute.slug);
                }}
                className="px-2 py-0.5 wobbly-sm bg-[#e5e0d8] dark:bg-[#3a352f] text-[#2d2d2d]/70 dark:text-[#f3ede2]/70 hover:text-[#ff4d4d] transition-colors cursor-pointer"
              >
                /{pRoute.slug}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t-2 border-dashed border-[#2d2d2d]/30 dark:border-[#f3ede2]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#2d2d2d]/70 dark:text-[#f3ede2]/60 font-mono">
          <p>© {new Date().getFullYear()} BrowserKit Studio. All rights reserved. 100% Client-Side Web Architecture.</p>
          <div className="flex items-center gap-1">
            Built with Canvas, WebAssembly & WebCrypto <Heart className="size-3 text-[#ff4d4d] fill-current ml-0.5" />
          </div>
        </div>
      </div>

      <SitemapModal isOpen={sitemapModalOpen} onClose={() => setSitemapModalOpen(false)} />
    </footer>
  );
};
