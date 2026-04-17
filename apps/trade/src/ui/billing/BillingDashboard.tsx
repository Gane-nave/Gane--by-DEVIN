import React from 'react';
import { CreditCard, Zap, Server, Shield, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

export const BillingDashboard: React.FC = () => {
  return (
    <div className="p-8 text-white h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gane-blue/10 border border-gane-blue/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <CreditCard className="text-gane-blue" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Billing & Usage</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">ORG_ID: GANE-CORP-01</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Zap size={18} className="text-gane-orange" />
              <span className="text-xs font-bold uppercase tracking-widest">Compute Tokens</span>
            </div>
            <ArrowUpRight size={16} className="text-gane-green" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">14.2M</span>
            <span className="text-xs text-gane-green font-mono">+$42.50 this month</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gane-orange shadow-[0_0_10px_rgba(255,165,0,0.8)]" 
            />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Server size={18} className="text-gane-blue" />
              <span className="text-xs font-bold uppercase tracking-widest">Storage (PB)</span>
            </div>
            <ArrowUpRight size={16} className="text-gane-green" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">2.4</span>
            <span className="text-xs text-gane-blue font-mono">+$120.00 this month</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '40%' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gane-blue shadow-[0_0_10px_rgba(0,243,255,0.8)]" 
            />
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col"
      >
        <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-gray-400">Current Plan</h3>
        <div className="flex items-center justify-between border border-gane-blue/30 bg-gane-blue/10 p-6 rounded-[2rem] shadow-[0_0_20px_rgba(0,243,255,0.1)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gane-blue/20 flex items-center justify-center text-gane-blue">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Enterprise Sovereign</h4>
              <p className="text-sm text-gray-400 mt-1">Unlimited nodes, 99.999% SLA</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold font-mono text-gane-blue drop-shadow-[0_0_10px_currentColor]">$4,999</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">/ month</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
