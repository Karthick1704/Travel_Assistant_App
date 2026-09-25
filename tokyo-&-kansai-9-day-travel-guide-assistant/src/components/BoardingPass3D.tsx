import React, { useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Plane, RotateCcw, Armchair, Luggage, Info, ShieldCheck, Clock3, DoorOpen, Ticket } from 'lucide-react';
import { FlightInfo, AIRPORTS } from '../data/flightsData';

interface BoardingPass3DProps {
  flight: FlightInfo;
  className?: string;
  /** Show the flip hint chip. */
  showHint?: boolean;
}

/** Deterministic pseudo-barcode from a string (looks like a real 1D code). */
function useBarcode(seed: string, bars = 64) {
  return useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const widths: number[] = [];
    for (let i = 0; i < bars; i++) {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      widths.push(1 + (Math.abs(h) % 3));
    }
    return widths;
  }, [seed, bars]);
}

const Barcode: React.FC<{ seed: string; className?: string; light?: boolean }> = ({ seed, className = '', light = false }) => {
  const widths = useBarcode(seed);
  const total = widths.reduce((a, b) => a + b + 1, 0);
  let x = 0;
  return (
    <svg viewBox={`0 0 ${total} 40`} preserveAspectRatio="none" className={className} aria-hidden>
      {widths.map((w, i) => {
        const rect = <rect key={i} x={x} y={0} width={w} height={40} fill={light ? '#f8fafc' : '#0f172a'} />;
        x += w + 1;
        return rect;
      })}
    </svg>
  );
};

export const BoardingPass3D: React.FC<BoardingPass3DProps> = ({ flight, className = '', showHint = true }) => {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [9, -9]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(mx, [0, 1], [-11, 11]), { stiffness: 220, damping: 22 });
  const glareX = useTransform(mx, [0, 1], ['0%', '100%']);
  const glareY = useTransform(my, [0, 1], ['0%', '100%']);
  const glare = useTransform(
    [glareX, glareY],
    ([gx, gy]) => `radial-gradient(420px circle at ${gx} ${gy}, rgba(255,255,255,0.9), rgba(255,255,255,0) 60%)`
  );

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const dep = AIRPORTS[flight.departureAirportCode];
  const arr = AIRPORTS[flight.arrivalAirportCode];
  const qrPayload = `M1TRAVELER/JAPAN ${flight.pnr} ${flight.departureAirportCode}${flight.arrivalAirportCode}${flight.airlineCode} ${flight.flightNumber.replace(' ', '')} ${flight.seat} ${flight.dateLabel}`;

  return (
    <div className={`perspective-1200 ${className}`}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={() => setFlipped((f) => !f)}
        style={{ rotateX: rx, rotateY: ry }}
        className="relative preserve-3d cursor-pointer"
        role="button"
        aria-label={`Boarding pass for ${flight.flightNumber}. Click to flip.`}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
          className="relative preserve-3d"
        >
          {/* ---------------- FRONT ---------------- */}
          <div className="backface-hidden relative rounded-[28px] overflow-hidden bg-white shadow-[0_30px_70px_-30px_rgba(2,6,23,0.55)] border border-slate-200/70">
            {/* Airline strip */}
            <div className="relative bg-gradient-to-r from-jade-700 via-jade-600 to-jade-500 text-white px-5 py-3.5 flex items-center justify-between grain">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur">
                  <Plane className="w-4.5 h-4.5 -rotate-45" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold tracking-tight leading-none">{flight.airline}</div>
                  <div className="text-[10px] text-white/70 font-semibold tracking-[0.18em] uppercase mt-1">Boarding Pass · {flight.cabin}</div>
                </div>
              </div>
              <div className="text-right relative z-10">
                <div className="font-mono text-lg font-extrabold tracking-tight leading-none">{flight.flightNumber}</div>
                <div className="text-[10px] text-white/70 font-semibold mt-1">{flight.dateLabel}</div>
              </div>
            </div>

            {/* Route */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-4xl sm:text-5xl font-bold text-slate-900 tracking-tighter leading-none">{flight.departureAirportCode}</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1.5 truncate">
                    {dep?.flag} {flight.departureCity}
                  </div>
                  <div className="font-mono text-base font-extrabold text-slate-900 mt-1">
                    {flight.departureTime} <span className="text-[10px] text-slate-400 font-bold">{flight.departureTz}</span>
                  </div>
                </div>

                <div className="flex-1 px-1 sm:px-3 relative">
                  <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{flight.duration}</div>
                  <svg viewBox="0 0 200 40" className="w-full h-10 overflow-visible" aria-hidden>
                    <path d="M4 34 Q100 -14 196 34" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                    <path d="M4 34 Q100 -14 196 34" fill="none" stroke="#1f8a7d" strokeWidth="2" strokeDasharray="6 6" className="animate-dash" />
                    <circle cx="4" cy="34" r="3.5" fill="#0f172a" />
                    <circle cx="196" cy="34" r="3.5" fill="#e63946" />
                  </svg>
                  <div className="absolute left-1/2 -translate-x-1/2 top-[18px] w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                    <Plane className="w-3.5 h-3.5 text-slate-900 rotate-45" />
                  </div>
                  <div className="text-center text-[10px] font-bold text-jade-600 uppercase tracking-widest mt-1">Non-stop · {flight.distanceKm.toLocaleString()} km</div>
                </div>

                <div className="min-w-0 text-right">
                  <div className="font-display text-4xl sm:text-5xl font-bold text-slate-900 tracking-tighter leading-none">{flight.arrivalAirportCode}</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1.5 truncate">
                    {arr?.flag} {flight.arrivalCity}
                  </div>
                  <div className="font-mono text-base font-extrabold text-slate-900 mt-1">
                    {flight.arrivalTime} <span className="text-[10px] text-slate-400 font-bold">{flight.arrivalTz}</span>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-4 gap-2 mt-5">
                {[
                  { k: 'Terminal', v: flight.terminal.replace('Terminal ', 'T'), icon: <DoorOpen className="w-3 h-3" /> },
                  { k: 'Gate', v: flight.gate, icon: <Ticket className="w-3 h-3" /> },
                  { k: 'Boarding', v: flight.boardingTime, icon: <Clock3 className="w-3 h-3" /> },
                  { k: 'Seat', v: flight.seat, icon: <Armchair className="w-3 h-3" /> },
                ].map((d) => (
                  <div key={d.k} className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                      {d.icon}
                      {d.k}
                    </div>
                    <div className="font-mono text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 truncate">{d.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Perforation */}
            <div className="relative h-6">
              <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-slate-200" />
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[color:var(--pass-bg,#0b1324)]" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[color:var(--pass-bg,#0b1324)]" />
            </div>

            {/* Stub */}
            <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Passenger</span>
                  <span className="text-[11px] font-bold text-slate-900 truncate">TRAVELER / JAPAN 9D</span>
                </div>
                <Barcode seed={`${flight.flightNumber}${flight.pnr}`} className="w-full h-9" />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-mono text-[10px] text-slate-500 tracking-[0.25em]">{flight.pnr}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <ShieldCheck className="w-3 h-3" /> {flight.status}
                  </span>
                </div>
              </div>
              <div className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs flex-shrink-0">
                <QRCodeSVG value={qrPayload} size={68} level="M" fgColor="#0f172a" bgColor="#ffffff" />
              </div>
            </div>

            {/* Glare */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
              style={{ background: glare }}
            />
          </div>

          {/* ---------------- BACK ---------------- */}
          <div
            className="backface-hidden absolute inset-0 rounded-[28px] overflow-hidden bg-ink-900 text-white border border-white/10 shadow-[0_30px_70px_-30px_rgba(2,6,23,0.7)] grain"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-jade-500/25 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-vermilion-500/20 blur-3xl" />

            <div className="relative z-10 p-5 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/50">Flight brief</div>
                  <div className="font-display text-xl font-bold tracking-tight">{flight.flightNumber} · {flight.aircraftShort}</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 font-mono text-[11px] font-bold">{flight.registrationHint}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { k: 'Cruise', v: `${(flight.cruiseAltitudeFt / 1000).toFixed(0)}k ft` },
                  { k: 'Speed', v: `${flight.cruiseSpeedKmh} km/h` },
                  { k: 'Distance', v: `${flight.distanceKm.toLocaleString()} km` },
                ].map((d) => (
                  <div key={d.k} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/50 font-extrabold">{d.k}</div>
                    <div className="font-mono text-sm font-extrabold mt-0.5">{d.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2.5 text-xs flex-1">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Armchair className="w-4 h-4 text-sky-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white/90">Seat advice</div>
                    <p className="text-white/65 leading-relaxed mt-0.5">{flight.seatTip}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Luggage className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white/90">Baggage</div>
                    <p className="text-white/65 leading-relaxed mt-0.5">{flight.luggageRule}</p>
                  </div>
                </div>
                {flight.transitNote && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-jade-500/15 border border-jade-400/25">
                    <Info className="w-4 h-4 text-jade-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white/90">Good to know</div>
                      <p className="text-white/70 leading-relaxed mt-0.5">{flight.transitNote}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <Barcode seed={`${flight.pnr}${flight.flightNumber}`} light className="w-40 h-6 opacity-70" />
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/60">
                  <RotateCcw className="w-3 h-3" /> Tap to flip back
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {showHint && (
        <div className="mt-3 flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <RotateCcw className="w-3 h-3" />
            Hover to tilt · Tap the pass to flip for seat & baggage brief
          </span>
        </div>
      )}
    </div>
  );
};
