import React, { useState } from 'react';
import { Shield, Plus, Save, ChevronRight, Lock } from 'lucide-react';
import { PolicyRule } from '../shared/contracts/types';
import { motion } from 'motion/react';

export const PolicyEditor: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyRule[]>([
    { id: '1', name: 'Max Overlays', description: 'Limit overlays in DRIVING_SAFE mode', scope: 'UI', priority: 100, enforcementAction: 'BLOCK' },
    { id: '2', name: 'AI Action Bounds', description: 'Require approval for destructive AI actions', scope: 'AI', priority: 200, enforcementAction: 'BLOCK' },
    { id: '3', name: 'Offline Fallback', description: 'Force local cache if latency > 500ms', scope: 'NETWORK', priority: 50, enforcementAction: 'WARN' }
  ]);

  return (
    <div className="p-8 text-white h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gane-blue/10 border border-gane-blue/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <Lock className="text-gane-blue" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Policy-as-Code</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">ENFORCEMENT_ENGINE_V2</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-gane-blue text-black px-5 py-2.5 rounded-full hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,243,255,0.4)]">
          <Plus size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">New Policy</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 mt-4">
        {policies.map((policy, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={policy.id} 
            className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:border-gane-blue/50 transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1.5 shadow-[0_0_10px_currentColor] ${
                  policy.enforcementAction === 'BLOCK' ? 'bg-gane-red text-gane-red' : 'bg-gane-orange text-gane-orange'
                }`} />
                <div>
                  <h3 className="font-bold text-lg group-hover:text-gane-blue transition-colors">{policy.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{policy.description}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-600 group-hover:text-gane-blue transition-colors" />
            </div>
            <div className="flex gap-3 ml-7">
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-gray-400 border border-white/10">
                SCOPE: <span className="text-white">{policy.scope}</span>
              </span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-gray-400 border border-white/10">
                PRIORITY: <span className="text-white">{policy.priority}</span>
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                policy.enforcementAction === 'BLOCK' ? 'bg-gane-red/10 text-gane-red border-gane-red/30' : 'bg-gane-orange/10 text-gane-orange border-gane-orange/30'
              }`}>
                {policy.enforcementAction}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
