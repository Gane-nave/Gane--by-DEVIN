import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, Volume2, Loader2, BrainCircuit } from 'lucide-react';
import { ai, MODELS, generateSpeech } from '../services/gemini';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  isThinking?: boolean;
}

export function OmniChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'OmniKernel General Intelligence online. All systems synchronized. How can I assist with your planetary objectives today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useHighThinking, setUseHighThinking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      imageUrl: imagePreview || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setImagePreview(null);
    setIsTyping(true);

    try {
      // Use the God Agent execution bridge for tool-calling capabilities
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          goal: currentInput,
          history: messages.map(m => ({ role: m.role, text: m.text }))
        }),
      });

      const data = await response.json();
      
      let responseText = data.response;
      if (data.toolResults && data.toolResults.length > 0) {
        const toolOutput = data.toolResults.map((r: any) => 
          `\n\n**[SYSTEM] ${r.tool.toUpperCase()} EXECUTION:**\n${r.output}`
        ).join('\n');
        responseText += toolOutput;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        isThinking: useHighThinking
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Neural link interrupted. Please verify system integrity and retry.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTTS = async (text: string) => {
    try {
      const audioData = await generateSpeech(text);
      if (audioData && audioRef.current) {
        audioRef.current.src = audioData;
        audioRef.current.play();
      }
    } catch (error) {
      console.error("TTS error:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto bg-zinc-950">
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map((msg) => (
          <div key={msg.id} className={cn(
            "flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
            msg.role === 'user' ? "flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
              msg.role === 'user' ? "bg-blue-600 text-white" : "bg-zinc-900 border border-zinc-800 text-blue-400"
            )}>
              {msg.role === 'user' ? <UserIcon /> : <BrainCircuit className="w-6 h-6" />}
            </div>
            <div className={cn(
              "flex-1 max-w-3xl space-y-4",
              msg.role === 'user' ? "text-right" : ""
            )}>
              {msg.imageUrl && (
                <div className={cn("flex", msg.role === 'user' ? "justify-end" : "")}>
                  <img src={msg.imageUrl} alt="Uploaded" className="max-w-md rounded-2xl border border-zinc-800 shadow-2xl" />
                </div>
              )}
              <div className={cn(
                "inline-block text-left p-6 rounded-2xl leading-relaxed",
                msg.role === 'user' 
                  ? "bg-blue-600/10 border border-blue-600/20 text-zinc-100" 
                  : "bg-zinc-900/50 border border-zinc-800/50 text-zinc-200"
              )}>
                <div className="prose prose-invert prose-blue max-w-none">
                  <Markdown>{msg.text}</Markdown>
                </div>
                {msg.role === 'model' && (
                  <div className="mt-4 flex items-center gap-4 border-t border-zinc-800/50 pt-4">
                    <button 
                      onClick={() => handleTTS(msg.text)}
                      className="text-zinc-500 hover:text-blue-400 transition-colors flex items-center gap-2 text-xs font-medium"
                    >
                      <Volume2 className="w-3 h-3" />
                      Listen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-6 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-blue-400 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-3 text-zinc-500 font-mono text-xs tracking-widest uppercase">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Neural Pathways...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-8 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
        <div className="max-w-4xl mx-auto relative group">
          {imagePreview && (
            <div className="absolute bottom-full mb-4 left-0 animate-in zoom-in-95 duration-200">
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="h-32 rounded-2xl border-2 border-blue-500 shadow-2xl" />
                <button 
                  onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-900 border border-zinc-800 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-end gap-4 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 shadow-2xl backdrop-blur-xl focus-within:border-blue-500/50 transition-all duration-300">
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setUseHighThinking(!useHighThinking)}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-300",
                  useHighThinking 
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10" 
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                )}
                title="Deep Reasoning Mode"
              >
                <BrainCircuit className="w-5 h-5" />
              </button>
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedImage(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setImagePreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-xl transition-all duration-300"
                title="Upload Visual Data"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask OmniKernel anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-600 resize-none py-3 text-lg font-medium"
            />
            
            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isTyping}
              className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 disabled:opacity-20 disabled:grayscale transition-all duration-300 shadow-lg shadow-blue-600/20"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-[0.2em] font-mono">
            OmniKernel Intelligence Hub • Secure Neural Link Active
          </p>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}

function UserIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
