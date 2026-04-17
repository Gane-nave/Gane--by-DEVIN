import React from 'react';
import { useGaneStore } from '../store/navStore';
import { Settings } from 'lucide-react';
import { t } from '../lib/i18n';

export const AdminCopilotPanel: React.FC = () => {
  const { language } = useGaneStore();

  return (
    <div className="card-interaction p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="text-gane-blue" />
        <h3 className="text-lg font-bold tracking-widest text-white uppercase">{t('admin', language)}</h3>
      </div>
      
      <div className="text-sm text-gray-400 font-mono">
        Admin controls offline.
      </div>
    </div>
  );
};
