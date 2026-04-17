import { useState, useEffect } from 'react';
import { signOut } from '../firebase';
import { useStore } from '../store/useStore';
import { OmniChat } from '../components/OmniChat';
import { MaterialLab } from '../components/MaterialLab';
import { FulfillmentSync } from '../components/FulfillmentSync';
import { GodAgent } from '../components/GodAgent';
import { SatLink } from '../components/SatLink';
import { OmniVision } from '../components/OmniVision';
import { CyberShield } from '../components/CyberShield';
import { CreativeEngine } from '../components/CreativeEngine';
import { AgentFabric } from '../components/AgentFabric';
import { 
  LayoutDashboard, 
  Box, 
  Truck, 
  ShieldAlert, 
  LogOut,
  BrainCircuit,
  MessageSquare,
  Satellite,
  Eye,
  Shield,
  Palette,
  Activity,
  Clock,
  Zap,
  Loader2,
  Server
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const NAV_ITEMS = [
  { id: 'chat', label: 'General Intelligence', icon: MessageSquare, category: 'CORE' },
  { id: 'overview', label: 'System Overview', icon: Activity, category: 'CORE' },
  { id: 'fabric', label: 'Agent Fabric', icon: Server, category: 'CORE' },
  { id: 'vision', label: 'Visual Synthesis', icon: Eye, category: 'EXPERTISE' },
  { id: 'creative', label: 'Creative Studio', icon: Palette, category: 'EXPERTISE' },
  { id: 'satlink', label: 'Satellite Control', icon: Satellite, category: 'EXPERTISE' },
  { id: 'lab', label: '3D Material Lab', icon: Box, category: 'EXPERTISE' },
  { id: 'fulfillment', label: 'Fulfillment Sync', icon: Truck, category: 'EXPERTISE' },
  { id: 'audit', label: 'Cyber-Shield', icon: ShieldAlert, category: 'SECURITY' },
];

export function Dashboard() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-800 bg-zinc-900/40 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">OmniKernel</h2>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Crystal Edge ASI</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {/* Core Intelligence */}
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2">Intelligence</p>
            <div className="space-y-1">
              {NAV_ITEMS.filter(i => i.category === 'CORE').map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specialized Expertise */}
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2">Expertise</p>
            <div className="space-y-1">
              {NAV_ITEMS.filter(i => i.category === 'EXPERTISE').map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-zinc-100 text-zinc-950" 
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security & Ops */}
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2">Security</p>
            <div className="space-y-1">
              {NAV_ITEMS.filter(i => i.category === 'SECURITY').map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-red-600/10 text-red-500 border border-red-500/20" 
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-zinc-700 to-zinc-900">
                  {user?.email?.[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.displayName || 'System Admin'}</p>
              <p className="text-[10px] text-zinc-500 truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-zinc-950">
        <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/50 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              {NAV_ITEMS.find(i => i.id === activeTab)?.label}
            </h1>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-500 uppercase">Neural Core Optimal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-zinc-300">GENESIS v1.0.1</span>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          {activeTab === 'overview' && <div className="p-8"><OverviewTab /></div>}
          {activeTab === 'fabric' && <AgentFabric />}
          {activeTab === 'vision' && <OmniVision />}
          {activeTab === 'creative' && <CreativeEngine />}
          {activeTab === 'satlink' && <SatLink />}
          {activeTab === 'lab' && <MaterialLab />}
          {activeTab === 'fulfillment' && <FulfillmentSync />}
          {activeTab === 'audit' && <CyberShield />}
          {activeTab === 'chat' && <OmniChat />}
        </div>
      </main>
    </div>
  );
}

function OverviewTab() {
  const [status, setStatus] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/brainiac/status');
        const data = await res.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch Brainiac status:', error);
      }
    };

    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivity(logs);
    });

    fetchStatus();
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="System State" 
          value={status?.neuro_core || "BOOTING"} 
          icon={<BrainCircuit className="w-5 h-5 text-blue-400" />} 
          trend="OPTIMAL"
          trendColor="text-emerald-400"
        />
        <MetricCard 
          title="Threat Level" 
          value={`${((status?.threat_level || 0) * 100).toFixed(2)}%`} 
          icon={<ShieldAlert className="w-5 h-5 text-red-400" />} 
          trend="STABLE"
          trendColor="text-emerald-400"
        />
        <MetricCard 
          title="Orbital Mesh" 
          value={status?.satlink || "CONNECTING"} 
          icon={<Satellite className="w-5 h-5 text-purple-400" />} 
          trend={`${status?.active_missions || 0} ACTIVE`}
          trendColor="text-blue-400"
        />
        <MetricCard 
          title="Compute Load" 
          value={status?.compute_load || "0%"} 
          icon={<Zap className="w-5 h-5 text-amber-400" />} 
          trend={status?.memory_usage || "0/0"}
          trendColor="text-zinc-400"
        />
      </div>


      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Recent System Activity
          </h3>
          <div className="space-y-4">
            {activity.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 opacity-20" />
                Synchronizing with Nexus...
              </div>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.type === 'security' ? 'bg-red-500' : 
                      item.type === 'agent' ? 'bg-blue-500' : 'bg-emerald-500'
                    )} />
                    <div>
                      <p className="text-sm font-medium">{item.message || item.event}</p>
                      <p className="text-xs text-zinc-500">
                        {item.timestamp?.seconds ? new Date(item.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-600 uppercase">{item.type || 'system'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-medium mb-6">System Identity</h3>
          <div className="space-y-6">
            <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Codename</p>
              <p className="text-xl font-mono text-blue-400">{status?.codename || "GENESIS"}</p>
            </div>
            <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Version</p>
              <p className="text-xl font-mono text-zinc-300">{status?.version || "1.0.1"}</p>
            </div>
            <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Uptime</p>
              <p className="text-xl font-mono text-emerald-400">{status?.uptime || "00:00:00"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, trendColor }: { title: string, value: string, icon: React.ReactNode, trend: string, trendColor?: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 group-hover:border-zinc-700 transition-colors">
          {icon}
        </div>
        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-zinc-950 rounded-full border border-zinc-800", trendColor)}>
          {trend}
        </span>
      </div>
      <h3 className="text-sm text-zinc-500 font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function ActivityItem({ time, text }: { time: string, text: string }) {
  return (
    <div className="flex gap-4 text-sm">
      <div className="text-zinc-500 w-16 shrink-0">{time}</div>
      <div className="text-zinc-300">{text}</div>
    </div>
  );
}
