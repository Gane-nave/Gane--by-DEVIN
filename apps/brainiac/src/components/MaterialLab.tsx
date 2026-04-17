import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, MeshTransmissionMaterial, Environment, Float } from '@react-three/drei';
import { useState } from 'react';
import { Box, Layers, Zap, Info, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const MATERIALS = [
  { id: 'standard', name: 'Standard Glass', ior: 1.5, transmission: 1, thickness: 0.5, color: '#ffffff' },
  { id: 'crystal', name: 'Crystal HD', ior: 1.8, transmission: 1, thickness: 0.8, color: '#e0f2fe' },
  { id: 'frosted', name: 'Frosted Matte', ior: 1.2, transmission: 0.5, thickness: 1.2, color: '#f8fafc' },
  { id: 'quantum', name: 'Quantum Photonic', ior: 2.4, transmission: 0.9, thickness: 0.2, color: '#dcfce7' },
];

export function MaterialLab() {
  const [selected, setSelected] = useState(MATERIALS[0]);
  const [thickness, setThickness] = useState(selected.thickness);
  const [isOrdering, setIsOrdering] = useState(false);

  const handleOrder = async () => {
    if (!auth.currentUser) return;
    setIsOrdering(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: auth.currentUser.uid,
        customerName: auth.currentUser.displayName || 'Anonymous',
        items: [{ name: selected.name, quantity: 1, price: 2500 }],
        totalCost: 2500,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      alert('Order placed successfully via OmniKernel Fulfillment Sync!');
    } catch (error) {
      console.error('Order failed:', error);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="p-8 space-y-8 h-full">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-zinc-100">3D Material Lab</h2>
        <p className="text-xs text-zinc-500 mt-1">Photonic Simulation & Material Design</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* 3D Preview */}
      <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl relative overflow-hidden min-h-[500px]">
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-lg p-3">
            <h3 className="text-sm font-medium text-zinc-200">{selected.name}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Real-time Photonic Simulation</p>
          </div>
        </div>

        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          
          <Environment preset="city" />

          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2, 2, thickness]} />
              <MeshTransmissionMaterial 
                ior={selected.ior}
                transmission={selected.transmission}
                thickness={thickness}
                roughness={selected.id === 'frosted' ? 0.4 : 0.05}
                chromaticAberration={0.06}
                anisotropy={0.1}
                distortion={0.1}
                distortionScale={0.1}
                temporalDistortion={0.1}
                color={selected.color}
              />
            </mesh>
          </Float>

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.2} />
          </mesh>
        </Canvas>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium">Material Configuration</h3>
          </div>

          <div className="space-y-4">
            {MATERIALS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  setThickness(m.thickness);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                  selected.id === m.id 
                    ? "bg-blue-500/10 border-blue-500/50 text-blue-400" 
                    : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-sm font-medium">{m.name}</span>
                </div>
                {selected.id === m.id && <Zap className="w-4 h-4 fill-current" />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-zinc-400">Simulation Thickness</label>
            <span className="text-sm font-mono text-blue-400">{thickness.toFixed(2)}mm</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.05"
            value={thickness}
            onChange={(e) => setThickness(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase mb-1">Refraction (IOR)</div>
              <div className="text-sm font-mono">{selected.ior}</div>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase mb-1">Transmission</div>
              <div className="text-sm font-mono">{(selected.transmission * 100)}%</div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleOrder}
          disabled={isOrdering}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
        >
          {isOrdering ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
          ORDER MATERIAL SPEC
        </button>

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            All material specifications are generated using <strong>Brainiac Creative Engine</strong> and synchronized with the <strong>Fulfillment Sync</strong> layer for immediate production.
          </p>
        </div>
      </div>
    </div>
  </div>
);
}