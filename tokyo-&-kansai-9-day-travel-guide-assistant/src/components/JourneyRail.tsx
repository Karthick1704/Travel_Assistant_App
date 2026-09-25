import React from 'react';
import { motion } from 'motion/react';
import { Plane, Compass, Sparkles, Mountain, Train, Trees, Ship, PlaneTakeoff, ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { ItineraryDay } from '../types';
import { Eyebrow, IconButton } from './ui/primitives';

const ICONS: Record<string, React.ElementType> = {
  Plane,
  Compass,
  Sparkles,
  Mountain,
  Train,
  Trees,
  Ship,
  PlaneTakeoff,
};

export const dayIcon = (name: string): React.ElementType => ICONS[name] || MapPin;

const CITY_TONE: Record<ItineraryDay['city'], string> = {
  Tokyo: 'text-sky-300',
  'Hakone/Fuji': 'text-amber-300',
  Osaka: 'text-vermilion-400',
  Kyoto: 'text-emerald-300',
  'Tango Peninsula': 'text-cyan-300',
};

interface JourneyRailProps {
  days: ItineraryDay[];
  activeDay: number;
  onSelect: (day: number) => void;
}

export const JourneyRail: React.FC<JourneyRailProps> = ({ days, activeDay, onSelect }) => {
  const railRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = railRef.current?.querySelector<HTMLElement>(`[data-day="${activeDay}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeDay]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Calendar className="w-4 h-4 text-vermilion-400" />
          <Eyebrow className="text-white/55">Journey · Sep 29 – Oct 7</Eyebrow>
        </div>
        <div className="flex items-center gap-1.5">
          <IconButton dark id="prev-day-btn" onClick={() => onSelect(Math.max(1, activeDay - 1))} disabled={activeDay === 1} title="Previous day" aria-label="Previous day">
            <ChevronLeft className="w-4 h-4" />
          </IconButton>
          <span className="font-mono text-xs font-bold text-white/80 px-1 tabular-nums">
            Day {activeDay} <span className="text-white/35">/ {days.length}</span>
          </span>
          <IconButton dark id="next-day-btn" onClick={() => onSelect(Math.min(days.length, activeDay + 1))} disabled={activeDay === days.length} title="Next day" aria-label="Next day">
            <ChevronRight className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      <div ref={railRef} className="relative -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar pb-2">
        {/* connector line */}
        <div className="absolute left-4 right-4 sm:left-0 sm:right-0 top-[38px] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        <div className="flex gap-3 min-w-max">
          {days.map((day) => {
            const active = day.dayNumber === activeDay;
            const Icon = dayIcon(day.iconName);
            return (
              <motion.button
                key={day.id}
                data-day={day.dayNumber}
                id={`day-selector-card-${day.dayNumber}`}
                onClick={() => onSelect(day.dayNumber)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className={`relative w-44 sm:w-52 text-left p-4 rounded-3xl border transition-colors cursor-pointer overflow-hidden ${
                  active
                    ? 'bg-paper-50 text-slate-900 border-gold-300/70 shadow-[0_20px_50px_-20px_rgba(217,178,106,0.45)]'
                    : 'glass-dark text-white hover:bg-white/10 hover:border-gold-400/30'
                }`}
                aria-pressed={active}
              >
                {active && <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${day.themeColor}`} />}
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-mono text-[11px] font-extrabold uppercase tracking-widest ${active ? 'text-vermilion-600' : 'text-white/50'}`}>Day {day.dayNumber}</span>
                  <span className={`text-[10px] font-semibold ${active ? 'text-slate-400' : 'text-white/45'}`}>{day.date.split(' ')[0]} {day.date.split(' ')[1]?.slice(0, 3)}</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${active ? `bg-gradient-to-br ${day.themeColor} text-white border-transparent shadow-md` : 'bg-white/10 border-white/10'} ${!active ? CITY_TONE[day.city] : ''}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-xs font-bold leading-snug line-clamp-2 ${active ? 'text-slate-900' : 'text-white'}`}>{day.title}</h3>
                    <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-semibold ${active ? 'text-slate-500' : 'text-white/50'}`}>
                      <MapPin className={`w-3 h-3 ${active ? 'text-vermilion-500' : CITY_TONE[day.city]}`} />
                      <span className="truncate">{day.city}</span>
                      {day.hasFlightTicket && <Plane className={`w-3 h-3 ml-auto ${active ? 'text-jade-600' : 'text-jade-300'}`} />}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
