import React, { useState } from 'react';
import {
  Wrench,
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
  ChevronDown,
  Menu,
  X,
  Lock,
  Unlock,
  Search,
  Sparkles,
} from 'lucide-react';
import { ActivePage, ToolType } from '../types';
import { TOOL_METADATA } from '../lib/seoData';
import { PROGRAMMATIC_ROUTES } from '../data/toolsData';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onNavigateRoute?: (slug: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  onNavigateRoute,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const categories = [
    {
      title: 'Image Tools',
      tools: [
        { id: 'compressor' as ToolType, label: 'Image Compressor', icon: <Minimize2 className="w-4 h-4 text-emerald-600" /> },
        { id: 'bg-remover' as ToolType, label: 'Background Remover', icon: <Scissors className="w-4 h-4 text-emerald-600" /> },
        { id: 'converter' as ToolType, label: 'Format Converter', icon: <RefreshCw className="w-4 h-4 text-emerald-600" /> },
        { id: 'resizer' as ToolType, label: 'Resize & Crop', icon: <Crop className="w-4 h-4 text-emerald-600" /> },
        { id: 'palette' as ToolType, label: 'Color Extractor', icon: <Palette className="w-4 h-4 text-emerald-600" /> },
        { id: 'meme' as ToolType, label: 'Meme Generator', icon: <Smile className="w-4 h-4 text-emerald-600" /> },
      ],
    },
    {
      title: 'Video Tools',
      tools: [
        { id: 'video-trimmer' as ToolType, label: 'Video Trimmer', icon: <Video className="w-4 h-4 text-blue-600" /> },
        { id: 'video-to-gif' as ToolType, label: 'Video to GIF', icon: <Film className="w-4 h-4 text-blue-600" /> },
      ],
    },
    {
      title: 'PDF Tools',
      tools: [
        { id: 'pdf-merger' as ToolType, label: 'PDF Merger', icon: <FileText className="w-4 h-4 text-red-600" /> },
        { id: 'pdf-splitter' as ToolType, label: 'PDF Splitter', icon: <FileText className="w-4 h-4 text-red-600" /> },
        { id: 'pdf-password-remover' as ToolType, label: 'Unlock PDF', icon: <Unlock className="w-4 h-4 text-rose-600" /> },
        { id: 'images-to-pdf' as ToolType, label: 'Images to PDF', icon: <FilePlus className="w-4 h-4 text-red-600" /> },
      ],
    },
    {
      title: 'Archives & Utility',
      tools: [
        { id: 'zip-archiver' as ToolType, label: 'ZIP Archiver', icon: <Archive className="w-4 h-4 text-amber-600" /> },
        { id: 'zip-extractor' as ToolType, label: 'ZIP Extractor', icon: <FolderArchive className="w-4 h-4 text-amber-600" /> },
        { id: 'zip-password-remover' as ToolType, label: 'Unlock ZIP', icon: <Unlock className="w-4 h-4 text-amber-600" /> },
        { id: 'audio-tools' as ToolType, label: 'Audio Converter', icon: <Music className="w-4 h-4 text-purple-600" /> },
        { id: 'svg-optimizer' as ToolType, label: 'SVG Optimizer', icon: <Code className="w-4 h-4 text-indigo-600" /> },
        { id: 'file-encryptor' as ToolType, label: 'File Encryptor', icon: <Lock className="w-4 h-4 text-emerald-600" /> },
      ],
    },
  ];

  // All searchable tool items (including SEO programmatic landing pages)
  const allSearchableTools = [
    // Standard Tools
    ...Object.entries(TOOL_METADATA).map(([key, meta]) => ({
      id: key,
      type: 'tool',
      title: meta.title,
      description: meta.metaDescription,
      category: meta.category,
      slug: '',
      toolType: key as ActivePage,
    })),
    // Programmatic Landing Pages
    ...PROGRAMMATIC_ROUTES.map((route) => ({
      id: route.slug,
      type: 'route',
      title: route.h1,
      description: route.metaDescription,
      category: route.toolCategory,
      slug: route.slug,
      toolType: route.toolType,
    })),
  ];

  const filteredSearchResults = searchQuery.trim()
    ? allSearchableTools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => {
            if (onNavigateRoute) onNavigateRoute('');
            setActivePage('home');
          }}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-mono font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
              BrowserKit
              <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Client-Side
              </span>
            </span>
            <span className="text-[10px] text-slate-600 tracking-wider uppercase font-semibold">
              100% Private Web Utilities
            </span>
          </div>
        </button>

        {/* Search Bar Container */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search 20+ private browser tools... (e.g. Unlock PDF, Unlock ZIP, Compress PDF)"
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-slate-100 text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-500 cursor-text"
            />
          </div>

          {/* Search Dropdown */}
          {searchOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
              {filteredSearchResults.length > 0 ? (
                filteredSearchResults.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      if (item.slug && onNavigateRoute) {
                        onNavigateRoute(item.slug);
                      } else {
                        if (onNavigateRoute) onNavigateRoute('');
                        setActivePage(item.toolType);
                      }
                      setSearchQuery('');
                      setSearchOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-start gap-3 transition-colors group cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 flex items-center gap-2">
                        {item.title}
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase font-mono font-normal">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-1">
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-center text-xs text-slate-500 font-medium">
                  No matching tools found. Try searching for "unlock", "convert", or "compress".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Navigation Category Dropdowns */}
        <nav className="hidden lg:flex items-center gap-1">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="relative"
              onMouseEnter={() => setActiveDropdown(cat.title)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                <span>{cat.title}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {activeDropdown === cat.title && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 space-y-1 animate-fade-in">
                  {cat.tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        if (onNavigateRoute) onNavigateRoute('');
                        setActivePage(tool.id);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        activePage === tool.id
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {tool.icon}
                      <span>{tool.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              if (onNavigateRoute) onNavigateRoute('');
              setActivePage('guides');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activePage === 'guides'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Guides
          </button>
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2">
          {/* Privacy Indicator Badge */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
            <Lock className="w-3 h-3 text-slate-900" /> Zero Uploads
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3 animate-fade-in max-h-[80vh] overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.title} className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 px-2">
                {cat.title}
              </div>
              {cat.tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (onNavigateRoute) onNavigateRoute('');
                    setActivePage(tool.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                    activePage === tool.id
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tool.icon}
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          ))}

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <button
              onClick={() => {
                if (onNavigateRoute) onNavigateRoute('');
                setActivePage('guides');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              SEO Guides & Tutorials
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
