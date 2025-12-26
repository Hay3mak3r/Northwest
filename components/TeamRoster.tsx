
import React, { useState, useMemo } from 'react';
import { PowerRanking, Roster, NflPlayer, Matchup, User } from '../types';

interface TeamRosterProps {
  ranking: PowerRanking;
  roster: Roster;
  allPlayers: Record<string, NflPlayer>;
  playersPoints: Record<string, number>;
  nflState: any;
  historyMatchups: Matchup[][];
  users: User[];
  rosters: Roster[];
  onBack: () => void;
}

const TeamRoster: React.FC<TeamRosterProps> = ({ ranking, roster, allPlayers, playersPoints, nflState, historyMatchups, users, rosters, onBack }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<NflPlayer | null>(null);

  const getLogoUrl = () => {
    if (ranking.avatar) {
      return `https://sleepercdn.com/avatars/thumbs/${ranking.avatar}`;
    }
    return `https://picsum.photos/seed/${ranking.roster_id}/256`;
  };

  const getPlayersByPosition = (pos: string) => {
    if (!roster.players) return [];
    return roster.players
      .map(id => allPlayers[id])
      .filter(p => p && p.position === pos)
      .sort((a, b) => (a.last_name > b.last_name ? 1 : -1));
  };

  const getPlayerStatusLabel = (player: NflPlayer) => {
    if (!player.team) return "Free Agent";
    if (player.status === 'Inactive') return "Inactive";
    if (player.injury_status) return player.injury_status;
    if (player.status === 'Bye') return "Bye Week";
    return "In Active Roster";
  };

  // Logic to calculate game logs for a specific player across the season
  const gameLogs = useMemo(() => {
    if (!selectedPlayer || !historyMatchups) return [];
    
    return historyMatchups.map((weekData, idx) => {
      const week = idx + 1;
      const matchupForThisRoster = weekData.find(m => m.players?.includes(selectedPlayer.player_id));
      
      if (!matchupForThisRoster) return { week, status: 'Bye/Bench', points: 0, opponent: 'N/A' };
      
      const pts = matchupForThisRoster.players_points?.[selectedPlayer.player_id] || 0;
      
      // Find opponent
      const opponentMatchup = weekData.find(m => m.matchup_id === matchupForThisRoster.matchup_id && m.roster_id !== matchupForThisRoster.roster_id);
      const oppRoster = rosters.find(r => r.roster_id === opponentMatchup?.roster_id);
      const oppUser = users.find(u => u.user_id === oppRoster?.owner_id);
      const oppName = oppUser?.metadata.team_name || oppUser?.display_name || "Unknown";

      return { 
        week, 
        status: pts > 0 ? 'Active' : 'DNP', 
        points: pts, 
        opponent: oppName,
        isWin: (matchupForThisRoster.points > (opponentMatchup?.points || 0))
      };
    }).filter(log => log.week <= (nflState?.display_week || 18));
  }, [selectedPlayer, historyMatchups, rosters, users, nflState]);

  const seasonStats = useMemo(() => {
    if (gameLogs.length === 0) return null;
    const scoredGames = gameLogs.filter(g => g.points > 0);
    const total = scoredGames.reduce((acc, curr) => acc + curr.points, 0);
    return {
      avg: total / (scoredGames.length || 1),
      max: Math.max(...gameLogs.map(g => g.points)),
      total: total
    };
  }, [gameLogs]);

  const posStyles: Record<string, { color: string, bg: string, border: string, glow: string }> = {
    "QB": { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", glow: "shadow-blue-500/10" },
    "RB": { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", glow: "shadow-emerald-500/10" },
    "WR": { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", glow: "shadow-purple-500/10" },
    "TE": { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", glow: "shadow-orange-500/10" },
    "K": { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", glow: "shadow-slate-500/10" },
    "DEF": { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", glow: "shadow-slate-500/10" },
  };

  const categories = [
    { label: "Quarterbacks", posCode: "QB", icon: "fa-bolt", players: getPlayersByPosition("QB") },
    { label: "Running Backs", posCode: "RB", icon: "fa-running", players: getPlayersByPosition("RB") },
    { label: "Wide Receivers", posCode: "WR", icon: "fa-hands", players: getPlayersByPosition("WR") },
    { label: "Tight Ends", posCode: "TE", icon: "fa-shield-alt", players: getPlayersByPosition("TE") },
    { label: "Kickers & Special Teams", posCode: "K", icon: "fa-crosshairs", players: [...getPlayersByPosition("K"), ...getPlayersByPosition("DEF")] },
  ];

  const allPlayWinRate = ((ranking.all_play_wins / (ranking.all_play_wins + ranking.all_play_losses || 1)) * 100).toFixed(1);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* Back Navigation */}
      <button 
        onClick={onBack}
        className="mb-8 flex items-center space-x-2 text-slate-500 font-black uppercase text-xs tracking-widest hover:text-[#cc0000] transition-colors group"
      >
        <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
        <span>Back to Rankings</span>
      </button>

      {/* Hero Header */}
      <div className="relative bg-slate-900 border rounded-2xl shadow-2xl overflow-hidden mb-12 border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-[#063677]/40 via-transparent to-[#cc0000]/20 opacity-60"></div>
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#cc0000] to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-slate-800 border-2 border-white/10 shadow-inner overflow-hidden flex-shrink-0">
              <img 
                src={getLogoUrl()} 
                alt="Team Logo" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          </div>
          
          <div className="flex-grow text-center md:text-left pt-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
               <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
                 {ranking.team_name}
               </h2>
               <div className="inline-flex bg-[#cc0000] text-white px-5 py-2 rounded-lg text-3xl font-black italic shadow-2xl transform -skew-x-12">
                 RANK #{ranking.rank}
               </div>
            </div>
            <p className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-10 flex items-center justify-center md:justify-start gap-2">
              <i className="fas fa-id-badge text-[#cc0000]"></i>
              GM: <span className="text-white">@{ranking.owner_name}</span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 hover:border-[#cc0000]/50 transition-colors text-center">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">True Power Score</span>
                <span className="text-3xl font-black text-red-500 italic">{ranking.power_score.toFixed(1)}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 hover:border-[#cc0000]/50 transition-colors text-center">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">True Record</span>
                <span className="text-3xl font-black text-emerald-400 italic">{ranking.all_play_wins}-{ranking.all_play_losses}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 hover:border-[#cc0000]/50 transition-colors text-center">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Season Points</span>
                <span className="text-3xl font-black text-white italic">{ranking.fpts.toFixed(1)}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 hover:border-[#cc0000]/50 transition-colors text-center">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">True Win %</span>
                <span className="text-3xl font-black text-white italic">{allPlayWinRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <h3 className="text-3xl font-black uppercase text-slate-900 italic tracking-tighter">Depth Chart</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Click a player to view Game Logs</span>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {categories.map((cat, i) => {
              const style = posStyles[cat.posCode] || posStyles["QB"];
              return (
                <div key={i} className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg ${style.bg} ${style.color} flex items-center justify-center border ${style.border}`}>
                      <i className={`fas ${cat.icon} text-sm`}></i>
                    </div>
                    <h4 className="text-lg font-black uppercase italic text-slate-900 tracking-tight">{cat.label}</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {cat.players.length > 0 ? cat.players.map(player => {
                      const pts = playersPoints[player.player_id] || 0;
                      const status = getPlayerStatusLabel(player);
                      const isInjury = status !== 'In Active Roster' && status !== 'Bye Week' && status !== 'Free Agent';
                      
                      return (
                        <div 
                          key={player.player_id} 
                          onClick={() => setSelectedPlayer(player)}
                          className={`flex items-center justify-between p-4 bg-white border-2 border-slate-100 hover:border-slate-300 rounded-xl transition-all shadow-sm hover:${style.glow} hover:-translate-y-1 cursor-pointer group`}
                        >
                          <div className="flex items-center space-x-4 min-w-0">
                            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:ring-2 ring-[#cc0000] ring-offset-2 transition-all">
                               <img 
                                  src={`https://sleepercdn.com/content/nfl/players/thumb/${player.player_id}.jpg`} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => (e.currentTarget.src = "https://picsum.photos/60/60")}
                               />
                            </div>
                            <div className="min-w-0">
                              <span className="block text-sm font-black text-slate-900 uppercase tracking-tight truncate group-hover:text-[#cc0000]">
                                {player.first_name} {player.last_name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${style.bg} ${style.color} uppercase`}>
                                  {player.position}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                                  {player.team || 'FA'}
                                </span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${isInjury ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                                  {status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">WEEK {nflState?.display_week || 'PTS'}</span>
                            <span className={`text-2xl font-black italic tracking-tighter ${pts > 0 ? 'text-[#cc0000]' : 'text-slate-300'}`}>
                              {pts.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[10px] font-bold uppercase text-slate-400 italic tracking-widest">No active roster depth found</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gradient-to-br from-[#cc0000] to-maroon-900 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:rotate-12 transition-transform">
                <i className="fas fa-brain text-8xl"></i>
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#cc0000]">
                    <i className="fas fa-robot text-xs"></i>
                 </div>
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">NDNN Intelligence</h4>
               </div>
               <p className="text-base font-bold leading-relaxed italic text-white/90 border-l-4 border-white/20 pl-6 py-2">
                 "Watching the box scores this week, @{ranking.owner_name}'s roster is showing signs of deep efficiency. The True Record of {ranking.all_play_wins}-{ranking.all_play_losses} proves this team is better than the basic standings suggest. Watch for late-season surges."
               </p>
             </div>
          </div>

          <div className="bg-white border-2 border-slate-100 p-8 rounded-2xl shadow-lg">
             <div className="flex justify-between items-center mb-8">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 italic">True Comparison</h4>
                <i className="fas fa-users-cog text-[#cc0000]"></i>
             </div>
             <div className="space-y-8">
                <div>
                   <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
                      <span>Field Domination</span>
                      <span className="text-[#cc0000]">{allPlayWinRate}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#cc0000] rounded-full transition-all duration-1000" style={{ width: `${allPlayWinRate}%` }}></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Game Log Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setSelectedPlayer(null)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-200 transition-all"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Modal Sidebar - Profile */}
              <div className="md:w-1/3 bg-slate-900 text-white p-8 md:p-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-40 h-40 rounded-full bg-white border-4 border-slate-800 overflow-hidden mb-6 shadow-2xl">
                    <img 
                      src={`https://sleepercdn.com/content/nfl/players/thumb/${selectedPlayer.player_id}.jpg`} 
                      className="w-full h-full object-cover"
                      alt="Player Profile"
                    />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-1">{selectedPlayer.first_name} {selectedPlayer.last_name}</h3>
                  <p className="text-red-500 font-black uppercase tracking-widest text-xs mb-8">{selectedPlayer.position} • {selectedPlayer.team || 'FA'}</p>
                  
                  {seasonStats && (
                    <div className="w-full grid grid-cols-1 gap-4 mt-4">
                      <div className="bg-white/10 p-4 rounded-xl border border-white/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Season Avg</span>
                        <span className="text-2xl font-black italic">{seasonStats.avg.toFixed(1)}</span>
                      </div>
                      <div className="bg-white/10 p-4 rounded-xl border border-white/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Season High</span>
                        <span className="text-2xl font-black italic text-[#cc0000]">{seasonStats.max.toFixed(1)}</span>
                      </div>
                      <div className="bg-white/10 p-4 rounded-xl border border-white/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Points</span>
                        <span className="text-2xl font-black italic">{seasonStats.total.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Content - Game Logs */}
              <div className="md:w-2/3 p-8 md:p-12 overflow-y-auto max-h-[80vh]">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Season Game Log</h4>
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <i className="fas fa-calendar-alt text-[#cc0000]"></i>
                    <span>2024 Regular Season</span>
                  </div>
                </div>

                <div className="space-y-3">
                   {gameLogs.length > 0 ? gameLogs.map((log) => (
                     <div key={log.week} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-md transition-all group">
                        <div className="flex items-center space-x-6">
                           <span className="text-lg font-black italic text-slate-300 group-hover:text-[#cc0000] w-8">W{log.week}</span>
                           <div>
                             <span className="block text-[8px] font-black uppercase text-slate-400 tracking-widest">Opponent</span>
                             <span className="text-sm font-black uppercase text-slate-800">{log.opponent}</span>
                           </div>
                        </div>
                        <div className="text-right flex items-center space-x-6">
                           <div className="hidden sm:block">
                              <span className="block text-[8px] font-black uppercase text-slate-400 tracking-widest">Status</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${log.isWin ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {log.isWin ? 'Win' : 'Loss'}
                              </span>
                           </div>
                           <div className="min-w-[60px]">
                              <span className="block text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Points</span>
                              <span className={`text-xl font-black italic ${log.points > 0 ? 'text-[#cc0000]' : 'text-slate-200'}`}>
                                {log.points.toFixed(1)}
                              </span>
                           </div>
                        </div>
                     </div>
                   )) : (
                     <div className="py-20 text-center opacity-40">
                        <i className="fas fa-history text-4xl mb-4"></i>
                        <p className="text-xs font-black uppercase tracking-widest">No historical logs available</p>
                     </div>
                   )}
                </div>

                <div className="mt-12 bg-[#cc0000] p-6 rounded-xl text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <i className="fas fa-chart-line text-6xl"></i>
                   </div>
                   <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">NDNN Stat Watch</h5>
                   <p className="text-sm font-bold italic leading-relaxed">
                     "{selectedPlayer.last_name} has been a consistent floor-setter this season. With an average of {seasonStats?.avg.toFixed(1)} points per start, they remain a locked-in asset for Northwest Dynasty contenders."
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRoster;
