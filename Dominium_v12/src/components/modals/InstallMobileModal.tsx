import React, { useState } from 'react';
import { Smartphone, X, Copy, Check, Share2, Sparkles, QrCode, ArrowRight } from 'lucide-react';

interface InstallMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallMobileModal: React.FC<InstallMobileModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const appUrl = typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
    ? window.location.origin 
    : 'https://dominium.app';

  if (!isOpen) return null;

  const handleCopy = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(appUrl).catch(() => {
          // Fallback if clipboard API throws in sandboxed iframe
          const textArea = document.createElement('textarea');
          textArea.value = appUrl;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
          } catch {}
          document.body.removeChild(textArea);
        });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = appUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch {}
        document.body.removeChild(textArea);
      }
    } catch {
      // Ignored safely
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // QR Code generator using a high-reliability Google Chart API or standard SVG QR representation
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}&bgcolor=16161a&color=fbbf24&margin=2`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0c0c0e] border border-amber-400/30 rounded-2xl p-5 sm:p-6 shadow-2xl overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Play on Your Phone
                <span className="bg-amber-400 text-zinc-950 text-[10px] font-black px-1.5 py-0.5 rounded uppercase">PWA App</span>
              </h2>
              <p className="text-xs text-zinc-400">Install Dominium as a full-screen mobile app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code & Link Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#141418] border border-zinc-800/80 rounded-xl p-4 mb-4 items-center">
          <div className="flex flex-col items-center justify-center text-center p-2 bg-[#0c0c0e] rounded-lg border border-zinc-800">
            <img 
              src={qrCodeUrl} 
              alt="Scan to open on phone" 
              className="w-32 h-32 rounded-md shadow-inner"
              loading="lazy"
            />
            <span className="text-[10px] text-zinc-400 mt-2 font-mono flex items-center gap-1">
              <QrCode className="w-3 h-3 text-amber-400" />
              Scan with Phone Camera
            </span>
          </div>

          <div className="flex flex-col justify-between h-full space-y-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 font-bold block mb-1">
                Direct App Link
              </span>
              <div className="flex items-center gap-1.5 bg-[#0c0c0e] border border-zinc-800 p-1.5 rounded-lg">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="bg-transparent text-xs text-zinc-300 font-mono flex-1 outline-none truncate px-1"
                />
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 space-y-1">
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Full screen & standalone
              </div>
              <p className="text-[11px] leading-relaxed">
                Save game data persists automatically on your device.
              </p>
            </div>
          </div>
        </div>

        {/* Step by Step Guide */}
        <div className="space-y-2.5 text-xs">
          <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[11px] font-mono">
            How to Install (Takes 5 seconds):
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* iOS Safari */}
            <div className="bg-[#141418] border border-zinc-800 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 font-bold text-zinc-200 mb-1.5">
                <span>🍎 iPhone / iPad (Safari)</span>
              </div>
              <ol className="text-[11px] text-zinc-400 space-y-1 list-decimal list-inside leading-snug">
                <li>Open the link in <b>Safari</b></li>
                <li>Tap the <b>Share</b> button <span className="text-zinc-200 font-mono">[↑]</span></li>
                <li>Select <b>"Add to Home Screen"</b></li>
                <li>Tap <b>"Add"</b> to finish</li>
              </ol>
            </div>

            {/* Android Chrome */}
            <div className="bg-[#141418] border border-zinc-800 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 font-bold text-zinc-200 mb-1.5">
                <span>🤖 Android (Chrome)</span>
              </div>
              <ol className="text-[11px] text-zinc-400 space-y-1 list-decimal list-inside leading-snug">
                <li>Open the link in <b>Chrome</b></li>
                <li>Tap the <b>Three Dots</b> <span className="text-zinc-200 font-mono">[⋮]</span> menu</li>
                <li>Tap <b>"Install app"</b> / <b>"Add to Home screen"</b></li>
                <li>Tap <b>"Install"</b> to confirm</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
