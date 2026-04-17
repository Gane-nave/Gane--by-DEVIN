import React, { useState } from 'react';
import { Shield, Users, Settings, Activity, FileCode, FileCheck, PlayCircle, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PolicyEditor } from '../../policy/PolicyEditor';
import { ProofDashboard } from '../../proof/ProofDashboard';
import { MissionReplayStudio } from '../replay/MissionReplayStudio';
import { BillingDashboard } from '../billing/BillingDashboard';

const TABS = ['OVERVIEW', 'POLICY', 'PROOF', 'REPLAY', 'BILLING'] as const;
type Tab = typeof TABS[number];

export const AdminControlPlane: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');

  return (
    <div className="p-8 text-white h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gane-blue/10 border border-gane-blue/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <Shield className="text-gane-blue" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Control Plane</h1>
        </div>
      </div>

      <div className="flex gap-2 bg-black/40 p-1.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-colors z-10 whitespace-nowrap"
          >
            {activeTab === tab && (
              <motion.div 
                layoutId="admin-active-tab"
                className="absolute inset-0 bg-gane-blue rounded-full shadow-[0_0_15px_rgba(0,243,255,0.4)] -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={activeTab === tab ? 'text-black drop-shadow-md' : 'text-gray-400 hover:text-white'}>
              {tab}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col gap-6"
          >
            {activeTab === 'OVERVIEW' && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,243,255,0.1)] transition-all">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Tenant Management</span>
                    </div>
                    <span className="text-3xl font-bold">12 <span className="text-sm text-gray-500 font-normal">Active</span></span>
                  </div>
                  
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,255,102,0.1)] transition-all">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">System Health</span>
                    </div>
                    <span className="text-3xl font-bold text-gane-green drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]">NOMINAL</span>
                  </div>
                </div>

                <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col">
                  <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Shield size={16} /> Recent Audit Logs
                  </h3>
                  <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3 hover:bg-white/5 p-2 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gane-blue shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
                          <span className="text-sm font-mono text-white">SYS_AUTH_SUCCESS</span>
                        </div>
                        <span className="text-xs font-mono text-gray-500">{new Date().toISOString().split('T')[1].split('.')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'POLICY' && (
              <div className="flex-1 -m-8">
                <PolicyEditor />
              </div>
            )}

            {activeTab === 'PROOF' && (
              <div className="flex-1 -m-8">
                <ProofDashboard />
              </div>
            )}

            {activeTab === 'REPLAY' && (
              <div className="flex-1 -m-8">
                <MissionReplayStudio />
              </div>
            )}

            {activeTab === 'BILLING' && (
              <div className="flex-1 -m-8">
                <BillingDashboard />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
