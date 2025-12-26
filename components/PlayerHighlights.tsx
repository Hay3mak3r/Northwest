
import React from 'react';
import { PlayerHighlight } from '../types';

interface PlayerHighlightsProps {
  highlights: PlayerHighlight[];
}

const PlayerHighlights: React.FC<PlayerHighlightsProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-[#cc0000] text-white px-3 py-1 font-black italic uppercase text-sm skew-x-[-10deg]">
          Top Plays
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 italic">Weekly Highlight Reel</h3>
        <div className="flex-grow h-px bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((h, i) => (
          <div 
            key={h.player_id + i} 
            className="group relative bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
          >
            {/* Player Headshot Area */}
            <div className="relative h-48 bg-slate-900 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10 opacity-60"></div>
              {/* Primary: Sleeper Player Image. Secondary: High-quality NFL action stock. */}
              <img 
                src={`https://sleepercdn.com/content/nfl/players/thumb/${h.player_id}.jpg`}
                alt={h.player_name}
                className="w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-700 opacity-80"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop`;
                }}
              />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-1">Impact Player</span>
                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{h.player_name}</h4>
              </div>
              <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded text-center">
                <span className="block text-[8px] font-black text-white/50 uppercase leading-none">FPTS</span>
                <span className="text-xl font-black text-white italic">{h.points.toFixed(1)}</span>
              </div>
            </div>

            {/* Commentary Area */}
            <div className="p-5 flex-grow bg-white relative">
              <div className="absolute -top-3 left-6 w-6 h-6 bg-[#cc0000] rounded-full flex items-center justify-center text-white text-[10px] shadow-lg">
                <i className="fas fa-quote-left"></i>
              </div>
              <p className="text-slate-800 font-bold italic text-sm leading-relaxed mb-4 pt-2">
                "{h.highlight_text}"
              </p>
              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-slate-400">Team Manager</span>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tighter italic">@{h.owner_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-play-circle text-red-600 text-xs animate-pulse"></i>
                  <span className="text-[10px] font-black text-slate-300 uppercase">Live Reel</span>
                </div>
              </div>
            </div>
            
            {/* Visual Flair */}
            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-slate-900 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlayerHighlights;
