import React, { useRef, useState } from 'react';
import { UploadCloud, Film, Image as ImageIcon, X, FileVideo, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FileDropzone({ isDark, selectedFile, fileMetadata, onFileSelected, onClearFile }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndProcess = (file) => {
    if (!file) return;
    setDragError('');

    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(file.name);
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);

    if (!isVideo && !isImage) {
      setDragError('Format tidak didukung. Mohon masukkan file Video (MP4, MOV, WebM, MKV) atau Foto (JPG, PNG).');
      return;
    }

    // Inspect metadata
    if (isVideo) {
      const url = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = url;

      tempVideo.onloadedmetadata = () => {
        const metadata = {
          type: 'video',
          duration: tempVideo.duration || 0,
          width: tempVideo.videoWidth || 0,
          height: tempVideo.videoHeight || 0,
          aspectRatio: tempVideo.videoWidth && tempVideo.videoHeight 
            ? (tempVideo.videoWidth / tempVideo.videoHeight).toFixed(2) 
            : '1.78',
          size: file.size,
          previewUrl: url,
        };
        onFileSelected(file, metadata);
      };

      tempVideo.onerror = () => {
        // Fallback if video tag can't extract metadata
        onFileSelected(file, {
          type: 'video',
          duration: 0,
          width: 0,
          height: 0,
          aspectRatio: '1.78',
          size: file.size,
          previewUrl: url,
        });
      };
    } else {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        onFileSelected(file, {
          type: 'image',
          width: img.naturalWidth || 0,
          height: img.naturalHeight || 0,
          size: file.size,
          previewUrl: url,
        });
      };
      img.onerror = () => {
        onFileSelected(file, {
          type: 'image',
          width: 0,
          height: 0,
          size: file.size,
          previewUrl: url,
        });
      };
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*,.mp4,.mov,.mkv,.avi,.webm,.jpg,.jpeg,.png,.webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 group overflow-hidden ${
            isDragging
              ? 'border-rose-500 bg-rose-500/10 scale-[0.99] ring-4 ring-rose-500/20'
              : isDark
              ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'
              : 'border-slate-300 bg-white/60 hover:bg-white hover:border-slate-400 shadow-sm'
          }`}
        >
          {/* Decorative Glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-rose-500/5 via-pink-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-500/20 to-pink-500/20 border border-rose-500/30 text-rose-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <p className="text-base sm:text-lg font-bold">
                Pilih atau Tarik File Video / Foto ke Sini
              </p>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Mendukung MP4, MOV, MKV, WebM, serta Foto JPG/PNG untuk Profil 1:1
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                isDark ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <Film className="w-3.5 h-3.5 text-rose-500" />
                <span>Video Bebas Durasi</span>
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                isDark ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Foto Profil 1:1</span>
              </span>
            </div>
          </div>

          {dragError && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-500 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{dragError}</span>
            </div>
          )}
        </div>
      ) : (
        /* Selected File Card */
        <div className={`w-full rounded-3xl border p-4 sm:p-5 transition-all overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
            <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1 overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                {fileMetadata?.type === 'video' ? <FileVideo className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <h4 
                    className="font-bold text-sm sm:text-base truncate min-w-0 flex-1"
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </h4>
                  <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>Terpilih</span>
                  </span>
                </div>

                {/* Metadata Chips */}
                <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-slate-400 min-w-0">
                  <span className="font-semibold text-rose-500 shrink-0">
                    {formatBytes(selectedFile.size)}
                  </span>
                  {fileMetadata?.type === 'video' && fileMetadata.duration > 0 && (
                    <>
                      <span className="shrink-0">•</span>
                      <span className="truncate">Durasi: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{formatDuration(fileMetadata.duration)}</strong></span>
                    </>
                  )}
                  {fileMetadata?.width > 0 && fileMetadata?.height > 0 && (
                    <>
                      <span className="shrink-0">•</span>
                      <span className="truncate">Resolusi: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{fileMetadata.width} × {fileMetadata.height}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={onClearFile}
              className={`w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Ganti File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
