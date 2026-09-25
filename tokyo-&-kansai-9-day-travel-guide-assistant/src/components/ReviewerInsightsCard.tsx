import React from 'react';
import { motion } from 'motion/react';
import { Star, ThumbsUp, ThumbsDown, Lightbulb, Quote, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import { GoogleReviewsSummary, DosAndDonts } from '../types';
import { CardHeader, Eyebrow, SectionCard } from './ui/primitives';

interface ReviewerInsightsCardProps {
  reviews: GoogleReviewsSummary;
  dosAndDonts: DosAndDonts;
  culturalTips: string[];
  locationTitle: string;
}

export const ReviewerInsightsCard: React.FC<ReviewerInsightsCardProps> = ({ reviews, dosAndDonts, culturalTips }) => {
  const full = Math.floor(reviews.rating);
  const frac = reviews.rating - full;

  return (
    <SectionCard>
      <CardHeader
        tone="gold"
        icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400" />}
        eyebrow="What visitors say"
        title="Reviewer consensus & etiquette"
        subtitle="Highlights, crowd timing and local manners"
        action={
          <div className="flex items-center gap-2.5 bg-ink-900 text-white px-3.5 py-2 rounded-2xl">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5"
                  style={{
                    fill: i < full ? '#fbbf24' : i === full && frac > 0 ? 'url(#half-star)' : 'rgba(255,255,255,0.15)',
                    color: i < full ? '#fbbf24' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-sm font-extrabold">{reviews.rating.toFixed(1)}</span>
            <span className="text-[11px] text-white/50 font-medium">({reviews.reviewCount})</span>
          </div>
        }
      />

      {/* Quote */}
      <motion.blockquote
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-paper-100 border border-amber-100 text-slate-700"
      >
        <Quote className="w-8 h-8 text-amber-300/70 absolute top-3 right-4 pointer-events-none" />
        <p className="font-display italic text-sm sm:text-base leading-relaxed pr-10">{reviews.quote}</p>
        {reviews.reviewerBadge && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-700">
            <Sparkles className="w-3 h-3" /> {reviews.reviewerBadge}
          </div>
        )}
      </motion.blockquote>

      {/* Highlights */}
      <div className="mt-5">
        <Eyebrow className="mb-2.5">Key highlights</Eyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {reviews.keyHighlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs card-hover text-xs text-slate-700 font-medium"
            >
              <span className="w-6 h-6 rounded-lg bg-vermilion-50 text-vermilion-600 border border-vermilion-100 flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold">
                {i + 1}
              </span>
              <span className="leading-relaxed">{h}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timing + secret */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <Eyebrow>Best time to visit</Eyebrow>
          </div>
          <p className="text-xs text-slate-800 font-medium leading-relaxed">{reviews.bestTimeToVisit}</p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50/60 border border-sky-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-sky-500" />
            <Eyebrow className="text-sky-600">Insider hack</Eyebrow>
          </div>
          <p className="text-xs text-slate-800 font-medium leading-relaxed">{reviews.secretTip}</p>
        </div>
      </div>

      {/* Dos & Don'ts */}
      <div className="mt-5">
        <Eyebrow className="mb-2.5">Local dos & don'ts</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-widest mb-3">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <ThumbsUp className="w-3.5 h-3.5" />
              </span>
              Do
            </div>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              {dosAndDonts.dos.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-widest mb-3">
              <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <ThumbsDown className="w-3.5 h-3.5" />
              </span>
              Don't
            </div>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              {dosAndDonts.donts.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {culturalTips && culturalTips.length > 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-ink-900 text-white grain relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-vermilion-500/20 blur-3xl pointer-events-none" />
          <div className="relative flex items-center gap-2 font-extrabold text-xs uppercase tracking-widest mb-3">
            <ShieldAlert className="w-4 h-4 text-gold-400" />
            Etiquette protocol
          </div>
          <div className="relative space-y-2.5 text-xs text-white/75">
            {culturalTips.map((tip, i) => (
              <p key={i} className="leading-relaxed pl-3 border-l-2 border-vermilion-400/60">
                {tip}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* half-star gradient def */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="half-star" x1="0" x2="1">
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
          </linearGradient>
        </defs>
      </svg>
    </SectionCard>
  );
};
