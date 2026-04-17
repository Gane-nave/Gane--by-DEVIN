import { useState, useEffect } from 'react';
import { BrainCircuit, Zap, Shield, Globe, Terminal, Loader2, Play, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { MODELS } from '../services/gemini';

interface AgentTask {
  id: string;
  goal: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  timestamp: string;
}

export function GodAgent() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const executeGoal = async () => {
    if (!input.trim()) return;

    const newTask: AgentTask = {
      id: Date.now().toString(),
      goal: input,
      status: 'running',
      timestamp: new Date().toLocaleTimeString(),
    };

    setTasks(prev => [newTask, ...prev]);
    setInput('');
    setIsExecuting(true);

    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: input }),
      });
      const data = await response.json();
      
      setTasks(prev => prev.map(t => 
        t.id === newTask.id 
          ? { ...t, status: data.status === 'success' ? 'completed' : 'failed', output: data.output || data.message } 
          : t
      ));
    } catch (error) {
      setTasks(prev => prev.map(t => 
        t.id === newTask.id ? { ...t, status: 'failed', output: 'Network error' } : t
      ));
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <BrainCircuit className="w-12 h-12 text-blue-500/20 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          God Agent: Brainiac Core
        </h2>
        <p className="text-zinc-400 max-w-2xl">
          Autonomous Super Intelligence (ASI) reasoning engine. Planetary-scale command & control with zero-latency execution.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeGoal()}
              placeholder="Define planetary goal (e.g., 'Harden system', 'Analyze Haifa thermal', 'Trigger SOS')..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500 transition-all text-lg font-mono"
            />
          </div>
          <button
            onClick={executeGoal}
            disabled={isExecuting || !input.trim()}
            className="px-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            {isExecuting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            EXECUTE
          </button>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard icon={<Zap className="w-4 h-4" />} label="Uptime" value="99.999%" color="text-emerald-400" />
        <StatusCard icon={<Shield className="w-4 h-4" />} label="Security" value="Hardened" color="text-blue-400" />
        <StatusCard icon={<Globe className="w-4 h-4" />} label="Network" value="Unrestricted" color="text-purple-400" />
        <StatusCard icon={<BrainCircuit className="w-4 h-4" />} label="Cognition" value="ASI-Tier" color="text-amber-400" />
      </div>

      {/* Task History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-zinc-300 px-2">Execution History</h3>
        {tasks.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800/50 border-dashed rounded-xl p-12 text-center text-zinc-500">
            No active directives in current session.
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/30">
                <div className="flex items-center gap-3">
                  {task.status === 'running' ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : task.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Shield className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm font-mono text-zinc-400">{task.timestamp}</span>
                  <span className="text-sm font-medium text-zinc-200 truncate max-w-md">{task.goal}</span>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  task.status === 'running' && "bg-blue-500/10 text-blue-400",
                  task.status === 'completed' && "bg-emerald-500/10 text-emerald-400",
                  task.status === 'failed' && "bg-red-500/10 text-red-400"
                )}>
                  {task.status}
                </div>
              </div>
              {task.output && (
                <div className="p-4 bg-zinc-950/50 font-mono text-xs text-zinc-400 whitespace-pre-wrap max-h-60 overflow-auto">
                  {task.output}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl flex items-center gap-4">
      <div className={cn("p-2 rounded-lg bg-zinc-800/50", color)}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{label}</div>
        <div className="text-sm font-semibold text-zinc-200">{value}</div>
      </div>
    </div>
  );
}
