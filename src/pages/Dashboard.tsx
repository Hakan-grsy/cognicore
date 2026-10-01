import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Brain, Target, Play, Sparkles, Activity, BarChart2, Medal, Grid, Zap, Palette, Calculator, Navigation, Hash, RotateCcw, Filter, Type, MoveHorizontal, CloudRain, RefreshCw, Shuffle, ListOrdered, Settings, User, Lock, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import { SettingsModal } from '../components/SettingsModal';
import { useGameSounds } from '../hooks/useGameSounds';

const STATS = [
  "Kullanıcıların %78'i Hız oyunlarında sabah saatlerinde daha başarılı.",
  "Göz yorgunluğu şikayetleri Dark Mode ile %40 oranında azaldı.",
  "En çok zorlanılan kategori: Renk Ayrıştırma (Stroop Etkisi)."
];

// Sub-component for scrollable row
const CategoryRow = ({ title, games, colorMap, icon }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playClick } = useGameSounds();

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-12 relative group/category">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
         {icon}
         {title}
      </h2>
      
      {/* Scroll Buttons */}
      <button 
        onClick={() => { playClick(); scrollLeft(); }}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 w-12 h-12 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover/category:opacity-100 transition-opacity disabled:opacity-0 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-md dark:shadow-xl"
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        onClick={() => { playClick(); scrollRight(); }}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 w-12 h-12 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover/category:opacity-100 transition-opacity disabled:opacity-0 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-md dark:shadow-xl"
      >
        <ChevronRight size={24} />
      </button>

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-6 snap-x flex-nowrap scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" 
      >
        {games.map((game: any) => (
          <motion.div
            key={game.id}
            whileHover={game.unlocked ? { scale: 1.05 } : {}}
            whileTap={game.unlocked ? { scale: 0.95 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="min-w-[280px] w-[280px] h-[200px] snap-center relative z-0 flex-shrink-0"
          >
            <Link 
              to={game.unlocked ? `/games/${game.id}` : '#'}
              onClick={(e) => {
                if (!game.unlocked) {
                  e.preventDefault();
                } else {
                  playClick();
                }
              }}
              className={`w-full h-full flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-md dark:shadow-none transition-all duration-300 relative group
              ${game.unlocked ? 'cursor-pointer hover:border-blue-300 dark:hover:border-slate-500 hover:z-10' : 'opacity-50 cursor-not-allowed'}
              ${game.unlocked ? colorMap[game.color] : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-white ${game.unlocked ? colorMap.iconColor[game.color] : 'text-gray-400 dark:text-gray-500'}`}>
                  {game.icon}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-100 transition-colors">{game.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{game.category}</p>
              </div>

              {game.unlocked && (
                 <div className="absolute top-6 right-6 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                   <div className="p-2 bg-blue-500/20 text-blue-400 rounded-full">
                      <Play size={16} fill="currentColor" />
                   </div>
                 </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { username, level, xp, xpToNextLevel, achievements, totalScore, isSoundEnabled, toggleSound } = useStore();
  const [statIndex, setStatIndex] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [hoveredAch, setHoveredAch] = useState<string | null>(null);
  const { playClick } = useGameSounds();

  useEffect(() => {
    const timer = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % STATS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const skills = [
    { name: 'Hafıza', value: 75, color: 'bg-emerald-500', avg: 65 },
    { name: 'Hız', value: 60, color: 'bg-blue-500', avg: 58 },
    { name: 'Dikkat', value: 85, color: 'bg-purple-500', avg: 72 },
    { name: 'Problem Çözme', value: 45, color: 'bg-orange-500', avg: 55 },
  ];

  const getAchIcon = (iconStr: string) => {
    switch(iconStr) {
      case 'zap': return <Zap size={24} />;
      case 'flame': return <Flame size={24} />;
      case 'brain': return <Brain size={24} />;
      default: return <Medal size={24} />;
    }
  };

  // --- GAMES MENU LOGIC ---
  const memoryGames = [
    { id: 'memory-matrix', name: 'Memory Matrix', category: 'Hafıza', unlocked: true, icon: <Grid />, color: 'emerald' },
    { id: 'digit-span', name: 'Sayı Hafızası', category: 'Hafıza', unlocked: true, icon: <Hash />, color: 'emerald' },
    { id: 'sequence-recall', name: 'Sıra Hafızası', category: 'Hafıza', unlocked: true, icon: <ListOrdered />, color: 'emerald' },
  ];
  const speedAttentionGames = [
    { id: 'speed-match', name: 'Speed Match', category: 'Hız', unlocked: true, icon: <Zap />, color: 'blue' },
    { id: 'direction-finder', name: 'Direction Finder', category: 'Dikkat', unlocked: true, icon: <Navigation />, color: 'blue' },
    { id: 'motion-direction', name: 'Esnek Yönelim', category: 'Dikkat', unlocked: true, icon: <MoveHorizontal />, color: 'blue' },
    { id: 'color-sort', name: 'Renk Ayrıştırma', category: 'Çoklu Görev', unlocked: true, icon: <Filter />, color: 'blue' },
    { id: 'odd-one-out', name: 'Farklı Olanı Bul', category: 'Gözlem', unlocked: true, icon: <Target />, color: 'blue' },
  ];
  const logicGames = [
    { id: 'math-clash', name: 'Math Clash', category: 'Problem Çözme', unlocked: true, icon: <Calculator />, color: 'orange' },
    { id: 'falling-math', name: 'Matematik Yağmuru', category: 'Problem Çözme', unlocked: true, icon: <CloudRain />, color: 'orange' },
    { id: 'shape-rotation', name: 'Şekil Döndürme', category: 'Uzamsal', unlocked: true, icon: <RefreshCw />, color: 'orange' },
  ];
  const flexGames = [
    { id: 'color-match', name: 'Color Match', category: 'Esneklik', unlocked: true, icon: <Palette />, color: 'purple' },
    { id: 'n-back', name: 'N-Back (1-Geri)', category: 'Esneklik', unlocked: true, icon: <RotateCcw />, color: 'purple' },
    { id: 'rule-switcher', name: 'Kural Değiştirici', category: 'Esneklik', unlocked: true, icon: <Shuffle />, color: 'purple' },
    { id: 'word-validator', name: 'Kelime Avı', category: 'Dil', unlocked: true, icon: <Type />, color: 'purple' },
  ];

  const shadowMap: any = {
    'emerald': 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    'blue': 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    'orange': 'hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    'purple': 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]'
  };
  const iconColorMap: any = {
    'emerald': 'text-emerald-400',
    'blue': 'text-blue-400',
    'orange': 'text-orange-400',
    'purple': 'text-purple-400'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden pb-20 relative transition-colors duration-300">
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
        showLogout={true} 
      />

      {/* Glassmorphism Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 p-4 px-6 sm:px-10 flex justify-between items-center shadow-lg transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Brain className="text-blue-500" size={28} />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight hidden sm:block">
            CogniCore
          </span>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-full px-4 py-2 transition-colors duration-300">
              <User size={18} className="text-slate-500 dark:text-slate-400" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">{username || 'Misafir'}</span>
           </div>
           
           <button 
             onClick={() => { playClick(); toggleSound(); }}
             className="p-3 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
             title="Sesi Aç / Kapat"
           >
             {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="text-red-400" />}
           </button>

           <button 
             onClick={() => { playClick(); setShowSettingsModal(true); }}
             className="p-3 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
             title="Ayarlar"
           >
             <Settings size={20} />
           </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-10 pt-10">
        
        <div className="flex items-center gap-4 mb-10">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-2 rounded-full flex items-center gap-2 shadow-sm dark:shadow-lg transition-colors duration-300">
             <Sparkles size={18} className="text-blue-500 dark:text-yellow-400" />
             <span className="font-bold text-slate-900 dark:text-white text-lg">{totalScore} <span className="text-slate-500 dark:text-slate-400 text-sm font-normal">Global Puan</span></span>
           </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[auto] md:auto-rows-[220px] mb-16">
          
          {/* Box 1: Large Welcome & Daily Workout */}
          <div className="md:col-span-2 md:row-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 dark:border-slate-800/60 shadow-md dark:shadow-2xl relative overflow-hidden group flex flex-col justify-between transition-colors duration-300">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/20 dark:group-hover:bg-blue-600/30 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="px-4 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Lvl {level}</span>
                </div>
                
                {/* XP Bar */}
                <div className="flex-1 min-w-[150px] bg-slate-100 dark:bg-slate-800 rounded-full h-3 border border-slate-200 dark:border-slate-700/50 overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full relative"
                    style={{ width: `${Math.min(100, (xp / xpToNextLevel) * 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{xp} / {xpToNextLevel} XP</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                Merhaba,<br/><span className="text-indigo-600 dark:text-blue-400">{username || 'Oyuncu'}</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm text-lg">
                Zihnini keskinleştirmek için bugünkü egzersizlerin hazır.
              </p>
            </div>

            <div className="mt-8 relative z-10">
              <Link to="/games/memory-matrix" onClick={playClick} className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-95">
                <Play fill="currentColor" size={20} />
                Günün Antrenmanı
              </Link>
            </div>
          </div>

          {/* Box 2: Intelligence Profile */}
          <div className="md:col-span-2 lg:col-span-1 md:row-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800/60 shadow-md dark:shadow-xl flex flex-col transition-colors duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="text-purple-500 dark:text-purple-400" />
              Zeka Profili
            </h3>
            <div className="flex-1 flex flex-col justify-between gap-3">
              {skills.map((skill) => (
                <div key={skill.name} className="flex flex-col gap-1">
                  <div className="flex justify-between items-end text-sm font-medium mb-1">
                    <span className="text-slate-700 dark:text-slate-300">{skill.name}</span>
                    <span className="text-slate-900 dark:text-white font-bold">{skill.value}%</span>
                  </div>
                  
                  {/* User Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1 relative">
                    <div 
                      className={`h-full ${skill.color} rounded-full relative overflow-hidden`}
                      style={{ width: `${skill.value}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                  
                  {/* Community Bar */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide">Topluluk Ort.</span>
                    <span className="text-[10px] text-slate-400 font-medium">{skill.avg}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-400 dark:bg-slate-500 rounded-full"
                      style={{ width: `${skill.avg}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 3: Target Insight */}
          <div className="lg:col-span-1 md:row-span-1 bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800/60 shadow-md dark:shadow-xl relative overflow-hidden flex flex-col justify-center group hover:border-blue-200 dark:hover:border-slate-700 transition-colors duration-300">
            <div className="absolute -bottom-6 -right-6 text-blue-500/10 dark:text-slate-800/50 transform group-hover:scale-110 transition-transform duration-500">
               <Target size={120} strokeWidth={1} />
            </div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider relative z-10">Hedef</h4>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1 relative z-10">Odaklanma</div>
            <p className="text-slate-600 dark:text-slate-400 text-sm z-10 relative z-10">
              Son 3 oyunda dikkatinizi %12 artırdınız.
            </p>
          </div>

          {/* Box 4: Achievements with Tooltip */}
          <div className="lg:col-span-1 md:row-span-1 bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800/60 shadow-md dark:shadow-xl flex flex-col justify-center relative transition-colors duration-300">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <Medal className="text-yellow-500" size={20}/>
               Başarımlar
            </h4>
            <div className="flex justify-between items-center px-2">
               {achievements.map(ach => (
                 <div 
                   key={ach.id} 
                   className="relative group cursor-pointer"
                   onMouseEnter={() => setHoveredAch(ach.id)}
                   onMouseLeave={() => setHoveredAch(null)}
                   onClick={() => { playClick(); setHoveredAch(hoveredAch === ach.id ? null : ach.id); }}
                 >
                   <div className={`p-3 rounded-full border-2 transition-all duration-300 
                     ${ach.isUnlocked 
                       ? 'bg-yellow-50 dark:bg-yellow-500/20 border-yellow-400 dark:border-yellow-500/50 text-yellow-500 dark:text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                       : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-gray-400 dark:text-slate-600'}`}
                   >
                     {getAchIcon(ach.icon)}
                   </div>

                   {/* Tooltip */}
                   <AnimatePresence>
                     {hoveredAch === ach.id && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10, scale: 0.9 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: 10, scale: 0.9 }}
                         className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-slate-700 dark:border-slate-600 z-50 pointer-events-none"
                       >
                         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 dark:bg-slate-800 border-b border-r border-slate-700 dark:border-slate-600 rotate-45"></div>
                         <div className="relative z-10 text-center">
                            <p className={`font-bold text-sm mb-1 ${ach.isUnlocked ? 'text-yellow-400' : 'text-white'}`}>{ach.title}</p>
                            <p className="text-xs text-slate-300 leading-relaxed">{ach.description}</p>
                            {!ach.isUnlocked && <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest"><Lock size={10} className="inline mr-1" />Kilitli</p>}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               ))}
            </div>
          </div>
          
          {/* Box 5: Community Stats Slider */}
          <div className="md:col-span-3 lg:col-span-4 bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800/60 shadow-md dark:shadow-xl overflow-hidden relative flex flex-col md:flex-row items-center gap-6 transition-colors duration-300">
             <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
               <BarChart2 size={32} className="text-blue-500 dark:text-yellow-400 mb-2" />
               <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center">Topluluk<br/>İstatistikleri</span>
               <span className="text-[10px] text-slate-500 mt-1">50K Analiz</span>
             </div>
             
             <div className="flex-1 w-full h-16 relative flex items-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                     key={statIndex}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.5, ease: "easeInOut" }}
                     className="text-lg md:text-xl text-slate-700 dark:text-slate-200 font-medium absolute w-full px-4 border-l-2 border-slate-300 dark:border-slate-700"
                  >
                    "{STATS[statIndex]}"
                  </motion.p>
                </AnimatePresence>
             </div>
          </div>

        </div>

        {/* --- GAMES MENU SECTION --- */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">Oyun Kütüphanesi</h2>
          
          <CategoryRow title="Hafıza" games={memoryGames} colorMap={{...shadowMap, iconColor: iconColorMap}} icon={<Brain className="text-emerald-500" />} />
          <CategoryRow title="Hız & Dikkat" games={speedAttentionGames} colorMap={{...shadowMap, iconColor: iconColorMap}} icon={<Zap className="text-blue-500" />} />
          <CategoryRow title="Esneklik & Dil" games={flexGames} colorMap={{...shadowMap, iconColor: iconColorMap}} icon={<Target className="text-purple-500" />} />
          <CategoryRow title="Mantık & Problem Çözme" games={logicGames} colorMap={{...shadowMap, iconColor: iconColorMap}} icon={<Calculator className="text-orange-500" />} />
          
        </div>

      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
