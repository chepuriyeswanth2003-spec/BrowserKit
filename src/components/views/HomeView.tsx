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
    'video-trimmer': <Video className="w-5 h-5 text-blue-600" />,
    'video-to-gif': <Film className="w-5 h-5 text-indigo-600" />,
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
    'pdf-ai-summarizer': <Sparkles className="w-5 h-5 text-amber-600" />,
    'pdf-translate': <Sparkles className="w-5 h-5 text-blue-600" />,
    'pdf-to-markdown': <Code className="w-5 h-5 text-slate-800" />,
    'zip-archiver': <Archive className="w-5 h-5 text-amber-600" />,
    'zip-extractor': <FolderArchive className="w-5 h-5 text-amber-600" />,
    'zip-password-remover': <Unlock className="w-5 h-5 text-rose-600" />,
    'audio-tools': <Music className="w-5 h-5 text-purple-600" />,
    'svg-optimizer': <Code className="w-5 h-5 text-indigo-600" />,
    'file-encryptor': <Lock className="w-5 h-5 text-emerald-600" />,
  };

  const allTools = Object.values(TOOL_METADATA);

  // Curated Most Used Tools
  const mostUsedToolIds: ToolType[] = [
    'pdf-merger',
    'pdf-compressor',
    'passport-photo-maker',
    'target-kb-compressor',
    'converter',
    'pdf-password-remover',
  ];

  const mostUsedTools = mostUsedToolIds
    .map((id) => TOOL_METADATA[id])
    .filter(Boolean);

  const suites = [
    {
      id: 'pdf-tools' as ActivePage,
      title: 'PDF Tools Suite',
      subtitle: 'Merge, Split, Compress, Sign, Protect, Edit & OCR PDFs',
      count: allTools.filter((t) => t.category === 'pdf').length,
      icon: <FileText className="w-7 h-7 text-red-400" />,
      badge: '30+ PDF Tools',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    },
    {
      id: 'image-tools' as ActivePage,
      title: 'Image Tools Suite',
      subtitle: 'Compress KB, Passport Photos, HEIC to JPG & Signatures',
      count: allTools.filter((t) => t.category === 'image').length,
      icon: <Crop className="w-7 h-7 text-emerald-400" />,
      badge: '19 Image Tools',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'video-tools' as ActivePage,
      title: 'Video & Audio Suite',
      subtitle: 'Video Trimmer, Frame Snapshot Extractor & Audio Tools',
      count: allTools.filter((t) => t.category === 'video' || t.category === 'audio').length,
      icon: <Video className="w-7 h-7 text-blue-400" />,
      badge: '3 Media Tools',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
    {
      id: 'zip-tools' as ActivePage,
      title: 'Archive & Vault Suite',
      subtitle: 'ZIP Archiver, Extractor, Unlock ZIP & AES-256 Vault',
      count: allTools.filter((t) => t.category === 'zip').length,
      icon: <Archive className="w-7 h-7 text-amber-400" />,
      badge: '4 Vault Tools',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Prominent Selectable Tool Suite Selection Header & Grid */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title & Explicit Clickable Instruction */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold animate-pulse">
              <MousePointerClick className="w-4 h-4 text-emerald-400" /> SELECTABLE CATEGORIES BELOW — CLICK TO OPEN SUITE
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            BrowserKit <span className="text-emerald-400">Studio</span>. High-Speed Local Media Suite.
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Click any suite category card below to open its dedicated full-page workspace. 100% browser execution with zero server uploads.
          </p>
        </div>

        {/* Large Prominent Clickable Suite Cards (2x2 Grid) */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {suites.map((suite) => (
            <button
              key={suite.id}
              onClick={() => setActivePage(suite.id)}
              className="group relative p-6 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-emerald-400 hover:ring-4 hover:ring-emerald-500/20 text-left transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                    {suite.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${suite.badgeBg}`}>
                    {suite.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                    {suite.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {suite.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                <span>Select & Open Suite</span>
                <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Most Used Tools Grid */}
      <section className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Most Used Tools</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Quick 1-click access to top tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mostUsedTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => setActivePage(tool.id)}
              className="group p-5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl border border-slate-200/80 hover:border-slate-900 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white group-hover:bg-slate-800 transition-colors shadow-xs">
                    {toolIcons[tool.id]}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white group-hover:bg-slate-800 text-slate-600 group-hover:text-emerald-400 border border-slate-200 group-hover:border-slate-700">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 group-hover:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {tool.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200/60 group-hover:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-emerald-400">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular SEO Programmatic Routes Section */}
      <section className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Popular Quick Utility Routes</h2>
          <span className="text-xs text-slate-500">1-click format targets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROGRAMMATIC_ROUTES.slice(0, 6).map((route) => (
            <button
              key={route.slug}
              onClick={() => {
                if (onNavigateRoute) onNavigateRoute(route.slug);
              }}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  {route.h1}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
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
