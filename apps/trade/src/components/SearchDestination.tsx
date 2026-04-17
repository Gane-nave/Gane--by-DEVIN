import React, { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { useGaneStore } from '../store/navStore';
import { t } from '../lib/i18n';
import { cn } from '../lib/utils';

export const SearchDestination: React.FC = () => {
  const { calculateRoute, language, isRTL } = useGaneStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setShowResults(true);
    try {
      // Using Nominatim OpenStreetMap API for geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const name = result.display_name.split(',')[0]; // Get the main name
    
    calculateRoute(lat, lon, name);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search_destination', language)}
          className={cn(
            "w-full bg-black/40 backdrop-blur-2xl border border-white/10 p-4 text-white font-mono text-lg focus:outline-none focus:border-gane-blue focus:bg-black/60 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(0,243,255,0.15)] rounded-full",
            isRTL ? "pr-14" : "pl-14"
          )}
        />
        <button
          type="submit"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-gane-blue hover:text-white transition-colors drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]",
            isRTL ? "right-5" : "left-5"
          )}
        >
          {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
        </button>
      </form>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md border border-gane-blue/30 max-h-64 overflow-y-auto custom-scrollbar z-50 rounded-3xl overflow-hidden">
          {results.length === 0 && !isSearching ? (
            <div className="p-4 text-gray-400 font-mono text-sm text-center">
              {t('no_results', language)}
            </div>
          ) : (
            results.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(result)}
                className="w-full text-left p-4 border-b border-white/10 hover:bg-gane-blue/20 transition-colors flex items-start gap-3"
              >
                <MapPin size={20} className="text-gane-blue shrink-0 mt-1" />
                <div className="flex flex-col">
                  <span className="text-white font-bold">{result.display_name.split(',')[0]}</span>
                  <span className="text-xs text-gray-400 font-mono line-clamp-1">{result.display_name}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
