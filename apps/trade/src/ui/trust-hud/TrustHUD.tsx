import React from 'react';
import { ShieldCheck, Activity, Wifi } from 'lucide-react';
import { motion } from 'motion/react';
import { useGaneStore } from '../../store/navStore';
import { cn } from '../../lib/utils';

export const TrustHUD: React.FC = () => {
  const { isRTL } = useGaneStore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "absolute top-6 flex flex-col gap-3 pointer-events-auto z-40",
        isRTL ? "left-6" : "right-6"
      )}
    >
      <div className="glass-light rounded-full px-5 py-2.5 flex items-center gap-4 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        <div className="relative">
          <ShieldCheck size={18} className="text-gane-green relative z-10" />
          <div className="absolute inset-0 bg-gane-green/50 blur-md rounded-full animate-pulse" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">Trust: High</span>
        <div className="w-px h-4 bg-white/20" />
        <span className="text-sm font-mono text-gane-green drop-shadow-[0_0_8px_rgba(0,255,102,0.5)]">99.9%</span>
      </div>
      
      <div className="glass-light rounded-full px-5 py-2.5 flex items-center gap-4 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        <div className="relative">
          <Activity size={18} className="text-gane-blue relative z-10" />
          <div className="absolute inset-0 bg-gane-blue/50 blur-md rounded-full animate-pulse" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">Data Freshness</span>
        <div className="w-px h-4 bg-white/20" />
        <span className="text-sm font-mono text-gane-blue drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">&lt; 50ms</span>
      </div>
    </motion.div>
  );
};
