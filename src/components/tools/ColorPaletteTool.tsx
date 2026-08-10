import React, { useState, useRef } from 'react';
import { Dropzone } from '../Dropzone';
import { PrivacyBadge } from '../PrivacyBadge';
import { AdSlot } from '../AdSlot';
import { TOOL_METADATA } from '../../lib/seoData';
import { ColorSwatch } from '../../types';
import {
  extractColorPalette,
  generateFaviconPackZip,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
} from '../../lib/colorPaletteExtractor';
import { Palette, Copy, Check, Pipette, Archive, Download, Sparkles } from 'lucide-react';
import { trackEvent } from '../../lib/analyticsSentry';

interface ColorPaletteToolProps {
  onDownloadTrigger: (filename?: string) => void;
}

export const ColorPaletteTool: React.FC<ColorPaletteToolProps> = ({ onDownloadTrigger }) => {
  const meta = TOOL_METADATA.palette;
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [swatches, setSwatches] = useState<ColorSwatch[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Eyedropper Loupe state
  const [hoveredColor, setHoveredColor] = useState<{
    hex: string;
    rgb: string;
    hsl: string;
    cmyk: string;
  } | null>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    trackEvent('palette_file_uploaded', { name: file.name });

    const src = URL.createObjectURL(file);
    setImageSrc(src);

    const extracted = await extractColorPalette(src, 6);
    setSwatches(extracted);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    setMousePos({ x, y });

    // Draw image to hidden canvas to read exact pixel
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(imageRef.current, 0, 0, rect.width, rect.height);
      const p = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(p[0], p[1], p[2]);
      const hslObj = rgbToHsl(p[0], p[1], p[2]);
      const cmykObj = rgbToCmyk(p[0], p[1], p[2]);

      setHoveredColor({
        hex,
        rgb: `rgb(${p[0]}, ${p[1]}, ${p[2]})`,
        hsl: `hsl(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%)`,
        cmyk: `cmyk(${cmykObj.c}%, ${cmykObj.m}%, ${cmykObj.y}%, ${cmykObj.k}%)`,
      });
    }
  };

  const handleImageClick = () => {
    if (hoveredColor) {
      copyToClipboard(hoveredColor.hex);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const copyAllPaletteHexes = () => {
    const allHexes = swatches.map((s) => s.hex).join(', ');
    copyToClipboard(allHexes);
  };

  const handleDownloadFaviconPack = async () => {
    if (!imageSrc) return;
    const zipBlob = await generateFaviconPackZip(imageSrc);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imagetoolkit_favicon_pack.zip';
    a.click();
    URL.revokeObjectURL(url);
    onDownloadTrigger('imagetoolkit_favicon_pack.zip');
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {meta.title}
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
          {meta.subtitle}
        </p>
      </div>

      {!imageSrc ? (
        <Dropzone
          onFilesSelected={handleFilesSelected}
          multiple={false}
          title="Upload image to inspect colors & extract palette"
          subtitle="Extract dominant swatches, copy HEX/RGB/CMYK codes, and build website Favicon icon packs."
        />
      ) : (
        <div className="space-y-8">
          {/* Eyedropper Photo Inspection Canvas */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Pipette className="w-4 h-4 text-pink-600" /> Interactive Eyedropper Pixel Inspector
              </h3>
              <span className="text-xs text-slate-500">
                Hover over image to inspect • Click to copy HEX
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Image Container with Magnifier hover */}
              <div className="md:col-span-2 relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 p-2 flex justify-center">
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Eyedropper Sample"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => {
                    setMousePos(null);
                    setHoveredColor(null);
                  }}
                  onClick={handleImageClick}
                  className="max-h-96 object-contain rounded-lg cursor-crosshair"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Hovered Color Inspector Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Inspected Pixel Value
                </h4>

                {hoveredColor ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl shadow-md border border-slate-300 dark:border-slate-600 shrink-0"
                        style={{ backgroundColor: hoveredColor.hex }}
                      />
                      <div>
                        <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white block">
                          {hoveredColor.hex}
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Click photo to copy
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-slate-600 dark:text-slate-300">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 flex justify-between">
                        <span className="text-slate-400">RGB:</span>
                        <span>{hoveredColor.rgb}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 flex justify-between">
                        <span className="text-slate-400">HSL:</span>
                        <span>{hoveredColor.hsl}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 flex justify-between">
                        <span className="text-slate-400">CMYK:</span>
                        <span>{hoveredColor.cmyk}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Hover cursor over any part of the photo to see exact color codes.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dominant Color Palette Extractor Swatches */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-600" /> Extracted Dominant Color Palette (K-Means)
              </h3>
              <button
                onClick={copyAllPaletteHexes}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy All HEX Codes
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {swatches.map((swatch, idx) => (
                <div
                  key={idx}
                  onClick={() => copyToClipboard(swatch.hex)}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:scale-105 transition-transform"
                >
                  <div
                    className="h-24 w-full flex items-end justify-end p-2"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        swatch.isLight
                          ? 'bg-slate-900/80 text-white'
                          : 'bg-white/80 text-slate-900'
                      }`}
                    >
                      {swatch.percentage}%
                    </span>
                  </div>

                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        {swatch.hex}
                      </span>
                      {copiedHex === swatch.hex ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-500 transition-colors" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {swatch.rgb.r}, {swatch.rgb.g}, {swatch.rgb.b}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Favicon Pack Generator */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-slate-900 dark:text-slate-100">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" /> Website Favicon Pack Builder
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                Generate 16x16, 32x32, 48x48, 180x180 (Apple Touch), 192x192, and 512x512 icons, site.webmanifest, and ready-to-paste HTML head snippet.
              </p>
            </div>

            <button
              onClick={handleDownloadFaviconPack}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-lg flex items-center gap-2 transition-all shrink-0"
            >
              <Archive className="w-4 h-4" /> Download Favicon ZIP Pack
            </button>
          </div>
        </div>
      )}

      <AdSlot type="below-tool" />

      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {meta.faqs.map((faq, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {faq.question}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <PrivacyBadge />
    </div>
  );
};
