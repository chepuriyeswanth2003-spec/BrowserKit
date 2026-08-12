import React, { useState, useEffect } from 'react';
import { Dropzone } from '../Dropzone';
import { TOOL_METADATA } from '../../lib/seoData';
import { MemeTemplate, TextLayer } from '../../types';
import { POPULAR_MEME_TEMPLATES, renderMemeCanvas } from '../../lib/memeGenerator';
import { Smile, Plus, Trash2, Download, Type, Sliders, Image as ImageIcon } from 'lucide-react';
import { trackEvent } from '../../lib/analyticsSentry';
import { ToolPageShell } from './ToolPageShell';

interface MemeGeneratorToolProps {
  onDownloadTrigger: (filename?: string) => void;
}

export const MemeGeneratorTool: React.FC<MemeGeneratorToolProps> = ({
  onDownloadTrigger,
}) => {
  const meta = TOOL_METADATA.meme;
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(POPULAR_MEME_TEMPLATES[0]);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);

  const [textLayers, setTextLayers] = useState<TextLayer[]>([
    {
      id: 't1',
      text: 'WHEN CODE COMPILES ON FIRST TRY',
      x: 50,
      y: 15,
      fontSize: 32,
      fontFamily: 'Impact',
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 4,
      isUppercase: true,
      shadowColor: '#000000',
      shadowBlur: 5,
      align: 'center',
    },
    {
      id: 't2',
      text: 'IT FEELS LIKE MAGIC',
      x: 50,
      y: 85,
      fontSize: 32,
      fontFamily: 'Impact',
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 4,
      isUppercase: true,
      shadowColor: '#000000',
      shadowBlur: 5,
      align: 'center',
    },
  ]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const src = customImageSrc || selectedTemplate.url;
    renderMemeCanvas(src, textLayers).then((url) => setPreviewUrl(url));
  }, [selectedTemplate, customImageSrc, textLayers]);

  const handleCustomFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    trackEvent('meme_custom_file_uploaded', { name: file.name });
    const src = URL.createObjectURL(file);
    setCustomImageSrc(src);
  };

  const handleSelectTemplate = (tpl: MemeTemplate) => {
    setCustomImageSrc(null);
    setSelectedTemplate(tpl);
    if (tpl.defaultTexts) {
      setTextLayers(
        tpl.defaultTexts.map((dt, idx) => ({
          id: `t${idx + 1}`,
          text: dt.text,
          x: dt.x,
          y: dt.y,
          fontSize: 32,
          fontFamily: 'Impact',
          fillColor: '#FFFFFF',
          strokeColor: '#000000',
          strokeWidth: 4,
          isUppercase: true,
          shadowColor: '#000000',
          shadowBlur: 5,
          align: 'center',
        }))
      );
    }
  };

  const addTextLayer = () => {
    const newId = `t${Date.now()}`;
    setTextLayers((prev) => [
      ...prev,
      {
        id: newId,
        text: 'NEW TEXT LAYER',
        x: 50,
        y: 50,
        fontSize: 28,
        fontFamily: 'Impact',
        fillColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 3,
        isUppercase: true,
        shadowColor: '#000000',
        shadowBlur: 4,
        align: 'center',
      },
    ]);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const removeTextLayer = (id: string) => {
    setTextLayers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDownloadMeme = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `browserkit_meme_${Date.now()}.png`;
    a.click();
    onDownloadTrigger('browserkit_meme.png');
  };

  return (
    <ToolPageShell
      categoryBadge="Media & Memes"
      categoryBadgeColor="amber"
      title={meta.title}
      description={meta.subtitle}
      icon={<Smile className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
    >
      <div className="space-y-6">
        {/* Template Gallery Picker */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
            Select Template or Upload Custom Photo
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {POPULAR_MEME_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-2 rounded-2xl border cursor-pointer transition-all flex flex-col items-center space-y-1.5 ${
                  !customImageSrc && selectedTemplate.id === tpl.id
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <img
                  src={tpl.url}
                  alt={tpl.name}
                  className="w-full h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
                <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-full">
                  {tpl.name}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Dropzone
              onFilesSelected={handleCustomFileSelected}
              variant="compact"
              accept="image/*"
              title="Or upload your own custom photo / image"
            />
          </div>
        </div>

        {/* Studio Workspace: Live Preview + Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          {/* Live Preview Canvas */}
          <div className="space-y-3 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Live Rendered Preview
            </span>
            {previewUrl && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Meme Preview"
                  className="max-h-96 w-auto object-contain rounded-xl shadow-md"
                />
              </div>
            )}

            <button
              onClick={handleDownloadMeme}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400 dark:text-white" /> Download High-Res Meme PNG
            </button>
          </div>

          {/* Text Layers Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Text Layers ({textLayers.length})
              </span>
              <button
                onClick={addTextLayer}
                className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1 hover:bg-amber-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Text Layer
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {textLayers.map((layer, idx) => (
                <div
                  key={layer.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      Layer #{idx + 1}
                    </span>
                    <button
                      onClick={() => removeTextLayer(layer.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={layer.text}
                    onChange={(e) => updateTextLayer(layer.id, { text: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white uppercase"
                  />

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        Font Size: {layer.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="72"
                        value={layer.fontSize}
                        onChange={(e) =>
                          updateTextLayer(layer.id, { fontSize: parseInt(e.target.value, 10) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        Vertical Position: {layer.y}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={layer.y}
                        onChange={(e) =>
                          updateTextLayer(layer.id, { y: parseInt(e.target.value, 10) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
};
