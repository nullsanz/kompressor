# 🎬 Anull Kompresor • Web Video & Foto Ultra HD Studio

<p align="center">
  <a href="https://kompres.anull.cloud">
    <img src="https://img.shields.io/badge/Live_Demo-kompres.anull.cloud-f43f5e?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://github.com/nullsanz/kompressor/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="License" />
  </a>
  <img src="https://img.shields.io/badge/Engine-FFmpeg_WebAssembly-3b82f6?style=for-the-badge&logo=webassembly&logoColor=white" alt="FFmpeg WASM" />
  <img src="https://img.shields.io/badge/Frontend-React_18_+_Vite-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

> **Studio Kompresi Video & Foto Ultra HD 100% Client-Side Berbasis FFmpeg WebAssembly (WASM).**  
> Mengkloning algoritma encoding FFmpeg dari Bot WhatsApp (`bot-status-wa` & `bot-loker-bray`) untuk bypass kompresi WhatsApp, Instagram Story 60 FPS, dan TikTok langsung di peramban browser Anda tanpa antrean server!

---

## 🌐 Akses Langsung (Live Web)
Kunjungi platform secara gratis tanpa login di:  
👉 **[https://kompres.anull.cloud](https://kompres.anull.cloud)**

---

## 💡 Mengapa Anull Kompresor Berbeda?

Sebagian besar web kompresor video online mengunggah file Anda ke server cloud pihak ketiga (antrean lambat, membatasi ukuran, dan membahayakan privasi video pribadi). **Anull Kompresor menjalankan seluruh engine FFmpeg langsung di peramban web browser Anda!**

1. **🔒 100% Privasi Mutlak (Zero Server Upload):**
   - Didukung `@ffmpeg/ffmpeg` WebAssembly ESM v0.12.
   - Video dan foto diproses di RAM & CPU lokal perangkat Anda (Laptop/PC/HP Android/iOS).
   - Berkas tidak pernah meninggalkan perangkat atau dikirim ke server mana pun.

2. **📱 Layar HP Tetap Nyala (Screen Wake Lock API):**
   - Dilengkapi sistem *Anti-Sleep* otomatis.
   - Layar smartphone tidak akan pernah redup atau mati sendiri selama proses encoding berlangsung, sehingga terhindar dari proses terhenti di latar belakang.

3. **⚡ Ganti Preset Instan (Footage Sama):**
   - Selesai kompres untuk Status WA dan ingin mencoba versi Story IG atau TikTok?
   - Cukup 1-klik tombol *Ganti Preset (File Sama)* tanpa perlu upload ulang dari galeri.

4. **🚀 Audio-Video Interleaving Rapat (`-max_interleave_delta 0`):**
   - Mengeliminasi *audio buffer starvation* yang sering membuat video buffering atau muter-muter saat diunggah ke TikTok atau Instagram.

5. **🛡️ Anti-Memory Leak & Throttled HUD:**
   - Pembersihan memori virtual WASM (`MEMFS`) otomatis pada blok `try...finally`.
   - Logging batching (~150ms) mencegah *render queue starvation* pada React, menjamin persentase progres dan konsol terminal berjalan lancar tanpa freeze.

---

## 🎛️ Katalog Preset FFmpeg

Semua preset dikalibrasi presisi agar lolos dari kompresi agresif algoritma media sosial:

| Preset | Resolusi & FPS | Bitrate / CRF | Filter Khusus | Peruntukan Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Status WA HD** | 1080p • Original FPS | CRF 23 • Veryfast | FastStart Muxing, Audio 64k | Status WhatsApp standar tajam anti-buram |
| **WA Kinclong** | 1080p • 60 FPS | CRF 20 • Slow | Luminescence Curve (`eq=1.12:0.03:1.2`) + Unsharp | Status WhatsApp paling cerah, mengkilap & kinclong |
| **Story IG 30k** | 1080p • 60 FPS Murni | CRF 15 • 30 Mbps VBR | BT.709 Gamut, Lanczos, Audio 320k 48kHz | Instagram Story & Reels jernih bebas pecah |
| **TikTok HD** | 1080×1920 (9:16) • 60 FPS | CRF 15 • 30 Mbps VBR | Dynamic Luminescence, Lanczos Pre-Sharpen | TikTok Studio Desktop via ekstensi anti-kompres |
| **Hemat Kuota** | 720p / 560p | CRF 26 • Veryfast | Auto Scale Down, Fast Muxing | Video durasi panjang agar ukuran file sangat ringan |
| **Foto Profil 1:1** | 1080×1080 Square | JPEG Q1 (Lossless) | Auto-Crop 1:1, Lanczos Sharpening | Foto Profil WhatsApp HD anti-blur |
| **Mode Kustom** | Fleksibel Penuh | Slider CRF 14–32 | Resolusi, FPS, dan Audio Bebas | Kebutuhan grading & tuning spesifik pengguna |

---

## 📲 Panduan Pasang Hasil Kompresi ke Medsos

### 1. Status WhatsApp HD
- Klik tombol **Kirim ke WA** di web (otomatis mengunduh video dan membuka WhatsApp).
- Buka tab **Pembaruan / Status** ➔ Buat status baru ➔ Pilih video yang baru diunduh.
- Video akan tayang dalam resolusi Full HD tanpa dikompres buram oleh WhatsApp.

### 2. Instagram Story 60 FPS
- Klik tombol **Kirim ke IG** di web.
- Buka aplikasi **Instagram** ➔ Buat **Cerita Anda (Story)** atau **Reels** ➔ Pilih video dari galeri.
- Bitrate tinggi 30 Mbps dan 60 FPS akan dipertahankan dengan warna BT.709 yang tajam.

### 3. TikTok HD Anti-Kompres (Bypass Server TikTok)
- **Aturan Mutlak:** Jangan upload lewat aplikasi TikTok HP biasa karena server TikTok otomatis mengompres paksa menjadi 720p 30 FPS.
- **Langkah Resmi:**
  1. Di HP Android, gunakan salah satu browser pendukung ekstensi: **Quetta Browser** (Direkomendasikan), **Lemur Browser**, atau **Kiwi Browser** (atau Chrome di PC).
  2. Pasang ekstensi **[Nullsanz TikTok Studio](https://github.com/nullsanz/tiktok)**.
  3. Buka situs [tiktok.com/tiktokstudio/upload](https://www.tiktok.com/tiktokstudio/upload) dalam **Mode Desktop**.
  4. Upload video hasil kompresi website ini di kotak upload ekstensi. Video terbit 100% jernih dan bebas kompresi!

---

## 🚀 Menjalankan Secara Lokal (Development)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru.
- npm / pnpm / yarn.

### Langkah Instalasi
```bash
# 1. Clone repositori ini
git clone https://github.com/nullsanz/kompressor.git
cd kompressor

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembangan (development)
npm run dev
```

Buka peramban di `http://localhost:5173`.

### Build untuk Produksi
```bash
npm run build
```
File siap saji akan dibuat di folder `dist/`.

---

## ⚙️ Persyaratan Server Header (COOP & COEP)

FFmpeg WebAssembly memerlukan `SharedArrayBuffer` untuk komputasi multi-threading. Untuk mengaktifkannya, server web (seperti Vercel, Netlify, atau Nginx) wajib mengirimkan HTTP response header berikut:

```http
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

Pengaturan ini sudah terkonfigurasi secara otomatis di file `vercel.json` dan `vite.config.js`.

---

## 📁 Struktur Direktori

```
kompressor/
├── public/                 # Aset statis & logo
├── src/
│   ├── components/         # Komponen UI React
│   │   ├── Navbar.jsx          # Header brand & indikator Anti-Sleep
│   │   ├── FileDropzone.jsx    # Drag & drop upload berkas
│   │   ├── VideoTrimmer.jsx    # Dual-slider pemotong durasi
│   │   ├── PresetSelector.jsx  # Pilihan kartu preset FFmpeg
│   │   ├── CustomSettings.jsx  # Panel parameter manual
│   │   ├── ProgressCard.jsx    # HUD metrik 3-box & log terminal
│   │   ├── ResultComparison.jsx# Pratinjau pembanding, share & ganti preset
│   │   ├── TikTokGuideModal.jsx# Modal pop-up panduan ekstensi TikTok
│   │   └── Footer.jsx          # Footer & tautan ekosistem
│   ├── constants/
│   │   └── presets.js          # Definisi racikan parameter FFmpeg
│   ├── services/
│   │   ├── ffmpegEngine.js     # Runner WASM, MEMFS cleanup & stream decoder
│   │   └── wakeLockService.js  # Screen Wake Lock API controller
│   ├── App.jsx             # State orkestrasi & throttled log buffer
│   ├── index.css           # Styling retro blocky arcade & design tokens
│   └── main.jsx            # Entry point React
├── index.html              # HTML shell & font definitions
├── vercel.json             # Konfigurasi COOP/COEP & routing Vercel
├── vite.config.js          # Konfigurasi Vite & dev server headers
├── package.json            # Manifest paket dependensi
└── LICENSE                 # Lisensi MIT
```

---

## 🛠️ Tech Stack
- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Processing Core:** [`@ffmpeg/ffmpeg`](https://ffmpegwasm.netlify.app/) (WebAssembly v0.12) & [`@ffmpeg/util`](https://github.com/ffmpegwasm/util)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Visual FX:** [Canvas Confetti](https://www.kirilv.com/canvas-confetti/)
- **Device APIs:** [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) & [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT](LICENSE). Bebas digunakan, dimodifikasi, dan didistribusikan untuk keperluan personal maupun komersial.

Dibuat dengan ❤️ oleh **[Lukmanul Hakim (nullsanz)](https://github.com/nullsanz)** • 2026 Edition  
Bagian dari ekosistem **[anull.cloud](https://anull.cloud)**
