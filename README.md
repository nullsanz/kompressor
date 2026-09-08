# 🎬 Anull Kompresor • Web Video & Foto HD Studio

> **Web Video & Photo Compressor Client-Side Pertama Berbasis FFmpeg WebAssembly (WASM).**  
> Mengkloning 100% parameter FFmpeg dari Bot WhatsApp (`bot-status-wa` & `bot-loker-bray`) untuk bypass kompresi WhatsApp, Instagram Story, dan TikTok secara instan langsung di peramban browser Anda tanpa server backend!

---

## ✨ Fitur Unggulan

1. **100% Client-Side (Privasi Mutlak):**
   - Menggunakan `@ffmpeg/ffmpeg` WebAssembly.
   - Video dan foto diproses langsung di RAM/CPU laptop atau HP Anda.
   - **0% Upload ke Server Cloud** — data tidak pernah meninggalkan perangkat Anda.

2. **Kloning 100% Preset FFmpeg Bot WhatsApp:**
   - 🟢 **Status WA HD (1080p):** Preset `.khususwa` / `.1080p` (CRF 23, `veryfast`, auto-scale max 1920px, audio 64k, `+faststart`).
   - 🟣 **Story IG Ultra HD (60 FPS):** Preset `.khususig` (CRF 17, 12 Mbps bitrate, 60 FPS, color space **BT.709 sRGB** anti-pudar di Instagram, audio 320k studio).
   - 🎵 **TikTok HD 60 FPS (30 Mbps):** Preset `.tiktok` (CRF 16, 30 Mbps peak bitrate, Lanczos sharpening, format container `mp42`).
   - 🟡 **Hemat Kuota (720p & 560p):** Preset `.720p` dan `.560p` untuk video berdurasi panjang agar hemat memori.
   - 📸 **Foto Profil WA HD 1:1 (PPHD):** Ekstraksi frame video atau foto dengan auto-crop 1080x1080 bujur sangkar presisi + Lanczos pre-sharpening anti-blur server WhatsApp.
   - ⚙️ **Mode Kustom:** Slider fleksibel untuk CRF (14 - 32), resolusi kustom, FPS kustom, dan audio bitrate.

3. **Video Trimmer Interaktif:**
   - Visual dual-slider range trimmer dengan tombol cepat 1-klik:
     - `⚡ 0 - 30 Detik (Status WA)`
     - `⚡ 0 - 60 Detik (Story IG & Status WA Baru)`
     - `🎬 Penuh (Tanpa Potong)`

4. **Before vs After Preview Player:**
   - Pemutar pembanding video asli vs hasil kompresi.
   - Lencana persentase penghematan ukuran file (*contoh: 48 MB ➔ 11 MB • **-76% Lebih Ringan***).

5. **Responsivitas & Kompatibilitas Maksimal:**
   - Bebas horizontal overflow di mobile 320px–440px.
   - 2-Kolom Glassmorphism modern di desktop.
   - Dukungan zoom in / zoom out fleksibel (80% - 150%).
   - Dilengkapi konfigurasi COOP & COEP di `vite.config.js` dan `vercel.json`.

---

## 🚀 Menjalankan Secara Lokal

```bash
# Clone repositori
git clone https://github.com/nullsanz/kompressor.git
cd kompressor

# Pasang dependensi
npm install

# Jalankan server lokal
npm run dev

# Build untuk produksi
npm run build
```

---

## 🛠️ Tech Stack
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS, Lucide Icons, Glassmorphism UI
- **Processing Engine:** `@ffmpeg/ffmpeg` (WASM) & `@ffmpeg/util`
- **Celebration:** `canvas-confetti`

---

Dibuat dengan ❤️ oleh **Lukman (nullsanz)** • 2026 Edition
