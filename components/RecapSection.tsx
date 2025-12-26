
import React, { useState, useEffect, useCallback } from 'react';
import { MatchupRecap } from '../types';

interface RecapSectionProps {
  recap: string;
  week: number;
  onSeeAllScores: () => void;
  matchupRecaps: MatchupRecap[];
  matchupSummaries: any[];
}

/**
 * Verified High-Quality American Football Image Library 
 * Specifically filtered to exclude soccer and other sports.
 * Chosen to simulate the professional news-wire feel of Imagn.com.
 */
const NFL_WIRE_GALLERY = [
  { id: "1508098682722-e99c43a406b2", credit: "IMAGN / USA TODAY SPORTS" }, // Wide receiver catch
  { id: "1613946069911-4149f517305d", credit: "IMAGN / ACTION IMAGES" },    // Big hit action
  { id: "1566577739112-5180d4bf9390", credit: "IMAGN / STADIUM WIRE" },     // American Football Bowl Stadium
  { id: "1504450758481-7338eba7524a", credit: "IMAGN / EQUIPMENT WIRE" },   // Row of football helmets
  { id: "1517603985045-2532014249ed", credit: "IMAGN / GRIDIRON LIGHTS" },  // American Football Goal Post
  { id: "1629901967232-a93170e70a7d", credit: "IMAGN / RED ZONE ARCHIVE" }, // Endzone pylon & turf
  { id: "1551934346-64c890f5761a", credit: "IMAGN / FIELD REEL" },          // Linemen at scrimmage
  { id: "1566577134770-3d85bb3a9cc4", credit: "IMAGN / DETAIL ARCHIVE" },   // Pigskin football close up
  { id: "1519861538033-bf41c6f43697", credit: "IMAGN / TOUCHDOWN REEL" },   // Diving for touchdown
  { id: "1544033527-b488abb0a2ba", credit: "IMAGN / TURF TECH" },        // Gridiron yard lines
  { id: "1504104431965-da2964c42971", credit: "IMAGN / TEAM WIRE" }          // Team huddle
];

const getImageUrl = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=1600&auto=format&fit=crop`;

const RecapSection: React.FC<RecapSectionProps> = ({ recap, week, onSeeAllScores, matchupRecaps, matchupSummaries }) => {
  const [activePhoto, setActivePhoto] = useState(NFL_WIRE_GALLERY[0]);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [imgErrorCount, setImgErrorCount] = useState(0);

  const paragraphs = recap.split('\n\n').filter(p => p.trim());

  const pickRandomImage = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * NFL_WIRE_GALLERY.length);
    setActivePhoto(NFL_WIRE_GALLERY[randomIndex]);
    setIsImgLoading(true);
  }, []);

  useEffect(() => {
    pickRandomImage();
  }, [pickRandomImage]);

  const handleImageError = () => {
    if (imgErrorCount < 5) {
      setImgErrorCount(prev => prev + 1);
      const nextIndex = (NFL_WIRE_GALLERY.indexOf(activePhoto) + 1) % NFL_WIRE_GALLERY.length;
      setActivePhoto(NFL_WIRE_GALLERY[nextIndex]);
    } else {
      setActivePhoto({ id: "1508098682722-e99c43a406b2", credit: "RESCUE WIRE" });
    }
  };

  const detailedGameArticles = matchupSummaries.map(s => {
    const recapMatch = matchupRecaps.find(r => r.matchup_id === s.matchup_id);
    return { ...s, recapText: recapMatch?.recap || "Analysis pending..." };
  });

  return (
    <div className="space-y-12">
      {/* Lead Story Card: The 49th Parallel Post */}
      <article className="espn-card overflow-hidden transition-all duration-500 hover:shadow-2xl">
        <div className="relative h-72 sm:h-[550px] w-full bg-slate-800 overflow-hidden">
          {isImgLoading && (
            <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
               <i className="fas fa-football-ball text-white/20 text-6xl"></i>
            </div>
          )}
          
          <img 
            src={getImageUrl(activePhoto.id)} 
            alt="NFL Action News"
            onLoad={() => setIsImgLoading(false)}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-all duration-[15000ms] hover:scale-110 ${isImgLoading ? 'opacity-0' : 'opacity-100'}`}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90"></div>
          
          <div className="absolute top-6 right-6 z-20">
            <span className="text-[10px] font-black uppercase text-white/60 tracking-[0.25em] bg-black/60 px-4 py-1.5 backdrop-blur-md rounded-sm border border-white/10">
              {activePhoto.credit}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex -space-x-1">
                 <div className="w-2 h-6 bg-[#cc0000]"></div>
                 <div className="w-1 h-6 bg-white/20"></div>
              </div>
              <span className="bg-[#cc0000] text-white text-[11px] font-black uppercase px-2 py-0.5 tracking-tight animate-pulse">Lead Story</span>
              <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest border-l border-white/20 pl-3">NFL Week {week} Recap</span>
            </div>
            <h2 className="text-white text-4xl md:text-9xl font-black uppercase leading-[0.8] italic tracking-tighter">
              THE 49TH<br/>PARALLEL POST
            </h2>
            <div className="flex items-center space-x-4 mt-6">
              <p className="text-white/60 text-sm md:text-base font-bold uppercase tracking-[0.2em] max-w-2xl border-r border-white/20 pr-4">
                Official Intelligence & Analysis
              </p>
              <span className="text-yellow-500 text-xs font-black uppercase tracking-widest">Bureau Verified</span>
            </div>
          </div>
        </div>
        
        <div className="p-8 md:p-20">
          <div className="flex flex-col md:flex-row gap-20">
            <div className="md:w-2/3 space-y-10">
              <div className="flex items-center space-x-6 border-b border-slate-100 pb-10 mb-6">
                 <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-[#cc0000] flex items-center justify-center text-white text-2xl shadow-xl transform hover:rotate-12 transition-transform">
                   <i className="fas fa-newspaper"></i>
                 </div>
                 <div>
                   <span className="block text-sm font-black uppercase text-[#cc0000] tracking-[0.2em]">By NDNN Editorial Board</span>
                   <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Published Live • Northwest Dynasty Bureau</span>
                 </div>
              </div>
              
              <div className="space-y-10">
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-slate-900 text-xl md:text-2xl leading-relaxed font-normal first-letter:text-6xl md:first-letter:text-8xl first-letter:font-black first-letter:text-[#cc0000] first-letter:mr-4 first-letter:float-left first-letter:uppercase">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            <div className="md:w-1/3">
               <div className="bg-slate-50 border border-slate-100 p-10 rounded shadow-inner sticky top-24">
                  <h4 className="text-[11px] font-black uppercase text-[#cc0000] mb-8 tracking-[0.4em] border-b-2 border-[#cc0000]/10 pb-3">The Analysis</h4>
                  <div className="space-y-10">
                    <div className="border-l-8 border-[#cc0000] pl-8 py-4 bg-white shadow-sm rounded-r">
                      <p className="text-xl font-bold text-slate-900 leading-snug italic">
                        "In Dynasty, Week {week} isn't just another game—it's the tectonic shift that determines who leads the hunt for the next decade."
                      </p>
                    </div>
                    <div className="pt-8">
                      <button 
                        onClick={onSeeAllScores}
                        className="w-full bg-slate-900 text-white font-black uppercase text-[14px] py-5 rounded hover:bg-[#cc0000] transition-all tracking-[0.3em] shadow-2xl active:scale-95"
                      >
                        Launch Full Scoreboard
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </article>

      {/* Game Dispatches Section */}
      <section className="space-y-10">
        <div className="flex items-center space-x-8">
          <div className="bg-[#cc0000] text-white px-8 py-3 font-black italic uppercase text-base tracking-[0.3em] skew-x-[-15deg] shadow-xl">
            Matchup Dispatches
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 italic">Weekly Intelligence Reports</h3>
          <div className="flex-grow h-px bg-slate-200"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {detailedGameArticles.map((game, idx) => (
            <article key={idx} className="espn-card p-6 md:p-10 border-t-8 border-t-[#cc0000] group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl overflow-hidden">
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <div className="min-w-0 flex-grow pr-4">
                  <span className="bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-1 tracking-[0.1em] mb-4 inline-block rounded-sm">Report #{game.matchup_id}</span>
                  <div className="flex flex-col">
                    <h4 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-tight text-slate-900 group-hover:text-[#cc0000] transition-colors mb-2 truncate">
                      {game.team1} vs {game.team2}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm font-black uppercase text-slate-400 tracking-widest italic">
                       <span className={game.team1_score > game.team2_score ? 'text-black' : ''}>{game.team1_score.toFixed(1)}</span>
                       <span className="opacity-20 text-[10px]">PTS</span>
                       <span className={game.team2_score > game.team1_score ? 'text-black' : ''}>{game.team2_score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 pt-1">
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900 flex items-center justify-center text-white text-base md:text-lg border-2 border-white shadow-xl transform group-hover:rotate-[360deg] transition-transform duration-1000">
                     <i className="fas fa-flag-checkered"></i>
                   </div>
                </div>
              </div>

              <div className="relative pl-6 md:pl-8 py-4 border-l-4 border-slate-100 group-hover:border-[#cc0000] transition-colors">
                 <p className="text-base md:text-lg font-bold text-slate-700 leading-relaxed italic line-clamp-3">
                    "{game.recapText}"
                 </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                 <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Analysis: NDNN Bureau</span>
                 </div>
                 <button 
                  onClick={onSeeAllScores}
                  className="text-[10px] font-black uppercase text-[#cc0000] hover:text-black transition-colors flex items-center group"
                 >
                   Box Score <i className="fas fa-arrow-right ml-2 text-[8px] group-hover:translate-x-1 transition-transform"></i>
                 </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RecapSection;
