
import React from 'react';
import { Roster, User } from '../types';

interface TrophyRoomProps {
  rosters: Roster[];
  users: User[];
}

const TrophyRoom: React.FC<TrophyRoomProps> = ({ rosters, users }) => {
  const awards = [
    { title: "Weekly High Scorer", icon: "fa-fire-alt", color: "from-orange-400 to-red-600", desc: "Most points in a single week" },
    { title: "Elite Strategist", icon: "fa-brain", color: "from-blue-400 to-indigo-600", desc: "Best bench optimization" },
    { title: "Scout of the Year", icon: "fa-binoculars", color: "from-green-400 to-emerald-600", desc: "Most points from waiver adds" },
    { title: "Gridiron Heart", icon: "fa-heart", color: "from-pink-400 to-rose-600", desc: "Closest win of the season" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {awards.map((award, i) => (
        <div key={i} className="group relative bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:border-red-600 transition-all overflow-hidden cursor-default">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${award.color} opacity-5 -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${award.color} flex items-center justify-center text-white text-3xl shadow-lg mb-6 group-hover:rotate-12 transition-transform`}>
              <i className={`fas ${award.icon}`}></i>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Award #{i+1}</span>
              <span className="bg-yellow-500/10 text-yellow-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Official NDNN Honor</span>
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-1 group-hover:text-red-600 transition-colors">{award.title}</h3>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-tight mb-6">{award.desc}</p>
            
            <div className="flex items-center space-x-4 pt-6 border-t border-slate-50">
              <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden">
                <img 
                  src={`https://sleepercdn.com/avatars/thumbs/${users[i % users.length]?.avatar || 'default'}`} 
                  alt="Winner"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "https://picsum.photos/40/40")}
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Current Holder</p>
                <p className="text-sm font-black uppercase text-slate-900">{users[i % users.length]?.display_name || "TBD"}</p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      ))}
    </div>
  );
};

export default TrophyRoom;