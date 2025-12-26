
import React, { useState, useEffect, useMemo } from 'react';
import { fetchLeagueData, fetchLeagueUsers, fetchLeagueRosters, fetchMatchups, fetchNflPlayers, fetchNflState, fetchPlayoffBracket, fetchTradedPicks } from './services/sleeperApi';
import { generateWeeklyRecap, generatePlayerHighlights, generateMatchupRecaps } from './services/geminiService';
import { League, User, Roster, Matchup, PowerRanking, NflPlayer, PlayerHighlight, MatchupRecap, TradedPick } from './types';
import Header from './components/Header';
import Scoreboard from './components/Scoreboard';
import RecapSection from './components/RecapSection';
import StandingsTable from './components/StandingsTable';
import TrophyRoom from './components/TrophyRoom';
import TeamRoster from './components/TeamRoster';
import PlayerHighlights from './components/PlayerHighlights';
import LeagueSettings from './components/LeagueSettings';
import PlayoffPicture from './components/PlayoffPicture';
import DraftOrder from './components/DraftOrder';

const LEAGUE_ID = "1180225783518171136";

type View = 'home' | 'scoreboard' | 'standings' | 'playoffs' | 'trophies' | 'roster' | 'settings' | 'draft';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRosterId, setSelectedRosterId] = useState<number | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [nextMatchups, setNextMatchups] = useState<Matchup[]>([]);
  const [historyMatchups, setHistoryMatchups] = useState<Matchup[][]>([]);
  const [playoffBracket, setPlayoffBracket] = useState<any[]>([]);
  const [tradedPicks, setTradedPicks] = useState<TradedPick[]>([]);
  const [allPlayers, setAllPlayers] = useState<Record<string, NflPlayer>>({});
  const [nflState, setNflState] = useState<any>(null);
  const [aiRecap, setAiRecap] = useState<string>("");
  const [matchupRecaps, setMatchupRecaps] = useState<MatchupRecap[]>([]);
  const [matchupSummaries, setMatchupSummaries] = useState<any[]>([]);
  const [playerHighlights, setPlayerHighlights] = useState<PlayerHighlight[]>([]);
  const [selectedScoreboardWeek, setSelectedScoreboardWeek] = useState<number>(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leagueData, usersData, rostersData, playersData, stateData, bracketData, picksData] = await Promise.all([
          fetchLeagueData(LEAGUE_ID),
          fetchLeagueUsers(LEAGUE_ID),
          fetchLeagueRosters(LEAGUE_ID),
          fetchNflPlayers(),
          fetchNflState(),
          fetchPlayoffBracket(LEAGUE_ID),
          fetchTradedPicks(LEAGUE_ID)
        ]);

        setLeague(leagueData);
        setUsers(usersData);
        setRosters(rostersData);
        setAllPlayers(playersData);
        setNflState(stateData);
        setPlayoffBracket(bracketData);
        setTradedPicks(picksData);

        const currentWeek = leagueData.settings.last_scored_leg || 1;
        setSelectedScoreboardWeek(currentWeek);
        
        const [currentM, upcomingM] = await Promise.all([
          fetchMatchups(LEAGUE_ID, currentWeek),
          fetchMatchups(LEAGUE_ID, currentWeek + 1)
        ]);
        setMatchups(currentM);
        setNextMatchups(upcomingM);

        const historicalWeeks = Array.from({ length: 18 }, (_, i) => i + 1);
        const allHistory = await Promise.all(historicalWeeks.map(async (w) => {
          try {
            return await fetchMatchups(LEAGUE_ID, w);
          } catch (e) {
            return [];
          }
        }));
        setHistoryMatchups(allHistory);

        const summaries: any[] = [];
        const grouped = currentM.reduce((acc, m) => {
          if (!acc[m.matchup_id]) acc[m.matchup_id] = [];
          acc[m.matchup_id].push(m);
          return acc;
        }, {} as Record<number, Matchup[]>);

        Object.entries(grouped).forEach(([id, games]) => {
          if (games.length === 2) {
            const u1 = usersData.find(u => rostersData.find(r => r.roster_id === games[0].roster_id)?.owner_id === u.user_id);
            const u2 = usersData.find(u => rostersData.find(r => r.roster_id === games[1].roster_id)?.owner_id === u.user_id);
            summaries.push({
              matchup_id: parseInt(id),
              team1: u1?.metadata.team_name || u1?.display_name || "Team 1",
              team1_score: games[0].points,
              team2: u2?.metadata.team_name || u2?.display_name || "Team 2",
              team2_score: games[1].points
            });
          }
        });
        setMatchupSummaries(summaries);

        // AI Column Context
        const headToHeadResultsString = summaries.map(s => 
          `${s.team1} (${s.team1_score.toFixed(1)}) vs ${s.team2} (${s.team2_score.toFixed(1)}) - Result: ${s.team1_score > s.team2_score ? s.team1 + ' Won' : s.team2 + ' Won'}`
        ).join("; ");

        const topPlayersRaw: any[] = [];
        currentM.forEach(m => {
          const owner = usersData.find(u => rostersData.find(r => r.roster_id === m.roster_id)?.owner_id === u.user_id);
          if (m.players_points) {
            Object.entries(m.players_points).forEach(([id, pts]) => {
              const p = playersData[id];
              if (p && pts > 15) {
                topPlayersRaw.push({
                  player_id: id,
                  player_name: `${p.first_name} ${p.last_name}`,
                  points: pts,
                  owner_name: owner?.display_name || 'Free Agent'
                });
              }
            });
          }
        });

        const sortedTop = topPlayersRaw.sort((a, b) => b.points - a.points).slice(0, 3);

        const [recap, highlights, gameRecaps] = await Promise.all([
          generateWeeklyRecap(
            leagueData.name, 
            currentWeek, 
            headToHeadResultsString, 
            leagueData.settings.trade_deadline, 
            leagueData.settings.playoff_start_week
          ),
          generatePlayerHighlights(currentWeek, sortedTop),
          generateMatchupRecaps(currentWeek, summaries)
        ]);

        setAiRecap(recap);
        setPlayerHighlights(highlights);
        setMatchupRecaps(gameRecaps);
        setLoading(false);
      } catch (err) {
        console.error("Error loading league data:", err);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const powerRankings = useMemo(() => {
    if (!rosters.length || !users.length || !historyMatchups.length) return [];
    
    const allPlayStats: Record<number, { wins: number; losses: number; ties: number }> = {};
    rosters.forEach(r => {
      allPlayStats[r.roster_id] = { wins: 0, losses: 0, ties: 0 };
    });

    const currentWeekNum = league?.settings.last_scored_leg || 0;

    historyMatchups.slice(0, currentWeekNum).forEach((weekMatchups) => {
      if (weekMatchups.length === 0) return;
      weekMatchups.forEach((teamA) => {
        weekMatchups.forEach((teamB) => {
          if (teamA.roster_id === teamB.roster_id) return;
          if (teamA.points > teamB.points) allPlayStats[teamA.roster_id].wins += 1;
          else if (teamA.points < teamB.points) allPlayStats[teamA.roster_id].losses += 1;
          else allPlayStats[teamA.roster_id].ties += 1;
        });
      });
    });

    const sortedByActual = [...rosters].sort((a, b) => {
      if (b.settings.wins !== a.settings.wins) return b.settings.wins - a.settings.wins;
      return (b.settings.fpts + b.settings.fpts_decimal/100) - (a.settings.fpts + a.settings.fpts_decimal/100);
    });

    const computedRankings = rosters.map(roster => {
      const user = users.find(u => u.user_id === roster.owner_id);
      const ap = allPlayStats[roster.roster_id];
      const pf = roster.settings.fpts + (roster.settings.fpts_decimal / 100);
      const actualRank = sortedByActual.findIndex(r => r.roster_id === roster.roster_id) + 1;
      
      const allPlayWinPct = ap.wins / (ap.wins + ap.losses + ap.ties || 1);
      const powerScore = allPlayWinPct * 100;

      return {
        roster_id: roster.roster_id,
        team_name: user?.metadata.team_name || user?.display_name || `Team ${roster.roster_id}`,
        owner_name: user?.display_name || "Unknown",
        avatar: user?.avatar,
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        fpts: pf,
        fpts_against: roster.settings.fpts_against + (roster.settings.fpts_against_decimal / 100),
        all_play_wins: ap.wins,
        all_play_losses: ap.losses,
        all_play_ties: ap.ties,
        power_score: powerScore,
        actual_rank: actualRank,
        rank: 0 
      };
    });

    return computedRankings
      .sort((a, b) => {
        if (b.power_score !== a.power_score) return b.power_score - a.power_score;
        return b.fpts - a.fpts; 
      })
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [rosters, users, historyMatchups, league]);

  const handleTeamSelect = (rosterId: number) => {
    setSelectedRosterId(rosterId);
    setCurrentView('roster');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 border-8 border-slate-200 border-t-[#cc0000] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center font-black italic text-[#cc0000]">NDNN</div>
          </div>
          <p className="text-slate-600 font-black uppercase tracking-widest text-sm">Processing League Analytics</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const currentWeek = league?.settings.last_scored_leg || 0;
    const tradeDeadline = league?.settings.trade_deadline || 0;
    const isDeadlinePassed = currentWeek > tradeDeadline;

    switch (currentView) {
      case 'home':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <RecapSection 
                recap={aiRecap} 
                week={currentWeek} 
                onSeeAllScores={() => {
                  setCurrentView('scoreboard');
                  setSelectedScoreboardWeek(currentWeek);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                matchupRecaps={matchupRecaps}
                matchupSummaries={matchupSummaries}
              />
              <PlayerHighlights highlights={playerHighlights} />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900 text-white p-5 rounded shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2">
                  <span className="animate-pulse flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
                <h4 className="text-[10px] font-black uppercase text-red-500 mb-1">Breaking News</h4>
                <p className="text-sm font-bold leading-tight group-hover:text-red-400 transition-colors">
                  {isDeadlinePassed 
                    ? "Trade Market Closed! Championship contenders now look to the waiver wire for final depth pieces."
                    : "Trade Deadline Approaching! GMs are hitting the phones as playoff berths tighten."}
                </p>
              </div>

              <div className="bg-white rounded border p-6">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest border-b pb-2 flex justify-between items-center">
                  <span>Headline Matchup</span>
                  <i className="fas fa-bolt text-yellow-500"></i>
                </h3>
                <Scoreboard 
                  matchups={matchups} 
                  rosters={rosters} 
                  users={users} 
                  featuredOnly={true}
                  recaps={matchupRecaps}
                />
              </div>

              <div className="bg-white rounded border p-6">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest border-b pb-2">True Contenders</h3>
                <div className="space-y-4">
                  {powerRankings.slice(0, 3).map((rank, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => handleTeamSelect(rank.roster_id)}>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-black italic text-slate-300 group-hover:text-red-600">#{i+1}</span>
                        <span className="text-sm font-bold text-slate-700 truncate w-24 group-hover:text-black">{rank.team_name}</span>
                      </div>
                      <span className="text-xs font-black text-red-500 italic">{rank.power_score.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentView('standings')}
                  className="w-full mt-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  Full True Rankings
                </button>
              </div>
            </div>
          </div>
        );
      case 'scoreboard':
        const displayMatchups = historyMatchups[selectedScoreboardWeek - 1] || [];
        const isFutureWeek = selectedScoreboardWeek > (league?.settings.last_scored_leg || 0);

        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white border shadow-sm rounded-sm">
              <div className="flex items-center border-b border-slate-100 overflow-x-auto no-scrollbar scroll-smooth">
                {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedScoreboardWeek(w)}
                    className={`flex-shrink-0 px-6 py-4 text-xs font-black uppercase tracking-tighter transition-all relative ${
                      selectedScoreboardWeek === w 
                        ? 'text-[#cc0000] border-b-2 border-[#cc0000]' 
                        : 'text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Week {w}
                    {w === (league?.settings.last_scored_leg || 0) && (
                      <span className="absolute top-1 right-2 w-1 h-1 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
              <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Week {selectedScoreboardWeek} Scores</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                    {isFutureWeek ? "Projected Matchups" : "Official Results"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">NFL Regular Season</span>
                  <div className="h-4 w-px bg-white/20"></div>
                  <i className="fas fa-calendar-alt opacity-40"></i>
                </div>
              </div>
            </div>

            {displayMatchups.length > 0 ? (
              <Scoreboard 
                matchups={displayMatchups} 
                rosters={rosters} 
                users={users} 
                isUpcoming={isFutureWeek} 
                recaps={selectedScoreboardWeek === currentWeek ? matchupRecaps : []}
              />
            ) : (
              <div className="espn-card p-20 text-center">
                 <i className="fas fa-football-ball text-4xl text-slate-100 mb-4"></i>
                 <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Schedule Data Loading or Not Available</p>
              </div>
            )}
          </div>
        );
      case 'standings':
        return (
          <div className="animate-in slide-in-from-bottom duration-500">
             <div className="mb-12 text-center">
                <h2 className="text-6xl font-black uppercase italic tracking-tighter text-slate-900">True Rankings</h2>
                <div className="w-24 h-2 bg-[#cc0000] mx-auto mt-4"></div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-4">Founded Exclusively on All-Play Win Percentage</p>
             </div>
             <StandingsTable rankings={powerRankings} onTeamClick={handleTeamSelect} />
          </div>
        );
      case 'playoffs':
        return (
          <div className="animate-in fade-in duration-500">
             <PlayoffPicture 
               rankings={powerRankings} 
               league={league} 
               playoffBracket={playoffBracket}
               onTeamClick={handleTeamSelect}
             />
          </div>
        );
      case 'draft':
        return (
          <div className="animate-in fade-in duration-500">
             <DraftOrder 
               rankings={powerRankings} 
               league={league} 
               tradedPicks={tradedPicks}
               onTeamClick={handleTeamSelect}
             />
          </div>
        );
      case 'trophies':
        return (
          <div className="animate-in fade-in duration-500">
             <div className="text-center mb-16">
                <h2 className="text-6xl font-black uppercase italic tracking-tighter text-slate-900">Trophy Room</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-2">Where Legends Are Immortalized</p>
             </div>
             <TrophyRoom rosters={rosters} users={users} />
          </div>
        );
      case 'roster':
        const selectedRanking = powerRankings.find(r => r.roster_id === selectedRosterId);
        const selectedRoster = rosters.find(r => r.roster_id === selectedRosterId);
        const currentMatchup = matchups.find(m => m.roster_id === selectedRosterId);
        const playersPoints = currentMatchup?.players_points || {};

        return selectedRanking && selectedRoster ? (
          <TeamRoster 
            ranking={selectedRanking} 
            roster={selectedRoster} 
            allPlayers={allPlayers}
            playersPoints={playersPoints}
            nflState={nflState}
            historyMatchups={historyMatchups}
            users={users}
            rosters={rosters}
            onBack={() => setCurrentView('standings')} 
          />
        ) : <div>Team not found</div>;
      case 'settings':
        return league ? <LeagueSettings league={league} /> : <div>League settings not found</div>;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-red-600 selection:text-white">
      <Header 
        leagueName={league?.name || "The League"} 
        currentView={currentView} 
        onViewChange={setCurrentView}
        matchups={matchups}
        rosters={rosters}
        users={users}
      />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {renderContent()}
      </main>

      <footer className="bg-slate-900 text-white py-16 mt-20 border-t-8 border-[#cc0000]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="font-black italic text-4xl text-[#cc0000] tracking-tighter">NDNN</div>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">The definitive source for Sleeper league metrics, powered by advanced AI analysis and real-time API synchronization.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#cc0000]">Navigation</h4>
            <nav className="flex flex-col space-y-2 text-sm font-bold uppercase">
              <button onClick={() => setCurrentView('home')} className="text-left text-slate-300 hover:text-white">Home</button>
              <button onClick={() => setCurrentView('scoreboard')} className="text-left text-slate-300 hover:text-white">Scoreboard</button>
              <button onClick={() => setCurrentView('standings')} className="text-left text-slate-300 hover:text-white">Rankings</button>
              <button onClick={() => setCurrentView('playoffs')} className="text-left text-slate-300 hover:text-white">Playoff Picture</button>
              <button onClick={() => setCurrentView('draft')} className="text-left text-slate-300 hover:text-white">Draft Center</button>
              <button onClick={() => setCurrentView('trophies')} className="text-left text-slate-300 hover:text-white">Trophy Room</button>
            </nav>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#cc0000]">Connect</h4>
            <div className="flex space-x-6 text-xl">
              <i className="fab fa-twitter hover:text-[#cc0000] cursor-pointer"></i>
              <i className="fab fa-instagram hover:text-[#cc0000] cursor-pointer"></i>
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">&copy; 2024 Northwest Dynasty News Network. Not affiliated with ESPN or Sleeper.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
