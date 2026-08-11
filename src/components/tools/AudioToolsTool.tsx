import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Music, Download, Loader2, Trash2 } from 'lucide-react';
import { extractAudioFromVideo } from '../../lib/videoProcessor';
import { ToolPageShell } from './ToolPageShell';

export const AudioToolsTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
  };

  const handleExtractAudio = async () => {
    if (!file) return;
    setIsExtracting(true);
    try {
      const wavBlob = await extractAudioFromVideo(file);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      a.download = `${baseName}_audio.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error extracting audio:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <ToolPageShell
      categoryBadge="Video & Audio"
      categoryBadgeColor="purple"
      title="Video Audio Extractor (WAV)"
      description="Extract an uncompressed WAV audio track from compatible local video files."
      icon={<Music className="w-6 h-6 text-purple-600" />}
    >
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            title="Drop a Video File to Extract Its Audio"
            subtitle="Exports WAV from compatible MP4, WebM, and MOV files"
            accept="video/*"
            multiple={false}
          />
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    File Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Remove File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExtractAudio}
                disabled={isExtracting}
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 shadow-md flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Extracting Audio...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-400 dark:text-white" /> Extract Audio to WAV
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
