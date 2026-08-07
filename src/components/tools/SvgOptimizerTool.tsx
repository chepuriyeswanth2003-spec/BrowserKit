import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Code, Download, Copy, Check, Trash2 } from 'lucide-react';
import { PrivacyBadge } from '../PrivacyBadge';

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
    // Strip XML comments, doctype, extra spaces, editor metadata
    let cleaned = text
      .replace(/<!--[\s\S]*?-->/g, '') // remove comments
      .replace(/<\?xml[\s\S]*?\?>/i, '') // remove xml directive
      .replace(/<!DOCTYPE[\s\S]*?>/i, '') // remove doctype
      .replace(/\s+/g, ' ') // collapse whitespaces
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
        <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-md">
                  {fileName}
                </h3>
                <p className="text-xs font-mono text-neutral-500">
                  Original: {svgContent.length} chars | Optimized: {cleanedSvg.length} chars (
                  {Math.round((1 - cleanedSvg.length / (svgContent.length || 1)) * 100)}% lighter)
                </p>
              </div>
            </div>
            <button
              onClick={clearAll}
              className="p-2 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Vector Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Rendered Vector Preview
              </span>
              <div className="p-6 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 min-h-64 flex items-center justify-center overflow-hidden">
                <div
                  dangerouslySetInnerHTML={{ __html: cleanedSvg }}
                  className="max-w-full max-h-64 flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-64 [&_svg]:h-auto"
                />
              </div>
            </div>

            {/* Optimized Code Output */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Cleaned Minified Markup
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs font-mono font-bold flex items-center gap-1 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Code!' : 'Copy SVG'}
                </button>
              </div>
              <textarea
                value={cleanedSvg}
                onChange={(e) => setCleanedSvg(e.target.value)}
                className="w-full h-64 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-[11px] font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap justify-end gap-3">
            <button
              onClick={handleRasterizePng}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-all"
            >
              Convert to High-DPI PNG
            </button>
            <button
              onClick={handleDownloadSvg}
              className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> Download Clean SVG
            </button>
          </div>
        </div>
      )}

      <PrivacyBadge />
    </div>
  );
};
