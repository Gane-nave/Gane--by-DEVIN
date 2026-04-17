import React from 'react';
import { useGaneStore } from '../store/navStore';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, ChevronRight, ChevronLeft, ArrowUpRight, ArrowRight, ArrowUp, MapPin, Brain, HeartPulse } from 'lucide-react';
import { cn } from '../lib/utils';
import { t } from '../lib/i18n';
import { SearchDestination } from './SearchDestination';

export const NavigationHUD: React.FC<{ avatarUrl?: string | null }> = ({ avatarUrl }) => {
  const { 
    isNavigating, 
    setNavigating, 
    language, 
    isRTL, 
    setActivePanel,
    nav,
    navDetails,
    predictedDestination,
    calculateRoute,
    bioData
  } = useGaneStore();

  const getTurnIcon = (instruction: string) => {
    switch(instruction) {
      case 'turn_right': return <ArrowRight size={48} className="text-gane-blue" />;
      case 'turn_left': return <ArrowRight size={48} className="text-gane-blue rotate-180" />;
      case 'arrive': return <MapPin size={48} className="text-gane-green" />;
      default: return <ArrowUp size={48} className="text-gane-blue" />;
    }
  };

  const formatDistance = (meters: number) => {
    if (meters > 1000) {
      return `${(meters / 1000).toFixed(1)} ${t('kilometers', language)}`;
    }
    return `${Math.round(meters)} ${t('meters', language)}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 font-sans">
      
      {/* Search Bar & Anticipatory AI (When not navigating) */}
      <AnimatePresence>
        {!isNavigating && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-auto flex flex-col gap-4"
          >
            <SearchDestination />
            
            {/* Anticipatory AI Suggestion */}
            {predictedDestination && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => calculateRoute(predictedDestination.lat, predictedDestination.lng, predictedDestination.name)}
                className="glass-light rounded-3xl p-3 border border-gane-blue/30 hover:bg-gane-blue/10 transition-colors flex items-center gap-4 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gane-blue/20 flex items-center justify-center shrink-0">
                  <Brain size={20} className="text-gane-blue" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-gane-blue font-bold uppercase tracking-widest mb-1">ANTICIPATORY AI PREDICTION</div>
                  <div className="text-white font-bold">{predictedDestination.name}</div>
                  <div className="text-xs text-gray-400">{predictedDestination.reason}</div>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar: Turn by Turn Instructions */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-auto"
          >
            <div className="glass-light rounded-full p-3 pr-8 flex items-center gap-6 border border-white/10 mx-auto w-max shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
              <div className="w-16 h-16 bg-gane-blue/10 border border-gane-blue/30 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                {getTurnIcon(navDetails.nextTurn)}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-white tracking-tight">
                    {formatDistance(navDetails.nextTurnDistance)}
                  </span>
                  <span className="text-lg text-gane-blue font-medium uppercase tracking-widest">
                    {t(navDetails.nextTurn as any, language)}
                  </span>
                </div>
                <span className="text-xl text-gray-300 font-medium mt-0.5">
                  {navDetails.currentStreet}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BioData & Speed Limit (Right Side) */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className={cn(
              "absolute top-40 flex flex-col gap-4 pointer-events-auto",
              isRTL ? "left-6" : "right-6"
            )}
          >
            {/* Speed Limit Sign */}
            <div className="w-20 h-20 bg-white rounded-full border-4 border-red-600 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(255,0,0,0.3)]">
              <span className="text-3xl font-bold text-black leading-none">{navDetails.speedLimit}</span>
            </div>

            {/* Current Speed */}
            <div className={cn(
              "w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors",
              nav.speed > navDetails.speedLimit + 5 
                ? "bg-red-900/80 border-red-500 text-white shadow-[0_0_30px_rgba(255,0,0,0.4)]" 
                : "bg-black/40 border-gane-blue/50 text-gane-blue"
            )}>
              <span className="text-3xl font-bold leading-none">{Math.round(nav.speed)}</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">KM/H</span>
            </div>

            {/* BioData Zen Mode Indicator */}
            {bioData && (
              <div className={cn(
                "w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors",
                bioData.active_zen ? "bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981] shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-black/40 border-white/10 text-gray-400"
              )}>
                <HeartPulse size={24} className={bioData.active_zen ? "animate-pulse" : ""} />
                <span className="text-xl font-bold leading-none mt-1">{bioData.heart_rate}</span>
                <span className="text-[8px] font-bold tracking-widest uppercase">BPM</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar: Trip Info & Controls */}
      <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 pointer-events-auto flex flex-col gap-4">
        
        {/* Trip Info Panel */}
        <AnimatePresence>
          {isNavigating && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="glass-light rounded-[2.5rem] p-6 flex items-center justify-between border-t-0 border-b-2 border-gane-green shadow-[0_10px_40px_rgba(0,255,102,0.1)]"
            >
              <div className="flex items-center gap-10 px-4">
                <div className="flex flex-col">
                  <span className="text-4xl font-bold text-gane-green">{navDetails.timeRemaining} <span className="text-xl text-gray-400">{t('min', language)}</span></span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest">{t('time', language)}</span>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{navDetails.distanceRemaining.toFixed(1)} <span className="text-sm text-gray-400">{t('kilometers', language)}</span></span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest">{t('distance', language)}</span>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{navDetails.eta}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest">{t('eta', language)}</span>
                </div>
              </div>
              
              <button
                onClick={() => setNavigating(false)}
                className="px-8 py-4 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30 transition-all font-bold tracking-widest uppercase rounded-full shadow-[0_0_20px_rgba(255,0,60,0.2)]"
              >
                {t('stop_nav', language)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Navigation Button (when not navigating) */}
        <AnimatePresence>
          {!isNavigating && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="flex justify-center"
            >
              <button
                onClick={() => setNavigating(true)}
                className="px-12 py-5 bg-gane-blue/20 text-gane-blue border border-gane-blue/50 hover:bg-gane-blue/30 transition-all shadow-[0_8px_32px_rgba(0,243,255,0.2)] hover:shadow-[0_8px_32px_rgba(0,243,255,0.4)] flex items-center gap-3 rounded-full backdrop-blur-2xl"
              >
                <span className="text-xl font-bold uppercase tracking-[0.15em]">
                  {t('start_nav', language)}
                </span>
                {isRTL ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
};
