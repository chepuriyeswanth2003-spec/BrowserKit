import React, { useState } from 'react';
import { Wrench, FileCode, Lock, Heart, Globe, ArrowRight } from 'lucide-react';
import { ActivePage } from '../types';
import { SitemapModal } from './SitemapModal';
import { PROGRAMMATIC_ROUTES } from '../data/toolsData';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
  onNavigateRoute?: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage, onNavigateRoute }) => {
  const [sitemapModalOpen, setSitemapModalOpen] = useState(false);

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors mt-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Column 1: Brand & Trust */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                Browser<span className="text-slate-500 dark:text-slate-400">Kit</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm font-medium">
              100% Client-Side Privacy-First Web Media Utility Toolkit. Fast, secure browser-based tools with zero server uploads for images, video, PDFs, ZIP archives, and audio files.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800">
                <Lock className="w-3 h-3 text-slate-900 dark:text-white" /> 100% Private On-Device Processing
              </div>
            </div>
          </div>

          {/* Column 2: Image Tools */}
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3 font-mono">
              Image Utilities
            </h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('compressor'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Image Compressor
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('converter'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  HEIC & Format Converter
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('resizer'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Resizer & Passport Cropper
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('palette'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Color Picker & Favicons
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Video & Audio */}
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3 font-mono">
              Video & Audio
            </h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('video-trimmer'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Video Trimmer & Muter
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('video-to-gif'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Frame Extractor
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('audio-tools'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Audio Track Extractor
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: PDF & ZIP */}
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3 font-mono">
              PDF & ZIP Tools
            </h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('pdf-merger'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  PDF Merger
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('pdf-splitter'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  PDF Page Extractor
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('images-to-pdf'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Images to PDF
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('zip-archiver'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  ZIP Archiver & Creator
                </button>
              </li>
              <li>
                <button onClick={() => { if (onNavigateRoute) onNavigateRoute(''); setActivePage('file-encryptor'); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Password Encryptor Vault
                </button>
              </li>
              <li className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button onClick={() => setSitemapModalOpen(true)} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors font-mono">
                  <FileCode className="w-3.5 h-3.5 text-slate-500" /> Dynamic Sitemap XML
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Programmatic SEO Routes Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 mb-6 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
            Programmatic Long-Tail Search Landing Pages
          </span>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            {PROGRAMMATIC_ROUTES.map((pRoute) => (
              <button
                key={pRoute.slug}
                onClick={() => {
                  if (onNavigateRoute) onNavigateRoute(pRoute.slug);
                }}
                className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                /{pRoute.slug}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} BrowserKit. All rights reserved. 100% Client-Side Web Architecture.</p>
          <div className="flex items-center gap-1">
            Built with Canvas, WebAssembly & WebCrypto <Heart className="w-3 h-3 text-slate-700 dark:text-slate-300 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      <SitemapModal isOpen={sitemapModalOpen} onClose={() => setSitemapModalOpen(false)} />
    </footer>
  );
};
