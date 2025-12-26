
import React, { useMemo, useState, useEffect } from 'react';
import { PowerRanking, League } from '../types';

interface PlayoffPictureProps {
  rankings: PowerRanking[];
  league: League | null;
  playoffBracket: any[];
  onTeamClick: (rosterId: number) => void;
}

const PLAYOFF_IMAGES = [
  "1504450758481-7338eba7524a", // Helmets
  "1566577739112-5180d4bf9390", // Stadium
  "1508098682722-e99c43a406b2", // Catch
  "1629901967232-a93170e70a7d"  // Pylon
];

const PlayoffPicture: React.FC<PlayoffPictureProps> = ({ rankings, league, playoffBracket, onTeamClick }) => {
  const [bgImage, setBgImage] = useState(PLAYOFF_IMAGES[0]);

  useEffect(() => {
    setBgImage(PLAYOFF_IMAGES[Math.floor(Math.random() * PLAYOFF_IMAGES.length)]);
  }, []);

  if (!rankings.length || !league) return null;

  const playoffSpots = league.settings.playoff_teams || 6;
  const playoffStartWeek = league.settings.playoff_start_week || 15;
  const lastScoredWeek = league.settings.last_scored_leg || 0;
  const isPlayoffsStarted = lastScoredWeek >= playoffStartWeek;

  // Process bracket to find eliminated and surviving teams
  const eliminatedRosterIds = useMemo(() => {
    return new Set(playoffBracket.filter(m => m.l).map(m => m.l));
  }, [playoffBracket]);

  const winnerRosterId = useMemo(() => {
    // Finals is usually the last round (r=3 for 6 teams)
    const maxRound = Math.max(...playoffBracket.map(m => m.r), 0);
    const finalMatchup = playoffBracket.find(m => m.r === maxRound && m.w);
    return finalMatchup?.w;
  }, [playoffBracket]);

  // Logic to calculate "% Chance to Win it All"
  // If playoffs started, we zero out eliminated teams and re-run simulation on survivors.
  const forecastData = useMemo(() => {
    const qualified = rankings.slice(0, playoffSpots);
    
    const rawScores = qualified.map((team, idx) => {
      const isEliminated = eliminatedRosterIds.has(team.roster_id);
      const isChamp = winnerRosterId === team.roster_id;

      if (isChamp) return { ...team, raw: 1000, isEliminated: false, isChamp: true };
      if (isEliminated) return { ...team, raw: 0, isEliminated: true, isChamp: false };

      // Base weights
      const seedWeight = (playoffSpots - idx) / playoffSpots;
      const powerWeight = team.power_score / 100;
      
      // If we are in playoffs, survivors get a boost
      const survivorBoost = isPlayoffsStarted ? 2 : 1;
      
      return {
        ...team,
        raw: ((seedWeight * 0.4) + (powerWeight * 0.6)) * survivorBoost,
        isEliminated: false,
        isChamp: false
      };
    });

    const totalRaw = rawScores.reduce((acc, curr) => acc + curr.raw, 0);
    
    // Normalize to 100%
    return rawScores.map(team => ({
      ...team,
      winProb: totalRaw > 0 ? Math.round((team.raw / totalRaw) * 100) : 0
    })).sort((a, b) => {
      if (a.isChamp) return -1;
      if (b.isChamp) return 1;
      if (a.isEliminated && !b.isEliminated) return 1;
      if (!a.isEliminated && b.isEliminated) return -1;
      return b.winProb - a.winProb;
    });
  }, [rankings, playoffSpots, eliminatedRosterIds, winnerRosterId, isPlayoffsStarted]);

  const getLogoUrl = (avatar?: string) => {
    if (avatar) return `https://sleepercdn.com/avatars/thumbs/${avatar}`;
    return `https://picsum.photos/seed/default/128`;
  };

  const inTheHunt = rankings.slice(playoffSpots, Math.min(playoffSpots + 4, rankings.length));

  return (
    <div className="space-y-12">
      {/* ESPN Featured Header */}
      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative border-b-8 border-[#cc0000]">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 grayscale transition-all duration-1000" style={{backgroundImage: `url("https://images.unsplash.com/photo-${bgImage}?q=80&w=1600&auto=format&fit=crop")`}}></div>
        <div className="relative p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-[#cc0000] text-white text-[11px] font-black uppercase px-2 py-0.5 tracking-tight">Postseason Roadmap</span>
              <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest">
                {isPlayoffsStarted ? `Live Round ${lastScoredWeek - playoffStartWeek + 1} Analytics` : 'Calculated by NDNN Analytics'}
              </span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.85]">
              CHAMPIONSHIP<br/>FORECAST
            </h2>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/10 max-w-sm">
             <p className="text-sm font-bold text-white leading-relaxed mb-4">
               {isPlayoffsStarted 
                 ? "The field is shrinking. Our engine has adjusted win probabilities based on bracket eliminations and surviving roster strength."
                 : `Our advanced simulation engine analyzes roster consistency and tournament pathing to determine which ${playoffSpots} teams are favored to hoist the trophy.`}
             </p>
             <div className="flex items-center space-x-2 text-[10px] font-black text-red-500 uppercase tracking-widest">
                <i className={`fas ${isPlayoffsStarted ? 'fa-satellite-dish animate-pulse' : 'fa-microchip'}`}></i>
                <span>{isPlayoffsStarted ? 'Real-Time Playoff Tracker Active' : 'Probability Model v2.4 Active'}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Forecast Table */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center space-x-4">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
               {isPlayoffsStarted ? 'Tournament Status' : 'The Contenders'}
             </h3>
             <div className="h-1 bg-[#cc0000] flex-grow"></div>
           </div>

           <div className="espn-card overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-slate-100">
                {forecastData.map((team, idx) => {
                  const isTopContender = idx === 0 && !team.isEliminated;
                  const statusLabel = team.isChamp ? "CHAMPION" : (team.isEliminated ? "ELIMINATED" : "IN THE HUNT");
                  
                  return (
                    <div 
                      key={team.roster_id} 
                      onClick={() => onTeamClick(team.roster_id)}
                      className={`flex items-center justify-between p-8 hover:bg-slate-50 transition-all cursor-pointer group relative ${team.isEliminated ? 'opacity-40' : ''} ${isTopContender || team.isChamp ? 'bg-red-50/30' : ''}`}
                    >
                      { (isTopContender || team.isChamp) && (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#cc0000]"></div>
                      )}
                      
                      <div className="flex items-center space-x-8">
                        <div className="flex flex-col items-center justify-center w-12 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SEED</span>
                          <span className={`text-3xl font-black italic ${team.actual_rank <= 2 ? 'text-[#cc0000]' : 'text-slate-900'}`}>
                            #{team.actual_rank}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-5">
                          <div className="relative">
                            <div className={`w-16 h-16 rounded-full border-2 border-white shadow-xl overflow-hidden bg-slate-100 group-hover:scale-110 transition-transform ${team.isEliminated ? 'grayscale' : ''}`}>
                              <img src={getLogoUrl(team.avatar)} alt="logo" className="w-full h-full object-cover" />
                            </div>
                            {team.isChamp && (
                              <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 border-white animate-bounce shadow-lg">
                                <i className="fas fa-crown"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                               <h4 className="text-xl font-black uppercase tracking-tighter leading-none group-hover:text-[#cc0000] transition-colors">{team.team_name}</h4>
                               {team.isEliminated && <span className="text-[8px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">OUT</span>}
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">@{team.owner_name} • {team.wins}-{team.losses}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end min-w-[140px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">TITLE CHANCE</span>
                        <div className="flex items-center space-x-3">
                           {!team.isEliminated && !team.isChamp && (
                             <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hidden md:block">
                                <div 
                                  className={`h-full transition-all duration-1000 ${isTopContender ? 'bg-[#cc0000]' : 'bg-slate-900'}`}
                                  style={{ width: `${team.winProb}%` }}
                                ></div>
                             </div>
                           )}
                           <span className={`text-4xl font-black italic tracking-tighter ${team.isChamp || isTopContender ? 'text-[#cc0000]' : team.isEliminated ? 'text-slate-200' : 'text-slate-900'}`}>
                            {team.winProb}%
                          </span>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${team.isChamp ? 'text-yellow-600' : team.isEliminated ? 'text-slate-300' : 'text-slate-400'}`}>
                           {statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
           {!isPlayoffsStarted && (
             <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">In The Hunt</h3>
                </div>
                <div className="space-y-3">
                   {inTheHunt.map((team) => (
                     <div 
                      key={team.roster_id} 
                      onClick={() => onTeamClick(team.roster_id)}
                      className="espn-card p-5 flex items-center justify-between hover:border-[#cc0000] transition-all cursor-pointer group"
                     >
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full border border-slate-100 overflow-hidden">
                            <img src={getLogoUrl(team.avatar)} alt="logo" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black uppercase truncate group-hover:text-[#cc0000]">{team.team_name}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rank #{team.rank} • {team.wins}-{team.losses}</p>
                          </div>
                       </div>
                       <span className="text-[9px] font-black text-slate-300 uppercase italic">On Bubble</span>
                     </div>
                   ))}
                </div>
             </div>
           )}

           <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
              <h4 className="text-[11px] font-black uppercase text-[#cc0000] mb-4 tracking-[0.2em]">Tournament Progress</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between py-2 border-b border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Quarter-Finals</span>
                    <i className={`fas fa-check-circle ${lastScoredWeek >= playoffStartWeek ? 'text-emerald-500' : 'text-slate-200'}`}></i>
                 </div>
                 <div className="flex items-center justify-between py-2 border-b border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Semi-Finals</span>
                    <i className={`fas fa-check-circle ${lastScoredWeek >= playoffStartWeek + 1 ? 'text-emerald-500' : 'text-slate-200'}`}></i>
                 </div>
                 <div className="flex items-center justify-between py-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Championship</span>
                    <i className={`fas fa-trophy ${winnerRosterId ? 'text-yellow-500' : 'text-slate-200'}`}></i>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 text-white p-8 rounded-xl shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:rotate-12 transition-transform">
                <i className="fas fa-trophy text-9xl"></i>
              </div>
              <h4 className="text-xl font-black uppercase italic italic tracking-tighter mb-4">THE LAST DANCE</h4>
              <p className="text-sm font-bold leading-relaxed text-slate-400 mb-6">
                The regular season is over. Every snap now defines your legacy. 
                {winnerRosterId ? " The crown has been claimed." : " Who will survive the final gauntlet?"}
              </p>
              <button 
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                className="text-[10px] font-black uppercase tracking-widest text-[#cc0000] hover:text-white transition-colors"
              >
                Back to Top
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlayoffPicture;
