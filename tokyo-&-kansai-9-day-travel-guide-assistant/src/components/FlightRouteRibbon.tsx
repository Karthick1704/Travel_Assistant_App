import React, { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Plane } from 'lucide-react';
import { FlightInfo, AIRPORTS } from '../data/flightsData';

/** Plane marker that travels along a quadratic arc from (x1,baseY) to (x2,baseY). */
const PlaneMarker: React.FC<{ x1: number; x2: number; baseY: number; dark: boolean }> = ({ x1, x2, baseY, dark }) => {
  const t = useMotionValue(0);
  const cx = (x1 + x2) / 2;
  const cy = baseY - 86;

  // Quadratic Bézier position + tangent
  const px = useTransform(t, (v) => (1 - v) * (1 - v) * x1 + 2 * (1 - v) * v * cx + v * v * x2);
  const py = useTransform(t, (v) => (1 - v) * (1 - v) * baseY + 2 * (1 - v) * v * cy + v * v * baseY);
  const angle = useTransform(t, (v) => {
    const dx = 2 * (1 - v) * (cx - x1) + 2 * v * (x2 - cx);
    const dy = 2 * (1 - v) * (cy - baseY) + 2 * v * (baseY - cy);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  });
  useEffect(() => {
    const controls = animate(t, [0, 1], { duration: 5.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 });
    return () => controls.stop();
  }, [t]);

  return (
    <motion.g style={{ x: px, y: py, rotate: angle }} filter="url(#ribbon-glow)">
      <circle r="9" fill={dark ? '#0b1324' : '#ffffff'} stroke="#ff6b5e" strokeWidth="2" />
      {/* lucide plane points up-right by default; rotate 45° so it points along +x */}
      <g transform="rotate(45)">
        <Plane width={11} height={11} x={-5.5} y={-5.5} style={{ color: dark ? '#fff' : '#0f172a' }} />
      </g>
    </motion.g>
  );
};

interface FlightRouteRibbonProps {
  legs: FlightInfo[];
  activeIndex: number;
  onSelect?: (index: number) => void;
  dark?: boolean;
}

/**
 * Stylised great-circle route ribbon: airports as nodes, legs as arcs.
 * Purely illustrative (not geographic), designed to read at a glance.
 */
export const FlightRouteRibbon: React.FC<FlightRouteRibbonProps> = ({ legs, activeIndex, onSelect, dark = true }) => {
  const nodes = useMemo(() => {
    const codes = [legs[0]?.departureAirportCode, ...legs.map((l) => l.arrivalAirportCode)].filter(Boolean) as string[];
    return codes;
  }, [legs]);

  const W = 640;
  const H = 150;
  const padX = 56;
  const step = (W - padX * 2) / Math.max(1, nodes.length - 1);
  const baseY = 108;

  const arcPath = (i: number) => {
    const x1 = padX + i * step;
    const x2 = padX + (i + 1) * step;
    const cx = (x1 + x2) / 2;
    return `M${x1} ${baseY} Q${cx} ${baseY - 86} ${x2} ${baseY}`;
  };

  const text = dark ? 'fill-white' : 'fill-slate-900';
  const sub = dark ? 'fill-white/50' : 'fill-slate-400';

  return (
    <div className={`relative rounded-3xl overflow-hidden ${dark ? 'glass-dark' : 'bg-white border border-slate-200/80'} p-3 sm:p-4`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Flight route">
        <defs>
          <linearGradient id="ribbon-active" x1="0" x2="1">
            <stop offset="0" stopColor="#3aa99a" />
            <stop offset="1" stopColor="#ff6b5e" />
          </linearGradient>
          <filter id="ribbon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* baseline */}
        <line x1={padX} x2={W - padX} y1={baseY} y2={baseY} stroke={dark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'} strokeWidth="2" strokeDasharray="2 6" />

        {legs.map((leg, i) => {
          const active = i === activeIndex;
          return (
            <g key={leg.flightNumber} onClick={() => onSelect?.(i)} className={onSelect ? 'cursor-pointer' : ''}>
              <path d={arcPath(i)} fill="none" stroke={dark ? 'rgba(255,255,255,0.14)' : '#e2e8f0'} strokeWidth="2.5" />
              {active && (
                <>
                  <motion.path
                    d={arcPath(i)}
                    fill="none"
                    stroke="url(#ribbon-active)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter="url(#ribbon-glow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, ease: 'easeInOut' }}
                  />
                  <PlaneMarker x1={padX + i * step} x2={padX + (i + 1) * step} baseY={baseY} dark={dark} />
                </>
              )}
              {/* leg label */}
              <text x={padX + (i + 0.5) * step} y={baseY - 96 + 8} textAnchor="middle" className={`${active ? 'fill-vermilion-400' : sub} font-mono`} fontSize="11" fontWeight="800">
                {leg.flightNumber}
              </text>
              <text x={padX + (i + 0.5) * step} y={baseY - 96 + 22} textAnchor="middle" className={sub} fontSize="9.5" fontWeight="600">
                {leg.duration} · {leg.aircraftShort}
              </text>
            </g>
          );
        })}

        {nodes.map((code, i) => {
          const x = padX + i * step;
          const meta = AIRPORTS[code];
          const isActiveNode = i === activeIndex || i === activeIndex + 1;
          return (
            <g key={code}>
              {isActiveNode && <circle cx={x} cy={baseY} r="12" fill={i === activeIndex ? 'rgba(58,169,154,0.25)' : 'rgba(255,107,94,0.25)'} />}
              <circle cx={x} cy={baseY} r="5.5" fill={isActiveNode ? (i === activeIndex ? '#3aa99a' : '#ff6b5e') : dark ? '#334155' : '#cbd5e1'} stroke={dark ? '#0b1324' : '#fff'} strokeWidth="2" />
              <text x={x} y={baseY + 22} textAnchor="middle" className={`${text} font-display`} fontSize="14" fontWeight="700">
                {code}
              </text>
              <text x={x} y={baseY + 35} textAnchor="middle" className={sub} fontSize="9.5" fontWeight="600">
                {meta?.flag} {meta?.city}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
