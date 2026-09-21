import React from 'react';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-auto py-8 border-t border-slate-200/90 bg-white text-slate-600 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Security & Privacy Banner */}
        <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="font-bold text-slate-900 block">
                Privasi 100% Aman & Terjamin
              </strong>
              <p className="text-[11px] text-slate-500 font-medium">
                Seluruh video dan foto diproses di browser HP/Laptop Anda menggunakan WebAssembly. Tidak ada file yang dikirim ke server.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            Zero Server Upload
          </span>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 flex-wrap justify-center text-slate-600">
            <span>Anull Kompresor HD Studio • Bagian dari ekosistem</span>
            <a 
              href="https://null.cloud" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-rose-600 hover:underline flex items-center gap-0.5"
            >
              <span>anull.cloud</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <a href="https://qr.anull.cloud" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-rose-600 transition-colors">
              QR Studio
            </a>
            <a href="https://qr.anull.cloud/link" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-rose-600 transition-colors">
              Shortlink
            </a>
            <a href="https://qr.anull.cloud/tiktok" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-rose-600 transition-colors">
              Downloader
            </a>
            <a href="https://lokerbrayy.anull.cloud" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-rose-600 transition-colors">
              Loker Bray
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
          Dibuat dengan <Heart className="w-3 h-3 text-rose-600 fill-rose-600 inline" /> oleh Lukman (nullsanz) • 2026 Edition
        </p>
      </div>
    </footer>
  );
}
