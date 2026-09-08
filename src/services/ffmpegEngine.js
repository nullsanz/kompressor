import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;
let isLoaded = false;
let isLoading = false;
let loadError = null;

/**
 * Inisialisasi & Muat Engine FFmpeg WebAssembly
 */
export async function getFFmpegInstance(onLogCallback, onProgressCallback) {
  if (isLoaded && ffmpeg) return ffmpeg;

  if (isLoading) {
    // Wait for existing load promise
    while (isLoading) {
      await new Promise(r => setTimeout(r, 100));
    }
    if (isLoaded && ffmpeg) return ffmpeg;
  }

  isLoading = true;
  loadError = null;

  try {
    ffmpeg = new FFmpeg();

    if (onLogCallback) {
      ffmpeg.on('log', ({ message }) => {
        onLogCallback(message);
      });
    }

    if (onProgressCallback) {
      ffmpeg.on('progress', ({ progress, time }) => {
        onProgressCallback({ progress, time });
      });
    }

    // Gunakan unpkg dengan fallback ke jsdelivr
    const CORE_VERSION = '0.12.10';
    const primaryBaseURL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
    const fallbackBaseURL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

    let coreBlobURL, wasmBlobURL;
    try {
      coreBlobURL = await toBlobURL(`${primaryBaseURL}/ffmpeg-core.js`, 'text/javascript');
      wasmBlobURL = await toBlobURL(`${primaryBaseURL}/ffmpeg-core.wasm`, 'application/wasm');
    } catch {
      coreBlobURL = await toBlobURL(`${fallbackBaseURL}/ffmpeg-core.js`, 'text/javascript');
      wasmBlobURL = await toBlobURL(`${fallbackBaseURL}/ffmpeg-core.wasm`, 'application/wasm');
    }

    await ffmpeg.load({
      coreURL: coreBlobURL,
      wasmURL: wasmBlobURL,
    });

    isLoaded = true;
    isLoading = false;
    return ffmpeg;
  } catch (err) {
    isLoading = false;
    isLoaded = false;
    loadError = err;
    console.error('[FFMPEG ENGINE ERROR]', err);
    throw new Error('Gagal memuat engine FFmpeg WebAssembly. Pastikan koneksi internet stabil: ' + err.message);
  }
}

/**
 * Kompresi Video dengan Preset Bot WA & Trim
 */
export async function processVideo({
  file,
  preset,
  customSettings,
  trimRange, // { start: 0, end: 30 }
  onProgress,
  onLog
}) {
  const instance = await getFFmpegInstance(onLog, onProgress);

  // Sanitize input extension safely
  const rawExt = (file.name && file.name.includes('.')) 
    ? file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
    : 'mp4';
  const ext = ['mp4', 'mov', 'mkv', 'webm', 'avi', '3gp'].includes(rawExt) ? rawExt : 'mp4';
  const inputName = `input_${Date.now()}.${ext}`;
  const outputName = `output_${Date.now()}.mp4`;

  onLog(`[Engine] Memuat file "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) ke memori virtual...`);
  await instance.writeFile(inputName, await fetchFile(file));

  // Rancang Argumen FFmpeg
  const args = ['-y'];

  // Trim Options jika ada
  if (trimRange && (trimRange.start > 0 || (trimRange.end > 0 && trimRange.end < trimRange.duration))) {
    if (trimRange.start > 0) {
      args.push('-ss', String(trimRange.start));
    }
    if (trimRange.end > 0 && trimRange.end > trimRange.start) {
      args.push('-to', String(trimRange.end));
    }
    onLog(`[Trimmer] Memotong rentang: detik ${trimRange.start.toFixed(1)} s/d ${trimRange.end.toFixed(1)}`);
  }

  // Input file
  args.push('-i', inputName);

  // Video Codec & Encoding params
  args.push('-c:v', 'libx264');

  if (preset.id === 'custom' && customSettings) {
    args.push('-crf', String(customSettings.crf || 23));
    args.push('-preset', customSettings.preset || 'veryfast');

    if (customSettings.scaleFilter) {
      args.push('-vf', customSettings.scaleFilter);
    }
    if (customSettings.fps && customSettings.fps !== 'asli') {
      args.push('-r', String(customSettings.fps));
    }
    if (customSettings.extraArgs) {
      args.push(...customSettings.extraArgs);
    }
    // Audio
    args.push('-c:a', 'aac');
    args.push('-b:a', customSettings.audioBitrate || '64k');
  } else {
    // Gunakan Preset bawaan bot WA
    args.push('-crf', String(preset.crf || 23));
    args.push('-preset', preset.preset || 'veryfast');

    if (preset.scaleFilter) {
      args.push('-vf', preset.scaleFilter);
    }
    if (preset.fps) {
      args.push('-r', String(preset.fps));
    }
    if (preset.extraArgs && preset.extraArgs.length > 0) {
      args.push(...preset.extraArgs);
    }

    // Audio Codec & Bitrate
    args.push('-c:a', 'aac');
    if (preset.audioBitrate) {
      args.push('-b:a', preset.audioBitrate);
    }
    if (preset.audioSampleRate) {
      args.push('-ar', preset.audioSampleRate);
    }
  }

  // Output container
  args.push(outputName);

  onLog(`[FFmpeg Command] ffmpeg ${args.join(' ')}`);
  onLog(`[Engine] Memulai pemrosesan video di browser...`);

  // Eksekusi
  await instance.exec(args);

  onLog(`[Engine] Eksekusi selesai. Membaca hasil kompresi...`);
  const outputData = await instance.readFile(outputName);

  // Cleanup virtual files
  try {
    await instance.deleteFile(inputName);
    await instance.deleteFile(outputName);
  } catch (_) {}

  const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
  const outputUrl = URL.createObjectURL(outputBlob);

  // Buat nama output yang rapi dan aman (max 30 karakter dasar nama asli)
  const baseName = (file.name || 'video')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);

  return {
    blob: outputBlob,
    url: outputUrl,
    size: outputBlob.size,
    name: `${baseName}_${preset.id.toUpperCase()}_HD.mp4`
  };
}

/**
 * Ekstraksi Foto Profil WA 1:1 HD (PPHD)
 * Bisa dari file gambar atau dari frame video detik ke-1
 */
export async function processPPHD({
  file,
  isVideo = false,
  onProgress,
  onLog
}) {
  const instance = await getFFmpegInstance(onLog, onProgress);

  const rawExt = (file.name && file.name.includes('.'))
    ? file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
    : (isVideo ? 'mp4' : 'jpg');
  const ext = isVideo 
    ? (['mp4', 'mov', 'webm', 'mkv'].includes(rawExt) ? rawExt : 'mp4')
    : (['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg');

  const inputName = `input_pp_${Date.now()}.${ext}`;
  const outputName = `out_pp_${Date.now()}.jpg`;

  onLog(`[PPHD] Memproses ${isVideo ? 'frame video' : 'foto'} ke format 1080x1080 Square 1:1...`);
  await instance.writeFile(inputName, await fetchFile(file));

  const args = ['-y'];

  if (isVideo) {
    // Ambil frame detik ke-1
    args.push('-ss', '1');
  }

  args.push('-i', inputName);

  if (isVideo) {
    args.push('-vframes', '1');
  }

  // Filter Lanczos Pre-Sharpening 1080x1080 Kotak 1:1
  const scaleFilter = "crop='min(iw,ih)':'min(iw,ih)',scale=1080:1080:flags=lanczos,unsharp=5:5:1.2:3:3:0.6";
  args.push('-vf', scaleFilter);
  args.push('-q:v', '1'); // Kualitas JPEG Lossless maksimal
  args.push(outputName);

  onLog(`[PPHD Command] ffmpeg ${args.join(' ')}`);
  await instance.exec(args);

  const outputData = await instance.readFile(outputName);

  try {
    await instance.deleteFile(inputName);
    await instance.deleteFile(outputName);
  } catch (_) {}

  const outputBlob = new Blob([outputData.buffer], { type: 'image/jpeg' });
  const outputUrl = URL.createObjectURL(outputBlob);

  const baseName = (file.name || 'foto')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);

  return {
    blob: outputBlob,
    url: outputUrl,
    size: outputBlob.size,
    name: `${baseName}_PPHD_1x1.jpg`
  };
}
