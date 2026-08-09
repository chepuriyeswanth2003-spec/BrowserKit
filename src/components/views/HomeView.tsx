import React, { useState } from 'react';
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
  Search,
  CheckCircle2,
  CheckCircle,
  Eye,
  Filter,
  Wrench,
  Image,
  Layers,
  ChevronRight,
  UserCheck,
  Calendar,
  PenTool,
  RotateCw,
  SlidersHorizontal
} from 'lucide-react';
import { ActivePage, ToolType, ToolCategory } from '../../types';
import { TOOL_METADATA } from '../../lib/seoData';
import { PROGRAMMATIC_ROUTES } from '../../data/toolsData';
import { PrivacyBadge } from '../PrivacyBadge';

interface HomeViewProps {
  setActivePage: (page: ActivePage) => void;
  onNavigateRoute?: (slug: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActivePage, onNavigateRoute }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all' | 'none'>('pdf');
  const [searchFilter, setSearchFilter] = useState('');

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
    'merge-photo-signature': <Layers className="w-5 h-5 text-amber-600" />,
    'join-images': <FilePlus className="w-5 h-5 text-indigo-600" />,
    'image-watermark': <FileText className="w-5 h-5 text-rose-600" />,
    'image-rotate-flip': <RotateCw className="w-5 h-5 text-sky-600" />,
    'image-effects': <Eye className="w-5 h-5 text-purple-600" />,
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
    'pdf-to-jpg': <Image className="w-5 h-5 text-rose-600" />,
    'pdf-to-word': <FileText className="w-5 h-5 text-blue-600" />,
    'pdf-to-ppt': <FileText className="w-5 h-5 text-amber-600" />,
    'pdf-to-excel': <FileText className="w-5 h-5 text-emerald-600" />,
    'word-to-pdf': <FilePlus className="w-5 h-5 text-blue-600" />,
    'ppt-to-pdf': <FilePlus className="w-5 h-5 text-amber-600" />,
    'excel-to-pdf': <FilePlus className="w-5 h-5 text-emerald-600" />,
    'html-to-pdf': <Code className="w-5 h-5 text-cyan-600" />,
    'pdf-editor': <Wrench className="w-5 h-5 text-purple-600" />,
    'pdf-signer': <FileText className="w-5 h-5 text-indigo-600" />,
    'pdf-watermark': <FileText className="w-5 h-5 text-rose-600" />,
    'pdf-rotator': <RefreshCw className="w-5 h-5 text-sky-600" />,
    'pdf-organizer': <Layers className="w-5 h-5 text-indigo-600" />,
    'pdf-to-pdfa': <CheckCircle className="w-5 h-5 text-teal-600" />,
    'pdf-repair': <Sparkles className="w-5 h-5 text-amber-600" />,
    'pdf-page-numbers': <FileText className="w-5 h-5 text-blue-600" />,
    'pdf-ocr': <Search className="w-5 h-5 text-purple-600" />,
    'pdf-compare': <Eye className="w-5 h-5 text-indigo-600" />,
    'pdf-redact': <Lock className="w-5 h-5 text-rose-600" />,
    'pdf-cropper': <Crop className="w-5 h-5 text-emerald-600" />,
    'pdf-forms': <CheckCircle className="w-5 h-5 text-cyan-600" />,
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

  const filteredTools = allTools.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'video' ? (tool.category === 'video' || tool.category === 'audio') : tool.category === selectedCategory);
    const matchesSearch =
      searchFilter.trim() === '' ||
      tool.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const suites = [
    {
      id: 'pdf' as ToolCategory,
      title: 'PDF Tools Suite',
      subtitle: 'Merge, Split, Compress, Convert, Sign, Protect, Edit & OCR PDFs',
      count: allTools.filter((t) => t.category === 'pdf').length,
      icon: <FileText className="w-7 h-7 text-red-600" />,
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      id: 'image' as ToolCategory,
      title: 'Image Tools Suite',
      subtitle: 'Compress Under 100KB, Convert HEIC, Resize, Eyedropper & Meme Studio',
      count: allTools.filter((t) => t.category === 'image').length,
      icon: <Image className="w-7 h-7 text-emerald-600" />,
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'video' as ToolCategory,
      title: 'Video & Audio Suite',
      subtitle: 'Trim Videos, Extract Audio Tracks, Frame Snapshots & Audio Converter',
      count: allTools.filter((t) => t.category === 'video' || t.category === 'audio').length,
      icon: <Video className="w-7 h-7 text-blue-600" />,
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'zip' as ToolCategory,
      title: 'Archive & Vault Suite',
      subtitle: 'ZIP Archiver, Extractor, ZIP Password Remover & AES-256 Vault Encryption',
      count: allTools.filter((t) => t.category === 'zip').length,
      icon: <Archive className="w-7 h-7 text-amber-600" />,
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" /> BrowserKit Studio • 100% Private Web Utilities
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            BrowserKit <span className="text-emerald-400">Studio</span>. <br />
            Select Your Tool Suite Below.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Select your target suite below to launch PDF tools, image compressors, video editors, or security vaults. 100% browser execution with zero cloud uploads.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> WebAssembly & HTML5 Native
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Free Exports
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No Account Required
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Category Suite Selection Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Select Tool Category</h2>
            <p className="text-xs text-slate-500 font-medium">Click any suite category to view and launch tools</p>
          </div>
          <PrivacyBadge />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {suites.map((suite) => {
            return (
              <div
                key={suite.id}
                onClick={() => {
                  const targetPage = `${suite.id}-tools` as ActivePage;
                  setActivePage(targetPage);
                }}
                className="p-6 rounded-3xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-900 text-slate-900 hover:text-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex items-start justify-between gap-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-100 group-hover:bg-slate-800 transition-colors">
                      {suite.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-white transition-colors">
                        {suite.title}
                      </h3>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border mt-0.5 ${suite.badgeBg}`}>
                        {suite.count} Tools Available
                      </span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500 group-hover:text-slate-300 transition-colors">
                    {suite.subtitle}
                  </p>
                </div>
                <div className="p-2 rounded-xl shrink-0 mt-2 bg-slate-100 group-hover:bg-emerald-500 text-slate-600 group-hover:text-slate-900 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tool Filter Bar & Grid */}
      {selectedCategory !== 'none' && (
        <section className="space-y-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Filter className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedCategory === 'all' ? 'All Platform Tools' : suites.find(s => s.id === selectedCategory)?.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Showing {filteredTools.length} selected tools
                </p>
              </div>
            </div>

            {/* Inline Filter Search Input */}
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search in selected suite..."
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Show All ({allTools.length})
              </button>
            </div>
          </div>

          {/* Selected Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => setActivePage(tool.id)}
                  className="group relative p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        {toolIcons[tool.id]}
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {tool.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {tool.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">No tools match "{searchFilter}"</p>
                <button
                  onClick={() => setSearchFilter('')}
                  className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Popular SEO Programmatic Routes Section */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Popular Quick Tool Utilities</h2>
            <p className="text-xs text-slate-500">Direct 1-click access to specialized target file conversions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROGRAMMATIC_ROUTES.map((route) => (
            <button
              key={route.slug}
              onClick={() => {
                if (onNavigateRoute) onNavigateRoute(route.slug);
              }}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-colors flex items-center justify-between group cursor-pointer"
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
