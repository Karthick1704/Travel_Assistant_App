import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  Check,
  Copy,
  ExternalLink,
  X,
  Sparkles,
  WifiOff,
  ShieldCheck,
  ChevronRight,
  Info,
  Apple,
  Layers
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activePlatform, setActivePlatform] = useState<'iphone' | 'android' | 'qr'>('qr');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use the public shared URL or fallback to current window location
  const appUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-ork25mjcgxzlaxude362pw-477437799937.asia-southeast1.run.app';

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-paper-50 rounded-[32px] shadow-2xl border border-white/40 overflow-hidden flex flex-col max-h-[92vh] no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Branding */}
        <div className="relative bg-gradient-to-r from-ink-950 via-ink-900 to-ink-950 text-white p-6 sm:p-7 overflow-hidden grain">
          <div className="absolute -right-8 -top-8 w-44 h-44 bg-vermilion-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-12 bottom-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <button
            id="close-pwa-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src="/pwa-192x192.png"
              alt="Japan Travel App Icon"
              className="w-16 h-16 rounded-2xl shadow-lg border border-white/20 object-cover bg-slate-900"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-vermilion-500/20 border border-vermilion-400/40 text-vermilion-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Progressive Web App
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Offline Ready
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Install Japan Travel App on Your Phone
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Download to your home screen • Works offline across Tokyo, Kyoto & Osaka
              </p>
            </div>
          </div>
        </div>

        {/* Critical AI Studio Share Alert if Not Found */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 font-extrabold text-sm shadow-xs mt-0.5">
            !
          </div>
          <div className="space-y-1 text-left flex-1">
            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
              <span>Why did it show "Not Found" on Android?</span>
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              In Google AI Studio, the public mobile link is only activated after you click the <strong className="text-slate-900 font-extrabold underline decoration-amber-400 decoration-2">Share</strong> button in the top-right corner of your AI Studio screen!
            </p>
            <div className="pt-1.5 flex flex-wrap gap-2 text-[11px] font-bold text-amber-900">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/90 border border-amber-300">
                1. Click <strong>"Share"</strong> at top-right of AI Studio
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/90 border border-amber-300">
                2. Confirm & Publish Public Link
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                3. Scan QR or open on phone — works instantly!
              </span>
            </div>
          </div>
        </div>

        {/* Quick Direct Install Trigger (if browser supports one-click prompt) */}
        {isInstallable && (
          <div className="p-4 bg-vermilion-50 border-b border-vermilion-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Download className="w-5 h-5 text-vermilion-600 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Direct One-Click Install Detected!
                </p>
                <p className="text-[11px] text-slate-500">
                  Your browser supports instant installation directly to your device.
                </p>
              </div>
            </div>
            <button
              id="pwa-direct-install-btn"
              onClick={async () => {
                await install();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-vermilion-600 hover:bg-vermilion-700 text-white text-xs font-extrabold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-2 gap-2">
          <button
            id="pwa-tab-qr"
            onClick={() => setActivePlatform('qr')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activePlatform === 'qr'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-vermilion-500" />
            <span>Scan Phone QR</span>
          </button>
          <button
            id="pwa-tab-iphone"
            onClick={() => setActivePlatform('iphone')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activePlatform === 'iphone'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-800" />
            <span>iPhone / iPad</span>
          </button>
          <button
            id="pwa-tab-android"
            onClick={() => setActivePlatform('android')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activePlatform === 'android'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Android / Chrome</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: SCAN QR CODE TO OPEN ON PHONE */}
          {activePlatform === 'qr' && (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-md flex flex-col items-center flex-shrink-0">
                <QRCodeSVG
                  value={appUrl}
                  size={180}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: '/pwa-192x192.png',
                    x: undefined,
                    y: undefined,
                    height: 38,
                    width: 38,
                    excavate: true,
                  }}
                />
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                  Scan with Camera
                </span>
              </div>

              <div className="space-y-3 text-left">
                <h3 className="text-base font-extrabold text-slate-900">
                  1. Scan with your phone's camera
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Open the default <strong>Camera app</strong> on your iPhone or Android phone, point it at this QR code, and tap the yellow/blue link banner that appears on your screen.
                </p>

                <h3 className="text-base font-extrabold text-slate-900 pt-1">
                  2. Or copy and send the link to your phone:
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-700 select-all"
                  />
                  <button
                    id="copy-pwa-url-btn"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Once opened on your phone, follow the quick 2-step prompt below for your device.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: iPHONE / iOS SAFARI INSTRUCTIONS */}
          {activePlatform === 'iphone' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  On iPhone & iPad, Apple requires using the default <strong>Safari browser</strong> to install apps to your home screen.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-ink-900 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">Open in Safari</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Open the app URL in Safari on your iPhone.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-ink-900 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <span>Tap Share</span>
                    <Share2 className="w-3.5 h-3.5 text-blue-600 inline" />
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tap the <strong>Share</strong> button (box with an arrow pointing up) at the bottom toolbar of Safari.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-vermilion-600 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <span>Add to Home</span>
                    <PlusSquare className="w-3.5 h-3.5 text-vermilion-500 inline" />
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in the top right.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-ink-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>The app will appear on your iPhone screen with the official Japan Travel icon!</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID / CHROME INSTRUCTIONS */}
          {activePlatform === 'android' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-ink-900 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">Open in Chrome</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Open the link in Google Chrome or Samsung Internet on your Android device.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-ink-900 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">Tap 3-Dots (⋮)</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tap the <strong>three dots (⋮)</strong> in the top-right corner of Chrome, OR tap the banner that appears at the bottom.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">Install App</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-ink-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Installed like a native APK with standalone full-screen window and fast caching!</span>
                </div>
              </div>
            </div>
          )}

          {/* Benefits of Installing */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
              Why download to your phone?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <WifiOff className="w-4 h-4 text-vermilion-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">Works Offline</span>
                  <span className="text-slate-500 text-[10px]">Access all schedules & notes on trains without Wi-Fi.</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">Fullscreen Feel</span>
                  <span className="text-slate-500 text-[10px]">No browser URL bar or clutter, feels like a native app.</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">1-Tap Access</span>
                  <span className="text-slate-500 text-[10px]">Launches immediately right from your phone's home screen.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Japan Travel Guide PWA • Version 1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
