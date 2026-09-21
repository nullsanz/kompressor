import React, { useRef, useState } from 'react';
import { UploadCloud, Film, Image as ImageIcon, X, FileVideo, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FileDropzone({ selectedFile, fileMetadata, onFileSelected, onClearFile }) {
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
          className={`relative w-full rounded-xl border-3 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group overflow-hidden ${
            isDragging
              ? 'border-slate-900 bg-[#ffe4e6]/50 shadow-[6px_6px_0px_0px_#111827] -translate-y-1'
              : 'border-slate-900 bg-white hover:bg-slate-50/50 shadow-[4px_4px_0px_0px_#111827] hover:shadow-[6px_6px_0px_0px_#111827]'
          }`}
        >
          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#ffe4e6] border-3 border-slate-900 text-rose-700 flex items-center justify-center shadow-[3px_3px_0px_0px_#111827] group-hover:scale-105 transition-transform duration-200">
              <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <p className="font-heading text-xl sm:text-2xl text-slate-900 tracking-wide uppercase">
                Pilih atau Tarik File Video / Foto ke Sini
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-600">
                Mendukung MP4, MOV, MKV, WebM, serta Foto JPG/PNG untuk Profil 1:1
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider bg-[#ffd1ba] text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
                <Film className="w-3.5 h-3.5 text-slate-900" />
                <span>Video Bebas Durasi</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider bg-[#dbeafe] text-blue-950 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
                <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                <span>Foto Profil 1:1</span>
              </span>
            </div>
          </div>

          {dragError && (
            <div className="mt-4 p-3 bg-[#ffe4e6] border-2 border-slate-900 rounded-md text-xs text-rose-950 font-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#111827]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
              <span>{dragError}</span>
            </div>
          )}
        </div>
      ) : (
        /* Selected File Card */
        <div className="w-full rounded-xl border-3 border-slate-900 bg-white p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111827] transition-all overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
            <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1 overflow-hidden">
              <div className="w-12 h-12 rounded-lg bg-[#ffe4e6] border-3 border-slate-900 text-rose-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#111827] shrink-0">
                {fileMetadata?.type === 'video' ? <FileVideo className="w-6 h-6 text-slate-900" /> : <ImageIcon className="w-6 h-6 text-slate-900" />}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <h4 
                    className="font-black text-sm sm:text-base text-slate-900 truncate min-w-0 flex-1"
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </h4>
                  <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#d0fae5] text-emerald-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#111827] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-700" />
                    <span>Terpilih</span>
                  </span>
                </div>

                {/* Metadata Chips */}
                <div className="flex items-center gap-2 flex-wrap mt-1.5 text-xs font-bold text-slate-600 min-w-0">
                  <span className="text-slate-900 bg-[#ffd1ba] px-2 py-0.5 rounded-md border-2 border-slate-900 font-black shrink-0 shadow-[1.5px_1.5px_0px_0px_#111827]">
                    {formatBytes(selectedFile.size)}
                  </span>
                  {fileMetadata?.type === 'video' && fileMetadata.duration > 0 && (
                    <>
                      <span className="shrink-0 text-slate-400">•</span>
                      <span className="truncate">Durasi: <strong className="text-slate-900 font-mono font-black">{formatDuration(fileMetadata.duration)}</strong></span>
                    </>
                  )}
                  {fileMetadata?.width > 0 && fileMetadata?.height > 0 && (
                    <>
                      <span className="shrink-0 text-slate-400">•</span>
                      <span className="truncate">Resolusi: <strong className="text-slate-900 font-mono font-black">{fileMetadata.width} × {fileMetadata.height}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={onClearFile}
              className="w-full sm:w-auto justify-center px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 shadow-[2px_2px_0px_0px_#111827] hover:shadow-[3px_3px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Ganti File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
