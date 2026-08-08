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
  Filter,
  Wrench,
  Image,
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
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const toolIcons: Record<ToolType, React.ReactNode> = {
    compressor: <Minimize2 className="w-5 h-5" />,
    converter: <RefreshCw className="w-5 h-5" />,
    resizer: <Crop className="w-5 h-5" />,
    palette: <Palette className="w-5 h-5" />,
    meme: <Smile className="w-5 h-5" />,
    'video-trimmer': <Video className="w-5 h-5" />,
    'video-to-gif': <Film className="w-5 h-5" />,
    'pdf-merger': <FileText className="w-5 h-5" />,
    'pdf-splitter': <Scissors className="w-5 h-5" />,
    'pdf-password-remover': <Unlock className="w-5 h-5" />,
    'images-to-pdf': <FilePlus className="w-5 h-5" />,
    'zip-archiver': <Archive className="w-5 h-5" />,
    'zip-extractor': <FolderArchive className="w-5 h-5" />,
    'zip-password-remover': <Unlock className="w-5 h-5" />,
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
      tool.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Tools', icon: <Wrench className="w-4 h-4" />, count: allTools.length },
    { id: 'image', label: 'Image Suite', icon: <Image className="w-4 h-4" />, count: allTools.filter(t => t.category === 'image').length },
    { id: 'pdf', label: 'PDF Tools', icon: <FileText className="w-4 h-4" />, count: allTools.filter(t => t.category === 'pdf').length },
    { id: 'video', label: 'Video & Audio', icon: <Video className="w-4 h-4" />, count: allTools.filter(t => t.category === 'video' || t.category === 'audio').length },
    { id: 'zip', label: 'Archive & Vault', icon: <Archive className="w-4 h-4" />, count: allTools.filter(t => t.category === 'zip').length },
  ] as const;

  return (
    <div className="space-y-10">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" /> 100% Client-Side Private Web Utilities
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Private Web Tools. <br />
            <span className="text-emerald-400">Zero Server Uploads.</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Compress images, convert formats, merge PDFs, unlock passwords, trim videos, and encrypt files entirely inside your browser memory. Your files never touch a remote server.
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

      {/* Prominent Search & Category Filter Toolbar */}
      <section className="space-y-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Filter className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Explore & Filter Tools</h2>
              <p className="text-xs text-slate-500">Filter tools by category or search by keywords</p>
            </div>
          </div>

          {/* Inline Filter Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search tools (e.g. compress, unlock)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 transition-all"
            />
          </div>
        </div>

        {/* High-Visibility Larger Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className={isSelected ? 'text-emerald-400' : 'text-slate-500'}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-300 border border-slate-700'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
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
                onClick={() => {
                  setSearchFilter('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Popular SEO Programmatic Routes Section */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Popular Quick Tool Utilities</h2>
            <p className="text-xs text-slate-500">Direct 1-click access to specialized target file conversions</p>
          </div>
          <PrivacyBadge />
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
