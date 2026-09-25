import React, { useMemo } from 'react';

/**
 * JapanScene — an animated, "old-royal" Japanese backdrop built from layered
 * SVG + CSS. Deep lacquer indigo, aged gold, drifting kumo clouds, a
 * breathing gold moon, Mt Fuji and pagoda/torii silhouettes, scrolling
 * seigaiha waves, floating sakura/momiji petals and gold dust.
 *
 *  variant="screen" → full-bleed for the welcome countdown (rich, layered)
 *  variant="band"   → quieter version for the home hero band
 *  showPlane        → the user's top-down airliner glides over the scene
 */
interface JapanSceneProps {
  variant?: 'screen' | 'band';
  showPlane?: boolean;
  className?: string;
}

const GOLD = '#d9b26a';
const GOLD_DEEP = '#a9803a';

/* ---------- pattern defs (shared) ---------- */
const Defs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    {/* Seigaiha (blue ocean waves) */}
    <pattern id={`${id}-seigaiha`} width="60" height="30" patternUnits="userSpaceOnUse">
      {[0, 30].map((dx, i) => (
        <g key={i} transform={`translate(${dx} ${i * 15})`}>
          {[28, 22, 16, 10, 4].map((r, j) => (
            <circle key={r} cx="0" cy="30" r={r} fill="none" stroke={GOLD} strokeOpacity={j % 2 === 0 ? 0.55 : 0.25} strokeWidth="1.2" />
          ))}
        </g>
      ))}
      <g transform="translate(60 0)">
        {[28, 22, 16, 10, 4].map((r, j) => (
          <circle key={r} cx="0" cy="30" r={r} fill="none" stroke={GOLD} strokeOpacity={j % 2 === 0 ? 0.55 : 0.25} strokeWidth="1.2" />
        ))}
      </g>
    </pattern>

    {/* Asanoha (hemp leaf) */}
    <pattern id={`${id}-asanoha`} width="52" height="90" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)">
      <g fill="none" stroke={GOLD} strokeOpacity="0.28" strokeWidth="0.9">
        <path d="M26 0 L52 15 L52 45 L26 60 L0 45 L0 15 Z" />
        <path d="M26 0 L26 60 M0 15 L52 45 M52 15 L0 45" />
        <path d="M26 30 L52 15 M26 30 L0 15 M26 30 L26 0 M26 30 L52 45 M26 30 L0 45 M26 30 L26 60" />
        <path d="M26 60 L52 75 L52 105 L26 120 L0 105 L0 75 Z" transform="translate(0 -30)" />
      </g>
    </pattern>

    <radialGradient id={`${id}-moon`} cx="50%" cy="45%" r="55%">
      <stop offset="0" stopColor="#fff4cf" />
      <stop offset="0.55" stopColor="#f2d38a" />
      <stop offset="1" stopColor="#c9a054" />
    </radialGradient>

    <linearGradient id={`${id}-fuji`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#1e2a4a" />
      <stop offset="1" stopColor="#0b1324" />
    </linearGradient>

    <linearGradient id={`${id}-snow`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#f7f3e8" />
      <stop offset="1" stopColor="#d9d3c2" stopOpacity="0" />
    </linearGradient>

    <linearGradient id={`${id}-gold-line`} x1="0" x2="1">
      <stop offset="0" stopColor={GOLD} stopOpacity="0" />
      <stop offset="0.5" stopColor="#ffe9b0" />
      <stop offset="1" stopColor={GOLD} stopOpacity="0" />
    </linearGradient>

    <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
  </defs>
);

/* ---------- Kumo cloud shape (stylised) ---------- */
const Kumo: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path
      d="M0 40 C-10 40 -18 32 -16 22 C-26 22 -30 8 -18 4 C-16 -8 0 -12 8 -2 C14 -14 36 -12 38 2 C52 -2 62 12 52 22 C64 24 62 42 48 40 Z"
      fill="none"
      stroke={GOLD}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M-6 40 C-4 30 6 28 10 34 M16 40 C18 30 30 30 34 38" fill="none" stroke={GOLD} strokeWidth="1.2" strokeOpacity="0.6" />
  </g>
);

/* ---------- Pagoda silhouette ---------- */
const Pagoda: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#070b16">
    <rect x="-3" y="-140" width="6" height="30" />
    {[0, 1, 2, 3].map((i) => {
      const yy = -110 + i * 28;
      const w = 30 + i * 12;
      return (
        <g key={i}>
          <path d={`M${-w} ${yy + 10} Q0 ${yy - 6} ${w} ${yy + 10} L${w - 6} ${yy + 14} L${-w + 6} ${yy + 14} Z`} />
          <rect x={-w * 0.55} y={yy + 14} width={w * 1.1} height="14" />
        </g>
      );
    })}
    <rect x="-52" y="0" width="104" height="8" />
  </g>
);

/* ---------- Torii silhouette ---------- */
const Torii: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#070b16">
    <path d="M-60 -78 Q0 -90 60 -78 L58 -68 Q0 -78 -58 -68 Z" />
    <rect x="-48" y="-62" width="96" height="6" />
    <rect x="-3" y="-78" width="6" height="16" />
    <rect x="-38" y="-70" width="8" height="70" transform="skewX(-3)" />
    <rect x="30" y="-70" width="8" height="70" transform="skewX(3)" />
  </g>
);

export const JapanScene: React.FC<JapanSceneProps> = ({ variant = 'screen', showPlane = false, className = '' }) => {
  const id = useMemo(() => `js${Math.random().toString(36).slice(2, 8)}`, []);
  const isScreen = variant === 'screen';

  const petals = useMemo(
    () =>
      Array.from({ length: isScreen ? 18 : 9 }, (_, i) => ({
        left: (i * 53 + 11) % 100,
        delay: -(i * 1.7) % 14,
        dur: 12 + (i % 5) * 2.2,
        size: 8 + (i % 4) * 3,
        drift: (i % 2 === 0 ? 1 : -1) * (6 + (i % 5) * 3),
        spin: 360 + (i % 3) * 180,
        kind: i % 3 === 0 ? 'momiji' : 'sakura',
      })),
    [isScreen]
  );

  const dust = useMemo(
    () =>
      Array.from({ length: isScreen ? 34 : 18 }, (_, i) => ({
        left: (i * 37 + 7) % 100,
        top: (i * 61 + 13) % 100,
        delay: -(i * 0.7) % 3.6,
        size: 1 + (i % 3),
      })),
    [isScreen]
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`} aria-hidden>
      {/* Base lacquer gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#1b2448_0%,#0b1324_55%,#05070f_100%)]" />

      {/* Asanoha texture wash */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.16]" preserveAspectRatio="xMidYMid slice">
        <Defs id={`${id}a`} />
        <rect width="100%" height="100%" fill={`url(#${id}a-asanoha)`} />
      </svg>

      {/* Vignette + gold haze */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_100%,rgba(217,178,106,0.14),transparent_70%)]" />

      {/* Moon */}
      <div className={`absolute ${isScreen ? 'top-[8%] right-[12%] w-44 h-44 sm:w-56 sm:h-56' : 'top-6 right-[14%] w-28 h-28 sm:w-36 sm:h-36'} animate-moon-breathe`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <Defs id={`${id}m`} />
          <circle cx="50" cy="50" r="46" fill={`url(#${id}m-moon)`} />
          <circle cx="38" cy="40" r="6" fill="#e6c98a" opacity="0.35" />
          <circle cx="60" cy="62" r="9" fill="#e6c98a" opacity="0.3" />
          <circle cx="66" cy="34" r="4" fill="#e6c98a" opacity="0.3" />
        </svg>
      </div>

      {/* Gold dust */}
      {dust.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold-300 animate-twinkle"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s`, boxShadow: '0 0 6px rgba(253,230,138,0.8)' }}
        />
      ))}

      {/* Kumo clouds — two drifting layers */}
      <div className="absolute inset-x-0 top-[14%] h-40 animate-drift-x-slow" style={{ width: '200%' }}>
        <svg viewBox="0 0 2000 160" className="w-full h-full" preserveAspectRatio="none">
          {[60, 420, 780, 1140, 1500, 1860].map((x, i) => (
            <Kumo key={i} x={x} y={40 + (i % 3) * 30} s={1.1 + (i % 2) * 0.4} o={0.35} />
          ))}
        </svg>
      </div>
      <div className="absolute inset-x-0 top-[34%] h-32 animate-drift-x" style={{ width: '200%' }}>
        <svg viewBox="0 0 2000 140" className="w-full h-full" preserveAspectRatio="none">
          {[200, 560, 920, 1280, 1640].map((x, i) => (
            <Kumo key={i} x={x} y={30 + (i % 2) * 40} s={0.9 + (i % 3) * 0.3} o={0.55} />
          ))}
        </svg>
      </div>

      {/* Fuji + skyline */}
      <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" style={{ height: isScreen ? '62%' : '78%' }}>
        <Defs id={`${id}f`} />
        {/* far mist band */}
        <rect x="0" y="230" width="1440" height="60" fill={GOLD} opacity="0.06" filter={`url(#${id}f-soft)`} className="animate-mist" />
        {/* Fuji */}
        <path d="M300 320 C520 300 600 150 720 96 C840 150 920 300 1140 320 Z" fill={`url(#${id}f-fuji)`} />
        <path d="M646 150 C668 138 690 108 720 96 C750 108 772 138 794 150 C776 146 760 156 744 150 C732 158 708 158 696 150 C680 156 664 146 646 150 Z" fill={`url(#${id}f-snow)`} />
        {/* ridge highlight */}
        <path d="M720 96 C640 150 560 260 300 320" fill="none" stroke={GOLD} strokeOpacity="0.25" strokeWidth="1" />
        {/* hills */}
        <path d="M0 340 C160 300 260 330 420 310 C560 292 640 330 800 318 C960 306 1080 330 1240 300 C1340 282 1400 300 1440 296 L1440 420 L0 420 Z" fill="#0a1020" />
        <path d="M0 360 C120 340 240 356 380 346 C520 336 680 360 840 350 C1000 340 1160 362 1300 344 C1380 334 1420 340 1440 340 L1440 420 L0 420 Z" fill="#070b16" />
        <Pagoda x={1180} y={352} s={0.9} />
        <Torii x={250} y={362} s={0.7} />
        <Torii x={330} y={366} s={0.5} />
        {/* kintsugi vein */}
        <path d="M0 372 C200 366 300 384 480 372 C660 360 720 388 900 376 C1080 364 1180 386 1440 374" fill="none" stroke={`url(#${id}f-gold-line)`} strokeWidth="1.4" className="animate-glint" />
        {/* water reflection band with seigaiha */}
        <rect x="0" y="378" width="1440" height="42" fill={`url(#${id}f-seigaiha)`} opacity="0.9" />
      </svg>

      {/* scrolling seigaiha foreground */}
      <div className="absolute inset-x-0 bottom-0 h-16 opacity-70 animate-drift-x" style={{ width: '200%' }}>
        <svg className="w-full h-full" preserveAspectRatio="none">
          <Defs id={`${id}s`} />
          <rect width="100%" height="100%" fill={`url(#${id}s-seigaiha)`} />
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05070f] via-[#05070f]/70 to-transparent" />

      {/* Petals */}
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-petal"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              '--petal-drift': `${p.drift}vw`,
              '--petal-spin': `${p.spin}deg`,
            } as React.CSSProperties
          }
        >
          {p.kind === 'sakura' ? (
            <svg viewBox="0 0 20 20" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 4px rgba(255,182,193,0.6))' }}>
              <path d="M10 2 C13 4 14 8 10 11 C6 8 7 4 10 2 Z" fill="#f7b6c2" opacity="0.9" />
              <path d="M10 11 C14 9 18 10 18 14 C15 16 11 15 10 11 Z" fill="#f4a3b3" opacity="0.85" />
              <path d="M10 11 C6 9 2 10 2 14 C5 16 9 15 10 11 Z" fill="#f4a3b3" opacity="0.85" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 4px rgba(217,119,6,0.5))' }}>
              <path d="M10 1 L12 7 L18 6 L14 10 L18 15 L12 13 L10 19 L8 13 L2 15 L6 10 L2 6 L8 7 Z" fill="#d97706" opacity="0.9" />
            </svg>
          )}
        </span>
      ))}

      {/* The traveller's aircraft gliding over the scene */}
      {showPlane && (
        <div className="absolute left-0 top-0 w-[46vw] max-w-[520px] animate-fly-over will-change-transform">
          <div className="relative">
            {/* engine contrails (image is nose-up, so trails extend downward from the engines) */}
            {['36%', '60%'].map((x) => (
              <div key={x} className="absolute top-[46%] h-[160%] w-[5%] -translate-x-1/2 blur-md" style={{ left: x }}>
                <div className="w-full h-full bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-full" />
              </div>
            ))}
            <img
              src="/plane-topdown.png"
              alt=""
              className="relative w-full h-auto"
              style={{ filter: 'sepia(0.35) saturate(0.9) brightness(1.05) drop-shadow(0 30px 40px rgba(0,0,0,0.55))' }}
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Top vignette so headers stay readable */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#05070f]/70 to-transparent" />
    </div>
  );
};
