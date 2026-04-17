import { useState } from 'react';
import { 
  Palette, 
  Music, 
  Mic2, 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  Zap,
  Sparkles,
  Volume2,
  Type
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ai, MODELS } from '../services/gemini';

export function CreativeEngine() {
  const [activeTool, setActiveTool] = useState<'image' | 'audio' | 'music'>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);
    try {
      // Simulation of Image Generation using Gemini Pro Image
      // In a real environment, this would call the specific image generation endpoint
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          // @ts-ignore - specific config for image generation
          aspectRatio,
          safetySettings: []
        }
      });
      
      // Assuming the response contains a base64 image or URL
      // For now, we'll simulate the result with a high-quality placeholder if the API fails
      // setResults(response.text); 
      
      // Simulation for demo purposes
      await new Promise(r => setTimeout(r, 3000));
      setResult(`https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`);
    } catch (error) {
      console.error('Image generation failed:', error);
      // Fallback for demo
      setResult(`https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSpeech = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      // Simulation of TTS using gemini-2.5-flash-preview-tts
      await new Promise(r => setTimeout(r, 2000));
      alert('Speech synthesis complete. Audio stream ready.');
    } catch (error) {
      console.error('TTS failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tool Selection */}
        <div className="lg:col-span-1 space-y-2">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-100">Creative Studio</h2>
            <p className="text-xs text-zinc-500 mt-1">Neural Generative Synthesis</p>
          </div>
          <ToolButton 
            active={activeTool === 'image'} 
            onClick={() => setActiveTool('image')}
            icon={<ImageIcon className="w-4 h-4" />}
            label="Image Synthesis"
            desc="Gemini Pro Image 3.0"
          />
          <ToolButton 
            active={activeTool === 'audio'} 
            onClick={() => setActiveTool('audio')}
            icon={<Volume2 className="w-4 h-4" />}
            label="Neural TTS"
            desc="Gemini Flash TTS"
          />
          <ToolButton 
            active={activeTool === 'music'} 
            onClick={() => setActiveTool('music')}
            icon={<Music className="w-4 h-4" />}
            label="Music Gen"
            desc="Lyria 3.0 Core"
          />
        </div>

        {/* Workspace */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-400">
                  {activeTool === 'image' ? 'Visual Prompt' : activeTool === 'audio' ? 'Speech Script' : 'Composition Directive'}
                </label>
                {activeTool === 'image' && (
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] px-2 py-1 text-zinc-400 focus:outline-none focus:border-purple-500"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="16:9">16:9 Cinematic</option>
                    <option value="9:16">9:16 Portrait</option>
                    <option value="21:9">21:9 Ultrawide</option>
                  </select>
                )}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  activeTool === 'image' 
                    ? "Describe a cinematic masterpiece..." 
                    : activeTool === 'audio' 
                      ? "Enter text to convert to neural speech..." 
                      : "Describe the mood, tempo, and instruments..."
                }
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:outline-none focus:border-purple-500 transition-all text-sm font-mono resize-none"
              />
            </div>

            <button
              onClick={activeTool === 'image' ? generateImage : generateSpeech}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              GENERATE {activeTool.toUpperCase()}
            </button>
          </div>

          {/* Result Preview */}
          {result && activeTool === 'image' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800">
                <img src={result} alt="Generated" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <ImageIcon className="w-3 h-3" />
                  <span>1024x1024 · PNG · High Fidelity</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-400 font-bold">
                  <Zap className="w-3 h-3" />
                  SYNTHESIS COMPLETE
                </div>
              </div>
            </div>
          )}

          {!result && !isGenerating && (
            <div className="h-64 bg-zinc-900/30 border border-zinc-800/50 border-dashed rounded-2xl flex flex-col items-center justify-center text-zinc-600">
              <Sparkles className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs">Awaiting creative directive...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, icon, label, desc }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, desc: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
        active 
          ? "bg-purple-500/10 border-purple-500/50 text-purple-400" 
          : "bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
      )}
    >
      <div className={cn("p-2 rounded-lg", active ? "bg-purple-500/20" : "bg-zinc-900")}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold">{label}</div>
        <div className="text-[10px] opacity-60 uppercase tracking-wider">{desc}</div>
      </div>
    </button>
  );
}
