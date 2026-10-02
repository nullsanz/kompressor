/**
 * Master Preset FFmpeg Kompresor Anull (WASM Ultra-Fast + Dolby Vision Profile 8.4)
 * Direplikasi 100% dari bot-status-wa & bot-loker-bray
 * Dilengkapi Dynamic Luminescence, Contrast Boost, & Dolby Vision dvvC Injector
 */

export const PRESETS = [
  {
    id: 'fastpatch',
    name: '⚡ Instan Patch Dolby Vision 8.4 (Layar Silau EDR 4000 Nits)',
    commandRef: 'Tanpa Render / 0.1 Detik',
    badge: 'Paling Terang • 4000 Nits EDR',
    badgeColor: 'cyan',
    icon: 'Zap',
    isInstantPatch: true,
    isDolbyVision: true,
    description: 'Standar Industri quietvoid/dovi_tool: Menyuntikkan NAL 62 RPU (MaxCLL 4000 Nits EDR + L2 Neutral Trims) + colr HLG + atom dvvC ke video HEVC tanpa render ulang! Hanya butuh 0.1 detik, 100% warna natural tanpa muka merah bata & memicu backlight silau maksimal di layar iPhone & AMOLED Android! (⚠️ WAJIB: Video hasil export CapCut dengan format H.265 / HEVC).',
    target: 'Video HEVC Jadi Dolby Vision Asli 4000 Nits',
    resolutionLabel: 'Kualitas Asli 100% Lossless (0.1 Detik)'
  },
  {
    id: 'hdrsilau',
    name: 'TikTok JJ Dolby Vision Silau (4000 Nits EDR)',
    commandRef: '.hdrsilau / .jjtiktok / .jjsilau',
    badge: 'Brutal Silau • 4000 Nits EDR',
    badgeColor: 'amber',
    icon: 'Zap',
    isDolbyVision: true,
    description: 'Formula Brutal Silau 4000 Nits EDR (Wanxzyy Aesthetic Edition): Menarik highlights lampu, flash JJ, dan pantulan ke tingkat silau maksimal (4000 Nits EDR) dengan warna kulit bersih natural tanpa muka merah! Menggunakan kurva ekspansi luminansi agresif + desaturasi cerdas + unsharp micro-contrast.',
    target: 'TikTok JJ & FYP (Dolby Vision 4000 Nits)',
    resolutionLabel: '1080x1920 Vertikal 9:16 (35 Mbps)',
    crf: 17,
    preset: 'ultrafast',
    scaleFilter: "scale=1080:1920:force_original_aspect_ratio=decrease:flags=lanczos,pad=1080:1920:trunc((1080-iw)/2):trunc((1920-ih)/2):black,setsar=1,curves=all='0/0 0.20/0.26 0.40/0.52 0.55/0.75 0.70/0.93 0.82/1.0 1/1',eq=saturation=0.80,unsharp=3:3:0.9:3:3:0.0",
    fps: 60,
    audioBitrate: '192k',
    audioSampleRate: '48000',
    extraArgs: [
      '-profile:v', 'high',
      '-level', '4.2',
      '-maxrate', '35000k',
      '-bufsize', '70000k',
      '-pix_fmt', 'yuv420p',
      '-g', '60',
      '-keyint_min', '30',
      '-brand', 'isom',
      '-movflags', '+faststart'
    ]
  },
  {
    id: 'hdrig',
    name: 'Story & Reels IG Dolby Vision Silau (15 Mbps)',
    commandRef: '.hdrig / .sghdr',
    badge: 'Brutal Silau • Sweet Spot Meta',
    badgeColor: 'purple',
    icon: 'Instagram',
    isDolbyVision: true,
    description: 'Formula Brutal Silau 4000 Nits EDR untuk Instagram Story & Reels: Mengoptimalkan kontras & highlights silau mengkilap dengan bitrate 15 Mbps Sweet Spot anti-kompres Meta. Kulit wajah tetap cerah bening alami.',
    target: 'Instagram Story & Reels',
    resolutionLabel: 'Resolusi Asli @ 60 FPS (15 Mbps)',
    crf: 17,
    preset: 'ultrafast',
    scaleFilter: "scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=1,curves=all='0/0 0.20/0.26 0.40/0.52 0.55/0.75 0.70/0.93 0.82/1.0 1/1',eq=saturation=0.80,unsharp=3:3:0.9:3:3:0.0",
    fps: 60,
    audioBitrate: '192k',
    audioSampleRate: '48000',
    extraArgs: [
      '-profile:v', 'high',
      '-level', '4.2',
      '-maxrate', '15000k',
      '-bufsize', '30000k',
      '-pix_fmt', 'yuv420p',
      '-g', '60',
      '-keyint_min', '30',
      '-brand', 'isom',
      '-movflags', '+faststart'
    ]
  },
  {
    id: 'khususig30k',
    name: 'Story IG Ultra HD 30k (SDR Studio 60 FPS)',
    commandRef: '.khususig30k / .ig30k',
    badge: 'Monster Bitrate 30 Mbps',
    badgeColor: 'purple',
    icon: 'Instagram',
    description: 'Bitrate monster 30 Mbps SDR Rec.709 standar studio. Kualitas video kristal tajam, kontras jernih, dan 0% risiko redup di layar HP follower non-AMOLED.',
    target: 'Instagram Story & Reels',
    resolutionLabel: 'Resolusi Asli @ 60 FPS (30 Mbps)',
    crf: 16,
    preset: 'ultrafast',
    scaleFilter: "scale=trunc(iw/2)*2:trunc(ih/2)*2,unsharp=3:3:0.6:3:3:0.3,eq=brightness=0.03:contrast=1.10:saturation=1.15",
    fps: 60,
    audioBitrate: '256k',
    audioSampleRate: '48000',
    extraArgs: [
      '-profile:v', 'high',
      '-level', '4.2',
      '-maxrate', '30000k',
      '-bufsize', '60000k',
      '-pix_fmt', 'yuv420p',
      '-g', '60',
      '-keyint_min', '30',
      '-brand', 'mp42',
      '-movflags', '+faststart'
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok HD (30 Mbps 60 FPS Anti-Blur)',
    commandRef: '.khusustiktok / .tiktok',
    badge: '30 Mbps Jedag-Jedug',
    badgeColor: 'rose',
    icon: 'Music2',
    description: 'Format canvas 9:16 vertikal 1080x1920, 60 FPS, GOP 1 detik beat-drop presisi, unsharp, dan dynamic contrast boost anti-buram kompresi TikTok.',
    target: 'TikTok & Shorts 9:16',
    resolutionLabel: '1080x1920 Vertikal @ 60 FPS',
    crf: 16,
    preset: 'ultrafast',
    scaleFilter: "scale=1080:1920:force_original_aspect_ratio=decrease:flags=bicubic,pad=1080:1920:trunc((1080-iw)/2):trunc((1920-ih)/2):black,unsharp=3:3:0.6:3:3:0.3,eq=brightness=0.03:contrast=1.10:saturation=1.15",
    fps: 60,
    audioBitrate: '256k',
    audioSampleRate: '48000',
    extraArgs: [
      '-profile:v', 'high',
      '-level', '4.2',
      '-maxrate', '30000k',
      '-bufsize', '60000k',
      '-pix_fmt', 'yuv420p',
      '-g', '60',
      '-keyint_min', '30',
      '-brand', 'mp42',
      '-movflags', '+faststart'
    ]
  },
  {
    id: 'hdrwa',
    name: 'Status WA Pseudo-HDR Luminescence',
    commandRef: '.hdrwa / .swhdr',
    badge: '1080p Kinclong Maksimal',
    badgeColor: 'emerald',
    icon: 'MessageCircle',
    description: 'Ekspansi kurva luminansi & kontras Status WA 1080p 60 FPS. Video tampil paling cerah, tajam, dan kinclong dibanding status lain tanpa distorsi buram WA.',
    target: 'WhatsApp Status (Kinclong)',
    resolutionLabel: '1080p Full HD @ 60 FPS',
    crf: 20,
    preset: 'ultrafast',
    scaleFilter: "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))',unsharp=3:3:0.7:3:3:0.4,eq=brightness=0.03:contrast=1.12:saturation=1.20",
    fps: 60,
    audioBitrate: '96k',
    audioSampleRate: '44100',
    extraArgs: [
      '-profile:v', 'high',
      '-level', '4.1',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart'
    ]
  },
  {
    id: 'khususwa',
    name: 'Status WA HD Standar (1080p)',
    commandRef: '.khususwa / .1080p / .asli',
    badge: 'Paling Populer',
    badgeColor: 'emerald',
    icon: 'MessageCircle',
    description: 'Format tajam maksimal 1080p standar WhatsApp Status. Ukuran file efisien dan kompatibel dengan semua versi WhatsApp.',
    target: 'WhatsApp Status & Chat',
    resolutionLabel: '1080p Full HD (Max 1920px)',
    crf: 23,
    preset: 'ultrafast',
    scaleFilter: "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'",
    audioBitrate: '64k',
    audioSampleRate: '44100',
    extraArgs: [
      '-profile:v', 'high',
      '-level', '4.1',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart'
    ]
  },
  {
    id: '720p',
    name: 'Hemat Kuota (720p HD)',
    commandRef: '.720p',
    badge: 'Ukuran Ringan',
    badgeColor: 'amber',
    icon: 'Wifi',
    description: 'Kompromi terbaik antara kualitas jernih dan ukuran hemat kuota. Cocok untuk video durasi agak panjang.',
    target: 'WhatsApp & Kirim Cepat',
    resolutionLabel: '720p HD (Max 1280px)',
    crf: 25,
    preset: 'ultrafast',
    scaleFilter: "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'",
    audioBitrate: '64k',
    audioSampleRate: '44100',
    extraArgs: [
      '-profile:v', 'high',
      '-level', '4.1',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart'
    ]
  },
  {
    id: '560p',
    name: 'Super Hemat Kuota (560p)',
    commandRef: '.560p',
    badge: 'Super Kecil',
    badgeColor: 'slate',
    icon: 'HardDrive',
    description: 'Ukuran file super mini (< 10 MB) untuk koneksi internet lambat atau kuota pas-pasan.',
    target: 'Jaringan Lemah / Dokumen',
    resolutionLabel: '560p (Max 996px)',
    crf: 26,
    preset: 'ultrafast',
    scaleFilter: "scale='if(gt(iw,ih),min(996,iw),-2)':'if(gt(iw,ih),-2,min(996,ih))'",
    audioBitrate: '48k',
    audioSampleRate: '44100',
    extraArgs: [
      '-profile:v', 'high',
      '-level', '4.1',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart'
    ]
  },
  {
    id: 'pphd',
    name: 'Foto Profil WA HD (1:1 PPHD)',
    commandRef: '.pphd / .khususpp',
    badge: '1:1 Square Auto-Crop',
    badgeColor: 'cyan',
    icon: 'UserCheck',
    description: 'Auto-center crop bujur sangkar 1:1 1080x1080 + filter Lanczos Pre-Sharpening anti-blur server WhatsApp.',
    target: 'Foto Profil WhatsApp',
    resolutionLabel: '1080x1080 Square 1:1',
    isImageOnly: true,
    scaleFilter: "crop='min(iw,ih)':'min(iw,ih)',scale=1080:1080:flags=lanczos,unsharp=5:5:1.2:3:3:0.6",
    extraArgs: [
      '-q:v', '1'
    ]
  }
];

export const DURATION_LIMITS = [
  { label: '30s (Status WA Lama)', seconds: 30 },
  { label: '60s (Status WA Baru & Story IG)', seconds: 60 },
  { label: 'Penuh (Tanpa Potong)', seconds: 0 },
];
