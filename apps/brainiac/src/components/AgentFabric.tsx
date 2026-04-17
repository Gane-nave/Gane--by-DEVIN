import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, Server, Terminal, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface AgentHealthStatus {
  id: string;
  name: string;
  status: 'healthy' | 'unresponsive' | 'failed';
  lastHeartbeat: number;
  endpoint: string;
  failures: number;
}

export function AgentFabric() {
  const [agents, setAgents] = useState<AgentHealthStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents/health');
      const data = await res.json();
      setAgents(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch agent health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'unresponsive': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-4 h-4" />;
      case 'unresponsive': return <Activity className="w-4 h-4" />;
      case 'failed': return <ShieldAlert className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  if (loading && agents.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-zinc-500 flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin opacity-50" />
          <p>Scanning Agent Fabric...</p>
        </div>
      </div>
    );
  }

  const healthyCount = agents.filter(a => a.status === 'healthy').length;
  const issueCount = agents.length - healthyCount;

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
            <Server className="w-6 h-6 text-blue-400" />
            Agent Fabric Topology
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Real-time health monitoring and telemetry</p>
        </div>
        <div className="text-xs text-zinc-500 flex items-center gap-2">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Last sync: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total Agents</div>
          <div className="text-3xl font-bold text-zinc-200">{agents.length}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Healthy Nodes</div>
          <div className="text-3xl font-bold text-emerald-400">{healthyCount}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Anomalies Detected</div>
          <div className={cn("text-3xl font-bold", issueCount > 0 ? "text-red-400" : "text-zinc-400")}>
            {issueCount}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/30 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">Registered Agents</h3>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {agents.map((agent) => {
            const timeSinceHeartbeat = Math.floor((Date.now() - agent.lastHeartbeat) / 1000);
            
            return (
              <div key={agent.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg border", getStatusColor(agent.status))}>
                    {getStatusIcon(agent.status)}
                  </div>
                  <div>
                    <div className="font-medium text-zinc-200">{agent.name}</div>
                    <div className="text-xs text-zinc-500 font-mono flex items-center gap-2 mt-1">
                      <Terminal className="w-3 h-3" />
                      {agent.endpoint}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    getStatusColor(agent.status)
                  )}>
                    {agent.status}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    Last ping: {timeSinceHeartbeat}s ago
                  </div>
                  {agent.failures > 0 && (
                    <div className="text-[10px] text-red-400 font-mono">
                      Failures: {agent.failures}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
