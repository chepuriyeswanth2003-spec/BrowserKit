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
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { ActivePage, ToolType, ToolCategory } from '../../types';
import { TOOL_METADATA } from '../../lib/seoData';
import { PROGRAMMATIC_ROUTES } from '../../data/toolsData';
import { PrivacyBadge } from '../PrivacyBadge';
import { AdSlot } from '../AdSlot';

interface HomeViewProps {
  setActivePage: (page: ActivePage) => void;
  onNavigateRoute?: (slug: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActivePage, onNavigateRoute }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const toolIcons: Record<ToolType, React.ReactNode> = {
    compressor: <Minimize2 className="w-5 h-5" />,
    'bg-remover': <Scissors className="w-5 h-5" />,
    converter: <RefreshCw className="w-5 h-5" />,
    resizer: <Crop className="w-5 h-5" />,
    palette: <Palette className="w-5 h-5" />,
    meme: <Smile className="w-5 h-5" />,
    'video-trimmer': <Video className="w-5 h-5" />,
    'video-to-gif': <Film className="w-5 h-5" />,
    'pdf-merger': <FileText className="w-5 h-5" />,
    'pdf-splitter': <Scissors className="w-5 h-5" />,
    'images-to-pdf': <FilePlus className="w-5 h-5" />,
    'zip-archiver': <Archive className="w-5 h-5" />,
    'zip-extractor': <FolderArchive className="w-5 h-5" />,
    'audio-tools': <Music className="w-5 h-5" />,
    'svg-optimizer': <Code className="w-5 h-5" />,
    'file-encryptor': <Lock className="w-5 h-5" />,
  };

  const allTools = Object.values(TOOL_METADATA);

  const filteredTools = allTools.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      searchFilter.trim() === '' ||
      tool.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.seoKeyword.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" /> BrowserKit • 100% On-Device Engine
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          BROWSERKIT. <br />
          <span className="text-slate-500 dark:text-slate-400">
            PRIVATE CLIENT-SIDE UTILITIES.
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
          Compress images, convert formats, merge PDFs, remove backgrounds, trim video, and encrypt files directly inside your browser with zero server uploads.
        </p>

        <div className="pt-2">
          <PrivacyBadge compact />
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-6">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Tools ({allTools.length})
            </button>
            <button
              onClick={() => setSelectedCategory('image')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'image'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setSelectedCategory('video')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'video'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Video & Audio
            </button>
            <button
              onClick={() => setSelectedCategory('pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'pdf'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              PDFs
            </button>
            <button
              onClick={() => setSelectedCategory('zip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'zip'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ZIP Archives
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools & features..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Grid of Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => setActivePage(tool.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-900 dark:hover:border-white transition-all duration-200 group cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors">
                    {toolIcons[tool.id]}
                  </div>
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 group-hover:translate-x-1 transition-transform">
                <span>Launch Utility</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ad Unit Slot */}
      <AdSlot type="header-banner" />

      {/* Why BrowserKit Section */}
      <section className="p-8 md:p-10 bg-slate-900 text-white dark:bg-slate-900 rounded-2xl border border-slate-800 space-y-8 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Zero-Data-Transfer Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white">
            WHY THOUSANDS TRUST BROWSERKIT
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
            Traditional online converters upload your media to remote servers, exposing sensitive documents and personal photos. BrowserKit runs entirely in your local browser sandbox using WebAssembly, Canvas, and WebCrypto APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-800 text-white w-fit border border-slate-700">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide">100% On-Device Processing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Files never leave your local device storage. Complete privacy with zero cloud uploads.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-800 text-white w-fit border border-slate-700">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide">Instant & Unlimited</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No daily file caps, subscription walls, or account creation requirements.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-800 text-white w-fit border border-slate-700">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide">Structured Schema Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rich SoftwareApplication metadata for direct Google search snippet indexing.
            </p>
          </div>
        </div>
      </section>

      {/* Programmatic Long-Tail Search Intent Routes Grid */}
      <section className="space-y-4 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Programmatic SEO Routes
            </span>
            <h2 className="text-lg font-bold">Popular High-Intent Utilities</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">100% On-Device</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PROGRAMMATIC_ROUTES.map((pRoute) => (
            <button
              key={pRoute.slug}
              onClick={() => {
                if (onNavigateRoute) {
                  onNavigateRoute(pRoute.slug);
                } else {
                  setActivePage(pRoute.toolType);
                }
              }}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100 group-hover:text-white truncate">
                  {pRoute.sourceFormat} → {pRoute.targetFormat}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-1">{pRoute.toolCategory}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
