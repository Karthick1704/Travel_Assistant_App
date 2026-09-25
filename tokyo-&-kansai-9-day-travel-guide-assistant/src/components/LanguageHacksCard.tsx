import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2, Languages, Search, Sparkles, X } from 'lucide-react';
import { LanguageHack } from '../types';
import { JAPANESE_LANGUAGE_HACKS, speakJapanese } from '../data/languageData';
import { CardHeader, Eyebrow, SectionCard } from './ui/primitives';

interface LanguageHacksCardProps {
  recommendedPhrases?: LanguageHack[];
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'courtesy', label: 'Greetings & manners' },
  { id: 'transit', label: 'Transit' },
  { id: 'dining', label: 'Dining' },
  { id: 'shopping', label: 'Shopping & tax-free' },
  { id: 'emergency', label: 'Help' },
];

const CATEGORY_TONE: Record<string, string> = {
  courtesy: 'from-vermilion-500/30 to-rose-500/10',
  transit: 'from-jade-500/30 to-teal-500/10',
  dining: 'from-amber-500/30 to-orange-500/10',
  shopping: 'from-violet-500/30 to-fuchsia-500/10',
  emergency: 'from-sky-500/30 to-blue-500/10',
};

export const LanguageHacksCard: React.FC<LanguageHacksCardProps> = ({ recommendedPhrases }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);

  const handleSpeak = (phrase: LanguageHack) => {
    setLastSpokenId(phrase.id);
    speakJapanese(phrase.japanese);
    setTimeout(() => setLastSpokenId(null), 1500);
  };

  const q = searchQuery.toLowerCase();
  const filtered = JAPANESE_LANGUAGE_HACKS.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !q || p.meaning.toLowerCase().includes(q) || p.romaji.toLowerCase().includes(q) || p.japanese.includes(searchQuery) || p.context.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <SectionCard>
      <CardHeader
        tone="sky"
        icon={<Languages className="w-5 h-5" />}
        eyebrow="日本語 · Nihongo"
        title="Language hacks & audio"
        subtitle="Tap the speaker to hear native pronunciation"
        action={
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search: water, bill, station…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 font-medium transition"
              aria-label="Search phrases"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Clear">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        }
      />

      {recommendedPhrases && recommendedPhrases.length > 0 && !searchQuery && selectedCategory === 'all' && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50/60 border border-sky-100 mb-5">
          <div className="flex items-center gap-1.5 text-sky-700 text-[10px] font-extrabold uppercase tracking-widest mb-2.5">
            <Sparkles className="w-3.5 h-3.5" /> Recommended for today
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {recommendedPhrases.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => handleSpeak(phrase)}
                className="p-3 rounded-xl bg-white border border-sky-200/60 hover:border-sky-400 cursor-pointer transition-all flex items-center justify-between shadow-xs text-left card-hover"
              >
                <div className="min-w-0">
                  <div className="font-japanese text-sm font-bold text-slate-900 truncate">{phrase.japanese}</div>
                  <div className="text-[11px] text-slate-700 font-bold">{phrase.romaji}</div>
                  <div className="text-[11px] text-sky-600 font-medium truncate">{phrase.meaning}</div>
                </div>
                <Volume2 className={`w-4 h-4 text-sky-500 flex-shrink-0 ${lastSpokenId === phrase.id ? 'animate-bounce' : ''}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`lang-cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${active ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'}`}
            >
              {active && <motion.span layoutId="lang-cat-pill" className="absolute inset-0 rounded-xl bg-ink-900 shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative z-10">{cat.label}</span>
            </button>
          );
        })}
        <span className="ml-auto text-[11px] text-slate-400 font-semibold">{filtered.length} phrases</span>
      </div>

      {/* Phrase grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((phrase) => {
            const isSpoken = lastSpokenId === phrase.id;
            return (
              <motion.div
                layout
                key={phrase.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={`relative overflow-hidden p-5 rounded-3xl flex flex-col justify-between text-white bg-ink-900 border transition-all grain ${
                  isSpoken ? 'border-sky-400 ring-4 ring-sky-400/20' : 'border-ink-700/60 hover:border-ink-600'
                }`}
              >
                <div className={`absolute -right-12 -top-12 w-44 h-44 rounded-full bg-gradient-to-br ${CATEGORY_TONE[phrase.category]} blur-2xl pointer-events-none`} />
                <div className="relative">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-japanese text-xl font-black tracking-wide leading-tight">{phrase.japanese}</span>
                    <button
                      id={`speak-btn-${phrase.id}`}
                      onClick={() => handleSpeak(phrase)}
                      title="Pronounce"
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${isSpoken ? 'bg-sky-500 border-sky-400 text-white' : 'bg-white/10 border-white/10 text-white/70 hover:bg-sky-500 hover:text-white'}`}
                    >
                      <Volume2 className={`w-4 h-4 ${isSpoken ? 'animate-bounce' : ''}`} />
                    </button>
                  </div>
                  <Eyebrow className="text-white/40">{phrase.category}</Eyebrow>
                  <div className="font-display text-base font-bold tracking-tight mt-0.5">{phrase.romaji}</div>
                  <div className="text-xs italic text-sky-300 font-medium mt-0.5 mb-3">{phrase.meaning}</div>
                </div>
                <div className="relative pt-2.5 border-t border-white/10 text-[11px] text-white/65 leading-relaxed">{phrase.context}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-sm text-slate-400 font-medium">No phrases match “{searchQuery}”.</div>
      )}
    </SectionCard>
  );
};
