import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

/**
 * Real client-side transcoding via ffmpeg compiled to WebAssembly. This replaces the
 * previous approach of either (a) doing nothing and returning the original file, or
 * (b) using MediaRecorder to capture real-time playback (lossy, slow, webm-only,
 * requires the tab to stay open for the full duration). The core files are self-hosted
 * from /ffmpeg-core so this doesn't depend on a third-party CDN at runtime.
 *
 * This uses the single-threaded ffmpeg core, which works without cross-origin-isolation
 * (COOP/COEP) headers — slower than the multi-threaded build, but doesn't require
 * changing server response headers, which could otherwise break ad iframes/embeds
 * elsewhere on the site.
 */

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export interface FFmpegProgress {
  ratio: number; // 0..1
}

export async function getFFmpeg(onProgress?: (p: FFmpegProgress) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();
    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        if (typeof progress === 'number' && isFinite(progress)) {
          onProgress({ ratio: Math.max(0, Math.min(1, progress)) });
        }
      });
    }

    const baseURL = `${window.location.origin}/ffmpeg-core`;
    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

    await ffmpeg.load({ coreURL, wasmURL });
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return loadPromise;
}

/** Writes a File into ffmpeg's virtual filesystem and returns the name it was written under. */
export async function writeInputFile(ffmpeg: FFmpeg, file: File, name: string): Promise<string> {
  await ffmpeg.writeFile(name, await fetchFile(file));
  return name;
}

export async function readOutputFile(ffmpeg: FFmpeg, name: string, mimeType: string): Promise<Blob> {
  const data = await ffmpeg.readFile(name);
  return new Blob([data as unknown as BlobPart], { type: mimeType });
}

export async function cleanupFiles(ffmpeg: FFmpeg, names: string[]) {
  for (const n of names) {
    try {
      await ffmpeg.deleteFile(n);
    } catch {
      // best-effort cleanup
    }
  }
}

function extOf(filename: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(filename);
  return m ? m[1].toLowerCase() : 'bin';
}

/** Lossless-where-possible video trim using stream copy (no re-encode) when the format allows it. */
export async function ffmpegTrimVideo(
  file: File,
  startSec: number,
  endSec: number,
  onProgress?: (ratio: number) => void,
  mute: boolean = false
): Promise<Blob> {
  const ffmpeg = await getFFmpeg((p) => onProgress?.(p.ratio));
  const inExt = extOf(file.name);
  const inputName = `input.${inExt}`;
  const outputName = `output.${inExt === 'mov' || inExt === 'avi' ? 'mp4' : inExt}`;

  await writeInputFile(ffmpeg, file, inputName);
  const duration = Math.max(0.1, endSec - startSec);
  const muteArgs = mute ? ['-an'] : ['-c:a', 'copy'];

  try {
    // Try fast stream-copy trim first (keeps original quality, near-instant)
    await ffmpeg.exec(['-ss', String(startSec), '-i', inputName, '-t', String(duration), '-c:v', 'copy', ...muteArgs, outputName]);
  } catch {
    // Fall back to re-encoding if stream copy fails (e.g. keyframe alignment issues)
    await ffmpeg.exec([
      '-ss', String(startSec),
      '-i', inputName,
      '-t', String(duration),
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      ...(mute ? ['-an'] : ['-c:a', 'aac']),
      outputName,
    ]);
  }

  const blob = await readOutputFile(ffmpeg, outputName, outputName.endsWith('.mp4') ? 'video/mp4' : file.type || 'video/mp4');
  await cleanupFiles(ffmpeg, [inputName, outputName]);
  return blob;
}

/** Real container/codec conversion (e.g. MOV/WebM/AVI -> MP4, or MP4 -> WebM). */
export async function ffmpegTranscodeVideo(
  file: File,
  target: 'mp4' | 'webm',
  onProgress?: (ratio: number) => void
): Promise<Blob> {
  const ffmpeg = await getFFmpeg((p) => onProgress?.(p.ratio));
  const inputName = `input.${extOf(file.name)}`;
  const outputName = `output.${target}`;

  await writeInputFile(ffmpeg, file, inputName);

  if (target === 'mp4') {
    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '160k',
      '-movflags', '+faststart',
      outputName,
    ]);
  } else {
    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libvpx-vp9',
      '-crf', '32',
      '-b:v', '0',
      '-c:a', 'libopus',
      outputName,
    ]);
  }

  const blob = await readOutputFile(ffmpeg, outputName, target === 'mp4' ? 'video/mp4' : 'video/webm');
  await cleanupFiles(ffmpeg, [inputName, outputName]);
  return blob;
}

/** Bitrate/codec-focused re-encode aimed at meaningfully smaller file size. */
export async function ffmpegCompressVideo(
  file: File,
  codec: 'h264' | 'h265' | 'vp9',
  onProgress?: (ratio: number) => void
): Promise<Blob> {
  const ffmpeg = await getFFmpeg((p) => onProgress?.(p.ratio));
  const inputName = `input.${extOf(file.name)}`;
  const outputName = codec === 'vp9' ? 'output.webm' : 'output.mp4';

  await writeInputFile(ffmpeg, file, inputName);

  if (codec === 'h264') {
    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '28',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputName,
    ]);
  } else if (codec === 'h265') {
    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libx265',
      '-preset', 'medium',
      '-crf', '30',
      '-tag:v', 'hvc1',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputName,
    ]);
  } else {
    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libvpx-vp9',
      '-crf', '36',
      '-b:v', '0',
      '-c:a', 'libopus',
      '-b:a', '96k',
      outputName,
    ]);
  }

  const blob = await readOutputFile(ffmpeg, outputName, codec === 'vp9' ? 'video/webm' : 'video/mp4');
  await cleanupFiles(ffmpeg, [inputName, outputName]);
  return blob;
}

/** High-quality animated GIF via ffmpeg's two-pass palette generation (much better than naive frame dumps). */
export async function ffmpegVideoToGif(
  file: File,
  fps: number,
  maxWidth: number,
  onProgress?: (ratio: number) => void
): Promise<Blob> {
  const ffmpeg = await getFFmpeg((p) => onProgress?.(p.ratio));
  const inputName = `input.${extOf(file.name)}`;
  const paletteName = 'palette.png';
  const outputName = 'output.gif';

  await writeInputFile(ffmpeg, file, inputName);

  const filterBase = `fps=${fps},scale=${maxWidth}:-1:flags=lanczos`;
  await ffmpeg.exec(['-i', inputName, '-vf', `${filterBase},palettegen`, paletteName]);
  await ffmpeg.exec([
    '-i', inputName,
    '-i', paletteName,
    '-lavfi', `${filterBase}[x];[x][1:v]paletteuse`,
    outputName,
  ]);

  const blob = await readOutputFile(ffmpeg, outputName, 'image/gif');
  await cleanupFiles(ffmpeg, [inputName, paletteName, outputName]);
  return blob;
}

/** Real audio trim + format conversion (MP3/WAV/M4A) instead of a silent pass-through. */
export async function ffmpegCutAudio(
  file: File,
  startSec: number,
  endSec: number,
  format: 'mp3' | 'wav' | 'm4a',
  onProgress?: (ratio: number) => void
): Promise<Blob> {
  const ffmpeg = await getFFmpeg((p) => onProgress?.(p.ratio));
  const inputName = `input.${extOf(file.name)}`;
  const outputName = `output.${format}`;
  const duration = Math.max(0.1, endSec - startSec);

  await writeInputFile(ffmpeg, file, inputName);

  const codecArgs =
    format === 'mp3'
      ? ['-c:a', 'libmp3lame', '-b:a', '256k']
      : format === 'm4a'
      ? ['-c:a', 'aac', '-b:a', '192k']
      : ['-c:a', 'pcm_s16le'];

  await ffmpeg.exec(['-ss', String(startSec), '-i', inputName, '-t', String(duration), '-vn', ...codecArgs, outputName]);

  const mime = format === 'mp3' ? 'audio/mpeg' : format === 'm4a' ? 'audio/mp4' : 'audio/wav';
  const blob = await readOutputFile(ffmpeg, outputName, mime);
  await cleanupFiles(ffmpeg, [inputName, outputName]);
  return blob;
}

/** Real audio track extraction from a video file, with actual format/bitrate control. */
export async function ffmpegExtractAudio(
  file: File,
  format: 'mp3' | 'wav',
  onProgress?: (ratio: number) => void
): Promise<Blob> {
  const ffmpeg = await getFFmpeg((p) => onProgress?.(p.ratio));
  const inputName = `input.${extOf(file.name)}`;
  const outputName = `output.${format}`;

  await writeInputFile(ffmpeg, file, inputName);
  const codecArgs = format === 'mp3' ? ['-c:a', 'libmp3lame', '-b:a', '320k'] : ['-c:a', 'pcm_s16le'];
  await ffmpeg.exec(['-i', inputName, '-vn', ...codecArgs, outputName]);

  const blob = await readOutputFile(ffmpeg, outputName, format === 'mp3' ? 'audio/mpeg' : 'audio/wav');
  await cleanupFiles(ffmpeg, [inputName, outputName]);
  return blob;
}
