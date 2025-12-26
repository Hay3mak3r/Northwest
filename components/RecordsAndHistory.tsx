
import React from 'react';
import { League, Roster, User } from '../types';

interface RecordsAndHistoryProps {
  league: League | null;
  rosters: Roster[];
  users: User[];
}

const RecordsAndHistory: React.FC<RecordsAndHistoryProps> = ({ league, rosters, users }) => {
  // Compute some interesting stats
  const allTimeHigh = [...rosters].sort((a, b) => b.settings.fpts - a.settings.fpts)[0];
  const highScorer = users.find(u => u.user_id === allTimeHigh?.owner_id);

  const stats = [
    { label: "Season High Points", value: allTimeHigh?.settings.fpts.toFixed(2) || "0.00", owner: highScorer?.display_name || "N/A", icon: "fa-fire" },
    { label: "Strength of Schedule", value: "Tough", owner: "Roster #4", icon: "fa-dumbbell" },
    { label: "Average Score", value: "118.4", owner: "League Avg", icon: "fa-chart-line" },
  ];

  return (
    <div className="bg-white rounded shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black uppercase text-slate-800 flex items-center">
          <i className="fas fa-history mr-3 text-red-600"></i>
          League Records
        </h2>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Season {league?.season}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-50 border rounded p-5 relative overflow-hidden">
            <i className={`fas ${stat.icon} absolute -right-2 -bottom-2 text-6xl text-slate-200 opacity-50`}></i>
            <h4 className="text-xs font-black text-slate-400 uppercase mb-2 relative z-10">{stat.label}</h4>
            <div className="flex items-baseline space-x-2 relative z-10">
              <span className="text-3xl font-black text-slate-900">{stat.value}</span>
              <span className="text-xs font-bold text-red-600 uppercase">{stat.owner}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-black uppercase text-slate-800 mb-4">Historical Hall of Fame</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-3 bg-yellow-50 border border-yellow-200 rounded px-4 py-2">
            <i className="fas fa-trophy text-yellow-500"></i>
            <span className="text-sm font-bold text-yellow-800">2023 Champion: <span className="font-black">TBD</span></span>
          </div>
          <div className="flex items-center space-x-3 bg-slate-100 border border-slate-200 rounded px-4 py-2 opacity-50">
            <i className="fas fa-history text-slate-400"></i>
            <span className="text-sm font-bold text-slate-600">2022 Champion: <span className="font-black">Unknown</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordsAndHistory;
