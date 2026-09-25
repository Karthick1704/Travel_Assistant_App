import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Maximize2, Plane, Sparkles } from 'lucide-react';
import { CountdownTime, getCountdown, getWorldClockTime, TIMEZONES, TRIP_START_DATE_ISO } from '../utils/timeUtils';
import { Eyebrow, Pill } from './ui/primitives';

interface CountdownWidgetProps {
  onOpenCountdownModal: () => void;
}

/** Rolling digit: animates when the value changes. */
export const RollingNumber: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => {
  const str = String(value).padStart(2, '0');
  return (
    <span className={`relative inline-flex overflow-hidden tabular-nums ${className}`} aria-live="off">
      {str.split('').map((ch, i) => (
        <span key={i} className="relative inline-block w-[0.62em] h-[1em] leading-none">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={ch}
              initial={{ y: '0.9em', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-0.9em', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
};

const TOTAL_WINDOW_SECONDS = 60 * 60 * 24 * 90; // ring shows the final 90 days

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({ onOpenCountdownModal }) => {
  const [countdown, setCountdown] = useState<CountdownTime>(getCountdown());
  const [clocks, setClocks] = useState<Record<string, { timeStr: string; dateStr: string }>>({});

  useEffect(() => {
    const tick = () => {
      setCountdown(getCountdown(TRIP_START_DATE_ISO));
      const now = new Date();
      const next: Record<string, { timeStr: string; dateStr: string }> = {};
      TIMEZONES.forEach((tz) => (next[tz.key] = getWorldClockTime(tz.tzCode, now)));
      setClocks(next);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const progress = Math.min(1, Math.max(0, 1 - countdown.totalSeconds / TOTAL_WINDOW_SECONDS));
  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <section
      id="persistent-countdown-widget"
      className="relative overflow-hidden rounded-[28px] bg-ink-900/60 backdrop-blur-xl text-white border border-gold-400/25 shadow-[0_30px_70px_-40px_rgba(2,6,23,0.9),inset_0_1px_0_rgba(253,230,138,0.12)]"
    >
      {/* gold corner glow */}
      <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-gold-400/10 blur-3xl animate-aurora pointer-events-none" />
      <div className="absolute -bottom-28 right-10 w-96 h-96 rounded-full bg-vermilion-500/10 blur-3xl animate-aurora [animation-delay:-6s] pointer-events-none" />
      {/* thin gold rule */}
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/60 to-transparent pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left: label + ring */}
        <div className="lg:col-span-4 flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
              <motion.circle
                cx="32"
                cy="32"
                r={R}
                fill="none"
                stroke="url(#cd-grad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={C}
                animate={{ strokeDashoffset: C * (1 - progress) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="cd-grad" x1="0" x2="1">
                  <stop offset="0" stopColor="#fbbf24" />
                  <stop offset="1" stopColor="#ff6b5e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Plane className="w-5 h-5 text-gold-400 -rotate-45" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Eyebrow className="text-white/50">Departure countdown</Eyebrow>
              <Pill tone="ink" mono className="bg-white/10 border-white/15 text-gold-300">
                Sep 29 · 01:50 IST
              </Pill>
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold tracking-tight mt-1 leading-tight">
              {countdown.isStarted ? 'Your Japan journey has begun' : 'Until wheels-up on CX 632'}
            </h3>
            <p className="text-[11px] text-white/55 font-medium mt-0.5 truncate">Chennai (MAA) → Hong Kong (HKG) → Tokyo Narita (NRT)</p>
          </div>
        </div>

        {/* Middle: digits */}
        <div className="lg:col-span-5 grid grid-cols-4 gap-2">
          {[
            { v: countdown.days, l: 'Days', c: 'text-gold-400' },
            { v: countdown.hours, l: 'Hours', c: 'text-white' },
            { v: countdown.minutes, l: 'Mins', c: 'text-white' },
            { v: countdown.seconds, l: 'Secs', c: 'text-vermilion-400' },
          ].map((d) => (
            <div key={d.l} className="rounded-2xl bg-white/[0.06] border border-white/10 px-2 py-2.5 text-center backdrop-blur">
              <RollingNumber value={d.v} className={`font-mono text-2xl sm:text-3xl font-extrabold ${d.c}`} />
              <div className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-[0.18em] text-white/45 mt-1">{d.l}</div>
            </div>
          ))}
        </div>

        {/* Right: clocks + CTA */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-1.5">
            {TIMEZONES.map((tz) => {
              const cur = clocks[tz.key] || { timeStr: '--:--', dateStr: '' };
              return (
                <div key={tz.key} className={`rounded-xl px-2 py-1.5 border ${tz.key === 'jst' ? 'bg-vermilion-500/15 border-vermilion-400/30' : 'bg-white/[0.05] border-white/10'}`}>
                  <div className="text-[9px] font-extrabold tracking-widest text-white/50 flex items-center gap-1">
                    <span>{tz.flag}</span>
                    <span>{tz.key.toUpperCase()}</span>
                  </div>
                  <div className="font-mono text-[11px] font-extrabold text-white tabular-nums">{cur.timeStr.replace(/:\d{2}\s/, ' ')}</div>
                </div>
              );
            })}
          </div>
          <button
            id="reopen-countdown-screen-btn"
            onClick={onOpenCountdownModal}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white text-ink-900 text-xs font-bold hover:bg-gold-300 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Immersive countdown
            <Sparkles className="w-3 h-3 text-vermilion-500" />
          </button>
        </div>
      </div>
    </section>
  );
};
