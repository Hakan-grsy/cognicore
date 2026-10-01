import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';

type GameState = 'waiting' | 'playing' | 'gameOver';

export default function NBack() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const [previousPos, setPreviousPos] = useState<number | null>(null);
  const [currentPos, setCurrentPos] = useState<number | null>(null);
  const [isFirstTurn, setIsFirstTurn] = useState(true);

  const generateLevel = useCallback((prev: number | null) => {
    // 30% chance to be the same as previous (if prev exists)
    let nextPos;
    if (prev !== null && Math.random() < 0.3) {
      nextPos = prev;
    } else {
      nextPos = Math.floor(Math.random() * 9);
      if (prev !== null && nextPos === prev) {
        nextPos = (nextPos + 1) % 9; // force different
      }
    }
    
    setPreviousPos(prev);
    setCurrentPos(nextPos);
  }, []);

  const startGame = useCallback(() => {
    resetCombo();
    setIsFirstTurn(true);
    setPreviousPos(null);
    generateLevel(null);
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo, generateLevel]);

  const handleChoice = useCallback((isSame: boolean) => {
    if (gameState !== 'playing' || isFirstTurn) return;

    const actualIsSame = currentPos === previousPos;
    
    if (isSame === actualIsSame) {
      addScore(70 + activeCombo * 10);
      incrementCombo();
      setFeedback('correct');
    } else {
      resetCombo();
      setFeedback('wrong');
    }

    setIsFirstTurn(false);
    generateLevel(currentPos);
    setTimeout(() => setFeedback(null), 300);
  }, [gameState, isFirstTurn, currentPos, previousPos, addScore, activeCombo, incrementCombo, resetCombo, generateLevel]);

  // Use Space or auto-next for the very first turn since there is no previous to compare
  const handleFirstTurnNext = useCallback(() => {
    if (!isFirstTurn) return;
    setIsFirstTurn(false);
    generateLevel(currentPos);
  }, [isFirstTurn, currentPos, generateLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (isFirstTurn && (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === ' ')) {
        handleFirstTurnNext();
      } else if (!isFirstTurn) {
        if (e.key === 'ArrowLeft') handleChoice(false);
        else if (e.key === 'ArrowRight') handleChoice(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isFirstTurn, handleChoice, handleFirstTurnNext]);

  const cardBgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
  const cellBgClass = isDarkMode ? 'bg-gray-700' : 'bg-slate-100';
  const activeColor = isHighContrast ? 'bg-yellow-400' : 'bg-blue-500';

  return (
    <GameWrapper gameName="N-Back (1-Geri)" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {gameState === 'gameOver' ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
            <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Yeniden Oyna</button>
          </div>
        ) : gameState === 'waiting' ? (
          <div className={`p-8 rounded-2xl shadow-xl text-center ${cardBgClass} border-2`}>
             <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
             <p className="opacity-80 mb-2">Izgarada yanan karenin konumu, <strong>BİR ÖNCEKİ</strong> yanan kare ile aynı mı?</p>
             <p className="opacity-80 mb-6 text-sm text-yellow-600 dark:text-yellow-400">Not: İlk kare yandığında sadece hafızaya alın ve "Başla/İleri" diyerek devam edin.</p>
             <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-lg w-full">Oyuna Başla</button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
             <div className="h-8 mb-4 text-center font-bold text-lg">
                {feedback === 'correct' && <span className="text-green-500">Doğru!</span>}
                {feedback === 'wrong' && <span className="text-red-500">Yanlış!</span>}
             </div>
             
             <div className={`p-4 rounded-3xl shadow-xl border-4 transition-all duration-150 ${cardBgClass} ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-transparent'}`}>
                <div className="grid grid-cols-3 grid-rows-3 gap-3 w-64 h-64 sm:w-80 sm:h-80">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xl transition-all duration-200 ${i === currentPos ? `${activeColor} scale-105 shadow-lg` : cellBgClass}`} 
                    />
                  ))}
                </div>
             </div>

             <div className="flex w-full gap-4 mt-8">
               {isFirstTurn ? (
                 <button onClick={handleFirstTurnNext} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl shadow-lg">
                   Bunu Hafızaya Aldım (İleri)
                 </button>
               ) : (
                 <>
                   <button onClick={() => handleChoice(false)} className="flex-1 py-5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl shadow-lg">
                     <span>FARKLI</span><br/><span className="text-xs opacity-70">(Sol Ok)</span>
                   </button>
                   <button onClick={() => handleChoice(true)} className="flex-1 py-5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl shadow-lg">
                     <span>AYNI</span><br/><span className="text-xs opacity-70">(Sağ Ok)</span>
                   </button>
                 </>
               )}
             </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
