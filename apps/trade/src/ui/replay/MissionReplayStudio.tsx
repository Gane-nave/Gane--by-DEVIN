import React from 'react';
import { PlayCircle, FastForward, Rewind, Activity, Map, Play, Pause, Video } from 'lucide-react';
import { motion } from 'motion/react';

export const MissionReplayStudio: React.FC = () => {
  const timelineEvents = [
    { time: '00:00:00', event: 'MISSION_START', type: 'info', details: 'System initialized' },
    { time: '00:05:12', event: 'REROUTE_TRIGGERED', type: 'warning', details: 'Traffic anomaly detected' },
    { time: '00:14:22', event: 'GNSS_DEGRADATION', type: 'error', details: 'Signal lost in tunnel' },
    { time: '00:15:05', event: 'INS_FALLBACK_ACTIVE', type: 'info', details: 'Dead reckoning engaged' },
  ];

  return (
    <div className="p-8 text-white h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gane-blue/10 border border-gane-blue/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <Video className="text-gane-blue" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Replay Studio</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">MISSION_ID: M-88291A</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <div className="h-56 bg-gane-dark/50 rounded-[2rem] border border-white/10 flex items-center justify-center relative overflow-hidden shadow-inner group">
          <div className="absolute inset-0 scanlines opacity-30 mix-blend-overlay pointer-events-none" />
          <Map size={64} className="text-white/5" />
          
          {/* Faux radar sweep */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(0,243,255,0.1)_360deg)] rounded-full scale-[2]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gane-red flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gane-red animate-pulse" /> LIVE REPLAY
              </span>
              <span className="text-sm font-mono text-white">LAT: 32.0853° N, LON: 34.7818° E</span>
            </div>
            <span className="text-lg font-mono text-gane-blue drop-shadow-[0_0_10px_currentColor]">00:14:22</span>
          </div>
        </div>

        <div className="flex justify-center items-center gap-8 py-2">
          <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Rewind size={20} /></button>
          <button className="w-16 h-16 rounded-full flex items-center justify-center bg-gane-blue text-black hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]">
            <Pause size={28} className="fill-current" />
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><FastForward size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 relative">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 sticky top-0 bg-black/40 backdrop-blur-md py-2 z-10">Event Timeline</h3>
          
          <div className="relative pl-6 border-l border-white/10 space-y-6 pb-4">
            {timelineEvents.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="relative"
              >
                {/* Timeline dot */}
                <div className={`absolute -left-[29px] top-1.5 w-3 h-3 rounded-full border-2 border-black ${
                  item.type === 'error' ? 'bg-gane-red shadow-[0_0_10px_rgba(255,0,0,0.8)]' : 
                  item.type === 'warning' ? 'bg-gane-orange shadow-[0_0_10px_rgba(255,165,0,0.8)]' : 'bg-gane-blue shadow-[0_0_10px_rgba(0,243,255,0.8)]'
                }`} />
                
                <div className="bg-white/5 rounded-2xl border border-white/5 p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold tracking-widest ${
                      item.type === 'error' ? 'text-gane-red' : 
                      item.type === 'warning' ? 'text-gane-orange' : 'text-gane-blue'
                    }`}>{item.event}</span>
                    <span className="text-xs font-mono text-gray-400">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-400">{item.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
