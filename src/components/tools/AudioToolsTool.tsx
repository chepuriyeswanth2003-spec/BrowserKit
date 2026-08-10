import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Music, Download, Loader2, Trash2 } from 'lucide-react';
import { extractAudioFromVideo } from '../../lib/videoProcessor';
import { PrivacyBadge } from '../PrivacyBadge';

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
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Music className="w-6 h-6 text-purple-600" />
            Video Audio Extractor (WAV)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Extract an uncompressed WAV audio track from compatible local video files.
          </p>
        </div>

        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            title="Drop a Video File to Extract Its Audio"
            subtitle="Exports WAV from compatible MP4, WebM, and MOV files"
            accept="video/*"
            multiple={false}
          />
        ) : (
          <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs font-mono text-neutral-500">
                    File Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExtractAudio}
                disabled={isExtracting}
                className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Extracting Audio...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Extract Audio to WAV
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <PrivacyBadge />
    </div>
  );
};
