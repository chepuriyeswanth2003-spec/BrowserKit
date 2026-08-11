import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Code, Download, Copy, Check, Trash2 } from 'lucide-react';
import { ToolPageShell } from './ToolPageShell';

export const SvgOptimizerTool: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [cleanedSvg, setCleanedSvg] = useState<string>('');
  const [fileName, setFileName] = useState<string>('graphic.svg');
  const [copied, setCopied] = useState<boolean>(false);

  const handleSvgSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    const text = await file.text();
    setSvgContent(text);
    optimizeSvgText(text);
  };

  const optimizeSvgText = (text: string) => {
    let cleaned = text
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\?xml[\s\S]*?\?>/i, '')
      .replace(/<!DOCTYPE[\s\S]*?>/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    setCleanedSvg(cleaned);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanedSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([cleanedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized_${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRasterizePng = () => {
    const blob = new Blob([cleanedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = (img.naturalWidth || 800) * 2;
      canvas.height = (img.naturalHeight || 800) * 2;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${fileName.replace('.svg', '')}_rasterized.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    };
  };

  const clearAll = () => {
    setSvgContent('');
    setCleanedSvg('');
  };

  return (
    <ToolPageShell
      categoryBadge="Vector & Code"
      categoryBadgeColor="cyan"
      title="SVG Vector Code Minifier & Optimizer"
      description="Strip comments, sanitize SVG markup, and reduce vector file sizes 100% in-browser."
      icon={<Code className="w-6 h-6 text-cyan-600" />}
    >
      <div className="space-y-6">
        {!svgContent ? (
          <Dropzone
            onFilesSelected={handleSvgSelected}
            title="Drop SVG File to Clean & Minify Code"
            subtitle="Strip comments, optimize XML vector code, and rasterize to 2x PNG"
            accept=".svg,image/svg+xml"
            multiple={false}
          />
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
                    {fileName}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Original: {svgContent.length} chars | Optimized: {cleanedSvg.length} chars
                  </p>
                </div>
              </div>
              <button
                onClick={clearAll}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Clear SVG"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Rendered Vector Preview
                </span>
                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 min-h-64 flex items-center justify-center overflow-hidden">
                  <div
                    dangerouslySetInnerHTML={{ __html: cleanedSvg }}
                    className="max-w-full max-h-64 flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-64 [&_svg]:h-auto"
                  />
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cleaned Minified Markup
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-xs font-mono font-bold flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied Code!' : 'Copy SVG'}
                  </button>
                </div>
                <textarea
                  value={cleanedSvg}
                  onChange={(e) => setCleanedSvg(e.target.value)}
                  className="w-full h-64 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-end gap-3">
              <button
                onClick={handleRasterizePng}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-all cursor-pointer"
              >
                Convert to High-DPI PNG
              </button>
              <button
                onClick={handleDownloadSvg}
                className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400 dark:text-white" /> Download Clean SVG
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
