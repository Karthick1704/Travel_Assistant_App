import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Sparkles,
  RefreshCw,
  Plus,
  Check,
  Luggage,
  Ticket,
  Mountain,
  Train,
  Landmark,
  Building2,
  Ship,
  Plane,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChecklistItem } from '../types';
import { Button, CardHeader, Eyebrow, IconButton, SectionCard } from './ui/primitives';

interface ChecklistCardProps {
  dayNumber: number;
  initialItems: ChecklistItem[];
  onSelectDay?: (day: number) => void;
}

interface DayMeta {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  badgeColor: string;
}

const DAY_CHECKLIST_METADATA: Record<number, DayMeta> = {
  1: {
    title: 'Day 1: Arrival, Passports, Tickets & Tokyo Transit Checklist',
    subtitle: 'Physical passports, flight tickets CX 632 / CX 520, Visit Japan Web QR codes, Yen cash & Narita transit',
    badge: 'Arrival & Transit',
    icon: Plane,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  2: {
    title: 'Day 2: Tokyo DisneySea 1-Day Passport & Theme Park Checklist',
    subtitle: 'DisneySea 1-Day Passport QR, Tokyo Disney Resort App, power bank, monorail pass & harbor gear',
    badge: 'DisneySea Tickets & Passes',
    icon: Ticket,
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  3: {
    title: 'Day 3: teamLab Borderless, Akihabara & Tax-Free Shopping Checklist',
    subtitle: 'teamLab 18:00 QR ticket, physical passport for 10% tax-free savings, pants for mirror floors & gachapon coins',
    badge: 'teamLab & Tax-Free Merch',
    icon: Sparkles,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  4: {
    title: 'Day 4: Mt. Fuji 5th Station, Hakone Ropeway & Enoshima Checklist',
    subtitle: 'Tour coach voucher / Hakone Freepass, warm windbreaker (8-13°C at 2,300m), motion sickness pills & egg cash',
    badge: 'Mt. Fuji & Ropeway Passes',
    icon: Mountain,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  5: {
    title: 'Day 5: 10:00 AM Shinkansen Bullet Train & Dotonbori Cruise Checklist',
    subtitle: 'Shinkansen Nozomi bullet train reserved tickets, Dotonbori river cruise voucher, tagged luggage & bento',
    badge: 'Bullet Train & Cruise',
    icon: Train,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  6: {
    title: 'Day 6: Nara Deer Park, Fushimi Inari & Kyoto Tour Checklist',
    subtitle: 'Kyoto/Nara tour pass, 100-yen coins for deer crackers, 5-yen shrine offering coins & gripped walking shoes',
    badge: 'Kyoto Tour & Shrines',
    icon: Landmark,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  7: {
    title: 'Day 7: Osaka Castle, Kuromon Market & Umeda Sky Checklist',
    subtitle: 'Osaka Metro 1-Day Eco Card pass, castle tickets, Umeda Sky observatory sunset pass & seafood market cash',
    badge: 'Osaka Passes & Sights',
    icon: Building2,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  8: {
    title: 'Day 8: Amanohashidate Ropeway & Ine Bay Boathouses Cruise Checklist',
    subtitle: 'Ine Bay sightseeing boat excursion tickets, Kasamatsu chairlift pass, seagull snack coins & sea windbreaker',
    badge: 'Coastal Cruise & Chairlift',
    icon: Ship,
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  9: {
    title: 'Day 9: Final Departure, Packing, Clothes & Flights Checklist',
    subtitle: 'Pack all clothes, tax-free souvenirs bought, passports in carry-on, power banks & transit to KIX for CX 503 / 651',
    badge: 'Final Departure Home',
    icon: Luggage,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
};

const STORAGE_PREFIX = 'japan_trip_checklist_v4_day_';

export const ChecklistCard: React.FC<ChecklistCardProps> = ({ dayNumber, initialItems, onSelectDay }) => {
  const isDepartureDay = dayNumber === 9;
  const currentDayRef = useRef(dayNumber);
  const meta = DAY_CHECKLIST_METADATA[dayNumber] || DAY_CHECKLIST_METADATA[1];
  const IconComponent = meta.icon;

  // Clean up any old unversioned keys from previous sessions to prevent stale cache leakage
  useEffect(() => {
    try {
      for (let i = 1; i <= 9; i++) {
        localStorage.removeItem(`japan_trip_day_${i}_checklist`);
        localStorage.removeItem(`japan_trip_checklist_v1_day_${i}`);
        localStorage.removeItem(`japan_trip_checklist_v2_day_${i}`);
        localStorage.removeItem(`japan_trip_checklist_v3_day_${i}`);
      }
    } catch {
      // ignore
    }
  }, []);

  // Helper to validate and merge saved items with default initial items
  const getValidItems = (savedStr: string | null, day: number, defaults: ChecklistItem[]): ChecklistItem[] => {
    if (!savedStr) {
      return defaults.map((item) => ({ ...item, checked: false }));
    }
    try {
      const parsed = JSON.parse(savedStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanity check: Ensure saved items don't belong to another day (e.g., c2- DisneySea on day 3)
        const hasForeignDayItems = parsed.some((it) => {
          if (it.id && typeof it.id === 'string' && it.id.startsWith('c')) {
            const match = it.id.match(/^c(\d+)-/);
            if (match && parseInt(match[1], 10) !== day) {
              return true;
            }
          }
          return false;
        });

        if (!hasForeignDayItems) {
          const savedMap = new Map(parsed.map((p: ChecklistItem) => [p.id, p]));
          // Merge with current enriched defaults: preserves checked status while updating text/tips
          const mergedDefaults = defaults.map((d) => {
            const existing = savedMap.get(d.id);
            return existing ? { ...d, checked: !!existing.checked } : { ...d, checked: false };
          });
          const customItems = parsed.filter((p: ChecklistItem) => p.id?.startsWith('custom-'));
          return [...mergedDefaults, ...customItems];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return defaults.map((item) => ({ ...item, checked: false }));
  };

  const storageKey = `${STORAGE_PREFIX}${dayNumber}`;
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    return getValidItems(saved, dayNumber, initialItems);
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newItemText, setNewItemText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // When dayNumber or initialItems change, reload strictly for this day
  useEffect(() => {
    currentDayRef.current = dayNumber;
    const key = `${STORAGE_PREFIX}${dayNumber}`;
    const saved = localStorage.getItem(key);
    const valid = getValidItems(saved, dayNumber, initialItems);
    setItems(valid);
    setActiveCategory('all');
  }, [dayNumber, initialItems]);

  // Sync to localStorage ONLY if currentDayRef matches dayNumber to prevent race condition overwrites
  useEffect(() => {
    if (currentDayRef.current === dayNumber) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (e) {
        console.error(e);
      }
    }
  }, [items, dayNumber, storageKey]);

  const toggleItem = (id: string) => {
    const updated = items.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it));
    setItems(updated);

    // Trigger celebratory confetti if all checked
    const totalCount = updated.length;
    const checkedCount = updated.filter((it) => it.checked).length;
    if (checkedCount === totalCount && totalCount > 0) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#f43f5e', '#10b981', '#f59e0b'],
      });
    }
  };

  const resetAll = () => {
    const reset = initialItems.map((it) => ({ ...it, checked: false }));
    setItems(reset);
    try {
      localStorage.setItem(storageKey, JSON.stringify(reset));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text: newItemText.trim(),
      category: 'special',
      tip: `Custom personal item for Day ${dayNumber}`,
      checked: false,
    };
    setItems([...items, newItem]);
    setNewItemText('');
    setShowAddForm(false);
  };

  const totalCount = items.length;
  const checkedCount = items.filter((it) => it.checked).length;
  const percentComplete = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const filteredItems =
    activeCategory === 'all'
      ? items
      : items.filter((it) => it.category === activeCategory);

  const CATEGORIES = [
    { id: 'all', label: 'All items' },
    { id: 'documents', label: 'Passports & tickets' },
    { id: 'essential', label: 'Essentials & cash' },
    { id: 'electronics', label: 'Electronics & apps' },
    { id: 'clothing', label: 'Clothing & weather' },
    { id: 'special', label: 'Special gear' },
  ];

  const CATEGORY_DOT: Record<string, string> = {
    documents: 'bg-vermilion-500',
    essential: 'bg-amber-500',
    electronics: 'bg-sky-500',
    clothing: 'bg-violet-500',
    special: 'bg-jade-500',
  };

  const R = 22;
  const C = 2 * Math.PI * R;

  return (
    <SectionCard>
      {/* Day switcher */}
      {onSelectDay && (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-4 border-b border-slate-100 no-scrollbar">
          <Eyebrow className="whitespace-nowrap">Day</Eyebrow>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button
                key={d}
                onClick={() => onSelectDay(d)}
                className={`relative w-8 h-8 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${d === dayNumber ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'}`}
                aria-label={`Day ${d} checklist`}
              >
                {d === dayNumber && <motion.span layoutId="checklist-day-pill" className="absolute inset-0 rounded-xl bg-ink-900 shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative z-10">{d}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <CardHeader
        tone="slate"
        icon={<IconComponent className="w-5 h-5" />}
        eyebrow={meta.badge}
        title={meta.title.replace(/^Day \d+: /, '')}
        subtitle={meta.subtitle}
        action={
          <>
            <IconButton id={`reset-checklist-day-${dayNumber}`} onClick={resetAll} title="Reset to defaults" aria-label="Reset checklist">
              <RefreshCw className="w-4 h-4" />
            </IconButton>
            <Button id={`add-custom-item-day-${dayNumber}`} variant="ink" size="sm" onClick={() => setShowAddForm(!showAddForm)} icon={<Plus className="w-3.5 h-3.5" />}>
              Add item
            </Button>
          </>
        }
      />

      {/* Progress */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-paper-100 border border-slate-100">
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
            <circle cx="28" cy="28" r={R} fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <motion.circle
              cx="28"
              cy="28"
              r={R}
              fill="none"
              stroke={percentComplete === 100 ? '#10b981' : '#e63946'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              animate={{ strokeDashoffset: C * (1 - percentComplete / 100) }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-extrabold text-slate-900">{percentComplete}%</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-slate-900">{isDepartureDay ? 'Packing & departure readiness' : `Day ${dayNumber} readiness`}</span>
            <span className="font-mono text-xs font-bold text-slate-500">
              {checkedCount}/{totalCount}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${percentComplete === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-vermilion-400 to-vermilion-600'}`}
              animate={{ width: `${percentComplete}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
          <AnimatePresence>
            {percentComplete === 100 && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                {isDepartureDay ? 'All packed, souvenirs secured. Ready for the flight home!' : `Everything prepared for Day ${dayNumber}.`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-4">
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          const count = cat.id === 'all' ? items.length : items.filter((i) => i.category === cat.id).length;
          if (cat.id !== 'all' && count === 0) return null;
          return (
            <button
              key={cat.id}
              id={`filter-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${active ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'}`}
            >
              {active && <motion.span layoutId={`checklist-cat-${dayNumber}`} className="absolute inset-0 rounded-xl bg-ink-900 shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative z-10 flex items-center gap-1.5">
                {cat.id !== 'all' && <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[cat.id]}`} />}
                {cat.label}
                <span className={`font-mono text-[10px] ${active ? 'text-white/60' : 'text-slate-400'}`}>{count}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddItem}
            className="overflow-hidden"
          >
            <div className="mt-3 flex gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-slate-400 transition-colors">
              <input
                type="text"
                placeholder={`E.g. Day ${dayNumber} ticket printout, jacket, camera…`}
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
                autoFocus
              />
              <Button type="submit" variant="ink" size="sm">
                Add
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Items */}
      <motion.ul layout className="mt-4 space-y-2">
        <AnimatePresence initial={false}>
          {filteredItems.map((item) => (
            <motion.li
              layout
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onClick={() => toggleItem(item.id)}
              className={`group p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                item.checked ? 'bg-slate-50/60 border-slate-100' : 'bg-white border-slate-100 hover:border-slate-300 shadow-xs hover:shadow-md'
              }`}
            >
              <span
                className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white group-hover:border-vermilion-400'
                }`}
              >
                <AnimatePresence>
                  {item.checked && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-bold block transition-colors ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.text}</span>
                {item.tip && <p className={`text-[11px] mt-0.5 leading-relaxed ${item.checked ? 'text-slate-300' : 'text-slate-500'}`}>{item.tip}</p>}
              </div>
              <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${CATEGORY_DOT[item.category] || 'bg-slate-300'} ${item.checked ? 'opacity-30' : ''}`} title={item.category} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </SectionCard>
  );
};
