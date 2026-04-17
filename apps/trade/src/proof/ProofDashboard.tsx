import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, FileCheck, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const ProofDashboard: React.FC = () => {
  const requirements = [
    { name: 'Safety-Critical UX', status: 'PASS', score: 100 },
    { name: 'Offline Sovereignty', status: 'PASS', score: 100 },
    { name: 'Regression Sentinel', status: 'PASS', score: 99.9 },
    { name: 'Mission Replay', status: 'PASS', score: 100 },
    { name: 'Policy Enforcement', status: 'PASS', score: 100 },
  ];

  return (
    <div className="p-8 text-white h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gane-blue/10 border border-gane-blue/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <FileCheck className="text-gane-blue" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Canonical Proof</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">RELEASE_GATE_V4</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Release Verdict</span>
          <div className="flex items-center gap-3 text-gane-green">
            <ShieldCheck size={28} className="drop-shadow-[0_0_10px_currentColor]" />
            <span className="text-2xl font-bold drop-shadow-[0_0_10px_currentColor]">APPROVED</span>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Missing Evidence</span>
          <div className="flex items-center gap-3 text-gray-500">
            <span className="text-2xl font-bold">0</span>
            <span className="text-sm font-mono">BLOCKERS</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col">
        <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-gray-400">Requirement Coverage</h3>
        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
          {requirements.map((req, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={req.name} 
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gane-green/20 flex items-center justify-center text-gane-green shadow-[0_0_10px_rgba(0,255,102,0.3)]">
                  <CheckCircle size={16} />
                </div>
                <span className="text-sm font-mono text-white">{req.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-32 h-1.5 bg-black rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${req.score}%` }}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                    className="h-full bg-gane-green shadow-[0_0_10px_rgba(0,255,102,0.8)]"
                  />
                </div>
                <span className="text-xs font-mono text-gane-green w-12 text-right">{req.score}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
