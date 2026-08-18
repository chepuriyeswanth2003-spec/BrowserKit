import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Music,
  Download,
  Sparkles,
  Loader2,
  Sliders,
  AlertTriangle,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { ToolType } from '../../types';
import { ProcessedFileItem } from '../PostDownloadAdModal';
import { TOOL_METADATA } from '../../lib/seoData';
import { Dropzone } from '../Dropzone';
import { ToolPageShell } from './ToolPageShell';
import {
  ffmpegTranscodeVideo,
  ffmpegCompressVideo,
  ffmpegVideoToGif,
  ffmpegCutAudio,
  ffmpegExtractAudio,
} from '../../lib/ffmpegEngine';

interface MediaSuiteToolsProps {
  toolType: ToolType;
  onDownloadTrigger?: (
    filename: string,
    count: number,
    files?: ProcessedFileItem[]
  ) => void;
}

const SOCIAL_DOWNLOAD_TYPES = new Set(['social-video-downloader', 'social-audio-extractor', 'social-batch-downloader']);

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = p.exec(url);
    if (m) return m[1];
  }
  return null;
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
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [resultFormat, setResultFormat] = useState<string>('video/mp4');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);

  // Tool-specific parameters
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('9:16');
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav'>('mp3');
  const [gifFps, setGifFps] = useState<number>(10);
  const [gifWidth, setGifWidth] = useState<number>(480);
  const [targetContainer, setTargetContainer] = useState<'mp4' | 'webm'>('mp4');
  const [targetCodec, setTargetCodec] = useState<'h264' | 'h265' | 'vp9'>('h264');
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailError, setThumbnailError] = useState('');

  useEffect(() => {
    if (!file) return;
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.src = mediaUrl;
    v.onloadedmetadata = () => {
      setDuration(v.duration || 0);
      setTrimEnd(v.duration || 0);
    };
    return () => {
      v.src = '';
    };
  }, [file, mediaUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setMediaUrl(URL.createObjectURL(selectedFile));
    setResultUrl('');
    setErrorMsg('');
  };

  const handleProcessMedia = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setErrorMsg('');

    try {
      const onProgress = (ratio: number) => setProgress(Math.round(ratio * 100));

      if (toolType === 'video-to-audio') {
        const blob = await ffmpegExtractAudio(file, audioFormat, onProgress);
        setResultUrl(URL.createObjectURL(blob));
        setResultFormat(audioFormat === 'mp3' ? 'audio/mpeg' : 'audio/wav');
      } else if (toolType === 'audio-cutter') {
        const blob = await ffmpegCutAudio(file, trimStart, trimEnd, 'mp3', onProgress);
        setResultUrl(URL.createObjectURL(blob));
        setResultFormat('audio/mpeg');
      } else if (toolType === 'gif-maker') {
        const blob = await ffmpegVideoToGif(file, gifFps, gifWidth, onProgress);
        setResultUrl(URL.createObjectURL(blob));
        setResultFormat('image/gif');
      } else if (toolType === 'video-format-swapper') {
        const blob = await ffmpegTranscodeVideo(file, targetContainer, onProgress);
        setResultUrl(URL.createObjectURL(blob));
        setResultFormat(targetContainer === 'mp4' ? 'video/mp4' : 'video/webm');
      } else if (toolType === 'video-codec-transcoder') {
        const blob = await ffmpegCompressVideo(file, targetCodec, onProgress);
        setResultUrl(URL.createObjectURL(blob));
        setResultFormat(targetCodec === 'vp9' ? 'video/webm' : 'video/mp4');
      } else if (toolType === 'aspect-ratio-resizer') {
        await processAspectRatioVideo();
      } else {
        throw new Error('This tool type is not implemented.');
      }

      setProcessing(false);
    } catch (err: any) {
      console.error('Media processing error:', err);
      setErrorMsg(err?.message || 'Media processing failed. The file may be corrupted or in an unsupported format.');
      setProcessing(false);
    }
  };

  // Real (not single-frame) aspect-ratio reframe: re-renders every video frame into a
  // letterboxed/cropped canvas at the target aspect ratio and re-encodes via MediaRecorder,
  // preserving audio. ffmpeg's scale+pad filters would be even higher quality, but this
  // keeps the tool responsive for typical short-form clips without a full re-encode pass.
  const processAspectRatioVideo = async () => {
    return new Promise<void>((resolve, reject) => {
      const videoEl = document.createElement('video');
      videoEl.src = mediaUrl;
      videoEl.muted = false;
      videoEl.crossOrigin = 'anonymous';

      videoEl.onloadedmetadata = async () => {
        try {
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
          if (!ctx) throw new Error('Canvas not supported in this browser.');

          const canvasStream = (canvas as any).captureStream(30) as MediaStream;
          let combinedStream = canvasStream;
          try {
            const audioStream = (videoEl as any).captureStream
              ? (videoEl as any).captureStream()
              : (videoEl as any).mozCaptureStream?.();
            const audioTracks = audioStream?.getAudioTracks?.() || [];
            if (audioTracks.length > 0) {
              combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
            }
          } catch {
            // No capturable audio track — proceed video-only rather than failing the export
          }

          const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9,opus' });
          const chunks: Blob[] = [];
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            setResultUrl(URL.createObjectURL(blob));
            setResultFormat('video/webm');
            resolve();
          };
          recorder.onerror = (e) => reject(new Error('Recording failed: ' + String(e)));

          let raf = 0;
          const draw = () => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const scale = Math.min(canvas.width / videoEl.videoWidth, canvas.height / videoEl.videoHeight);
            const w = videoEl.videoWidth * scale;
            const h = videoEl.videoHeight * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            ctx.drawImage(videoEl, x, y, w, h);
            if (!videoEl.paused && !videoEl.ended) {
              raf = requestAnimationFrame(draw);
            }
          };

          videoEl.onended = () => {
            cancelAnimationFrame(raf);
            recorder.stop();
          };

          recorder.start();
          await videoEl.play();
          draw();
        } catch (err) {
          reject(err);
        }
      };
      videoEl.onerror = () => reject(new Error('Could not load this video file for processing.'));
    });
  };

  const handleFetchThumbnail = () => {
    setThumbnailError('');
    const id = extractYoutubeId(youtubeUrl);
    if (!id) {
      setThumbnailError('Enter a valid YouTube video URL (youtube.com/watch?v=... or youtu.be/...).');
      return;
    }
    setThumbnailPreview(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const ext = resultFormat.includes('gif')
      ? 'gif'
      : resultFormat.includes('audio/mpeg')
      ? 'mp3'
      : resultFormat.includes('audio')
      ? 'wav'
      : resultFormat.includes('webm')
      ? 'webm'
      : 'mp4';
    const filename = `browserkit_${toolType}_${(file?.name || 'media').replace(/\.[^.]+$/, '')}.${ext}`;

    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = filename;
    a.click();

    if (onDownloadTrigger) {
      onDownloadTrigger(filename, 1);
    }
  };

  const handleDownloadThumbnail = async () => {
    try {
      const res = await fetch(thumbnailPreview);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thumbnail.jpg';
      a.click();
      URL.revokeObjectURL(url);
      onDownloadTrigger?.('thumbnail.jpg', 1);
    } catch {
      // Cross-origin fetch blocked — fall back to opening it directly so the
      // user can right-click "Save Image As"
      window.open(thumbnailPreview, '_blank', 'noopener');
    }
  };

  // Thumbnail grabber is the one "URL-based" tool that's genuinely feasible client-side:
  // YouTube serves thumbnails from predictable, publicly-fetchable image URLs.
  if (toolType === 'thumbnail-grabber') {
    return (
      <ToolPageShell
        categoryBadge="Video & Media"
        categoryBadgeColor="blue"
        title={meta.title}
        description={meta.subtitle}
        icon={<ImageIcon className="w-6 h-6 text-[#2d5da1] dark:text-[#2d5da1]" />}
      >
        <div className="space-y-6">
          <div className="p-5 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] space-y-4">
            <label className="text-sm font-bold text-[#2d2d2d] dark:text-white block">YouTube Video URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-3 py-2.5 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29] text-sm"
              />
              <button
                onClick={handleFetchThumbnail}
                className="px-4 py-2.5 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white text-sm font-bold"
              >
                Fetch
              </button>
            </div>
            {thumbnailError && <p className="text-xs text-[#ff4d4d]">{thumbnailError}</p>}
            <p className="text-xs text-[#2d2d2d]/[0.7]">
              Currently supports YouTube links only. Other platforms don't expose a fetchable thumbnail URL without
              server-side access.
            </p>
          </div>

          {thumbnailPreview && (
            <div className="p-5 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] space-y-4 text-center">
              <img
                src={thumbnailPreview}
                alt="Video thumbnail"
                className="max-h-72 mx-auto wobbly-sm shadow-hand-sm"
                onError={() => {
                  const id = extractYoutubeId(youtubeUrl);
                  if (id) setThumbnailPreview(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
                }}
              />
              <button
                onClick={handleDownloadThumbnail}
                className="px-6 py-3 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white text-xs font-bold shadow-hand inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Thumbnail
              </button>
            </div>
          )}
        </div>
      </ToolPageShell>
    );
  }

  // Genuinely impossible to build as a client-side-only tool: pulling video/audio streams
  // off YouTube/Instagram/TikTok requires reverse-engineering their private streaming APIs
  // server-side (what yt-dlp-style tools do), which this app has no backend for — and doing
  // so also runs against most platforms' terms of service. Rather than silently doing
  // nothing (the previous behavior), this says so clearly.
  if (SOCIAL_DOWNLOAD_TYPES.has(toolType)) {
    return (
      <ToolPageShell
        categoryBadge="Video & Media"
        categoryBadgeColor="blue"
        title={meta.title}
        description={meta.subtitle}
        icon={<Video className="w-6 h-6 text-[#2d5da1] dark:text-[#2d5da1]" />}
      >
        <div className="p-6 wobbly-md border border-[2px] border-[#b8860b] dark:border-[#b8860b]/60 bg-[#b8860b]/60 dark:bg-[#b8860b]/20 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#b8860b] dark:text-[#b8860b]" />
            <h4 className="font-bold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]">Not available as a browser-only tool</h4>
          </div>
          <p className="text-sm text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">
            Downloading video or audio directly from a social media link requires talking to that platform's private
            streaming servers, which can only be done from a backend service — not from client-side JavaScript in
            your browser. This app runs entirely client-side (that's what keeps your files private), so this
            particular feature can't work here without adding server infrastructure, and most platforms' terms of
            service restrict that kind of scraping regardless.
          </p>
          <p className="text-sm text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">
            If you already have the video file on your device, the{' '}
            <span className="font-semibold">Video to Audio</span>, <span className="font-semibold">GIF Maker</span>,
            and <span className="font-semibold">Format Swapper</span> tools in this suite can process it locally.
          </p>
        </div>
      </ToolPageShell>
    );
  }

  return (
    <ToolPageShell
      categoryBadge="Video & Media"
      categoryBadgeColor="blue"
      title={meta.title}
      description={meta.subtitle}
      icon={<Video className="w-6 h-6 text-[#2d5da1] dark:text-[#2d5da1]" />}
    >
      <div className="space-y-6">
        {!file ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept="video/*,audio/*"
            title="Drop Video or Audio file here"
            subtitle="Supports MP4, WebM, MOV, AVI, MP3, WAV (100% Client-Side Execution)"
            multiple={false}
          />
        ) : (
          <div className="space-y-6">
            <div className="p-5 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] space-y-4">
              <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#2d5da1] dark:text-[#2d5da1]" />
                  <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white">Tool Options</h3>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setMediaUrl('');
                    setResultUrl('');
                    setErrorMsg('');
                  }}
                  className="text-xs text-[#ff4d4d] dark:text-[#ff4d4d] hover:underline font-semibold cursor-pointer"
                >
                  Change File
                </button>
              </div>

              {toolType === 'aspect-ratio-resizer' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">
                    Select Target Social Aspect Ratio
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(['9:16', '1:1', '16:9'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-4 py-2 wobbly-sm font-bold border cursor-pointer ${
                          aspectRatio === ratio
                            ? 'bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white border-transparent'
                            : 'bg-white dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
                        }`}
                      >
                        {ratio === '9:16' ? '📱 9:16 (TikTok & Shorts)' : ratio === '1:1' ? '📷 1:1 (Feed Square)' : '🖥️ 16:9 (Landscape)'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[#2d2d2d]/[0.7]">Output is re-encoded to WebM (VP9) with letterboxing to fill the target frame.</p>
                </div>
              )}

              {toolType === 'video-to-audio' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">Output Audio Format</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAudioFormat('mp3')}
                      className={`px-4 py-2 wobbly-sm font-bold border cursor-pointer ${
                        audioFormat === 'mp3'
                          ? 'bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white border-transparent'
                          : 'bg-white dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
                      }`}
                    >
                      🎵 MP3 (320 kbps)
                    </button>
                    <button
                      onClick={() => setAudioFormat('wav')}
                      className={`px-4 py-2 wobbly-sm font-bold border cursor-pointer ${
                        audioFormat === 'wav'
                          ? 'bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white border-transparent'
                          : 'bg-white dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
                      }`}
                    >
                      🎼 WAV (Lossless)
                    </button>
                  </div>
                </div>
              )}

              {toolType === 'audio-cutter' && duration > 0 && (
                <div className="space-y-3 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">
                    Trim Range: {trimStart.toFixed(1)}s &mdash; {trimEnd.toFixed(1)}s
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="w-10 text-[#2d2d2d]/[0.7]">Start</span>
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={trimStart}
                      onChange={(e) => setTrimStart(Math.min(parseFloat(e.target.value), trimEnd - 0.1))}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-10 text-[#2d2d2d]/[0.7]">End</span>
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(Math.max(parseFloat(e.target.value), trimStart + 0.1))}
                      className="flex-1"
                    />
                  </div>
                  <audio src={mediaUrl} controls className="w-full" />
                </div>
              )}

              {toolType === 'gif-maker' && (
                <div className="space-y-3 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">Frame Rate: {gifFps} fps</label>
                  <input
                    type="range"
                    min={5}
                    max={20}
                    step={1}
                    value={gifFps}
                    onChange={(e) => setGifFps(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                  <label className="font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">Width: {gifWidth}px</label>
                  <input
                    type="range"
                    min={240}
                    max={720}
                    step={40}
                    value={gifWidth}
                    onChange={(e) => setGifWidth(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                  <p className="text-[#2d2d2d]/[0.7]">Longer clips at high fps/width produce larger GIF files — trim first for best results.</p>
                </div>
              )}

              {toolType === 'video-format-swapper' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">Target Format</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTargetContainer('mp4')}
                      className={`px-4 py-2 wobbly-sm font-bold border cursor-pointer ${
                        targetContainer === 'mp4'
                          ? 'bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white border-transparent'
                          : 'bg-white dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
                      }`}
                    >
                      MP4 (H.264/AAC)
                    </button>
                    <button
                      onClick={() => setTargetContainer('webm')}
                      className={`px-4 py-2 wobbly-sm font-bold border cursor-pointer ${
                        targetContainer === 'webm'
                          ? 'bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white border-transparent'
                          : 'bg-white dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
                      }`}
                    >
                      WebM (VP9/Opus)
                    </button>
                  </div>
                </div>
              )}

              {toolType === 'video-codec-transcoder' && (
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">Target Codec (smaller file size)</label>
                  <div className="flex flex-wrap gap-3">
                    {(['h264', 'h265', 'vp9'] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setTargetCodec(c)}
                        className={`px-4 py-2 wobbly-sm font-bold border cursor-pointer ${
                          targetCodec === c
                            ? 'bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white border-transparent'
                            : 'bg-white dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
                        }`}
                      >
                        {c === 'h264' ? 'H.264 (compatible)' : c === 'h265' ? 'H.265/HEVC (smaller)' : 'VP9 (open, small)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleProcessMedia}
                disabled={processing}
                className="w-full py-3 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-hand transition-all cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing{progress > 0 ? ` (${progress}%)` : '...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#2f7a4f] dark:text-white" /> Export Processed Media
                  </>
                )}
              </button>
              {processing && (
                <p className="text-[11px] text-[#2d2d2d]/[0.7] text-center">
                  First run loads the transcoding engine (~30MB, cached after that) — this may take a moment.
                </p>
              )}
              {errorMsg && <p className="text-xs text-[#ff4d4d] text-center">{errorMsg}</p>}
            </div>

            {resultUrl && (
              <div className="p-5 bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] wobbly-md space-y-4 text-center">
                <span className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] uppercase tracking-wider block">
                  Export Ready
                </span>
                {resultFormat.includes('video') ? (
                  <video src={resultUrl} controls className="max-h-64 mx-auto wobbly-sm shadow-hand-sm" />
                ) : resultFormat.includes('gif') ? (
                  <img src={resultUrl} alt="GIF export" className="max-h-64 mx-auto wobbly-sm shadow-hand-sm" />
                ) : resultFormat.includes('image') ? (
                  <img src={resultUrl} alt="Export" className="max-h-64 mx-auto wobbly-sm shadow-hand-sm" />
                ) : (
                  <audio src={resultUrl} controls className="w-full max-w-md mx-auto" />
                )}

                <button
                  onClick={handleDownload}
                  className="px-6 py-3 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] text-white text-xs font-bold shadow-hand transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#2f7a4f] dark:text-white" /> Download Exported File
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
