
import React from 'react';
import { League } from '../types';

interface LeagueSettingsProps {
  league: League;
}

const LeagueSettings: React.FC<LeagueSettingsProps> = ({ league }) => {
  const s = league.scoring_settings;
  const playoffWeek = league.settings.playoff_start_week || 15;
  const playoffTeams = league.settings.playoff_teams || 6;

  // Helper to round numeric values safely
  const rnd = (val: number | undefined, fallback: number) => Math.round(val !== undefined ? val : fallback);

  const scoringCategories = [
    {
      title: "Passing",
      rules: [
        { label: "Passing TD", value: rnd(s.pass_td, 4) },
        { label: "Passing Yards", value: `1pt per ${Math.round(1 / (s.pass_yd || 0.04))}yd` },
        { label: "Interception", value: rnd(s.pass_int, -2) },
        { label: "Sack", value: rnd(s.pass_sack, 0) },
      ]
    },
    {
      title: "Rushing",
      rules: [
        { label: "Rushing TD", value: rnd(s.rush_td, 6) },
        { label: "Rushing Yards", value: `1pt per ${Math.round(1 / (s.rush_yd || 0.1))}yd` },
        { label: "2pt Conversion", value: rnd(s.rush_2pt, 2) },
      ]
    },
    {
      title: "Receiving",
      rules: [
        { label: "Receiving TD", value: rnd(s.rec_td, 6) },
        { label: "Reception", value: rnd(s.rec, 1) },
        { label: "Receiving Yards", value: `1pt per ${Math.round(1 / (s.rec_yd || 0.1))}yd` },
      ]
    },
    {
      title: "Defense",
      rules: [
        { label: "Sack", value: rnd(s.sack, 1) },
        { label: "Interception", value: rnd(s.int, 2) },
        { label: "Fumble Recovery", value: rnd(s.fum_rec, 2) },
        { label: "Safety", value: rnd(s.safe, 2) },
        { label: "Defensive TD", value: rnd(s.def_td, 6) },
      ]
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="flex items-center space-x-4 mb-12">
        <h2 className="text-6xl font-black uppercase italic tracking-tighter text-slate-900">League Office</h2>
        <div className="h-2 bg-[#cc0000] flex-grow"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar: Key Dates */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 text-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#cc0000] px-6 py-3">
              <h3 className="text-xs font-black uppercase tracking-widest italic">Critical Dates</h3>
            </div>
            <div className="p-8 space-y-8 relative">
              <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-slate-800"></div>
              
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-slate-900 -ml-2 z-10"></div>
                <span className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">Season Kickoff</span>
                <span className="text-lg font-black italic">Week 1</span>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-yellow-500 border-4 border-slate-900 -ml-2 z-10"></div>
                <span className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">Trade Deadline</span>
                <span className="text-lg font-black italic">Week {league.settings.trade_deadline}</span>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#cc0000] border-4 border-slate-900 -ml-2 z-10"></div>
                <span className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">Playoffs Start</span>
                <span className="text-lg font-black italic">Week {playoffWeek}</span>
              </div>

              <div className="relative pl-10 opacity-50">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-slate-500 border-4 border-slate-900 -ml-2 z-10"></div>
                <span className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">Championship</span>
                <span className="text-lg font-black italic">Week {playoffWeek + 2}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-xl p-8 shadow-sm">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Roster Structure</h4>
             <div className="space-y-2">
                {league.roster_positions.filter(p => p !== 'BN').map((pos, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm font-bold border-b border-slate-50 py-1">
                    <span className="text-slate-500">{pos}</span>
                    <span className="text-slate-900 font-black">1</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Main Content: Scoring Matrix */}
        <div className="lg:col-span-3 space-y-8">
           <div className="bg-white border rounded-xl shadow-2xl overflow-hidden">
             <div className="bg-[#063677] text-white px-8 py-4 flex justify-between items-center">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Scoring Matrix</h3>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Bureau of League Standards</span>
             </div>
             
             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
               {scoringCategories.map((cat, i) => (
                 <div key={i}>
                    <h4 className="text-sm font-black uppercase text-red-600 mb-4 border-b pb-2 tracking-widest">{cat.title}</h4>
                    <div className="space-y-3">
                      {cat.rules.map((rule, idx) => (
                        <div key={idx} className="flex justify-between items-center group">
                          <span className="text-xs font-bold text-slate-500 uppercase group-hover:text-slate-900 transition-colors">{rule.label}</span>
                          <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded min-w-[60px] text-center">{rule.value}</span>
                        </div>
                      ))}
                    </div>
                 </div>
               ))}
             </div>

             <div className="bg-slate-900 text-white p-6 flex items-center space-x-6">
                <div className="w-12 h-12 bg-[#cc0000] rounded flex items-center justify-center text-xl flex-shrink-0">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider leading-relaxed opacity-80">
                  Pro Tip: All scoring is verified live via the Sleeper API. Stat corrections are applied automatically on Tuesday mornings following NFL gameday reviews.
                </div>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 border rounded-xl shadow-sm hover:shadow-md transition-all group">
                <i className="fas fa-handshake text-3xl text-[#063677] mb-6 group-hover:scale-110 transition-transform block"></i>
                <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">Trade Policy</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase">
                  Trades are processed immediately. The deadline is absolute: Week {league.settings.trade_deadline}.
                </p>
              </div>
              <div className="bg-white p-8 border rounded-xl shadow-sm hover:shadow-md transition-all group">
                <i className="fas fa-trophy text-3xl text-yellow-500 mb-6 group-hover:scale-110 transition-transform block"></i>
                <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">Postseason Format</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase">
                  Top {playoffTeams} teams qualify. Single elimination bracket begins in Week {playoffWeek} to determine the Northwest Dynasty champion.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeagueSettings;
