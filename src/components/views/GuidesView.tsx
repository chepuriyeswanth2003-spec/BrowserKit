import React from 'react';
import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { ActivePage, ToolType } from '../../types';

interface GuidesViewProps {
  setActivePage: (page: ActivePage) => void;
}

export const GuidesView: React.FC<GuidesViewProps> = ({ setActivePage }) => {
  const guides = [
    {
      id: 'compress-guide',
      title: 'How to Compress Images & Photos Without Quality Loss',
      summary: 'Learn how WebP, PNG, and JPEG quantizers compress files by up to 90% while maintaining crisp visual fidelity.',
      readTime: '4 min read',
      toolTarget: 'compressor' as ToolType,
      content: [
        'Image compression reduces redundant color space data and applies psycho-visual quantization.',
        'Converting JPEGs to WebP or AVIF reduces file sizes by 30-50% with identical pixel fidelity.',
        'Target size compression (e.g., under 100 KB) is ideal for online portal submissions and email attachments.',
      ],
    },
    {
      id: 'pdf-merge-guide',
      title: 'How to Merge PDF Documents 100% Privately',
      summary: 'Combine contracts, invoices, and receipts into a single PDF without sending confidential records to cloud servers.',
      readTime: '3 min read',
      toolTarget: 'pdf-merger' as ToolType,
      content: [
        'Client-side pdf-lib parses PDF page trees directly inside browser memory.',
        'Rearrange page order and combine multiple PDFs securely with zero upload risk.',
        'Completely safe for confidential financial statements, identity scans, and medical files.',
      ],
    },
    {
      id: 'video-trim-guide',
      title: 'Trimming & Muting Videos in Browser HTML5 Canvas',
      summary: 'Trim unwanted video intros or strip background audio tracks for social media without re-encoding delays.',
      readTime: '3 min read',
      toolTarget: 'video-trimmer' as ToolType,
      content: [
        'HTML5 Video DOM APIs allow frame-accurate start and end playback clipping.',
        'Muting audio streams removes background noise before uploading videos to social feeds.',
        'Works offline directly in Chrome, Safari, Firefox, and Edge browsers.',
      ],
    },
    {
      id: 'zip-extract-guide',
      title: 'Inspecting and Extracting .ZIP Archives Without Software',
      summary: 'View archive contents, preview file lists, and extract individual files from .zip archives instantly.',
      readTime: '2 min read',
      toolTarget: 'zip-extractor' as ToolType,
      content: [
        'JSZip decompresses deflate chunks directly in client-side RAM memory.',
        'Extract single items without downloading bulky full archives.',
        'Create compressed .zip bundles to email multiple documents at once.',
      ],
    },
  ];

  return (
    <div className="w-full space-y-10 animate-fade-in max-w-4xl mx-auto">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> SEO Guides & Media Optimization
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          BrowserKit Tutorials
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Master web media formats, browser-side PDF processing, video editing, and archive workflows.
        </p>
      </div>

      <div className="space-y-8">
        {guides.map((guide) => (
          <article
            key={guide.id}
            className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{guide.readTime}</span>
              <span className="text-emerald-500 font-bold uppercase tracking-wider">100% Client-Side</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {guide.title}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {guide.summary}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {guide.content.map((point, idx) => (
                <p
                  key={idx}
                  className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed font-mono"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </p>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setActivePage(guide.toolTarget)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-xs flex items-center gap-2 transition-all active:scale-95"
              >
                Launch Utility <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
