import { useState, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';
import { Smile, Frown, Sun, Moon, Star, Cloud, Heart, Flame, Zap, Droplet } from 'lucide-react';

type GameState = 'waiting' | 'playing' | 'gameOver';

const PAIRS = [
  { main: Smile, odd: Frown },
  { main: Sun, odd: Moon },
  { main: Star, odd: Zap },
  { main: Cloud, odd: Droplet },
  { main: Heart, odd: Flame },
];

export default function OddOneOut() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const [gridSize, setGridSize] = useState(3);
  const [pair, setPair] = useState(PAIRS[0]);
  const [oddIndex, setOddIndex] = useState(0);

  const generateLevel = useCallback(() => {
    const size = Math.min(3 + Math.floor(activeCombo / 4), 6); // Up to 6x6 grid
    setGridSize(size);
    
    setPair(PAIRS[Math.floor(Math.random() * PAIRS.length)]);
    setOddIndex(Math.floor(Math.random() * (size * size)));
  }, [activeCombo]);

  const startGame = useCallback(() => {
    resetCombo();
    generateLevel();
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo, generateLevel]);

  const handleChoice = useCallback((index: number) => {
    if (gameState !== 'playing') return;

    if (index === oddIndex) {
      addScore(50 + activeCombo * 10);
      incrementCombo();
      setFeedback('correct');
    } else {
      resetCombo();
      setFeedback('wrong');
    }

    generateLevel();
    setTimeout(() => setFeedback(null), 300);
  }, [gameState, oddIndex, addScore, activeCombo, incrementCombo, resetCombo, generateLevel]);

  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const iconColor = isHighContrast ? 'text-yellow-500' : 'text-blue-500 dark:text-blue-400';

  return (
    <GameWrapper gameName="Farklı Olanı Bul" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
         {gameState === 'gameOver' ? (
           <div className="text-center">
             <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
             <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Yeniden Oyna</button>
           </div>
        ) : gameState === 'waiting' ? (
           <div className={`p-8 rounded-2xl shadow-xl text-center border-2 ${cardBgClass} border-slate-200 dark:border-gray-700`}>
             <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
             <p className="opacity-80 mb-6">Grid içinde yer alan onlarca sembolden sadece <strong>1 TANESİ</strong> farklı. Onu bulup en hızlı şekilde tıklayın!</p>
             <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg w-full">Oyuna Başla</button>
           </div>
        ) : (
           <div className="w-full flex flex-col items-center">
              <div className="h-8 mb-4 text-center font-bold text-lg">
                 {feedback === 'correct' && <span className="text-green-500">Doğru!</span>}
                 {feedback === 'wrong' && <span className="text-red-500">Yanlış!</span>}
              </div>

              <div className={`flex items-center justify-center w-full p-4 rounded-3xl shadow-xl border-4 transition-all duration-150 ${cardBgClass} ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                 <div 
                   className="grid gap-2"
                   style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                 >
                   {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                     const Icon = i === oddIndex ? pair.odd : pair.main;
                     return (
                       <div 
                         key={i} 
                         onClick={() => handleChoice(i)}
                         className="flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-gray-900 cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-700 transition"
                       >
                         <Icon size={gridSize >= 5 ? 24 : 32} className={iconColor} strokeWidth={2.5}/>
                       </div>
                     );
                   })}
                 </div>
              </div>
           </div>
        )}
      </div>
    </GameWrapper>
  );
}
