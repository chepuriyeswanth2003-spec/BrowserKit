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
      icon={<Music className="w-6 h-6 text-[#6b4fa0]" />}
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
          <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 wobbly-sm bg-[#6b4fa0] dark:bg-[#6b4fa0]/60 text-[#6b4fa0] dark:text-[#6b4fa0] border border-[2px] border-[#6b4fa0] dark:border-[#6b4fa0]">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs font-mono text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]">
                    File Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] hover:bg-[#ff4d4d] dark:hover:bg-[#ff4d4d]/40 transition-colors cursor-pointer"
                title="Remove File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExtractAudio}
                disabled={isExtracting}
                className="px-6 py-3 wobbly-sm text-xs font-bold uppercase tracking-wider bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] shadow-hand flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Extracting Audio...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#2f7a4f] dark:text-white" /> Extract Audio to WAV
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
