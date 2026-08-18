import React, { useState } from 'react';
import { X, FileCode, Download } from 'lucide-react';
import { generateRobotsTxt, generateSitemapXML } from '../lib/seoData';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SitemapModal: React.FC<SitemapModalProps> = ({ isOpen, onClose }) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://browserkit.co.in';
  const sitemapXml = generateSitemapXML(baseUrl);
  const robotsTxt = generateRobotsTxt(baseUrl);

  if (!isOpen) return null;

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto wobbly-sm bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-lg p-6 text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-black dark:hover:text-white hover:bg-[#e5e0d8] dark:hover:bg-[#332e29] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <FileCode className="w-5 h-5 text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]" />
          <h3 className="text-lg font-bold uppercase tracking-tight">Static Sitemap & SEO Data</h3>
        </div>

        <p className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] mb-4 font-mono">
          Auto-generated static XML sitemap and robots.txt for search engine indexing across all 15 media tools.
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">
                sitemap.xml
              </span>
              <button
                onClick={() => downloadFile(sitemapXml, 'sitemap.xml', 'application/xml')}
                className="text-xs font-bold font-mono text-black dark:text-white flex items-center gap-1 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Download sitemap.xml
              </button>
            </div>
            <pre className="p-3 wobbly-sm bg-[#1a1a1a] text-[#2d2d2d]/[0.7] text-[11px] font-mono overflow-x-auto max-h-44 border border-[2px] border-[#2d2d2d]">
              {sitemapXml}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">
                robots.txt
              </span>
              <button
                onClick={() => downloadFile(robotsTxt, 'robots.txt', 'text/plain')}
                className="text-xs font-bold font-mono text-black dark:text-white flex items-center gap-1 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Download robots.txt
              </button>
            </div>
            <pre className="p-3 wobbly-sm bg-[#1a1a1a] text-[#2d2d2d]/[0.7] text-[11px] font-mono overflow-x-auto border border-[2px] border-[#2d2d2d]">
              {robotsTxt}
            </pre>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 wobbly-sm text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
