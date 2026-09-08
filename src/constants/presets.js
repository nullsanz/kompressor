/**
 * Master Preset FFmpeg Kompresor Anull
 * Direplikasi 100% dari bot-status-wa & bot-loker-bray
 */

export const PRESETS = [
  {
    id: 'khususwa',
    name: 'Status WA HD (1080p)',
    commandRef: '.khususwa / .1080p / .asli',
    badge: 'Paling Populer',
    badgeColor: 'emerald',
    icon: 'MessageCircle',
    description: 'Format tajam maksimal 1080p standar WhatsApp Status. Video jernih anti-buram dengan bitrate optimal.',
    target: 'WhatsApp Status & Chat',
    resolutionLabel: '1080p Full HD (Max 1920px)',
    crf: 23,
    preset: 'veryfast',
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
    id: 'khususig',
    name: 'Story IG Ultra HD (60 FPS)',
    commandRef: '.khususig / .igstory',
    badge: 'Ultra Smooth 60FPS',
    badgeColor: 'purple',
    icon: 'Instagram',
    description: 'Didesain khusus Story Instagram 60 FPS, color space BT.709 sRGB anti-pudar, dan audio 320k studio.',
    target: 'Instagram Story & Reels',
    resolutionLabel: 'Resolusi Asli (Genap) @ 60 FPS',
    crf: 17,
    preset: 'veryfast',
    scaleFilter: "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    fps: 60,
    audioBitrate: '320k',
    audioSampleRate: '48000',
    extraArgs: [
      '-profile:v', 'high',
      '-level', '4.2',
      '-maxrate', '12000k',
      '-bufsize', '24000k',
      '-pix_fmt', 'yuv420p',
      '-g', '60',
      '-keyint_min', '30',
      '-colorspace', 'bt709',
      '-color_primaries', 'bt709',
      '-color_trc', 'bt709',
      '-movflags', '+faststart'
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok HD (30 Mbps 60 FPS)',
    commandRef: '.tiktok / .tt',
    badge: 'Monster Bitrate',
    badgeColor: 'rose',
    icon: 'Music2',
    description: 'Profil Rein\'s Flow untuk jedag-jedug, beat transitions, canvas 9:16 vertikal, dan ketajaman teks maksimal.',
    target: 'TikTok & Shorts 9:16',
    resolutionLabel: '1080x1920 Vertikal @ 60 FPS',
    crf: 16,
    preset: 'veryfast',
    scaleFilter: "scale=1080:1920:force_original_aspect_ratio=decrease:flags=lanczos,pad=1080:1920:trunc((1080-iw)/2):trunc((1920-ih)/2):black,unsharp=5:5:0.8:3:3:0.4",
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
      '-colorspace', 'bt709',
      '-color_primaries', 'bt709',
      '-color_trc', 'bt709',
      '-brand', 'mp42',
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
    preset: 'veryfast',
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
    preset: 'veryfast',
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
