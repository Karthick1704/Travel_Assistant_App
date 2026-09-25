import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plane, ArrowRight, X, Compass, Clock, Sparkles, MapPin } from 'lucide-react';
import { CountdownTime, getCountdown, getWorldClockTime, TIMEZONES, TRIP_START_DATE_ISO } from '../utils/timeUtils';
import { JapanScene } from './JapanScene';
import { RollingNumber } from './CountdownWidget';
import { Eyebrow, Pill } from './ui/primitives';

interface TripCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STOPS = ['Tokyo', 'DisneySea', 'teamLab', 'Mt Fuji', 'Osaka', 'Kyoto & Nara', 'Amanohashidate', 'Home'];

export const TripCountdownModal: React.FC<TripCountdownModalProps> = ({ isOpen, onClose }) => {
  const [countdown, setCountdown] = useState<CountdownTime>(getCountdown());
  const [clocks, setClocks] = useState<Record<string, { timeStr: string; dateStr: string }>>({});

  useEffect(() => {
    if (!isOpen) return;
    const tick = () => {
      setCountdown(getCountdown(TRIP_START_DATE_ISO));
      const now = new Date();
      const next: Record<string, { timeStr: string; dateStr: string }> = {};
      TIMEZONES.forEach((tz) => (next[tz.key] = getWorldClockTime(tz.tzCode, now)));
      setClocks(next);
    };
    tick();
    const id = setInterval(tick, 1000);
    document.body.style.overflow = 'hidden';
    return () => {
      clearInterval(id);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="countdown-welcome-screen"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] overflow-y-auto bg-ink-950 text-white"
        >
          {/* Japan-themed animated backdrop: lacquer indigo, gold moon, Fuji, kumo clouds, seigaiha, petals */}
          <JapanScene variant="screen" />

          {/* Content */}
          <div className="relative z-10 min-h-full flex flex-col">
            <div className="flex items-center justify-between px-5 sm:px-8 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl glass-dark flex items-center justify-center">
                  <Compass className="w-5 h-5 text-vermilion-400 animate-spin-slow" />
                </div>
                <div>
                  <Eyebrow className="text-white/50">Tokyo & Kansai</Eyebrow>
                  <div className="font-display font-bold tracking-tight">9-Day Explorer Guide</div>
                </div>
              </div>
              <button
                id="dismiss-countdown-btn"
                onClick={onClose}
                className="glass-dark rounded-2xl px-3 py-2 text-xs font-bold text-white/80 hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
              >
                Skip <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-6 text-center">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                <Pill tone="ink" className="bg-white/10 border-white/15 text-white/80" icon={<Plane className="w-3 h-3 text-jade-300 -rotate-45" />}>
                  Cathay Pacific CX 632 · MAA → HKG → NRT
                </Pill>
                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mt-5 leading-[0.95] text-balance">
                  Japan is
                  <br />
                  <span className="text-shimmer-gold">almost boarding.</span>
                </h1>
                <div className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-gold-300/80 to-transparent" />
                <p className="text-white/60 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
                  Departs Chennai on <span className="text-white font-bold">Sep 29, 2026 at 01:50 IST</span>. Nine days across Tokyo, Hakone, Mt Fuji, Osaka, Kyoto and the Tango coast.
                </p>
              </motion.div>

              {/* Big digits */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="mt-8 grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-3xl"
              >
                {[
                  { v: countdown.days, l: 'Days', c: 'text-gold-400' },
                  { v: countdown.hours, l: 'Hours', c: 'text-white' },
                  { v: countdown.minutes, l: 'Minutes', c: 'text-white' },
                  { v: countdown.seconds, l: 'Seconds', c: 'text-vermilion-400' },
                ].map((d) => (
                  <div key={d.l} className="glass-dark rounded-3xl py-4 sm:py-6">
                    <RollingNumber value={d.v} className={`font-mono text-3xl sm:text-5xl lg:text-6xl font-extrabold ${d.c}`} />
                    <div className="text-[10px] sm:text-xs uppercase font-extrabold tracking-[0.2em] text-white/45 mt-2">{d.l}</div>
                  </div>
                ))}
              </motion.div>

              {/* Clocks */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-3xl"
              >
                {TIMEZONES.map((tz) => {
                  const cur = clocks[tz.key] || { timeStr: '--:--:--', dateStr: '' };
                  const hot = tz.key === 'jst';
                  return (
                    <div key={tz.key} className={`glass-dark rounded-2xl px-4 py-3 flex items-center justify-between text-left ${hot ? 'ring-1 ring-vermilion-400/40' : ''}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{tz.flag}</span>
                        <div>
                          <div className="text-xs font-bold">{tz.label}</div>
                          <div className="text-[10px] text-white/50 font-medium">{tz.sublabel}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-extrabold tabular-nums">{cur.timeStr}</div>
                        <div className="text-[10px] text-white/45">{cur.dateStr}</div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Stops marquee */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-6 flex flex-wrap justify-center gap-2">
                {STOPS.map((s, i) => (
                  <span key={s} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/60">
                    <MapPin className="w-3 h-3 text-vermilion-400" />
                    {s}
                    {i < STOPS.length - 1 && <span className="text-white/25 ml-1">›</span>}
                  </span>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mt-8 flex flex-col items-center gap-3">
                <button
                  id="begin-japan-journey-btn"
                  onClick={onClose}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-b from-vermilion-500 to-vermilion-600 text-white font-extrabold text-base shadow-[var(--shadow-glow-vermilion)] hover:from-vermilion-400 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-gold-300" />
                  Begin the journey
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <p className="text-[11px] text-white/40 font-medium inline-flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> The live countdown stays pinned at the top of the guide.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
