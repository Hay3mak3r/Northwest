
import React from 'react';
import { PowerRanking } from '../types';

interface StandingsTableProps {
  rankings: any[]; // Updated to any to support the extended fields from App.tsx memo
  onTeamClick?: (rosterId: number) => void;
}

const StandingsTable: React.FC<StandingsTableProps> = ({ rankings, onTeamClick }) => {
  return (
    <div className="espn-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">TRUE RK</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">TEAM</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">TRUE W% (ALL-PLAY)</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">LUCK INDEX</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">ACTUAL RECORD</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">PF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rankings.map((rank) => {
              const luckDiff = rank.actual_rank - rank.rank;
              const isLucky = luckDiff > 0;
              const isUnlucky = luckDiff < 0;

              return (
                <tr 
                  key={rank.roster_id} 
                  onClick={() => onTeamClick?.(rank.roster_id)}
                  className="hover:bg-slate-50 transition-all cursor-pointer group"
                >
                  <td className="px-6 py-6 text-center">
                    <span className="text-xl font-black italic text-slate-900 group-hover:text-[#cc0000]">{rank.rank}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full border border-slate-100 flex-shrink-0 overflow-hidden">
                         <img src={rank.avatar ? `https://sleepercdn.com/avatars/thumbs/${rank.avatar}` : `https://picsum.photos/seed/${rank.roster_id}/128`} className="w-full h-full object-cover" alt="Logo" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-black uppercase tracking-tight text-slate-800 group-hover:text-[#cc0000] transition-colors leading-none">{rank.team_name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">@{rank.owner_name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="bg-slate-900 text-white text-sm font-black px-3 py-1 rounded-sm italic shadow-sm">
                      {rank.power_score.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center">
                       {luckDiff === 0 ? (
                         <span className="text-[10px] font-black text-slate-300 uppercase italic">Balanced</span>
                       ) : (
                         <span className={`text-sm font-black italic ${isLucky ? 'text-emerald-500' : 'text-red-500'}`}>
                           {isLucky ? `+${luckDiff}` : luckDiff}
                         </span>
                       )}
                       <span className="text-[8px] font-bold text-slate-400 uppercase">Rank Delta</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="font-bold text-slate-700 text-sm">{rank.wins}-{rank.losses}</span>
                  </td>
                  <td className="px-6 py-6 text-center font-black text-slate-900 tabular-nums">
                    {rank.fpts.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-900 text-white p-6 text-[10px] font-black uppercase tracking-widest leading-relaxed">
        <i className="fas fa-info-circle text-red-500 mr-2"></i>
        The Luck Index reflects the disparity between actual league standing and true roster quality. A positive (+) Luck Index indicates a team is outperforming their expected win rate based on schedule luck.
      </div>
    </div>
  );
};

export default StandingsTable;
