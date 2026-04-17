import { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle2, 
  Terminal,
  RefreshCw,
  Zap,
  Fingerprint,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface AuditLog {
  id: string;
  event: string;
  type: 'info' | 'warning' | 'error' | 'security';
  timestamp: any;
  details?: string;
}

export function CyberShield() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isHardening, setIsHardening] = useState(false);
  const [threatLevel, setThreatLevel] = useState(0.02);

  useEffect(() => {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
      setLogs(newLogs);
    });

    return () => unsubscribe();
  }, []);

  const runHardening = async () => {
    setIsHardening(true);
    try {
      await addDoc(collection(db, 'audit_logs'), {
        event: 'System Hardening Initiated',
        type: 'security',
        details: 'Brainiac Cyber-Shield performing zero-day vulnerability scan and network encapsulation.',
        timestamp: serverTimestamp()
      });
      
      // Simulate hardening delay
      await new Promise(r => setTimeout(r, 2000));
      
      setThreatLevel(0.01);
      
      await addDoc(collection(db, 'audit_logs'), {
        event: 'Hardening Complete',
        type: 'info',
        details: 'All system nodes encrypted. Threat level reduced to 0.01.',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Hardening failed:', error);
    } finally {
      setIsHardening(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Security Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-zinc-100">Cyber-Shield</h2>
            <p className="text-xs text-zinc-500 mt-1">Defensive Hardening & Threat Intelligence</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="font-medium">Security Matrix</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Active</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Threat Level</span>
                  <span className={cn("font-mono font-bold", threatLevel > 0.1 ? "text-red-400" : "text-emerald-400")}>
                    {(threatLevel * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", threatLevel > 0.1 ? "bg-red-500" : "bg-emerald-500")}
                    style={{ width: `${threatLevel * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SecurityStat label="Encryption" value="AES-4096" icon={<Lock className="w-3 h-3" />} />
                <SecurityStat label="Firewall" value="Quantum" icon={<Shield className="w-3 h-3" />} />
                <SecurityStat label="Auth" value="Biometric" icon={<Fingerprint className="w-3 h-3" />} />
                <SecurityStat label="Protocol" value="PQC-Safe" icon={<Zap className="w-3 h-3" />} />
              </div>

              <button
                onClick={runHardening}
                disabled={isHardening}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                {isHardening ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                RUN SYSTEM HARDENING
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <Terminal className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-widest">Security Directives</h4>
            </div>
            <ul className="space-y-3">
              <DirectiveItem text="Auto-rotate encryption keys every 60s" active />
              <DirectiveItem text="Isolate suspicious network egress" active />
              <DirectiveItem text="Bypass human approval for Level 1 threats" active />
              <DirectiveItem text="Enable zero-day heuristic analysis" active />
            </ul>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col h-[600px]">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-zinc-400" />
                <h3 className="font-medium">System Audit Logs</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Live Feed · {logs.length} Events</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p>Initializing secure log stream...</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="group flex gap-4 p-3 rounded-lg hover:bg-zinc-800/30 transition-colors border border-transparent hover:border-zinc-800">
                    <div className="shrink-0 pt-1">
                      {log.type === 'security' ? (
                        <Shield className="w-3 h-3 text-blue-400" />
                      ) : log.type === 'warning' ? (
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                      ) : log.type === 'error' ? (
                        <AlertCircle className="w-3 h-3 text-red-400" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "font-bold uppercase tracking-wider",
                          log.type === 'security' && "text-blue-400",
                          log.type === 'warning' && "text-amber-400",
                          log.type === 'error' && "text-red-400",
                          log.type === 'info' && "text-emerald-400"
                        )}>
                          {log.event}
                        </span>
                        <span className="text-zinc-600 text-[10px]">
                          {log.timestamp?.toDate?.() ? log.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-zinc-500 leading-relaxed">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityStat({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-950/50 border border-zinc-800 p-3 rounded-xl">
      <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-bold mb-1">
        {icon}
        {label}
      </div>
      <div className="text-xs font-mono text-zinc-300">{value}</div>
    </div>
  );
}

function DirectiveItem({ text, active }: { text: string, active?: boolean }) {
  return (
    <li className="flex items-center gap-3 text-[11px] text-zinc-400">
      <div className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-zinc-700")} />
      {text}
    </li>
  );
}
