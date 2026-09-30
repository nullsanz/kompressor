import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { patchVideoDolbyVision } from './dolbyVisionPatcher.js';

let ffmpeg = null;
let isLoaded = false;
let isLoading = false;
let loadError = null;

// Callbacks dinamis aktif agar event log & progress selalu sampai ke UI komponen aktif
let activeLogCallback = null;
let activeProgressCallback = null;

export function setActiveCallbacks(onLog, onProgress) {
  activeLogCallback = onLog || null;
  activeProgressCallback = onProgress || null;
}

/**
 * Inisialisasi & Muat Engine FFmpeg WebAssembly
 */
export async function getFFmpegInstance(onLogCallback, onProgressCallback) {
  setActiveCallbacks(onLogCallback, onProgressCallback);

  if (isLoaded && ffmpeg) return ffmpeg;

  if (isLoading) {
    while (isLoading) {
      await new Promise(r => setTimeout(r, 100));
    }
    if (isLoaded && ffmpeg) return ffmpeg;
  }

  isLoading = true;
  loadError = null;

  try {
    ffmpeg = new FFmpeg();

    // Listener permanen yang meneruskan ke callback aktif saat ini
    ffmpeg.on('log', ({ message }) => {
      if (activeLogCallback) {
        activeLogCallback(message);
      }
    });

    ffmpeg.on('progress', ({ progress, time }) => {
      if (activeProgressCallback) {
        activeProgressCallback({ progress, time });
      }
    });

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
 * Parsing waktu string FFmpeg (HH:MM:SS.SS) ke detik
 */
function parseTimeStringToSeconds(timeStr) {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace('-', '');
  const parts = cleaned.split(':');
  if (parts.length === 3) {
    const h = parseFloat(parts[0]) || 0;
    const m = parseFloat(parts[1]) || 0;
    const s = parseFloat(parts[2]) || 0;
    return h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const m = parseFloat(parts[0]) || 0;
    const s = parseFloat(parts[1]) || 0;
    return m * 60 + s;
  } else if (parts.length === 1) {
    return parseFloat(parts[0]) || 0;
  }
  return 0;
}

/**
 * Kompresi Video dengan Preset Bot WA & Trim
 */
export async function processVideo({
  file,
  preset,
  customSettings,
  trimRange, // { start: 0, end: 30, duration: 30 }
  totalDuration = 0,
  onProgress,
  onLog
}) {
  const instance = await getFFmpegInstance();

  // Lacak durasi video dari parameter atau dari probe FFmpeg
  let detectedDuration = (trimRange && trimRange.end > trimRange.start)
    ? (trimRange.end - trimRange.start)
    : (totalDuration || trimRange?.duration || 0);

  // Pasang logger & progress tracker cerdas
  let lastReportedRatio = 0.05;
  onProgress({ ratio: 0.05, text: 'Memuat video ke memori WebAssembly...' });

  const customLogWrapper = (message) => {
    if (onLog) onLog(message);
    if (typeof message !== 'string') return;

    // 1. Tangkap durasi video dari probe FFmpeg jika belum diketahui
    if (detectedDuration <= 0 && message.includes('Duration:')) {
      const durMatch = message.match(/Duration:\s*(\d{2}:\d{2}:[\d\.]+)/);
      if (durMatch && durMatch[1]) {
        const parsedDur = parseTimeStringToSeconds(durMatch[1]);
        if (parsedDur > 0) {
          detectedDuration = parsedDur;
          console.log('[FFMPEG PROBE] Durasi video terdeteksi dari stream:', detectedDuration, 'detik');
        }
      }
    }

    // 2. Parse FFmpeg progress line: frame= ... fps= ... time=00:00:04.50 speed=1.8x
    if (message.includes('time=') || message.includes('frame=')) {
      const timeMatch = message.match(/time=\s*(-?[\d:\.]+)/);
      const frameMatch = message.match(/frame=\s*(\d+)/);
      const fpsMatch = message.match(/fps=\s*([\d\.]+)/);
      const speedMatch = message.match(/speed=\s*([\d\.]+)x/);

      const effectiveDuration = detectedDuration > 0 ? detectedDuration : 30;
      let currentSec = 0;

      if (timeMatch && timeMatch[1]) {
        currentSec = parseTimeStringToSeconds(timeMatch[1]);
      }

      let ratio = lastReportedRatio;
      if (currentSec > 0 && effectiveDuration > 0) {
        ratio = Math.min(0.95, Math.max(lastReportedRatio, currentSec / effectiveDuration));
      } else if (frameMatch && frameMatch[1]) {
        const frameNum = parseInt(frameMatch[1], 10);
        const estTotalFrames = effectiveDuration * 30;
        const frameRatio = Math.min(0.92, Math.max(lastReportedRatio, frameNum / estTotalFrames));
        ratio = Math.max(ratio, frameRatio);
      } else {
        ratio = Math.min(0.20, lastReportedRatio + 0.005);
      }

      lastReportedRatio = ratio;
      const pct = Math.round(ratio * 100);
      const fps = fpsMatch ? fpsMatch[1] : null;
      const speed = speedMatch ? speedMatch[1] : null;
      const frame = frameMatch ? frameMatch[1] : null;

      let statusMsg = `Sedang merender video (${pct}%)...`;
      if (frame) statusMsg = `Merender frame ${frame} (${pct}%)...`;
      if (fps) statusMsg += ` • ${fps} FPS`;
      if (speed) statusMsg += ` • Speed ${speed}x`;

      onProgress({
        ratio,
        fps,
        speed: speed ? `${speed}x` : null,
        frame,
        timeSec: currentSec,
        duration: effectiveDuration,
        text: statusMsg
      });
    }
  };

  const customProgressWrapper = ({ progress, time }) => {
    const effectiveDuration = detectedDuration > 0 ? detectedDuration : 30;
    if (typeof progress === 'number' && progress > 0 && progress <= 1) {
      const ratio = Math.min(0.95, Math.max(lastReportedRatio, progress));
      lastReportedRatio = ratio;
      onProgress({ ratio });
    } else if (typeof time === 'number' && time > 0 && effectiveDuration > 0) {
      const timeSec = time > 100000 ? time / 1000000 : time;
      const ratio = Math.min(0.95, Math.max(lastReportedRatio, timeSec / effectiveDuration));
      lastReportedRatio = ratio;
      onProgress({ ratio, timeSec, duration: effectiveDuration });
    }
  };

  setActiveCallbacks(customLogWrapper, customProgressWrapper);

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
    args.push('-preset', customSettings.preset || 'ultrafast');

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
    args.push('-b:a', customSettings.audioBitrate || '128k');
  } else {
    // Gunakan Preset bawaan (Dioptimasi ultrafast untuk browser WASM tanpa penurunan kualitas)
    args.push('-crf', String(preset.crf || 20));
    args.push('-preset', preset.preset || 'ultrafast');

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

  // Optimasi container browser
  args.push('-avoid_negative_ts', 'make_zero');

  // Output container
  args.push(outputName);

  onLog(`[FFmpeg Command] ffmpeg ${args.join(' ')}`);
  onLog(`[Engine] Memulai pemrosesan video di browser...`);

  // Eksekusi
  await instance.exec(args);

  onLog(`[Engine] Eksekusi FFmpeg selesai. Membaca hasil kompresi...`);
  onProgress({ ratio: 0.96, text: 'Membaca hasil render...' });
  let outputData = await instance.readFile(outputName);

  // Cleanup virtual files di WASM FS
  try {
    await instance.deleteFile(inputName);
    await instance.deleteFile(outputName);
  } catch (_) {}

  // Jika preset Dolby Vision (hdrsilau / hdrig / isDolbyVision), suntikkan atom dvvC & container refinery
  if (preset.isDolbyVision || preset.id === 'hdrsilau' || preset.id === 'hdrig') {
    try {
      onLog(`[Dolby Vision 8.4] Menginjeksikan atom dvvC (DOVIDecoderConfigurationRecord) & Apple QuickTime brand...`);
      onProgress({ ratio: 0.98, text: 'Menginjeksikan Dolby Vision Profile 8.4...' });
      outputData = await patchVideoDolbyVision(outputData);
      onLog(`[Dolby Vision 8.4] ✅ Atom Dolby Vision 8.4 & container refinery berhasil disuntikkan!`);
    } catch (patchErr) {
      console.warn('[DOVI INJECTION WARNING]', patchErr);
      onLog(`[Dolby Vision 8.4] ⚠️ Injeksi Dolby Vision dilewati: ${patchErr.message}`);
    }
  }

  onProgress({ ratio: 1.0, text: 'Selesai!' });

  const outputBlob = new Blob([outputData.buffer || outputData], { type: 'video/mp4' });
  const outputUrl = URL.createObjectURL(outputBlob);

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
 * Instan Patch Dolby Vision 8.4 (Tanpa Render / 0 Detik)
 * Khusus video yang sudah diedit (misal di CapCut / Alight Motion) dan hanya butuh metadata Silau EDR
 */
export async function processInstantPatch({
  file,
  onProgress,
  onLog
}) {
  onLog(`[Instant Dolby Vision] Membaca file "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) langsung ke memory buffer...`);
  if (onProgress) onProgress({ ratio: 0.2, text: 'Membaca video ke memori...' });

  const arrayBuffer = await file.arrayBuffer();
  if (onProgress) onProgress({ ratio: 0.5, text: 'Menganalisis box MP4...' });

  onLog(`[Instant Dolby Vision] Menganalisis container MP4 dan menyuntikkan atom dvvC Profile 8.4 HLG...`);
  const patched = await patchVideoDolbyVision(new Uint8Array(arrayBuffer));
  if (onProgress) onProgress({ ratio: 0.9, text: 'Menyelesaikan injeksi QuickTime...' });

  onLog(`[Instant Dolby Vision] ✅ Atom DOVIDecoderConfigurationRecord (dvvC) & brand Apple QuickTime (qt  ) berhasil disuntikkan!`);
  if (onProgress) onProgress({ ratio: 1.0, text: 'Selesai!' });

  const outputBlob = new Blob([patched], { type: 'video/mp4' });
  const outputUrl = URL.createObjectURL(outputBlob);

  const baseName = (file.name || 'video')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);

  return {
    blob: outputBlob,
    url: outputUrl,
    size: outputBlob.size,
    name: `${baseName}_DOLBY_VISION_SILAU_INSTANT.mp4`
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
  const instance = await getFFmpegInstance();

  setActiveCallbacks(onLog, onProgress);

  const rawExt = (file.name && file.name.includes('.'))
    ? file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
    : (isVideo ? 'mp4' : 'jpg');
  const ext = isVideo 
    ? (['mp4', 'mov', 'webm', 'mkv'].includes(rawExt) ? rawExt : 'mp4')
    : (['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg');

  const inputName = `input_pp_${Date.now()}.${ext}`;
  const outputName = `out_pp_${Date.now()}.jpg`;

  if (onProgress) onProgress({ ratio: 0.1, text: 'Memuat gambar...' });
  onLog(`[PPHD] Memproses ${isVideo ? 'frame video' : 'foto'} ke format 1080x1080 Square 1:1...`);
  await instance.writeFile(inputName, await fetchFile(file));

  const args = ['-y'];

  if (isVideo) {
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
  if (onProgress) onProgress({ ratio: 0.5, text: 'Memotong 1:1 & Menajamkan Lanczos...' });
  await instance.exec(args);

  const outputData = await instance.readFile(outputName);

  try {
    await instance.deleteFile(inputName);
    await instance.deleteFile(outputName);
  } catch (_) {}

  if (onProgress) onProgress({ ratio: 1.0, text: 'Selesai!' });

  const outputBlob = new Blob([outputData.buffer || outputData], { type: 'image/jpeg' });
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
