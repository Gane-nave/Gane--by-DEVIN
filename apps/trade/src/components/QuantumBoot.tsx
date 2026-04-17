import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGaneStore } from '../store/navStore';
import { t } from '../lib/i18n';

export const QuantumBoot: React.FC = () => {
  const { setBooted, language } = useGaneStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 800));
      setStep(1);
      await new Promise(r => setTimeout(r, 1200));
      setStep(2);
      await new Promise(r => setTimeout(r, 800));
      setBooted(true);
    };
    sequence();
  }, [setBooted]);

  return (
    <motion.div 
      className="absolute inset-0 z-50 bg-intelligence-bg flex flex-col items-center justify-center font-mono"
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="relative flex flex-col items-center">
        {/* Core Ring */}
        <motion.div 
          className="w-48 h-48 rounded-full border-2 border-gane-blue/20 flex items-center justify-center relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <motion.div 
            className="w-40 h-40 rounded-full border border-gane-blue/40 border-t-gane-blue"
            animate={{ rotate: -720 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-gane-blue rounded-full animate-pulse-glow" />
          </div>
        </motion.div>

        {/* Text Sequence */}
        <div className="mt-12 h-8 flex items-center justify-center text-gane-blue tracking-[0.3em] text-sm">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.span key="0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {t('booting', language)}
              </motion.span>
            )}
            {step === 1 && (
              <motion.span key="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {t('connecting', language)}
              </motion.span>
            )}
            {step === 2 && (
              <motion.span key="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gane-green">
                {t('ready', language)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
