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
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  Lock,
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
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  onNavigateRoute,
  isDark,
  toggleTheme,
}) => {
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const categories = [
    {
      title: 'Image Tools',
      tools: [
        { id: 'compressor' as ToolType, label: 'Image Compressor', icon: <Minimize2 className="w-3.5 h-3.5" /> },
        { id: 'bg-remover' as ToolType, label: 'Background Remover', icon: <Scissors className="w-3.5 h-3.5" /> },
        { id: 'converter' as ToolType, label: 'Format Converter', icon: <RefreshCw className="w-3.5 h-3.5" /> },
        { id: 'resizer' as ToolType, label: 'Resizer & Cropper', icon: <Crop className="w-3.5 h-3.5" /> },
        { id: 'palette' as ToolType, label: 'Color Picker & Favicons', icon: <Palette className="w-3.5 h-3.5" /> },
        { id: 'meme' as ToolType, label: 'Meme Generator', icon: <Smile className="w-3.5 h-3.5" /> },
        { id: 'svg-optimizer' as ToolType, label: 'SVG Cleaner & Optimizer', icon: <Code className="w-3.5 h-3.5" /> },
      ],
    },
    {
      title: 'Video & Audio Tools',
      tools: [
        { id: 'video-trimmer' as ToolType, label: 'Video Trimmer & Muter', icon: <Video className="w-3.5 h-3.5" /> },
        { id: 'video-to-gif' as ToolType, label: 'Frame Extractor', icon: <Film className="w-3.5 h-3.5" /> },
        { id: 'audio-tools' as ToolType, label: 'Audio Extractor', icon: <Music className="w-3.5 h-3.5" /> },
      ],
    },
    {
      title: 'PDF & ZIP Tools',
      tools: [
        { id: 'pdf-merger' as ToolType, label: 'PDF Merger', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'pdf-splitter' as ToolType, label: 'PDF Splitter & Extractor', icon: <Scissors className="w-3.5 h-3.5" /> },
        { id: 'images-to-pdf' as ToolType, label: 'Images to PDF', icon: <FilePlus className="w-3.5 h-3.5" /> },
        { id: 'zip-archiver' as ToolType, label: 'ZIP Archiver & Creator', icon: <Archive className="w-3.5 h-3.5" /> },
        { id: 'zip-extractor' as ToolType, label: 'ZIP Extractor & Viewer', icon: <FolderArchive className="w-3.5 h-3.5" /> },
        { id: 'file-encryptor' as ToolType, label: 'Password Encryptor Vault', icon: <Lock className="w-3.5 h-3.5" /> },
      ],
    },
  ];

  const searchResultsTool = searchQuery.trim()
    ? Object.values(TOOL_METADATA).filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.seoKeyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const searchResultsProgrammatic = searchQuery.trim()
    ? PROGRAMMATIC_ROUTES.filter(
        (p) =>
          p.h1.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.metaTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => {
            if (onNavigateRoute) onNavigateRoute('');
            setActivePage('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 group text-left shrink-0"
        >
          <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm group-hover:scale-105 transition-transform">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              Browser<span className="text-slate-500 dark:text-slate-400">Kit</span>
            </span>
            <span className="hidden sm:block text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400 -mt-1 font-semibold">
              100% Client-Side Engine
            </span>
          </div>
        </button>

        {/* Live Search Bar */}
        <div className="relative flex-1 max-w-xs hidden sm:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools & routes (e.g. heic to jpg, pdf, zip)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>

          {searchOpen && (searchResultsTool.length > 0 || searchResultsProgrammatic.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 max-h-80 overflow-y-auto space-y-2">
              {searchResultsProgrammatic.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-900 dark:text-white px-2 block">
                    Programmatic Direct Routes
                  </span>
                  {searchResultsProgrammatic.map((prog) => (
                    <button
                      key={prog.slug}
                      onClick={() => {
                        if (onNavigateRoute) onNavigateRoute(prog.slug);
                        setSearchQuery('');
                        setSearchOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 block"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {prog.h1}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">/{prog.slug}</p>
                    </button>
                  ))}
                </div>
              )}

              {searchResultsTool.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 px-2 block">
                    Core Utilities
                  </span>
                  {searchResultsTool.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        if (onNavigateRoute) onNavigateRoute('');
                        setActivePage(tool.id);
                        setSearchQuery('');
                        setSearchOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 block"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {tool.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{tool.subtitle}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => {
              if (onNavigateRoute) onNavigateRoute('');
              setActivePage('home');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activePage === 'home'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Home
          </button>

          {/* Tools Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              onBlur={() => setTimeout(() => setToolsDropdownOpen(false), 200)}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-1 transition-colors font-bold uppercase tracking-wider text-[11px]"
            >
              All Utilities <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-80 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 animate-fade-in z-50 max-h-96 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat.title} className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 px-2 block">
                      {cat.title}
                    </span>
                    {cat.tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          if (onNavigateRoute) onNavigateRoute('');
                          setActivePage(tool.id);
                          setToolsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-colors ${
                          activePage === tool.id
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tool.icon}
                        <span>{tool.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (onNavigateRoute) onNavigateRoute('');
              setActivePage('guides');
            }}
            className={`hidden px-3 py-1.5 rounded-lg transition-colors ${
              activePage === 'guides'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            SEO Guides
          </button>
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2">
          {/* Privacy Indicator Badge */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
            <Lock className="w-3 h-3 text-slate-900 dark:text-white" /> Zero Uploads
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-3 animate-fade-in max-h-[80vh] overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.title} className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2">
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                    activePage === tool.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tool.icon}
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          ))}

          <div className="hidden pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <button
              onClick={() => {
                if (onNavigateRoute) onNavigateRoute('');
                setActivePage('guides');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              SEO Guides & Tutorials
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
