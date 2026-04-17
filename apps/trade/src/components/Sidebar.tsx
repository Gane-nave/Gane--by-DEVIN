import React from 'react';
import { useGaneStore } from '../store/navStore';
import { motion } from 'motion/react';
import { Settings, Map, ShieldAlert, Cpu, Image as ImageIcon, LogOut, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { t } from '../lib/i18n';
import { signIn, signOut } from '../firebase';

export const Sidebar: React.FC = () => {
  const { isRTL, setRTL, language, setLanguage, user, setActivePanel, activePanel } = useGaneStore();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'he' : 'en';
    setLanguage(newLang);
    setRTL(newLang === 'he');
  };

  const navItems = [
    { id: 'NONE', icon: Map, label: 'MAP' },
    { id: 'ADMIN', icon: ShieldAlert, label: 'ADMIN AI' },
    { id: 'VEHICLE', icon: Settings, label: 'TELEMETRY' },
    { id: 'CONTROL_PLANE', icon: Cpu, label: 'CONTROL PLANE' },
  ];

  return (
    <motion.div 
      initial={{ x: isRTL ? 100 : -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4 p-3 glass-light rounded-full pointer-events-auto",
        isRTL ? "right-6" : "left-6"
      )}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActivePanel(item.id as any)}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all group relative border",
            activePanel === item.id 
              ? "bg-gane-blue/20 text-gane-blue border-gane-blue shadow-[0_0_15px_rgba(0,243,255,0.3)]" 
              : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
          )}
        >
          <item.icon size={24} />
          {/* Tooltip */}
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gane-dark border border-gane-blue/30 text-xs font-bold tracking-widest uppercase text-gane-blue opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap",
            isRTL ? "right-16" : "left-16"
          )}>
            {item.label}
          </div>
        </button>
      ))}

      <div className="w-8 h-[1px] bg-white/10 mx-auto my-2" />

      <button
        onClick={toggleLanguage}
        className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold border border-transparent"
      >
        {language.toUpperCase()}
      </button>

      {user ? (
        <button
          onClick={signOut}
          className="w-12 h-12 rounded-full flex items-center justify-center text-gane-red hover:bg-gane-red/10 transition-all border border-transparent"
          title={t('logout', language)}
        >
          <LogOut size={20} />
        </button>
      ) : (
        <button
          onClick={signIn}
          className="w-12 h-12 rounded-full flex items-center justify-center text-gane-green hover:bg-gane-green/10 transition-all border border-transparent"
          title={t('login', language)}
        >
          <LogIn size={20} />
        </button>
      )}
    </motion.div>
  );
};
