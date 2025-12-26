
import React from 'react';
import { Matchup, Roster, User, MatchupRecap } from '../types';

interface ScoreboardProps {
  matchups: Matchup[];
  rosters: Roster[];
  users: User[];
  isUpcoming?: boolean;
  featuredOnly?: boolean;
  recaps?: MatchupRecap[];
}

const Scoreboard: React.FC<ScoreboardProps> = ({ matchups, rosters, users, isUpcoming = false, featuredOnly = false, recaps = [] }) => {
  const groupedMatchups: Record<number, Matchup[]> = {};
  matchups.forEach(m => {
    if (!groupedMatchups[m.matchup_id]) groupedMatchups[m.matchup_id] = [];
    groupedMatchups[m.matchup_id].push(m);
  });

  const matchupList = Object.values(groupedMatchups);

  const displayList = featuredOnly 
    ? [matchupList.sort((a, b) => {
        const diffA = Math.abs((a[0]?.points || 0) - (a[1]?.points || 0));
        const diffB = Math.abs((b[0]?.points || 0) - (b[1]?.points || 0));
        return diffA - diffB;
      })[0]]
    : matchupList;

  const getLogoUrl = (user?: User) => {
    if (user?.avatar) return `https://sleepercdn.com/avatars/thumbs/${user.avatar}`;
    // Fallback to a seeded team placeholder
    return `https://picsum.photos/seed/${user?.user_id || 'default'}/128`;
  };

  const getRecap = (matchupId: number) => {
    return recaps.find(r => r.matchup_id === matchupId)?.recap;
  };

  return (
    <div className={`grid grid-cols-1 ${featuredOnly ? '' : 'sm:grid-cols-2 lg:grid-cols-2'} gap-6`}>
      {displayList.map((match, i) => {
        const team1Match = match[0];
        const team2Match = match[1];
        if (!team1Match || !team2Match) return null;

        const roster1 = rosters.find(r => r.roster_id === team1Match.roster_id);
        const roster2 = rosters.find(r => r.roster_id === team2Match.roster_id);
        const user1 = users.find(u => u.user_id === roster1?.owner_id);
        const user2 = users.find(u => u.user_id === roster2?.owner_id);

        const isWinner1 = team1Match.points > team2Match.points;
        const isWinner2 = team2Match.points > team1Match.points;
        const gameRecapText = getRecap(team1Match.matchup_id);

        if (featuredOnly) {
          return (
            <div key={i} className="flex flex-col space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-8 h-8 rounded-full border border-slate-100 flex-shrink-0 overflow-hidden">
                    <img src={getLogoUrl(user1)} className="w-full h-full object-cover" alt="T1" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[12px] font-black uppercase truncate tracking-tight leading-none ${isWinner1 ? 'text-black' : 'text-slate-400'}`}>
                      {user1?.metadata.team_name || user1?.display_name}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{roster1?.settings.wins}-{roster1?.settings.losses}</p>
                  </div>
                </div>
                {!isUpcoming && <span className={`text-lg font-black italic ${isWinner1 ? 'text-[#cc0000]' : 'text-slate-300'}`}>{team1Match.points.toFixed(1)}</span>}
              </div>

              <div className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-8 h-8 rounded-full border border-slate-100 flex-shrink-0 overflow-hidden">
                    <img src={getLogoUrl(user2)} className="w-full h-full object-cover" alt="T2" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[12px] font-black uppercase truncate tracking-tight leading-none ${isWinner2 ? 'text-black' : 'text-slate-400'}`}>
                      {user2?.metadata.team_name || user2?.display_name}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{roster2?.settings.wins}-{roster2?.settings.losses}</p>
                  </div>
                </div>
                {!isUpcoming && <span className={`text-lg font-black italic ${isWinner2 ? 'text-[#cc0000]' : 'text-slate-300'}`}>{team2Match.points.toFixed(1)}</span>}
              </div>
              
              {gameRecapText && (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold italic text-slate-600 leading-snug">
                   <i className="fas fa-robot mr-2 text-[#cc0000]"></i>
                   "{gameRecapText}"
                </div>
              )}
              
              <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest">Featured Game</span>
                 <button className="text-[9px] font-black uppercase text-[#cc0000] hover:underline">Analysis</button>
              </div>
            </div>
          );
        }

        return (
          <div key={i} className={`espn-card p-6 flex flex-col transition-all hover:shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-12 h-12 rounded-full border border-slate-100 flex-shrink-0 overflow-hidden">
                   <img src={getLogoUrl(user1)} className="w-full h-full object-cover" alt="T1" />
                </div>
                <div className="min-w-0">
                  <h4 className={`text-sm font-black uppercase truncate tracking-tight ${isWinner1 ? 'text-black' : 'text-slate-400'}`}>
                    {user1?.metadata.team_name || user1?.display_name}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{roster1?.settings.wins}-{roster1?.settings.losses}</span>
                </div>
              </div>
              {!isUpcoming && (
                <span className={`text-2xl font-black italic ${isWinner1 ? 'text-[#cc0000]' : 'text-slate-300'}`}>
                  {team1Match.points.toFixed(1)}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-12 h-12 rounded-full border border-slate-100 flex-shrink-0 overflow-hidden">
                   <img src={getLogoUrl(user2)} className="w-full h-full object-cover" alt="T2" />
                </div>
                <div className="min-w-0">
                  <h4 className={`text-sm font-black uppercase truncate tracking-tight ${isWinner2 ? 'text-black' : 'text-slate-400'}`}>
                    {user2?.metadata.team_name || user2?.display_name}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{roster2?.settings.wins}-{roster2?.settings.losses}</span>
                </div>
              </div>
              {!isUpcoming && (
                <span className={`text-2xl font-black italic ${isWinner2 ? 'text-[#cc0000]' : 'text-slate-300'}`}>
                  {team2Match.points.toFixed(1)}
                </span>
              )}
            </div>

            {gameRecapText && (
               <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg mb-6 relative">
                 <div className="flex items-center space-x-2 mb-2">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#cc0000]">NDNN Game Analysis</span>
                    <div className="h-px bg-slate-200 flex-grow"></div>
                 </div>
                 <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                    "{gameRecapText}"
                 </p>
                 <div className="absolute -bottom-1 -right-1 opacity-10">
                    <i className="fas fa-pen-nib text-3xl"></i>
                 </div>
               </div>
            )}

            <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Matchup ID: {team1Match.matchup_id}</span>
               <button className="text-[9px] font-black uppercase tracking-widest text-[#cc0000] hover:underline">Full Stats</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Scoreboard;
