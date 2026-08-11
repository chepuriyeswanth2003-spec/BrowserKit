import React from 'react';
import {
  Minimize2,
  Scissors,
  RefreshCw,
  Crop,
  Palette,
  Smile,
  Video,
  Film,
  FileText,
  FilePlus,
  Archive,
  FolderArchive,
  Music,
  Code,
  Lock,
  Unlock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Calendar,
  PenTool,
  RotateCw,
  SlidersHorizontal,
  ChevronRight,
  Star,
  CheckCircle2,
  MousePointerClick,
  Layers,
} from 'lucide-react';
import { ActivePage, ToolType, ToolCategory } from '../../types';
import { TOOL_METADATA } from '../../lib/seoData';
import { PROGRAMMATIC_ROUTES } from '../../data/toolsData';
import { isPublicTool, PUBLIC_PROGRAMMATIC_SLUGS } from '../../lib/publicTools';
import { AdSlot } from '../AdSlot';

interface HomeViewProps {
  setActivePage: (page: ActivePage) => void;
  onNavigateRoute?: (slug: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActivePage, onNavigateRoute }) => {
  const toolIcons: Record<ToolType, React.ReactNode> = {
    compressor: <Minimize2 className="w-5 h-5 text-emerald-600" />,
    converter: <RefreshCw className="w-5 h-5 text-blue-600" />,
    resizer: <Crop className="w-5 h-5 text-purple-600" />,
    palette: <Palette className="w-5 h-5 text-amber-600" />,
    meme: <Smile className="w-5 h-5 text-rose-600" />,
    'passport-photo-maker': <UserCheck className="w-5 h-5 text-emerald-600" />,
    'add-name-and-dob': <Calendar className="w-5 h-5 text-blue-600" />,
    'signature-resizer': <PenTool className="w-5 h-5 text-indigo-600" />,
    'image-dpi-converter': <SlidersHorizontal className="w-5 h-5 text-purple-600" />,
    'circle-crop': <Crop className="w-5 h-5 text-emerald-600" />,
    'merge-photo-signature': <FileText className="w-5 h-5 text-amber-600" />,
    'join-images': <FilePlus className="w-5 h-5 text-indigo-600" />,
    'image-watermark': <FileText className="w-5 h-5 text-rose-600" />,
    'image-rotate-flip': <RotateCw className="w-5 h-5 text-sky-600" />,
    'image-effects': <Sparkles className="w-5 h-5 text-purple-600" />,
    'official-size-resizer': <UserCheck className="w-5 h-5 text-emerald-600" />,
    'social-media-resizer': <Crop className="w-5 h-5 text-blue-600" />,
    'target-kb-compressor': <Minimize2 className="w-5 h-5 text-emerald-600" />,
    'social-video-downloader': <Video className="w-5 h-5 text-blue-600" />,
    'social-audio-extractor': <Music className="w-5 h-5 text-purple-600" />,
    'social-batch-downloader': <Layers className="w-5 h-5 text-amber-600" />,
    'thumbnail-grabber': <FileText className="w-5 h-5 text-rose-600" />,
    'video-to-audio': <Music className="w-5 h-5 text-purple-600" />,
    'video-format-swapper': <RefreshCw className="w-5 h-5 text-indigo-600" />,
    'gif-maker': <Sparkles className="w-5 h-5 text-amber-600" />,
    'video-codec-transcoder': <Code className="w-5 h-5 text-teal-600" />,
    'video-trimmer': <Video className="w-5 h-5 text-blue-600" />,
    'video-to-gif': <Film className="w-5 h-5 text-indigo-600" />,
    'audio-cutter': <Scissors className="w-5 h-5 text-rose-600" />,
    'aspect-ratio-resizer': <Crop className="w-5 h-5 text-emerald-600" />,
    'pdf-merger': <FileText className="w-5 h-5 text-red-600" />,
    'pdf-splitter': <Scissors className="w-5 h-5 text-red-600" />,
    'pdf-compressor': <Minimize2 className="w-5 h-5 text-emerald-600" />,
    'pdf-password-remover': <Unlock className="w-5 h-5 text-rose-600" />,
    'pdf-protector': <Lock className="w-5 h-5 text-emerald-600" />,
    'images-to-pdf': <FilePlus className="w-5 h-5 text-red-600" />,
    'pdf-to-jpg': <FileText className="w-5 h-5 text-rose-600" />,
    'pdf-to-word': <FileText className="w-5 h-5 text-blue-600" />,
    'pdf-to-ppt': <FileText className="w-5 h-5 text-amber-600" />,
    'pdf-to-excel': <FileText className="w-5 h-5 text-emerald-600" />,
    'word-to-pdf': <FilePlus className="w-5 h-5 text-blue-600" />,
    'ppt-to-pdf': <FilePlus className="w-5 h-5 text-amber-600" />,
    'excel-to-pdf': <FilePlus className="w-5 h-5 text-emerald-600" />,
    'html-to-pdf': <Code className="w-5 h-5 text-cyan-600" />,
    'pdf-editor': <FileText className="w-5 h-5 text-purple-600" />,
    'pdf-signer': <PenTool className="w-5 h-5 text-indigo-600" />,
    'pdf-watermark': <FileText className="w-5 h-5 text-rose-600" />,
    'pdf-rotator': <RotateCw className="w-5 h-5 text-sky-600" />,
    'pdf-organizer': <FileText className="w-5 h-5 text-indigo-600" />,
    'pdf-to-pdfa': <CheckCircle2 className="w-5 h-5 text-teal-600" />,
    'pdf-repair': <Sparkles className="w-5 h-5 text-amber-600" />,
    'pdf-page-numbers': <FileText className="w-5 h-5 text-blue-600" />,
    'pdf-ocr': <Sparkles className="w-5 h-5 text-purple-600" />,
    'pdf-compare': <FileText className="w-5 h-5 text-indigo-600" />,
    'pdf-redact': <Lock className="w-5 h-5 text-rose-600" />,
    'pdf-cropper': <Crop className="w-5 h-5 text-emerald-600" />,
    'pdf-forms': <CheckCircle2 className="w-5 h-5 text-cyan-600" />,
    'pdf-to-markdown': <Code className="w-5 h-5 text-slate-800" />,
    'zip-archiver': <Archive className="w-5 h-5 text-amber-600" />,
    'zip-extractor': <FolderArchive className="w-5 h-5 text-amber-600" />,
    'zip-password-remover': <Unlock className="w-5 h-5 text-rose-600" />,
    'audio-tools': <Music className="w-5 h-5 text-purple-600" />,
    'svg-optimizer': <Code className="w-5 h-5 text-indigo-600" />,
    'file-encryptor': <Lock className="w-5 h-5 text-emerald-600" />,
  };

  const allTools = Object.values(TOOL_METADATA).filter((tool) => isPublicTool(tool.id));

  // Curated Most Used Tools
  const mostUsedToolIds: ToolType[] = [
    'pdf-merger',
    'passport-photo-maker',
    'target-kb-compressor',
    'converter',
  ];

  const mostUsedTools = mostUsedToolIds
    .map((id) => TOOL_METADATA[id])
    .filter(Boolean);

  const suites = [
    {
      id: 'pdf-tools' as ActivePage,
      title: 'PDF Tools Suite',
      subtitle: 'Merge, split and create PDFs privately',
      count: allTools.filter((t) => t.category === 'pdf').length,
      icon: <FileText className="w-5 h-5 text-rose-600 group-hover:text-white transition-colors" />,
      iconBox: 'bg-rose-50 border border-rose-200/80 group-hover:bg-white/10 group-hover:border-white/20',
      badgeBg: 'bg-rose-100/60 text-rose-800 border border-rose-200/80 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30',
      btnBg: 'bg-slate-900 text-white group-hover:bg-white group-hover:text-slate-900',
      btnText: 'Open PDF Tools →',
    },
    {
      id: 'image-tools' as ActivePage,
      title: 'Image Tools Suite',
      subtitle: 'Compress KB, Passports & HEIC to JPG',
      count: allTools.filter((t) => t.category === 'image').length,
      icon: <Crop className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />,
      iconBox: 'bg-emerald-50 border border-emerald-200/80 group-hover:bg-white/10 group-hover:border-white/20',
      badgeBg: 'bg-emerald-100/60 text-emerald-800 border border-emerald-200/80 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30',
      btnBg: 'bg-slate-900 text-white group-hover:bg-white group-hover:text-slate-900',
      btnText: 'Open Image Tools →',
    },
    {
      id: 'video-tools' as ActivePage,
      title: 'Video & Audio Suite',
      subtitle: 'Extract video frames and WAV audio',
      count: allTools.filter((t) => t.category === 'video' || t.category === 'audio').length,
      icon: <Video className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />,
      iconBox: 'bg-indigo-50 border border-indigo-200/80 group-hover:bg-white/10 group-hover:border-white/20',
      badgeBg: 'bg-indigo-100/60 text-indigo-800 border border-indigo-200/80 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30',
      btnBg: 'bg-slate-900 text-white group-hover:bg-white group-hover:text-slate-900',
      btnText: 'Open Media Tools →',
    },
    {
      id: 'zip-tools' as ActivePage,
      title: 'Archive & Vault Suite',
      subtitle: 'ZIP Archiver, Unlock ZIP & AES Vault',
      count: allTools.filter((t) => t.category === 'zip').length,
      icon: <Archive className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />,
      iconBox: 'bg-amber-50 border border-amber-200/80 group-hover:bg-white/10 group-hover:border-white/20',
      badgeBg: 'bg-amber-100/60 text-amber-900 border border-amber-200/80 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30',
      btnBg: 'bg-slate-900 text-white group-hover:bg-white group-hover:text-slate-900',
      btnText: 'Open Vault Tools →',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero & Horizontal 4-Column Tool Suite Selection Grid */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        {/* Title Header */}
        <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SELECTABLE CATEGORY SUITES BELOW
            </span>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">100% Private Local Browser Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            BrowserKit <span className="text-slate-700 dark:text-slate-300">Studio</span>. Select Tool Suite Below.
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
            Click any suite button below to open its full workspace. Zero cloud uploads.
          </p>
        </div>

        {/* Horizontal Single-Row 4-Column Sleek Clickable Suite Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suites.map((suite) => (
            <button
              key={suite.id}
              onClick={() => setActivePage(suite.id)}
              className="group p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-900 dark:hover:bg-slate-950 text-slate-900 dark:text-white hover:text-white border border-slate-200/90 dark:border-slate-700 hover:border-slate-900 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-0.5 text-left flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${suite.iconBox} transition-colors shadow-xs`}>
                    {suite.icon}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${suite.badgeBg} transition-colors`}>
                    {suite.count} Tools
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-white transition-colors">
                    {suite.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-300 mt-1 line-clamp-2 leading-relaxed font-medium transition-colors">
                    {suite.subtitle}
                  </p>
                </div>
              </div>

              {/* High-Contrast Interactive CTA Button */}
              <div className={`w-full py-2.5 px-3 rounded-xl ${suite.btnBg} text-xs font-extrabold text-center shadow-xs flex items-center justify-center gap-1.5 transition-all group-hover:shadow-md`}>
                <span>{suite.btnText}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Display Ad Slot between Category Suite Filter and Most Used Tools (Mobile & Desktop) */}
      <AdSlot type="in-flow" />

      {/* Most Used Tools Grid */}
      <section className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Most Used Tools</h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick 1-click access to top tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mostUsedTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => setActivePage(tool.id)}
              className="group p-5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-950 text-slate-900 dark:text-white hover:text-white rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-slate-900 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 group-hover:bg-slate-800 transition-colors shadow-xs">
                    {toolIcons[tool.id]}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 group-hover:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-emerald-400 border border-slate-200 dark:border-slate-700 group-hover:border-slate-700">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {tool.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700 group-hover:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-400">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular SEO Programmatic Routes Section */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Popular Quick Utility Routes</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">1-click format targets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROGRAMMATIC_ROUTES.filter((route) => PUBLIC_PROGRAMMATIC_SLUGS.has(route.slug)).slice(0, 6).map((route) => (
            <button
              key={route.slug}
              onClick={() => {
                if (onNavigateRoute) onNavigateRoute(route.slug);
              }}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-left transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {route.h1}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  {route.sourceFormat} → {route.targetFormat}
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
