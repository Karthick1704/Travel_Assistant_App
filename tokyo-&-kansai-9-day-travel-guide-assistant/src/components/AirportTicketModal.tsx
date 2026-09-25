import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Plane } from 'lucide-react';
import { AirportTicketElement } from './AirportTicketElement';
import { Eyebrow, IconButton, Pill } from './ui/primitives';

interface AirportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDay?: (dayNumber: number) => void;
  initialFlightIndex?: number;
}

export const AirportTicketModal: React.FC<AirportTicketModalProps> = ({ isOpen, onClose, onSelectDay, initialFlightIndex = 0 }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink-950/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-paper-50 rounded-[32px] shadow-2xl border border-white/40 flex flex-col no-scrollbar"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="All flights explorer"
          >
            <div className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-7 py-4 glass-light border-b border-slate-200/70 rounded-t-[32px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-jade-500 to-jade-700 text-white flex items-center justify-center shadow-[var(--shadow-glow-jade)]">
                  <Plane className="w-4.5 h-4.5 -rotate-45" />
                </div>
                <div>
                  <Eyebrow>Flight explorer</Eyebrow>
                  <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                    All 4 Cathay Pacific legs
                  </h2>
                </div>
                <Pill tone="jade" mono className="hidden sm:inline-flex">
                  MAA → HKG → NRT · KIX → HKG → MAA
                </Pill>
              </div>
              <IconButton id="close-airport-ticket-modal" onClick={onClose} aria-label="Close">
                <X className="w-5 h-5" />
              </IconButton>
            </div>

            <div className="p-4 sm:p-7">
              <AirportTicketElement initialFlightIndex={initialFlightIndex} onSelectDay={onSelectDay} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
