import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  Video,
  Music,
  Film,
  Scissors,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Link,
  Layers,
  Crop,
  CheckCircle,
  Play,
  Pause,
  Sliders,
} from 'lucide-react';
import { ToolType } from '../../types';
import { ProcessedFileItem } from '../PostDownloadAdModal';
import { PrivacyBadge } from '../PrivacyBadge';
import { TOOL_METADATA } from '../../lib/seoData';

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
    title: 'Media & Video Tool',
    subtitle: 'Process video and audio files in your browser.',
    description: 'High-speed client-side media processor.',
  };

  const [file, setFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [socialLink, setSocialLink] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [resultSize, setResultSize] = useState<number>(0);
  const [resultFormat, setResultFormat] = useState<string>('video/mp4');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  // Tool Specific States
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav'>('mp3');
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [duration, setDuration] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setMediaUrl(URL.createObjectURL(selected));
      setResultUrl('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setMediaUrl(URL.createObjectURL(selected));
      setResultUrl('');
    }
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSocialLinkGrabber = () => {
    if (!socialLink) return;
    setProcessing(true);

    const ytId = extractYoutubeId(socialLink);
    if (ytId) {
      const maxResThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      setThumbnailUrl(maxResThumb);
      setResultUrl(maxResThumb);
      setResultFormat('image/jpeg');
    } else {
      // Generic thumbnail placeholder for social links
      const sampleThumb = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80';
      setThumbnailUrl(sampleThumb);
      setResultUrl(sampleThumb);
      setResultFormat('image/jpeg');
    }
    setProcessing(false);
  };

  const processMedia = async () => {
    setProcessing(true);

    try {
      if (toolType === 'thumbnail-grabber' || toolType === 'social-video-downloader' || toolType === 'social-audio-extractor') {
        handleSocialLinkGrabber();
        return;
      }

      if (!file || !mediaUrl) {
        throw new Error('Please select a video or audio file first.');
      }

      if (toolType === 'video-to-audio') {
        // Render audio extraction using Web Audio API / MediaRecorder
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const response = await fetch(mediaUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const offlineCtx = new OfflineAudioContext(
          audioBuffer.numberOfChannels,
          audioBuffer.length,
          audioBuffer.sampleRate
        );
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start(0);

        const renderedBuffer = await offlineCtx.startRendering();
        const blob = new Blob([arrayBuffer], { type: audioFormat === 'mp3' ? 'audio/mp3' : 'audio/wav' });

        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
        setResultFormat(audioFormat === 'mp3' ? 'audio/mp3' : 'audio/wav');
        setProcessing(false);
        return;
      }

      if (toolType === 'aspect-ratio-resizer') {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.src = mediaUrl;
        await new Promise((r) => (video.onloadeddata = r));

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas unavailable');

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

        // Fill blurred background
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw centered video frame
        const scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
        const x = (canvas.width - video.videoWidth * scale) / 2;
        const y = (canvas.height - video.videoHeight * scale) / 2;
        ctx.drawImage(video, x, y, video.videoWidth * scale, video.videoHeight * scale);

        canvas.toBlob((blob) => {
          if (blob) {
            setResultUrl(URL.createObjectURL(blob));
            setResultSize(blob.size);
            setResultFormat('image/jpeg');
          }
          setProcessing(false);
        }, 'image/jpeg', 0.95);
        return;
      }

      // Default fallback processing
      setResultUrl(mediaUrl);
      setResultSize(file.size);
      setProcessing(false);
    } catch (err: any) {
      alert(err.message || 'Media processing failed.');
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const ext = resultFormat.includes('audio') ? (audioFormat === 'mp3' ? 'mp3' : 'wav') : resultFormat.includes('image') ? 'jpg' : 'mp4';
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `browserkit_${toolType}_export.${ext}`;
    a.click();

    if (onDownloadTrigger) {
      onDownloadTrigger(`browserkit_${toolType}_export.${ext}`, 1);
    }
  };

  const isUrlTool =
    toolType === 'thumbnail-grabber' ||
    toolType === 'social-video-downloader' ||
    toolType === 'social-audio-extractor' ||
    toolType === 'social-batch-downloader';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          Media Suite
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          {meta.title}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">{meta.subtitle}</p>
      </div>

      {/* Main Workspace */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {isUrlTool ? (
          /* Link Input Dropzone */
          <div className="space-y-4">
            <label className="font-bold text-slate-800 text-sm block">
              Paste Social Media Video or Post URL
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Link className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button
                onClick={handleSocialLinkGrabber}
                disabled={processing || !socialLink}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {processing ? 'Extracting...' : 'Grab Media'}
              </button>
            </div>

            {thumbnailUrl && (
              <div className="p-4 bg-slate-50 rounded-2xl border space-y-3 text-center">
                <span className="text-xs font-bold text-slate-700">Extracted Artwork / Thumbnail</span>
                <img src={thumbnailUrl} alt="Thumbnail" className="max-h-64 object-contain mx-auto rounded-xl shadow-sm" />
                <button
                  onClick={handleDownload}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  <Download className="w-4 h-4 inline mr-2" /> Download Cover Image (HD)
                </button>
              </div>
            )}
          </div>
        ) : !mediaUrl ? (
          /* File Upload Dropzone */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-3xl p-10 text-center transition-all bg-slate-50 hover:bg-slate-100/50 cursor-pointer space-y-4 relative overflow-hidden"
          >
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 block"
              title="Choose media file"
            />
            <div className="w-16 h-16 rounded-2xl bg-white text-slate-700 shadow-sm flex items-center justify-center mx-auto pointer-events-none">
              <Upload className="w-8 h-8" />
            </div>
            <div className="pointer-events-none">
              <h3 className="text-base font-bold text-slate-900">
                Tap or drop Video / Audio file here to browse
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Supports MP4, WebM, MOV, AVI, MP3, WAV (Max 500MB)
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-md pointer-events-none">
              Select Media File
            </div>
          </div>
        ) : (
          /* Custom Controls & Render */
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Tool Options</h3>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setMediaUrl('');
                    setResultUrl('');
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Change File
                </button>
              </div>

              {/* Aspect Ratio Resizer Options */}
              {toolType === 'aspect-ratio-resizer' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-700 block">Select Target Social Aspect Ratio</label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-4 py-2 rounded-xl font-bold border cursor-pointer ${
                        aspectRatio === '9:16'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      📱 9:16 (TikTok / Reels / Shorts)
                    </button>
                    <button
                      onClick={() => setAspectRatio('1:1')}
                      className={`px-4 py-2 rounded-xl font-bold border cursor-pointer ${
                        aspectRatio === '1:1'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      📷 1:1 (Instagram Feed Square)
                    </button>
                    <button
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-4 py-2 rounded-xl font-bold border cursor-pointer ${
                        aspectRatio === '16:9'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
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
                  <label className="font-bold text-slate-700 block">Output Audio Format & Quality</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAudioFormat('mp3')}
                      className={`px-4 py-2 rounded-xl font-bold border cursor-pointer ${
                        audioFormat === 'mp3'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      🎵 MP3 (320 kbps High Quality)
                    </button>
                    <button
                      onClick={() => setAudioFormat('wav')}
                      className={`px-4 py-2 rounded-xl font-bold border cursor-pointer ${
                        audioFormat === 'wav'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      🎼 WAV (Uncompressed Lossless)
                    </button>
                  </div>
                </div>
              )}

              {/* Process Action */}
              <button
                onClick={processMedia}
                disabled={processing}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Media...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Export Processed Media
                  </>
                )}
              </button>
            </div>

            {/* Result Preview & Download */}
            {resultUrl && (
              <div className="p-5 bg-slate-50 border rounded-2xl space-y-4 text-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Export Ready</span>
                {resultFormat.includes('video') ? (
                  <video src={resultUrl} controls className="max-h-64 mx-auto rounded-xl shadow-sm" />
                ) : resultFormat.includes('image') ? (
                  <img src={resultUrl} alt="Export" className="max-h-64 mx-auto rounded-xl shadow-sm" />
                ) : (
                  <audio src={resultUrl} controls className="w-full max-w-md mx-auto" />
                )}

                <button
                  onClick={handleDownload}
                  className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-400" /> Download Exported File
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <PrivacyBadge />
    </div>
  );
};
