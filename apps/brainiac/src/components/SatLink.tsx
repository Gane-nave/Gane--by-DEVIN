import { useState, useEffect } from 'react';
import { 
  Satellite, 
  Radio, 
  AlertTriangle, 
  ShieldAlert, 
  Globe, 
  Clock, 
  Signal, 
  Loader2, 
  Wifi,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SatStatus {
  status: string;
  uplink: string;
  downlink: string;
  latency: string;
  satellites_in_view: number;
  mesh_health: string;
}

interface SatPass {
  id: string;
  name: string;
  time: string;
  duration: string;
  elevation: string;
}

export function SatLink() {
  const [status, setStatus] = useState<SatStatus | null>(null);
  const [passes, setPasses] = useState<SatPass[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [sosResult, setSosResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, passesRes] = await Promise.all([
          fetch('/api/brainiac/satlink/status'),
          fetch('/api/brainiac/satlink/passes')
        ]);
        const statusData = await statusRes.json();
        const passesData = await passesRes.json();
        setStatus(statusData);
        setPasses(passesData);
      } catch (error) {
        console.error('Failed to fetch SatLink data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerSOS = async () => {
    setIsBroadcasting(true);
    setSosResult(null);
    try {
      const response = await fetch('/api/brainiac/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: { lat: 32.0853, lng: 34.7818 } })
      });
      const data = await response.json();
      setSosResult(data);
    } catch (error) {
      console.error('SOS Broadcast failed:', error);
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Status & SOS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-zinc-100">Satellite Control</h2>
            <p className="text-xs text-zinc-500 mt-1">LEO Mesh & Emergency Protocols</p>
          </div>
          {/* Connection Status */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-emerald-400" />
                <h3 className="font-medium">Uplink Status</h3>
              </div>
              <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider">
                {status?.status}
              </div>
            </div>

            <div className="space-y-4">
              <StatusRow label="Latency" value={status?.latency || '0ms'} icon={<Clock className="w-3 h-3" />} />
              <StatusRow label="Uplink" value={status?.uplink || '0 Mbps'} icon={<Signal className="w-3 h-3" />} />
              <StatusRow label="Downlink" value={status?.downlink || '0 Mbps'} icon={<Signal className="w-3 h-3" />} />
              <StatusRow label="Sats in View" value={status?.satellites_in_view.toString() || '0'} icon={<Globe className="w-3 h-3" />} />
              <StatusRow label="Mesh Health" value={status?.mesh_health || '0%'} icon={<Zap className="w-3 h-3" />} />
            </div>
          </div>

          {/* SOS Button */}
          <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-tight">Emergency Protocol</h3>
            </div>
            <p className="text-xs text-red-400/60 leading-relaxed">
              Triggering SOS will broadcast your precise RTK-GPS coordinates across all 6 satellite channels and notify emergency responders.
            </p>
            <button
              onClick={triggerSOS}
              disabled={isBroadcasting}
              className={cn(
                "w-full py-6 rounded-xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl",
                isBroadcasting 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                  : "bg-red-600 hover:bg-red-500 text-white shadow-red-900/40 active:scale-95"
              )}
            >
              {isBroadcasting ? (
                <>
                  <Radio className="w-6 h-6 animate-ping" />
                  BROADCASTING...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-6 h-6" />
                  TRIGGER SOS
                </>
              )}
            </button>

            {sosResult && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-red-400 text-sm font-bold mb-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  SOS BROADCAST SUCCESSFUL
                </div>
                <div className="text-[10px] font-mono text-red-400/70">
                  Incident ID: {sosResult.incident_id}<br />
                  Latency: {sosResult.latency}<br />
                  Channels: {sosResult.channels}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Satellite Passes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium">Upcoming Satellite Passes</h3>
            </div>

            <div className="space-y-3">
              {passes.map((pass) => (
                <div key={pass.id} className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Satellite className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-200">{pass.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{pass.id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-blue-400">{pass.time}</div>
                    <div className="text-[10px] text-zinc-500">Elev: {pass.elevation} | Dur: {pass.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planetary Coverage Map Placeholder */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-64 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-4">
              <Globe className="w-12 h-12 text-blue-500/40 animate-spin-slow" />
              <div>
                <h4 className="text-sm font-bold text-zinc-300">Planetary Coverage Active</h4>
                <p className="text-xs text-zinc-500">Real-time LEO mesh tracking enabled.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-mono text-zinc-200">{value}</div>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
