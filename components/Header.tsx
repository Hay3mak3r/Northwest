
import React from 'react';
import { Matchup, Roster, User } from '../types';

interface HeaderProps {
  leagueName: string;
  currentView: string;
  onViewChange: (view: any) => void;
  matchups: Matchup[];
  rosters: Roster[];
  users: User[];
}

const Header: React.FC<HeaderProps> = ({ leagueName, currentView, onViewChange, matchups, rosters, users }) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'scoreboard', label: 'Scores' },
    { id: 'standings', label: 'Rankings' },
    { id: 'playoffs', label: 'Playoff Picture' },
    { id: 'draft', label: 'Draft' },
    { id: 'trophies', label: 'Trophies' },
    { id: 'settings', label: 'League Office' },
  ];

  return (
    <div className="z-50 sticky top-0 shadow-md">
      {/* Top Brand Bar */}
      <div className="bg-[#cc0000] text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <button onClick={() => onViewChange('home')} className="font-black italic text-2xl tracking-tighter">NDNN</button>
             <div className="h-4 w-px bg-white/30"></div>
             <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{leagueName}</span>
          </div>
          <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest">
            <span className="text-yellow-400">Live Now</span>
            <i className="fas fa-search opacity-60"></i>
            <i className="fas fa-user-circle opacity-80"></i>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12">
            <nav className="flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`text-[12px] font-black uppercase tracking-tight transition-all py-3 relative ${
                    currentView === item.id 
                      ? 'text-[#cc0000] after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-[#cc0000]' 
                      : 'text-slate-500 hover:text-black'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
