import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-4 left-4 z-40 glass-dark rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-xs font-bold text-white"
          role="status"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-70" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
          </span>
          <WifiOff className="w-3.5 h-3.5 text-amber-300" />
          <span>Offline · cached itinerary & transit guides active</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
