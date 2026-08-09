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
      subtitle: 'Merge, Split, Compress, Sign & OCR PDFs',
      count: allTools.filter((t) => t.category === 'pdf').length,
      icon: <FileText className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />,
      topBorder: 'border-t-4 border-t-red-500 hover:border-t-red-600',
      cardBg: 'bg-red-50/40 hover:bg-red-600 hover:text-white border-x border-b border-red-200/80',
      btnBg: 'bg-red-600 text-white group-hover:bg-white group-hover:text-red-700',
      btnText: 'Open 30+ PDF Tools →',
    },
    {
      id: 'image-tools' as ActivePage,
      title: 'Image Tools Suite',
      subtitle: 'Compress KB, Passports & HEIC to JPG',
      count: allTools.filter((t) => t.category === 'image').length,
      icon: <Crop className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />,
      topBorder: 'border-t-4 border-t-emerald-500 hover:border-t-emerald-600',
      cardBg: 'bg-emerald-50/40 hover:bg-emerald-600 hover:text-white border-x border-b border-emerald-200/80',
      btnBg: 'bg-emerald-600 text-white group-hover:bg-white group-hover:text-emerald-700',
      btnText: 'Open 19 Image Tools →',
    },
    {
      id: 'video-tools' as ActivePage,
      title: 'Video & Audio Suite',
      subtitle: 'Video Trimmer, Snapshots & Audio',
      count: allTools.filter((t) => t.category === 'video' || t.category === 'audio').length,
      icon: <Video className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />,
      topBorder: 'border-t-4 border-t-blue-500 hover:border-t-blue-600',
      cardBg: 'bg-blue-50/40 hover:bg-blue-600 hover:text-white border-x border-b border-blue-200/80',
      btnBg: 'bg-blue-600 text-white group-hover:bg-white group-hover:text-blue-700',
      btnText: 'Open 3 Media Tools →',
    },
    {
      id: 'zip-tools' as ActivePage,
      title: 'Archive & Vault Suite',
      subtitle: 'ZIP Archiver, Unlock ZIP & AES Vault',
      count: allTools.filter((t) => t.category === 'zip').length,
      icon: <Archive className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />,
      topBorder: 'border-t-4 border-t-amber-500 hover:border-t-amber-600',
      cardBg: 'bg-amber-50/40 hover:bg-amber-600 hover:text-white border-x border-b border-amber-200/80',
      btnBg: 'bg-amber-600 text-white group-hover:bg-white group-hover:text-amber-700',
      btnText: 'Open 4 Vault Tools →',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Clean White Hero & Horizontal 4-Column Tool Suite Selection Grid */}
      <section className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {/* Title Header */}
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-mono font-bold shadow-xs">
              <MousePointerClick className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> SELECT A CATEGORY BUTTON BELOW
            </span>
            <span className="text-xs font-mono text-slate-500 font-semibold">100% Private Local Browser Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            BrowserKit <span className="text-emerald-600">Studio</span>. Select Tool Suite Below.
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Click any suite button below to open its full workspace. Zero cloud uploads.
          </p>
        </div>

        {/* Horizontal Single-Row 4-Column Vibrant Clickable Suite Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suites.map((suite) => (
            <button
              key={suite.id}
              onClick={() => setActivePage(suite.id)}
              className={`group p-5 rounded-2xl ${suite.topBorder} ${suite.cardBg} transition-all cursor-pointer shadow-xs hover:shadow-xl hover:scale-[1.02] text-left flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white group-hover:bg-white/20 transition-colors shadow-xs">
                    {suite.icon}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-slate-800 border border-slate-200 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 transition-colors">
                    {suite.count} Tools
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-white transition-colors">
                    {suite.title}
                  </h3>
                  <p className="text-xs text-slate-600 group-hover:text-white/90 mt-1 line-clamp-2 leading-relaxed font-medium">
                    {suite.subtitle}
                  </p>
                </div>
              </div>

              {/* High-Contrast Interactive CTA Button */}
              <div className={`w-full py-2.5 px-3 rounded-xl ${suite.btnBg} text-xs font-extrabold text-center shadow-sm flex items-center justify-center gap-1.5 transition-all group-hover:shadow-md`}>
                <span>{suite.btnText}</span>
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
