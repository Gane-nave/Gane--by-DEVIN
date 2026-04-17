import React from 'react';
import { useGaneStore } from '../store/navStore';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { t } from '../lib/i18n';

import { AICopilot } from './AICopilot';
import { SystemTelemetry } from './SystemTelemetry';
import { AdminControlPlane } from '../ui/admin/AdminControlPlane';

export const SmartPanel: React.FC = () => {
  const { activePanel, setActivePanel, isRTL, language } = useGaneStore();

  if (activePanel === 'NONE') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isRTL ? -50 : 50 }}
        className={cn(
          "absolute top-6 bottom-6 glass-light pointer-events-auto z-30 flex flex-col border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
          activePanel === 'CONTROL_PLANE' ? "w-[540px]" : "w-[420px]",
          isRTL ? "right-32" : "left-32"
        )}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="text-xl font-bold tracking-widest text-gane-blue uppercase">
            {activePanel === 'ADMIN' && 'ADMIN AI'}
            {activePanel === 'VEHICLE' && 'TELEMETRY'}
            {activePanel === 'CONTROL_PLANE' && 'CONTROL PLANE'}
          </h2>
          <button 
            onClick={() => setActivePanel('NONE')}
            className="text-gray-400 hover:text-gane-blue transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar text-white">
          {activePanel === 'ADMIN' && <div className="p-6 h-full"><AICopilot /></div>}
          {activePanel === 'VEHICLE' && <div className="p-6 h-full"><SystemTelemetry /></div>}
          {activePanel === 'CONTROL_PLANE' && <AdminControlPlane />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
