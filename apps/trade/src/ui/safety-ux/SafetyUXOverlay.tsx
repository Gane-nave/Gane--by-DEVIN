import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useGaneStore } from '../../store/navStore';
import { motion, AnimatePresence } from 'motion/react';

export const SafetyUXOverlay: React.FC = () => {
  const { systemHealth, isEmergency } = useGaneStore();

  return (
    <AnimatePresence>
      {isEmergency && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center bg-gane-red/20 backdrop-blur-sm"
        >
          <div className="bg-gane-red/90 text-white p-8 rounded-[3rem] flex flex-col items-center gap-4 shadow-[0_0_100px_rgba(255,0,0,0.5)] border-4 border-white/20">
            <AlertTriangle size={64} className="animate-pulse" />
            <h1 className="text-4xl font-bold tracking-widest uppercase text-center">Emergency Stop</h1>
            <p className="text-lg font-mono text-white/80 text-center max-w-md">
              Vehicle has entered a safe state due to critical system anomaly. Please wait for operator assistance.
            </p>
          </div>
        </motion.div>
      )}
      
      {systemHealth.status === 'DEGRADED' && !isEmergency && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-[90] pointer-events-none"
        >
          <div className="bg-gane-orange/90 text-black px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_10px_40px_rgba(255,165,0,0.3)] border border-white/20">
            <AlertTriangle size={20} />
            <span className="font-bold tracking-widest uppercase text-sm">Degraded Mode: Proceed with Caution</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
