import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';
import { Square, Circle, Triangle, Star, Hexagon } from 'lucide-react';

type GameState = 'waiting' | 'playing' | 'gameOver';

const SYMBOLS = [
  { id: 'square', icon: Square, color: 'text-blue-500' },
  { id: 'circle', icon: Circle, color: 'text-red-500' },
  { id: 'triangle', icon: Triangle, color: 'text-green-500' },
  { id: 'star', icon: Star, color: 'text-yellow-500' },
  { id: 'hexagon', icon: Hexagon, color: 'text-purple-500' }
];

export default function SpeedMatch() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [previousSymbol, setPreviousSymbol] = useState<typeof SYMBOLS[0] | null>(null);
  const [currentSymbol, setCurrentSymbol] = useState<typeof SYMBOLS[0] | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

  const startGame = useCallback(() => {
    resetCombo();
    const firstSymbol = getRandomSymbol();
    setPreviousSymbol(firstSymbol);
    setCurrentSymbol(firstSymbol);
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo]);

  const handleChoice = useCallback((isSame: boolean) => {
    if (gameState !== 'playing' || !currentSymbol || !previousSymbol) return;

    const actualIsSame = currentSymbol.id === previousSymbol.id;
    
    if (isSame === actualIsSame) {
      // Correct
      addScore(50 + activeCombo * 10);
      incrementCombo();
      setFeedback('correct');
    } else {
      // Wrong
      resetCombo();
      setFeedback('wrong');
    }

    // Set next symbol
    setPreviousSymbol(currentSymbol);
    // Give 30% chance for the next symbol to be the same to balance gameplay
    if (Math.random() > 0.7) {
      setCurrentSymbol(currentSymbol);
    } else {
      let nextSymbol = getRandomSymbol();
      while (nextSymbol.id === currentSymbol.id) {
        nextSymbol = getRandomSymbol();
      }
      setCurrentSymbol(nextSymbol);
    }

    setTimeout(() => setFeedback(null), 300);
  }, [gameState, currentSymbol, previousSymbol, addScore, activeCombo, incrementCombo, resetCombo]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') {
        handleChoice(false); // Farklı
      } else if (e.key === 'ArrowRight') {
        handleChoice(true); // Aynı
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice]);

  const cardBgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
  const contrastClass = isHighContrast ? 'contrast-125' : '';

  return (
    <GameWrapper gameName="Speed Match" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {gameState === 'gameOver' ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
            <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold">
              Yeniden Oyna
            </button>
          </div>
        ) : gameState === 'waiting' ? (
          <div className="text-center">
             <div className={`p-8 rounded-2xl shadow-xl mb-6 ${cardBgClass} border-2`}>
               <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
               <p className="opacity-80 mb-2">Ekranda beliren şekil, <strong>bir önceki</strong> şekille aynı mı?</p>
               <p className="opacity-80 mb-6">Klavye ok tuşlarını (Sol/Sağ) veya butonları kullanabilirsiniz.</p>
               <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold text-lg w-full">
                 Oyuna Başla
               </button>
             </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
             <div className="h-8 mb-4 text-center font-bold text-lg">
                {feedback === 'correct' && <span className="text-green-500">Doğru!</span>}
                {feedback === 'wrong' && <span className="text-red-500">Yanlış!</span>}
             </div>
             
             <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-3xl flex items-center justify-center shadow-2xl border-4 transition-all duration-150 ${cardBgClass} ${contrastClass} ${feedback === 'correct' ? 'border-green-500 scale-105' : feedback === 'wrong' ? 'border-red-500 scale-95' : 'border-transparent'}`}>
                {currentSymbol && (
                  <currentSymbol.icon size={120} className={`${currentSymbol.color} ${isHighContrast ? 'opacity-100' : 'opacity-90'}`} strokeWidth={2.5} />
                )}
             </div>

             <div className="flex w-full gap-4 mt-12">
               <button 
                 onClick={() => handleChoice(false)} 
                 className="flex-1 py-5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition flex flex-col items-center shadow-lg active:scale-95"
               >
                 <span>FARKLI</span>
                 <span className="text-xs opacity-70 mt-1">(Sol Ok)</span>
               </button>
               <button 
                 onClick={() => handleChoice(true)} 
                 className="flex-1 py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xl transition flex flex-col items-center shadow-lg active:scale-95"
               >
                 <span>AYNI</span>
                 <span className="text-xs opacity-70 mt-1">(Sağ Ok)</span>
               </button>
             </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
