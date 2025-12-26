
import React, { useMemo, useState, useEffect } from 'react';
import { PowerRanking, League, TradedPick } from '../types';

interface DraftOrderProps {
  rankings: PowerRanking[];
  league: League | null;
  tradedPicks: TradedPick[];
  onTeamClick: (rosterId: number) => void;
}

const DRAFT_IMAGES = [
  "1508098682722-e99c43a406b2", // Catch
  "1566577134770-3d85bb3a9cc4", // Football Detail
  "1551934346-64c890f5761a", // Linemen
  "1504104431965-da2964c42971"  // Huddle
];

const DraftOrder: React.FC<DraftOrderProps> = ({ rankings, league, tradedPicks, onTeamClick }) => {
  const [heroImage, setHeroImage] = useState(DRAFT_IMAGES[0]);

  useEffect(() => {
    setHeroImage(DRAFT_IMAGES[Math.floor(Math.random() * DRAFT_IMAGES.length)]);
  }, []);

  if (!rankings.length || !league) return null;

  const numTeams = league.settings.num_teams || 12;
  const isOffSeason = league.status === 'pre_draft' || league.status === 'complete';
  const nextSeason = (parseInt(league.season) + 1).toString();

  // 1. Calculate Draft Order (Reverse of Power Standings for non-playoff teams)
  const draftOrder = useMemo(() => {
    // Dynasty standard: worst power rankings get the earliest picks.
    // Real drafting often uses Max PF, but we'll use our calculated power rank (all-play based)
    // as it's a better "true strength" indicator.
    return [...rankings].sort((a, b) => a.power_score - b.power_score);
  }, [rankings]);

  // 2. Map Pick Assets for each team
  // Each team starts with rounds 1-3 (or 4) of the next season.
  const draftCapital = useMemo(() => {
    const rounds = [1, 2, 3, 4];
    const capital: Record<number, { picks: string[], valueScore: number }> = {};
    
    rankings.forEach(r => {
      capital[r.roster_id] = { picks: [], valueScore: 0 };
    });

    // Add default picks
    rankings.forEach(team => {
      rounds.forEach(round => {
        // Find if this pick was traded
        const trade = tradedPicks.find(p => p.season === nextSeason && p.round === round && p.roster_id === team.roster_id);
        const currentOwnerId = trade ? trade.owner_id : team.roster_id;
        
        const pickLabel = `${nextSeason} Round ${round} (${team.team_name})`;
        const pickWeight = (5 - round) * 10; // Simple weight: R1=40, R2=30, etc.

        if (capital[currentOwnerId]) {
          capital[currentOwnerId].picks.push(pickLabel);
          capital[currentOwnerId].valueScore += pickWeight;
        }
      });
    });

    return capital;
  }, [rankings, tradedPicks, nextSeason]);

  const getLogoUrl = (avatar?: string) => {
    if (avatar) return `https://sleepercdn.com/avatars/thumbs/${avatar}`;
    return `https://picsum.photos/seed/default/128`;
  };

  const getDraftGrade = (score: number) => {
    if (score > 150) return { label: "A+", color: "text-emerald-500" };
    if (score > 120) return { label: "A", color: "text-emerald-400" };
    if (score > 90) return { label: "B", color: "text-blue-500" };
    if (score > 70) return { label: "C", color: "text-yellow-500" };
    return { label: "D", color: "text-red-500" };
  };

  return (
    <div className="space-y-12">
      {/* Draft Central Header */}
      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative border-b-8 border-yellow-500">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 transition-all duration-1000" style={{backgroundImage: `url("https://images.unsplash.com/photo-${heroImage}?q=80&w=1600&auto=format&fit=crop")`}}></div>
        <div className="relative p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-yellow-500 text-slate-900 text-[11px] font-black uppercase px-2 py-0.5 tracking-tight">Draft Central</span>
              <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest">
                {isOffSeason ? 'Official Draft Order' : 'Projected 2025 Mock Draft'}
              </span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.85]">
              PROSPECT<br/>WATCH
            </h2>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/10 max-w-sm">
             <p className="text-sm font-bold text-white leading-relaxed mb-4">
               {isOffSeason 
                 ? "The draft board is locked. GMs are finalizing their big boards as we approach the rookie selection window."
                 : "Based on current True Power rankings, here is the projected order for the next rookie draft. Asset tracking updated live."}
             </p>
             <div className="flex items-center space-x-2 text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                <i className="fas fa-crosshairs"></i>
                <span>Asset Inventory Sync: Active</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Draft Board */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center space-x-4">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">The Big Board</h3>
             <div className="h-1 bg-yellow-500 flex-grow"></div>
           </div>

           <div className="espn-card overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-slate-100">
                {draftOrder.map((team, idx) => {
                  const cap = draftCapital[team.roster_id];
                  const grade = getDraftGrade(cap.valueScore);
                  const isTopPick = idx === 0;

                  return (
                    <div 
                      key={team.roster_id} 
                      onClick={() => onTeamClick(team.roster_id)}
                      className={`flex items-center justify-between p-8 hover:bg-slate-50 transition-all cursor-pointer group relative ${isTopPick ? 'bg-yellow-50/20' : ''}`}
                    >
                      {isTopPick && (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-yellow-500"></div>
                      )}
                      
                      <div className="flex items-center space-x-8">
                        <div className="flex flex-col items-center justify-center w-12 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">PICK</span>
                          <span className={`text-4xl font-black italic ${isTopPick ? 'text-yellow-600' : 'text-slate-900'}`}>
                            #{idx + 1}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-5">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full border-2 border-white shadow-xl overflow-hidden bg-slate-100 group-hover:scale-110 transition-transform">
                              <img src={getLogoUrl(team.avatar)} alt="logo" className="w-full h-full object-cover" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xl font-black uppercase tracking-tighter leading-none group-hover:text-[#cc0000] transition-colors">{team.team_name}</h4>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Original Slot • gm @{team.owner_name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end min-w-[140px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">ASSET GRADE</span>
                        <span className={`text-4xl font-black italic tracking-tighter ${grade.color}`}>
                          {grade.label}
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {cap.picks.length} TOTAL PICKS OWNED
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* Pick Inventory Sidebar */}
        <div className="lg:col-span-4 space-y-10">
           <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Capital Tracker</h3>
              </div>
              <div className="space-y-4">
                 {draftOrder.slice(0, 5).map((team) => {
                   const cap = draftCapital[team.roster_id];
                   return (
                     <div key={team.roster_id} className="espn-card p-6 bg-slate-900 text-white">
                        <div className="flex items-center justify-between mb-4">
                           <h4 className="text-sm font-black uppercase italic text-yellow-500 tracking-tight">{team.team_name}</h4>
                           <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded">STOCK</span>
                        </div>
                        <div className="space-y-2">
                           {cap.picks.map((pick, i) => (
                             <div key={i} className="flex items-center space-x-2 text-[10px] font-bold text-white/60">
                                <i className="fas fa-ticket-alt text-yellow-500 text-[8px]"></i>
                                <span className="truncate">{pick}</span>
                             </div>
                           ))}
                           {cap.picks.length === 0 && <span className="text-[10px] font-bold text-red-500">Pick Inventory Depleted</span>}
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>

           <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
              <h4 className="text-[11px] font-black uppercase text-[#cc0000] mb-4 tracking-[0.2em]">Asset Valuation</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase mb-6 italic">
                "In Dynasty football, rookie picks are the only assets that never get injured. A high Asset Grade indicates a team well-positioned for rapid rebuilding or mid-season trade dominance."
              </p>
              <div className="space-y-3">
                 <div className="flex items-center justify-between py-2 border-b border-slate-200">
                    <span className="text-[10px] font-black text-slate-400">NEXT DRAFT</span>
                    <span className="text-[10px] font-black text-slate-900">{nextSeason} ROOKIE</span>
                 </div>
                 <div className="flex items-center justify-between py-2">
                    <span className="text-[10px] font-black text-slate-400">TRACKING DEPTH</span>
                    <span className="text-[10px] font-black text-slate-900">4 ROUNDS</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DraftOrder;
