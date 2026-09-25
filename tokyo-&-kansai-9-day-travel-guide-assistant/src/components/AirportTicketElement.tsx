import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Plane,
  RotateCw,
  Camera,
  Layers,
  ShieldCheck,
  Luggage,
  Armchair,
  Gauge,
  Mountain,
  Wind,
  Move3d,
  PlaneTakeoff,
  PlaneLanding,
  Clock3,
  MapPin,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { FlightLeg } from '../types';
import { ALL_FLIGHTS_DATA, FlightInfo, OUTBOUND_FLIGHTS, RETURN_FLIGHTS } from '../data/flightsData';
import { AircraftScene, FlightPhase } from './three/AircraftScene';
import { BoardingPass3D } from './BoardingPass3D';
import { FlightRouteRibbon } from './FlightRouteRibbon';
import { Eyebrow, Pill, Segmented } from './ui/primitives';

// Backwards-compatible re-exports (other modules import these from here)
export { ALL_FLIGHTS_DATA };
export type { FlightInfo };

interface AirportTicketElementProps {
  initialFlightIndex?: number;
  onSelectDay?: (dayNumber: number) => void;
  flightLegs?: FlightLeg[];
  compact?: boolean;
}

const PHASES: Array<{ id: FlightPhase; label: string; icon: React.ReactNode; tone: string }> = [
  { id: 'takeoff', label: 'Climb', icon: <PlaneTakeoff className="w-3.5 h-3.5" />, tone: 'data-[active=true]:bg-vermilion-500 data-[active=true]:text-white' },
  { id: 'cruise', label: 'Cruise', icon: <Plane className="w-3.5 h-3.5" />, tone: 'data-[active=true]:bg-sky-400 data-[active=true]:text-ink-950' },
  { id: 'landing', label: 'Descend', icon: <PlaneLanding className="w-3.5 h-3.5" />, tone: 'data-[active=true]:bg-amber-400 data-[active=true]:text-ink-950' },
];

const SKY: Record<FlightPhase, string> = {
  cruise: 'from-[#05070f] via-[#0b1324] to-[#16233f]',
  takeoff: 'from-[#0b1324] via-[#3b1d2e] to-[#c2410c]',
  landing: 'from-[#0f172a] via-[#1e3a5f] to-[#fbbf24]/70',
};

/** Simulated telemetry that eases toward phase-appropriate values. */
function useTelemetry(flight: FlightInfo, phase: FlightPhase) {
  const targets = useMemo(() => {
    switch (phase) {
      case 'takeoff':
        return { alt: 2400, spd: 320, vs: 2600, hdg: 74 };
      case 'landing':
        return { alt: 1800, spd: 260, vs: -900, hdg: 121 };
      default:
        return { alt: flight.cruiseAltitudeFt, spd: flight.cruiseSpeedKmh, vs: 0, hdg: 96 };
    }
  }, [phase, flight]);

  const [tele, setTele] = useState(targets);
  useEffect(() => {
    let timer: number | undefined;
    const tick = () => {
      setTele((cur) => ({
        alt: cur.alt + (targets.alt - cur.alt) * 0.06 + (Math.random() - 0.5) * 12,
        spd: cur.spd + (targets.spd - cur.spd) * 0.08 + (Math.random() - 0.5) * 1.5,
        vs: cur.vs + (targets.vs - cur.vs) * 0.08 + (Math.random() - 0.5) * 40,
        hdg: cur.hdg + (targets.hdg - cur.hdg) * 0.05,
      }));
      timer = window.setTimeout(tick, 380);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [targets]);
  return tele;
}

export const AirportTicketElement: React.FC<AirportTicketElementProps> = ({ initialFlightIndex = 0, onSelectDay }) => {
  const [activeIndex, setActiveIndex] = useState(initialFlightIndex);
  const [viewMode, setViewMode] = useState<'3d' | 'photo'>('3d');
  const [phase, setPhase] = useState<FlightPhase>('cruise');
  const [resetSignal, setResetSignal] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => setActiveIndex(initialFlightIndex), [initialFlightIndex]);

  const flight = ALL_FLIGHTS_DATA[activeIndex] ?? ALL_FLIGHTS_DATA[0];
  const direction = flight.direction;
  const legs = direction === 'outbound' ? OUTBOUND_FLIGHTS : RETURN_FLIGHTS;
  const legIndex = legs.findIndex((l) => l.flightNumber === flight.flightNumber);
  const telemetry = useTelemetry(flight, phase);

  const selectFlight = (idx: number) => {
    setActiveIndex(idx);
    onSelectDay?.(ALL_FLIGHTS_DATA[idx].dayNumber);
  };

  const setDirection = (d: 'outbound' | 'return') => {
    const idx = ALL_FLIGHTS_DATA.findIndex((f) => f.direction === d);
    selectFlight(idx);
  };

  return (
    <div className="space-y-5">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative w-13 h-13 rounded-2xl bg-gradient-to-br from-jade-500 to-jade-700 text-white flex items-center justify-center shadow-[var(--shadow-glow-jade)]">
            <Plane className="w-6 h-6 -rotate-45" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Eyebrow>{flight.tripType} · Day {flight.dayNumber}</Eyebrow>
              <Pill tone="emerald" icon={<ShieldCheck className="w-3 h-3" />}>
                {flight.status}
              </Pill>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 flex flex-wrap items-center gap-x-2.5">
              <span>{flight.airline}</span>
              <span className="font-mono text-vermilion-600">{flight.flightNumber}</span>
              <Pill tone="jade" mono>
                {flight.aircraft}
              </Pill>
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            layoutId="flight-direction"
            size="sm"
            value={direction}
            onChange={(v) => setDirection(v)}
            options={[
              { id: 'outbound', label: 'Outbound · Day 1', icon: <PlaneTakeoff className="w-3.5 h-3.5" /> },
              { id: 'return', label: 'Return · Day 9', icon: <PlaneLanding className="w-3.5 h-3.5" /> },
            ]}
          />
          <Segmented
            layoutId="flight-view"
            size="sm"
            value={viewMode}
            onChange={setViewMode}
            options={[
              { id: '3d', label: '3D Model', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'photo', label: 'Photo', icon: <Camera className="w-3.5 h-3.5" /> },
            ]}
          />
        </div>
      </div>

      {/* ---------- Leg timeline selector ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {legs.map((leg) => {
          const idx = ALL_FLIGHTS_DATA.indexOf(leg);
          const active = idx === activeIndex;
          return (
            <button
              key={leg.flightNumber}
              id={`flight-select-btn-${idx}`}
              onClick={() => selectFlight(idx)}
              className={`group relative text-left p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                active
                  ? 'bg-ink-900 text-white border-ink-800 shadow-lg shadow-ink-900/25'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 card-hover'
              }`}
            >
              {active && <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-jade-500/25 blur-2xl pointer-events-none" />}
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`font-mono text-sm font-extrabold ${active ? 'text-jade-300' : 'text-slate-900'}`}>{leg.flightNumber}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-white/50' : 'text-slate-400'}`}>{leg.tripType.replace('Outbound ', '').replace('Return ', '')}</span>
                </div>
                <span className={`text-[10px] font-bold ${active ? 'text-white/60' : 'text-slate-400'}`}>{leg.aircraftShort}</span>
              </div>
              <div className="relative mt-2.5 flex items-center gap-3">
                <div>
                  <div className="font-display text-2xl font-bold tracking-tight leading-none">{leg.departureAirportCode}</div>
                  <div className={`font-mono text-[11px] font-bold mt-1 ${active ? 'text-white/60' : 'text-slate-500'}`}>{leg.departureTime}</div>
                </div>
                <div className="flex-1 relative h-px bg-current opacity-30">
                  <Plane className={`absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 rotate-45 ${active ? 'text-jade-300' : 'text-vermilion-500'} opacity-100`} />
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-bold tracking-tight leading-none">{leg.arrivalAirportCode}</div>
                  <div className={`font-mono text-[11px] font-bold mt-1 ${active ? 'text-white/60' : 'text-slate-500'}`}>{leg.arrivalTime}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ---------- Stage + Pass ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
        {/* 3D / photo stage */}
        <div className={`lg:col-span-3 relative rounded-[28px] overflow-hidden border border-ink-800/60 shadow-[0_30px_70px_-30px_rgba(2,6,23,0.7)] min-h-[340px] sm:min-h-[420px] bg-gradient-to-b transition-colors duration-1000 ${SKY[phase]}`}>
          {/* horizon glow */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-sky-300/10 to-transparent pointer-events-none" />
          <div className="absolute inset-0 dot-grid opacity-[0.07] pointer-events-none" />

          {viewMode === '3d' ? (
            <div className="absolute inset-0">
              <AircraftScene phase={phase} interactive resetSignal={resetSignal} framing="wide" onInteractionChange={setDragging} />
            </div>
          ) : (
            <div className="absolute inset-0 group">
              <img src={flight.photoUrl} alt={flight.photoCaption} className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-ink-950/40" />
              <div className="absolute bottom-16 left-4 right-4 sm:left-5 sm:right-5 text-white">
                <Eyebrow className="text-white/50">{flight.aircraft}</Eyebrow>
                <p className="text-sm font-semibold mt-1 max-w-lg">{flight.photoCaption}</p>
              </div>
            </div>
          )}

          {/* Top HUD */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
            <div className="glass-dark rounded-2xl px-3 py-2 flex items-center gap-2 text-white text-xs pointer-events-auto">
              <Move3d className={`w-3.5 h-3.5 ${dragging ? 'text-vermilion-400' : 'text-sky-300'}`} />
              <span className="font-semibold">{viewMode === '3d' ? (dragging ? 'Orbiting aircraft' : 'Drag to orbit · scroll to zoom') : 'Realistic livery photo'}</span>
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="glass-dark rounded-2xl px-3 py-2 hidden sm:flex items-center gap-2 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">Livery</span>
                <span className="text-xs font-bold text-jade-300">Cathay Pacific Jade</span>
              </div>
              {viewMode === '3d' && (
                <button
                  id="reset-3d-camera"
                  onClick={() => {
                    setResetSignal((s) => s + 1);
                    setPhase('cruise');
                  }}
                  title="Reset camera"
                  className="glass-dark rounded-2xl p-2.5 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom HUD */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            {viewMode === '3d' && (
              <div className="glass-dark rounded-2xl p-1 inline-flex items-center gap-1 self-start">
                {PHASES.map((p) => (
                  <button
                    key={p.id}
                    id={`flight-mode-${p.id}-btn`}
                    data-active={phase === p.id}
                    onClick={() => setPhase(p.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white/70 hover:text-white transition-all cursor-pointer ${p.tone}`}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Telemetry strip */}
            <div className="glass-dark rounded-2xl px-3.5 py-2 grid grid-cols-4 gap-3 text-white self-stretch sm:self-auto">
              {[
                { k: 'ALT', v: `${Math.round(telemetry.alt).toLocaleString()} ft`, icon: <Mountain className="w-3 h-3" /> },
                { k: 'GS', v: `${Math.round(telemetry.spd)} km/h`, icon: <Gauge className="w-3 h-3" /> },
                { k: 'V/S', v: `${telemetry.vs >= 0 ? '+' : ''}${Math.round(telemetry.vs / 10) * 10} fpm`, icon: <Wind className="w-3 h-3" /> },
                { k: 'HDG', v: `${Math.round(telemetry.hdg).toString().padStart(3, '0')}°`, icon: <MapPin className="w-3 h-3" /> },
              ].map((d) => (
                <div key={d.k} className="min-w-0">
                  <div className="flex items-center gap-1 text-[9px] font-extrabold tracking-[0.16em] text-white/45">
                    {d.icon}
                    {d.k}
                  </div>
                  <div className="font-mono text-[11px] sm:text-xs font-extrabold text-white tabular-nums truncate">{d.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Boarding pass */}
        <div className="lg:col-span-2 flex flex-col justify-center" style={{ ['--pass-bg' as string]: '#fbfaf7' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={flight.flightNumber}
              initial={{ opacity: 0, y: 18, rotateX: -8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <BoardingPass3D flight={flight} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ---------- Route ribbon ---------- */}
      <FlightRouteRibbon legs={legs} activeIndex={Math.max(0, legIndex)} onSelect={(i) => selectFlight(ALL_FLIGHTS_DATA.indexOf(legs[i]))} />

      {/* ---------- Brief cards ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-vermilion-50 text-vermilion-600 border border-vermilion-100 flex items-center justify-center">
              <Clock3 className="w-4 h-4" />
            </div>
            <Eyebrow>Timing</Eyebrow>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Boarding <span className="font-mono font-bold text-slate-900">{flight.boardingTime}</span> at gate{' '}
            <span className="font-bold text-slate-900">{flight.gate}</span>, {flight.terminal}. Departs{' '}
            <span className="font-mono font-bold text-slate-900">{flight.departureTime} {flight.departureTz}</span>, arrives{' '}
            <span className="font-mono font-bold text-slate-900">{flight.arrivalTime} {flight.arrivalTz}</span>.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Luggage className="w-4 h-4" />
            </div>
            <Eyebrow>Baggage</Eyebrow>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{flight.luggageRule}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Armchair className="w-4 h-4" />
            </div>
            <Eyebrow>Seat pick</Eyebrow>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{flight.seatTip}</p>
        </div>
      </div>

      {onSelectDay && (
        <button
          onClick={() => onSelectDay(flight.dayNumber)}
          className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-ink-900 to-ink-800 text-white border border-ink-700 hover:from-ink-800 hover:to-ink-700 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5 text-sm font-bold">
            <Sparkles className="w-4 h-4 text-gold-400" />
            Open Day {flight.dayNumber} itinerary for this flight
          </span>
          <ChevronRight className="w-4 h-4 text-white/60" />
        </button>
      )}
    </div>
  );
};
