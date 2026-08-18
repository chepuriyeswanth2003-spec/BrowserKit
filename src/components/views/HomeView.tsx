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
  Info,
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
    compressor: <Minimize2 className="w-5 h-5 text-[#2f7a4f]" />,
    converter: <RefreshCw className="w-5 h-5 text-[#2d5da1]" />,
    resizer: <Crop className="w-5 h-5 text-[#6b4fa0]" />,
    palette: <Palette className="w-5 h-5 text-[#b8860b]" />,
    meme: <Smile className="w-5 h-5 text-[#ff4d4d]" />,
    'passport-photo-maker': <UserCheck className="w-5 h-5 text-[#2f7a4f]" />,
    'add-name-and-dob': <Calendar className="w-5 h-5 text-[#2d5da1]" />,
    'signature-resizer': <PenTool className="w-5 h-5 text-[#2d5da1]" />,
    'image-dpi-converter': <SlidersHorizontal className="w-5 h-5 text-[#6b4fa0]" />,
    'circle-crop': <Crop className="w-5 h-5 text-[#2f7a4f]" />,
    'merge-photo-signature': <FileText className="w-5 h-5 text-[#b8860b]" />,
    'join-images': <FilePlus className="w-5 h-5 text-[#2d5da1]" />,
    'image-watermark': <FileText className="w-5 h-5 text-[#ff4d4d]" />,
    'image-rotate-flip': <RotateCw className="w-5 h-5 text-[#2d5da1]" />,
    'image-effects': <Sparkles className="w-5 h-5 text-[#6b4fa0]" />,
    'official-size-resizer': <UserCheck className="w-5 h-5 text-[#2f7a4f]" />,
    'social-media-resizer': <Crop className="w-5 h-5 text-[#2d5da1]" />,
    'target-kb-compressor': <Minimize2 className="w-5 h-5 text-[#2f7a4f]" />,
    'social-video-downloader': <Video className="w-5 h-5 text-[#2d5da1]" />,
    'social-audio-extractor': <Music className="w-5 h-5 text-[#6b4fa0]" />,
    'social-batch-downloader': <Layers className="w-5 h-5 text-[#b8860b]" />,
    'thumbnail-grabber': <FileText className="w-5 h-5 text-[#ff4d4d]" />,
    'video-to-audio': <Music className="w-5 h-5 text-[#6b4fa0]" />,
    'video-format-swapper': <RefreshCw className="w-5 h-5 text-[#2d5da1]" />,
    'gif-maker': <Sparkles className="w-5 h-5 text-[#b8860b]" />,
    'video-codec-transcoder': <Code className="w-5 h-5 text-teal-600" />,
    'video-trimmer': <Video className="w-5 h-5 text-[#2d5da1]" />,
    'video-to-gif': <Film className="w-5 h-5 text-[#2d5da1]" />,
    'audio-cutter': <Scissors className="w-5 h-5 text-[#ff4d4d]" />,
    'aspect-ratio-resizer': <Crop className="w-5 h-5 text-[#2f7a4f]" />,
    'pdf-merger': <FileText className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-splitter': <Scissors className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-compressor': <Minimize2 className="w-5 h-5 text-[#2f7a4f]" />,
    'pdf-password-remover': <Unlock className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-protector': <Lock className="w-5 h-5 text-[#2f7a4f]" />,
    'images-to-pdf': <FilePlus className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-to-jpg': <FileText className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-to-word': <FileText className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-to-ppt': <FileText className="w-5 h-5 text-[#b8860b]" />,
    'pdf-to-excel': <FileText className="w-5 h-5 text-[#2f7a4f]" />,
    'word-to-pdf': <FilePlus className="w-5 h-5 text-[#2d5da1]" />,
    'ppt-to-pdf': <FilePlus className="w-5 h-5 text-[#b8860b]" />,
    'excel-to-pdf': <FilePlus className="w-5 h-5 text-[#2f7a4f]" />,
    'html-to-pdf': <Code className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-editor': <FileText className="w-5 h-5 text-[#6b4fa0]" />,
    'pdf-signer': <PenTool className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-metadata': <Info className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-watermark': <FileText className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-rotator': <RotateCw className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-organizer': <FileText className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-to-pdfa': <CheckCircle2 className="w-5 h-5 text-teal-600" />,
    'pdf-repair': <Sparkles className="w-5 h-5 text-[#b8860b]" />,
    'pdf-page-numbers': <FileText className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-ocr': <Sparkles className="w-5 h-5 text-[#6b4fa0]" />,
    'pdf-compare': <FileText className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-redact': <Lock className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-cropper': <Crop className="w-5 h-5 text-[#2f7a4f]" />,
    'pdf-forms': <CheckCircle2 className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-to-markdown': <Code className="w-5 h-5 text-[#2d2d2d]/[0.92]" />,
    'zip-archiver': <Archive className="w-5 h-5 text-[#b8860b]" />,
    'zip-extractor': <FolderArchive className="w-5 h-5 text-[#b8860b]" />,
    'zip-password-remover': <Unlock className="w-5 h-5 text-[#ff4d4d]" />,
    'audio-tools': <Music className="w-5 h-5 text-[#6b4fa0]" />,
    'svg-optimizer': <Code className="w-5 h-5 text-[#2d5da1]" />,
    'file-encryptor': <Lock className="w-5 h-5 text-[#2f7a4f]" />,
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
      icon: <FileText className="w-5 h-5 text-[#ff4d4d] group-hover:text-white transition-colors" />,
      iconBox: 'bg-[#ff4d4d] border border-[#ff4d4d]/80 group-hover:bg-white/10 group-hover:border-white/20',
      badgeBg: 'bg-[#ff4d4d]/60 text-[#ff4d4d] border border-[#ff4d4d]/80 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30',
      btnBg: 'bg-[#2d2d2d] text-white group-hover:bg-white group-hover:text-[#2d2d2d]',
      btnText: 'Open PDF Tools →',
    },
    {
      id: 'image-tools' as ActivePage,
      title: 'Image Tools Suite',
      subtitle: 'Compress KB, Passports & HEIC to JPG',
      count: allTools.filter((t) => t.category === 'image').length,
      icon: <Crop className="w-5 h-5 text-[#2f7a4f] group-hover:text-white transition-colors" />,
      iconBox: 'bg-[#2f7a4f] border border-[#2f7a4f]/80 group-hover:bg-white/10 group-hover:border-white/20',
      badgeBg: 'bg-[#2f7a4f]/60 text-[#2f7a4f] border border-[#2f7a4f]/80 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30',
      btnBg: 'bg-[#2d2d2d] text-white group-hover:bg-white group-hover:text-[#2d2d2d]',
      btnText: 'Open Image Tools →',
    },
    {
      id: 'video-tools' as ActivePage,
      title: 'Video & Audio Suite',
      subtitle: 'Extract video frames and WAV audio',
      count: allTools.filter((t) => t.category === 'video' || t.category === 'audio').length,
      icon: <Video className="w-5 h-5 text-[#2d5da1] group-hover:text-white transition-colors" />,
      iconBox: 'bg-[#2d5da1] border border-[#2d5da1]/80 group-hover:bg-white/10 group-hover:border-white/20',
      badgeBg: 'bg-[#2d5da1]/60 text-[#2d5da1] border border-[#2d5da1]/80 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30',
      btnBg: 'bg-[#2d2d2d] text-white group-hover:bg-white group-hover:text-[#2d2d2d]',
      btnText: 'Open Media Tools →',
    },
    {
      id: 'zip-tools' as ActivePage,
      title: 'Archive & Vault Suite',
      subtitle: 'ZIP Archiver, Unlock ZIP & AES Vault',
      count: allTools.filter((t) => t.category === 'zip').length,
      icon: <Archive className="w-5 h-5 text-[#b8860b] group-hover:text-white transition-colors" />,
      iconBox: 'bg-[#b8860b] border border-[#b8860b]/80 group-hover:bg-white/10 group-hover:border-white/20',
      badgeBg: 'bg-[#b8860b]/60 text-[#b8860b] border border-[#b8860b]/80 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30',
      btnBg: 'bg-[#2d2d2d] text-white group-hover:bg-white group-hover:text-[#2d2d2d]',
      btnText: 'Open Vault Tools →',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero & Horizontal 4-Column Tool Suite Selection Grid */}
      <section className="bg-white dark:bg-[#332e29] p-6 sm:p-7 wobbly-md border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-5">
        {/* Title Header */}
        <div className="space-y-2 border-b border-[#2d2d2d]/[0.15] dark:border-[#f3ede2] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 wobbly-pill bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d]/[0.92] dark:text-[#f3ede2]/[0.55] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] text-xs font-mono font-bold">
              <span className="w-2 h-2 wobbly-pill bg-[#2f7a4f] animate-pulse" />
              SELECTABLE CATEGORY SUITES BELOW
            </span>
            <span className="text-xs font-mono text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] font-semibold">100% Private Local Browser Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2d2d2d] dark:text-white tracking-tight">
            BrowserKit <span className="text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">Studio</span>. Select Tool Suite Below.
          </h1>
          <p className="text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] text-xs sm:text-sm leading-relaxed font-medium">
            Click any suite button below to open its full workspace. Zero cloud uploads.
          </p>
        </div>

        {/* Horizontal Single-Row 4-Column Sleek Clickable Suite Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suites.map((suite) => (
            <button
              key={suite.id}
              onClick={() => setActivePage(suite.id)}
              className="group p-5 wobbly-md bg-[#fdfbf7]/80 dark:bg-[#332e29]/80 hover:bg-[#2d2d2d] dark:hover:bg-[#262220] text-[#2d2d2d] dark:text-white hover:text-white border border-[2px] border-[#2d2d2d]/[0.3]/90 dark:border-[#f3ede2] hover:border-[#2d2d2d] transition-all duration-200 cursor-pointer shadow-hand-sm hover:shadow-hand-lg hover:-translate-y-0.5 text-left flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 wobbly-sm ${suite.iconBox} transition-colors shadow-hand-sm`}>
                    {suite.icon}
                  </div>
                  <span className={`px-2.5 py-0.5 wobbly-pill text-[10px] font-mono font-bold ${suite.badgeBg} transition-colors`}>
                    {suite.count} Tools
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-[#2d2d2d] dark:text-white group-hover:text-white transition-colors">
                    {suite.title}
                  </h2>
                  <p className="text-xs text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] group-hover:text-[#2d2d2d]/[0.7] mt-1 line-clamp-2 leading-relaxed font-medium transition-colors">
                    {suite.subtitle}
                  </p>
                </div>
              </div>

              {/* High-Contrast Interactive CTA Button */}
              <div className={`w-full py-2.5 px-3 wobbly-sm ${suite.btnBg} text-xs font-extrabold text-center shadow-hand-sm flex items-center justify-center gap-1.5 transition-all group-hover:shadow-hand`}>
                <span>{suite.btnText}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Display Ad Slot between Category Suite Filter and Most Used Tools (Mobile & Desktop) */}
      <AdSlot type="in-flow" />

      {/* Most Used Tools Grid */}
      <section className="space-y-4 bg-white dark:bg-[#332e29] p-6 wobbly-md border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#b8860b] fill-amber-500" />
            <h2 className="text-lg font-bold text-[#2d2d2d] dark:text-white">Most Used Tools</h2>
          </div>
          <span className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] font-medium">Quick 1-click access to top tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mostUsedTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => setActivePage(tool.id)}
              className="group p-5 bg-[#fdfbf7] dark:bg-[#332e29] hover:bg-[#2d2d2d] dark:hover:bg-[#262220] text-[#2d2d2d] dark:text-white hover:text-white wobbly-md border border-[2px] border-[#2d2d2d]/[0.3]/80 dark:border-[#f3ede2] hover:border-[#2d2d2d] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 wobbly-sm bg-white dark:bg-[#332e29] group-hover:bg-[#2d2d2d] transition-colors shadow-hand-sm">
                    {toolIcons[tool.id]}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 wobbly-pill bg-white dark:bg-[#332e29] group-hover:bg-[#2d2d2d] text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] group-hover:text-[#2f7a4f] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] group-hover:border-[#2d2d2d]">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] group-hover:text-[#2d2d2d]/[0.7] mt-1 line-clamp-2 leading-relaxed">
                    {tool.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#2d2d2d]/[0.3]/60 dark:border-[#f3ede2] group-hover:border-[#2d2d2d] flex items-center justify-between text-xs font-semibold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] group-hover:text-[#2f7a4f]">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 text-[#2d2d2d]/[0.7] group-hover:text-[#2f7a4f] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular SEO Programmatic Routes Section */}
      <section className="bg-white dark:bg-[#332e29] p-6 sm:p-7 wobbly-md border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2d2d2d] dark:text-white">Popular Quick Utility Routes</h2>
          <span className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]">1-click format targets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROGRAMMATIC_ROUTES.filter((route) => PUBLIC_PROGRAMMATIC_SLUGS.has(route.slug)).slice(0, 6).map((route) => (
            <button
              key={route.slug}
              onClick={() => {
                if (onNavigateRoute) onNavigateRoute(route.slug);
              }}
              className="p-3 wobbly-sm bg-[#fdfbf7] dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] hover:border-[#2d2d2d]/[0.4] dark:hover:border-[#2d2d2d]/[0.5] text-left transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-[#2d2d2d] dark:text-white group-hover:text-[#2f7a4f] dark:group-hover:text-[#2f7a4f]">
                  {route.h1}
                </div>
                <div className="text-[10px] font-mono text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] mt-0.5">
                  {route.sourceFormat} → {route.targetFormat}
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#2d2d2d]/[0.7] group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
