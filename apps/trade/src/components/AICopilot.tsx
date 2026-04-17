import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { useGaneStore } from '../store/navStore';
import { GoogleGenAI } from "@google/genai";
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { t } from '../lib/i18n';
import Markdown from 'react-markdown';

// Error handling helper
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export const AICopilot: React.FC = () => {
  const { user, language } = useGaneStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'ai_chats'),
      where('authorUid', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const chatData = snapshot.docs[0].data();
        setMessages(chatData.messages || []);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ai_chats');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, errorMsg, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    setErrorMsg(null);
    const userMessage = {
      role: 'user',
      parts: [{ text: input }],
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: newMessages.map(m => ({ role: m.role, parts: m.parts })),
        config: {
          systemInstruction: "You are the G.A.N.E System Administrator AI. You have full access to manage the application, monitor telemetry, and assist the admin profile. Provide technical, precise, and management-focused responses."
        }
      });

      const aiMessage = {
        role: 'model',
        parts: [{ text: response.text || "I'm sorry, I couldn't process that." }],
        timestamp: Date.now()
      };

      const finalMessages = [...newMessages, aiMessage];
      
      // Save to Firestore
      const chatRef = collection(db, 'ai_chats');
      await addDoc(chatRef, {
        authorUid: user.uid,
        messages: finalMessages,
        updatedAt: Date.now()
      });

    } catch (error) {
      console.error("AI Error:", error);
      let friendlyError = "An unexpected error occurred while communicating with the AI core.";
      if (error instanceof Error) {
        if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID")) {
           friendlyError = "Authentication failed: The AI core API key is invalid or missing.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
           friendlyError = "Network error: Unable to reach the AI core. Please check your connection.";
        } else if (error.message.includes("quota") || error.message.includes("429")) {
           friendlyError = "Quota exceeded: The AI core is currently overloaded. Please try again later.";
        } else {
           friendlyError = `AI Core Error: ${error.message}`;
        }
      }
      setErrorMsg(friendlyError);
      
      // Remove the user message from local state if it failed to process
      setMessages(messages);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 border rounded-3xl backdrop-blur-md shadow-lg ${
              msg.role === 'user' 
                ? 'bg-gane-blue/10 border-gane-blue/30 text-white rounded-tr-sm shadow-[0_4px_20px_rgba(0,243,255,0.1)]' 
                : 'bg-black/40 border-white/10 text-gane-blue rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-mono">
                {msg.role === 'user' ? <UserIcon size={10} /> : <Bot size={10} />}
                <span>{msg.role === 'user' ? 'ADMIN' : 'SYS-AI'}</span>
              </div>
              <div className="text-sm font-sans leading-relaxed prose prose-invert prose-sm">
                <Markdown>{msg.parts[0].text}</Markdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="p-4 bg-black/40 border border-white/10 text-gane-blue flex items-center gap-3 rounded-3xl rounded-tl-sm backdrop-blur-md shadow-lg">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-mono uppercase tracking-widest">Processing...</span>
            </div>
          </div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] p-4 bg-gane-red/10 border border-gane-red/30 text-gane-red flex items-start gap-3 rounded-3xl rounded-tl-sm backdrop-blur-md shadow-[0_4px_20px_rgba(255,0,60,0.1)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="text-sm font-sans leading-relaxed">
                {errorMsg}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('chat_placeholder', language)}
          className="w-full bg-black/40 backdrop-blur-xl border border-white/10 p-4 pr-14 text-sm font-mono focus:outline-none focus:border-gane-blue focus:bg-black/60 transition-all rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        />
        <button
          onClick={handleSend}
          disabled={isTyping}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gane-blue hover:text-white transition-colors disabled:opacity-50 drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
