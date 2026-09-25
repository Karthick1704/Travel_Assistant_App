import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Plane,
  Compass,
  Clock,
  CheckSquare,
  Star,
  Languages,
  Bot,
  ChevronRight,
  CreditCard,
  Sparkles,
  AlertCircle,
  Smartphone,
  ArrowUpRight,
  Sun,
} from 'lucide-react';
import { ITINERARY_DAYS } from './data/itineraryData';
import { Interactive3DPlane } from './components/Interactive3DPlane';
import { RouteGuideCard } from './components/RouteGuideCard';
import { ChecklistCard } from './components/ChecklistCard';
import { ReviewerInsightsCard } from './components/ReviewerInsightsCard';
import { LanguageHacksCard } from './components/LanguageHacksCard';
import { AIAssistantChat } from './components/AIAssistantChat';
import { AirportTicketModal } from './components/AirportTicketModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TripCountdownModal } from './components/TripCountdownModal';
import { CountdownWidget } from './components/CountdownWidget';
import { JourneyRail, dayIcon } from './components/JourneyRail';
import { JapanScene } from './components/JapanScene';
import { AircraftScene } from './components/three/AircraftScene';
import { Button, Eyebrow, Pill, Segmented, SegmentOption, fadeUp } from './components/ui/primitives';
import { getWorldClockTime } from './utils/timeUtils';

type TabType = 'overview' | 'ticket3d' | 'route' | 'checklist' | 'reviews' | 'language';

export default function App() {
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAirportTicketModalOpen, setIsAirportTicketModalOpen] = useState(false);
  const [isPWAModalOpen, setIsPWAModalOpen] = useState(false);
  const [isCountdownModalOpen, setIsCountdownModalOpen] = useState(true);
  const [selectedFlightLeg, setSelectedFlightLeg] = useState(0);
  const [worldTimes, setWorldTimes] = useState({ ist: '', hkt: '', jst: '' });

  const currentDay = ITINERARY_DAYS.find((d) => d.dayNumber === activeDayNumber) || ITINERARY_DAYS[0];
  const DayIcon = dayIcon(currentDay.iconName);

  const handleSelectDay = (dayNumber: number) => {
    setActiveDayNumber(dayNumber);
    setSelectedFlightLeg(0);
    const target = ITINERARY_DAYS.find((d) => d.dayNumber === dayNumber);
    if (!target?.hasFlightTicket || activeTab === 'ticket3d') setActiveTab('overview');
  };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setWorldTimes({
        ist: getWorldClockTime('Asia/Kolkata', now).timeStr,
        hkt: getWorldClockTime('Asia/Hong_Kong', now).timeStr,
        jst: getWorldClockTime('Asia/Tokyo', now).timeStr,
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // Keyboard: ← → to move between days
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isAIChatOpen || isAirportTicketModalOpen || isPWAModalOpen || isCountdownModalOpen) return;
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' && activeDayNumber < 9) handleSelectDay(activeDayNumber + 1);
      if (e.key === 'ArrowLeft' && activeDayNumber > 1) handleSelectDay(activeDayNumber - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const tabOptions = useMemo<SegmentOption<TabType>[]>(() => {
    const opts: SegmentOption<TabType>[] = [{ id: 'overview', label: 'Schedule', icon: <Clock className="w-4 h-4" /> }];
    if (currentDay.hasFlightTicket) {
      opts.push({
        id: 'ticket3d',
        label: 'Flight deck',
        icon: <Plane className="w-4 h-4" />,
        accent: true,
        badge: <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-extrabold bg-jade-500 text-white">3D</span>,
      });
    }
    opts.push(
      { id: 'route', label: 'Route', icon: <Compass className="w-4 h-4" /> },
      { id: 'checklist', label: 'Checklist', icon: <CheckSquare className="w-4 h-4" /> },
      { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
      { id: 'language', label: 'Phrases', icon: <Languages className="w-4 h-4" /> }
    );
    return opts;
  }, [currentDay.hasFlightTicket]);

  const clockShort = (s: string) => s.replace(/:\d{2}\s/, ' ');

  return (
    <div className="min-h-screen bg-paper-50 text-slate-800 flex flex-col font-sans">
      {/* ================= DARK HERO BAND ================= */}
      <div className="relative bg-ink-950 text-white">
        {/* background: Japan scene with the traveller's aircraft gliding over */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none grain">
          <JapanScene variant="band" showPlane />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper-50 to-transparent" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 glass-dark border-x-0 border-t-0 rounded-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-vermilion-500 to-vermilion-700 flex items-center justify-center shadow-[var(--shadow-glow-vermilion)] flex-shrink-0">
                <Compass className="w-5 h-5 text-white animate-spin-slow" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-base sm:text-lg font-bold tracking-tight leading-none truncate">
                    Tokyo <span className="text-white/40">&</span> Kansai
                  </h1>
                  <Pill tone="ink" className="hidden sm:inline-flex bg-white/10 border-white/15 text-white/80" mono>
                    9 DAYS
                  </Pill>
                </div>
                <p className="text-[11px] text-white/50 font-medium mt-1 truncate">Personal travel assistant · Sep 29 – Oct 7, 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* clocks */}
              <button
                onClick={() => setIsCountdownModalOpen(true)}
                title="Open immersive countdown"
                className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors cursor-pointer"
              >
                {[
                  { f: '🇮🇳', l: 'IST', v: worldTimes.ist, hot: false },
                  { f: '🇭🇰', l: 'HKT', v: worldTimes.hkt, hot: false },
                  { f: '🇯🇵', l: 'JST', v: worldTimes.jst, hot: true },
                ].map((c, i) => (
                  <span key={c.l} className={`flex items-center gap-1.5 ${i < 2 ? 'pr-3 border-r border-white/10' : ''}`}>
                    <span className="text-xs">{c.f}</span>
                    <span className="flex flex-col leading-none">
                      <span className={`text-[9px] font-extrabold tracking-widest ${c.hot ? 'text-vermilion-400' : 'text-white/45'}`}>{c.l}</span>
                      <span className="font-mono text-[11px] font-bold tabular-nums mt-0.5">{c.v ? clockShort(c.v) : '--:--'}</span>
                    </span>
                  </span>
                ))}
              </button>

              <button
                id="open-airport-tickets-btn"
                onClick={() => setIsAirportTicketModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-colors cursor-pointer"
                title="Explore all 4 flights in 3D"
              >
                <Plane className="w-3.5 h-3.5 text-jade-300 -rotate-45" />
                <span className="hidden sm:inline">Flights</span>
                <span className="font-mono text-[10px] bg-jade-500/20 text-jade-300 px-1.5 py-0.5 rounded-md border border-jade-400/30">4</span>
              </button>

              <button
                id="open-pwa-install-btn"
                onClick={() => setIsPWAModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-colors cursor-pointer"
                title="Install on your phone"
              >
                <Smartphone className="w-3.5 h-3.5 text-white/70" />
                <span>Install</span>
              </button>

              <Button id="open-ai-assistant-btn" variant="primary" size="sm" onClick={() => setIsAIChatOpen(true)} icon={<Bot className="w-4 h-4" />} className="rounded-2xl py-2">
                <span className="hidden sm:inline">Ask AI guide</span>
                <span className="sm:hidden">AI</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero band content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10 space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <CountdownWidget onOpenCountdownModal={() => setIsCountdownModalOpen(true)} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
            <JourneyRail days={ITINERARY_DAYS} activeDay={activeDayNumber} onSelect={handleSelectDay} />
          </motion.div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 -mt-6 pb-16 space-y-6 relative z-10">
        {/* Day hero */}
        <AnimatePresence mode="wait">
          <motion.section
            key={currentDay.dayNumber}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="card relative overflow-hidden p-6 sm:p-8"
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${currentDay.themeColor}`} />
            <div className={`absolute -right-24 -top-24 w-72 h-72 rounded-full bg-gradient-to-br ${currentDay.themeColor} opacity-[0.08] blur-3xl pointer-events-none`} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="vermilion" mono>
                    Day {currentDay.dayNumber} · {currentDay.date} · {currentDay.dayOfWeek}
                  </Pill>
                  <Pill tone={currentDay.transitAlert.status === 'Smooth' ? 'emerald' : 'gold'} icon={<AlertCircle className="w-3 h-3" />}>
                    Transit: {currentDay.transitAlert.status}
                  </Pill>
                  {currentDay.transitAlert.icCardAccepted && (
                    <Pill tone="sky" icon={<CreditCard className="w-3 h-3" />}>
                      Suica / Pasmo accepted
                    </Pill>
                  )}
                </div>

                <div className="flex items-start gap-4">
                  <div className={`hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br ${currentDay.themeColor} text-white items-center justify-center shadow-lg flex-shrink-0`}>
                    <DayIcon className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-[1.05] text-balance">
                      {currentDay.title}
                      <span className="text-vermilion-500">.</span>
                    </h2>
                    <p className="text-sm text-slate-500 font-semibold mt-2">{currentDay.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{currentDay.summary}</p>
              </div>

              {/* Side facts */}
              <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-2.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <Eyebrow className="mb-1">Where</Eyebrow>
                  <div className="text-xs font-bold text-slate-900 leading-snug">{currentDay.locationArea}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <Eyebrow className="mb-1">Transit note</Eyebrow>
                  <div className="text-xs font-medium text-slate-700 leading-snug">{currentDay.transitAlert.message}</div>
                </div>
                <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-ink-900 text-white flex items-center justify-between gap-3">
                  <div>
                    <Eyebrow className="text-white/50 mb-1">Stops today</Eyebrow>
                    <div className="font-display text-2xl font-bold leading-none">{currentDay.schedule.length}</div>
                  </div>
                  <div className="text-right">
                    <Eyebrow className="text-white/50 mb-1">Highlights</Eyebrow>
                    <div className="font-display text-2xl font-bold leading-none text-gold-400">{currentDay.schedule.filter((s) => s.highlight).length}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </AnimatePresence>

        {/* Tabs (sticky) */}
        <div className="sticky top-[68px] z-30 -mx-4 px-4 sm:mx-0 sm:px-0 py-2">
          <div className="glass-light rounded-3xl p-1.5 overflow-x-auto no-scrollbar">
            <Segmented layoutId="main-tabs" options={tabOptions} value={activeTab} onChange={setActiveTab} className="bg-transparent border-0 p-0 min-w-max" />
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={`${activeTab}-${currentDay.dayNumber}`} {...fadeUp} className="space-y-6">
            {activeTab === 'overview' && (
              <>
                {currentDay.hasFlightTicket && (
                  <div className="relative overflow-hidden rounded-[28px] bg-ink-900 text-white border border-ink-700/60 grain">
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-transparent z-10" />
                      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 opacity-70">
                        <AircraftScene phase={currentDay.dayNumber === 1 ? 'takeoff' : 'landing'} interactive={false} framing="banner" quality="low" />
                      </div>
                    </div>
                    <div className="relative z-20 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      <div className="max-w-lg">
                        <Pill tone="ink" className="bg-jade-500/20 border-jade-400/30 text-jade-200" icon={<Plane className="w-3 h-3 -rotate-45" />}>
                          {currentDay.dayNumber === 1 ? 'Outbound · Cathay Pacific' : 'Return · Cathay Pacific'}
                        </Pill>
                        <h4 className="font-display text-xl sm:text-2xl font-bold tracking-tight mt-3">
                          {currentDay.dayNumber === 1 ? 'CX 632 → CX 520 · Chennai to Tokyo via Hong Kong' : 'CX 503 → CX 651 · Osaka to Chennai via Hong Kong'}
                        </h4>
                        <p className="text-sm text-white/60 mt-2 leading-relaxed">
                          Interactive 3D aircraft, flip-to-reveal boarding passes, live-style telemetry, route ribbon, baggage and seat picks.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button id="overview-open-ticket-tab" variant="jade" onClick={() => setActiveTab('ticket3d')} iconRight={<ChevronRight className="w-4 h-4" />}>
                          Open flight deck
                        </Button>
                        <Button
                          id="overview-open-all-flights-modal"
                          variant="outline"
                          onClick={() => setIsAirportTicketModalOpen(true)}
                          className="bg-white/10 border-white/15 text-white hover:bg-white/15"
                          iconRight={<ArrowUpRight className="w-4 h-4" />}
                        >
                          All 4 flights
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <section className="card p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-ink-900 text-white flex items-center justify-center shadow-md">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <Eyebrow>Day plan</Eyebrow>
                        <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 tracking-tight">Activity timeline</h3>
                      </div>
                    </div>
                    <Pill tone="slate" icon={<Sun className="w-3 h-3 text-amber-500" />}>
                      {currentDay.schedule.length} stops
                    </Pill>
                  </div>

                  <ol className="relative pl-[78px] sm:pl-[92px] space-y-3 before:absolute before:left-[62px] sm:before:left-[76px] before:top-4 before:bottom-4 before:w-px before:bg-slate-200">
                    {currentDay.schedule.map((item, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.25 }}
                        className="relative"
                      >
                        <span className="absolute -left-[78px] sm:-left-[92px] top-3.5 w-[56px] sm:w-[68px] text-right font-mono text-[10px] sm:text-[11px] font-extrabold text-slate-500 leading-tight tabular-nums">
                          {item.time.split(' - ')[0]}
                          {item.time.includes(' - ') && <span className="block text-slate-300 font-semibold">{item.time.split(' - ')[1]}</span>}
                        </span>
                        <span className={`absolute -left-[21px] sm:-left-[21px] top-4 w-2.5 h-2.5 rounded-full border-2 border-white shadow ${item.highlight ? 'bg-vermilion-500 ring-4 ring-vermilion-100' : 'bg-slate-300'}`} />
                        <div className={`p-4 rounded-2xl border transition-all ${item.highlight ? 'bg-gradient-to-br from-vermilion-50/70 to-white border-vermilion-100 shadow-xs' : 'bg-white border-slate-100 hover:border-slate-200'} card-hover`}>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{item.activity}</h4>
                            {item.highlight && (
                              <Pill tone="vermilion" icon={<Sparkles className="w-3 h-3" />}>
                                Highlight
                              </Pill>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed mt-1">{item.detail}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <RouteGuideCard route={currentDay.routeGuide} dayTitle={currentDay.title} />
                  <ChecklistCard key={`checklist-overview-${currentDay.dayNumber}`} dayNumber={currentDay.dayNumber} initialItems={currentDay.checklist} onSelectDay={handleSelectDay} />
                </div>
              </>
            )}

            {activeTab === 'ticket3d' && currentDay.hasFlightTicket && (
              <>
                <section className="card p-5 sm:p-7">
                  <Interactive3DPlane
                    flightLegs={currentDay.flightLegs || ITINERARY_DAYS[0].flightLegs!}
                    activeLegIndex={selectedFlightLeg}
                    onSelectLeg={setSelectedFlightLeg}
                    flightType={activeDayNumber === 9 ? 'return' : 'outbound'}
                    onSelectDay={(d) => {
                      if (d !== activeDayNumber) {
                        setActiveDayNumber(d);
                        setSelectedFlightLeg(0);
                      }
                    }}
                  />
                </section>
                <RouteGuideCard route={currentDay.routeGuide} dayTitle={currentDay.title} />
              </>
            )}

            {activeTab === 'route' && <RouteGuideCard route={currentDay.routeGuide} dayTitle={currentDay.title} />}

            {activeTab === 'checklist' && (
              <ChecklistCard key={`checklist-tab-${currentDay.dayNumber}`} dayNumber={currentDay.dayNumber} initialItems={currentDay.checklist} onSelectDay={handleSelectDay} />
            )}

            {activeTab === 'reviews' && (
              <ReviewerInsightsCard reviews={currentDay.googleReviews} dosAndDonts={currentDay.dosAndDonts} culturalTips={currentDay.culturalTips} locationTitle={currentDay.title} />
            )}

            {activeTab === 'language' && <LanguageHacksCard recommendedPhrases={currentDay.recommendedPhrases} />}
          </motion.div>
        </AnimatePresence>

        {/* Prev / next day footer nav */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {activeDayNumber > 1 ? (
            <button onClick={() => handleSelectDay(activeDayNumber - 1)} className="card card-hover p-4 text-left flex items-center gap-3 cursor-pointer">
              <ChevronRight className="w-4 h-4 rotate-180 text-slate-400" />
              <div className="min-w-0">
                <Eyebrow>Previous</Eyebrow>
                <div className="text-xs font-bold text-slate-900 truncate">Day {activeDayNumber - 1} · {ITINERARY_DAYS[activeDayNumber - 2].title}</div>
              </div>
            </button>
          ) : (
            <span />
          )}
          {activeDayNumber < 9 && (
            <button onClick={() => handleSelectDay(activeDayNumber + 1)} className="card card-hover p-4 text-right flex items-center justify-end gap-3 cursor-pointer">
              <div className="min-w-0">
                <Eyebrow>Next</Eyebrow>
                <div className="text-xs font-bold text-slate-900 truncate">Day {activeDayNumber + 1} · {ITINERARY_DAYS[activeDayNumber].title}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-vermilion-500" />
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ink-950 text-white/60 py-8 text-xs relative overflow-hidden grain">
        <div className="absolute inset-0 dot-grid opacity-[0.06] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-vermilion-400" />
            <span className="font-medium">© 2026 Tokyo & Kansai Explorer · 9-day personal travel assistant</span>
          </div>
          <div className="flex items-center gap-5 font-semibold">
            <button onClick={() => setIsAIChatOpen(true)} className="hover:text-white transition-colors cursor-pointer">
              Ask AI
            </button>
            <button onClick={() => setActiveTab('language')} className="hover:text-white transition-colors cursor-pointer">
              Phrases
            </button>
            <button onClick={() => setIsAirportTicketModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
              Flights
            </button>
            <button onClick={() => setIsPWAModalOpen(true)} className="hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer">
              <Smartphone className="w-3.5 h-3.5 text-vermilion-400" /> Install
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile floating AI button */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="sm:hidden fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-vermilion-500 to-vermilion-700 text-white shadow-[var(--shadow-glow-vermilion)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        aria-label="Ask AI guide"
      >
        <Bot className="w-6 h-6" />
        <span className="absolute inset-0 rounded-full border-2 border-vermilion-400/60 animate-pulse-ring" />
      </button>

      <AIAssistantChat currentDay={currentDay} isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <AirportTicketModal
        isOpen={isAirportTicketModalOpen}
        onClose={() => setIsAirportTicketModalOpen(false)}
        onSelectDay={(d) => {
          handleSelectDay(d);
          setIsAirportTicketModalOpen(false);
        }}
      />
      <PWAInstallModal isOpen={isPWAModalOpen} onClose={() => setIsPWAModalOpen(false)} />
      <TripCountdownModal isOpen={isCountdownModalOpen} onClose={() => setIsCountdownModalOpen(false)} />
      <OfflineIndicator />
    </div>
  );
}
