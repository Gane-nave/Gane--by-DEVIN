import React from 'react';
import { useGaneStore } from '../store/navStore';
import { ShieldAlert } from 'lucide-react';
import { t } from '../lib/i18n';

export const VehicleProfilePanel: React.FC = () => {
  const { language } = useGaneStore();

  return (
    <div className="card-interaction p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="text-gane-blue" />
        <h3 className="text-lg font-bold tracking-widest text-white uppercase">{t('vehicle_profile', language)}</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-interaction-section border border-interaction-border">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('battery', language)}</span>
          <span className="text-sm font-mono font-bold text-gane-green">98%</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-interaction-section border border-interaction-border">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('hull_integrity', language)}</span>
          <span className="text-sm font-mono font-bold text-gane-blue">100%</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-interaction-section border border-interaction-border">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('shield_status', language)}</span>
          <span className="text-sm font-mono font-bold text-gane-blue">ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
