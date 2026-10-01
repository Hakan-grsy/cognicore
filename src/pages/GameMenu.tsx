import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, Lock, Zap, Palette, Calculator, Navigation, Hash, RotateCcw, Filter, Type, MoveHorizontal, CloudRain, RefreshCw, Target, Shuffle, ListOrdered } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function GameMenu() {
  const { isDarkMode, totalScore } = useStore();
  const navigate = useNavigate();

  const games = [
    { id: 'memory-matrix', name: 'Memory Matrix', category: 'Hafıza', unlocked: true, icon: <Grid /> },
    { id: 'speed-match', name: 'Speed Match', category: 'Hız', unlocked: true, icon: <Zap /> },
    { id: 'color-match', name: 'Color Match', category: 'Esneklik', unlocked: true, icon: <Palette /> },
    { id: 'math-clash', name: 'Math Clash', category: 'Problem Çözme', unlocked: true, icon: <Calculator /> },
    { id: 'direction-finder', name: 'Direction Finder', category: 'Dikkat ve Yönelim', unlocked: true, icon: <Navigation /> },
    { id: 'digit-span', name: 'Sayı Hafızası', category: 'Hafıza', unlocked: true, icon: <Hash /> },
    { id: 'n-back', name: 'N-Back (1-Geri)', category: 'Esneklik', unlocked: true, icon: <RotateCcw /> },
    { id: 'color-sort', name: 'Renk Ayrıştırma', category: 'Çoklu Görev', unlocked: true, icon: <Filter /> },
    { id: 'word-validator', name: 'Kelime Avı', category: 'Dil', unlocked: true, icon: <Type /> },
    { id: 'motion-direction', name: 'Esnek Yönelim', category: 'Dikkat', unlocked: true, icon: <MoveHorizontal /> },
    { id: 'falling-math', name: 'Matematik Yağmuru', category: 'Problem Çözme', unlocked: true, icon: <CloudRain /> },
    { id: 'shape-rotation', name: 'Şekil Döndürme', category: 'Uzamsal', unlocked: true, icon: <RefreshCw /> },
    { id: 'odd-one-out', name: 'Farklı Olanı Bul', category: 'Gözlem', unlocked: true, icon: <Target /> },
    { id: 'rule-switcher', name: 'Kural Değiştirici', category: 'Esneklik', unlocked: true, icon: <Shuffle /> },
    { id: 'sequence-recall', name: 'Sıra Hafızası', category: 'Hafıza', unlocked: true, icon: <ListOrdered /> },
    // 30 games placeholder
  ];

  const bgClass = isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-screen p-6 ${bgClass} transition-colors`}>
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-700 hover:text-white transition-colors" title="Ana Sayfa">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Oyun Menüsü</h1>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70">Toplam Skor</div>
          <div className="text-2xl font-bold text-blue-500">{totalScore}</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <p className="mb-6 opacity-80">Gelecekte eklenecek 30 oyun için tasarlanmış ölçeklenebilir menü altyapısı.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link 
              key={game.id} 
              to={game.unlocked ? `/games/${game.id}` : '#'}
              className={`flex flex-col p-6 rounded-xl border-2 transition-all ${cardClass} ${game.unlocked ? 'hover:border-blue-500 hover:shadow-lg cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
              onClick={(e) => {
                if (!game.unlocked) {
                  e.preventDefault();
                  alert('Bu oyun henüz açık değil. Skor kazanarak kilidini açabilirsiniz!');
                }
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${game.unlocked ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-slate-200 text-gray-500 dark:bg-gray-700'}`}>
                  {game.icon}
                </div>
                {!game.unlocked && <Lock size={20} className="text-gray-400" />}
              </div>
              <h3 className="text-xl font-bold mb-1">{game.name}</h3>
              <span className="text-sm opacity-70">{game.category}</span>
            </Link>
          ))}
          
          {/* Placeholder for remaining games */}
          {Array.from({ length: 15 }).map((_, idx) => (
             <div key={`placeholder-${idx}`} className={`flex flex-col p-6 rounded-xl border-2 border-dashed opacity-40 ${cardClass}`}>
               <div className="flex items-center justify-between mb-4">
                 <div className="p-3 rounded-lg bg-slate-200 dark:bg-gray-700 text-gray-500"><Lock size={24} /></div>
               </div>
               <h3 className="text-xl font-bold mb-1">Oyun {idx + 16}</h3>
               <span className="text-sm">Yakında...</span>
             </div>
          ))}
        </div>
      </main>
    </div>
  );
}
