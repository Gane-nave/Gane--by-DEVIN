import React, { useState } from 'react';
import { useGaneStore } from '../store/navStore';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, Coins, AlertTriangle, Satellite, CreditCard, Loader2 } from 'lucide-react';
import { t } from '../lib/i18n';
import { cn } from '../lib/utils';

export const SystemTelemetry: React.FC = () => {
  const { nav, language, systemHealth, entityPosition, tokens, rewardTokens } = useGaneStore();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = () => {
    setIsPurchasing(true);
    // Simulate Stripe payment webhook delay
    setTimeout(() => {
      rewardTokens(1000, "STRIPE_PAYMENT_WEBHOOK");
      setIsPurchasing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* System Health Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
        "p-5 border flex items-center gap-4 rounded-3xl shadow-lg backdrop-blur-md transition-all",
        systemHealth.status === 'NOMINAL' ? "bg-gane-green/10 border-gane-green/50 text-gane-green shadow-[0_4px_20px_rgba(0,255,102,0.1)]" :
        systemHealth.status === 'RECOVERING' ? "bg-gane-orange/10 border-gane-orange/50 text-gane-orange shadow-[0_4px_20px_rgba(255,165,0,0.1)]" :
        "bg-gane-red/10 border-gane-red/50 text-gane-red shadow-[0_4px_20px_rgba(255,0,60,0.1)]"
      )}>
        {systemHealth.status === 'NOMINAL' ? <ShieldCheck size={24} /> : <AlertTriangle size={24} className="animate-pulse" />}
        <div>
          <div className="font-bold uppercase tracking-widest text-sm">L5 INTEGRITY: {systemHealth.status}</div>
          {systemHealth.active_anomalies.length > 0 && (
            <div className="text-xs font-mono mt-1">ANOMALY: {systemHealth.active_anomalies.join(', ')}</div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Tokenomics */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-xl p-5 border border-white/10 flex flex-col justify-between relative overflow-hidden group rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2 text-gane-blue">
              <Coins size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">GANE TOKENS</span>
            </div>
            <button 
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="text-gane-blue hover:text-white transition-colors"
              title="Purchase Tokens via Stripe"
            >
              {isPurchasing ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
            </button>
          </div>
          <span className="text-3xl font-mono font-bold text-white relative z-10">{tokens.toLocaleString()}</span>
          <div className="absolute inset-0 bg-gane-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* NPU Latency */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl p-5 border border-white/10 flex flex-col justify-between rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Activity size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">NPU LATENCY (p99)</span>
          </div>
          <span className="text-3xl font-mono font-bold text-white">{systemHealth.p99_latency.toFixed(1)}<span className="text-sm text-gray-500 ml-1">ms</span></span>
        </motion.div>
      </div>

      {/* Positioning Data */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-black/40 backdrop-blur-xl p-6 border border-white/10 space-y-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center gap-2 text-gray-400 border-b border-white/10 pb-3">
          <Satellite size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">L0-L4 POSITIONING</span>
        </div>
        
        <div className="grid grid-cols-2 gap-y-4">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">MODE</span>
            <span className="text-sm font-mono font-bold text-gane-blue">{entityPosition.correction_mode}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">ACCURACY</span>
            <span className="text-sm font-mono font-bold text-white">±{entityPosition.accuracy * 100}cm</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{t('speed', language)}</span>
            <span className="text-sm font-mono font-bold text-white">{Math.round(nav.speed)} KM/H</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{t('heading', language)}</span>
            <span className="text-sm font-mono font-bold text-white">{Math.round(nav.heading)}°</span>
          </div>
        </div>
      </motion.div>

    </div>
  );
};
