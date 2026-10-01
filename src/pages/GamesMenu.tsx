import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, Zap, Palette, Calculator, Navigation, Hash, RotateCcw, Filter, Type, MoveHorizontal, CloudRain, RefreshCw, Target, Shuffle, ListOrdered, Brain, Play } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { useGameSounds } from '../hooks/useGameSounds';

export default function GamesMenu() {
  const { totalScore } = useStore();
  const navigate = useNavigate();
  const { playClick } = useGameSounds();

  // All 15 games + placeholders
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

  const renderCategory = (title: string, games: any[], colorMap: any, icon: any) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
         {icon}
         {title}
      </h2>
      <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {games.map((game) => (
          <motion.div
            key={game.id}
            whileHover={game.unlocked ? { scale: 1.05 } : {}}
            whileTap={game.unlocked ? { scale: 0.95 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="min-w-[280px] w-[280px] h-[200px] snap-center relative z-0"
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
              className={`w-full h-full flex flex-col justify-between p-6 rounded-3xl bg-slate-800/80 backdrop-blur-sm border border-slate-700 transition-all duration-300 relative group
              ${game.unlocked ? 'cursor-pointer hover:border-slate-500 hover:z-10' : 'opacity-50 cursor-not-allowed'}
              ${game.unlocked ? colorMap[game.color] : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl bg-slate-900/50 text-white ${game.unlocked ? colorMap.iconColor[game.color] : 'text-gray-500'}`}>
                  {game.icon}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-100 transition-colors">{game.name}</h3>
                <p className="text-sm text-slate-400">{game.category}</p>
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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 p-4 px-6 sm:px-10 flex justify-between items-center">
        <button onClick={() => { playClick(); navigate(-1); }} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
          <ArrowLeft size={20} />
          <span className="hidden sm:inline font-medium">Geri</span>
        </button>
        <h1 className="text-xl font-bold text-white">Oyun Menüsü</h1>
        <div className="text-sm font-bold bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          Skor: <span className="text-blue-400">{totalScore}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 sm:px-10 pt-10">
        
        {renderCategory("Hafıza", memoryGames, { ...shadowMap, iconColor: iconColorMap }, <Brain className="text-emerald-500" />)}
        {renderCategory("Hız & Dikkat", speedAttentionGames, { ...shadowMap, iconColor: iconColorMap }, <Zap className="text-blue-500" />)}
        {renderCategory("Esneklik & Dil", flexGames, { ...shadowMap, iconColor: iconColorMap }, <Target className="text-purple-500" />)}
        {renderCategory("Mantık & Problem Çözme", logicGames, { ...shadowMap, iconColor: iconColorMap }, <Calculator className="text-orange-500" />)}

      </main>
    </div>
  );
}
