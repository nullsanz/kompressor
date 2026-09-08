import React from 'react';
import { ShieldCheck, Heart, ExternalLink, Sparkles } from 'lucide-react';

export default function Footer({ isDark }) {
  return (
    <footer className={`w-full mt-auto py-8 border-t transition-colors ${
      isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
    }`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Security & Privacy Banner */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-center sm:text-left ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="font-bold text-slate-200 dark:text-white block">
                Privasi 100% Aman & Terjamin
              </strong>
              <p className="text-[11px] text-slate-400">
                Seluruh video dan foto diproses di browser HP/Laptop Anda menggunakan WebAssembly. Tidak ada file yang dikirim ke server.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Zero Server Upload
          </span>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span>Anull Kompresor HD Studio • Bagian dari ekosistem</span>
            <a 
              href="https://null.cloud" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-rose-500 hover:underline flex items-center gap-0.5"
            >
              <span>anull.cloud</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="https://lokerbrayy.anull.cloud" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">
              Loker Bray Portal
            </a>
            <a href="https://qr.anull.cloud" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">
              QR Studio
            </a>
            <a href="https://testbrayy.anull.cloud" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">
              Test Psikotes
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          Dibuat dengan <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> oleh Lukman (nullsanz) • 2026 Edition
        </p>
      </div>
    </footer>
  );
}
