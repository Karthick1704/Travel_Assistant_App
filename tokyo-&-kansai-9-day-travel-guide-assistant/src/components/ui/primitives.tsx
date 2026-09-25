import React from 'react';
import { motion } from 'motion/react';

/* ------------------------------------------------------------------
   Shared UI primitives for the travel guide.
   Keep these small and composable; cards import from here so the
   whole app shares one visual language.
   ------------------------------------------------------------------ */

type Tone = 'vermilion' | 'jade' | 'gold' | 'ink' | 'sky' | 'emerald' | 'rose' | 'violet' | 'slate';

const TONE_ICON: Record<Tone, string> = {
  vermilion: 'bg-vermilion-50 text-vermilion-600 border-vermilion-100',
  jade: 'bg-jade-50 text-jade-600 border-jade-100',
  gold: 'bg-amber-50 text-amber-600 border-amber-100',
  ink: 'bg-ink-900 text-white border-ink-700',
  sky: 'bg-sky-50 text-sky-600 border-sky-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

const TONE_PILL: Record<Tone, string> = {
  vermilion: 'bg-vermilion-50 text-vermilion-700 border-vermilion-100',
  jade: 'bg-jade-50 text-jade-700 border-jade-100',
  gold: 'bg-amber-50 text-amber-800 border-amber-100',
  ink: 'bg-ink-900 text-white border-ink-700',
  sky: 'bg-sky-50 text-sky-700 border-sky-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

/* ---------- Section card ---------- */
interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  id?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ children, className = '', padded = true, id }) => (
  <section id={id} className={`card ${padded ? 'p-5 sm:p-7' : ''} text-slate-800 relative ${className}`}>
    {children}
  </section>
);

/* ---------- Card header ---------- */
interface CardHeaderProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tone?: Tone;
  action?: React.ReactNode;
  eyebrow?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ icon, title, subtitle, tone = 'vermilion', action, eyebrow }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
    <div className="flex items-start gap-3.5 min-w-0">
      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-xs flex-shrink-0 ${TONE_ICON[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        {eyebrow && (
          <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400 mb-0.5">
            {eyebrow}
          </span>
        )}
        <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
  </div>
);

/* ---------- Pill / badge ---------- */
interface PillProps {
  children: React.ReactNode;
  tone?: Tone;
  icon?: React.ReactNode;
  className?: string;
  mono?: boolean;
}

export const Pill: React.FC<PillProps> = ({ children, tone = 'slate', icon, className = '', mono = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold leading-none ${
      mono ? 'font-mono tracking-tight' : ''
    } ${TONE_PILL[tone]} ${className}`}
  >
    {icon}
    {children}
  </span>
);

/* ---------- Eyebrow label ---------- */
export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400 ${className}`}>
    {children}
  </span>
);

/* ---------- Buttons ---------- */
type ButtonVariant = 'primary' | 'ink' | 'ghost' | 'outline' | 'jade';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-vermilion-500 to-vermilion-600 text-white shadow-[var(--shadow-glow-vermilion)] hover:from-vermilion-400 hover:to-vermilion-600 border border-vermilion-600/60',
  ink: 'bg-ink-900 text-white hover:bg-ink-800 shadow-md shadow-ink-900/20 border border-ink-800',
  jade: 'bg-gradient-to-b from-jade-500 to-jade-600 text-white shadow-[var(--shadow-glow-jade)] hover:from-jade-400 hover:to-jade-600 border border-jade-700/60',
  ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent',
  outline: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-xl',
  md: 'px-4 py-2.5 text-xs sm:text-sm gap-2 rounded-2xl',
  lg: 'px-6 py-3.5 text-sm sm:text-base gap-2.5 rounded-2xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'outline',
  size = 'md',
  icon,
  iconRight,
  className = '',
  children,
  ...rest
}) => (
  <button
    className={`inline-flex items-center justify-center font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none cursor-pointer whitespace-nowrap ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {icon}
    {children}
    {iconRight}
  </button>
);

/* ---------- Icon button ---------- */
export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { dark?: boolean }> = ({
  className = '',
  dark = false,
  children,
  ...rest
}) => (
  <button
    className={`p-2 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${
      dark
        ? 'text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/80 bg-white shadow-xs'
    } ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/* ---------- Segmented control with sliding indicator ---------- */
export interface SegmentOption<T extends string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  accent?: boolean;
}

interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  layoutId: string;
  dark?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Segmented<T extends string>({ options, value, onChange, layoutId, dark = false, size = 'md', className = '' }: SegmentedProps<T>) {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-2xl ${
        dark ? 'bg-white/5 border border-white/10' : 'bg-slate-100/80 border border-slate-200/70'
      } ${className}`}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={active}
            id={`tab-${opt.id}`}
            onClick={() => onChange(opt.id)}
            className={`relative flex items-center gap-2 whitespace-nowrap font-bold transition-colors cursor-pointer ${
              size === 'sm' ? 'px-3 py-1.5 text-xs rounded-xl' : 'px-4 py-2.5 text-xs sm:text-sm rounded-xl'
            } ${
              active
                ? dark ? 'text-white' : 'text-white'
                : dark
                ? 'text-slate-300 hover:text-white'
                : opt.accent
                ? 'text-vermilion-600 hover:text-vermilion-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                className={`absolute inset-0 rounded-xl ${
                  dark ? 'bg-white/15 border border-white/20' : 'bg-ink-900 shadow-md shadow-ink-900/25'
                }`}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {opt.icon}
              <span>{opt.label}</span>
              {opt.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Stat tile ---------- */
interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  className?: string;
}

export const Stat: React.FC<StatProps> = ({ label, value, hint, icon, tone = 'slate', className = '' }) => (
  <div className={`p-3.5 rounded-2xl border ${tone === 'slate' ? 'bg-slate-50/70 border-slate-100' : TONE_PILL[tone]} ${className}`}>
    <div className="flex items-center justify-between gap-2 mb-1">
      <Eyebrow>{label}</Eyebrow>
      {icon && <span className="text-slate-400">{icon}</span>}
    </div>
    <div className="font-display text-base sm:text-lg font-bold text-slate-900 leading-tight">{value}</div>
    {hint && <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{hint}</div>}
  </div>
);

/* ---------- Divider with label ---------- */
export const LabeledDivider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-3">
    <span className="h-px flex-1 bg-slate-200/80" />
    <Eyebrow>{children}</Eyebrow>
    <span className="h-px flex-1 bg-slate-200/80" />
  </div>
);

/* ---------- Motion presets ---------- */
export const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
};

export const stagger = (delay = 0.04) => ({
  animate: { transition: { staggerChildren: delay } },
});
