import { useState, useRef } from 'react';
import { 
  Eye, 
  Scan, 
  Camera, 
  Upload, 
  Loader2, 
  ShieldCheck, 
  Zap,
  Maximize2,
  Layers,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ai, MODELS } from '../services/gemini';

interface AnalysisResult {
  summary: string;
  threats: string[];
  objects: string[];
  spectrumData: {
    thermal: string;
    infrared: string;
    radar: string;
  };
}

export function OmniVision() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => setImage(f.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const base64Data = image.split(',')[1];
      const prompt = `
        Perform a multi-spectrum analysis on this image as the Brainiac Omni-Vision system.
        Simulate Thermal, Infrared, and Synthetic Aperture Radar (SAR) data.
        Identify all objects, potential threats, and provide a strategic summary.
        Format the output as JSON:
        {
          "summary": "...",
          "threats": ["...", "..."],
          "objects": ["...", "..."],
          "spectrumData": {
            "thermal": "Description of heat signatures...",
            "infrared": "Description of IR reflections...",
            "radar": "Description of SAR structural density..."
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: MODELS.PRO,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const data = JSON.parse(response.text);
      setResult(data);
    } catch (error) {
      console.error('Vision analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload & Preview */}
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-zinc-100">Visual Synthesis</h2>
            <p className="text-xs text-zinc-500 mt-1">Multi-Spectrum Visual Intelligence</p>
          </div>
          <div 
            className={cn(
              "aspect-video bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all",
              !image && "hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer"
            )}
            onClick={() => !image && fileInputRef.current?.click()}
          >
            {image ? (
              <>
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); }}
                    className="p-2 bg-zinc-900/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-800 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-zinc-800/50 rounded-full inline-block">
                  <Camera className="w-8 h-8 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-300">Drop image or click to upload</p>
                  <p className="text-xs text-zinc-500">Optical, Satellite, or Drone imagery supported</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <button
            onClick={analyzeImage}
            disabled={!image || isAnalyzing}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
            INITIATE MULTI-SPECTRUM SCAN
          </button>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {!result && !isAnalyzing ? (
            <div className="h-full bg-zinc-900/30 border border-zinc-800/50 border-dashed rounded-2xl flex flex-col items-center justify-center text-zinc-500 p-12 text-center">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">Awaiting visual data ingestion...</p>
            </div>
          ) : isAnalyzing ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-32 bg-zinc-900/50 rounded-xl" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-zinc-900/50 rounded-xl" />
                <div className="h-24 bg-zinc-900/50 rounded-xl" />
                <div className="h-24 bg-zinc-900/50 rounded-xl" />
              </div>
              <div className="h-40 bg-zinc-900/50 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              {/* Summary */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-emerald-400 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="font-medium">Intelligence Summary</h3>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {result?.summary}
                </p>
              </div>

              {/* Spectrum Tabs */}
              <div className="grid grid-cols-3 gap-4">
                <SpectrumCard label="Thermal" value={result?.spectrumData.thermal} color="text-orange-400" />
                <SpectrumCard label="Infrared" value={result?.spectrumData.infrared} color="text-red-400" />
                <SpectrumCard label="Radar (SAR)" value={result?.spectrumData.radar} color="text-blue-400" />
              </div>

              {/* Detected Entities */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-zinc-300 mb-4">
                  <Layers className="w-5 h-5" />
                  <h3 className="font-medium">Detected Entities & Threats</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result?.objects.map((obj, i) => (
                    <span key={i} className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs font-medium border border-zinc-700">
                      {obj}
                    </span>
                  ))}
                  {result?.threats.map((threat, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/20">
                      ⚠️ {threat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SpectrumCard({ label, value, color }: { label: string, value?: string, color: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-2">
      <div className={cn("text-[10px] uppercase font-black tracking-widest", color)}>{label}</div>
      <div className="text-[10px] text-zinc-500 leading-tight line-clamp-4">{value}</div>
    </div>
  );
}
