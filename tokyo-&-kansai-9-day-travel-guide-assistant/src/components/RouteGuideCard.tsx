import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Compass, Clock, Coins, AlertTriangle, CheckCircle2, ArrowDown, Navigation } from 'lucide-react';
import { RouteGuide } from '../types';
import { Button, CardHeader, Eyebrow, SectionCard } from './ui/primitives';

interface RouteGuideCardProps {
  route: RouteGuide;
  dayTitle: string;
}

export const RouteGuideCard: React.FC<RouteGuideCardProps> = ({ route }) => {
  const openGoogleMaps = () => {
    const query = encodeURIComponent(route.googleMapsQuery || `${route.to}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <SectionCard>
      <CardHeader
        tone="vermilion"
        icon={<Compass className="w-5 h-5" />}
        eyebrow="Getting there"
        title="Route & transit navigator"
        subtitle="Step-by-step platforms, exits and transfers"
        action={
          <Button id="open-google-maps-btn" variant="ink" size="sm" onClick={openGoogleMaps} iconRight={<ExternalLink className="w-3.5 h-3.5" />}>
            Google Maps
          </Button>
        }
      />

      {/* From → To */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-50 to-paper-100 border border-slate-100 p-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <div className="min-w-0">
          <Eyebrow className="mb-1">From</Eyebrow>
          <div className="text-sm font-semibold text-slate-800 leading-snug">{route.from}</div>
        </div>
        <div className="hidden sm:flex flex-col items-center text-slate-300">
          <Navigation className="w-4 h-4 text-vermilion-500 rotate-90" />
        </div>
        <div className="sm:hidden flex justify-center text-slate-300">
          <ArrowDown className="w-4 h-4" />
        </div>
        <div className="min-w-0 sm:text-right">
          <Eyebrow className="mb-1 text-vermilion-500">To</Eyebrow>
          <div className="text-sm font-extrabold text-slate-900 leading-snug">{route.to}</div>
        </div>
      </div>

      {/* Summary chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-900 text-white font-bold">
          <Compass className="w-3.5 h-3.5 text-jade-300" />
          {route.recommendedTransit}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          {route.estimatedTime}
        </span>
        {route.costEstimate && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 font-semibold">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            {route.costEstimate}
          </span>
        )}
      </div>

      {route.taxiNote && (
        <div className="mt-3 flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">Taxi note: </span>
            {route.taxiNote}
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="mt-5">
        <Eyebrow className="mb-3">Step-by-step</Eyebrow>
        <ol className="relative pl-9 space-y-3 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-vermilion-400 before:via-slate-200 before:to-slate-200">
          {route.stepByStep.map((step, i) => (
            <motion.li
              key={step.stepNumber}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="relative"
            >
              <div className="absolute -left-9 top-3 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-[11px] font-extrabold text-slate-900 shadow-sm">
                {step.stepNumber}
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs card-hover">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900">{step.title}</span>
                  <div className="flex items-center gap-2">
                    {step.duration && <span className="text-[11px] text-slate-400 font-mono font-semibold">{step.duration}</span>}
                    {step.lineBadge && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg text-white shadow-sm ${step.badgeColor || 'bg-slate-800'}`}>{step.lineBadge}</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{step.instruction}</p>
                {step.tip && (
                  <div className="mt-2.5 flex items-start gap-2 text-[11px] text-slate-700 bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>{step.tip}</span>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </SectionCard>
  );
};
