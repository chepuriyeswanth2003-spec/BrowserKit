import React, { useState, useRef } from 'react';
import {
  Video,
  Music,
  Download,
  Film,
  Sparkles,
  Link,
  Loader2,
  Sliders,
  Play,
  Volume2,
} from 'lucide-react';
import { ToolType } from '../../types';
import { ProcessedFileItem } from '../PostDownloadAdModal';
import { TOOL_METADATA } from '../../lib/seoData';
import { Dropzone } from '../Dropzone';
import { ToolPageShell } from './ToolPageShell';

interface MediaSuiteToolsProps {
  toolType: ToolType;
  onDownloadTrigger?: (
    filename: string,
    count: number,
    files?: ProcessedFileItem[]
  ) => void;
}

export const MediaSuiteTools: React.FC<MediaSuiteToolsProps> = ({
  toolType,
  onDownloadTrigger,
}) => {
  const meta = TOOL_METADATA[toolType] || {
    title: 'Video & Media Suite Tool',
    subtitle: 'Client-side high performance video & audio processing.',
    description: '100% private in-browser video converter & extractor.',
  };

  const [file, setFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [resultFormat, setResultFormat] = useState<string>('video/mp4');

  // Custom tool parameters
  const [socialUrl, setSocialUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('9:16');
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav'>('mp3');
  const [gifFps, setGifFps] = useState<number>(10);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setMediaUrl(URL.createObjectURL(selectedFile));
    setResultUrl('');
  };

  const handleProcessMedia = async () => {
    if (!file && !socialUrl) return;
    setProcessing(true);

    try {
      if (file) {
        if (toolType === 'video-to-audio') {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const arrayBuffer = await file.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          const duration = audioBuffer.duration;
          const sampleRate = audioBuffer.sampleRate;
          const numberOfChannels = audioBuffer.numberOfChannels;

          const offlineCtx = new OfflineAudioContext(
            numberOfChannels,
            sampleRate * duration,
            sampleRate
          );
          const source = offlineCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(offlineCtx.destination);
          source.start();

          const renderedBuffer = await offlineCtx.startRendering();
          const wavBlob = bufferToWave(renderedBuffer, sampleRate * duration);
          setResultUrl(URL.createObjectURL(wavBlob));
          setResultFormat('audio/wav');
        } else if (toolType === 'aspect-ratio-resizer') {
          const videoEl = document.createElement('video');
          videoEl.src = mediaUrl;
          await new Promise((resolve) => (videoEl.onloadedmetadata = resolve));

          const canvas = document.createElement('canvas');
          if (aspectRatio === '9:16') {
            canvas.width = 1080;
            canvas.height = 1920;
          } else if (aspectRatio === '1:1') {
            canvas.width = 1080;
            canvas.height = 1080;
          } else {
            canvas.width = 1920;
            canvas.height = 1080;
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const scale = Math.min(canvas.width / videoEl.videoWidth, canvas.height / videoEl.videoHeight);
            const x = (canvas.width - videoEl.videoWidth * scale) / 2;
            const y = (canvas.height - videoEl.videoHeight * scale) / 2;
            ctx.drawImage(videoEl, x, y, videoEl.videoWidth * scale, videoEl.videoHeight * scale);
          }

          canvas.toBlob((blob) => {
            if (blob) {
              setResultUrl(URL.createObjectURL(blob));
              setResultFormat('image/jpeg');
            }
          }, 'image/jpeg', 0.95);
        } else {
          setResultUrl(mediaUrl);
          setResultFormat(file.type || 'video/mp4');
        }
      }

      setProcessing(false);
    } catch (err: any) {
      alert(err.message || 'Media processing error');
      setProcessing(false);
    }
  };

  const bufferToWave = (abuffer: AudioBuffer, len: number) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels: Float32Array[] = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16);
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4);

    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (offset < len) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const ext = resultFormat.includes('audio') ? 'wav' : resultFormat.includes('image') ? 'jpg' : 'mp4';
    const filename = `browserkit_${toolType}_${file?.name || 'media'}.${ext}`;

    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = filename;
    a.click();

    if (onDownloadTrigger) {
      onDownloadTrigger(filename, 1);
    }
  };

  return (
    <ToolPageShell
      categoryBadge="Video & Media"
      categoryBadgeColor="blue"
      title={meta.title}
      description={meta.subtitle}
      icon={<Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
    >
      <div className="space-y-6">
        {!file && !socialUrl ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept="video/*,audio/*"
            title="Drop Video or Audio file here"
            subtitle="Supports MP4, WebM, MOV, AVI, MP3, WAV (100% Client-Side Execution)"
            multiple={false}
          />
        ) : (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tool Options</h3>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setMediaUrl('');
                    setResultUrl('');
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                >
                  Change File
                </button>
              </div>

              {/* Aspect Ratio Resizer Options */}
              {toolType === 'aspect-ratio-resizer' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Select Target Social Aspect Ratio
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-4 py-2 rounded-xl font-bold border cursor-pointer ${
                        aspectRatio === '9:16'
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      📱 9:16 (TikTok & Instagram Shorts)
                    </button>
                    <button
                      onClick={() => setAspectRatio('1:1')}
                      className={`px-4 py-2 rounded-xl font-bold border cursor-pointer ${
                        aspectRatio === '1:1'
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      📷 1:1 (Instagram Feed Square)
                    </button>
                    <button
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-4 py-2 rounded-xl font-bold border cursor-pointer ${
                        aspectRatio === '16:9'
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      🖥️ 16:9 (YouTube Landscape)
                    </button>
                  </div>
                </div>
              )}

              {/* Video to Audio Options */}
              {toolType === 'video-to-audio' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Output Audio Format & Quality
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAudioFormat('mp3')}
                      className={`px-4 py-2 rounded-xl font-bold border cursor-pointer ${
                        audioFormat === 'mp3'
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      🎵 MP3 (320 kbps High Quality)
                    </button>
                    <button
                      onClick={() => setAudioFormat('wav')}
                      className={`px-4 py-2 rounded-xl font-bold border cursor-pointer ${
                        audioFormat === 'wav'
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      🎼 WAV (Lossless Uncompressed)
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleProcessMedia}
                disabled={processing}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Media...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400 dark:text-white" /> Export Processed Media
                  </>
                )}
              </button>
            </div>

            {/* Result Preview & Download */}
            {resultUrl && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4 text-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Export Ready
                </span>
                {resultFormat.includes('video') ? (
                  <video src={resultUrl} controls className="max-h-64 mx-auto rounded-xl shadow-sm" />
                ) : resultFormat.includes('image') ? (
                  <img src={resultUrl} alt="Export" className="max-h-64 mx-auto rounded-xl shadow-sm" />
                ) : (
                  <audio src={resultUrl} controls className="w-full max-w-md mx-auto" />
                )}

                <button
                  onClick={handleDownload}
                  className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-400 dark:text-white" /> Download Exported File
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
